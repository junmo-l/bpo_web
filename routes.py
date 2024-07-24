from flask import Blueprint, render_template, url_for, request, redirect, session, jsonify, flash, current_app
from flask_jwt_extended import create_access_token
from flask_mail import Mail
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, logout_user, current_user
from functools import wraps
from datetime import datetime, timedelta
import smtplib, requests, re
from email.mime.text import MIMEText
# from flask_socketio import SocketIO, emit
from models import db, User, Authority, Dashboard, UserDashboardAccess, Passwordrequests, Usernamerequests

routes = Blueprint('routes', __name__)
mail = Mail()
login_manager = None

def init_login_manager(lm):
    global login_manager
    login_manager = lm
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

@routes.record
def record(state):
    app = state.app
    mail.init_app(app)
    routes.app = app

# 사용자 권한과 대시보드 접근 권한을 가져오는 함수
def get_user_permissions(user):
    user_authorities = Authority.query.filter_by(user_id=user.id).all()
    permissions = [authority.authority_name for authority in user_authorities]
    return permissions

def get_user_dashboard_names(user):
    user_dashboard_access = UserDashboardAccess.query.filter_by(user_id=user.id).all()
    dashboard_names = [Dashboard.query.get(access.dashboard_id).dashboard_name for access in user_dashboard_access]
    return dashboard_names

def get_user_dashboard_ids(user):
    if user is None:
        return []
    user_dashboard_access = UserDashboardAccess.query.filter_by(user_id=user.id).all()
    dashboard_ids = [access.dashboard_id for access in user_dashboard_access]
    return dashboard_ids

# 비밀번호 해싱 함수
def hash_password(password):
    return generate_password_hash(password, method='pbkdf2:sha256')

def get_user_login_attempts(user):
    return user.login_attempts

def send_email(subject, from_email, to_emails, text_body):
    msg = MIMEText(text_body)
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = ', '.join(to_emails)

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login('kyeongjun.lee@kwinternational.com', 'wzge aend smth rpmb')
            smtp.send_message(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}", e)
        return False
    
def send_email_with_mailjet(subject, from_email, to_emails, text_body):
    api_key = 'd096acb42974123d1c97d63a259abf48'
    api_secret = 'f4f900f7f35375b3c271d9c852e237d1'
    url = 'https://api.mailjet.com/v3.1/send'
    data = {
        'Messages': [
            {
                'From': {
                    'Email': from_email,
                    'Name': 'KWI BPO Web Support'
                },
                'To': [
                    {
                        'Email': email,
                        'Name': 'Support Team'
                    } for email in to_emails
                ],
                'Subject': subject,
                'TextPart': text_body
            }
        ]
    }
    response = requests.post(url, auth=(api_key, api_secret), json=data)
    if response.status_code == 200:
        return True, None
    else:
        return False, f"Error sending email with Mailjet: {response.status_code}, {response.text}"

# 마스터 권한 확인 데코레이터
def master_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('routes.login'))
        permissions = get_user_permissions(current_user)
        if 'master' not in permissions:
            flash('Access denied. Master permission required.', 'error')
            logout_user()
            return redirect(url_for('routes.index'))
        return f(*args, **kwargs)
    return decorated_function

# 로그인된 사용자가 로그인 페이지와 인덱스 페이지에 접근할 수 없도록 설정
@routes.before_request
def restrict_authenticated_users():
    if current_user.is_authenticated:
        # 세션 타임아웃 확인
        now = datetime.now()
        if 'last_activity' in session:
            last_activity = session['last_activity']
            # 시간대 정보를 제거하여 naive datetime으로 변환
            last_activity = last_activity.replace(tzinfo=None)
            if (now - last_activity) > timedelta(minutes=10):
                logout_user()
                flash('Your session has expired due to inactivity.', 'info')
                return redirect(url_for('routes.login'))
        session['last_activity'] = now  # 활동 시간 업데이트

        if request.endpoint in ['routes.login', 'routes.index']:
            return redirect(url_for('routes.welcome'))

# 세션 만료 확인
@routes.before_request
def make_session_permanent():
    session.permanent = True
    session.modified = True

