"use client";

import { IPost } from "@/src/definitions/post.js";
import { useGetPost } from "@/src/lib/clientApi/post.js";
import { WrapLoader } from "../internal/wrap-loader.js";

interface IPostContainerProps {
  postId: string;
  render: (post: IPost) => React.ReactNode;
}

export function PostContainer({ postId, render }: IPostContainerProps) {
  const postHook = useGetPost({ postId });

  const isLoading = postHook.isLoading;
  const error = postHook.error;

  return (
    <WrapLoader
      isLoading={isLoading}
      error={error}
      data={postHook.data}
      render={(data) => render(data)}
    />
  );
}
