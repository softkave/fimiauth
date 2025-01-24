"use client";

import { EditPost } from "./edit-post.jsx";
import { PostContainer } from "./post-container.jsx";

interface IEditPostProps {
  postId: string;
}

export function EditPostContainer({ postId }: IEditPostProps) {
  return (
    <PostContainer
      postId={postId}
      render={(post) => <EditPost post={post} />}
    />
  );
}
