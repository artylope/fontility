'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FontSelector } from './font-selector'
import { useFontPairStore } from '@/lib/store'

export function Sidebar() {
  const { fontPairs, addFontPair, deleteFontPair, updateFontPair } = useFontPairStore()

  const handleNameChange = (id: string, name: string) => {
    updateFontPair(id, { name })
  }

  const handleHeadingFontChange = (id: string, family: string, weight: string) => {
    updateFontPair(id, {
      headingFont: { family, weight }
    })
  }

  const handleBodyFontChange = (id: string, family: string, weight: string) => {
    updateFontPair(id, {
      bodyFont: { family, weight }
    })
  }

  return (
    <div className="w-96 bg-stone-50 border-r border-stone-200 p-4 flex flex-col h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Font Pairs</h2>
        <Button onClick={addFontPair} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Set
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {fontPairs.map((pair) => (
          <Card key={pair.id} className="p-4">
            <div className="flex items-center justify-between">
              <Input
                value={pair.name}
                onChange={(e) => handleNameChange(pair.id, e.target.value)}
                className="font-medium text-sm border-none px-0 h-auto shadow-none focus-visible:ring-0"
              />
              {fontPairs.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteFontPair(pair.id)}
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-stone-900 mb-2">Heading</div>
                <FontSelector
                  label=""
                  fontFamily={pair.headingFont.family}
                  fontWeight={pair.headingFont.weight}
                  onFontChange={(family, weight) => handleHeadingFontChange(pair.id, family, weight)}
                />
              </div>

              <div>
                <div className="text-xs font-medium text-stone-900 mb-2">Body</div>
                <FontSelector
                  label=""
                  fontFamily={pair.bodyFont.family}
                  fontWeight={pair.bodyFont.weight}
                  onFontChange={(family, weight) => handleBodyFontChange(pair.id, family, weight)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}