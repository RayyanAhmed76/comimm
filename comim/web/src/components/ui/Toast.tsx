import { useSyncExternalStore } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'

type ToastItem = { id: number; text: string; tone: 'ok' | 'warn' }

let items: ToastItem[] = []
let next = 1
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** Short confirmation shown at the bottom of the page ("Settings saved"…). */
export function toast(text: string, tone: ToastItem['tone'] = 'ok') {
  const id = next++
  items = [...items, { id, text, tone }]
  emit()
  window.setTimeout(() => {
    items = items.filter((x) => x.id !== id)
    emit()
  }, 3200)
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => items, () => items)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
      {list.map((x) => (
        <div
          key={x.id}
          className={cn(
            'pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-xl ring-1',
            x.tone === 'ok' ? 'bg-navy-900 text-white ring-white/10' : 'bg-orange-50 text-orange-900 ring-orange-200',
          )}
        >
          {x.tone === 'ok' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4" />}
          {x.text}
        </div>
      ))}
    </div>
  )
}