# 라우트 정의
# main
@routes.route('/', methods=['GET'])
def index():
    return render_template('home/index.html')

# about
@routes.route('/about', methods=['GET'])
def about():
    return render_template('company/about.html')

# login
@routes.route('/login', methods=['GET', 'POST'])
def login():
    user = None
    last_attempt_time = datetime.now().isoformat()  # ISO 형식으로 변환
    remaining_time_seconds = 0  # 초 단위로 초기화

    # 이미 인증된 사용자라면 환영 페이지로 리디렉션
    if current_user.is_authenticated:
        return redirect(url_for('routes.welcome'))

    # POST 요청 처리
    if request.method == 'POST':
        username = request.form['username']  # 사용자 이름 가져오기
        password = request.form['password']  # 비밀번호 가져오기

        user = User.query.filter_by(username=username).first()  # 사용자 데이터베이스에서 사용자 검색
        
        if user:
            last_attempt_time = user.last_attempt_time  # 마지막 시도 시간 가져오기
            last_attempt_time = last_attempt_time if isinstance(last_attempt_time, datetime) else datetime.fromisoformat(last_attempt_time)
            time_since_last_attempt = datetime.now() - (last_attempt_time if last_attempt_time else datetime.now() - timedelta(minutes=15))
            
            # 남은 시간 계산
            if user.login_attempts >= 5 and time_since_last_attempt < timedelta(minutes=15):
                remaining_time = timedelta(minutes=15) - time_since_last_attempt
                remaining_time_seconds = int(remaining_time.total_seconds())  # 초 단위로 변환

                # 남은 시간이 있을 경우 플래시 메시지 추가
                if remaining_time_seconds > 0:
                    if remaining_time_seconds > 60:
                        minutes = remaining_time_seconds // 60
                        seconds = remaining_time_seconds % 60
                        flash(f'No attempts remaining. Please try again after {minutes} minutes and {seconds} seconds.', 'error')
                    else:
                        flash(f'No attempts remaining. Please try again after {remaining_time_seconds} seconds.', 'error')
                    return render_template('auth/login.html', remaining_time=remaining_time_seconds, last_attempt_time=last_attempt_time)

            elif time_since_last_attempt >= timedelta(minutes=15):
                # 15분이 지나면 로그인 시도 횟수를 초기화
                user.login_attempts = 0
                user.last_attempt_time = datetime.now()
                db.session.commit()

            # 비밀번호 확인
            if check_password_hash(user.password, password):
                user.login_attempts = 0  # 로그인 성공 시 시도 횟수 초기화
                user.stay_signed_in = True
                user.last_attempt_time = datetime.now()
                db.session.commit()
                
                login_user(user)
                access_token = create_access_token(identity=username)
                session['user_id'] = user.id
                session['access_token'] = access_token
                session.pop('error_count', None)
                return redirect(url_for('routes.welcome'))
            else:
                # 비밀번호가 틀린 경우
                user.login_attempts += 1
                user.stay_signed_in = False
                user.last_attempt_time = datetime.now()
                db.session.commit()
        else:
            flash('The ID or password you entered is incorrect.', 'error')
            return redirect(url_for('routes.login'))

        # 로그인 시도 횟수에 따른 오류 메시지 표시
        if user.login_attempts >= 5:
            # 남은 시간이 있을 때 리다이렉트
            if remaining_time_seconds > 0:
                return redirect(url_for('routes.login'))  # 남은 시간이 있을 때 리다이렉트
        else:
            flash(f'The ID or password you entered is incorrect. Attempts remaining: {5 - user.login_attempts}', 'error')

        return redirect(url_for('routes.login'))

    return render_template('auth/login.html', remaining_time=remaining_time_seconds, last_attempt_time=last_attempt_time)

