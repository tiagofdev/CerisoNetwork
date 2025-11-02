
// ========================================
// Importation des modules requis
// ========================================
const { getCurrentDate, getCurrentTime } = require('./utils'); // Fonctions utilitaires pour la date et l'heure
const SessionMDB = require('../models/session');

// ========================================
// Gestion des sessions
// ========================================

// Ajouter une session de connexion dans MongoDB
async function saveLoginSessionDB(username) {
    try {
        const newSession = new SessionMDB({
            session: {
                username, // Nom d'utilisateur pour la session
                date: getCurrentDate(), // Date actuelle
                time: getCurrentTime() // Heure actuelle
            },
            expires: new Date(Date.now() + 1 * 3600000) // Expiration de la session dans BD : 30 jours à partir de maintenant
        });

        await newSession.save(); // Sauvegarder la session dans MongoDB
        console.log(`Session sauvegardée pour ${username} à la BD`);
    } catch (err) {
        console.error('Erreur lors de la sauvegarde de la session :', err); // Journaliser les erreurs de sauvegarde
    }
}

// Récupérer la dernière session de connexion pour un utilisateur donné
async function getLastLoginSession(pseudo) {
    try {
        const lastSession = await SessionMDB.findOne({ 'session.username': pseudo })
            .sort({ _id: -1 }) // Trier par session la plus récente (ObjectId inclut un horodatage)
            .lean(); // Retourner un objet JavaScript simple pour optimiser les performances

        if (!lastSession) {
            console.log(`Aucune session de connexion trouvée pour ${pseudo}`);
            return null; // Retourner null si aucune session n'est trouvée
        }

        return lastSession.session; // Retourner les détails de la session
    } catch (err) {
        console.error('Erreur lors de la récupération de la dernière session depuis DB:', err); // Journaliser les erreurs de récupération
        return null; // Retourner null en cas d'erreur
    }
}


// ========================================
// Exportation des fonctions et du pool
// ========================================
module.exports = {
    saveLoginSessionDB,     // Fonction pour ajouter une session de connexion
    getLastLoginSession // Fonction pour récupérer la dernière session de connexion
}