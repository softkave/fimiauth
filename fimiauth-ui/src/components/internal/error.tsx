export function PageError(props: { error: unknown }) {
  const message =
    (props.error as Error | undefined)?.message || "An error occurred";

  return (
    <div className="py-8 px-4">
      <h3 className="text-2xl font-bold">Error</h3>
      <p>{message}</p>
    </div>
  );
}
