import { kAppConstants } from "@/src/definitions/appConstants.js";
import { kClientPaths } from "@/src/lib/clientHelpers/clientPaths.js";
import { cn } from "@/src/lib/utils.js";
import Link from "next/link";
import { UserMenu } from "./user-menu.js";

export interface IAppHeaderProps {
  className?: string;
}

export function AppHeader(props: IAppHeaderProps) {
  return (
    <div
      className={cn("flex justify-between p-4 items-center", props.className)}
    >
      <div className="text-2xl font-bold">
        <Link href={kClientPaths.app.index}>{kAppConstants.name}</Link>
      </div>
      <UserMenu />
    </div>
  );
}
