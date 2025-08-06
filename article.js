// Article Page JavaScript
class ArticleManager {
    constructor() {
        this.posts = [];
        this.currentArticle = null;
        this.defaultImage = 'src/IMG_2581.png';
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.loadArticle();
        this.generateRelatedPosts();
    }

    async loadPosts() {
        try {
            const response = await fetch('/api/posts');
            const data = await response.json();
            this.posts = data.posts || [];
            console.log('Posts chargés depuis le serveur (article.js):', this.posts.length);
        } catch (error) {
            console.error('Erreur lors du chargement des posts:', error);
            this.posts = [];
        }
    }

    loadArticle() {
        // Récupérer l'ID de l'article depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = parseInt(urlParams.get('id'));

        if (!articleId) {
            this.showError('Aucun article spécifié');
            return;
        }

        // Trouver l'article correspondant
        this.currentArticle = this.posts.find(post => post.id === articleId);

        if (!this.currentArticle) {
            this.showError('Article non trouvé');
            return;
        }

        // Incrémenter le compteur de vues
        this.incrementViews(articleId);
        
        this.displayArticle();
    }

    async incrementViews(articleId) {
        try {
            const response = await fetch(`/api/posts/${articleId}/views`, {
                method: 'PUT'
            });

            if (response.ok) {
                const result = await response.json();
                this.updateViewsDisplay(result.views);
                console.log(`Vues incrémentées pour l'article ${articleId}: ${result.views}`);
            } else {
                console.error('Erreur lors de l\'incrémentation des vues');
            }
        } catch (error) {
            console.error('Erreur lors de l\'incrémentation des vues:', error);
        }
    }

    updateViewsDisplay(views) {
        const viewsElement = document.getElementById('article-views');
        if (viewsElement) {
            viewsElement.textContent = `${views} vue${views > 1 ? 's' : ''}`;
        }
    }

    displayArticle() {
        // Mettre à jour le titre de la page
        document.title = `${this.currentArticle.title} - MENZOJI`;

        // Mettre à jour la bannière
        const bannerTitle = document.getElementById('article-title');
        if (bannerTitle) {
            bannerTitle.textContent = this.currentArticle.title;
        }

        // Mettre à jour le contenu de l'article
        document.getElementById('article-category').textContent = this.currentArticle.category;
        document.getElementById('article-date').textContent = this.formatDate(this.currentArticle.date);
        document.getElementById('article-title-main').textContent = this.currentArticle.title;
        document.getElementById('article-image').src = this.currentArticle.imageUrl || this.defaultImage;
        document.getElementById('article-image').alt = this.currentArticle.title;
        document.getElementById('article-content').textContent = this.currentArticle.content;
        
        // Afficher le nombre de vues
        this.updateViewsDisplay(this.currentArticle.views || 0);
    }

    generateRelatedPosts() {
        if (!this.currentArticle) return;

        // Trouver des articles similaires (même catégorie ou différents)
        const relatedPosts = this.posts
            .filter(post => post.id !== this.currentArticle.id)
            .slice(0, 3); // Maximum 3 articles similaires

        const relatedPostsContainer = document.getElementById('related-posts');

        if (relatedPosts.length === 0) {
            relatedPostsContainer.innerHTML = `
                <p style="color: #666; font-style: italic;">Aucun article similaire pour le moment</p>
            `;
            return;
        }

        relatedPostsContainer.innerHTML = relatedPosts.map(post => {
            // Limiter le texte à 30 caractères maximum
            const shortText = (post.excerpt || post.content).substring(0, 30);
            const displayText = shortText.length === 30 ? shortText + '...' : shortText;
            
            return `
                <div class="related-post" onclick="window.location.href='article.html?id=${post.id}'">
                    <img src="${post.imageUrl || this.defaultImage}" alt="${post.title}">
                    <div class="related-post-content">
                        <h4>${post.title}</h4>
                        <p>${displayText}</p>
                        <small style="color: #999; font-size: 10px;">${post.views || 0} vue${(post.views || 0) > 1 ? 's' : ''}</small>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showError(message) {
        const articleContent = document.querySelector('.article-content');
        if (articleContent) {
            articleContent.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <h2 style="color: #dc3545; margin-bottom: 1rem;">Erreur</h2>
                    <p style="color: #666; margin-bottom: 2rem;">${message}</p>
                    <a href="index.html" class="btn">Retour à l'accueil</a>
                </div>
            `;
        }
    }
}

// Fonctions de partage
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

// Initialiser le gestionnaire d'article
const articleManager = new ArticleManager(); 