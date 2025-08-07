'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dices } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { SettingsPopover } from '@/components/settings-popover'
import { useFontPairStore } from '@/lib/store'
import { GoogleFont, fetchGoogleFonts, getFontWeights, isGoodForHeadings } from '@/lib/google-fonts'

export function HeaderButtons() {
  const { fontPairs, fontLock, canAccessFontLocking, updateFontPair } = useFontPairStore()
  const [allFonts, setAllFonts] = useState<GoogleFont[]>([])

  useEffect(() => {
    fetchGoogleFonts().then(setAllFonts)
  }, [])

  const randomizeFontPair = (id: string) => {
    if (allFonts.length === 0) return

    const isHeadingLocked = fontLock.enabled && fontLock.lockType === 'headings' && canAccessFontLocking()
    const isBodyLocked = fontLock.enabled && fontLock.lockType === 'body' && canAccessFontLocking()

    // Get current font pair to preserve locked fonts
    const currentPair = fontPairs.find(pair => pair.id === id)
    if (!currentPair) return

    let headingFont, bodyFont, randomHeadingWeight, randomBodyWeight

    if (isHeadingLocked && fontLock.globalHeadingFont) {
      // Use locked heading font
      headingFont = fontLock.globalHeadingFont.isCustom ? 
        { family: fontLock.globalHeadingFont.family, category: 'custom' } :
        allFonts.find(f => f.family === fontLock.globalHeadingFont!.family) || allFonts[0]
      randomHeadingWeight = fontLock.globalHeadingFont.weight
    } else {
      // Get random heading font - filter for fonts suitable for headings
      const suitableHeadingFonts = allFonts.filter(isGoodForHeadings)
      const randomIndex1 = Math.floor(Math.random() * Math.min(suitableHeadingFonts.length, 100))
      headingFont = suitableHeadingFonts[randomIndex1] || allFonts[0] // fallback to any font if none suitable
      const headingWeights = getFontWeights(headingFont)
      const headingWeightOptions = headingWeights.filter(weight => parseInt(weight) >= 400 && parseInt(weight) <= 900)
      const finalHeadingWeights = headingWeightOptions.length > 0 ? headingWeightOptions : headingWeights
      randomHeadingWeight = finalHeadingWeights[Math.floor(Math.random() * finalHeadingWeights.length)]
    }

    if (isBodyLocked && fontLock.globalBodyFont) {
      // Use locked body font
      bodyFont = fontLock.globalBodyFont.isCustom ?
        { family: fontLock.globalBodyFont.family, category: 'custom' } :
        allFonts.find(f => f.family === fontLock.globalBodyFont!.family) || allFonts[0]
      randomBodyWeight = fontLock.globalBodyFont.weight
    } else {
      // Get random body font
      const randomIndex2 = Math.floor(Math.random() * Math.min(allFonts.length, 100))
      bodyFont = allFonts[randomIndex2]
      const bodyWeights = getFontWeights(bodyFont)
      const bodyWeightOptions = bodyWeights.filter(weight => parseInt(weight) >= 300 && parseInt(weight) <= 400)
      const finalBodyWeights = bodyWeightOptions.length > 0 ? bodyWeightOptions : bodyWeights.filter(weight => parseInt(weight) <= 400)
      randomBodyWeight = finalBodyWeights[Math.floor(Math.random() * finalBodyWeights.length)]
    }

    // Update the font pair
    updateFontPair(id, {
      headingFont: {
        family: headingFont.family,
        weight: randomHeadingWeight,
        category: headingFont.category,
        lineHeight: 1.25,
        letterSpacing: -0.025,
        isCustom: isHeadingLocked ? fontLock.globalHeadingFont?.isCustom : false
      },
      bodyFont: {
        family: bodyFont.family,
        weight: randomBodyWeight,
        category: bodyFont.category,
        lineHeight: 1.625,
        letterSpacing: 0,
        isCustom: isBodyLocked ? fontLock.globalBodyFont?.isCustom : false
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
      <SettingsPopover />
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