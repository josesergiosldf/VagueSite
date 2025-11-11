// Global state
let suggestions = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('suggestionForm')) {
        initializeDashboard();
    }
    
    // URL source detector
    const modUrlInput = document.getElementById('mod_url');
    if (modUrlInput) {
        modUrlInput.addEventListener('input', function() {
            detectModSource(this.value);
        });
    }
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
});

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Alt + N = Nova sugestão
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            const btn = document.querySelector('.btn-primary[onclick*="openSuggestionModal"]');
            if (btn) openSuggestionModal();
        }
        
        // ESC = Fechar modal
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                if (activeModal.id === 'suggestionModal') {
                    closeSuggestionModal();
                } else if (activeModal.id === 'rejectionModal') {
                    closeRejectionModal();
                } else if (activeModal.id === 'resetPasswordModal') {
                    closeResetPasswordModal();
                }
            }
        }
        
        // Alt + 1/2/3 = Filtros
        if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
            e.preventDefault();
            const filters = ['all', 'pending', 'approved', 'rejected'];
            const filterIndex = parseInt(e.key) - 1;
            if (filterIndex < filters.length) {
                currentFilter = filters[filterIndex];
                renderSuggestions();
                document.querySelectorAll('.filter-btn').forEach((btn, idx) => {
                    btn.classList.toggle('active', idx === filterIndex);
                });
            }
        }
    });
}

// Dashboard initialization
function initializeDashboard() {
    loadSuggestions();
    setupFilters();
    setupForms();
    setupCharCounter();
}

// Setup character counter for description
function setupCharCounter() {
    const description = document.getElementById('description');
    const charCount = document.getElementById('charCount');
    
    if (description && charCount) {
        description.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = `${count}/500`;
            
            // Change color when approaching limit
            if (count > 450) {
                charCount.style.color = 'var(--danger)';
            } else if (count > 400) {
                charCount.style.color = 'var(--warning)';
            } else {
                charCount.style.color = 'var(--text-secondary)';
            }
        });
    }
}

// Load suggestions from API
async function loadSuggestions() {
    // Show loading skeletons
    showLoadingSkeletons();
    
    try {
        const response = await fetch('/api/suggestions');
        suggestions = await response.json();
        renderSuggestions();
        updateStats();
    } catch (error) {
        console.error('Error loading suggestions:', error);
        showNotification('Falha ao carregar sugestões', 'error');
    }
}

