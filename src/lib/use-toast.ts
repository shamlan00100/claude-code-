import { useEffect, useState } from 'react'

/** A message that clears itself after four seconds. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [message])
  return [message, setMessage] as const
}
