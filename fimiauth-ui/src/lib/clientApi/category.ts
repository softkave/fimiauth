import {
  addPostCategorySchema,
  countPostCategoriesSchema,
  getPostCategoriesSchema,
  IAddPostCategoryEndpointResponse,
  ICountPostCategoriesEndpointResponse,
  IGetPostCategoriesEndpointResponse,
  IGetPostCategoryEndpointResponse,
  IUpdatePostCategoryEndpointResponse,
  updatePostCategorySchema,
} from "@/src/definitions/post.js";
import { convertToArray } from "softkave-js-utils";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { z } from "zod";
import { kApiPostCategorySWRKeys } from "./keys.js";
import {
  handleResponse,
  IUseMutationHandlerOpts,
  useMutationHandler,
} from "./utils.js";

async function addCategory(
  url: string,
  params: {
    arg: z.infer<typeof addPostCategorySchema>;
  }
) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(params.arg),
  });

  return await handleResponse<IAddPostCategoryEndpointResponse>(res);
}

export type AddCategoryOnSuccessParams = [
  params: Parameters<typeof addCategory>,
  res: Awaited<ReturnType<typeof addCategory>>
];

export function useAddCategory(
  opts: IUseMutationHandlerOpts<typeof addCategory> = {}
) {
  const mutationHandler = useMutationHandler(addCategory, {
    ...opts,
    invalidate: [
      kApiPostCategorySWRKeys.fetchPostCategories,
      ...convertToArray(opts.invalidate || []),
    ],
  });

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    kApiPostCategorySWRKeys.addPostCategory,
    mutationHandler
  );

  return { trigger, data, error, isMutating, reset };
}

async function deleteCategory(url: string) {
  const res = await fetch(url, {
    method: "DELETE",
  });

  return await handleResponse(res);
}

export function useDeleteCategory(
  opts: IUseMutationHandlerOpts & { categoryId: string }
) {
  const mutationHandler = useMutationHandler(deleteCategory, {
    ...opts,
    invalidate: [
      kApiPostCategorySWRKeys.fetchPostCategories,
      kApiPostCategorySWRKeys.fetchPostCategory(opts.categoryId),
      ...convertToArray(opts.invalidate || []),
    ],
  });

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    kApiPostCategorySWRKeys.deletePostCategory(opts.categoryId),
    mutationHandler
  );

  return { trigger, data, error, isMutating, reset };
}

async function updateCategory(
  url: string,
  params: {
    arg: z.infer<typeof updatePostCategorySchema>;
  }
) {
  const res = await fetch(url, {
    method: "PATCH",
    body: JSON.stringify(params.arg),
  });

  return await handleResponse<IUpdatePostCategoryEndpointResponse>(res);
}

export type UpdateCategoryOnSuccessParams = [
  params: Parameters<typeof updateCategory>,
  res: Awaited<ReturnType<typeof updateCategory>>
];

export function useUpdateCategory(
  opts: IUseMutationHandlerOpts<typeof updateCategory> & { categoryId: string }
) {
  const mutationHandler = useMutationHandler(updateCategory, {
    ...opts,
    invalidate: [
      kApiPostCategorySWRKeys.fetchPostCategories,
      kApiPostCategorySWRKeys.fetchPostCategory(opts.categoryId),
      ...convertToArray(opts.invalidate || []),
    ],
  });

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    kApiPostCategorySWRKeys.updatePostCategory(opts.categoryId),
    mutationHandler
  );

  return { trigger, data, error, isMutating, reset };
}

async function getCategory(url: string) {
  const res = await fetch(url, {
    method: "GET",
  });

  return await handleResponse<IGetPostCategoryEndpointResponse>(res);
}

export function useGetCategory(opts: { categoryId: string }) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    kApiPostCategorySWRKeys.fetchPostCategory(opts.categoryId),
    getCategory
  );

  return { data, error, isLoading, isValidating, mutate };
}

async function getCategories(
  url: string,
  arg: z.infer<typeof getPostCategoriesSchema>
) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  });

  return await handleResponse<IGetPostCategoriesEndpointResponse>(res);
}

export function useGetCategories(params: {
  arg: z.infer<typeof getPostCategoriesSchema>;
}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    params.arg
      ? [kApiPostCategorySWRKeys.fetchPostCategories, params.arg]
      : null,
    getCategories
  );

  return { data, error, isLoading, isValidating, mutate };
}

async function countCategories(
  url: string,
  arg: z.infer<typeof countPostCategoriesSchema>
) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  });

  return await handleResponse<ICountPostCategoriesEndpointResponse>(res);
}

export function useCountCategories(params: {
  arg: z.infer<typeof countPostCategoriesSchema>;
}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    params.arg
      ? [kApiPostCategorySWRKeys.countPostCategories, params.arg]
      : null,
    countCategories
  );

  return { data, error, isLoading, isValidating, mutate };
}