# forgot_password        
@routes.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        firstname = data.get('first_name')
        lastname = data.get('last_name')
        email = data.get('email')
        confirmemail = data.get('confirmemail')
        department = data.get('department')

        user = get_user_by_name(firstname, lastname)
        if user:
            if not email:
                return jsonify({'success': False, 'error': 'Please enter an email address.'}), 400
            elif email != confirmemail:
                return jsonify({'success': False, 'error': 'Please check and confirm your email.'}), 400
            elif not isinstance(email, str) or not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                return jsonify({'success': False, 'error': 'Please enter a valid email address (e.g., name@example.com).'}), 400

            user = save_forogotpass_to_db(username, firstname, lastname, email, department)

            smtp_server = "in-v3.mailjet.com"
            smtp_port = 587
            smtp_use_tls = "optional"

            sender_email = "kyeongjun.lee@kwinternational.com"
            recipient_email = "bpocsr@kwinternational.com"

            text_body = f"""
            Hello Support Team,

            A user has requested to recover their account information. Here are the details:

            User Name: {username}
            First Name: {firstname}
            Last Name: {lastname}
            Email: {email}
            Department: {department if department else 'N/A'}

            Please take the necessary actions to assist the user.

            Best regards,
            KW International Support System
            """
            
            if send_email_with_mailjet('Account Recovery Request', sender_email, [recipient_email], text_body):
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'error': 'Failed to send email. Please try again later.'}), 400
        else:
            return jsonify({'success': False, 'error': 'User information not found.'}), 400

    return render_template('auth/forgot_password.html')        

# forgot_username        
@routes.route('/forgot_username', methods=['GET', 'POST'])
def forgot_username():
    if request.method == 'POST':
        data = request.get_json()
        firstname = data.get('first_name')
        lastname = data.get('last_name')
        email = data.get('email')
        confirmemail = data.get('confirmemail')
        department = data.get('department')

        user = get_user_by_name(firstname, lastname)
        if user:
            if not email:
                return jsonify({'success': False, 'error': 'Please enter an email address.'}), 400
            elif email != confirmemail:
                return jsonify({'success': False, 'error': 'Please check and confirm your email.'}), 400
            elif not isinstance(email, str) or not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                return jsonify({'success': False, 'error': 'Please enter a valid email address (e.g., name@example.com).'}), 400

            user = save_forgotuser_to_db(firstname, lastname, email, department)

            smtp_server = "in-v3.mailjet.com"
            smtp_port = 587
            smtp_use_tls = "optional"

            sender_email = "kyeongjun.lee@kwinternational.com"
            recipient_email = "bpocsr@kwinternational.com"

            text_body = f"First Name: {firstname}\nLast Name: {lastname}\nEmail: {email}\nDepartment: {department}"

            if send_email_with_mailjet('Test API', sender_email, [recipient_email], text_body):
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'error': 'Failed to send email. Please try again later.'}), 400
        else:
            return jsonify({'success': False, 'error': 'User information not found.'}), 400

    return render_template('auth/forgot_username.html')

def save_forogotpass_to_db(username,firstname, lastname, email, department):
    user = User.query.filter_by(username = username, first_name=firstname, last_name=lastname).first()
    if user:
        request = Passwordrequests(username=username, first_name=firstname, last_name=lastname, email=email, department=department)
        db.session.add(request)
        db.session.commit()
        return request
    else:
        return None
    
def save_forgotuser_to_db(firstname, lastname, email, department):
    user = User.query.filter_by(first_name=firstname, last_name=lastname).first()
    if user:
        request = Usernamerequests(first_name=firstname, last_name=lastname, email=email, department=department)
        db.session.add(request)
        db.session.commit()
        return request
    else:
        return None

def get_user_by_name(firstname, lastname):
    user = User.query.filter_by(first_name=firstname, last_name=lastname).first()
    return user

@routes.route('/request_success', methods=['GET', 'POST'])
def request_success():
    return render_template('auth/request_success.html')

@routes.route('/tryagain')
def try_again():
    return render_template('auth/tryagain.html')

@routes.route('/recall')
def recall():
    return render_template('dashboard/recall.html')


