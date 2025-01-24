"use client";

import { IUser } from "@/src/definitions/user.js";
import { kClientPaths } from "@/src/lib/clientHelpers/clientPaths.js";
import { useAppSession } from "@/src/lib/clientHooks/userHooks.js";
import assert from "assert";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";
import { PageError } from "../internal/error.js";
import { PageLoading } from "../internal/loading.js";

interface IWrapUserComponentProps {
  render?: React.ReactNode | ((user: IUser) => React.ReactNode);
  children?: React.ReactNode;
}

export function WrapUserComponent({
  render,
  children,
}: IWrapUserComponentProps) {
  const { status, user } = useAppSession();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect(kClientPaths.withURL(kClientPaths.signinWithRedirect(pathname)));
    }
  }, [status, pathname]);

  if (status === "loading") {
    return <PageLoading />;
  } else if (status === "unauthenticated") {
    return <PageError error={new Error("Unauthorized. Redirecting...")} />;
  }

  assert(user, "User is not authenticated");

  const content =
    children || (typeof render === "function" ? render(user) : render);
  return <>{content}</>;
}
