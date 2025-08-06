import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FontPair {
  id: string
  name: string
  headingFont: {
    family: string
    weight: string
    category?: string
    lineHeight: number
    letterSpacing: number
  }
  bodyFont: {
    family: string
    weight: string
    category?: string
    lineHeight: number
    letterSpacing: number
  }
}

interface FontPairStore {
  fontPairs: FontPair[]
  activePairId: string | null
  addFontPair: (customPair?: Partial<Omit<FontPair, 'id' | 'name'>>) => void
  deleteFontPair: (id: string) => void
  updateFontPair: (id: string, updates: Partial<Omit<FontPair, 'id'>>) => void
  setActivePair: (id: string) => void
}

const defaultFontPairs = [
  {
    id: '1',
    name: 'Pair 1',
    headingFont: {
      family: 'Inter',
      weight: '700',
      category: 'sans-serif',
      lineHeight: 1.25,
      letterSpacing: -0.025
    },
    bodyFont: {
      family: 'Inter',
      weight: '400',
      category: 'sans-serif',
      lineHeight: 1.625,
      letterSpacing: 0
    }
  }
]

export const useFontPairStore = create<FontPairStore>()(
  persist(
    (set, get) => ({
      fontPairs: defaultFontPairs,
      activePairId: '1',

      addFontPair: (customPair?: Partial<Omit<FontPair, 'id' | 'name'>>) => {
        const { fontPairs } = get()
        const newId = (fontPairs.length + 1).toString()
        const defaultPair = {
          headingFont: {
            family: 'Inter',
            weight: '700',
            category: 'sans-serif',
            lineHeight: 1.25,
            letterSpacing: -0.025
          },
          bodyFont: {
            family: 'Inter',
            weight: '400',
            category: 'sans-serif',
            lineHeight: 1.625,
            letterSpacing: 0
          }
        }

        const newPair: FontPair = {
          id: newId,
          name: `Pair ${fontPairs.length + 1}`,
          ...defaultPair,
          ...customPair
        }
        set({ fontPairs: [...fontPairs, newPair], activePairId: newId })
      },

      deleteFontPair: (id: string) => {
        const { fontPairs, activePairId } = get()
        const newFontPairs = fontPairs.filter(pair => pair.id !== id)
        const newActivePairId = activePairId === id ?
          (newFontPairs.length > 0 ? newFontPairs[0].id : null) :
          activePairId
        set({ fontPairs: newFontPairs, activePairId: newActivePairId })
      },

      updateFontPair: (id: string, updates: Partial<Omit<FontPair, 'id'>>) => {
        set(state => ({
          fontPairs: state.fontPairs.map(pair =>
            pair.id === id ? { ...pair, ...updates } : pair
          )
        }))
      },

      setActivePair: (id: string) => {
        set({ activePairId: id })
      }
    }),
    {
      name: 'fontility-storage',
      version: 1,
    }
  )
)