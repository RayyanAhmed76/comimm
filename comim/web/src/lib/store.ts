import { useSyncExternalStore } from 'react'

/**
 * Tiny persistent store for the POC demo data (localStorage-backed).
 * Every screen that edits demo data writes through one of these so that
 * changes made on one side (e.g. teacher) are visible on the other (e.g. student).
 */
const PREFIX = 'comim:v2:'
const registry: { reset: () => void }[] = []

export function createStore<T>(key: string, initial: () => T) {
  const storageKey = PREFIX + key
  let state: T
  try {
    const raw = localStorage.getItem(storageKey)
    state = raw ? (JSON.parse(raw) as T) : initial()
  } catch {
    state = initial()
  }
  const listeners = new Set<() => void>()

  const get = () => state
  const set = (next: T | ((prev: T) => T)) => {
    state = typeof next === 'function' ? (next as (p: T) => T)(state) : next
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      /* storage full or unavailable — keep in memory */
    }
    listeners.forEach((l) => l())
  }
  const subscribe = (l: () => void) => {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }
  const reset = () => set(initial())
  const use = () => useSyncExternalStore(subscribe, get, get)

  const store = { get, set, subscribe, use, reset }
  registry.push(store)
  return store
}

/** Restore every demo store to its seed data. */
export function resetAllStores() {
  registry.forEach((s) => s.reset())
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}
