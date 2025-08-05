'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Dices, Plus } from 'lucide-react'
import { useFontPairStore } from '@/lib/store'
import { loadGoogleFont, getFontWeights, fetchGoogleFonts, GoogleFont } from '@/lib/google-fonts'

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

  // Load fonts when fontPairs changes, but only for changed pairs
  useEffect(() => {
    console.log('PreviewArea - fontPairs updated:', fontPairs)

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

  return (
    <div className="w-full flex-1 flex flex-col overflow-y-auto bg-stone-50  pb-12 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent hover:scrollbar-thumb-stone-300">
      {/* Header with buttons */}
      <div className="sticky top-0 p-8 py-4 pb-4 flex justify-start gap-2">

        <Button onClick={addFontPair} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Set
        </Button>          <Button
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

      </div>

      {/* Content area */}
      <div className="px-8 pb-16 flex-1 w-full">
        <div className="flex flex-wrap gap-6 justify-start w-full">
          {fontPairs.map((pair) => (
            <Card
              key={pair.id}
              ref={(el) => {
                cardRefs.current[pair.id] = el
              }}
              className={`bg-white p-6 w-full lg:w-1/3 xl:w-1/4 cursor-pointer transition-all outline-2 outline-offset-2 flex flex-col ${activePairId === pair.id
                ? 'outline-black shadow-lg'
                : 'outline-transparent hover:outline-stone-200'
                }`}
              onClick={() => setActivePair(pair.id)}
            >
              <div className="flex flex-col h-full w-full">
                {/* Header with name and randomize button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-stone-500 uppercase tracking-wider">
                    {pair.name}
                  </div>
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
                    <div
                      key={`heading-${pair.id}-${pair.headingFont.family}-${pair.headingFont.weight}-${forceUpdate}`}
                      className="text-[2.6em] leading-tight text-stone-900 tracking-tight text-balance"
                      style={{
                        fontFamily: `"${pair.headingFont.family}", ${getFontFallback(pair.headingFont.category || 'sans-serif')}`,
                        fontWeight: pair.headingFont.weight
                      }}
                    >
                      {PREVIEW_HEADING}
                    </div>
                  )}

                  {loadingFonts.has(`${pair.bodyFont.family}-${pair.bodyFont.weight}`) ? (
                    <div className="space-y-2 mt-4 leading-relaxed w-full">
                      <Skeleton className="h-[1.5em] w-full" />
                      <Skeleton className="h-[1.5em] w-full" />
                      <Skeleton className="h-[1.5em] w-full" />
                      <Skeleton className="h-[1.5em] w-3/4" />
                    </div>
                  ) : (
                    <div
                      key={`body-${pair.id}-${pair.bodyFont.family}-${pair.bodyFont.weight}-${forceUpdate}`}
                      className="leading-relaxed text-stone-600 mt-4"
                      style={{
                        fontFamily: `"${pair.bodyFont.family}", ${getFontFallback(pair.bodyFont.category || 'sans-serif')}`,
                        fontWeight: pair.bodyFont.weight
                      }}
                    >
                      {PREVIEW_BODY}
                    </div>
                  )}
                </div>

                {/* Metadata that sits at the bottom */}
                <div className="pt-4 border-t border-stone-100 text-xs text-stone-500 space-y-1 mt-auto">
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
        </div>
      </div>
    </div>
  )
}