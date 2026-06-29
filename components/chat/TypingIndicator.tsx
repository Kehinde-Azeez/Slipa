/**
 * components/chat/TypingIndicator.tsx
 * Three animated dots shown while the AI is responding.
 * Animation defined in tokens/motion.css (.typing-dot keyframes).
 * Never show a blank state while AI is responding.
 */

'use client'

export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 px-4 py-3"
      role="status"
      aria-label="SLIPA is thinking..."
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot w-2 h-2 rounded-full bg-text-muted"
          style={{ '--i': i } as React.CSSProperties}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
