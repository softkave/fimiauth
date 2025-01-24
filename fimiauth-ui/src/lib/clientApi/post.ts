import { convertToArray } from "softkave-js-utils";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { z } from "zod";
import { kApiPostSWRKeys } from "./keys.js";
import {
  handleResponse,
  IUseMutationHandlerOpts,
  useMutationHandler,
} from "./utils.js";
import {
  addPostSchema,
  IAddPostEndpointResponse,
  updatePostSchema,
  IUpdatePostEndpointResponse,
  IGetPostEndpointResponse,
  getPostsSchema,
  IGetPostsEndpointResponse,
  countPostsSchema,
  ICountPostsEndpointResponse,
} from "@/src/definitions/post.js";

async function addPost(
  url: string,
  params: {
    arg: z.infer<typeof addPostSchema>;
  }
) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(params.arg),
  });

  return await handleResponse<IAddPostEndpointResponse>(res);
}

export type AddPostOnSuccessParams = [
  params: Parameters<typeof addPost>,
  res: Awaited<ReturnType<typeof addPost>>
];

export function useAddPost(opts: IUseMutationHandlerOpts<typeof addPost> = {}) {
  const mutationHandler = useMutationHandler(addPost, {
    ...opts,
    invalidate: [
      kApiPostSWRKeys.fetchPosts,
      ...convertToArray(opts.invalidate || []),
    ],
  });

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    kApiPostSWRKeys.addPost,
    mutationHandler
  );

  return { trigger, data, error, isMutating, reset };
}

async function deletePost(url: string) {
  const res = await fetch(url, {
    method: "DELETE",
  });

  return await handleResponse(res);
}

export function useDeletePost(
  opts: IUseMutationHandlerOpts & { postId: string }
) {
  const mutationHandler = useMutationHandler(deletePost, {
    ...opts,
    invalidate: [
      kApiPostSWRKeys.fetchPosts,
      kApiPostSWRKeys.fetchPost(opts.postId),
      ...convertToArray(opts.invalidate || []),
    ],
  });

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    kApiPostSWRKeys.deletePost(opts.postId),
    mutationHandler
  );

  return { trigger, data, error, isMutating, reset };
}

async function updatePost(
  url: string,
  params: {
    arg: z.infer<typeof updatePostSchema>;
  }
) {
  const res = await fetch(url, {
    method: "PATCH",
    body: JSON.stringify(params.arg),
  });

  return await handleResponse<IUpdatePostEndpointResponse>(res);
}

export type UpdatePostOnSuccessParams = [
  params: Parameters<typeof updatePost>,
  res: Awaited<ReturnType<typeof updatePost>>
];

export function useUpdatePost(
  opts: IUseMutationHandlerOpts<typeof updatePost> & { postId: string }
) {
  const mutationHandler = useMutationHandler(updatePost, {
    ...opts,
    invalidate: [
      kApiPostSWRKeys.fetchPost(opts.postId),
      ...convertToArray(opts.invalidate || []),
    ],
  });

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    kApiPostSWRKeys.updatePost(opts.postId),
    mutationHandler
  );

  return { trigger, data, error, isMutating, reset };
}

async function getPost(url: string) {
  const res = await fetch(url, {
    method: "GET",
  });

  return await handleResponse<IGetPostEndpointResponse>(res);
}

export function useGetPost(opts: { postId: string }) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    kApiPostSWRKeys.fetchPost(opts.postId),
    getPost
  );

  return { data, error, isLoading, isValidating, mutate };
}

async function getPosts(url: string, arg: z.infer<typeof getPostsSchema>) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  });

  return await handleResponse<IGetPostsEndpointResponse>(res);
}

export function useGetPosts(params: { arg: z.infer<typeof getPostsSchema> }) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    params.arg ? [kApiPostSWRKeys.fetchPosts, params.arg] : null,
    getPosts
  );

  return { data, error, isLoading, isValidating, mutate };
}

async function countPosts(url: string, arg: z.infer<typeof countPostsSchema>) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  });

  return await handleResponse<ICountPostsEndpointResponse>(res);
}

export function useCountPosts(params: {
  arg: z.infer<typeof countPostsSchema>;
}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    params.arg ? [kApiPostSWRKeys.countPosts, params.arg] : null,
    countPosts
  );

  return { data, error, isLoading, isValidating, mutate };
}
