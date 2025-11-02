import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


@Path("/")
public class Service {

    @Inject
    PostRepository repo;


    @GET
    @Path("/postsByUser/{pseudo}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPostsByUser(@PathParam("pseudo") String pseudo) {

        if (pseudo == null || pseudo.isEmpty()) {
            throw new WebApplicationException(
                    Response.status(Response.Status.BAD_REQUEST)
                            .entity("{\"error\":\"Données insuffisantes\"}")
                            .type(MediaType.APPLICATION_JSON)
                            .build()
            );
        } else {
            List<Post> result = repo.getPostsByUser(pseudo);

            if (result.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Aucun Utilisateur dans la BD.\"}")
                        .type(MediaType.APPLICATION_JSON)
                        .build();
            } else {
                String jsonOutput = listToJson(result);
                result.forEach(post -> {
                    System.out.println(post._id);
                });
                return Response.status(Response.Status.OK)
                        .entity(jsonOutput)
                        .type(MediaType.APPLICATION_JSON)
                        .build();
            }
        }

    }

    @PUT
    @Path("/resetLikes/{postId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response resetLikes(@PathParam("postId") int postId) {
        Post result = repo.resetLikes(postId);

        if (result == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Post pas trouvé dans la BD.\"}")
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        } else {
            System.out.println("postId: " + result.body);

            return Response.status(Response.Status.OK)
                    .entity(result)
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }
    }

    @DELETE
    @Path("/delete/{postId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response delete(@PathParam("postId") int postId) {

        String result = repo.delete(postId);
        if (result == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Post pas trouvé dans la BD.\"}")
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        } else {
            System.out.println(result);
            return Response.status(Response.Status.OK)
                    .entity("{\"message\":\"" + result + "\"}")
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }

    }

    @POST
    @Path("/newpost")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public Response newPost(@FormParam("userId") int userId,
                            @FormParam("body") String body,
                            @FormParam("pseudo") String pseudo) {

        if (userId == 0 || body == null || body.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Collections.singletonMap("error", "Données insuffisantes."))
                    .build();
        }

        Post result = repo.newPost(userId, body, pseudo);

        if (result == null) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Collections.singletonMap("error", "Erreur dans la BD."))
                    .build();
        }

        return Response.ok(result).build();
    }



    public String listToJson(List<Post> postList) {
        try {
            ObjectMapper objectMapper = new ObjectMapper(); // Jackson ObjectMapper
            return objectMapper.writeValueAsString(postList); // Serialize list to JSON
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


}