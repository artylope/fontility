'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dices, Plus } from 'lucide-react'
import { useFontPairStore } from '@/lib/store'
import { loadGoogleFont, getFontWeights, fetchGoogleFonts, GoogleFont } from '@/lib/google-fonts'
import { InteractiveText } from './interactive-text'

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

const PREVIEW_HEADING = "Great typography guides the reader's eye"
const PREVIEW_BODY = "Customize responsive typography systems for your fonts with meticulously designed editors for line height and letter spacing across font sizes and breakpoints."

export function PreviewArea() {
  const { fontPairs, activePairId, setActivePair, updateFontPair, addFontPair } = useFontPairStore()
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [forceUpdate, setForceUpdate] = useState(0)
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set())
  const prevFontPairsRef = useRef<typeof fontPairs>([])
  const [allFonts, setAllFonts] = useState<GoogleFont[]>([])
  const [editingPairId, setEditingPairId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

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

    // Only load fonts for changed pairs
    changedPairs.forEach(pair => {
      if (pair.headingFont.family) {
        const fontKey = `${pair.headingFont.family}-${pair.headingFont.weight}`
        setLoadingFonts(prev => new Set(prev).add(fontKey))
        loadGoogleFont(pair.headingFont.family, [pair.headingFont.weight])

        // Check if font is loaded after a delay
        setTimeout(() => {
          setLoadingFonts(prev => {
            const updated = new Set(prev)
            updated.delete(fontKey)
            return updated
          })
        }, 1000)
      }
      if (pair.bodyFont.family) {
        const fontKey = `${pair.bodyFont.family}-${pair.bodyFont.weight}`
        setLoadingFonts(prev => new Set(prev).add(fontKey))
        loadGoogleFont(pair.bodyFont.family, [pair.bodyFont.weight])

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

  return (
    <div className="flex-1 h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent" style={{ pointerEvents: 'none' }}>
      {/* Content area */}
      <div className="p-6 w-full" style={{ pointerEvents: 'auto' }}>

        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 w-full">
          {fontPairs.map((pair) => (
            <Card
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
                    disabled={allFonts.length === 0}
                  >
                    <Dices className="w-5 h-5" />
                  </Button>
                </div>

                {/* Display text that fills available space */}
                <div className="flex-1 flex flex-col">

                  {loadingFonts.has(`${pair.headingFont.family}-${pair.headingFont.weight}`) ? (
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-[3em] w-full" />
                      <Skeleton className="h-[3em] w-4/5" />
                    </div>
                  ) : (
                    <InteractiveText
                      pairId={pair.id}
                      textType="heading"
                      key={`heading-${pair.id}-${pair.headingFont.family}-${pair.headingFont.weight}-${forceUpdate}`}
                      className="text-[2.6em] text-foreground text-balance"
                      style={{
                        fontFamily: `"${pair.headingFont.family}", ${getFontFallback(pair.headingFont.category || 'sans-serif')}`,
                        fontWeight: pair.headingFont.weight,
                        lineHeight: pair.headingFont.lineHeight,
                        letterSpacing: `${pair.headingFont.letterSpacing}px`
                      }}
                    >
                      {PREVIEW_HEADING}
                    </InteractiveText>
                  )}

                  {loadingFonts.has(`${pair.bodyFont.family}-${pair.bodyFont.weight}`) ? (
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
                      key={`body-${pair.id}-${pair.bodyFont.family}-${pair.bodyFont.weight}-${forceUpdate}`}
                      className="text-muted-foreground mt-4 pb-4"
                      style={{
                        fontFamily: `"${pair.bodyFont.family}", ${getFontFallback(pair.bodyFont.category || 'sans-serif')}`,
                        fontWeight: pair.bodyFont.weight,
                        lineHeight: pair.bodyFont.lineHeight,
                        letterSpacing: `${pair.bodyFont.letterSpacing}px`
                      }}
                    >
                      {PREVIEW_BODY}
                    </InteractiveText>
                  )}
                </div>

                {/* Metadata that sits at the bottom */}
                <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1 mt-auto">
                  <div>
                    <span className="font-medium">Heading:</span> {pair.headingFont.family} {pair.headingFont.weight}
                  </div>
                  <div>
                    <span className="font-medium">Body:</span> {pair.bodyFont.family} {pair.bodyFont.weight}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Add New Pair Card */}
          <Card
            className="bg-card min-h-[20rem] p-6 cursor-pointer transition-all outline-2 outline-offset-2 flex flex-col outline-transparent hover:-translate-y-1 hover:shadow-lg border-dashed border-2 border-border hover:border-foreground/50"
            onClick={() => addFontPair()}
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
    </div>
  )
}