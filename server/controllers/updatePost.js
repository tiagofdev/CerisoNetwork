const {getUserPseudo} = require("../models/users");


async function updatePost (socket, updatedPost) {

    if (updatedPost.comments && updatedPost.comments.length !== 0) {
        // Replace commentedBy id for pseudo for each object
        updatedPost.comments = await Promise.all(
            updatedPost.comments.map(async (obj) => {
                return { ...obj, commentedBy: await getUserPseudo(obj.commentedBy) };
            })
        );
    }

    // console.log("post: ", updatedPost);
    // If this was sent to all users, and if all posts are in an SPA.
    // they would be overwhelmed trying to find the post id and update all new comments received
    // For the user connected, it is updated instantly
    // For other users, this will be updated when they refresh their page
    socket.emit('update_post', updatedPost);
}


module.exports = {
    updatePost,     // Fonction pour recuperer le pseudo des users

}