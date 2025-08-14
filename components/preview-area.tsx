'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dices, Plus, Lock } from 'lucide-react'
import { useFontPairStore } from '@/lib/store'
import { loadGoogleFont, getFontWeights, fetchGoogleFonts, GoogleFont } from '@/lib/google-fonts'
import { InteractiveText } from './interactive-text'
import { InlineFontPopover } from './inline-font-popover'

// Helper function to get appropriate fallback font based on category
function getFontFallback(category: string): string {
  switch (category) {
    case 'serif':
      return 'serif'
    case 'sans-serif':
      return 'sans-serif'
    case 'display':
      return 'sans-serif'
    case 'handwriting':
      return 'cursive'
    case 'monospace':
      return 'monospace'
    default:
      return 'sans-serif'
  }
}

export function PreviewArea() {
  const { fontPairs, activePairId, setActivePair, updateFontPair, addFontPair, deleteFontPair, fontLock, canAccessFontLocking, globalText, headingFontFilters, bodyFontFilters } = useFontPairStore()
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [forceUpdate, setForceUpdate] = useState(0)
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set())
  const prevFontPairsRef = useRef<typeof fontPairs>([])
  const [allFonts, setAllFonts] = useState<GoogleFont[]>([])
  const [editingPairId, setEditingPairId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Define lock states early so they can be used in useEffect
  const isHeadingLocked = fontLock.headingLocked && canAccessFontLocking()
  const isBodyLocked = fontLock.bodyLocked && canAccessFontLocking()

  useEffect(() => {
    fetchGoogleFonts().then(setAllFonts)
  }, [])

  // Create filtered font lists based on current filters
  const filteredHeadingFonts = useMemo(() => {
    return allFonts.filter(font => {
      const matchesCategory = headingFontFilters.categories.includes(font.category as any)
      const hasMatchingWeight = font.variants.some(variant => {
        const weight = parseInt(variant === 'regular' ? '400' : variant)
        return weight >= headingFontFilters.weightRange[0] && weight <= headingFontFilters.weightRange[1]
      })
      return matchesCategory && hasMatchingWeight
    })
  }, [allFonts, headingFontFilters])

  const filteredBodyFonts = useMemo(() => {
    return allFonts.filter(font => {
      const matchesCategory = bodyFontFilters.categories.includes(font.category as any)
      const hasMatchingWeight = font.variants.some(variant => {
        const weight = parseInt(variant === 'regular' ? '400' : variant)
        return weight >= bodyFontFilters.weightRange[0] && weight <= bodyFontFilters.weightRange[1]
      })
      return matchesCategory && hasMatchingWeight
    })
  }, [allFonts, bodyFontFilters])

  // Auto-update font pairs that don't match current filters
  useEffect(() => {
    if (filteredHeadingFonts.length === 0 || filteredBodyFonts.length === 0) return

    fontPairs.forEach(pair => {
      const headingWeight = parseInt(pair.headingFont.weight)
      const bodyWeight = parseInt(pair.bodyFont.weight)

      const headingMatches = headingFontFilters.categories.includes((pair.headingFont.category || 'sans-serif') as any) &&
        headingWeight >= headingFontFilters.weightRange[0] && headingWeight <= headingFontFilters.weightRange[1]
      const bodyMatches = bodyFontFilters.categories.includes((pair.bodyFont.category || 'sans-serif') as any) &&
        bodyWeight >= bodyFontFilters.weightRange[0] && bodyWeight <= bodyFontFilters.weightRange[1]

      if (!headingMatches || !bodyMatches) {
        // Auto-randomize pairs that don't match current filters
        randomizeFontPair(pair.id)
      }
    })
  }, [headingFontFilters, bodyFontFilters, filteredHeadingFonts, filteredBodyFonts])

  const randomizeFontPair = (id: string) => {
    if (filteredHeadingFonts.length === 0 || filteredBodyFonts.length === 0) return

    // Get two random fonts from filtered lists
    const randomIndex1 = Math.floor(Math.random() * filteredHeadingFonts.length)
    const randomIndex2 = Math.floor(Math.random() * filteredBodyFonts.length)

    const headingFont = filteredHeadingFonts[randomIndex1]
    const bodyFont = filteredBodyFonts[randomIndex2]

    // Get available weights for each font, filtered by current filter settings
    const headingWeights = getFontWeights(headingFont).filter(weight => {
      const weightNum = parseInt(weight)
      return weightNum >= headingFontFilters.weightRange[0] && weightNum <= headingFontFilters.weightRange[1]
    })
    const bodyWeights = getFontWeights(bodyFont).filter(weight => {
      const weightNum = parseInt(weight)
      return weightNum >= bodyFontFilters.weightRange[0] && weightNum <= bodyFontFilters.weightRange[1]
    })

    // Filter body weights to be 300-400 range if possible, but respect filter constraints
    const bodyWeightOptions = bodyWeights.filter(weight => parseInt(weight) >= 300 && parseInt(weight) <= 400)
    const finalBodyWeights = bodyWeightOptions.length > 0 ? bodyWeightOptions : bodyWeights.filter(weight => parseInt(weight) <= 400)
    const fallbackBodyWeights = finalBodyWeights.length > 0 ? finalBodyWeights : bodyWeights

    // Filter heading weights to be 400-900 range and always bolder than body if possible
    const randomBodyWeight = fallbackBodyWeights[Math.floor(Math.random() * fallbackBodyWeights.length)]
    const bodyWeightNum = parseInt(randomBodyWeight)
    const headingWeightOptions = headingWeights.filter(weight => parseInt(weight) >= Math.max(400, bodyWeightNum + 100) && parseInt(weight) <= 900)
    const finalHeadingWeights = headingWeightOptions.length > 0 ? headingWeightOptions : headingWeights.filter(weight => parseInt(weight) > bodyWeightNum)
    const fallbackHeadingWeights = finalHeadingWeights.length > 0 ? finalHeadingWeights : headingWeights

    const randomHeadingWeight = fallbackHeadingWeights.length > 0
      ? fallbackHeadingWeights[Math.floor(Math.random() * fallbackHeadingWeights.length)]
      : '700' // fallback to 700 if no weights available

    // Update the font pair
    updateFontPair(id, {
      headingFont: {
        family: headingFont.family,
        weight: randomHeadingWeight,
        category: headingFont.category,
        lineHeight: 1.2,
        letterSpacing: -0.03
      },
      bodyFont: {
        family: bodyFont.family,
        weight: randomBodyWeight,
        category: bodyFont.category,
        lineHeight: 1.6,
        letterSpacing: 0
      }
    })
  }

  const randomizeAllFontPairs = () => {
    if (filteredHeadingFonts.length === 0 || filteredBodyFonts.length === 0) return

    fontPairs.forEach(pair => {
      randomizeFontPair(pair.id)
    })
  }


  // Load fonts when fontPairs changes, but only for changed pairs
  useEffect(() => {
    const prevPairs = prevFontPairsRef.current
    const changedPairs = fontPairs.filter((pair, index) => {
      const prevPair = prevPairs[index]
      return !prevPair ||
        prevPair.headingFont.family !== pair.headingFont.family ||
        prevPair.headingFont.weight !== pair.headingFont.weight ||
        prevPair.bodyFont.family !== pair.bodyFont.family ||
        prevPair.bodyFont.weight !== pair.bodyFont.weight
    })

    // Only load fonts for actually changed pairs (not global font changes)
    changedPairs.forEach(pair => {
      const effectiveHeadingFont = getEffectiveHeadingFont(pair)
      const effectiveBodyFont = getEffectiveBodyFont(pair)

      if (effectiveHeadingFont.family) {
        const fontKey = `${effectiveHeadingFont.family}-${effectiveHeadingFont.weight}`
        setLoadingFonts(prev => new Set(prev).add(fontKey))
        loadGoogleFont(effectiveHeadingFont.family, [effectiveHeadingFont.weight])

        // Check if font is loaded after a delay
        setTimeout(() => {
          setLoadingFonts(prev => {
            const updated = new Set(prev)
            updated.delete(fontKey)
            return updated
          })
        }, 1000)
      }
      if (effectiveBodyFont.family) {
        const fontKey = `${effectiveBodyFont.family}-${effectiveBodyFont.weight}`
        setLoadingFonts(prev => new Set(prev).add(fontKey))
        loadGoogleFont(effectiveBodyFont.family, [effectiveBodyFont.weight])

        // Check if font is loaded after a delay
        setTimeout(() => {
          setLoadingFonts(prev => {
            const updated = new Set(prev)
            updated.delete(fontKey)
            return updated
          })
        }, 1000)
      }
    })

    prevFontPairsRef.current = fontPairs

    // Force a re-render to ensure fonts are applied
    setForceUpdate(prev => prev + 1)
  }, [fontPairs])

  // Effect for handling global font lock changes
  useEffect(() => {
    // Load global fonts when they are set
    if (isHeadingLocked && fontLock.globalHeadingFont) {
      loadGoogleFont(fontLock.globalHeadingFont.family, [fontLock.globalHeadingFont.weight])
    }

    if (isBodyLocked && fontLock.globalBodyFont) {
      loadGoogleFont(fontLock.globalBodyFont.family, [fontLock.globalBodyFont.weight])
    }

    // Force re-render to apply global font overrides to all cards
    setForceUpdate(prev => prev + 1)
  }, [fontLock.headingLocked, fontLock.bodyLocked, fontLock.globalHeadingFont, fontLock.globalBodyFont])

  useEffect(() => {
    if (activePairId && cardRefs.current[activePairId]) {
      cardRefs.current[activePairId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [activePairId])

  const handleNameEdit = (pairId: string, currentName: string) => {
    setEditingPairId(pairId)
    setEditingName(currentName)
  }

  const handleNameSave = (pairId: string) => {
    if (editingName.trim()) {
      updateFontPair(pairId, { name: editingName.trim() })
    }
    setEditingPairId(null)
    setEditingName('')
  }

  const handleNameCancel = () => {
    setEditingPairId(null)
    setEditingName('')
  }

  const handleNameKeyDown = (e: React.KeyboardEvent, pairId: string) => {
    if (e.key === 'Enter') {
      handleNameSave(pairId)
    } else if (e.key === 'Escape') {
      handleNameCancel()
    }
  }

  const handleHeadingFontChange = (pairId: string, family: string, weight: string, category?: string, isCustom?: boolean) => {
    updateFontPair(pairId, {
      headingFont: { family, weight, category, lineHeight: 1.2, letterSpacing: -0.03, isCustom }
    })
  }

  const handleBodyFontChange = (pairId: string, family: string, weight: string, category?: string, isCustom?: boolean) => {
    updateFontPair(pairId, {
      bodyFont: { family, weight, category, lineHeight: 1.6, letterSpacing: 0, isCustom }
    })
  }

  // Helper functions to get the effective font (global override or pair font)
  // Using useMemo to ensure proper reactivity to fontLock changes
  const getEffectiveHeadingFont = useMemo(() => {
    return (pair: typeof fontPairs[0]) => {
      if (isHeadingLocked && fontLock.globalHeadingFont) {
        return {
          family: fontLock.globalHeadingFont.family,
          weight: fontLock.globalHeadingFont.weight,
          category: fontLock.globalHeadingFont.category || 'sans-serif',
          lineHeight: 1.2,
          letterSpacing: -0.03,
          isCustom: fontLock.globalHeadingFont.isCustom
        }
      }
      return pair.headingFont
    }
  }, [isHeadingLocked, fontLock.globalHeadingFont])

  const getEffectiveBodyFont = useMemo(() => {
    return (pair: typeof fontPairs[0]) => {
      if (isBodyLocked && fontLock.globalBodyFont) {
        return {
          family: fontLock.globalBodyFont.family,
          weight: fontLock.globalBodyFont.weight,
          category: fontLock.globalBodyFont.category || 'sans-serif',
          lineHeight: 1.6,
          letterSpacing: 0,
          isCustom: fontLock.globalBodyFont.isCustom
        }
      }
      return pair.bodyFont
    }
  }, [isBodyLocked, fontLock.globalBodyFont])

  return (
    <div className="bg-muted dark:bg-background flex-1 h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent hover:scrollbar-thumb-muted-foreground relative" style={{ pointerEvents: 'none' }}>
      {/* Content area */}
      <div className="p-2 pr-4 lg:p-4 lg:pr-6  w-full " style={{ pointerEvents: 'auto' }}>

        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4 lg:gap-6 w-full">
          {fontPairs.map((pair) => {
            const effectiveHeadingFont = getEffectiveHeadingFont(pair)
            const effectiveBodyFont = getEffectiveBodyFont(pair)

            return (<Card
              key={pair.id}
              ref={(el) => {
                cardRefs.current[pair.id] = el
              }}
              className={`bg-card p-6 cursor-pointer transition-all outline-2 outline-offset-2 flex flex-col ${activePairId === pair.id
                ? 'outline-foreground shadow-lg'
                : 'outline-transparent hover:-translate-y-1 hover:shadow-lg'
                }`}
              onClick={(e) => {
                // Only set active if clicking outside interactive text
                if (!(e.target as HTMLElement).closest('[data-interactive-text]')) {
                  setActivePair(pair.id)
                }
              }}
            >
              <div className="flex flex-col h-full w-full">
                {/* Header with name and randomize button */}
                <div className="flex items-center justify-between mb-2">
                  {editingPairId === pair.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => handleNameKeyDown(e, pair.id)}
                      onBlur={() => handleNameSave(pair.id)}
                      className="!text-xs text-muted-foreground uppercase tracking-wider font-semibold border-none px-0 h-auto shadow-none focus-visible:ring-0 bg-transparent"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="text-xs text-muted-foreground uppercase tracking-wider font-semibold cursor-pointer hover:text-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNameEdit(pair.id, pair.name)
                      }}
                      title="Click to rename"
                    >
                      {pair.name}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      randomizeFontPair(pair.id)
                    }}
                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 opacity-60 hover:opacity-100 transition-opacity"
                    title="Randomize font pairing"
                    disabled={filteredHeadingFonts.length === 0 || filteredBodyFonts.length === 0}
                  >
                    <Dices className="w-5 h-5" />
                  </Button>
                </div>

                {/* Display text that fills available space */}
                <div className="flex-1 flex flex-col">

                  {loadingFonts.has(`${effectiveHeadingFont.family}-${effectiveHeadingFont.weight}`) ? (
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-[3em] w-full" />
                      <Skeleton className="h-[3em] w-4/5" />
                    </div>
                  ) : (
                    <InteractiveText
                      pairId={pair.id}
                      textType="heading"
                      key={`heading-${pair.id}-${effectiveHeadingFont.family}-${effectiveHeadingFont.weight}-${forceUpdate}`}
                      className="text-foreground text-balance"
                      style={{
                        fontFamily: `"${effectiveHeadingFont.family}", ${getFontFallback(effectiveHeadingFont.category || 'sans-serif')}`,
                        fontWeight: effectiveHeadingFont.weight,
                        lineHeight: effectiveHeadingFont.lineHeight,
                        letterSpacing: `${effectiveHeadingFont.letterSpacing}px`,
                        fontSize: `${headingFontFilters.fontSize}px`
                      }}
                    >
                      {globalText.headingText}
                    </InteractiveText>
                  )}

                  {loadingFonts.has(`${effectiveBodyFont.family}-${effectiveBodyFont.weight}`) ? (
                    <div className="space-y-2 mt-4 leading-relaxed w-full">
                      <Skeleton className="h-[1.5em] w-full" />
                      <Skeleton className="h-[1.5em] w-full" />
                      <Skeleton className="h-[1.5em] w-full" />
                      <Skeleton className="h-[1.5em] w-3/4" />
                    </div>
                  ) : (
                    <InteractiveText
                      pairId={pair.id}
                      textType="body"
                      key={`body-${pair.id}-${effectiveBodyFont.family}-${effectiveBodyFont.weight}-${forceUpdate}`}
                      className="text-muted-foreground mt-4 pb-4"
                      style={{
                        fontFamily: `"${effectiveBodyFont.family}", ${getFontFallback(effectiveBodyFont.category || 'sans-serif')}`,
                        fontWeight: effectiveBodyFont.weight,
                        lineHeight: effectiveBodyFont.lineHeight,
                        letterSpacing: `${effectiveBodyFont.letterSpacing}px`,
                        fontSize: `${bodyFontFilters.fontSize}px`
                      }}
                    >
                      {globalText.bodyText}
                    </InteractiveText>
                  )}
                </div>

                {/* Single inline editor for both fonts - exactly like sidebar card */}
                <div className="pt-4 border-t border-border text-xs text-muted-foreground mt-auto">
                  <InlineFontPopover
                    pairId={pair.id}
                    pair={pair}
                    isHeadingLocked={isHeadingLocked}
                    isBodyLocked={isBodyLocked}
                    onHeadingFontChange={(family, weight, category, isCustom) =>
                      handleHeadingFontChange(pair.id, family, weight, category, isCustom)
                    }
                    onBodyFontChange={(family, weight, category, isCustom) =>
                      handleBodyFontChange(pair.id, family, weight, category, isCustom)
                    }
                    onDeletePair={deleteFontPair}
                    onRandomizePair={randomizeFontPair}
                    fontPairsCount={fontPairs.length}
                    trigger={
                      <div className="space-y-1 hover:bg-muted/30 p-2 -m-2 rounded transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Heading:</span>
                          <span className="flex-1 ml-2">{effectiveHeadingFont.family} {effectiveHeadingFont.weight}</span>
                          {isHeadingLocked && <Lock className="w-3 h-3 ml-2 opacity-60" />}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Body:</span>
                          <span className="flex-1 ml-2">{effectiveBodyFont.family} {effectiveBodyFont.weight}</span>
                          {isBodyLocked && <Lock className="w-3 h-3 ml-2 opacity-60" />}
                        </div>
                        <div className="text-xs opacity-50 text-center mt-2">
                          Click to edit fonts
                        </div>
                      </div>
                    }
                  />
                </div>
              </div>
            </Card>
            )
          })}

          {/* Add New Pair Card */}
          <Card
            className="bg-card min-h-[20rem] p-6 cursor-pointer transition-all outline-2 outline-offset-2 flex flex-col outline-transparent hover:-translate-y-1 hover:shadow-lg border-dashed border-2 border-border hover:border-foreground/50"
            onClick={() => {
              if (filteredHeadingFonts.length === 0 || filteredBodyFonts.length === 0) {
                // Fallback to all fonts if no filtered fonts available
                addFontPair(undefined, allFonts)
                return
              }

              // Create a new pair using our filtering logic (same as randomizeFontPair)
              const randomIndex1 = Math.floor(Math.random() * filteredHeadingFonts.length)
              const randomIndex2 = Math.floor(Math.random() * filteredBodyFonts.length)

              const headingFont = filteredHeadingFonts[randomIndex1]
              const bodyFont = filteredBodyFonts[randomIndex2]

              // Get available weights for each font, filtered by current filter settings
              const headingWeights = getFontWeights(headingFont).filter(weight => {
                const weightNum = parseInt(weight)
                return weightNum >= headingFontFilters.weightRange[0] && weightNum <= headingFontFilters.weightRange[1]
              })
              const bodyWeights = getFontWeights(bodyFont).filter(weight => {
                const weightNum = parseInt(weight)
                return weightNum >= bodyFontFilters.weightRange[0] && weightNum <= bodyFontFilters.weightRange[1]
              })

              // Filter body weights to be 300-400 range if possible, but respect filter constraints
              const bodyWeightOptions = bodyWeights.filter(weight => parseInt(weight) >= 300 && parseInt(weight) <= 400)
              const finalBodyWeights = bodyWeightOptions.length > 0 ? bodyWeightOptions : bodyWeights.filter(weight => parseInt(weight) <= 400)
              const fallbackBodyWeights = finalBodyWeights.length > 0 ? finalBodyWeights : bodyWeights

              // Filter heading weights to be 400-900 range and always bolder than body if possible
              const randomBodyWeight = fallbackBodyWeights[Math.floor(Math.random() * fallbackBodyWeights.length)]
              const bodyWeightNum = parseInt(randomBodyWeight)
              const headingWeightOptions = headingWeights.filter(weight => parseInt(weight) >= Math.max(400, bodyWeightNum + 100) && parseInt(weight) <= 900)
              const finalHeadingWeights = headingWeightOptions.length > 0 ? headingWeightOptions : headingWeights.filter(weight => parseInt(weight) > bodyWeightNum)
              const fallbackHeadingWeights = finalHeadingWeights.length > 0 ? finalHeadingWeights : headingWeights

              const randomHeadingWeight = fallbackHeadingWeights.length > 0
                ? fallbackHeadingWeights[Math.floor(Math.random() * fallbackHeadingWeights.length)]
                : '700' // fallback to 700 if no weights available

              // Create the custom pair
              const customPair = {
                headingFont: {
                  family: headingFont.family,
                  weight: randomHeadingWeight,
                  category: headingFont.category,
                  lineHeight: 1.2,
                  letterSpacing: -0.03
                },
                bodyFont: {
                  family: bodyFont.family,
                  weight: randomBodyWeight,
                  category: bodyFont.category,
                  lineHeight: 1.6,
                  letterSpacing: 0
                }
              }

              addFontPair(customPair)
            }}
          >
            <div className="flex flex-col h-full w-full items-center justify-center">
              <div className="flex flex-col items-center justify-center flex-1 space-y-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-sm text-muted-foreground font-medium text-center">
                  Add New Pair
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Floating randomize button */}
      <Button
        onClick={randomizeAllFontPairs}
        className="fixed bottom-6 right-6 !h-16 !w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-10"
        title="Randomize all font pairs"
        disabled={filteredHeadingFonts.length === 0 || filteredBodyFonts.length === 0}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center justify-center">
          <Dices className="!w-8 !h-8" strokeWidth={1.2} />
        </div>

      </Button>
    </div>
  )
}