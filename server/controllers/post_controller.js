
const {getUserPseudo} = require("../models/users");
const {onetimedeal} = require("../config/dbPostMgr");


module.exports = (io, socket, sessionStore) => {
const { getPosts } = require("../config/dbPostMgr")
    // ====================================
    // Événement : getPosts
    // ====================================
    socket.on('get_posts', async (page) => {

        console.log("page: ", page);
        let posts = await getPosts(page);
        // console.log("posts", posts);
        let updatedPosts = posts;

        // I could simply create a map (id -> pseudo) to hold the users names, instead of querying the DB each time.
        // However, if users IRL changed their names, in real time, the map wouldn't get updated.
        for (let index = 0; index < posts.length; index++) {
            // onetimedeal - posts[index].pseudo = await getUserPseudo(posts[index].createdBy);
            // Replace commentedBy id for pseudo for each object
            const updatedComments = await Promise.all(
                updatedPosts[index].comments.map(async (obj) => {
                    return { ...obj, commentedBy: await getUserPseudo(obj.commentedBy) };
                })
            );
            // console.log("post id: ", updatedPosts[index]._id);
            updatedPosts[index].comments = updatedComments;

            // console.log("ids: ", updatedPosts[index]._ids);
        }
        // await onetimedeal(posts);
        // console.log("posts: ", updatedPosts);
        // console.log("posts length: ", updatedPosts.length);


        socket.emit('get_posts', {
            posts: updatedPosts
        });

    });


}