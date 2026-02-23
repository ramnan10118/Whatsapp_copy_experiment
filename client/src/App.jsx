import { useState } from 'react'
import CopyForm from './components/CopyForm'
import VariantCard from './components/VariantCard'
import RulesPanel from './components/RulesPanel'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-3xl">💬</span>
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Ready to generate</h3>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        Fill in the campaign details on the left and click Generate Variants to see your WhatsApp copy here.
      </p>
    </div>
  )
}

function LoadingState({ count }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-gray-600">Generating {count} variants…</p>
      <p className="text-xs text-gray-400 mt-1">Usually takes 5–10 seconds</p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mx-2">
      <p className="text-sm font-semibold text-red-700 mb-1">Generation failed</p>
      <p className="text-sm text-red-500">{message}</p>
    </div>
  )
}

export default function App() {
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [variantCount, setVariantCount] = useState(3)

  const handleGenerate = async (formData) => {
    setLoading(true)
    setError(null)
    setVariants([])
    setVariantCount(parseInt(formData.variantCount) || 3)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Generation failed')
      setVariants(data.variants)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FF5C00] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">WhatsApp Copy Generator</h1>
              <p className="text-xs text-gray-400">ACKO Drive · GPT-4o</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">
            Edit rules in <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">server/rules/</code> and <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">server/data/</code>
          </span>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 items-start">

          {/* Left column — Form + Rules Panel */}
          <div className="w-80 xl:w-96 flex-shrink-0 sticky top-24 space-y-4">
            <CopyForm onGenerate={handleGenerate} loading={loading} />
            <RulesPanel />
          </div>

          {/* Right column — Variants */}
          <div className="flex-1 min-w-0">
            {loading && <LoadingState count={variantCount} />}
            {!loading && error && <ErrorState message={error} />}
            {!loading && !error && variants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {variants.length} variant{variants.length !== 1 ? 's' : ''} generated
                  </p>
                </div>
                <div className="space-y-4">
                  {variants.map((v) => (
                    <VariantCard key={v.variant_number} variant={v} />
                  ))}
                </div>
              </div>
            )}
            {!loading && !error && variants.length === 0 && <EmptyState />}
          </div>

        </div>
      </main>
    </div>
  )
}
