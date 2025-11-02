const {add_commentDB} = require("../config/dbPostMgr");
const {updatePost} = require("./updatePost");

module.exports = (socket) => {

    socket.on('add_comment', async (data) => {

        let post = await add_commentDB(data);
        await updatePost(socket, post);
    });

}