import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type StoryRole = 'user' | 'ai' | 'system'

export interface ContextSnapshot {
  adventureTokens: number
  memoryTokens: number
  essentialTokens: number
  authorNoteTokens: number
  storyCardTokens: number
  instructionTokens: number
  responseTokens: number
  maxTokens: number
}

export interface StoryBlock {
  id: string
  role: StoryRole
  text: string
  contextSnapshot?: ContextSnapshot
}

export interface StoryCard {
  id: string
  title: string
  category: string
  keys: string
  content: string
}

export type BaseThemeType = 'legacy' | 'familiar' | 'mono' | 'classic' | 'polaris'
export type ThemeVariantType = 'amber' | 'cyber' | 'atlantis' | 'orcish' | 'matrix' | 'slate' | 'default' | '95' | 'chicago' | 'hotdog'
export type ProviderType = 'openrouter' | 'gemini' | 'huggingface' | 'local'

export interface PlayerProfile {
  name: string
  class: string
  status: string
}

export interface InventoryItem {
  id: string
  name: string
}

export interface Equipment {
  head: string | null
  torso: string | null
  legs: string | null
  feet: string | null
  accessory: string | null
  mainhand: string | null
  offhand: string | null
}

export interface RelationshipNode {
  id: string
  name: string
  value: number // 1-100, baseline 50
  reason: string
}

export interface TerminalLog {
  id: string
  timestamp: number
  message: string
  type: 'info' | 'error' | 'success' | 'warn' | 'system'
}

export interface EngineState {

  currentView: 'home' | 'engine'
  setCurrentView: (view: 'home' | 'engine') => void


  currentAdventureId: string | null
  setCurrentAdventureId: (id: string | null) => void
  startNewAdventure: () => void
  startScenario: (plotEssentials: string, rawCardsText: string, profile: PlayerProfile, adventureImage: string, authorsNote?: string) => Promise<void>
  loadAdventure: (id: string) => Promise<void>


  adventureImage: string
  playerProfile: PlayerProfile
  ownerId: string | null
  setOwnerId: (id: string | null) => void


  baseTheme: BaseThemeType
  setBaseTheme: (theme: BaseThemeType) => void
  themeVariant: ThemeVariantType
  setThemeVariant: (theme: ThemeVariantType) => void
  isLeftSidebarOpen: boolean
  toggleLeftSidebar: () => void
  isRightSidebarOpen: boolean
  toggleRightSidebar: () => void
  isTerminalOpen: boolean
  toggleTerminal: () => void
  terminalLogs: TerminalLog[]
  addTerminalLog: (message: string, type?: TerminalLog['type']) => void
  clearTerminalLogs: () => void
  

  activeMainTab: 'adventure' | 'gameplay'
  setActiveMainTab: (tab: 'adventure' | 'gameplay') => void
  activeAdventureTab: 'plot' | 'cards'
  setActiveAdventureTab: (tab: 'plot' | 'cards') => void
  activeGameplayTab: 'models' | 'appearance' | 'advanced'
  setActiveGameplayTab: (tab: 'models' | 'appearance' | 'advanced') => void


  isImportModalOpen: boolean
  setImportModalOpen: (val: boolean) => void
  isSettingsOpen: boolean
  setIsSettingsOpen: (val: boolean) => void

  configNeedsAttention: boolean
  setConfigNeedsAttention: (val: boolean) => void


  openRouterKey: string
  setOpenRouterKey: (key: string) => void
  geminiKey: string
  setGeminiKey: (key: string) => void
  hfKey: string
  setHfKey: (key: string) => void
  localEndpoint: string
  setLocalEndpoint: (url: string) => void
  activeProvider: ProviderType
  setActiveProvider: (provider: ProviderType) => void
  activeModel: string
  setActiveModel: (model: string) => void
  maxContextTokens: number
  setMaxContextTokens: (val: number) => void
  safetyLevel: number
  setSafetyLevel: (val: number) => void


  aiInstructions: string
  setAiInstructions: (val: string) => void
  authorsNote: string
  setAuthorsNote: (val: string) => void
  plotEssentials: string
  setPlotEssentials: (val: string) => void


