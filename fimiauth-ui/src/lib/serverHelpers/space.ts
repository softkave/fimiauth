export async function isCollaboratorInSpace(params: {
  spaceId: string;
  providedId: string;
}) {
  const space = await assertGetSpace(params.spaceId);
}
