

const { updatePost } = require("../controllers/updatePost");
const { getSinglePostDB } = require("../config/dbPostMgr");

// ========================================
// Exportation du gestionnaire de connexion Socket.io
// ========================================
module.exports = (socket) => {

    socket.on('get_single_post', async (data) => {

        let post = await getSinglePostDB(data);
        console.log("single post: ", post._id);
        await updatePost(socket, post);

    });

}