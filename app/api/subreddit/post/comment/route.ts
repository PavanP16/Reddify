import { getAuthSession } from "../../../../../lib/auth";
import { db } from "../../../../../lib/db";
import { CommentValidator } from "../../../../../lib/validators/comment";
import { z } from "zod";

export async function PATCH(req : Request){


    try {
        const body = await req.json();

        const {postId,text,replyToId} = CommentValidator.parse(body);

        const session = await getAuthSession();

        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
          }


          await db.comment.create({
            data:{
                text,
                postId,
                authorId:session.user.id,
                replyToId
            }
          })

          return new Response("Comment created dude", { status: 200 });

    } catch (error) {

        if (error instanceof z.ZodError) {
            return new Response("Invalid post request", { status: 422 });
          }
      
          return new Response("Could not create comment dude,try later", { status: 500 });
        
    }


}