# userlist
@routes.route('/userlist', methods=['GET', 'POST'])
@login_required
@master_required
def userlist():
    if request.method == 'GET':
        if 'user_id' in session:
            session_user = User.query.get(session['user_id'])
            dashboard_ids = get_user_dashboard_ids(session_user)
            permissions = get_user_permissions(session_user)
        else:
            session_user = None
            dashboard_ids = []
            permissions = []
            
        users = User.query.all()
        user_list = []
        for user in users:
            user_data = {
                'id': user.id,
                'username': user.username,
                'password': user.password,
                'stay_signed_in': user.stay_signed_in,
                'login_attempts': user.login_attempts,
                'last_attempt_time': user.last_attempt_time,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'department_name': user.department_name,
                'location': user.location,
                'ringcentral_skill': user.ringcentral_skill,
                'authorities': get_user_authorities(user),
                'dashboard_names': get_user_dashboard_names(user)
            }
            user_list.append(user_data)

        return render_template('management/userlist.html', session_user=session_user, users=user_list, dashboard_ids=dashboard_ids, permissions=permissions)
    elif request.method == 'POST':
        return jsonify(user_list)

def get_user_authorities(user):
    authorities = Authority.query.filter_by(user_id=user.id).all()
    return ', '.join([authority.authority_name for authority in authorities])

# user info
@routes.route('/users', methods=['GET', 'POST'])
@login_required
@master_required
def users():
    selected_username = request.args.get('username', None)

    if request.method == 'GET':
        if 'user_id' in session:
            session_user = User.query.get(session['user_id'])
        else:
            session_user = None

        if session_user:
            session_user_dashboard_ids = get_user_dashboard_ids(session_user)
            session_user_permissions = get_user_permissions(session_user)
            session_user_dashboard_names = get_user_dashboard_names(session_user)
        else:
            session_user_dashboard_ids = []
            session_user_permissions = []
            session_user_dashboard_names = []
            
        if selected_username:
            selected_user = User.query.filter_by(username=selected_username).first()
        else:
            selected_user = session_user

        if selected_user:
            selected_dashboard_ids = get_user_dashboard_ids(selected_user)
            selected_permissions = get_user_permissions(selected_user)
            selected_user_dashboard_names = get_user_dashboard_names(selected_user)
        else:
            selected_dashboard_ids = []
            selected_permissions = []
            selected_user_dashboard_names = []

        users = User.query.all()
        user_list = [
            {
                'id': user.id,
                'username': user.username,
                'password': user.password,
                'stay_signed_in': user.stay_signed_in,
                'login_attempts': user.login_attempts,
                'last_attempt_time': user.last_attempt_time,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'department_name': user.department_name,
                'location': user.location,
                'ringcentral_skill': user.ringcentral_skill,
                'authorities': get_user_authorities(user),
                'dashboard_names': get_user_dashboard_names(user)
            } for user in users
        ]

        session_user_data = {
            'id': session_user.id,
            'username': session_user.username,
            'first_name': session_user.first_name,
            'last_name': session_user.last_name,
            'department_name': session_user.department_name,
            'location': session_user.location,
            'ringcentral_skill': session_user.ringcentral_skill
        } if session_user else None

        return render_template(
            'management/users.html',
            session_user=session_user_data,
            dashboard_ids=session_user_dashboard_ids,
            session_user_dashboard_names=session_user_dashboard_names,
            permissions=session_user_permissions,
            selected_user=selected_user,
            selected_dashboard_ids=selected_dashboard_ids,
            selected_user_dashboard_names=selected_user_dashboard_names,
            users=user_list,
            selected_permissions=selected_permissions
        )
    elif request.method == 'POST':
        return jsonify(user_list)

