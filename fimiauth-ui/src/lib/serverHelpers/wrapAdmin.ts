import { NextAuthRequest, auth } from "@/auth.js";
import assert from "assert";
import { AnyFn, AnyObject } from "softkave-js-utils";
import { OwnServerError } from "../common/error.js";
import { assertCheckIsAdminEmail } from "./isAdmin.js";
import { IRouteContext, wrapRoute } from "./wrapRoute.js";

export const wrapAdmin = (
  routeFn: AnyFn<[NextAuthRequest, IRouteContext], Promise<AnyObject | void>>
) =>
  auth(
    wrapRoute((req: NextAuthRequest, ctx: IRouteContext) => {
      assert.ok(req.auth, new OwnServerError("Unauthorized", 401));
      assert.ok(
        req.auth.user?.email,
        new OwnServerError("User email is required", 401)
      );
      assertCheckIsAdminEmail(req.auth.user.email);
      return routeFn(req, ctx);
    })
  );
