from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    password = db.Column(db.VARCHAR(128), nullable=False)
    username = db.Column(db.VARCHAR(80), unique=True, nullable=False)
    stay_signed_in = db.Column(db.Boolean, nullable=False)
    login_attempts = db.Column(db.Integer, nullable=False)
    last_attempt_time = db.Column(db.DateTime, nullable=False)
    first_name = db.Column(db.VARCHAR(50), nullable=False)
    last_name = db.Column(db.VARCHAR(50), nullable=False)
    department_name = db.Column(db.VARCHAR(50), nullable=True)
    location = db.Column(db.VARCHAR(50), nullable=True)
    ringcentral_skill = db.Column(db.VARCHAR(50), nullable=True)
    authorities = db.relationship('Authority', backref='user', lazy=True)
    dashboard_access = db.relationship('UserDashboardAccess', backref='user', lazy=True)

    def __repr__(self):
        fields = {column.name: getattr(self, column.name) for column in self.__table__.columns}
        return f'<User {fields}>'

class Authority(db.Model):
    __tablename__ = 'authority'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    authority_name = db.Column(db.VARCHAR(80), nullable=False)

    def __repr__(self):
        fields = {column.name: getattr(self, column.name) for column in self.__table__.columns}
        return f'<Authority {fields}>'

class Dashboard(db.Model):
    __tablename__ = 'dashboard'
    id = db.Column(db.Integer, primary_key=True)
    dashboard_name = db.Column(db.VARCHAR(80), unique=True, nullable=False)
    access = db.relationship('UserDashboardAccess', backref='dashboard', lazy=True)

    def __repr__(self):
        fields = {column.name: getattr(self, column.name) for column in self.__table__.columns}
        return f'<Dashboard {fields}>'

class UserDashboardAccess(db.Model):
    __tablename__ = 'user_dashboard_access'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    dashboard_id = db.Column(db.Integer, db.ForeignKey('dashboard.id'), nullable=False)
    dashboard_name = db.Column(db.VARCHAR(80), nullable=False)

    def __repr__(self):
        fields = {column.name: getattr(self, column.name) for column in self.__table__.columns}
        return f'<UserDashboardAccess {fields}>'

class Passwordrequests(db.Model):
    __tablename__ = 'password_requests'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(255), nullable=False)
    last_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    department = db.Column(db.String(255))
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    
class Usernamerequests(db.Model):
    __tablename__ = 'username_requests'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(255), nullable=False)
    last_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    department = db.Column(db.String(255))
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())