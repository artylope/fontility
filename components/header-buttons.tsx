'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dices, Plus } from 'lucide-react'
import { useFontPairStore } from '@/lib/store'
import { GoogleFont, fetchGoogleFonts, getFontWeights } from '@/lib/google-fonts'

export function HeaderButtons() {
  const { fontPairs, addFontPair, updateFontPair } = useFontPairStore()
  const [allFonts, setAllFonts] = useState<GoogleFont[]>([])

  useEffect(() => {
    fetchGoogleFonts().then(setAllFonts)
  }, [])

  const randomizeFontPair = (id: string) => {
    if (allFonts.length === 0) return

    // Get two random fonts
    const randomIndex1 = Math.floor(Math.random() * Math.min(allFonts.length, 100)) // Top 100 fonts for better quality
    const randomIndex2 = Math.floor(Math.random() * Math.min(allFonts.length, 100))

    const headingFont = allFonts[randomIndex1]
    const bodyFont = allFonts[randomIndex2]

    // Get random weights for each font
    const headingWeights = getFontWeights(headingFont)
    const bodyWeights = getFontWeights(bodyFont)

    const randomHeadingWeight = headingWeights[Math.floor(Math.random() * headingWeights.length)]
    const randomBodyWeight = bodyWeights[Math.floor(Math.random() * bodyWeights.length)]

    // Update the font pair
    updateFontPair(id, {
      headingFont: {
        family: headingFont.family,
        weight: randomHeadingWeight,
        category: headingFont.category
      },
      bodyFont: {
        family: bodyFont.family,
        weight: randomBodyWeight,
        category: bodyFont.category
      }
    })
  }

  const randomizeAllFontPairs = () => {
    if (allFonts.length === 0) return
    
    fontPairs.forEach(pair => {
      randomizeFontPair(pair.id)
    })
  }

  const addRandomFontPair = () => {
    if (allFonts.length === 0) {
      // Fallback to default if fonts aren't loaded yet
      addFontPair()
      return
    }

    // Get two random fonts
    const randomIndex1 = Math.floor(Math.random() * Math.min(allFonts.length, 100)) // Top 100 fonts for better quality
    const randomIndex2 = Math.floor(Math.random() * Math.min(allFonts.length, 100))

    const headingFont = allFonts[randomIndex1]
    const bodyFont = allFonts[randomIndex2]

    // Get random weights for each font
    const headingWeights = getFontWeights(headingFont)
    const bodyWeights = getFontWeights(bodyFont)

    const randomHeadingWeight = headingWeights[Math.floor(Math.random() * headingWeights.length)]
    const randomBodyWeight = bodyWeights[Math.floor(Math.random() * bodyWeights.length)]

    // Add font pair with random fonts
    addFontPair({
      headingFont: {
        family: headingFont.family,
        weight: randomHeadingWeight,
        category: headingFont.category
      },
      bodyFont: {
        family: bodyFont.family,
        weight: randomBodyWeight,
        category: bodyFont.category
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={randomizeAllFontPairs}
        size="sm"
        variant="outline"
        className="gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
        title="Randomize all font pairs"
        disabled={allFonts.length === 0}
      >
        <Dices className="w-4 h-4" />
        Randomize All
      </Button>
      <Button onClick={addRandomFontPair} size="sm" className="gap-2">
        <Plus className="w-4 h-4" />
        Add Set
      </Button>
    </div>
  )
}