'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dices } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { useFontPairStore } from '@/lib/store'
import { GoogleFont, fetchGoogleFonts, getFontWeights } from '@/lib/google-fonts'

export function HeaderButtons() {
  const { fontPairs, updateFontPair } = useFontPairStore()
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

    // Get available weights for each font
    const headingWeights = getFontWeights(headingFont)
    const bodyWeights = getFontWeights(bodyFont)

    // Filter body weights to be 300-400 range
    const bodyWeightOptions = bodyWeights.filter(weight => parseInt(weight) >= 300 && parseInt(weight) <= 400)
    const finalBodyWeights = bodyWeightOptions.length > 0 ? bodyWeightOptions : bodyWeights.filter(weight => parseInt(weight) <= 400)

    // Filter heading weights to be 400-900 range and always bolder than body
    const randomBodyWeight = finalBodyWeights[Math.floor(Math.random() * finalBodyWeights.length)]
    const bodyWeightNum = parseInt(randomBodyWeight)
    const headingWeightOptions = headingWeights.filter(weight => parseInt(weight) >= Math.max(400, bodyWeightNum + 100) && parseInt(weight) <= 900)
    const finalHeadingWeights = headingWeightOptions.length > 0 ? headingWeightOptions : headingWeights.filter(weight => parseInt(weight) > bodyWeightNum)

    const randomHeadingWeight = finalHeadingWeights.length > 0
      ? finalHeadingWeights[Math.floor(Math.random() * finalHeadingWeights.length)]
      : headingWeights[headingWeights.length - 1] // fallback to boldest available

    // Update the font pair
    updateFontPair(id, {
      headingFont: {
        family: headingFont.family,
        weight: randomHeadingWeight,
        category: headingFont.category,
        lineHeight: 1.25,
        letterSpacing: -0.025
      },
      bodyFont: {
        family: bodyFont.family,
        weight: randomBodyWeight,
        category: bodyFont.category,
        lineHeight: 1.625,
        letterSpacing: 0
      }
    })
  }

  const randomizeAllFontPairs = () => {
    if (allFonts.length === 0) return

    fontPairs.forEach(pair => {
      randomizeFontPair(pair.id)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={randomizeAllFontPairs}
        size="sm"
        variant="outline"
        className="gap-2"
        title="Randomize all font pairs"
        disabled={allFonts.length === 0}
      >
        <Dices className="w-4 h-4" />
        Randomize Fonts
      </Button>
      <ModeToggle />
    </div>
  )
}