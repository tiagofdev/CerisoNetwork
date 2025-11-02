
// ========================================
// Chargement des modules nécessaires
// ========================================
const { likePostDB } = require("../config/dbPostMgr")
const { updatePost } = require("../controllers/updatePost");

// ========================================
// Exportation du gestionnaire de connexion Socket.io
// ========================================
module.exports = (socket) => {

    socket.on('like_post', async (id) => {

        let post = await likePostDB(socket.handshake.session.user_id, id);
        // console.log("post updated: ", post);
        await updatePost(socket, post);

    });

}