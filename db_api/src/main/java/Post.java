
import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.PanacheMongoEntityBase;
import io.quarkus.mongodb.panache.common.MongoEntity;
import org.bson.codecs.pojo.annotations.BsonId;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;

import java.util.List;

@MongoEntity(collection = "MySession3566")
public class Post {

    @BsonProperty("_id")
    public Integer _id;

    public String body;
    public List<Comment> comments; // Array of embedded comments
    public int createdBy; // User ID of the creator
    public String date; // Creation date of the post
    public List<String> hashtags; // List of hashtags
    public String hour; // Creation hour

    public Images images; // Nested images object

    public List<Integer> likedBy; // Array of user IDs who liked the post
    public int likes; // Count of likes
    public int shares; // Share count
    public Integer sharedBy; // User ID who shared the post
    public String pseudo; // User's pseudo name
    public boolean showComments; // Boolean flag
}
