import { useState } from 'react'

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

const HOOK_COLORS = {
  'direct claim': 'bg-green-50 text-green-700 border-green-100',
  'exclusivity': 'bg-blue-50 text-blue-700 border-blue-100',
  'curiosity': 'bg-purple-50 text-purple-700 border-purple-100',
  'urgency': 'bg-red-50 text-red-700 border-red-100',
  'safety': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'premium': 'bg-gray-100 text-gray-700 border-gray-200',
}

function getHookColor(strategy) {
  if (!strategy) return 'bg-gray-100 text-gray-600 border-gray-200'
  const lower = strategy.toLowerCase()
  for (const [key, cls] of Object.entries(HOOK_COLORS)) {
    if (lower.includes(key)) return cls
  }
  return 'bg-orange-50 text-orange-700 border-orange-100'
}

export default function VariantCard({ variant }) {
  const [copied, setCopied] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)

  const plainTextMessage = `*${variant.header}*\n${variant.body}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainTextMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = plainTextMessage
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Card header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#FF5C00] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
            Variant {variant.variant_number}
          </span>
          {variant.hook_strategy && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getHookColor(variant.hook_strategy)}`}>
              {variant.hook_strategy}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
            copied
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* WhatsApp-style preview */}
      <div className="px-5 py-4 bg-[#ECE5DD]">
        <div className="max-w-sm">
          {/* Message bubble */}
          <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 relative">
            {/* WhatsApp-style sender dot */}
            <div className="absolute -top-px -left-[6px] w-3 h-3 bg-white" style={{
              clipPath: 'polygon(100% 0, 100% 100%, 0 0)'
            }} />

            {variant.header && (
              <p className="text-sm font-bold text-gray-900 mb-1.5 leading-snug">
                {variant.header}
              </p>
            )}
            {variant.body && (
              <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                {variant.body}
              </p>
            )}

            {/* Timestamp */}
            <div className="flex justify-end mt-1.5">
              <span className="text-[10px] text-gray-400">now ✓✓</span>
            </div>
          </div>

          {/* CTA button (WhatsApp-style) */}
          {variant.cta && (
            <div className="mt-0.5 bg-white rounded-xl shadow-sm">
              <button className="w-full py-2.5 text-sm font-medium text-[#03A9F4] border-t border-gray-100 flex items-center justify-center gap-1.5">
                <span className="text-xs">↗</span>
                {variant.cta}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reasoning toggle */}
      {variant.reasoning && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="w-full flex items-center justify-between px-5 py-3 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>Why this should work</span>
            <ChevronIcon open={showReasoning} />
          </button>
          {showReasoning && (
            <div className="px-5 pb-4">
              <p className="text-xs text-gray-600 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-100">
                {variant.reasoning}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
