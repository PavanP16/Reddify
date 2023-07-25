"use client";

import { FC, useState } from "react";
import { Label } from "./Label";
import { Textarea } from "./Textarea";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "../lib/validators/comment";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useCustomToast } from "../hooks/use-custom-toast";
import { useToast } from "../hooks/use-toast";
import { useRouter } from "next/navigation";
import { ro } from "date-fns/locale";
import { set } from "date-fns";

interface CreateCommentProps {
  postId: string
  replyToId?:string
}

const CreateComment: FC<CreateCommentProps> = ({postId,replyToId}) => {
  const { toast } = useToast();
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const [input, setInput] = useState<string>("");

  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch(
        `/api/subreddit/post/comment`,
        payload
      );

      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem.",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Your Comment</Label>
      <div className="mt-2">
        <Textarea
          id="comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder="What are your thoughts..."
        ></Textarea>

        <div className="mt-2 flex justify-end">
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={() => {
              comment({ postId, text: input, replyToId });
            }}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
