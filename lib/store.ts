import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { getRandomFontsForPair, GoogleFont } from './google-fonts'

export type FontLockType = 'headings' | 'body'

export interface CustomFont {
  id: string
  family: string
  variants: CustomFontVariant[]
  category: 'custom'
  uploadedAt: number
}

export interface CustomFontVariant {
  weight: string
  style: 'normal' | 'italic'
  file: File
  url: string // Object URL for the font file
}

export interface FontLockSettings {
  enabled: boolean
  lockType: FontLockType
  globalHeadingFont?: {
    family: string
    weight: string
    category?: string
    isCustom?: boolean
  }
  globalBodyFont?: {
    family: string
    weight: string
    category?: string
    isCustom?: boolean
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
    isCustom?: boolean
  }
  bodyFont: {
    family: string
    weight: string
    category?: string
    lineHeight: number
    letterSpacing: number
    isCustom?: boolean
  }
}

interface FontPairStore {
  fontPairs: FontPair[]
  activePairId: string | null
  fontLock: FontLockSettings
  userTier: UserTier
  customFonts: CustomFont[]
  addFontPair: (customPair?: Partial<Omit<FontPair, 'id' | 'name'>>, availableFonts?: GoogleFont[]) => void
  deleteFontPair: (id: string) => void
  updateFontPair: (id: string, updates: Partial<Omit<FontPair, 'id'>>) => void
  setActivePair: (id: string) => void
  setFontLockEnabled: (enabled: boolean) => void
  setFontLockType: (type: FontLockType) => void
  setGlobalHeadingFont: (family: string, weight: string, category?: string, isCustom?: boolean) => void
  setGlobalBodyFont: (family: string, weight: string, category?: string, isCustom?: boolean) => void
  setUserTier: (tier: 'free' | 'pro') => void
  canAccessFontLocking: () => boolean
  addCustomFont: (font: CustomFont) => void
  removeCustomFont: (fontId: string) => void
  getCustomFont: (family: string) => CustomFont | undefined
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
      customFonts: [],
      
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
        const { fontPairs, fontLock, userTier } = get()
        const newId = nanoid()
        
        // Check if font locking is enabled and accessible
        const canAccessLocking = userTier.features.fontLocking
        const isHeadingLocked = fontLock.enabled && fontLock.lockType === 'headings' && canAccessLocking
        const isBodyLocked = fontLock.enabled && fontLock.lockType === 'body' && canAccessLocking
        
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

        // Apply global font lock settings if enabled
        let headingFont = finalPair?.headingFont || defaultPair.headingFont
        let bodyFont = finalPair?.bodyFont || defaultPair.bodyFont

        if (isHeadingLocked && fontLock.globalHeadingFont) {
          headingFont = {
            family: fontLock.globalHeadingFont.family,
            weight: fontLock.globalHeadingFont.weight,
            category: fontLock.globalHeadingFont.category || 'sans-serif',
            lineHeight: 1.25,
            letterSpacing: -0.025,
            isCustom: fontLock.globalHeadingFont.isCustom
          }
        }

        if (isBodyLocked && fontLock.globalBodyFont) {
          bodyFont = {
            family: fontLock.globalBodyFont.family,
            weight: fontLock.globalBodyFont.weight,
            category: fontLock.globalBodyFont.category || 'sans-serif',
            lineHeight: 1.625,
            letterSpacing: 0,
            isCustom: fontLock.globalBodyFont.isCustom
          }
        }

        // Generate name from font families
        const headingFirstWord = headingFont.family.split(' ')[0]
        const bodyFirstWord = bodyFont.family.split(' ')[0]
        const generatedName = `${headingFirstWord} ${bodyFirstWord}`

        const newPair: FontPair = {
          id: newId,
          name: generatedName,
          headingFont,
          bodyFont
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

      setGlobalHeadingFont: (family: string, weight: string, category?: string, isCustom?: boolean) => {
        set(state => ({
          fontLock: {
            ...state.fontLock,
            globalHeadingFont: { family, weight, category, isCustom }
          }
        }))
      },

      setGlobalBodyFont: (family: string, weight: string, category?: string, isCustom?: boolean) => {
        set(state => ({
          fontLock: {
            ...state.fontLock,
            globalBodyFont: { family, weight, category, isCustom }
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

      addCustomFont: (font: CustomFont) => {
        set(state => ({
          customFonts: [...state.customFonts.filter(f => f.family !== font.family), font]
        }))
      },

      removeCustomFont: (fontId: string) => {
        const { customFonts } = get()
        const fontToRemove = customFonts.find(f => f.id === fontId)
        
        if (fontToRemove) {
          // Cleanup object URLs
          fontToRemove.variants.forEach(variant => {
            URL.revokeObjectURL(variant.url)
          })
          
          set(state => ({
            customFonts: state.customFonts.filter(f => f.id !== fontId)
          }))
        }
      },

      getCustomFont: (family: string) => {
        const { customFonts } = get()
        return customFonts.find(f => f.family === family)
      },
    }),
    {
      name: 'fontility-storage',
      version: 1,
    }
  )
)