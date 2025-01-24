import { IPost } from "@/src/definitions/post.js";
import { EditPostContent } from "./edit-post-content.jsx";
import { EditPostSummary } from "./edit-post-summary.jsx";
import { EditPostTitle } from "./edit-post-title.jsx";

export interface IEditPostProps {
  post: IPost;
}

export function EditPost({ post }: IEditPostProps) {
  return (
    <div className="flex flex-col gap-2">
      <EditPostTitle post={post} />
      <EditPostSummary post={post} />
      <EditPostContent post={post} />
    </div>
  );
}
