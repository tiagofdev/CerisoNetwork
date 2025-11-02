
// ========================================
// Chargement des modules nécessaires
// ========================================
const { unLikePostDB } = require("../config/dbPostMgr")
const { updatePost } = require("../controllers/updatePost");

// ========================================
// Exportation du gestionnaire de connexion Socket.io
// ========================================
module.exports = (socket) => {

    socket.on('unlike_post', async (id) => {

        let post = await unLikePostDB(socket.handshake.session.user_id, id);
        // console.log("updated post: ", post);
        await updatePost(socket, post);

    });

}