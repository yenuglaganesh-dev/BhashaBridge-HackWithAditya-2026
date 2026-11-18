import { LANGUAGE_CODES } from '../store'
import { useDispatch, useSelector } from 'react-redux'
import { setLanguage } from '../store'

const languageEntries = [LANGUAGE_CODES.telugu, LANGUAGE_CODES.hindi, LANGUAGE_CODES.english]

export default function LanguageSelector() {
  const dispatch = useDispatch()
  const language = useSelector((state) => state.language.current)

  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xl shadow-violet-100/60 sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">Language</h2>
      <p className="mt-1 text-sm text-slate-500">Choose how the assistant should respond.</p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {languageEntries.map((lang) => {
          const selected = language === lang.code
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => dispatch(setLanguage(lang.code))}
              className={`flex flex-col items-center gap-1 rounded-2xl border px-4 py-4 text-center transition-all duration-200 ${
                selected
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100'
                  : 'border-violet-100 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50/60'
              }`}
            >
              <span className="text-2xl">{lang.nativeName}</span>
              <span className="text-xs font-semibold">{lang.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
