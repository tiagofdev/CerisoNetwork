// ========================================
// Chargement des modules nécessaires
// ========================================
const crypto = require("crypto");
const { getLastLoginSession, saveLoginSessionDB } = require("../config/dbSessionMgr");
const { pool } = require("../config/dbConnect");

// ========================================
// Exportation du gestionnaire de connexion Socket.io
// ========================================
module.exports = (io, socket, active_users) => {

    // ====================================
    // Événement : 'login' (connexion utilisateur)
    // ====================================

    socket.on('login', async (data) => {
        const { email, motpasse } = data;
        console.log('Login request received');


        // ------------------------------------
        // Vérification : pseudo ou mot de passe vide ou non fourni
        // ------------------------------------
        if (!email || !motpasse) {
            console.log('Pseudo or motpasse is empty or null');

            
            socket.emit('login', {
                sessionId: null,
                user_id: null,
                username: null,
                lastDate: null,
                lastTime: null,
                message: "Pseudo ou mot de passe manquant"
            });
            return;
        }


        // ------------------------------------
        // Hash du mot de passe avec SHA-1 (attention : SHA-1 est obsolète pour la sécurité moderne)
        // ------------------------------------
        const hashedMotpasse = crypto.createHash('sha1').update(motpasse).digest('hex');

        try {
            // ------------------------------------
            // Requête SQL pour vérifier les identifiants utilisateur dans PostgreSQL
            // ------------------------------------
            const query = 'SELECT * FROM fredouil.compte WHERE mail = $1 AND motpasse = $2';
            const result = await pool.query(query, [email, hashedMotpasse]);

            // ------------------------------------
            // Si l'utilisateur est trouvé dans la base
            // ------------------------------------
            if (result.rows.length > 0) {

                // --------------------------------
                // Génération d'un nouvel ID de session
                // --------------------------------
                // const sessionId = crypto.randomUUID();

                // --------------------------------
                // Stockage de la session côté socket
                // --------------------------------


                let session = socket.handshake.session;
                session.username = result.rows[0].pseudo;
                session.isAuthenticated = true;
                session.user_id = result.rows[0].id;
                await session.save();


                // --------------------------------
                // Enregistrement de la session dans la Map activeUsers
                // (utilisée côté serveur pour suivre les connexions actives)
                // --------------------------------

                active_users.set(session.user_id, {username: session.username} );

                // --------------------------------
                // Enregistrement d'une nouvelle session de connexion dans MongoDB
                // --------------------------------
                await saveLoginSessionDB(session.username);
                console.log(`Login success for ${session.username}, sessionId: ${session.id}`);

                let lastSession = await getLastLoginSession(session.username);

                // --------------------------------
                // Envoi des infos de session au client avec les données de dernière session
                // --------------------------------
                console.log("user_id: ", session.user_id);

                if (lastSession) {
                    socket.emit('login', {
                        sessionId: session.id,
                        user_id: session.user_id,
                        username: session.username,
                        lastDate: lastSession.date,
                        lastTime: lastSession.time,
                        message: ""
                    });
                } else {
                    // Cas : première connexion (aucune session précédente trouvée)
                    socket.emit('login', {
                        sessionId: session.id,
                        user_id: session.user_id,
                        username: session.username,
                        lastDate: null,
                        lastTime: null,
                        message: "Prémière Connexion"
                    });
                }

                // socket.emit() => sends msg to user only
                // io.emit() => sends msg to all users connected
                io.emit('active_users', Array.from(active_users.values()));


            } else {
                // --------------------------------
                // Identifiants incorrects -> échec de la connexion
                // --------------------------------
                console.log(`Login failed for ${email}`);
                socket.emit('login', {
                    sessionId: null,
                    user_id: null,
                    username: null,
                    lastDate: null,
                    lastTime: null,
                    message: "Connexion Échouée\nInformations d'identification incorrectes"
                });
            }

        } catch (err) {
            // --------------------------------
            // Gestion des erreurs serveur (ex : problème base de données)
            // --------------------------------
            console.error(err);
            socket.emit('login', {
                sessionId: null,
                user_id: null,
                username: null,
                lastDate: null,
                lastTime: null,
                message: "Erreur de Serveur"
            });
        }
    });
};