# CRUD
# user create
@routes.route('/create', methods=['POST'])
@login_required
@master_required
def create_user():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        department_name = data.get('department_name')
        location = data.get('location')
        authority_name = data.get('authority')
        dashboards = data.get('dashboards')

        hashed_password = hash_password(password)

        new_user = User(
            username=username,
            password=hashed_password,
            stay_signed_in=False,
            login_attempts=0,
            last_attempt_time=datetime.now(),
            first_name=first_name,
            last_name=last_name,
            department_name=department_name,
            location=location,
            ringcentral_skill=None
        )
        db.session.add(new_user)
        db.session.commit()

        new_authority = Authority(user_id=new_user.id, authority_name=authority_name)
        db.session.add(new_authority)

        for dashboard_name in dashboards:
            dashboard = Dashboard.query.filter_by(dashboard_name=dashboard_name).first()
            if dashboard:
                new_access = UserDashboardAccess(user_id=new_user.id, dashboard_id=dashboard.id, dashboard_name=dashboard_name)
                db.session.add(new_access)

        db.session.commit()
        
        new_user_info = {
            'username': new_user.username,
            'first_name': new_user.first_name,
            'last_name': new_user.last_name,
            'department_name': new_user.department_name,
            'location': new_user.location,
            'authority': authority_name,
            'dashboards': dashboards
        }
        
        return jsonify({'status': 'success', 'message': 'User created successfully', 'user_info': new_user_info})
    
    except Exception as e:
        routes.app.logger.error(f"Error creating user: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

# 유저정보 체크
@routes.route('/check_username', methods=['GET'])
def check_username():
    username = request.args.get('username')
    if not username:
        return jsonify({"exists": False}), 400

    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({"exists": True})
    else:
        return jsonify({"exists": False})

# user update
@routes.route('/update_user', methods=['POST'])
@login_required
@master_required
def update_user():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        department_name = data.get('department_name')
        location = data.get('location')
        authority_name = data.get('authority')
        dashboards = data.get('dashboards')
        last_access = data.get('last_access')
        password = data.get('password')

        user = User.query.get(user_id)
        
        if user:
            user.first_name = first_name
            user.last_name = last_name
            user.department_name = department_name
            user.location = location

            if password:
                user.password = generate_password_hash(password, method='pbkdf2:sha256')
            if last_access:
                user.last_attempt_time = last_access

            Authority.query.filter_by(user_id=user_id).delete()
            new_authority = Authority(user_id=user_id, authority_name=authority_name)
            db.session.add(new_authority)

            UserDashboardAccess.query.filter_by(user_id=user_id).delete()

            for dashboard_name in dashboards:
                dashboard = Dashboard.query.filter_by(dashboard_name=dashboard_name).first()
                if dashboard:
                    new_access = UserDashboardAccess(user_id=user_id, dashboard_id=dashboard.id, dashboard_name=dashboard_name)
                    db.session.add(new_access)

            db.session.commit()
            return jsonify({'status': 'success', 'message': 'User updated successfully'})
        else:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
    except Exception as e:
        routes.app.logger.error(f"Error updating user: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
    
# user delete
@routes.route('/delete_users', methods=['POST'])
@login_required
@master_required
def delete_users():
    user_ids = request.json.get('user_ids')
    if not user_ids:
        return jsonify({'status': 'error', 'message': 'No user IDs provided'}), 400

    for user_id in user_ids:
        user = User.query.get(user_id)
        if user:
            Authority.query.filter_by(user_id=user_id).delete()
            UserDashboardAccess.query.filter_by(user_id=user_id).delete()
            db.session.delete(user)
        else:
            return jsonify({'status': 'error', 'message': f'User with ID {user_id} not found'}), 404

    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Selected users have been deleted'})

# dashboards 목록 가져오기
@routes.route('/get_all_dashboards', methods=['GET'])
def get_all_dashboards():
    dashboards = Dashboard.query.all()
    dashboard_names = [dashboard.dashboard_name for dashboard in dashboards]
    return jsonify(dashboard_names)

# Search
@routes.route('/search', methods=['GET'])
def search():
    search_query = request.args.get('query', '')
    if search_query:
        users = User.query.filter(User.username.ilike(f'%{search_query}%')).all()
    else:
        users = User.query.all()

    user_list = []
    for user in users:
        user_data = {
            'id': user.id,
            'username': user.username,
        }
        user_list.append(user_data)

    return jsonify({'users': user_list})

# logout
@routes.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    session.clear()
    
    response = redirect(url_for('routes.index'))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

# welcome
@routes.route('/welcome')
@login_required
def welcome():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        permissions = get_user_permissions(user)
        dashboard_ids = get_user_dashboard_ids(user)
        return render_template('home/welcome.html', username=user.username, permissions=permissions, dashboard_ids=dashboard_ids)
    return redirect(url_for('routes.login'))

# dashboard
@routes.route('/allWhTrend', methods=['GET'])
@login_required
def allWhTrend():
    if 'user_id' in session:
        session_user = User.query.get(session['user_id'])
        permissions = get_user_permissions(session_user)
        dashboard_ids = get_user_dashboard_ids(session_user)
        return render_template('dashboard/allWhTrend.html', session_user=session_user, permissions=permissions, dashboard_ids=dashboard_ids)
    else:
        return redirect(url_for('routes.login'))
    
@routes.route('/arap', methods=['GET'])
@login_required
def arap():
    if 'user_id' in session:
        session_user = User.query.get(session['user_id'])
        permissions = get_user_permissions(session_user)
        dashboard_ids = get_user_dashboard_ids(session_user)
        return render_template('dashboard/arap.html', session_user=session_user, permissions=permissions, dashboard_ids=dashboard_ids)
    else:
        return redirect(url_for('routes.login'))
    
@routes.route('/cuchen', methods=['GET'])
@login_required
def cuchen():
    if 'user_id' in session:
        session_user = User.query.get(session['user_id'])
        permissions = get_user_permissions(session_user)
        dashboard_ids = get_user_dashboard_ids(session_user)
        return render_template('dashboard/cuchen.html', session_user=session_user, permissions=permissions, dashboard_ids=dashboard_ids)
    else:
        return redirect(url_for('routes.login'))
    
@routes.route('/gpcaLogisticsTrendITBO', methods=['GET'])
@login_required
def gpcaLogisticsTrendITBO():
    if 'user_id' in session:
        session_user = User.query.get(session['user_id'])
        permissions = get_user_permissions(session_user)
        dashboard_ids = get_user_dashboard_ids(session_user)
        return render_template('dashboard/gpcaLogisticsTrendITBO.html', session_user=session_user, permissions=permissions, dashboard_ids=dashboard_ids)
    else:
        return redirect(url_for('routes.login'))
    
@routes.route('/gpcaLogisticsTrend', methods=['GET'])
@login_required
def gpcaLogisticsTrend():
    if 'user_id' in session:
        session_user = User.query.get(session['user_id'])
        permissions = get_user_permissions(session_user)
        dashboard_ids = get_user_dashboard_ids(session_user)
        return render_template('dashboard/gpcaLogisticsTrend.html', session_user=session_user, permissions=permissions, dashboard_ids=dashboard_ids)
    else:
        return redirect(url_for('routes.login'))
    
@routes.route('/pendingTickets', methods=['GET'])
@login_required
def pendingTickets():
    if 'user_id' in session:
        session_user = User.query.get(session['user_id'])
        permissions = get_user_permissions(session_user)
        dashboard_ids = get_user_dashboard_ids(session_user)
        return render_template('dashboard/pendingTickets.html', session_user=session_user, permissions=permissions, dashboard_ids=dashboard_ids)
    else:
        return redirect(url_for('routes.login'))
    
@routes.route('/sto', methods=['GET'])
@login_required
def sto():
    if 'user_id' in session:
        session_user = User.query.get(session['user_id'])
        permissions = get_user_permissions(session_user)
        dashboard_ids = get_user_dashboard_ids(session_user)
        return render_template('dashboard/sto.html', session_user=session_user, permissions=permissions, dashboard_ids=dashboard_ids)
    else:
        return redirect(url_for('routes.login'))

@routes.route('/create_master_user', methods=['POST'])
@login_required
@master_required
def create_master_user():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        department_name = data.get('department_name')
        location = data.get('location')
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(
            username=username,
            password=hashed_password,
            stay_signed_in=False,
            login_attempts=0,
            last_attempt_time=datetime.now(),
            first_name=first_name,
            last_name=last_name,
            department_name=department_name,
            location=location,
            ringcentral_skill=None
        )
        db.session.add(new_user)
        db.session.commit()
        new_authority = Authority(user_id=new_user.id, authority_name='master')
        db.session.add(new_authority)
        db.session.commit()
        new_user_info = {
            'username': new_user.username,
            'first_name': new_user.first_name,
            'last_name': new_user.last_name,
            'department_name': new_user.department_name,
            'location': new_user.location,
            'authority': 'master'
        }
        return jsonify({'status': 'success', 'message': 'Master user created successfully', 'user_info': new_user_info})
    except Exception as e:
        routes.app.logger.error(f"Error creating master user: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@routes.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response