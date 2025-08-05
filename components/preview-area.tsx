'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { useFontPairStore } from '@/lib/store'

const PREVIEW_HEADING = "Great typography guides the eye"
const PREVIEW_BODY = "Customize responsive typography systems for your fonts with meticulously designed editors for line height and letter spacing across font sizes and breakpoints."

export function PreviewArea() {
  const { fontPairs, activePairId, setActivePair } = useFontPairStore()
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    if (activePairId && cardRefs.current[activePairId]) {
      cardRefs.current[activePairId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [activePairId])

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex flex-wrap gap-6 justify-center">
        {fontPairs.map((pair) => (
          <Card
            key={pair.id}
            ref={(el) => (cardRefs.current[pair.id] = el)}
            className={`p-6 max-w-lg cursor-pointer transition-all outline-2 outline-offset-2 ${activePairId === pair.id
                ? 'outline-black bg-stone-50 shadow-lg'
                : 'outline-transparent hover:outline-stone-200'
              }`}
            onClick={() => setActivePair(pair.id)}
          >
            <div className="space-y-4">
              <div className="text-xs text-stone-500 uppercase tracking-wider">
                {pair.name}
              </div>

              <div
                className="text-4xl leading-tight text-stone-900"
                style={{
                  fontFamily: pair.headingFont.family,
                  fontWeight: pair.headingFont.weight
                }}
              >
                {PREVIEW_HEADING}
              </div>

              <div
                className="text-sm leading-relaxed text-stone-600"
                style={{
                  fontFamily: pair.bodyFont.family,
                  fontWeight: pair.bodyFont.weight
                }}
              >
                {PREVIEW_BODY}
              </div>

              <div className="pt-4 border-t border-stone-100 text-xs text-stone-500 space-y-1">
                <div>
                  <span className="font-medium ">Heading:</span> {pair.headingFont.family} {pair.headingFont.weight}
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
  )
}