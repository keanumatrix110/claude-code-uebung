import { useToastStore } from '@renderer/state/toastStore'

export function ToastStack(): JSX.Element {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`banner ${toast.type === 'error' ? 'banner-error' : 'banner-success'}`}
          onClick={() => dismiss(toast.id)}
          role="alert"
        >
          {toast.type === 'error' ? '⚠' : '✓'} {toast.message}
        </div>
      ))}
    </div>
  )
}
