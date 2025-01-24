"use client";

import { kClientPaths } from "@/src/lib/clientHelpers/clientPaths.js";
import { useAppSession } from "@/src/lib/clientHooks/userHooks.js";
import { UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.js";

export function UserMenu() {
  const router = useRouter();
  const { status } = useAppSession();

  if (status !== "authenticated") {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="icon">
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* <DropdownMenuItem
          onSelect={() => {
            router.push(kClientPaths.app.profile);
          }}
        >
          Profile
        </DropdownMenuItem> */}
        <DropdownMenuItem
          onSelect={() => {
            signOut();
            router.push(kClientPaths.index);
          }}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
