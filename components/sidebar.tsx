'use client'

import { Plus, Trash2, Dices } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FontSelector } from './font-selector'
import { useFontPairStore } from '@/lib/store'
import { useState, useEffect, useRef } from 'react'
import { GoogleFont, fetchGoogleFonts, getFontWeights } from '@/lib/google-fonts'

export function Sidebar() {
  const { fontPairs, activePairId, addFontPair, deleteFontPair, updateFontPair, setActivePair } = useFontPairStore()
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
    <div className="w-96 border-r border-stone-200 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent hover:scrollbar-thumb-stone-300">
      <div className="flex-1 space-y-4 py-4 px-4">
        {fontPairs.map((pair) => (
          <Card
            key={pair.id}
            ref={(el) => {
              cardRefs.current[pair.id] = el
            }}
            className={`space-y-1 p-3 pb-4 border-none shadow-none cursor-pointer transition-all outline-2 outline-offset-2 ${activePairId === pair.id
              ? 'bg-white outline-black shadow-lg'
              : 'outline-transparent hover:outline-stone-200'
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
                className="font-semibold border-none px-0 h-auto shadow-none focus-visible:ring-0"
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
              <div>
                <div className="text-xs font-medium text-stone-900 mb-2">Heading</div>
                <FontSelector
                  label=""
                  fontFamily={pair.headingFont.family}
                  fontWeight={pair.headingFont.weight}
                  onFontChange={(family, weight, category) => handleHeadingFontChange(pair.id, family, weight, category)}
                />
              </div>

              <div>
                <div className="text-xs font-medium text-stone-900 mb-2">Body</div>
                <FontSelector
                  label=""
                  fontFamily={pair.bodyFont.family}
                  fontWeight={pair.bodyFont.weight}
                  onFontChange={(family, weight, category) => handleBodyFontChange(pair.id, family, weight, category)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}