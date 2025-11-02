
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.FindOneAndUpdateOptions;
import com.mongodb.client.model.ReturnDocument;
import com.mongodb.client.model.Updates;
import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.bson.conversions.Bson;
import org.bson.Document;


import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class PostRepository {


    // MONGOCLIENT
    @Inject
    MongoClient mongoClient; 

    public MongoCollection<Post> getCollection() {
        MongoDatabase database = mongoClient.getDatabase("db-CERI");
        return database.getCollection("MySession3123", Post.class);
    }

    public List<Post> getPostsByUser(String pseudo) {
        Bson filter = Filters.eq("pseudo", pseudo);

        List<Post> posts = new ArrayList<>();
        getCollection().find(filter).into(posts);
        return posts;
    }

    public Post resetLikes(int postId) {
        Bson filter = Filters.eq("_id", postId);
        Bson update = Updates.combine(
                Updates.set("likes", 0),
                Updates.set("likedBy", new ArrayList<>())
        );

        return getCollection().findOneAndUpdate(
                filter,
                update,
                new FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER)
        );
    }

    public String delete(int postId) {
        Bson filter = Filters.eq("_id", postId);

        // IF THIS POST SHARES ANOTHER POST, I'M GOING TO DECREMENT THE ORIGINAL POST SHARED
        Post post = getCollection().find(filter).first(); // Get the post document

        // Check if this post has shared another post
        if (post != null ) {
            Integer sharedBy = post.sharedBy; // Get the original post ID

            // Ensure sharedBy is not null and update the shared count
            if (sharedBy != null) {
                Bson findOriginal = Filters.eq("_id", sharedBy);
                Bson updateShares = Updates.inc("shares", -1); // Decrement shared count
                UpdateResult result = getCollection().updateOne(findOriginal, updateShares);
            }
        }

        DeleteResult result = getCollection().deleteOne(filter);

        // DELETE OTHER POSTS THAT MAY SHARE THIS ONE POST DELETED
        if (result.wasAcknowledged()) {
            Bson filterOthers = Filters.eq("sharedBy", postId);
            DeleteResult resultOthers = getCollection().deleteMany(filterOthers);
        }




        if ( result.getDeletedCount() == 0 ) {
            return null;
        } else {
            return "Post " + postId + " deleted";
        }
    }

    public Post newPost(int userId, String body, String pseudo) {
        int nextId = getNextSequenceValue("post_id");

        Post newPost = new Post();
        newPost._id = nextId;
        newPost.date = getCurrentDate();
        newPost.hour = getCurrentTime();
        newPost.createdBy = userId;
        newPost.body = body;
        newPost.likes = 0;
        newPost.likedBy = new ArrayList<>();
        newPost.hashtags = new ArrayList<>();
        newPost.comments = new ArrayList<>();
        newPost.images = null;
        newPost.sharedBy = null;
        newPost.shares = 0;
        newPost.pseudo = pseudo;
        newPost.showComments = false;


        System.out.println("here is the next id: " + newPost._id);
        System.out.println("pseudo: " + newPost.pseudo);
        System.out.println("pseudo: " + newPost.body);

        getCollection().insertOne(newPost);

        return newPost;
    }

    public int getNextSequenceValue(String sequenceId) {
        MongoCollection<Document> sequenceCollection = mongoClient
                .getDatabase("db-CERI")
                .getCollection("Sequence");

        Document updatedDoc = sequenceCollection.findOneAndUpdate(
                Filters.eq("_id", sequenceId),
                Updates.inc("sequence_value", 1),
                new FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER)
        );

        if (updatedDoc != null) {
            return updatedDoc.getInteger("sequence_value");
        } else {
            // If sequence doesn't exist, create one
            Document newSeq = new Document("_id", sequenceId)
                    .append("sequence_value", 1);
            sequenceCollection.insertOne(newSeq);
            return 1;
        }
    }

    public String getCurrentDate() {
        LocalDate currentDate = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return currentDate.format(formatter);
    }

    public String getCurrentTime() {
        LocalTime currentTime = LocalTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm");
        return currentTime.format(formatter);
    }


}
