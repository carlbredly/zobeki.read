// Main JavaScript pour charger les posts depuis JSON
class BlogManager {
    constructor() {
        this.posts = [];
        this.defaultImage = 'src/IMG_2581.png';
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.updateBanner();
        this.generateMainPost();
        this.generatePostsList();
        this.generatePopularPosts();
    }

    async loadPosts() {
        try {
            const response = await fetch('/api/posts');
            const data = await response.json();
            this.posts = data.posts || [];
            console.log('Posts chargés depuis le serveur (main.js):', this.posts.length);
        } catch (error) {
            console.error('Erreur lors du chargement des posts:', error);
            this.posts = [];
        }
    }

    generateMainPost() {
        if (this.posts.length === 0) {
            this.showNoPostsMessage();
            return;
        }

        // Trier les posts par date (du plus récent au plus ancien)
        const sortedPosts = [...this.posts].sort((a, b) => new Date(b.date) - new Date(a.date));
        const mostRecentPost = sortedPosts[0];
        
        const mainPostContainer = document.getElementById('main-post-container');
        
        if (mainPostContainer) {
            mainPostContainer.innerHTML = `
                <div class="post">
                    <div class="postimg">
                        <img src="${mostRecentPost.imageUrl || this.defaultImage}" alt="${mostRecentPost.title}">
                    </div>
                    <div class="postcontent">
                        <h2>${mostRecentPost.title}</h2>
                        <p>${mostRecentPost.content}</p>
                        <a class="tag" href="article.html?id=${mostRecentPost.id}">Read More</a>
                    </div>
                </div>
            `;
        }
    }

    generatePostsList() {
        if (this.posts.length <= 1) return;

        // Trier les posts par date et exclure le plus récent
        const sortedPosts = [...this.posts].sort((a, b) => new Date(b.date) - new Date(a.date));
        const otherPosts = sortedPosts.slice(1, 6); // Prendre seulement les 5 derniers posts

        const postsListContainer = document.getElementById('posts-list-container');
        
        if (postsListContainer && otherPosts.length > 0) {
            postsListContainer.innerHTML = `
                <div class="containerlist">
                    ${otherPosts.map(post => `
                        <div class="listpost">
                            <div class="imaglispost">
                                <img src="${post.imageUrl || this.defaultImage}" alt="${post.title}">
                            </div>
                            <div class="listcontent">
                                <p class="">${post.category}</p>
                                <h2>${post.title}</h2>
                                <p>${post.excerpt || post.content.substring(0, 200) + '...'}</p>
                                <button class="tag" onclick="window.location.href='article.html?id=${post.id}'">read more</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    generatePopularPosts() {
        const popularPosts = this.posts.filter(post => post.popular);
        const popularPostsContainer = document.getElementById('popular-posts-container');
        
        if (!popularPostsContainer) return;

        if (popularPosts.length === 0) {
            popularPostsContainer.innerHTML = `
                <div class="postright">
                    <div class="postrightimg">
                        <img src="${this.defaultImage}" alt="No popular posts">
                    </div>
                    <div class="postrightcontent">
                        <h2>Aucun post populaire pour le moment</h2>
                        <p>Aucune date</p>
                    </div>
                </div>
            `;
            return;
        }

        popularPostsContainer.innerHTML = popularPosts.map(post => `
            <div class="postright" onclick="window.location.href='article.html?id=${post.id}'" style="cursor: pointer;">
                <div class="postrightimg">
                    <img src="${post.imageUrl || this.defaultImage}" alt="${post.title}">
                </div>
                <div class="postrightcontent">
                    <h2>${post.title}</h2>
                    <p>${post.date}</p>
                </div>
            </div>
        `).join('');
    }

    showNoPostsMessage() {
        const mainPostContainer = document.getElementById('main-post-container');
        const postsListContainer = document.getElementById('posts-list-container');
        
        if (mainPostContainer) {
            mainPostContainer.innerHTML = `
                <div class="post">
                    <div class="postimg">
                        <img src="${this.defaultImage}" alt="No posts">
                    </div>
                    <div class="postcontent">
                        <h2>Aucun post disponible</h2>
                        <p>Il n'y a pas encore de posts dans la base de données. Utilisez le dashboard pour ajouter votre premier post !</p>
                        <a class="tag" href="dashboard.html">Accéder au Dashboard</a>
                    </div>
                </div>
            `;
        }

        if (postsListContainer) {
            postsListContainer.innerHTML = `
                <div class="containerlist">
                    <div class="listpost">
                        <div class="imaglispost">
                            <img src="${this.defaultImage}" alt="No posts">
                        </div>
                        <div class="listcontent">
                            <p class="">Info</p>
                            <h2>Commencez à créer du contenu</h2>
                            <p>Votre blog est prêt ! Ajoutez votre premier post via le dashboard d'administration.</p>
                            <button class="tag" onclick="window.location.href='dashboard.html'">Dashboard</button>
                        </div>
                    </div>
                </div>
            `;
        }
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

// Initialiser le gestionnaire de blog
const blogManager = new BlogManager();
