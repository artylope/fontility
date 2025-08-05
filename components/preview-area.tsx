'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFontPairStore } from '@/lib/store'
import { loadGoogleFont, getFontWeights } from '@/lib/google-fonts'

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
  const { fontPairs, activePairId, setActivePair } = useFontPairStore()
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [forceUpdate, setForceUpdate] = useState(0)
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set())

  // Load fonts when fontPairs changes
  useEffect(() => {
    console.log('PreviewArea - fontPairs updated:', fontPairs)

    const newLoadingFonts = new Set<string>()

    // Load fonts for all pairs
    fontPairs.forEach(pair => {
      if (pair.headingFont.family) {
        const fontKey = `${pair.headingFont.family}-${pair.headingFont.weight}`
        newLoadingFonts.add(fontKey)
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
        newLoadingFonts.add(fontKey)
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

    setLoadingFonts(newLoadingFonts)

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
    <div className="flex-1 p-8 overflow-y-scroll">
      <div className="flex flex-wrap gap-6 justify-center items-center ">
        <div className="flex flex-wrap gap-6 w-full">
          {fontPairs.map((pair) => (
            <Card
              key={pair.id}
              ref={(el) => {
                cardRefs.current[pair.id] = el
              }}
              className={`p-6 max-w-lg min-w-lg min-h-[400px] cursor-pointer transition-all outline-2 outline-offset-2 flex flex-col ${activePairId === pair.id
                ? 'outline-black bg-stone-50 shadow-lg'
                : 'outline-transparent hover:outline-stone-200'
                }`}
              onClick={() => setActivePair(pair.id)}
            >
              <div className="flex flex-col h-full w-full">
                {/* Display text that fills available space */}
                <div className="flex-1 flex flex-col">
                  <div className="text-xs text-stone-500 uppercase tracking-wider mb-4">
                    {pair.name}
                  </div>

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