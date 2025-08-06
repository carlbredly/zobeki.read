// Dashboard JavaScript
class Dashboard {
    constructor() {
        this.posts = [];
        this.currentPostId = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        // Vérifier si l'utilisateur est déjà connecté
        this.checkAuthStatus();
        
        if (!this.isAuthenticated) {
            this.setupAuthListeners();
            return;
        }
        
        // Si connecté, initialiser le dashboard
        this.showDashboard();
        await this.loadPosts();
        this.setupEventListeners();
        this.displayPosts();
        this.updateStats();
    }

    checkAuthStatus() {
        // Vérifier si l'utilisateur est connecté via localStorage
        const authToken = localStorage.getItem('dashboardAuth');
        if (authToken === 'authenticated') {
            this.isAuthenticated = true;
        }
    }

    setupAuthListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    // Fonction pour hasher le mot de passe
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Hasher le mot de passe saisi
        const hashedPassword = await this.hashPassword(password);
        
        // Hash du mot de passe correct (admin123)
        const correctHash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

        // Identifiants par défaut
        if (username === 'admin' && hashedPassword === correctHash) {
            this.isAuthenticated = true;
            localStorage.setItem('dashboardAuth', 'authenticated');
            this.showDashboard();
            this.initDashboard();
            this.showNotification('Connexion réussie !', 'success');
        } else {
            this.showNotification('Identifiants incorrects !', 'error');
        }
    }

    showDashboard() {
        // Cacher le modal d'authentification
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.style.display = 'none';
        }

        // Afficher le dashboard
        const dashboardWrapper = document.getElementById('dashboard-wrapper');
        if (dashboardWrapper) {
            dashboardWrapper.style.display = 'block';
        }
    }

    async initDashboard() {
        await this.loadPosts();
        this.setupEventListeners();
        this.displayPosts();
        this.updateStats();
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('dashboardAuth');
        
        // Cacher le dashboard
        const dashboardWrapper = document.getElementById('dashboard-wrapper');
        if (dashboardWrapper) {
            dashboardWrapper.style.display = 'none';
        }

        // Afficher le modal d'authentification
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.style.display = 'flex';
        }

        // Réinitialiser le formulaire de connexion
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.reset();
        }

        this.showNotification('Déconnexion réussie !', 'success');
    }

    async loadPosts() {
        try {
            const response = await fetch('/api/posts');
            const data = await response.json();
            this.posts = data.posts || [];
            console.log('Posts chargés depuis le serveur:', this.posts.length);
        } catch (error) {
            console.error('Erreur lors du chargement des posts:', error);
            this.posts = [];
        }
    }

    async savePosts() {
        // Cette fonction n'est plus nécessaire car les sauvegardes se font directement via l'API
        console.log('Sauvegarde gérée par le serveur');
    }

    // Ces fonctions ne sont plus nécessaires avec le serveur Node.js

    setupEventListeners() {
        // Navigation du menu admin
        const adminLinks = document.querySelectorAll('.admin-menu a');
        adminLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                this.showSection(sectionId);
            });
        });

        // Formulaire d'ajout de post
        const addPostForm = document.getElementById('add-post-form');
        if (addPostForm) {
            addPostForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addPost();
            });
        }

        // Formulaire d'édition de post
        const editPostForm = document.getElementById('edit-post-form');
        if (editPostForm) {
            editPostForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updatePost();
            });
        }

        // Bouton de déconnexion
        const logoutBtn = document.getElementById('logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Modal d'édition
        const modal = document.getElementById('edit-modal');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('cancel-edit');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    showSection(sectionId) {
        // Cacher toutes les sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Afficher la section sélectionnée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Mettre à jour le menu actif
        const adminLinks = document.querySelectorAll('.admin-menu a');
        adminLinks.forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    async addPost() {
        const form = document.getElementById('add-post-form');
        const formData = new FormData(form);

        // Gérer l'image URL - si vide ou null, ne pas définir d'imageUrl
        const imageUrl = formData.get('imageUrl');
        const finalImageUrl = imageUrl && imageUrl.trim() !== '' ? imageUrl : null;

        const postData = {
            title: formData.get('title'),
            category: formData.get('category'),
            content: formData.get('content'),
            excerpt: formData.get('excerpt') || formData.get('content').substring(0, 150) + '...',
            imageUrl: finalImageUrl,
            popular: formData.get('popular') === 'true'
        };

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                const result = await response.json();
                await this.loadPosts(); // Recharger les posts depuis le serveur
                this.displayPosts();
                this.updateStats();
                form.reset();
                this.showNotification('Post ajouté avec succès !', 'success');
            } else {
                const error = await response.json();
                this.showNotification(`Erreur: ${error.error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout du post:', error);
            this.showNotification('Erreur lors de l\'ajout du post', 'error');
        }
    }

    editPost(id) {
        const post = this.posts.find(p => p.id === id);
        if (!post) return;

        this.currentPostId = id;

        // Remplir le formulaire d'édition
        document.getElementById('edit-title').value = post.title;
        document.getElementById('edit-category').value = post.category;
        document.getElementById('edit-imageUrl').value = post.imageUrl || '';
        document.getElementById('edit-content').value = post.content;
        document.getElementById('edit-excerpt').value = post.excerpt || '';
        document.getElementById('edit-popular').value = post.popular.toString();

        // Afficher le modal
        document.getElementById('edit-modal').style.display = 'block';
    }

    async updatePost() {
        if (!this.currentPostId) return;

        const form = document.getElementById('edit-post-form');
        const formData = new FormData(form);

        // Gérer l'image URL - si vide ou null, ne pas définir d'imageUrl
        const imageUrl = formData.get('imageUrl');
        const finalImageUrl = imageUrl && imageUrl.trim() !== '' ? imageUrl : null;

        const postData = {
            title: formData.get('title'),
            category: formData.get('category'),
            imageUrl: finalImageUrl,
            content: formData.get('content'),
            excerpt: formData.get('excerpt') || '',
            popular: formData.get('popular') === 'true'
        };

        try {
            const response = await fetch(`/api/posts/${this.currentPostId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                const result = await response.json();
                await this.loadPosts(); // Recharger les posts depuis le serveur
                this.displayPosts();
                this.updateStats();
                this.closeModal();
                this.showNotification('Post modifié avec succès !', 'success');
            } else {
                const error = await response.json();
                this.showNotification(`Erreur: ${error.error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la modification du post:', error);
            this.showNotification('Erreur lors de la modification du post', 'error');
        }
    }

    async deletePost(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
            try {
                const response = await fetch(`/api/posts/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    const result = await response.json();
                    await this.loadPosts(); // Recharger les posts depuis le serveur
                    this.displayPosts();
                    this.updateStats();
                    this.showNotification('Post supprimé avec succès !', 'success');
                } else {
                    const error = await response.json();
                    this.showNotification(`Erreur: ${error.error}`, 'error');
                }
            } catch (error) {
                console.error('Erreur lors de la suppression du post:', error);
                this.showNotification('Erreur lors de la suppression du post', 'error');
            }
        }
    }

    displayPosts() {
        const postsGrid = document.getElementById('posts-grid');
        if (!postsGrid) return;

        postsGrid.innerHTML = '';

        this.posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <div class="post-image">
                    <img src="${post.imageUrl || 'src/IMG_2581.png'}" alt="${post.title}">
                </div>
                <div class="post-info">
                    <span class="post-category">${post.category}</span>
                    <h3>${post.title}</h3>
                    <div class="post-date">${this.formatDate(post.date)}</div>
                    <div class="post-views">${post.views} vue${post.views > 1 ? 's' : ''}</div>
                    <div class="post-actions">
                        <button class="edit" onclick="dashboard.editPost(${post.id})">Modifier</button>
                        <button class="delete" onclick="dashboard.deletePost(${post.id})">Supprimer</button>
                    </div>
                </div>
            `;
            postsGrid.appendChild(postCard);
        });
    }

    updateStats() {
        const totalPosts = this.posts.length;
        const popularPosts = this.posts.filter(post => post.popular).length;
        const totalViews = this.posts.reduce((sum, post) => sum + (post.views || 0), 0);
        const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

        document.getElementById('total-posts').textContent = totalPosts;
        document.getElementById('popular-posts').textContent = popularPosts;
        document.getElementById('total-views').textContent = totalViews;
        document.getElementById('avg-views').textContent = avgViews;
    }

    getNextId() {
        return this.posts.length > 0 ? Math.max(...this.posts.map(p => p.id)) + 1 : 1;
    }

    closeModal() {
        document.getElementById('edit-modal').style.display = 'none';
        this.currentPostId = null;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    }

    showNotification(message, type = 'info') {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            background: ${type === 'success' ? 'linear-gradient(276.63deg, #28a745 6.19%, #20c997 84.38%)' : 
                         type === 'error' ? 'linear-gradient(276.63deg, #dc3545 6.19%, #c82333 84.38%)' : 
                         'linear-gradient(276.63deg, #00D7DD 6.19%, #0095CB 84.38%)'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialiser le dashboard
const dashboard = new Dashboard(); 