import { useState } from 'react'

const RULE_LABELS = {
  brandVoice: 'Brand Voice',
  playbook: 'CTR Playbook',
  dosAndDonts: "Dos & Don'ts",
  trainingExamples: 'Training Examples',
}

function SaveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function RulesPanel() {
  const [open, setOpen] = useState(false)
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('brandVoice')
  const [saving, setSaving] = useState(false)
  const [savedTab, setSavedTab] = useState(null)
  const [saveError, setSaveError] = useState(null)

  const handleToggle = async () => {
    if (!open && !rules) {
      setLoading(true)
      try {
        const res = await fetch('/api/rules')
        const data = await res.json()
        setRules(data.rules)
      } catch {
        setRules({ error: 'Failed to load rules' })
      } finally {
        setLoading(false)
      }
    }
    setOpen((prev) => !prev)
  }

  const handleEdit = (key, value) => {
    setRules((prev) => ({ ...prev, [key]: value }))
    setSaveError(null)
  }

  const handleSave = async (key) => {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/rules/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: rules[key] }),
      })
      let data = {}
      const text = await res.text()
      if (text) data = JSON.parse(text)

      if (data.hosted) {
        setSaveError('hosted')
        return
      }
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setSavedTab(key)
      setTimeout(() => setSavedTab(null), 2500)
    } catch (err) {
      if (err.message !== 'hosted') setSaveError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const tabs = rules && !rules.error
    ? Object.keys(RULE_LABELS).filter((k) => rules[k] !== undefined)
    : []

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <span>Edit Rules</span>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {loading && (
            <div className="px-5 py-4">
              <p className="text-xs text-gray-400">Loading rules…</p>
            </div>
          )}

          {rules?.error && (
            <div className="px-5 py-4">
              <p className="text-xs text-red-400">{rules.error}</p>
            </div>
          )}

          {rules && !rules.error && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-100 px-2 overflow-x-auto">
                {tabs.map((key) => (
                  <button
                    key={key}
                    onClick={() => { setActiveTab(key); setSaveError(null) }}
                    className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                      activeTab === key
                        ? 'text-[#FF5C00] border-[#FF5C00]'
                        : 'text-gray-400 border-transparent hover:text-gray-600'
                    }`}
                  >
                    {RULE_LABELS[key]}
                    {savedTab === key && (
                      <span className="ml-1.5 text-green-500">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Editable textarea */}
              <div className="px-4 pt-3 pb-2">
                <textarea
                  value={rules[activeTab] || ''}
                  onChange={(e) => handleEdit(activeTab, e.target.value)}
                  className="w-full text-xs text-gray-700 leading-relaxed font-mono border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none scrollbar-thin"
                  rows={12}
                  spellCheck={false}
                />
              </div>

              {/* Save button + status */}
              <div className="px-4 pb-4 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400 leading-snug">
                  Changes apply on the next generation.
                </p>
                <button
                  onClick={() => handleSave(activeTab)}
                  disabled={saving}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex-shrink-0 ${
                    savedTab === activeTab
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-[#FF5C00] text-white border-transparent hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200'
                  }`}
                >
                  {savedTab === activeTab ? <CheckIcon /> : <SaveIcon />}
                  {saving ? 'Saving…' : savedTab === activeTab ? 'Saved!' : 'Save Changes'}
                </button>
              </div>

              {saveError && (
                <div className="px-4 pb-3">
                  {saveError === 'hosted' ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-800 mb-1">Editing disabled in hosted version</p>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Edit the <code className="bg-amber-100 px-1 rounded">.md</code> files directly in your{' '}
                        <a
                          href="https://github.com/ramnan10118/Whatsapp_copy_experiment/tree/main/server"
                          target="_blank"
                          rel="noreferrer"
                          className="underline font-medium"
                        >
                          GitHub repo
                        </a>
                        {' '}— Vercel will redeploy automatically with the updated rules.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-red-500">{saveError}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