// Show loading skeletons
function showLoadingSkeletons() {
    const containers = ['pending-cards', 'approved-cards', 'rejected-cards'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        `;
    });
}

// Render suggestions on the board
function renderSuggestions() {
    const pendingContainer = document.getElementById('pending-cards');
    const approvedContainer = document.getElementById('approved-cards');
    const rejectedContainer = document.getElementById('rejected-cards');
    
    // Clear containers
    pendingContainer.innerHTML = '';
    approvedContainer.innerHTML = '';
    rejectedContainer.innerHTML = '';
    
    // Filter suggestions
    let filteredSuggestions = suggestions;
    if (currentFilter !== 'all') {
        filteredSuggestions = suggestions.filter(s => s.status === currentFilter);
    }
    
    // Render cards
    filteredSuggestions.forEach(suggestion => {
        const card = createModCard(suggestion);
        
        if (suggestion.status === 'pending') {
            pendingContainer.appendChild(card);
        } else if (suggestion.status === 'approved') {
            approvedContainer.appendChild(card);
        } else if (suggestion.status === 'rejected') {
            rejectedContainer.appendChild(card);
        }
    });
    
    // Show empty states
    if (pendingContainer.children.length === 0) {
        pendingContainer.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Nenhum mod pendente</p></div>';
    }
    if (approvedContainer.children.length === 0) {
        approvedContainer.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>Nenhum mod aprovado</p></div>';
    }
    if (rejectedContainer.children.length === 0) {
        rejectedContainer.innerHTML = '<div class="empty-state"><i class="fas fa-times-circle"></i><p>Nenhum mod rejeitado</p></div>';
    }
    
    // Update column counts
    updateColumnCounts();
}

// Create mod card element
function createModCard(suggestion) {
    const card = document.createElement('div');
    card.className = 'mod-card';
    card.dataset.id = suggestion.id;
    
    const sourceIcon = suggestion.source === 'curseforge' ? '🔥' : 
                      suggestion.source === 'modrinth' ? '🟢' : '📦';
    
    card.innerHTML = `
        <div class="mod-card-header">
            <div>
                <div class="mod-card-title">${escapeHtml(suggestion.mod_name)}</div>
                <span class="mod-source ${suggestion.source}">${sourceIcon} ${suggestion.source}</span>
            </div>
        </div>
        <div class="mod-card-body">
            <a href="${escapeHtml(suggestion.mod_url)}" target="_blank" class="mod-url">
                <i class="fas fa-external-link-alt"></i> Ver Página do Mod
            </a>
            ${suggestion.description ? `<div class="mod-description">${escapeHtml(suggestion.description)}</div>` : ''}
            ${suggestion.rejection_reason ? `
                <div class="rejection-reason">
                    <strong>Motivo da Rejeição:</strong>
                    ${escapeHtml(suggestion.rejection_reason)}
                </div>
            ` : ''}
            <div class="mod-meta">
                <span class="mod-meta-item">
                    <i class="fas fa-user"></i> ${escapeHtml(suggestion.author)}
                </span>
                <span class="mod-meta-item">
                    <i class="fas fa-calendar"></i> ${suggestion.submitted_date}
                </span>
            </div>
        </div>
        ${isAdmin && suggestion.status === 'pending' ? `
            <div class="mod-actions">
                <button class="btn btn-success btn-sm" onclick="approveMod(${suggestion.id})">
                    <i class="fas fa-check"></i> Aprovar
                </button>
                <button class="btn btn-danger btn-sm" onclick="openRejectionModal(${suggestion.id})">
                    <i class="fas fa-times"></i> Rejeitar
                </button>
            </div>
        ` : ''}
        ${isAdmin ? `
            <div class="mod-actions" style="margin-top: 0.5rem;">
                <button class="btn btn-secondary btn-sm" onclick="deleteMod(${suggestion.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        ` : ''}
    `;
    
    return card;
}

// Update statistics
function updateStats() {
    const pending = suggestions.filter(s => s.status === 'pending').length;
    const approved = suggestions.filter(s => s.status === 'approved').length;
    const rejected = suggestions.filter(s => s.status === 'rejected').length;
    
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('approved-count').textContent = approved;
    document.getElementById('rejected-count').textContent = rejected;
}

// Update column counts
function updateColumnCounts() {
    const columns = document.querySelectorAll('.board-column');
    columns.forEach(column => {
        const status = column.dataset.status;
        const count = suggestions.filter(s => s.status === status).length;
        column.querySelector('.count').textContent = count;
    });
}

// Setup filters
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderSuggestions();
        });
    });
}

// Setup forms
function setupForms() {
    // Suggestion form
    const suggestionForm = document.getElementById('suggestionForm');
    if (suggestionForm) {
        suggestionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitSuggestion();
        });
    }
    
    // Rejection form
    const rejectionForm = document.getElementById('rejectionForm');
    if (rejectionForm) {
        rejectionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitRejection();
        });
    }
}

// Detect mod source from URL
function detectModSource(url) {
    const indicator = document.getElementById('sourceIndicator');
    if (!indicator) return;
    
    if (url.toLowerCase().includes('curseforge.com')) {
        indicator.textContent = '🔥 Detectado: CurseForge';
        indicator.className = 'source-indicator curseforge';
    } else if (url.toLowerCase().includes('modrinth.com')) {
        indicator.textContent = '🟢 Detectado: Modrinth';
        indicator.className = 'source-indicator modrinth';
    } else if (url) {
        indicator.textContent = '📦 Detectado: Outra Fonte';
        indicator.className = 'source-indicator other';
    } else {
        indicator.textContent = '';
        indicator.className = 'source-indicator';
    }
}

// Submit suggestion
async function submitSuggestion() {
    const form = document.getElementById('suggestionForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    
    const formData = new FormData(form);
    
    const data = {
        mod_name: formData.get('mod_name'),
        mod_url: formData.get('mod_url'),
        description: formData.get('description')
    };
    
    try {
        const response = await fetch('/suggest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification('Sugestão de mod enviada com sucesso!', 'success');
            closeSuggestionModal();
            form.reset();
            loadSuggestions();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Falha ao enviar sugestão', 'error');
        }
    } catch (error) {
        console.error('Error submitting suggestion:', error);
        showNotification('Falha ao enviar sugestão', 'error');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// Approve mod
async function approveMod(id) {
    if (!confirm('Tem certeza que deseja aprovar este mod?')) return;
    
    try {
        const response = await fetch(`/admin/approve/${id}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            showNotification('Mod aprovado com sucesso!', 'success');
            loadSuggestions();
        } else {
            showNotification('Falha ao aprovar mod', 'error');
        }
    } catch (error) {
        console.error('Error approving mod:', error);
        showNotification('Falha ao aprovar mod', 'error');
    }
}

