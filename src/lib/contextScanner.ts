// quick token est (roughly 4 chars/token). good enough for what we need here
export const estimateTokens = (text: string) => Math.ceil(text.length / 4)

import type { StoryBlock, StoryCard } from '../store/engineStore'

export const getActiveStoryCards = (
  history: StoryBlock[],
  cards: StoryCard[],
  maxTokens = 2000
): StoryCard[] => {
  const recentHistory = history.slice(-15)
  const scanText = recentHistory.map(b => b.text).join('\n').toLowerCase()

  let triggered: StoryCard[] = []

  cards.forEach(card => {
    // if there are no keys, just treat it as a global always-on card
    if (!card.keys || card.keys.trim() === '') {
      triggered.push(card)
      return
    }

    const keys = card.keys.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)
    for (const key of keys) {
      if (scanText.includes(key)) {
        triggered.push(card)
        break
      }
    }
  })

  // sort globals to the top, then alpha so the prompt doesn't jump around randomly
  triggered.sort((a, b) => {
    const ag = !a.keys || a.keys.trim() === ''
    const bg = !b.keys || b.keys.trim() === ''
    if (ag && !bg) return -1
    if (!ag && bg) return 1
    return a.title.localeCompare(b.title)
  })

  let currentTokens = 0
  const finalCards: StoryCard[] = []

  for (const card of triggered) {
    const cardText = `${card.title} (${card.category}): ${card.content}\n`
    const cardTokens = estimateTokens(cardText)
    if (currentTokens + cardTokens > maxTokens) break
    finalCards.push(card)
    currentTokens += cardTokens
  }

  return finalCards
}

export const getRetainedHistory = (
  history: StoryBlock[],
  availableTokens: number
): { retainedHistory: StoryBlock[], usedTokens: number } => {
  // leave a 1k token buffer when full so we aren't constantly dropping blocks
  const targetHistoryTokens = availableTokens - 1024

  let usedTokens = 0
  const retained: StoryBlock[] = []

  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i]
    if (msg.role === 'system') continue

    const tokens = estimateTokens(msg.text)
    if (usedTokens + tokens > availableTokens) break
    retained.unshift(msg)
    usedTokens += tokens
  }

  // start dropping the oldest turns until we're under the target
  // this helps keep the static prefix stable for prompt caching
  if (usedTokens > targetHistoryTokens && history.length > retained.length) {
    let dropped = 0
    while (retained.length > 2 && dropped < 1024) {
      const block = retained.shift()!
      const t = estimateTokens(block.text)
      dropped += t
      usedTokens -= t
    }
  }

  return { retainedHistory: retained, usedTokens }
}
