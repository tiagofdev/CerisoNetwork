
const { updatePost } = require("../controllers/updatePost");
const {addPostDB, share_post} = require("../config/dbPostMgr");

// ========================================
// Exportation du gestionnaire de connexion Socket.io
// ========================================
module.exports = (socket) => {

    socket.on('add_post', async (data) => {

        let post = await addPostDB(data);
        console.log(`Session sauvegardée pour ${data.pseudo}`);
        // console.log("post updated: ", post);
        socket.emit("update_post", post);

        if (post.sharedBy !== null) {
            let shared_post = await share_post(post.sharedBy);
            await updatePost(socket, shared_post);
        }

    });

}