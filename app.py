from flask import Flask
from models import db
from routes import routes as routes_blueprint, init_login_manager
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
from flask_session import Session
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import pymysql
# from flask_socketio import SocketIO, emit
# 처음 실행할 때 마스터 유저 생성
from models import User, Authority, Dashboard, UserDashboardAccess

def create_app():
    app = Flask(__name__)
    app.secret_key = 'aP9swM8lG8#q!zW4lM2k@eR1'
    db_name = 'login'
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://root:1234@127.0.0.1/{db_name}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'jTk9#rVz2@x!wQ5tB7c@uE4p'  # JWT 비밀 키 설정

    # 세션 구성
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=10)  # 세션 타임아웃 시간 설정

    # MySQL에 접속하여 데이터베이스가 없으면 생성
    connection = pymysql.connect(host='127.0.0.1',
                                 user='root',
                                 password='1234')
    cursor = connection.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
    cursor.close()
    connection.close()

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'routes.login'

    jwt = JWTManager(app)  # JWTManager 초기화

    # init_login_manager 함수로 login_manager를 routes에 전달
    init_login_manager(login_manager)
    
    app.register_blueprint(routes_blueprint)

    with app.app_context():
        # 테이블 생성 및 초기화 순서 지정
        db.metadata.create_all(bind=db.engine, tables=[
            db.Model.metadata.tables['user'],
            db.Model.metadata.tables['dashboard'],
            db.Model.metadata.tables['authority'],
            db.Model.metadata.tables['user_dashboard_access'],
            db.Model.metadata.tables['password_requests'],
            db.Model.metadata.tables['username_requests'],
        ])

        # 마스터 유저 생성
        master_user = User.query.filter_by(username='master.user').first()
        if not master_user:
            hashed_password = generate_password_hash('1234', method='pbkdf2:sha256')
            master_user = User(
                username='master.user',
                password=hashed_password,
                stay_signed_in=False,
                login_attempts=0,
                last_attempt_time=datetime.now(),
                first_name='Master',
                last_name='User',
                department_name='BPO',
                location='TX',
                ringcentral_skill=None
            )
            
            db.session.add(master_user)
            db.session.commit()
            master_authority = Authority(user_id=master_user.id, authority_name='master')
            db.session.add(master_authority)
            db.session.commit()

            # 대시보드 초기 데이터 생성
            dashboard_data = [
                {'id': 1, 'dashboard_name': 'All WH Trend'},
                {'id': 2, 'dashboard_name': 'ARAP'},
                {'id': 3, 'dashboard_name': 'Cuchen'},
                {'id': 4, 'dashboard_name': 'GPCA Logistics Trend(IT, BO)'},
                {'id': 5, 'dashboard_name': 'GPCA Logistics Trend'},
                {'id': 6, 'dashboard_name': 'Pending Tickets'},
                {'id': 7, 'dashboard_name': 'STO'},
                {'id': 8, 'dashboard_name': 'Recall'}
            ]
            
            for data in dashboard_data:
                dashboard = Dashboard(id=data['id'], dashboard_name=data['dashboard_name'])
                db.session.add(dashboard)
            db.session.commit()

            # 마스터 유저에게 모든 대시보드 접근 권한 부여
            for data in dashboard_data:
                access = UserDashboardAccess(
                    user_id=master_user.id,
                    dashboard_id=data['id'],
                    dashboard_name=data['dashboard_name']
                )
                db.session.add(access)
            db.session.commit()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)