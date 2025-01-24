import { auth } from "@/auth";
import { SignInContainerClient } from "@/src/components/account/sign-in-container-client.jsx";
import { kAppConstants } from "@/src/definitions/appConstants.js";
import { kClientPaths } from "@/src/lib/clientHelpers/clientPaths.js";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { JSX } from "react";

export const metadata: Metadata = {
  title: kAppConstants.name,
  description: "Sign in to write",
};

export default async function SigninPage(): Promise<JSX.Element> {
  const session = await auth();
  if (session) {
    return redirect(kClientPaths.withURL(kClientPaths.app.index));
  }

  return <SignInContainerClient />;
}
