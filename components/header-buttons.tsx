'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Dices, RotateCcw } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ModeToggle } from '@/components/mode-toggle'
import { useFontPairStore } from '@/lib/store'
import { GoogleFont, fetchGoogleFonts, getFontWeights, isGoodForDisplay, getRandomFontsForPair } from '@/lib/google-fonts'

export function HeaderButtons() {
  const { fontPairs, fontLock, canAccessFontLocking, updateFontPair, generatePairName } = useFontPairStore()
  const [allFonts, setAllFonts] = useState<GoogleFont[]>([])

  useEffect(() => {
    fetchGoogleFonts().then(setAllFonts)
  }, [])

  const randomizeFontPair = (id: string) => {
    if (allFonts.length === 0) return

    const isHeadingLocked = fontLock.headingLocked && canAccessFontLocking()
    const isBodyLocked = fontLock.bodyLocked && canAccessFontLocking()

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
    const newHeadingFont = {
      family: headingFont.family,
      weight: randomHeadingWeight,
      category: headingFont.category,
      lineHeight: 1.25,
      letterSpacing: -0.025,
      isCustom: isHeadingLocked ? fontLock.globalHeadingFont?.isCustom : false
    }
    
    const newBodyFont = {
      family: bodyFont.family,
      weight: randomBodyWeight,
      category: bodyFont.category,
      lineHeight: 1.625,
      letterSpacing: 0,
      isCustom: isBodyLocked ? fontLock.globalBodyFont?.isCustom : false
    }

    // Generate name based on the actual fonts being used
    const headingName = isHeadingLocked && fontLock.globalHeadingFont 
      ? fontLock.globalHeadingFont.family.split(' ')[0]
      : newHeadingFont.family.split(' ')[0]
      
    const bodyName = isBodyLocked && fontLock.globalBodyFont
      ? fontLock.globalBodyFont.family.split(' ')[0] 
      : newBodyFont.family.split(' ')[0]
    
    const newPairName = `${headingName} ${bodyName}`

    updateFontPair(id, {
      headingFont: newHeadingFont,
      bodyFont: newBodyFont,
      name: newPairName
    })
  }

  const randomizeAllFontPairs = () => {
    if (allFonts.length === 0) return

    fontPairs.forEach(pair => {
      randomizeFontPair(pair.id)
    })
  }

  const handleResetApp = () => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-2">
      <ModeToggle />
      <Popover>
        <PopoverTrigger asChild>
          <Avatar className="w-9 h-9 cursor-pointer" title="User menu">
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent className="w-48" align="end">
          <div className="space-y-1">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-destructive hover:text-destructive">
                  <RotateCcw className="w-4 h-4" />
                  Reset App Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset App Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your saved font pairs, settings, and preferences. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetApp} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Reset All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}