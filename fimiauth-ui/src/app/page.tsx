import { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInContainer } from "../components/account/sign-in-container.js";
import { kAppConstants } from "../definitions/appConstants.js";
import { kClientPaths } from "../lib/clientHelpers/clientPaths.js";
import { auth } from "@/auth";
import { JSX } from "react";

export const metadata: Metadata = {
  title: kAppConstants.name,
  description: kAppConstants.description,
};

export default async function Page(): Promise<JSX.Element> {
  const session = await auth();
  if (session) {
    return redirect(kClientPaths.withURL(kClientPaths.app.index));
  }

  return <SignInContainer />;
}
