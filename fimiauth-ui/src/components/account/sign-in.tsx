import { kClientPaths } from "@/src/lib/clientHelpers/clientPaths.js";
import { Button } from "../ui/button.js";
import { signIn } from "@/auth.js";

export interface ISignInProps {
  redirectTo?: string;
}

export default function SignIn({ redirectTo }: ISignInProps) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", {
          redirectTo: kClientPaths.withURL(
            redirectTo ?? kClientPaths.app.index
          ),
        });
      }}
    >
      <Button type="submit" variant="outline">
        Sign-in with Google
      </Button>
    </form>
  );
}
