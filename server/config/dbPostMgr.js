
// ========================================
// Importation des modules requis
// ========================================
const { getCurrentDate, getCurrentTime } = require('./utils'); // Fonctions utilitaires pour la date et l'heure
const PostMDB = require('../models/post');
const {json} = require("express");
const {Types} = require("mongoose");
const SequenceMDB = require("../models/sequence");

// ========================================
// Gestion des Posts
// ========================================

// ========================================
// Créer Nouveau Post
// ========================================
async function addPostDB(data) {
    // First contact CDN to upload img, upon success retrieve url
    // console.log("data from add Post: ", data)

    try {
        const newPost = new PostMDB( {
            _id: await getNextSequenceValue("post_id"),
            date: getCurrentDate(),
            hour: getCurrentTime(),
            createdBy: data.createdBy,
            body: data.body,
            likes: data.likes,
            likedBy: data.likedBy,
            hashtags: data.hashtags,
            comments: data.comments,
            images: data.images,
            sharedBy: data.sharedBy,
            shares: data.shares,
            pseudo: data.pseudo,
            __v: 0,

        });
        console.log("Post to create: ", newPost);
        return await newPost.save(); // Sauvegarder la session dans MongoDB

    } catch (err) {
        console.error('Erreur lors de la sauvegarde de la session :', err);
    }
}

const getNextSequenceValue = async (post_id) => {
    const sequence = await SequenceMDB.findOneAndUpdate(
        { _id: post_id }, // Match by sequence name
        { $inc: { sequence_value: 1 } }, // Increment sequence value
        { new: true }
    );
    return sequence.sequence_value;
};



// ========================================
// GET Liste de Post
// ========================================
async function getPosts(page) {

    const limit = 10; // Posts per page (default to 10)

    try {
        // je n'implémente pas d'erreur ici
        return await PostMDB.find({ body: { $exists: true }})
            .sort({_id: -1}) // trier par articles les plus récents
            .skip(page * limit) // ignorer les posts en fonction de la page(incremented by client)
            .limit(limit)
            .lean();

    } catch (err) {
        console.error('Erreur lors de la récupération des Posts depuis DB', err); // Journaliser les erreurs de récupération
        return null; // Retourner null en cas d'erreur
    }

}

// ========================================
// GET Single Post
// ========================================
async function getSinglePostDB(id) {

    try {
        return await PostMDB.findOne({
            _id: id, body: { $exists: true }
            })
            .lean();

    } catch (err) {
        console.error('Erreur lors de la récupération des Posts depuis DB', err); // Journaliser les erreurs de récupération
        return null; // Retourner null en cas d'erreur
    }

}

// ========================================
// GET Update and Return Updated Post
// ========================================
async function likePostDB(user_id, search_id) {
    console.log("likeDB: ", search_id);
    try {
        return await PostMDB.findOneAndUpdate(
            { _id: search_id, body: { $exists: true } }, // Query
            { $inc: { likes: 1 }, $push: { likedBy: user_id} }, // Fields to update
            { new: true }) // Returns the updated document
            .lean();

    } catch (err) {
        console.error('Erreur lors de la récupération des Posts depuis DB', err); // Journaliser les erreurs de récupération
        return null; // Retourner null en cas d'erreur
    }

}

// ========================================
// GET Update and Return Updated Post
// ========================================
async function unLikePostDB(user_id, search_id) {
    console.log("unlikeDB: ", search_id);
    try {
        return await PostMDB.findOneAndUpdate(
            { _id: search_id, body: { $exists: true } }, // Query
            { $inc: { likes: -1 }, $pull: { likedBy: user_id} }, // Fields to update
            { new: true }) // Returns the updated document
            .lean();

    } catch (err) {
        console.error('Erreur lors de la récupération des Posts depuis DB', err); // Journaliser les erreurs de récupération
        return null; // Retourner null en cas d'erreur
    }

}


// ========================================
// GET Update and Return Updated Post
// ========================================
async function add_commentDB(data) {

    const newId = new Types.ObjectId();
    let comment = {
        _id: newId.toString(),
        text: data.text,
        commentedBy: data.commentedBy,
        date: getCurrentDate(),
        time: getCurrentTime()
    }
    console.log("comment object: ", comment);

    try {
        return await PostMDB.findOneAndUpdate(
            { _id: data.post_id, body: { $exists: true } }, // Query
            { $push: { comments: comment} }, // Fields to update
            { new: true }) // Returns the updated document
            .lean();

    } catch (err) {
        console.error('Erreur lors de la récupération des Posts depuis DB', err); // Journaliser les erreurs de récupération
        return null; // Retourner null en cas d'erreur
    }
}

async function share_post(data) {
    try {
        return await PostMDB.findOneAndUpdate(
            { _id: data, },
            { $inc: { shares: 1} },
            { new: true}
        ).lean();
    } catch (err) {
        console.error('Erreur lors de la récupération des Posts depuis DB', err); // Journaliser les erreurs de récupération
        return null; // Retourner null en cas d'erreur
    }
}

async function onetimedeal(data) {
    console.log("one time");
    for (const item of data) {
        try {
            await PostMDB.updateOne(
                { _id: item._id, body: {$exists: true}}, // Query
                {$set: {pseudo: item.pseudo}}, // Fields to update
                {new: true}) // Returns the updated document
                .lean();

        } catch (err) {
            console.error('Erreur lors de la récupération des Posts depuis DB', err); // Journaliser les erreurs de récupération
            null; // Retourner null en cas d'erreur
        }
    }

}


// ========================================
// Exportation des fonctions et du pool
// ========================================
module.exports = {
    addPostDB,
    getPosts,
    getSinglePostDB,
    likePostDB,
    unLikePostDB,
    add_commentDB,
    share_post,
    onetimedeal
}