// ========================================
// Importation des modules requis
// ========================================
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const path = require('path');
const expressSession = require('express-session');
const sharedSession = require('express-socket.io-session');
const socketIo = require('socket.io');
const mongoStore = require('connect-mongodb-session')(expressSession);

// ========================================
// Importation des modules du projet
// ========================================
const { connectToMongo } = require('./config/database');
const login = require('./controllers/login');

// ========================================
// Initialisation de l'application Express
// ========================================
const app = express();
const port_HTTPS = 3123;

// Origine autorisée pour CORS (à restreindre en production)
const allowedOrigin = '*';

// Mémoire temporaire pour les sessions côté socket
const sessionStore = new Map();

// ========================================
// Configuration du middleware de session
// ========================================
const sessionMiddleware = expressSession({
    secret: 'w3>&Y?6`)3Lj', // Secret pour l'encryption des sessions (à garder confidentiel)
    resave: false, // Ne pas réenregistrer les sessions inchangées
    saveUninitialized: false, // Ne pas enregistrer les sessions vides
    store: new mongoStore({
        uri: 'mongodb://127.0.0.1:27017', // URI de connexion à MongoDB
        collection: 'MySession3123' // Nom de la collection de sessions
    }),
    cookie: { maxAge: 24 * 3600 * 1000 } // Durée de validité du cookie de session : 1 jour
});

// ========================================
// Middlewares Express
// ========================================

// Analyse des corps des requêtes URL-encodées (données de formulaire)
app.use(express.urlencoded({ extended: true }));

// Servir le frontend Angular (dossier build statique)
app.use(express.static(path.join(__dirname, 'dist/angular17/browser')));

// Application du middleware de session à Express
app.use(sessionMiddleware);

// ========================================
// Gestion des routes du frontend
// ========================================

// Rediriger toutes les routes vers index.html d'Angular
// Angular gère ensuite le routage côté client
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/angular17/browser/index.html'));
});

// ========================================
// Configuration du serveur HTTPS
// ========================================
const sslOptions = {
    key: fs.readFileSync('ssl/myPrivateKey.key'),        // Clé privée SSL
    cert: fs.readFileSync('ssl/myCertificate.crt'),      // Certificat SSL
    passphrase: 'avignon'                                // Mot de passe de la clé (si requis)
};

// Création du serveur HTTPS sécurisé
const server = https.createServer(sslOptions, app);

// ========================================
// Serveur WebSocket avec Socket.io
// ========================================
const io = socketIo(server, {
    cors: {
        origin: allowedOrigin, // Autoriser l'accès au frontend
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        credentials: true
    }
});

// ========================================
// Application du middleware CORS à Express
// ========================================
app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));

// ========================================
// Partage de session entre HTTP et WebSockets
// ========================================
io.use(sharedSession(sessionMiddleware, {
    autoSave: true // Sauvegarde automatique des modifications de session
}));

// ========================================
// Gestion de la connexion WebSocket
// ========================================
io.on('connection', socketClient => {
    console.log('Un nouveau client s\'est connecté.');

    // Récupérer la session via le handshake WebSocket
    const session = socketClient.handshake.session;
    console.log('Session utilisateur :', session);

    // Déléguer la gestion du login au contrôleur
    login(io, socketClient, sessionStore);

    // Gérer l'événement de déconnexion
    socketClient.on('logout', async (sessionId) => {
        const pseudo = session.username;
        try {
            // Supprimer la session de la mémoire temporaire
            sessionStore.delete(sessionId);
            console.log(`Déconnexion réussie pour ${pseudo}, session détruite`);

            // Optionnel : notifier le client avec socketClient.emit(...)
        } catch (err) {
            console.error(err);
        }
    });

    // Exemple d’événement protégé (commenté pour l’instant)
    // socketClient.on('someProtectedEvent', data => {
    //     if (!session.userId) {
    //         socketClient.emit('login', { message: 'Veuillez vous connecter d\'abord' });
    //         return;
    //     }
    //     // Action réservée aux utilisateurs authentifiés
    // });
});

// ========================================
// Démarrage du serveur HTTPS
// ========================================
server.listen(port_HTTPS, async () => {
    // Connexion à MongoDB au démarrage du serveur
    await connectToMongo();
    console.log(`Serveur HTTPS en écoute sur https://localhost:${port_HTTPS}`);
});
