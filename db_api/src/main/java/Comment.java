

import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;
import java.util.List;

public class Comment {

    @BsonProperty("_id")
    public String _id;  // MongoDB ID (if needed)
    public String text; // Comment text
    public int commentedBy; // User ID of the creator
    public String date; // Comment creation date
    public String hour;

    public Comment() {}
}
