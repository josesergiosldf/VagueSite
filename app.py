from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import re
import requests

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///modpack.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    suggestions = db.relationship('ModSuggestion', backref='author', lazy=True)

class ModSuggestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mod_name = db.Column(db.String(200), nullable=False)
    mod_url = db.Column(db.String(500), nullable=False)
    source = db.Column(db.String(50))  # 'curseforge', 'modrinth', or 'other'
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected'
    rejection_reason = db.Column(db.Text)
    submitted_date = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Helper function to detect mod source
def detect_mod_source(url):
    """Detect if URL is from CurseForge or Modrinth"""
    if 'curseforge.com' in url.lower():
        return 'curseforge'
    elif 'modrinth.com' in url.lower():
        return 'modrinth'
    else:
        return 'other'

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        suggestions = ModSuggestion.query.order_by(ModSuggestion.submitted_date.desc()).all()
        return render_template('index.html', suggestions=suggestions)
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('index'))
        else:
            flash('Usuário ou senha inválidos', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if User.query.filter_by(username=username).first():
            flash('Nome de usuário já existe', 'error')
            return redirect(url_for('register'))
        
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        flash('Cadastro realizado com sucesso! Faça login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/admin/panel')
@login_required
def admin_panel():
    if not current_user.is_admin:
        flash('Acesso negado', 'error')
        return redirect(url_for('index'))
    
    users = User.query.order_by(User.id.desc()).all()
    return render_template('admin_panel.html', users=users)

@app.route('/suggest', methods=['POST'])
@login_required
def suggest_mod():
    data = request.json
    mod_name = data.get('mod_name')
    mod_url = data.get('mod_url')
    description = data.get('description', '')
    
    if not mod_name or not mod_url:
        return jsonify({'error': 'Nome e URL do mod são obrigatórios'}), 400
    
    source = detect_mod_source(mod_url)
    
    suggestion = ModSuggestion(
        mod_name=mod_name,
        mod_url=mod_url,
        source=source,
        description=description,
        user_id=current_user.id
    )
    
    db.session.add(suggestion)
    db.session.commit()
    
    return jsonify({
        'message': 'Sugestão de mod enviada com sucesso',
        'suggestion': {
            'id': suggestion.id,
            'mod_name': suggestion.mod_name,
            'source': suggestion.source,
            'status': suggestion.status
        }
    })

@app.route('/admin/approve/<int:suggestion_id>', methods=['POST'])
@login_required
def approve_mod(suggestion_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Não autorizado'}), 403
    
    suggestion = ModSuggestion.query.get_or_404(suggestion_id)
    suggestion.status = 'approved'
    suggestion.rejection_reason = None
    db.session.commit()
    
    return jsonify({'message': 'Mod aprovado com sucesso'})

@app.route('/admin/reject/<int:suggestion_id>', methods=['POST'])
@login_required
def reject_mod(suggestion_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    reason = data.get('reason', 'No reason provided')
    
    suggestion = ModSuggestion.query.get_or_404(suggestion_id)
    suggestion.status = 'rejected'
    suggestion.rejection_reason = reason
    db.session.commit()
    
    return jsonify({'message': 'Mod rejected successfully'})

@app.route('/admin/delete/<int:suggestion_id>', methods=['DELETE'])
@login_required
def delete_mod(suggestion_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Não autorizado'}), 403
    
    suggestion = ModSuggestion.query.get_or_404(suggestion_id)
    db.session.delete(suggestion)
    db.session.commit()
    
    return jsonify({'message': 'Mod excluído com sucesso'})

@app.route('/admin/users/delete/<int:user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Não autorizado'}), 403
    
    if user_id == current_user.id:
        return jsonify({'error': 'Você não pode excluir sua própria conta'}), 400
    
    user = User.query.get_or_404(user_id)
    
    # Delete user's suggestions first
    ModSuggestion.query.filter_by(user_id=user_id).delete()
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'Usuário excluído com sucesso'})

@app.route('/admin/users/toggle-admin/<int:user_id>', methods=['POST'])
@login_required
def toggle_admin(user_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Não autorizado'}), 403
    
    if user_id == current_user.id:
        return jsonify({'error': 'Você não pode alterar seu próprio status de admin'}), 400
    
    user = User.query.get_or_404(user_id)
    user.is_admin = not user.is_admin
    db.session.commit()
    
    status = 'admin' if user.is_admin else 'usuário'
    return jsonify({'message': f'Usuário alterado para {status}', 'is_admin': user.is_admin})

@app.route('/admin/users/reset-password/<int:user_id>', methods=['POST'])
@login_required
def reset_password(user_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Não autorizado'}), 403
    
    data = request.json
    new_password = data.get('password')
    
    if not new_password or len(new_password) < 3:
        return jsonify({'error': 'Senha deve ter pelo menos 3 caracteres'}), 400
    
    user = User.query.get_or_404(user_id)
    user.password = generate_password_hash(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Senha redefinida com sucesso'})

@app.route('/api/suggestions')
@login_required
def get_suggestions():
    suggestions = ModSuggestion.query.order_by(ModSuggestion.submitted_date.desc()).all()
    return jsonify([{
        'id': s.id,
        'mod_name': s.mod_name,
        'mod_url': s.mod_url,
        'source': s.source,
        'description': s.description,
        'status': s.status,
        'rejection_reason': s.rejection_reason,
        'submitted_date': s.submitted_date.strftime('%Y-%m-%d %H:%M'),
        'author': s.author.username
    } for s in suggestions])

def init_db():
    """Initialize the database and create admin user"""
    with app.app_context():
        db.create_all()
        
        # Create admin user if doesn't exist
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                password=generate_password_hash('admin123'),
                is_admin=True
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created: username='admin', password='admin123'")

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
