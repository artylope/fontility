'use client'

import { useState, useEffect } from 'react'
import { Edit3, Lock, Trash2, Dices } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { FontSelector } from './font-selector'
import { GoogleFont, fetchGoogleFonts } from '@/lib/google-fonts'

interface InlineFontPopoverProps {
  pairId: string
  pair: {
    id: string
    name: string
    headingFont: {
      family: string
      weight: string
      category?: string
      isCustom?: boolean
    }
    bodyFont: {
      family: string
      weight: string
      category?: string
      isCustom?: boolean
    }
  }
  isHeadingLocked: boolean
  isBodyLocked: boolean
  onHeadingFontChange: (family: string, weight: string, category?: string, isCustom?: boolean) => void
  onBodyFontChange: (family: string, weight: string, category?: string, isCustom?: boolean) => void
  onDeletePair: (id: string) => void
  onRandomizePair: (id: string) => void
  fontPairsCount: number
  trigger: React.ReactNode
}

export function InlineFontPopover({ 
  pairId,
  pair,
  isHeadingLocked,
  isBodyLocked,
  onHeadingFontChange,
  onBodyFontChange,
  onDeletePair,
  onRandomizePair,
  fontPairsCount,
  trigger 
}: InlineFontPopoverProps) {
  const [open, setOpen] = useState(false)
  const [allFonts, setAllFonts] = useState<GoogleFont[]>([])

  useEffect(() => {
    fetchGoogleFonts().then(setAllFonts)
  }, [])

  const handleRandomizePair = () => {
    onRandomizePair(pairId)
    // Close the popover after randomizing
    setOpen(false)
  }

  const handleDeletePair = () => {
    onDeletePair(pairId)
    // Close the popover after deleting
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer hover:bg-muted/50 rounded-sm transition-colors">
          {trigger}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        {/* Replicate the exact sidebar card layout */}
        <div className="space-y-1 p-3 pb-4">
          {/* Header with buttons - exactly like sidebar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Edit Fonts
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRandomizePair}
                      className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                      title="Randomize font pairing"
                      disabled={allFonts.length === 0}
                    >
                      <Dices className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Randomize font pairing</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {fontPairsCount > 1 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeletePair}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        title="Delete this font pair"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete this font pair</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Heading Font Section */}
            {!isHeadingLocked && (
              <div>
                <div className="text-xs font-medium text-foreground mb-2">Heading</div>
                <FontSelector
                  label=""
                  fontFamily={pair.headingFont.family}
                  fontWeight={pair.headingFont.weight}
                  onFontChange={(family, weight, category, isCustom) => 
                    onHeadingFontChange(family, weight, category, isCustom)
                  }
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
                <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                  {pair.headingFont.family} {pair.headingFont.weight}
                </div>
              </div>
            )}

            {/* Body Font Section */}
            {!isBodyLocked && (
              <div>
                <div className="text-xs font-medium text-foreground mb-2">Body</div>
                <FontSelector
                  label=""
                  fontFamily={pair.bodyFont.family}
                  fontWeight={pair.bodyFont.weight}
                  onFontChange={(family, weight, category, isCustom) => 
                    onBodyFontChange(family, weight, category, isCustom)
                  }
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
                <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                  {pair.bodyFont.family} {pair.bodyFont.weight}
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}