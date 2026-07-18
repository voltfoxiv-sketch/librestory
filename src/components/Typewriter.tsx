import { useState, useEffect } from 'react'

const PHRASES = [
  "Your Way.",
  "Unchained.",
  "Zero Config.",
  "Your World.",
  "One Click.",
  "No Install.",
  "The Easy Way."
]

export default function Typewriter() {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false) // toggle for backspace animation

  useEffect(() => {
    const phrase = PHRASES[index]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(phrase.substring(0, text.length + 1))

        if (text.length === phrase.length) {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        setText(phrase.substring(0, text.length - 1))

        if (text.length === 0) {
          setIsDeleting(false)
          setIndex((index + 1) % PHRASES.length)
        }
      }
    }, isDeleting ? 40 : 100)

    return () => clearTimeout(timeout)
  }, [text, isDeleting, index])

  return (
    <span className="text-orange-600 relative inline-flex items-center">
      {text}
      <span className="animate-pulse ml-1 text-orange-500 font-light">|</span>
    </span>
  )
}
