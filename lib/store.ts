import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { getRandomFontsForPair, GoogleFont } from './google-fonts'

export type FontLockType = 'headings' | 'body'

export type FontCategory = 'sans-serif' | 'serif' | 'monospace' | 'handwriting' | 'display'

export interface FontFilters {
  categories: FontCategory[]
  weightRange: [number, number] // [min, max] weight range
  fontSize: number // font size in pixels
}

export interface GlobalTextSettings {
  headingText: string
  bodyText: string
}

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
  headingLocked: boolean
  bodyLocked: boolean
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
  globalText: GlobalTextSettings
  headingFontFilters: FontFilters
  bodyFontFilters: FontFilters
  addFontPair: (customPair?: Partial<Omit<FontPair, 'id' | 'name'>>, availableFonts?: GoogleFont[]) => void
  deleteFontPair: (id: string) => void
  updateFontPair: (id: string, updates: Partial<Omit<FontPair, 'id'>>) => void
  setActivePair: (id: string) => void
  setHeadingLocked: (locked: boolean) => void
  setBodyLocked: (locked: boolean) => void
  setGlobalHeadingFont: (family: string, weight: string, category?: string, isCustom?: boolean) => void
  setGlobalBodyFont: (family: string, weight: string, category?: string, isCustom?: boolean) => void
  setUserTier: (tier: 'free' | 'pro') => void
  canAccessFontLocking: () => boolean
  addCustomFont: (font: CustomFont) => void
  removeCustomFont: (fontId: string) => void
  getCustomFont: (family: string) => CustomFont | undefined
  setGlobalText: (headingText: string, bodyText: string) => void
  setHeadingFontFilters: (filters: Partial<FontFilters>) => void
  setBodyFontFilters: (filters: Partial<FontFilters>) => void
  setHeadingWeightRange: (range: [number, number]) => void
  setBodyWeightRange: (range: [number, number]) => void
  setHeadingFontSize: (size: number) => void
  setBodyFontSize: (size: number) => void
  generatePairName: (headingFont: any, bodyFont: any) => string
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

      globalText: {
        headingText: "Great typography guides the reader's eye.",
        bodyText: 'Customize responsive typography systems for your fonts with meticulously designed editors for line height and letter spacing across font sizes and breakpoints.'
      },

      headingFontFilters: {
        categories: ['sans-serif', 'serif', 'monospace', 'handwriting', 'display'],
        weightRange: [600, 900], // Full range by default
        fontSize: 36 // Default heading size
      },

      bodyFontFilters: {
        categories: ['sans-serif', 'serif', 'monospace', 'handwriting', 'display'],
        weightRange: [400, 400], // Full range by default
        fontSize: 14 // Default body size
      },

      fontLock: {
        headingLocked: false,
        bodyLocked: false,
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
        const isHeadingLocked = fontLock.headingLocked && canAccessLocking
        const isBodyLocked = fontLock.bodyLocked && canAccessLocking

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

        // Generate name from font families using helper function
        const generatedName = get().generatePairName(headingFont, bodyFont)

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
          fontPairs: state.fontPairs.map(pair => {
            if (pair.id === id) {
              const updatedPair = { ...pair, ...updates }

              // Auto-update name if fonts changed
              if (updates.headingFont || updates.bodyFont) {
                const headingFont = updates.headingFont || pair.headingFont
                const bodyFont = updates.bodyFont || pair.bodyFont
                updatedPair.name = get().generatePairName(headingFont, bodyFont)
              }

              return updatedPair
            }
            return pair
          })
        }))
      },

      setActivePair: (id: string) => {
        set({ activePairId: id })
      },

      setHeadingLocked: (locked: boolean) => {
        set(state => ({
          fontLock: { ...state.fontLock, headingLocked: locked }
        }))
      },

      setBodyLocked: (locked: boolean) => {
        set(state => ({
          fontLock: { ...state.fontLock, bodyLocked: locked }
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

      setGlobalText: (headingText: string, bodyText: string) => {
        set(state => ({
          globalText: { headingText, bodyText }
        }))
      },

      setHeadingFontFilters: (filters: Partial<FontFilters>) => {
        set(state => ({
          headingFontFilters: { ...state.headingFontFilters, ...filters }
        }))
      },

      setBodyFontFilters: (filters: Partial<FontFilters>) => {
        set(state => ({
          bodyFontFilters: { ...state.bodyFontFilters, ...filters }
        }))
      },

      setHeadingWeightRange: (range: [number, number]) => {
        set(state => ({
          headingFontFilters: { ...state.headingFontFilters, weightRange: range }
        }))
      },

      setBodyWeightRange: (range: [number, number]) => {
        set(state => ({
          bodyFontFilters: { ...state.bodyFontFilters, weightRange: range }
        }))
      },

      setHeadingFontSize: (size: number) => {
        set(state => ({
          headingFontFilters: { ...state.headingFontFilters, fontSize: size }
        }))
      },

      setBodyFontSize: (size: number) => {
        set(state => ({
          bodyFontFilters: { ...state.bodyFontFilters, fontSize: size }
        }))
      },

      // Helper function to generate pair name based on current lock state
      generatePairName: (headingFont: any, bodyFont: any) => {
        const state = get()
        const canAccessLocking = state.userTier.features.fontLocking
        const isHeadingLocked = state.fontLock.headingLocked && canAccessLocking
        const isBodyLocked = state.fontLock.bodyLocked && canAccessLocking
        
        const headingName = isHeadingLocked && state.fontLock.globalHeadingFont 
          ? state.fontLock.globalHeadingFont.family.split(' ')[0]
          : headingFont.family.split(' ')[0]
          
        const bodyName = isBodyLocked && state.fontLock.globalBodyFont
          ? state.fontLock.globalBodyFont.family.split(' ')[0] 
          : bodyFont.family.split(' ')[0]
        
        return `${headingName} ${bodyName}`
      },
    }),
    {
      name: 'fontility-storage',
      version: 1,
    }
  )
)