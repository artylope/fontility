'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dices } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { SettingsPopover } from '@/components/settings-popover'
import { useFontPairStore } from '@/lib/store'
import { GoogleFont, fetchGoogleFonts, getFontWeights, isGoodForDisplay, getRandomFontsForPair } from '@/lib/google-fonts'

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

    // Use the existing getRandomFontsForPair function which properly filters fonts
    const randomFonts = getRandomFontsForPair(allFonts)
    if (!randomFonts) return

    let headingFont, bodyFont, randomHeadingWeight, randomBodyWeight

    if (isHeadingLocked && fontLock.globalHeadingFont) {
      // Use locked heading font
      headingFont = fontLock.globalHeadingFont.isCustom ? 
        { family: fontLock.globalHeadingFont.family, category: 'custom' } :
        allFonts.find(f => f.family === fontLock.globalHeadingFont!.family) || randomFonts.headingFont
      randomHeadingWeight = fontLock.globalHeadingFont.weight
    } else {
      // Use the filtered random heading font from getRandomFontsForPair
      headingFont = randomFonts.headingFont
      const headingWeights = getFontWeights(headingFont)
      const headingWeightOptions = headingWeights.filter(weight => parseInt(weight) >= 400 && parseInt(weight) <= 900)
      const finalHeadingWeights = headingWeightOptions.length > 0 ? headingWeightOptions : headingWeights
      randomHeadingWeight = finalHeadingWeights[Math.floor(Math.random() * finalHeadingWeights.length)]
    }

    if (isBodyLocked && fontLock.globalBodyFont) {
      // Use locked body font
      bodyFont = fontLock.globalBodyFont.isCustom ?
        { family: fontLock.globalBodyFont.family, category: 'custom' } :
        allFonts.find(f => f.family === fontLock.globalBodyFont!.family) || randomFonts.bodyFont
      randomBodyWeight = fontLock.globalBodyFont.weight
    } else {
      // Use the filtered random body font from getRandomFontsForPair
      bodyFont = randomFonts.bodyFont
      const bodyWeights = getFontWeights(bodyFont)
      const bodyWeightOptions = bodyWeights.filter(weight => parseInt(weight) >= 300 && parseInt(weight) <= 500)
      const finalBodyWeights = bodyWeightOptions.length > 0 ? bodyWeightOptions : bodyWeights.filter(weight => parseInt(weight) <= 500)
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