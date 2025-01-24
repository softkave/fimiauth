import { NextAuthRequest, auth } from "@/auth";
import assert from "assert";
import { Session } from "next-auth";
import { AnyFn, AnyObject } from "softkave-js-utils";
import { OwnServerError } from "../common/error.js";
import { IRouteContext, wrapRoute } from "./wrapRoute.js";

export interface IAuthenticatedRequest {
  session: Session;
  userId: string;
  email: string;
  user: Session["user"];
}

export const wrapAuthenticated = (
  routeFn: AnyFn<
    [NextAuthRequest, IRouteContext, IAuthenticatedRequest],
    Promise<void | AnyObject>
  >
) =>
  auth(
    wrapRoute(async (req: NextAuthRequest, ctx: IRouteContext) => {
      assert.ok(req.auth, new OwnServerError("Unauthorized", 401));
      const session = req.auth;
      assert.ok(session, new OwnServerError("Unauthorized", 401));
      assert.ok(session.user, new OwnServerError("Unauthorized", 401));
      assert.ok(session.user.id, new OwnServerError("Unauthorized", 401));
      assert.ok(session.user.email, new OwnServerError("Unauthorized", 401));

      return routeFn(req, ctx, {
        session,
        userId: session.user.id,
        email: session.user.email,
        user: session.user,
      });
    })
  );
