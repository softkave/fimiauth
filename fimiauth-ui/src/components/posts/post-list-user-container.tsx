"use client";

import { WrapUserComponent } from "../user/wrap-user-component.js";
import { PostList } from "./post-list.js";

export function PostListUserContainer() {
  return <WrapUserComponent render={() => <PostList />} />;
}
