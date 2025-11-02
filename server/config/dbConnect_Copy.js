// ========================================
// Importation des modules requis
// ========================================
require('dotenv').config(); // Charger les variables d'environnement
const mongoose = require('mongoose'); // Pilote MongoDB
const { Pool } = require('pg'); // Client PostgreSQL

// ========================================
// Configuration de la connexion PostgreSQL
// ========================================
const pool = new Pool({
    user: '', // Nom d'utilisateur PostgreSQL
    password: '',  // Mot de passe PostgreSQL
    host: '', // Hôte du serveur PostgreSQL
    database: 'etd', // Nom de la base de données
    port: 5432 // Numéro du port
});

// ========================================
// Configuration MongoDB
// ========================================

let isConnected = false; // Statut de connexion à MongoDB

// Connexion à MongoDB
async function connectToMongo() {
    if (!isConnected) {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            // await mongoose.connect('mongodb://127.0.0.1:27017'); // Connexion à une instance MongoDB locale
            console.log('Connexion réussie à MongoDB');
            isConnected = true;
        } catch (err) {
            console.error('Erreur de connexion à MongoDB :', err); // Journaliser les erreurs de connexion
        }
    }
}

// ========================================
// Exportation des fonctions et du pool
// ========================================
module.exports = {
    connectToMongo,      // Fonction pour se connecter à MongoDB
    pool,               // Instance du pool PostgreSQL
};


