'use client'

import { Plus, Trash2, Dices, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FontSelector } from './font-selector'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useFontPairStore } from '@/lib/store'
import { useState, useEffect, useRef } from 'react'
import { GoogleFont, fetchGoogleFonts, getFontWeights, isGoodForHeadings } from '@/lib/google-fonts'

export function Sidebar() {
  const { fontPairs, activePairId, fontLock, addFontPair, deleteFontPair, updateFontPair, setActivePair, canAccessFontLocking } = useFontPairStore()
  const [allFonts, setAllFonts] = useState<GoogleFont[]>([])
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    fetchGoogleFonts().then(setAllFonts)
  }, [])

  useEffect(() => {
    if (activePairId && cardRefs.current[activePairId]) {
      cardRefs.current[activePairId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [activePairId])

  const handleNameChange = (id: string, name: string) => {
    updateFontPair(id, { name })
  }

  const handleHeadingFontChange = (id: string, family: string, weight: string, category?: string, isCustom?: boolean) => {
    updateFontPair(id, {
      headingFont: { family, weight, category, lineHeight: 1.25, letterSpacing: -0.025, isCustom }
    })
  }

  const handleBodyFontChange = (id: string, family: string, weight: string, category?: string, isCustom?: boolean) => {
    updateFontPair(id, {
      bodyFont: { family, weight, category, lineHeight: 1.625, letterSpacing: 0, isCustom }
    })
  }

  const randomizeFontPair = (id: string) => {
    if (allFonts.length === 0) return

    const isHeadingLocked = fontLock.enabled && fontLock.lockType === 'headings' && canAccessFontLocking()
    const isBodyLocked = fontLock.enabled && fontLock.lockType === 'body' && canAccessFontLocking()

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

  const isHeadingLocked = fontLock.enabled && fontLock.lockType === 'headings' && canAccessFontLocking()
  const isBodyLocked = fontLock.enabled && fontLock.lockType === 'body' && canAccessFontLocking()

  return (
    <div className="w-88 border-r border-border flex flex-col h-full">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent">
        <div className="space-y-4 py-4 px-4">
          {fontPairs.map((pair) => (
            <Card
              key={pair.id}
              ref={(el) => {
                cardRefs.current[pair.id] = el
              }}
              className={`space-y-1 p-3 pb-4 border-none shadow-none cursor-pointer transition-all outline-2 outline-offset-2 ${activePairId === pair.id
                ? 'bg-card outline-foreground shadow-lg'
                : 'outline-transparent hover:outline-border'
                }`}
              onClick={() => setActivePair(pair.id)}
            >
              <div className="flex items-center justify-between">
                <Input
                  value={pair.name}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleNameChange(pair.id, e.target.value)
                  }}
                  className="!text-xs text-muted-foreground uppercase tracking-wider font-semibold border-none px-0 h-auto shadow-none focus-visible:ring-0"
                />

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      randomizeFontPair(pair.id)
                    }}
                    className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                    title="Randomize font pairing"
                    disabled={allFonts.length === 0}
                  >
                    <Dices className="w-3 h-3" />
                  </Button>
                  {fontPairs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFontPair(pair.id)
                      }}
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {!isHeadingLocked && (
                  <div>
                    <div className="text-xs font-medium text-foreground mb-2">Heading</div>
                    <FontSelector
                      label=""
                      fontFamily={pair.headingFont.family}
                      fontWeight={pair.headingFont.weight}
                      onFontChange={(family, weight, category) => handleHeadingFontChange(pair.id, family, weight, category)}
                    />
                  </div>
                )}

                {isHeadingLocked && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-2">
                      <span>Heading</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Heading font is globally locked. Unlock in settings.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}

                {!isBodyLocked && (
                  <div>
                    <div className="text-xs font-medium text-foreground mb-2">Body</div>
                    <FontSelector
                      label=""
                      fontFamily={pair.bodyFont.family}
                      fontWeight={pair.bodyFont.weight}
                      onFontChange={(family, weight, category) => handleBodyFontChange(pair.id, family, weight, category)}
                    />
                  </div>
                )}

                {isBodyLocked && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-2">
                      <span>Body</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Body font is globally locked. Unlock in settings.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sticky bottom section with Add Pair button */}
      <div className="border-t border-border p-4 bg-background">
        <Button onClick={() => addFontPair(undefined, allFonts)} size="sm" className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Add Pair
        </Button>
      </div>
    </div>
  )
}