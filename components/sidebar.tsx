'use client'

import { Plus, Trash2, Dices } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FontSelector } from './font-selector'
import { useFontPairStore } from '@/lib/store'
import { useState, useEffect } from 'react'
import { GoogleFont, fetchGoogleFonts, getFontWeights } from '@/lib/google-fonts'

export function Sidebar() {
  const { fontPairs, activePairId, addFontPair, deleteFontPair, updateFontPair, setActivePair } = useFontPairStore()
  const [allFonts, setAllFonts] = useState<GoogleFont[]>([])

  useEffect(() => {
    fetchGoogleFonts().then(setAllFonts)
  }, [])

  const handleNameChange = (id: string, name: string) => {
    updateFontPair(id, { name })
  }

  const handleHeadingFontChange = (id: string, family: string, weight: string, category?: string) => {
    updateFontPair(id, {
      headingFont: { family, weight, category }
    })
  }

  const handleBodyFontChange = (id: string, family: string, weight: string, category?: string) => {
    updateFontPair(id, {
      bodyFont: { family, weight, category }
    })
  }

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

  return (
    <div className="w-96 border-r border-stone-200 flex flex-col h-screen overflow-y-auto">
      <div className="flex items-center justify-between p-4 sticky top-0">
        <h2 className="text-lg font-semibold">Font Pairs</h2>
        <Button onClick={addFontPair} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Set
        </Button>
      </div>

      <div className="flex-1 space-y-4 p-4 pb-16">
        {fontPairs.map((pair) => (
          <Card
            key={pair.id}
            className={`space-y-4 p-4 rounded-lg cursor-pointer transition-all outline-2 outline-offset-2 ${activePairId === pair.id
              ? 'outline-black bg-stone-50 shadow-lg'
              : 'outline-transparent hover:outline-stone-200'
              }`}
            onClick={() => setActivePair(pair.id)}
          >
            <div className="flex items-center justify-between ">
              <Input
                value={pair.name}
                onChange={(e) => {
                  e.stopPropagation()
                  handleNameChange(pair.id, e.target.value)
                }}
                className="font-medium text-sm border-none px-0 h-auto shadow-none focus-visible:ring-0"
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