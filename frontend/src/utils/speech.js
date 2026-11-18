export { LANGUAGE_CODES } from '../store'

export const getSpeechRecognition = () =>
  typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition || null)
    : null

export const speakText = (text, language) =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis is not supported in this browser'))
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = LANGUAGE_CODES[language]?.speechCode || 'en-US'
    utterance.onend = () => resolve(true)
    utterance.onerror = () => reject(new Error('Speech synthesis failed'))
    window.speechSynthesis.speak(utterance)
  })
