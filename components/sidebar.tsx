'use client'

import { Plus, Trash2, Dices, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { FontSelector } from './font-selector'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from './sidebar-tabs'
import { useFontPairStore, FontLockType } from '@/lib/store'
import { useState, useEffect, useRef } from 'react'
import { GoogleFont, fetchGoogleFonts, getFontWeights } from '@/lib/google-fonts'

export function Sidebar() {
  const {
    fontPairs,
    activePairId,
    fontLock,
    addFontPair,
    deleteFontPair,
    updateFontPair,
    setActivePair,
    setGlobalHeadingFont,
    setGlobalBodyFont,
    setFontLockEnabled,
    setFontLockType,
    canAccessFontLocking
  } = useFontPairStore()
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

  const handleHeadingFontChange = (id: string, family: string, weight: string, category?: string) => {
    updateFontPair(id, {
      headingFont: { family, weight, category, lineHeight: 1.25, letterSpacing: -0.025 }
    })
  }

  const handleBodyFontChange = (id: string, family: string, weight: string, category?: string) => {
    updateFontPair(id, {
      bodyFont: { family, weight, category, lineHeight: 1.625, letterSpacing: 0 }
    })
  }

  const randomizeFontPair = (id: string) => {
    if (allFonts.length === 0) return

    let headingFont, bodyFont, randomHeadingWeight, randomBodyWeight

    if (isHeadingLocked && fontLock.globalHeadingFont) {
      // Use locked heading font
      headingFont = allFonts.find(f => f.family === fontLock.globalHeadingFont!.family) || allFonts[0]
      randomHeadingWeight = fontLock.globalHeadingFont.weight
    } else {
      // Get random heading font
      const randomIndex1 = Math.floor(Math.random() * Math.min(allFonts.length, 100))
      headingFont = allFonts[randomIndex1]
      const headingWeights = getFontWeights(headingFont)
      const headingWeightOptions = headingWeights.filter(weight => parseInt(weight) >= 400 && parseInt(weight) <= 900)
      const finalHeadingWeights = headingWeightOptions.length > 0 ? headingWeightOptions : headingWeights
      randomHeadingWeight = finalHeadingWeights[Math.floor(Math.random() * finalHeadingWeights.length)]
    }

    if (isBodyLocked && fontLock.globalBodyFont) {
      // Use locked body font
      bodyFont = allFonts.find(f => f.family === fontLock.globalBodyFont!.family) || allFonts[0]
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

  const handleGlobalHeadingFontChange = (family: string, weight: string, category?: string) => {
    setGlobalHeadingFont(family, weight, category)
    // Update all pairs to use this font for headings
    fontPairs.forEach(pair => {
      updateFontPair(pair.id, {
        headingFont: { family, weight, category, lineHeight: 1.25, letterSpacing: -0.025 }
      })
    })
  }

  const handleGlobalBodyFontChange = (family: string, weight: string, category?: string) => {
    setGlobalBodyFont(family, weight, category)
    // Update all pairs to use this font for body text
    fontPairs.forEach(pair => {
      updateFontPair(pair.id, {
        bodyFont: { family, weight, category, lineHeight: 1.625, letterSpacing: 0 }
      })
    })
  }

  const isHeadingLocked = fontLock.enabled && fontLock.lockType === 'headings' && canAccessFontLocking()
  const isBodyLocked = fontLock.enabled && fontLock.lockType === 'body' && canAccessFontLocking()

  // Settings handlers (moved from settings popover)
  const handleFontLockToggle = (enabled: boolean) => {
    if (!canAccessFontLocking()) return
    setFontLockEnabled(enabled)
  }

  const handleFontLockTypeChange = (value: string) => {
    if (!canAccessFontLocking()) return
    setFontLockType(value as FontLockType)
  }

  // Component for rendering font pairs (shared between basic and advanced)
  const FontPairsList = ({ showLocked = false }: { showLocked?: boolean }) => (
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
            {(!isHeadingLocked || !showLocked) && (
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

            {isHeadingLocked && showLocked && (
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-2">
                  <span>Heading</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Heading font is globally locked. Unlock in Advanced tab.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}

            {(!isBodyLocked || !showLocked) && (
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

            {isBodyLocked && showLocked && (
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-2">
                  <span>Body</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Body font is globally locked. Unlock in Advanced tab.</p>
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
  )

  return (
    <div className="w-88 border-r border-border flex flex-col h-full">
      <TabsRoot defaultValue="basic" className="flex flex-col h-full">
        <TabsList className="border-b border-border">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="flex-1 flex flex-col">
          {/* Scrollable content area for Basic tab */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent">
            <FontPairsList showLocked={true} />
          </div>

          {/* Sticky bottom section with Add Pair button */}
          <div className="border-t border-border p-4 bg-background">
            <Button onClick={() => addFontPair(undefined, allFonts)} size="sm" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Pair
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="flex-1 flex flex-col">
          {/* Settings section */}
          <div className="flex flex-col border-b border-border">
            <div className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Font Lock Settings</h4>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 w-full">
                      <div className="flex flex-col gap-1 w-full">
                        <Label htmlFor="font-lock" className="text-sm font-medium">
                          Lock one font type across all styles
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Use a single font for all headings or body text
                        </p>
                      </div>
                      <div className="h-5 flex items-center">
                        <Switch
                          id="font-lock"
                          checked={fontLock.enabled && canAccessFontLocking()}
                          onCheckedChange={handleFontLockToggle}
                          disabled={!canAccessFontLocking()}
                        />
                      </div>
                    </div>
                  </div>

                  {fontLock.enabled && canAccessFontLocking() && (
                    <div className="space-y-3 border border-border rounded-lg p-4">
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Choose which font type to lock</p>
                        <RadioGroup
                          value={fontLock.lockType}
                          onValueChange={handleFontLockTypeChange}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="headings" id="headings" />
                            <Label htmlFor="headings" className="text-sm">
                              Headings
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="body" id="body" />
                            <Label htmlFor="body" className="text-sm">
                              Body
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}

                  {!canAccessFontLocking() && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Font locking is a Pro feature. Upgrade to unlock this functionality.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Global font selectors (shown when font locking is active) */}
            {(isHeadingLocked || isBodyLocked) && (
              <div className="p-4 ">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Global Font Selection</h3>

                  {isHeadingLocked && (
                    <div>
                      <div className="text-xs font-medium text-foreground mb-2">Global Heading Font</div>
                      <FontSelector
                        label=""
                        fontFamily={fontLock.globalHeadingFont?.family || 'Inter'}
                        fontWeight={fontLock.globalHeadingFont?.weight || '700'}
                        onFontChange={handleGlobalHeadingFontChange}
                      />
                    </div>
                  )}

                  {isBodyLocked && (
                    <div>
                      <div className="text-xs font-medium text-foreground mb-2">Global Body Font</div>
                      <FontSelector
                        label=""
                        fontFamily={fontLock.globalBodyFont?.family || 'Inter'}
                        fontWeight={fontLock.globalBodyFont?.weight || '400'}
                        onFontChange={handleGlobalBodyFontChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Spacer to push content to top */}
          <div className="flex-1"></div>
        </TabsContent>
      </TabsRoot>
    </div>
  )
}