import useSWR from "swr";
import { useAppSession } from "../clientHooks/userHooks.js";
import { handleResponse } from "./utils.js";
import { IGetUserEndpointResponse } from "@/src/definitions/user.js";

export const kApiUserSWRKeys = {
  getUserKey: `/api/user`,
};

async function getUser(url: string) {
  const response = await fetch(url, {
    method: "GET",
  });

  return await handleResponse<IGetUserEndpointResponse>(response);
}

export function useGetUser() {
  const { userId } = useAppSession();
  const { data, error, isLoading, mutate, isValidating } = useSWR(
    userId ? kApiUserSWRKeys.getUserKey : null,
    getUser
  );

  return { data, error, isLoading, mutate, isValidating };
}
