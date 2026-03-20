import { useStore } from '../../../store/useStore'
import { CATEGORIES } from '../../../assets/mockData'

const CATEGORY_META = {
  Tech:    { emoji: '💻', desc: 'AI, programming, gadgets' },
  Sports:  { emoji: '⚽', desc: 'Football, NBA, F1 and more' },
  Music:   { emoji: '🎵', desc: 'Albums, artists, festivals' },
  Finance: { emoji: '📈', desc: 'Stocks, crypto, economy' },
  Gaming:  { emoji: '🎮', desc: 'Games, consoles, esports' },
  Art:     { emoji: '🎨', desc: 'Digital, traditional, street' },
}

export default function InterestSetup({ onDone }) {
  const { userInterests, setUserInterests } = useStore()

  function toggle(cat) {
    setUserInterests(
      userInterests.includes(cat)
        ? userInterests.filter(c => c !== cat)
        : [...userInterests, cat]
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 space-y-6">

        <div className="text-center space-y-2">
          <div className="text-4xl">🔥</div>
          <h2 className="text-2xl font-bold text-gray-900">What are you into?</h2>
          <p className="text-sm text-gray-500">Pick your interests to personalize your Hot Topics feed</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat]
            const selected = userInterests.includes(cat)
            return (
              <button
                key={cat}
                onClick={() => toggle(cat)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  selected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{meta.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{cat}</p>
                  <p className="text-xs text-gray-400">{meta.desc}</p>
                </div>
                {selected && <span className="ml-auto text-blue-500">✓</span>}
              </button>
            )
          })}
        </div>

        <button
          onClick={onDone}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
        >
          {userInterests.length === 0
            ? 'Skip — show me everything'
            : `Continue with ${userInterests.length} interest${userInterests.length > 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  )
}