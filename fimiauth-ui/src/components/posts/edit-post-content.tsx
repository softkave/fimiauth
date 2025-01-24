"use client";

import { IPost } from "@/src/definitions/post.js";
import { useUpdatePost } from "@/src/lib/clientApi/post.js";
import { cn } from "@/src/lib/utils.js";
import { debounce } from "lodash-es";
import { useMemo } from "react";
import { EditorStatus } from "../editor/editor-status.jsx";
import { MarkdownEditor } from "../editor/lexical-markdown.jsx";

export interface EditPostContentProps {
  post: IPost;
  className?: string;
}

export function EditPostContent({ post, className }: EditPostContentProps) {
  const updatePostHook = useUpdatePost({ postId: post.id });
  const debouncedUpdatePostContent = useMemo(
    () => debounce(updatePostHook.trigger, 1000),
    [updatePostHook.trigger]
  );

  const onChangeAsString = (value: string) => {
    debouncedUpdatePostContent({ content: value });
  };

  const namespace = `post-content-${post.id}`;
  const isSaving = updatePostHook.isMutating;
  const error = updatePostHook.error;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <EditorStatus showCount saving={isSaving} />
      {error && (
        <div className="text-sm text-red-500">
          {error.message ?? "Error updating post content"}
        </div>
      )}
      <MarkdownEditor
        autoFocus
        initialValue={post.content}
        onChangeAsString={onChangeAsString}
        namespace={namespace}
        placeholder="Enter your post content here..."
      />
    </div>
  );
}
