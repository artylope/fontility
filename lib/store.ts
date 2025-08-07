import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { getRandomFontsForPair, GoogleFont } from './google-fonts'

export type FontLockType = 'headings' | 'body'

export interface FontLockSettings {
  enabled: boolean
  lockType: FontLockType
  globalHeadingFont?: {
    family: string
    weight: string
    category?: string
  }
  globalBodyFont?: {
    family: string
    weight: string
    category?: string
  }
}

export interface UserTier {
  tier: 'free' | 'pro'
  features: {
    fontLocking: boolean
  }
}

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
  fontLock: FontLockSettings
  userTier: UserTier
  addFontPair: (customPair?: Partial<Omit<FontPair, 'id' | 'name'>>, availableFonts?: GoogleFont[]) => void
  deleteFontPair: (id: string) => void
  updateFontPair: (id: string, updates: Partial<Omit<FontPair, 'id'>>) => void
  setActivePair: (id: string) => void
  setFontLockEnabled: (enabled: boolean) => void
  setFontLockType: (type: FontLockType) => void
  setGlobalHeadingFont: (family: string, weight: string, category?: string) => void
  setGlobalBodyFont: (family: string, weight: string, category?: string) => void
  setUserTier: (tier: 'free' | 'pro') => void
  canAccessFontLocking: () => boolean
}

const defaultFontPairs = [
  {
    id: '1',
    name: 'Inter Inter',
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
      
      fontLock: {
        enabled: false,
        lockType: 'headings',
        globalHeadingFont: undefined,
        globalBodyFont: undefined,
      },
      
      userTier: {
        tier: 'free',
        features: {
          fontLocking: true,
        }
      },

      addFontPair: (customPair?: Partial<Omit<FontPair, 'id' | 'name'>>, availableFonts?: GoogleFont[]) => {
        const { fontPairs } = get()
        const newId = nanoid()
        
        // If no custom pair provided, generate random fonts
        let finalPair = customPair
        if (!customPair && availableFonts && availableFonts.length > 0) {
          const randomFonts = getRandomFontsForPair(availableFonts)
          
          if (randomFonts) {
            finalPair = {
              headingFont: {
                family: randomFonts.headingFont.family,
                weight: '700',
                category: randomFonts.headingFont.category || 'sans-serif',
                lineHeight: 1.25,
                letterSpacing: -0.025
              },
              bodyFont: {
                family: randomFonts.bodyFont.family,
                weight: '400', 
                category: randomFonts.bodyFont.category || 'sans-serif',
                lineHeight: 1.625,
                letterSpacing: 0
              }
            }
          }
        }
        
        // Fallback to Inter if no custom pair and no fonts available
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

        // Generate name from font families
        const headingFamily = finalPair?.headingFont?.family || defaultPair.headingFont.family
        const bodyFamily = finalPair?.bodyFont?.family || defaultPair.bodyFont.family
        const headingFirstWord = headingFamily.split(' ')[0]
        const bodyFirstWord = bodyFamily.split(' ')[0]
        const generatedName = `${headingFirstWord} ${bodyFirstWord}`

        const newPair: FontPair = {
          id: newId,
          name: generatedName,
          ...defaultPair,
          ...finalPair
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
      },

      setFontLockEnabled: (enabled: boolean) => {
        set(state => ({
          fontLock: { ...state.fontLock, enabled }
        }))
      },

      setFontLockType: (lockType: FontLockType) => {
        set(state => ({
          fontLock: { ...state.fontLock, lockType }
        }))
      },

      setGlobalHeadingFont: (family: string, weight: string, category?: string) => {
        set(state => ({
          fontLock: {
            ...state.fontLock,
            globalHeadingFont: { family, weight, category }
          }
        }))
      },

      setGlobalBodyFont: (family: string, weight: string, category?: string) => {
        set(state => ({
          fontLock: {
            ...state.fontLock,
            globalBodyFont: { family, weight, category }
          }
        }))
      },

      setUserTier: (tier: 'free' | 'pro') => {
        const features = tier === 'pro' ? {
          fontLocking: true,
        } : {
          fontLocking: true,
        }
        
        set({ userTier: { tier, features } })
      },

      canAccessFontLocking: () => {
        const { userTier } = get()
        return userTier.features.fontLocking
      },
    }),
    {
      name: 'fontility-storage',
      version: 1,
    }
  )
)