  maxResponseLength: number
  setMaxResponseLength: (val: number) => void
  temperature: number
  setTemperature: (val: number) => void
  topP: number
  setTopP: (val: number) => void
  topK: number
  setTopK: (val: number) => void
  repetitionPenalty: number
  setRepetitionPenalty: (val: number) => void
  frequencyPenalty: number
  setFrequencyPenalty: (val: number) => void
  presencePenalty: number
  setPresencePenalty: (val: number) => void
  minP: number
  setMinP: (val: number) => void
  topA: number
  setTopA: (val: number) => void
  debugMode: boolean
  setDebugMode: (val: boolean) => void

  forceSave: () => Promise<void>


  storyBlocks: StoryBlock[]
  addStoryBlock: (block: Omit<StoryBlock, 'id'>) => void
  updateLastStoryBlock: (text: string) => void
  removeLastStoryBlock: () => void
  eraseLastTurn: () => void
  updateStoryBlock: (id: string, newText: string) => void
  attachSnapshotToLastBlock: (snapshot: ContextSnapshot) => void
  importStory: (blocks: Omit<StoryBlock, 'id'>[]) => void
  isGenerating: boolean
  setGenerating: (val: boolean) => void
  

  isInputMode: boolean
  setInputMode: (val: boolean) => void
  

  storyCards: StoryCard[]
  addStoryCard: (card: Omit<StoryCard, 'id'>) => void
  removeStoryCard: (id: string) => void
  bulkImportCards: (rawText: string) => void


  inventory: InventoryItem[]
  relationships: RelationshipNode[]
  equipment: Equipment
  goldCoins: number
  applyBackendState: (backendText: string) => void
}

const initialStory: StoryBlock[] = [
  { id: '1', role: 'system', text: 'AI Adventures Engine Initialized.' },
  { id: '2', role: 'ai', text: '[ Your adventure begins here... ]' }
]

const initialCards: StoryCard[] = []

const parseStoryCards = (rawText: string): StoryCard[] => {
  try {
    const parsed = JSON.parse(rawText)
    const arr = Array.isArray(parsed) ? parsed : (parsed.items || parsed.entries || [parsed])
    return arr.map((item: any, i: number) => {
      const cleanTitle = (item.title || item.name || `Extracted Entity ${i + 1}`).replace(/\n/g, ' ').trim()
      return {
        id: crypto.randomUUID(), title: cleanTitle, category: item.type || item.category || 'Lore',
        keys: item.keys || cleanTitle.toLowerCase(),
        content: ((item.description?.length || 0) > (item.value?.length || 0)) ? item.description : (item.value || JSON.stringify(item))
      }
    })
  } catch (e) {
    return rawText.split('\n').filter(l => l.trim().length > 0).map((line, i) => ({
      id: crypto.randomUUID(), title: `Extracted Entity ${i + 1}`, category: 'Extracted',
      keys: `entity ${i + 1}`, content: `{"raw_text": "${line.substring(0, 50)}..."}`
    }))
  }
}

