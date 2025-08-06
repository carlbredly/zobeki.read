const pool = require('../config/database');

class Post {
    // Récupérer tous les posts
    static async getAll() {
        try {
            const query = `
                SELECT id, title, category, content, excerpt, image_url, date, popular, views
                FROM posts 
                ORDER BY created_at DESC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des posts:', error);
            throw error;
        }
    }

    // Récupérer un post par ID
    static async getById(id) {
        try {
            const query = 'SELECT * FROM posts WHERE id = $1';
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération du post:', error);
            throw error;
        }
    }

    // Créer un nouveau post
    static async create(postData) {
        try {
            const { title, category, content, excerpt, imageUrl, popular } = postData;
            const query = `
                INSERT INTO posts (title, category, content, excerpt, image_url, popular)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const values = [title, category, content, excerpt, imageUrl, popular || false];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création du post:', error);
            throw error;
        }
    }

    // Mettre à jour un post
    static async update(id, postData) {
        try {
            const { title, category, content, excerpt, imageUrl, popular } = postData;
            const query = `
                UPDATE posts 
                SET title = $1, category = $2, content = $3, excerpt = $4, image_url = $5, popular = $6
                WHERE id = $7
                RETURNING *
            `;
            const values = [title, category, content, excerpt, imageUrl, popular, id];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la mise à jour du post:', error);
            throw error;
        }
    }

    // Supprimer un post
    static async delete(id) {
        try {
            const query = 'DELETE FROM posts WHERE id = $1 RETURNING *';
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la suppression du post:', error);
            throw error;
        }
    }

    // Incrémenter les vues d'un post
    static async incrementViews(id) {
        try {
            const query = `
                UPDATE posts 
                SET views = views + 1 
                WHERE id = $1 
                RETURNING views
            `;
            const result = await pool.query(query, [id]);
            return result.rows[0]?.views || 0;
        } catch (error) {
            console.error('Erreur lors de l\'incrémentation des vues:', error);
            throw error;
        }
    }

    // Récupérer les posts populaires
    static async getPopular() {
        try {
            const query = `
                SELECT id, title, category, content, excerpt, image_url, date, popular, views
                FROM posts 
                WHERE popular = true
                ORDER BY created_at DESC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des posts populaires:', error);
            throw error;
        }
    }

    // Récupérer les posts par catégorie
    static async getByCategory(category) {
        try {
            const query = `
                SELECT id, title, category, content, excerpt, image_url, date, popular, views
                FROM posts 
                WHERE category = $1
                ORDER BY created_at DESC
            `;
            const result = await pool.query(query, [category]);
            return result.rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des posts par catégorie:', error);
            throw error;
        }
    }

    // Récupérer les statistiques
    static async getStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_posts,
                    COUNT(CASE WHEN popular = true THEN 1 END) as popular_posts,
                    SUM(views) as total_views,
                    AVG(views) as avg_views
                FROM posts
            `;
            const result = await pool.query(query);
            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw error;
        }
    }
}

module.exports = Post; 