// Open rejection modal
function openRejectionModal(id) {
    document.getElementById('reject_mod_id').value = id;
    document.getElementById('rejectionModal').classList.add('active');
}

// Close rejection modal
function closeRejectionModal() {
    document.getElementById('rejectionModal').classList.remove('active');
    document.getElementById('rejectionForm').reset();
}

// Submit rejection
async function submitRejection() {
    const id = document.getElementById('reject_mod_id').value;
    const reason = document.getElementById('rejection_reason').value;
    
    try {
        const response = await fetch(`/admin/reject/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });
        
        if (response.ok) {
            showNotification('Mod rejeitado com sucesso!', 'success');
            closeRejectionModal();
            loadSuggestions();
        } else {
            showNotification('Falha ao rejeitar mod', 'error');
        }
    } catch (error) {
        console.error('Error rejecting mod:', error);
        showNotification('Falha ao rejeitar mod', 'error');
    }
}

// Delete mod
async function deleteMod(id) {
    if (!confirm('Tem certeza que deseja excluir esta sugestão de mod? Esta ação não pode ser desfeita.')) return;
    
    try {
        const response = await fetch(`/admin/delete/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Mod excluído com sucesso!', 'success');
            loadSuggestions();
        } else {
            showNotification('Falha ao excluir mod', 'error');
        }
    } catch (error) {
        console.error('Error deleting mod:', error);
        showNotification('Falha ao excluir mod', 'error');
    }
}

// Modal controls
function openSuggestionModal() {
    document.getElementById('suggestionModal').classList.add('active');
}

function closeSuggestionModal() {
    const form = document.getElementById('suggestionForm');
    const modal = document.getElementById('suggestionModal');
    
    // Check if form has data
    const modName = document.getElementById('mod_name').value;
    const modUrl = document.getElementById('mod_url').value;
    const description = document.getElementById('description').value;
    
    if (modName || modUrl || description) {
        if (!confirm('Tem certeza que deseja fechar? Os dados preenchidos serão perdidos.')) {
            return;
        }
    }
    
    modal.classList.remove('active');
    form.reset();
    document.getElementById('sourceIndicator').textContent = '';
    const charCount = document.getElementById('charCount');
    if (charCount) {
        charCount.textContent = '0/500';
        charCount.style.color = 'var(--text-secondary)';
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '10000';
    notification.style.minWidth = '300px';
    notification.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
