import { AppHeader } from "../internal/app-header.js";
import SignIn from "./sign-in.js";

export interface ISignInContainerProps {
  redirectTo?: string;
}

export function SignInContainer({ redirectTo }: ISignInContainerProps) {
  return (
    <main className="flex flex-col h-screen">
      <AppHeader />
      <div className="flex items-center justify-items-start flex-1 px-4 m-auto">
        <SignIn redirectTo={redirectTo} />
      </div>
    </main>
  );
}
