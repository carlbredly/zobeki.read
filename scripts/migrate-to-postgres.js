const fs = require('fs').promises;
const path = require('path');
const Post = require('../models/Post');
require('dotenv').config();

async function migrateToPostgres() {
    try {
        console.log('🔄 Début de la migration JSON vers PostgreSQL...');
        
        // Lire le fichier posts.json
        const postsFile = path.join(__dirname, '../posts.json');
        const data = await fs.readFile(postsFile, 'utf8');
        const posts = JSON.parse(data).posts;
        
        console.log(`📊 ${posts.length} posts trouvés dans posts.json`);
        
        // Migrer chaque post
        for (const post of posts) {
            try {
                // Vérifier si le post existe déjà
                const existingPost = await Post.getById(post.id);
                
                if (existingPost) {
                    console.log(`⚠️ Post ID ${post.id} existe déjà, mise à jour...`);
                    await Post.update(post.id, {
                        title: post.title,
                        category: post.category,
                        content: post.content,
                        excerpt: post.excerpt,
                        imageUrl: post.imageUrl,
                        popular: post.popular
                    });
                } else {
                    console.log(`➕ Migration du post ID ${post.id}: ${post.title}`);
                    await Post.create({
                        title: post.title,
                        category: post.category,
                        content: post.content,
                        excerpt: post.excerpt,
                        imageUrl: post.imageUrl,
                        popular: post.popular
                    });
                }
            } catch (error) {
                console.error(`❌ Erreur lors de la migration du post ID ${post.id}:`, error.message);
            }
        }
        
        console.log('✅ Migration terminée avec succès !');
        
        // Afficher les statistiques
        const stats = await Post.getStats();
        console.log('📈 Statistiques après migration:');
        console.log(`   - Total posts: ${stats.total_posts}`);
        console.log(`   - Posts populaires: ${stats.popular_posts}`);
        console.log(`   - Total vues: ${stats.total_views}`);
        console.log(`   - Moyenne vues: ${Math.round(stats.avg_views || 0)}`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
    migrateToPostgres()
        .then(() => {
            console.log('🎉 Migration terminée !');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = migrateToPostgres; 