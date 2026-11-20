function focusAlert(element: HTMLDivElement | null) {
  element?.focus();
}

interface AuthAlertProps {
  message?: string | null;
}

export function AuthAlert({ message }: AuthAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      ref={focusAlert}
      role="alert"
      tabIndex={-1}
      className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/20"
    >
      {message}
    </div>
  );
}
