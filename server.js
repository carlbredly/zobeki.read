const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const Post = require('./models/Post');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Servir les fichiers statiques

// Routes API

// GET /api/posts - Récupérer tous les posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.getAll();
        res.json({ posts });
    } catch (error) {
        console.error('Erreur lors de la récupération des posts:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des posts' });
    }
});

// GET /api/posts/popular - Récupérer les posts populaires
app.get('/api/posts/popular', async (req, res) => {
    try {
        const posts = await Post.getPopular();
        res.json({ posts });
    } catch (error) {
        console.error('Erreur lors de la récupération des posts populaires:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des posts populaires' });
    }
});

// GET /api/posts/category/:category - Récupérer les posts par catégorie
app.get('/api/posts/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const posts = await Post.getByCategory(category);
        res.json({ posts });
    } catch (error) {
        console.error('Erreur lors de la récupération des posts par catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des posts par catégorie' });
    }
});

// GET /api/posts/stats - Récupérer les statistiques
app.get('/api/posts/stats', async (req, res) => {
    try {
        const stats = await Post.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
});

// POST /api/posts - Ajouter un nouveau post
app.post('/api/posts', async (req, res) => {
    try {
        const { title, category, content, excerpt, imageUrl, popular } = req.body;
        
        // Validation des champs requis
        if (!title || !category || !content) {
            return res.status(400).json({ error: 'Titre, catégorie et contenu sont requis' });
        }

        const newPost = await Post.create({
            title,
            category,
            content,
            excerpt: excerpt || content.substring(0, 150) + '...',
            imageUrl,
            popular
        });
        
        res.status(201).json({ message: 'Post ajouté avec succès', post: newPost });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du post:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout du post' });
    }
});

// PUT /api/posts/:id - Modifier un post
app.put('/api/posts/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const { title, category, content, excerpt, imageUrl, popular } = req.body;
        
        // Vérifier si le post existe
        const existingPost = await Post.getById(postId);
        if (!existingPost) {
            return res.status(404).json({ error: 'Post non trouvé' });
        }

        const updatedPost = await Post.update(postId, {
            title: title || existingPost.title,
            category: category || existingPost.category,
            content: content || existingPost.content,
            excerpt: excerpt || existingPost.excerpt,
            imageUrl: imageUrl || null,
            popular: popular !== undefined ? popular : existingPost.popular
        });
        
        res.json({ message: 'Post modifié avec succès', post: updatedPost });
    } catch (error) {
        console.error('Erreur lors de la modification du post:', error);
        res.status(500).json({ error: 'Erreur lors de la modification du post' });
    }
});

// DELETE /api/posts/:id - Supprimer un post
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        
        // Vérifier si le post existe
        const existingPost = await Post.getById(postId);
        if (!existingPost) {
            return res.status(404).json({ error: 'Post non trouvé' });
        }

        const deletedPost = await Post.delete(postId);
        
        res.json({ message: 'Post supprimé avec succès', post: deletedPost });
    } catch (error) {
        console.error('Erreur lors de la suppression du post:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du post' });
    }
});

// PUT /api/posts/:id/views - Incrémenter les vues d'un post
app.put('/api/posts/:id/views', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        
        // Vérifier si le post existe
        const existingPost = await Post.getById(postId);
        if (!existingPost) {
            return res.status(404).json({ error: 'Post non trouvé' });
        }

        const newViews = await Post.incrementViews(postId);
        
        res.json({ 
            message: 'Vues incrémentées', 
            views: newViews 
        });
    } catch (error) {
        console.error('Erreur lors de l\'incrémentation des vues:', error);
        res.status(500).json({ error: 'Erreur lors de l\'incrémentation des vues' });
    }
});

// Routes pour servir les fichiers statiques
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Redirection vers le fichier ads.txt hébergé ailleurs
app.get('/ads.txt', (req, res) => {
    res.redirect(301, 'https://srv.adstxtmanager.com/19390/menzoji.fun');
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`🗄️ Base de données: PostgreSQL`);
    console.log(`🔧 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}`);
}); 