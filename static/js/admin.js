// Admin Panel JavaScript

// Toggle Admin Status
function toggleAdminStatus(userId) {
    if (confirm('Tem certeza que deseja alterar o status de administrador deste usuário?')) {
        fetch(`/admin/users/toggle-admin/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showToast(data.message, 'success');
                setTimeout(() => location.reload(), 1000);
            } else if (data.error) {
                showToast(data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Erro ao se conectar ao servidor', 'error');
        });
    }
}

// Delete User
function deleteUser(userId, username) {
    if (confirm(`Tem certeza que deseja excluir o usuário "${username}"?\n\nEsta ação não pode ser desfeita!`)) {
        fetch(`/admin/users/delete/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showToast(data.message, 'success');
                const row = document.querySelector(`tr[data-user-id="${userId}"]`);
                if (row) {
                    row.style.opacity = '0';
                    setTimeout(() => row.remove(), 300);
                }
                setTimeout(() => location.reload(), 1000);
            } else if (data.error) {
                showToast(data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Erro ao se conectar ao servidor', 'error');
        });
    }
}

// Open Reset Password Modal
function openResetPasswordModal(userId, username) {
    const modal = document.getElementById('resetPasswordModal');
    document.getElementById('reset_user_id').value = userId;
    document.getElementById('reset_username').textContent = username;
    document.getElementById('new_password').value = '';
    modal.classList.add('active');
}

// Close Reset Password Modal
function closeResetPasswordModal() {
    const modal = document.getElementById('resetPasswordModal');
    modal.classList.remove('active');
}

// Submit Password Reset
document.getElementById('resetPasswordForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('reset_user_id').value;
    const newPassword = document.getElementById('new_password').value;
    
    if (newPassword.length < 3) {
        showToast('A senha deve ter pelo menos 3 caracteres', 'error');
        return;
    }
    
    fetch(`/admin/users/reset-password/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            showToast(data.message, 'success');
            closeResetPasswordModal();
        } else if (data.error) {
            showToast(data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Erro ao se conectar ao servidor', 'error');
    });
});

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Toast Notification
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        color: '#fff',
        fontWeight: '600',
        fontSize: '0.9rem',
        boxShadow: 'var(--shadow-lg)',
        zIndex: '9999',
        animation: 'slideInUp 0.3s ease',
        maxWidth: '400px'
    });
    
    // Set background color based on type
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        info: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
    };
    toast.style.background = colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('resetPasswordModal');
    if (event.target === modal) {
        closeResetPasswordModal();
    }
});

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideOutDown {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }
    
    .users-table tbody tr {
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);
