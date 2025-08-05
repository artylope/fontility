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
  onFontChange: (family: string, weight: string) => void
}

export function FontSelector({ label, fontFamily, fontWeight, onFontChange }: FontSelectorProps) {
  const [open, setOpen] = useState(false)
  const [fonts, setFonts] = useState<GoogleFont[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFont, setSelectedFont] = useState<GoogleFont | null>(null)

  useEffect(() => {
    fetchGoogleFonts().then((googleFonts) => {
      setFonts(googleFonts)
      setLoading(false)

      const currentFont = googleFonts.find(f => f.family === fontFamily)
      if (currentFont) {
        setSelectedFont(currentFont)
        loadGoogleFont(currentFont.family, [fontWeight])
      } else if (fontFamily) {
        // Fallback: create a basic font object if not found in API response
        const fallbackFont: GoogleFont = {
          family: fontFamily,
          variants: ['400', '700'],
          category: 'sans-serif'
        }
        setSelectedFont(fallbackFont)
        loadGoogleFont(fontFamily, [fontWeight])
      }
    })
  }, [fontFamily, fontWeight])

  const handleFontSelect = (font: GoogleFont) => {
    setSelectedFont(font)
    setOpen(false)
    loadGoogleFont(font.family, [fontWeight])
    onFontChange(font.family, fontWeight)
  }

  const handleWeightChange = (weight: string) => {
    if (selectedFont) {
      loadGoogleFont(selectedFont.family, [weight])
      onFontChange(selectedFont.family, weight)
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
              className="w-full justify-between h-auto"
            >
              <span className="text-sm text-stone-900">
                {selectedFont?.family || 'Select font...'}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search fonts..." />
              <CommandList>
                <CommandEmpty>
                  {loading ? 'Loading fonts...' : 'No fonts found.'}
                </CommandEmpty>
                <CommandGroup>
                  {fonts.slice(0, 200).map((font) => (
                    <CommandItem
                      key={font.family}
                      value={font.family}
                      onSelect={() => handleFontSelect(font)}
                      className="flex items-center justify-between p-3"
                    >
                      <span className="font-medium">{font.family}</span>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4",
                          selectedFont?.family === font.family ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Select value={fontWeight} onValueChange={handleWeightChange} >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder="Select weight" className='text-stone-900'>
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
                return weightNames[fontWeight] || fontWeight
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