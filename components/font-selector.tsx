'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { GoogleFont, fetchGoogleFonts, getFontWeights, loadGoogleFont } from '@/lib/google-fonts'

interface FontSelectorProps {
  label: string
  fontFamily: string
  fontWeight: string
  onFontChange: (family: string, weight: string, category?: string) => void
}

export function FontSelector({ label, fontFamily, fontWeight, onFontChange }: FontSelectorProps) {
  const [open, setOpen] = useState(false)
  const [fonts, setFonts] = useState<GoogleFont[]>([])
  const [popularFonts, setPopularFonts] = useState<GoogleFont[]>([])
  const [alphabeticalFonts, setAlphabeticalFonts] = useState<GoogleFont[]>([])
  const [loading, setLoading] = useState(true)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [selectedFont, setSelectedFont] = useState<GoogleFont | null>(null)

  useEffect(() => {
    // Load default fonts immediately for common fonts like Inter
    if (fontFamily === 'Inter') {
      const interFont: GoogleFont = {
        family: 'Inter',
        variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
        category: 'sans-serif'
      }
      setSelectedFont(interFont)
      loadGoogleFont('Inter', ['100', '200', '300', '400', '500', '600', '700', '800', '900'])
    }

    fetchGoogleFonts().then((googleFonts) => {
      setFonts(googleFonts)

      // Get top 20 popular fonts (already sorted by popularity from API)
      const top20 = googleFonts.slice(0, 20)
      setPopularFonts(top20)

      // Sort ALL fonts alphabetically for the second section
      const allFontsAlphabetical = [...googleFonts].sort((a, b) => a.family.localeCompare(b.family))
      // Remove the top 20 popular fonts from the alphabetical list to avoid duplicates
      const top20Names = new Set(top20.map(f => f.family))
      const alphabeticalOnly = allFontsAlphabetical.filter(font => !top20Names.has(font.family))
      setAlphabeticalFonts(alphabeticalOnly)

      setLoading(false)

      // Load all fonts immediately for preview
      const allFontsToLoad = [...top20, ...alphabeticalOnly.slice(0, 50)] // Load first 50 alphabetical fonts
      allFontsToLoad.forEach(font => {
        loadGoogleFont(font.family, ['400'])
      })

      // Set a reasonable timeout for fonts to load
      setTimeout(() => {
        setFontsLoaded(true)
      }, 2000)

      const currentFont = googleFonts.find(f => f.family === fontFamily)

      if (currentFont) {
        setSelectedFont(currentFont)
        const availableWeights = getFontWeights(currentFont)
        loadGoogleFont(currentFont.family, availableWeights)
        // Check if current weight is available, if not update to first available weight
        if (!availableWeights.includes(fontWeight)) {
          const newWeight = availableWeights[0]
          onFontChange(currentFont.family, newWeight, currentFont.category)
        }
      } else if (fontFamily && fontFamily !== 'Inter') {
        // Fallback: create a basic font object if not found in API response
        const fallbackFont: GoogleFont = {
          family: fontFamily,
          variants: ['400', '700'],
          category: 'sans-serif'
        }
        setSelectedFont(fallbackFont)
        loadGoogleFont(fontFamily, ['400', '700'])
        // Check if current weight is available, if not update to 400
        if (!['400', '700'].includes(fontWeight)) {
          onFontChange(fontFamily, '400', 'sans-serif')
        }
      }
    })
  }, [fontFamily, fontWeight])

  const handleFontSelect = (font: GoogleFont) => {

    // Check if this font was in our pre-loaded batch
    const allFontsToLoad = [...popularFonts, ...alphabeticalFonts.slice(0, 50)]
    const wasPreloaded = allFontsToLoad.some(f => f.family === font.family)

    setSelectedFont(font)
    setOpen(false)

    // Load all available weights for the selected font
    const availableWeights = getFontWeights(font)

    // Always load the font when selected, especially if it wasn't preloaded
    loadGoogleFont(font.family, availableWeights)

    if (!wasPreloaded) {
      // Force reload with a slight delay to ensure it loads properly
      setTimeout(() => {
        loadGoogleFont(font.family, availableWeights)
      }, 100)
    }

    // Check if current weight is available, otherwise use first available weight
    const newWeight = availableWeights.includes(fontWeight) ? fontWeight : availableWeights[0]
    onFontChange(font.family, newWeight, font.category)
  }

  const handleWeightChange = (weight: string) => {
    if (selectedFont) {
      // Ensure we have all available weights loaded, including the new one
      const availableWeights = getFontWeights(selectedFont)

      if (availableWeights.includes(weight)) {
        // Load the font with all available weights to ensure the selected weight is available
        loadGoogleFont(selectedFont.family, availableWeights)
        onFontChange(selectedFont.family, weight, selectedFont.category)
      } else {
        console.warn('Weight not available:', weight, 'for font:', selectedFont.family)
      }
    }
  }

  const availableWeights = selectedFont ? getFontWeights(selectedFont) : ['400']

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{label}</h3>
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={loading}
              className="w-full justify-between h-auto"
            >
              <span className="text-sm text-foreground !font-normal">
                {loading ? 'Loading fonts...' : selectedFont?.family || 'Select font...'}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search fonts..." />
              <CommandList>
                <CommandEmpty>
                  {loading ? 'Loading fonts...' : 'No fonts found.'}
                </CommandEmpty>
                {loading && (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-sm text-muted-foreground">Loading fonts...</div>
                  </div>
                )}
                {!loading && popularFonts.length > 0 && (
                  <CommandGroup heading="Popular Fonts">
                    {popularFonts.map((font) => (
                      <CommandItem
                        key={font.family}
                        value={font.family}
                        onSelect={() => handleFontSelect(font)}
                        className="flex items-center justify-between p-3"
                      >
                        <span
                          className="font-medium"
                          style={{ fontFamily: `"${font.family}", sans-serif` }}
                        >
                          {font.family}
                        </span>
                        <Check
                          className={cn(
                            "ml-2 h-4 w-4",
                            selectedFont?.family === font.family ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {!loading && alphabeticalFonts.length > 0 && (
                  <CommandGroup heading="All Fonts (A-Z)">
                    {alphabeticalFonts.map((font, index) => (
                      <CommandItem
                        key={font.family}
                        value={font.family}
                        onSelect={() => handleFontSelect(font)}
                        className="flex items-center justify-between p-3"
                      >
                        <span
                          className="font-medium"
                          style={{ fontFamily: `"${font.family}", sans-serif` }}
                          onMouseEnter={() => {
                            // Load font on hover if not already in the first 50
                            if (index >= 50) {
                              loadGoogleFont(font.family, ['400'])
                            }
                          }}
                        >
                          {font.family}
                        </span>
                        <Check
                          className={cn(
                            "ml-2 h-4 w-4",
                            selectedFont?.family === font.family ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Select value={fontWeight} onValueChange={handleWeightChange} >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder="Select weight" className='text-foreground'>
              {(() => {
                const weightNames: Record<string, string> = {
                  '100': '100 Thin',
                  '200': '200 Extra Light',
                  '300': '300 Light',
                  '400': '400 Regular',
                  '500': '500 Medium',
                  '600': '600 Semi Bold',
                  '700': '700 Bold',
                  '800': '800 Extra Bold',
                  '900': '900 Black'
                }
                const displayValue = weightNames[fontWeight] || fontWeight
                return displayValue
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableWeights.map((weight) => {
              const weightNames: Record<string, string> = {
                '100': '100 Thin',
                '200': '200 Extra Light',
                '300': '300 Light',
                '400': '400 Regular',
                '500': '500 Medium',
                '600': '600 Semi Bold',
                '700': '700 Bold',
                '800': '800 Extra Bold',
                '900': '900 Black'
              }
              return (
                <SelectItem key={weight} value={weight}>
                  {weightNames[weight] || weight}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}