export const useEngineStore = create<EngineState>()(
  persist(
    (set, get) => ({
      currentView: 'home',
      setCurrentView: (view) => set({ currentView: view }),
      
      currentAdventureId: null,
      setCurrentAdventureId: (id) => set({ currentAdventureId: id }),
      startNewAdventure: () => {
        set({
          currentAdventureId: crypto.randomUUID(),
          storyBlocks: [],
          storyCards: [],
          inventory: [],
          equipment: { head: null, torso: null, legs: null, feet: null, accessory: null, mainhand: null, offhand: null },
          relationships: [],
          playerProfile: { name: '', class: '', status: 'Healthy' },
          adventureImage: '',
          plotEssentials: '',
          authorsNote: '',
          currentView: 'engine'
        })
        get().clearTerminalLogs()
        get().addTerminalLog('Started a new adventure.', 'system')
      },
      startScenario: async (plotEssentials, rawCardsText, profile, adventureImage, authorsNote = "") => {
        get().startNewAdventure()
        set({
          plotEssentials: plotEssentials,
          playerProfile: profile,
          adventureImage: adventureImage,
          authorsNote: authorsNote || ''
        })
        try {
          const parsed = JSON.parse(rawCardsText)
          if (Array.isArray(parsed)) {
            parsed.forEach(c => get().addStoryCard({ ...c, id: crypto.randomUUID() }))
          }
        } catch (e: unknown) {
          console.error("Failed to parse initial cards:", e instanceof Error ? e.message : String(e))
          get().addTerminalLog('Failed to parse initial scenario cards.', 'error')
        }
        await get().forceSave()
        get().addTerminalLog(`Scenario initialized for ${profile.name}.`, 'success')
      },
      loadAdventure: async (id: string) => {
        get().addTerminalLog(`Loading adventure ${id}...`, 'info')
        set({ currentAdventureId: id })
        
        try {
          const raw = localStorage.getItem(`adventure-${id}`)
          if (raw) {
            const parsed = JSON.parse(raw)
            set({
              storyBlocks: parsed.storyBlocks || [],
              storyCards: parsed.storyCards || [],
              inventory: [],
              relationships: parsed.relationships || [],
              equipment: parsed.equipment || { head: null, torso: null, legs: null, feet: null, accessory: null, mainhand: null, offhand: null },
              goldCoins: 0,
              plotEssentials: parsed.plotEssentials || '',
              authorsNote: parsed.authorsNote || '',
              playerProfile: parsed.playerProfile || { name: 'Wanderer', class: 'Unknown', status: 'Healthy' },
              adventureImage: parsed.adventureImage || '',
              ownerId: parsed.ownerId || null,
              ...(parsed.aiInstructions ? { aiInstructions: parsed.aiInstructions } : {})
            })
          }
        } catch (e: unknown) {
          console.error("Failed to load adventure data:", e instanceof Error ? e.message : String(e))
          get().addTerminalLog(`Failed to parse adventure data.`, 'error')
        }

        // hack: wait a tiny bit for state propagation before snapping to the engine view
        setTimeout(() => {
          set({ currentView: 'engine' })
          get().addTerminalLog(`Adventure ${id} loaded successfully.`, 'success')
        }, 100)
      },
      adventureImage: "",
      playerProfile: { name: 'Wanderer', class: 'Unknown', status: 'Healthy' },
      ownerId: null,
      setOwnerId: (id) => set({ ownerId: id }),
      baseTheme: 'legacy',
      setBaseTheme: (baseTheme) => set({ baseTheme }),
      themeVariant: 'amber',
      setThemeVariant: (themeVariant) => set({ themeVariant }),
      isLeftSidebarOpen: true,
      toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
      isRightSidebarOpen: true,
      toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
      isTerminalOpen: false,
      toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
      terminalLogs: [],
      addTerminalLog: (message, type = 'info') => set((state) => ({
        terminalLogs: [...state.terminalLogs, { id: crypto.randomUUID(), timestamp: Date.now(), message, type }]
      })),
      clearTerminalLogs: () => set({ terminalLogs: [] }),
      
      activeMainTab: 'adventure',
      setActiveMainTab: (tab) => set({ activeMainTab: tab }),
      activeAdventureTab: 'plot',
      setActiveAdventureTab: (tab) => set({ activeAdventureTab: tab }),
      activeGameplayTab: 'models',
      setActiveGameplayTab: (tab) => set({ activeGameplayTab: tab }),

      isImportModalOpen: false,
      setImportModalOpen: (val) => set({ isImportModalOpen: val }),
      isSettingsOpen: false,
      setIsSettingsOpen: (val) => set({ isSettingsOpen: val }),

      configNeedsAttention: false,
      setConfigNeedsAttention: (val) => set({ configNeedsAttention: val }),


      openRouterKey: '',
      setOpenRouterKey: (key) => set({ openRouterKey: key }),
      geminiKey: '',
      setGeminiKey: (key) => set({ geminiKey: key }),
      hfKey: '',
      setHfKey: (key) => set({ hfKey: key }),
      localEndpoint: 'http://localhost:1234/v1',
      setLocalEndpoint: (url) => set({ localEndpoint: url }),
      activeProvider: 'openrouter',
      setActiveProvider: (provider) => set({ activeProvider: provider }),
      activeModel: 'deepseek/deepseek-v4-flash',
      setActiveModel: (model) => set({ activeModel: model }),
      maxContextTokens: 8192,
      setMaxContextTokens: (val) => set({ maxContextTokens: val }),
      safetyLevel: 1,
      setSafetyLevel: (val) => set({ safetyLevel: val }),


      aiInstructions: "",
      setAiInstructions: (val) => set({ aiInstructions: val }),
      authorsNote: "",
      setAuthorsNote: (val) => set({ authorsNote: val }),
      plotEssentials: "",
      setPlotEssentials: (val) => set({ plotEssentials: val }),


      maxResponseLength: 300,
      setMaxResponseLength: (val) => set({ maxResponseLength: val }),
      temperature: 0.8,
      setTemperature: (val) => set({ temperature: val }),
      topP: 0.9,
      setTopP: (val) => set({ topP: val }),
      topK: 0,
      setTopK: (val) => set({ topK: val }),
      repetitionPenalty: 1.0,
      setRepetitionPenalty: (val) => set({ repetitionPenalty: val }),
      frequencyPenalty: 0.0,
      setFrequencyPenalty: (val) => set({ frequencyPenalty: val }),
      presencePenalty: 0.0,
      setPresencePenalty: (val) => set({ presencePenalty: val }),
      minP: 0.0,
      setMinP: (val) => set({ minP: val }),
      topA: 0.0,
      setTopA: (val) => set({ topA: val }),
      debugMode: false,
      setDebugMode: (val) => set({ debugMode: val }),

      // dump everything to localstorage
      forceSave: async () => {
        const state = get()
        if (state.currentAdventureId) {
          get().addTerminalLog(`Saving state for ${state.currentAdventureId}...`, 'system')
          const saveName = `adventure-${state.currentAdventureId}`
          const saveValue = JSON.stringify({
            storyBlocks: state.storyBlocks,
            storyCards: state.storyCards,
            relationships: state.relationships,
            equipment: state.equipment,
            plotEssentials: state.plotEssentials,
            authorsNote: state.authorsNote,
            playerProfile: state.playerProfile,
            adventureImage: state.adventureImage,
            ownerId: state.ownerId,
            aiInstructions: state.aiInstructions,
            lastUpdated: Date.now()
          }, null, 2)
          try {
            localStorage.setItem(saveName, saveValue)
            get().addTerminalLog(`State saved successfully.`, 'success')
          } catch (e: unknown) {
            console.error('Auto-save failed:', e instanceof Error ? e.message : String(e))
            get().addTerminalLog(`Auto-save failed.`, 'error')
          }
        }
      },


      storyBlocks: initialStory,
      addStoryBlock: (block) => set((state) => ({
        storyBlocks: [...state.storyBlocks, { ...block, id: crypto.randomUUID() }]
      })),
      updateLastStoryBlock: (text) => set((state) => {
        const newBlocks = [...state.storyBlocks]
        if (newBlocks.length > 0) {
          newBlocks[newBlocks.length - 1].text += text
        }
        return { storyBlocks: newBlocks }
      }),
      removeLastStoryBlock: () => set((state) => {
        const newBlocks = [...state.storyBlocks]
        if (newBlocks.length > 0) {
          newBlocks.pop()
        }
        return { storyBlocks: newBlocks }
      }),
      eraseLastTurn: () => set((state) => {
        const newBlocks = [...state.storyBlocks]

        if (newBlocks.length > 0 && newBlocks[newBlocks.length - 1].role === 'ai') {
          newBlocks.pop()
        }

        if (newBlocks.length > 0 && newBlocks[newBlocks.length - 1].role === 'user') {
          newBlocks.pop()
        }
        return { storyBlocks: newBlocks }
      }),
      updateStoryBlock: (id, newText) => set((state) => ({
        storyBlocks: state.storyBlocks.map(block => 
          block.id === id ? { ...block, text: newText } : block
        )
      })),
      attachSnapshotToLastBlock: (snapshot) => set((state) => {
        const newBlocks = [...state.storyBlocks]
        if (newBlocks.length > 0) {
          newBlocks[newBlocks.length - 1].contextSnapshot = snapshot
        }
        return { storyBlocks: newBlocks }
      }),
      importStory: (newBlocks) => set((state) => {
        const systemBlocks = state.storyBlocks.filter(b => b.role === 'system')
        const formattedNewBlocks = newBlocks.map(b => ({ ...b, id: crypto.randomUUID() }))
        return { storyBlocks: [...systemBlocks, ...formattedNewBlocks] }
      }),
      isGenerating: false,
      setGenerating: (val) => set({ isGenerating: val }),

      isInputMode: false,
      setInputMode: (val) => set({ isInputMode: val }),

      storyCards: initialCards,
      addStoryCard: (card) => set((state) => ({
        storyCards: [...state.storyCards, { ...card, id: crypto.randomUUID() }]
      })),
      removeStoryCard: (id) => set((state) => ({ storyCards: state.storyCards.filter(c => c.id !== id) })),
      bulkImportCards: (rawText) => {
        set({ isGenerating: true })
        setTimeout(() => {
          set((state) => ({
            storyCards: [...parseStoryCards(rawText), ...state.storyCards],
            isGenerating: false
          }))
        }, 300)
      },

      inventory: [],
      relationships: [],
      equipment: { head: null, torso: null, legs: null, feet: null, accessory: null, mainhand: null, offhand: null },
      goldCoins: 0,
      applyBackendState: (backendText: string) => set((state) => {
        const lines = backendText.split('\n').map(l => l.trim()).filter(l => l)
        let newInventory = [...state.inventory]
        let newRelationships = [...state.relationships]
        let newEquipment = { ...state.equipment }
        let newGoldCoins = state.goldCoins

        for (const line of lines) {

          const goldMatch = line.match(/gold shift:\s*([-+]\d+)/i)
          if (goldMatch) {
            newGoldCoins = Math.max(0, newGoldCoins + parseInt(goldMatch[1], 10))
            continue
          }


          const equipMatch = line.match(/equip\s+(head|torso|legs|feet|accessory|mainhand|offhand):\s*(.*)/i)
          if (equipMatch) {
            const slot = equipMatch[1].toLowerCase() as keyof Equipment
            const item = equipMatch[2].trim()
            if (item.toLowerCase() !== 'none') {
              newEquipment[slot] = item
            }
          }
          const unequipMatch = line.match(/unequip\s+(head|torso|legs|feet|accessory|mainhand|offhand)/i)
          if (unequipMatch) {
            const slot = unequipMatch[1].toLowerCase() as keyof Equipment
            newEquipment[slot] = null
          }


          const addMatch = line.match(/add to inventory:\s*(.*)/i)
          if (addMatch) {
            const itemName = addMatch[1].trim()
            if (itemName.toLowerCase() !== 'none' && !newInventory.find(i => i.name.toLowerCase() === itemName.toLowerCase())) {
              newInventory.push({ id: crypto.randomUUID(), name: itemName })
            }
          }
          const removeMatch = line.match(/remove from inventory:\s*(.*)/i)
          if (removeMatch) {
            const itemName = removeMatch[1].trim()
            if (itemName.toLowerCase() !== 'none') {
              newInventory = newInventory.filter(i => i.name.toLowerCase() !== itemName.toLowerCase())
            }
          }


          const relMatch = line.match(/relationship shift:\s*(.*?)\s*\(([-+]\d+)\)\s*\|\s*reason:\s*(.*)/i)
          if (relMatch) {
            const name = relMatch[1].trim()
            const shift = parseInt(relMatch[2], 10)
            const reason = relMatch[3].trim()

            const existingIdx = newRelationships.findIndex(r => r.name === name)
            if (existingIdx >= 0) {
              const currentVal = newRelationships[existingIdx].value
              newRelationships[existingIdx] = {
                ...newRelationships[existingIdx],
                value: Math.max(1, Math.min(100, currentVal + shift)),
                reason
              }
            } else {
              newRelationships.push({
                id: crypto.randomUUID(),
                name,
                value: Math.max(1, Math.min(100, 50 + shift)), // 50 baseline
                reason
              })
            }
          }
        }

        return { inventory: newInventory, relationships: newRelationships, equipment: newEquipment, goldCoins: newGoldCoins }
      })
    }),
    {
      name: 'text-rpg-engine-storage',
      partialize: (state) => ({ 
        activeProvider: state.activeProvider,
        activeModel: state.activeModel,
        maxContextTokens: state.maxContextTokens,
        safetyLevel: state.safetyLevel,
        baseTheme: state.baseTheme,
        themeVariant: state.themeVariant,
        aiInstructions: state.aiInstructions,
        maxResponseLength: state.maxResponseLength,
        temperature: state.temperature,
        topP: state.topP,
        topK: state.topK,
        repetitionPenalty: state.repetitionPenalty,
        frequencyPenalty: state.frequencyPenalty,
        presencePenalty: state.presencePenalty,
        minP: state.minP,
        topA: state.topA
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
)
