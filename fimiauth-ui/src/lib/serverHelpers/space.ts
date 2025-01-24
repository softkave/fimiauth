import { kSpaceType } from "@/src/definitions/space.js";

export function cleanSpaceInput(params: {
  spaceId?: string;
  workspaceId: string;
}) {
  if (params.spaceId) {
    return {
      spaceId: params.spaceId,
      spaceType: kSpaceType.external,
    };
  }

  return {
    spaceId: params.workspaceId,
    spaceType: kSpaceType.workspace,
  };
}
