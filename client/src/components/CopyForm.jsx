import { useState } from 'react'

const CAMPAIGN_SUGGESTIONS = [
  'Car Drop Contest',
  'Service Reminder',
  'Renewal Reminder',
  'New Feature Launch',
  'Offer / Discount',
  'Policy Expiry Alert',
  'Post-service Follow-up',
  'Upsell / Add-on',
]

const TONE_OPTIONS = [
  { value: 'auto', label: 'Auto — let AI decide' },
  { value: 'direct_claim', label: 'Direct Claim' },
  { value: 'exclusivity', label: 'Exclusivity (for ACKO users)' },
  { value: 'curiosity', label: 'Curiosity' },
  { value: 'urgency', label: 'Urgency' },
  { value: 'safety_anxiety', label: 'Safety / Anxiety' },
  { value: 'premium', label: 'Premium' },
  { value: 'friendly', label: 'Friendly / Conversational' },
]

function Label({ children, optional }) {
  return (
    <label className="block text-xs font-medium text-gray-600 mb-1.5">
      {children}
      {optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
    </label>
  )
}

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow placeholder:text-gray-300'

export default function CopyForm({ onGenerate, loading }) {
  const [form, setForm] = useState({
    campaignType: '',
    audience: '',
    keyMessage: '',
    tone: 'auto',
    variantCount: '3',
    additionalContext: '',
  })

  const isValid = form.campaignType.trim() && form.audience.trim() && form.keyMessage.trim()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid) return
    onGenerate(form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-sm font-bold text-gray-900 mb-5">Campaign Details</h2>

      {/* Campaign Type */}
      <div className="mb-4">
        <Label>Campaign Type</Label>
        <input
          type="text"
          name="campaignType"
          value={form.campaignType}
          onChange={handleChange}
          placeholder="e.g. Car Drop Contest"
          list="campaign-suggestions"
          className={inputClass}
          required
        />
        <datalist id="campaign-suggestions">
          {CAMPAIGN_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      {/* Audience */}
      <div className="mb-4">
        <Label>Audience Segment</Label>
        <input
          type="text"
          name="audience"
          value={form.audience}
          onChange={handleChange}
          placeholder="e.g. Existing car insurance policyholders, Mumbai"
          className={inputClass}
          required
        />
      </div>

      {/* Key Message */}
      <div className="mb-4">
        <Label>Key Message / Offer</Label>
        <textarea
          name="keyMessage"
          value={form.keyMessage}
          onChange={handleChange}
          placeholder="e.g. Win a free car by wishlisting 3 cars on ACKO Drive. Free pickup & drop. Just ₹2,999."
          rows={3}
          className={`${inputClass} resize-none`}
          required
        />
      </div>

      {/* Tone + Variant Count */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Label>Tone</Label>
          <select
            name="tone"
            value={form.tone}
            onChange={handleChange}
            className={`${inputClass} bg-white`}
          >
            {TONE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <Label>Variants</Label>
          <select
            name="variantCount"
            value={form.variantCount}
            onChange={handleChange}
            className={`${inputClass} bg-white`}
          >
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} variants</option>
            ))}
          </select>
        </div>
      </div>

      {/* Additional Context */}
      <div className="mb-5">
        <Label optional>Additional Context</Label>
        <textarea
          name="additionalContext"
          value={form.additionalContext}
          onChange={handleChange}
          placeholder="Landing page, T&Cs, specific phrases to include, launch date…"
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full py-3 bg-[#FF5C00] hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-100 disabled:text-gray-300 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? 'Generating…' : 'Generate Variants'}
      </button>
    </form>
  )
}
