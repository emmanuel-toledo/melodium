export function AuthLoading() {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 py-10 text-sm text-muted-foreground"
    >
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
      Comprobando tu sesión…
    </div>
  );
}
