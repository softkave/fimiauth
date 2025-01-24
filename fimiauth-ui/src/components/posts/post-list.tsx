import { IPost, getPostsSchema } from "@/src/definitions/post.js";
import {
  useAddPost,
  useCountPosts,
  useGetPosts,
} from "@/src/lib/clientApi/post.js";
import { kClientPaths } from "@/src/lib/clientHelpers/clientPaths.js";
import { Loader2Icon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation.js";
import { generate } from "random-words";
import { useMemo, useState } from "react";
import { convertToArray } from "softkave-js-utils";
import { z } from "zod";
import { AppHeader } from "../internal/app-header.jsx";
import ListPagination from "../internal/list-pagination.jsx";
import { WrapLoader } from "../internal/wrap-loader.jsx";
import { Button } from "../ui/button.jsx";

function PostItem(props: { post: IPost }) {
  const { post } = props;

  return (
    <div className="flex gap-4 items-center">
      <Link
        href={kClientPaths.app.posts.single(post.id)}
        className="flex flex-col flex-1"
      >
        <div className="text-lg">{post.title}</div>
      </Link>
    </div>
  );
}

export function PostList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const args = useMemo(
    (): z.infer<typeof getPostsSchema> => ({ page, pageSize }),
    [page, pageSize]
  );
  const postHooks = useGetPosts({ arg: args });
  const countPostHooks = useCountPosts({ arg: args });
  const addPostHook = useAddPost();

  const handleAddPost = async () => {
    const date = new Date();
    const title = `${convertToArray(generate({ min: 2, max: 2 })).join(
      " "
    )} - ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    const post = await addPostHook.trigger({ title });
    router.push(kClientPaths.app.posts.single(post.id));
  };

  return (
    <div>
      <AppHeader />
      <div className="flex flex-col items-center justify-center">
        <div className="flex p-4 w-full max-w-md">
          <h2 className="text-xl font-bold flex-1">POSTS</h2>
          <Button
            onClick={handleAddPost}
            variant="outline"
            disabled={addPostHook.isMutating}
          >
            {addPostHook.isMutating ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <PlusIcon className="w-4 h-4" />
            )}
            New Post
          </Button>
        </div>
        <WrapLoader
          isLoading={postHooks.isLoading}
          error={postHooks.error}
          data={postHooks.data}
          render={(data) => (
            <div className="flex p-4 w-full max-w-md flex-col gap-4">
              {data.posts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          )}
        />
        <WrapLoader
          isLoading={countPostHooks.isLoading}
          error={countPostHooks.error}
          data={countPostHooks.data}
          render={(data) => (
            <ListPagination
              count={data.total}
              page={page}
              pageSize={pageSize}
              disabled={postHooks.isLoading}
              setPage={setPage}
              setPageSize={setPageSize}
            />
          )}
        />
      </div>
    </div>
  );
}
