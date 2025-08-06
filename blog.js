class BlogManager {
    constructor() {
        this.posts = [];
        this.filteredPosts = [];
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.currentCategory = null;
        this.searchQuery = '';
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.setupEventListeners();
        this.updateBanner();
        this.displayPosts();
        this.generateCategories();
        this.generatePopularPosts();
        this.generateArchives();
    }

    async loadPosts() {
        try {
            const response = await fetch('/api/posts');
            const data = await response.json();
            this.posts = data.posts || [];
            this.filteredPosts = [...this.posts];
            console.log('Posts chargés depuis le serveur (blog.js):', this.posts.length);
        } catch (error) {
            console.error('Erreur lors du chargement des posts:', error);
            this.posts = [];
            this.filteredPosts = [];
        }
    }

    setupEventListeners() {
        // Recherche
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.filterPosts();
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.filterPosts();
            });
        }

        // Recherche avec Enter
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.filterPosts();
                }
            });
        }
    }

    filterPosts() {
        this.currentPage = 1;
        this.filteredPosts = this.posts.filter(post => {
            const matchesSearch = !this.searchQuery || 
                post.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                post.category.toLowerCase().includes(this.searchQuery.toLowerCase());
            
            const matchesCategory = !this.currentCategory || post.category === this.currentCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        this.displayPosts();
    }

    filterByCategory(category) {
        this.currentCategory = this.currentCategory === category ? null : category;
        this.filterPosts();
    }

    displayPosts() {
        const blogGrid = document.getElementById('blog-grid');
        if (!blogGrid) return;

        if (this.filteredPosts.length === 0) {
            blogGrid.innerHTML = `
                <div class="no-results">
                    <h3>🔍 Aucun article trouvé</h3>
                    <p>${this.searchQuery ? `Aucun article ne correspond à "${this.searchQuery}"` : 'Aucun article disponible pour le moment.'}</p>
                    <a href="blog.html" class="btn">Voir tous les articles</a>
                </div>
            `;
            document.getElementById('blog-pagination').innerHTML = '';
            return;
        }

        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const postsToShow = this.filteredPosts.slice(startIndex, endIndex);

        blogGrid.innerHTML = postsToShow.map(post => `
            <article class="blog-card">
                <div class="blog-card-image">
                    <img src="${post.imageUrl || 'src/IMG_2581.png'}" alt="${post.title}">
                </div>
                <div class="blog-card-content">
                    <span class="blog-card-category">${post.category}</span>
                    <h2 class="blog-card-title">${post.title}</h2>
                    <p class="blog-card-excerpt">${post.excerpt || post.content.substring(0, 150) + '...'}</p>
                    <div class="blog-card-meta">
                        <span class="blog-card-date">📅 ${this.formatDate(post.date)}</span>
                        <span class="blog-card-views">${post.views || 0} vue${(post.views || 0) > 1 ? 's' : ''}</span>
                    </div>
                    <a href="article.html?id=${post.id}" class="blog-card-link">Lire la suite</a>
                </div>
            </article>
        `).join('');

        this.generatePagination();
    }

    generatePagination() {
        const pagination = document.getElementById('blog-pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Bouton précédent
        if (this.currentPage > 1) {
            paginationHTML += `<a href="#" class="pagination-btn" data-page="${this.currentPage - 1}">← Précédent</a>`;
        }

        // Pages numérotées
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                const isActive = i === this.currentPage;
                paginationHTML += `<a href="#" class="pagination-btn ${isActive ? 'active' : ''}" data-page="${i}">${i}</a>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<span class="pagination-btn">...</span>`;
            }
        }

        // Bouton suivant
        if (this.currentPage < totalPages) {
            paginationHTML += `<a href="#" class="pagination-btn" data-page="${this.currentPage + 1}">Suivant →</a>`;
        }

        pagination.innerHTML = paginationHTML;

        // Event listeners pour la pagination
        pagination.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage = parseInt(btn.dataset.page);
                this.displayPosts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    generateCategories() {
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList) return;

        const categories = {};
        this.posts.forEach(post => {
            categories[post.category] = (categories[post.category] || 0) + 1;
        });

        const categoriesHTML = Object.entries(categories).map(([category, count]) => `
            <a href="#" class="category-item" data-category="${category}">
                <span>${category}</span>
                <span class="category-count">${count}</span>
            </a>
        `).join('');

        categoriesList.innerHTML = categoriesHTML;

        // Event listeners pour les catégories
        categoriesList.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = item.dataset.category;
                this.filterByCategory(category);
                
                // Mettre à jour l'état actif
                categoriesList.querySelectorAll('.category-item').forEach(cat => {
                    cat.classList.remove('active');
                });
                if (this.currentCategory === category) {
                    item.classList.add('active');
                }
            });
        });
    }

    generatePopularPosts() {
        const popularPosts = document.getElementById('popular-posts');
        if (!popularPosts) return;

        const popular = this.posts
            .filter(post => post.popular)
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);

        if (popular.length === 0) {
            popularPosts.innerHTML = '<p style="color: #666; font-style: italic;">Aucun article populaire pour le moment.</p>';
            return;
        }

        const popularHTML = popular.map(post => `
            <a href="article.html?id=${post.id}" class="popular-post">
                <div class="popular-post-image">
                    <img src="${post.imageUrl || 'src/IMG_2581.png'}" alt="${post.title}">
                </div>
                <div class="popular-post-content">
                    <h4>${post.title}</h4>
                    <p>${this.formatDate(post.date)}</p>
                </div>
            </a>
        `).join('');

        popularPosts.innerHTML = popularHTML;
    }

    generateArchives() {
        const archivesList = document.getElementById('archives-list');
        if (!archivesList) return;

        const archives = {};
        this.posts.forEach(post => {
            const date = new Date(post.date);
            const year = date.getFullYear();
            const month = date.toLocaleDateString('fr-FR', { month: 'long' });
            const key = `${month} ${year}`;
            archives[key] = (archives[key] || 0) + 1;
        });

        const archivesHTML = Object.entries(archives)
            .sort((a, b) => {
                const dateA = new Date(a[0]);
                const dateB = new Date(b[0]);
                return dateB - dateA;
            })
            .slice(0, 10)
            .map(([period, count]) => `
                <a href="#" class="archive-item" data-period="${period}">
                    <span>${period}</span>
                    <span class="archive-count">${count}</span>
                </a>
            `).join('');

        archivesList.innerHTML = archivesHTML;

        // Event listeners pour les archives
        archivesList.querySelectorAll('.archive-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const period = item.dataset.period;
                this.filterByPeriod(period);
                
                // Mettre à jour l'état actif
                archivesList.querySelectorAll('.archive-item').forEach(arch => {
                    arch.classList.remove('active');
                });
                item.classList.add('active');
            });
        });
    }

    filterByPeriod(period) {
        this.currentPage = 1;
        this.filteredPosts = this.posts.filter(post => {
            const date = new Date(post.date);
            const year = date.getFullYear();
            const month = date.toLocaleDateString('fr-FR', { month: 'long' });
            const postPeriod = `${month} ${year}`;
            return postPeriod === period;
        });
        
        this.displayPosts();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    updateBanner() {
        this.updateBannerDate();
        this.updateLatestArticle();
    }

    updateBannerDate() {
        const bannerDate = document.getElementById('banner-date');
        if (bannerDate) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            };
            const formattedDate = now.toLocaleDateString('en-US', options);
            bannerDate.textContent = formattedDate;
        }
    }

    updateLatestArticle() {
        const latestArticleLink = document.getElementById('latest-article-link');
        if (latestArticleLink && this.posts.length > 0) {
            // Trier les posts par date (le plus récent en premier)
            const sortedPosts = [...this.posts].sort((a, b) => new Date(b.date) - new Date(a.date));
            const latestPost = sortedPosts[0];
            
            // Mettre à jour le lien et le texte
            latestArticleLink.textContent = latestPost.title.length > 30 
                ? latestPost.title.substring(0, 30) + '...' 
                : latestPost.title;
            latestArticleLink.href = `article.html?id=${latestPost.id}`;
        } else if (latestArticleLink) {
            // Si aucun article n'existe
            latestArticleLink.textContent = 'Aucun article disponible';
            latestArticleLink.href = '#';
        }
    }
}

// Initialiser le blog
const blogManager = new BlogManager(); 