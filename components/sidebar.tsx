'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useFontPairStore, FontCategory } from '@/lib/store'
import { GoogleFont, fetchGoogleFonts } from '@/lib/google-fonts'
import { FontSelector } from './font-selector'

// Font styles for category visualization
const categoryFontStyles = {
  'serif': { fontFamily: 'Georgia, serif' },
  'sans-serif': { fontFamily: 'Inter, -apple-system, system-ui, sans-serif' },
  'monospace': { fontFamily: 'Monaco, Consolas, "Liberation Mono", monospace' },
  'handwriting': { fontFamily: 'Brush Script MT, cursive' },
  'display': { fontFamily: 'Impact, "Arial Black", sans-serif' }
}

export function Sidebar() {
  const {
    globalText,
    headingFontFilters,
    bodyFontFilters,
    fontPairs,
    fontLock,
    canAccessFontLocking,
    setGlobalText,
    setHeadingFontFilters,
    setBodyFontFilters,
    setHeadingWeightRange,
    setBodyWeightRange,
    setHeadingFontSize,
    setBodyFontSize,
    setHeadingLocked,
    setBodyLocked,
    setGlobalHeadingFont,
    setGlobalBodyFont,
    updateFontPair,
    generatePairName
  } = useFontPairStore()

  const [allFonts, setAllFonts] = useState<GoogleFont[]>([])

  useEffect(() => {
    fetchGoogleFonts().then(setAllFonts)
  }, [])

  const getCategoryCount = (category: FontCategory): number => {
    return allFonts.filter(font => font.category === category).length
  }

  const handleCategoryToggle = (category: FontCategory, isHeading: boolean) => {
    const currentFilters = isHeading ? headingFontFilters : bodyFontFilters
    const newCategories = currentFilters.categories.includes(category)
      ? currentFilters.categories.filter(c => c !== category)
      : [...currentFilters.categories, category]

    if (isHeading) {
      setHeadingFontFilters({ categories: newCategories })
    } else {
      setBodyFontFilters({ categories: newCategories })
    }
  }

  const handleSelectAllCategories = (isHeading: boolean) => {
    const currentFilters = isHeading ? headingFontFilters : bodyFontFilters
    const allSelected = categoryOrder.every(category => currentFilters.categories.includes(category))

    if (isHeading) {
      setHeadingFontFilters({ categories: allSelected ? [] : categoryOrder })
    } else {
      setBodyFontFilters({ categories: allSelected ? [] : categoryOrder })
    }
  }

  const categoryOrder: FontCategory[] = ['sans-serif', 'serif', 'monospace', 'handwriting', 'display']

  const isAllCategoriesSelected = (isHeading: boolean) => {
    const filters = isHeading ? headingFontFilters : bodyFontFilters
    return categoryOrder.every(category => filters.categories.includes(category))
  }

  const isFullWeightRange = (isHeading: boolean) => {
    const filters = isHeading ? headingFontFilters : bodyFontFilters
    return filters.weightRange[0] === 100 && filters.weightRange[1] === 900
  }

  // Helper function to update all pair names
  const updateAllPairNames = () => {
    fontPairs.forEach(pair => {
      const newName = generatePairName(pair.headingFont, pair.bodyFont)
      if (newName !== pair.name) {
        updateFontPair(pair.id, { name: newName })
      }
    })
    // Update all pair names to reflect new font
    setTimeout(() => updateAllPairNames(), 0)
  }

  // Font lock handlers
  const handleHeadingLockToggle = (locked: boolean) => {
    if (!canAccessFontLocking()) return
    setHeadingLocked(locked)
    
    if (locked) {
      // Set default heading font if none exists
      if (!fontLock.globalHeadingFont) {
        setGlobalHeadingFont('Inter', '700', 'sans-serif', false)
      }
      // Update all existing pairs to use the global heading font
      const targetFont = fontLock.globalHeadingFont || { family: 'Inter', weight: '700', category: 'sans-serif', isCustom: false }
      fontPairs.forEach(pair => {
        updateFontPair(pair.id, {
          headingFont: { 
            family: targetFont.family, 
            weight: targetFont.weight, 
            category: targetFont.category, 
            lineHeight: 1.25, 
            letterSpacing: -0.025, 
            isCustom: targetFont.isCustom 
          }
        })
      })
    }
    
    // Update all pair names to reflect new lock state
    setTimeout(() => updateAllPairNames(), 0)
  }

  const handleBodyLockToggle = (locked: boolean) => {
    if (!canAccessFontLocking()) return
    setBodyLocked(locked)
    
    if (locked) {
      // Set default body font if none exists
      if (!fontLock.globalBodyFont) {
        setGlobalBodyFont('Inter', '400', 'sans-serif', false)
      }
      // Update all existing pairs to use the global body font
      const targetFont = fontLock.globalBodyFont || { family: 'Inter', weight: '400', category: 'sans-serif', isCustom: false }
      fontPairs.forEach(pair => {
        updateFontPair(pair.id, {
          bodyFont: { 
            family: targetFont.family, 
            weight: targetFont.weight, 
            category: targetFont.category, 
            lineHeight: 1.625, 
            letterSpacing: 0, 
            isCustom: targetFont.isCustom 
          }
        })
      })
    }
    
    // Update all pair names to reflect new lock state
    setTimeout(() => updateAllPairNames(), 0)
  }

  const handleGlobalHeadingFontChange = (family: string, weight: string, category?: string, isCustom?: boolean) => {
    setGlobalHeadingFont(family, weight, category, isCustom)
    // Update all pairs to use this font for headings
    fontPairs.forEach(pair => {
      updateFontPair(pair.id, {
        headingFont: { family, weight, category, lineHeight: 1.25, letterSpacing: -0.025, isCustom }
      })
    })
    // Update all pair names to reflect new font
    setTimeout(() => updateAllPairNames(), 0)
  }

  const handleGlobalBodyFontChange = (family: string, weight: string, category?: string, isCustom?: boolean) => {
    setGlobalBodyFont(family, weight, category, isCustom)
    // Update all pairs to use this font for body text
    fontPairs.forEach(pair => {
      updateFontPair(pair.id, {
        bodyFont: { family, weight, category, lineHeight: 1.625, letterSpacing: 0, isCustom }
      })
    })
    // Update all pair names to reflect new font
    setTimeout(() => updateAllPairNames(), 0)
  }


  // Lock state checks
  const isHeadingLocked = fontLock.headingLocked && canAccessFontLocking()
  const isBodyLocked = fontLock.bodyLocked && canAccessFontLocking()

  return (
    <div className="w-88 border-r border-border flex flex-col h-full">
      <div className="pb-48 flex-1 overflow-y-scroll scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
        <div className="">
          {/* Heading Section */}
          <div className="space-y-4 border-b border-border py-4 px-4">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-[1px]">Heading</h2>

            <Accordion type="multiple" defaultValue={["heading-display"]} className="space-y-2">
              {/* Display Text */}
              <AccordionItem value="heading-display" className="border-none">
                <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                  Display Text
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <Input
                    id="heading-text"
                    value={globalText.headingText}
                    onChange={(e) => setGlobalText(e.target.value, globalText.bodyText)}
                    className="text-sm"
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Font Size */}
              <AccordionItem value="heading-size" className="border-none">
                <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                  Font Size
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{headingFontFilters.fontSize}px</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHeadingFontSize(48)}
                        className="h-6 px-2 text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                    <Slider
                      value={[headingFontFilters.fontSize]}
                      onValueChange={(value) => setHeadingFontSize(value[0])}
                      min={12}
                      max={96}
                      step={2}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>12px</span>
                      <span>24px</span>
                      <span>36px</span>
                      <span>48px</span>
                      <span>60px</span>
                      <span>72px</span>
                      <span>84px</span>
                      <span>96px</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Style (Categories) */}
              <AccordionItem value="heading-style" className="border-none">
                <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                  Font Style
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-4">
                    {/* Lock to single font toggle */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="heading-lock" className="text-sm font-medium">
                        Lock to a single font for all pairs
                      </Label>
                      <Switch
                        id="heading-lock"
                        checked={isHeadingLocked}
                        onCheckedChange={handleHeadingLockToggle}
                        disabled={!canAccessFontLocking()}
                      />
                    </div>

                    {/* Font selector when locked */}
                    {isHeadingLocked && (
                      <div className="p-3 bg-muted rounded-lg">
                        <FontSelector
                          label=""
                          fontFamily={fontLock.globalHeadingFont?.family || 'Inter'}
                          fontWeight={fontLock.globalHeadingFont?.weight || '700'}
                          onFontChange={handleGlobalHeadingFontChange}
                        />
                      </div>
                    )}

                    {/* Category grid when not locked */}
                    {!isHeadingLocked && (
                      <div className="grid grid-cols-2 gap-2">
                    {categoryOrder.map(category => {
                      const isSelected = headingFontFilters.categories.includes(category)

                        return (
                          <button
                            key={`heading-${category}`}
                            onClick={() => handleCategoryToggle(category, true)}
                            className={`p-3 rounded-lg border-2 text-sm transition-all duration-200 ${isSelected
                              ? 'border-stone-900 bg-stone-900/10 text-stone-900'
                              : 'border-border bg-background hover:border-stone-900/50 hover:bg-stone-900/5'
                              } cursor-pointer`}
                          >
                            <div className="font-medium capitalize" style={categoryFontStyles[category as keyof typeof categoryFontStyles]}>
                              {category.replace('-', ' ')}
                            </div>
                            <div className="inline-flex items-center justify-center px-2 py-1 mt-2 text-xs bg-stone-100 text-stone-700 rounded-full font-normal">
                              {getCategoryCount(category)}
                            </div>
                          </button>
                        )
                      })}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Font Weight */}
              {!isHeadingLocked && (
                <AccordionItem value="heading-weight" className="border-none">
                  <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                    Font Weight
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{headingFontFilters.weightRange[0] === headingFontFilters.weightRange[1] ? headingFontFilters.weightRange[0] : `${headingFontFilters.weightRange[0]}-${headingFontFilters.weightRange[1]}`}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setHeadingWeightRange([100, 900])}
                          className="h-6 px-2 text-xs"
                        >
                          Reset
                        </Button>
                      </div>
                      <Slider
                        value={headingFontFilters.weightRange}
                        onValueChange={(value) => setHeadingWeightRange(value as [number, number])}
                        min={100}
                        max={900}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>100</span>
                        <span>200</span>
                        <span>300</span>
                        <span>400</span>
                        <span>500</span>
                        <span>600</span>
                        <span>700</span>
                        <span>800</span>
                        <span>900</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>

          {/* Body Section */}
          <div className="space-y-4 border-b border-border py-4 px-4">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-[1px]">Body</h2>

            <Accordion type="multiple" defaultValue={["body-display"]} className="space-y-2">
              {/* Display Text */}
              <AccordionItem value="body-display" className="border-none">
                <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                  Display Text
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <Textarea
                    id="body-text"
                    value={globalText.bodyText}
                    onChange={(e) => setGlobalText(globalText.headingText, e.target.value)}
                    className="text-sm min-h-[80px] resize-none"
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Font Size */}
              <AccordionItem value="body-size" className="border-none">
                <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                  Font Size
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{bodyFontFilters.fontSize}px</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBodyFontSize(16)}
                        className="h-6 px-2 text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                    <Slider
                      value={[bodyFontFilters.fontSize]}
                      onValueChange={(value) => setBodyFontSize(value[0])}
                      min={8}
                      max={32}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>8px</span>
                      <span>12px</span>
                      <span>16px</span>
                      <span>20px</span>
                      <span>24px</span>
                      <span>28px</span>
                      <span>32px</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Style (Categories) */}
              <AccordionItem value="body-style" className="border-none">
                <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                  Font Style
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-4">
                    {/* Lock to single font toggle */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="body-lock" className="text-sm font-medium">
                        Lock to a single font for all pairs
                      </Label>
                      <Switch
                        id="body-lock"
                        checked={isBodyLocked}
                        onCheckedChange={handleBodyLockToggle}
                        disabled={!canAccessFontLocking()}
                      />
                    </div>

                    {/* Font selector when locked */}
                    {isBodyLocked && (
                      <div className="p-3 bg-muted rounded-lg">
                        <FontSelector
                          label=""
                          fontFamily={fontLock.globalBodyFont?.family || 'Inter'}
                          fontWeight={fontLock.globalBodyFont?.weight || '400'}
                          onFontChange={handleGlobalBodyFontChange}
                        />
                      </div>
                    )}

                    {/* Category grid when not locked */}
                    {!isBodyLocked && (
                      <div className="grid grid-cols-2 gap-2">
                    {categoryOrder.map(category => {
                      const isSelected = bodyFontFilters.categories.includes(category)

                        return (
                          <button
                            key={`body-${category}`}
                            onClick={() => handleCategoryToggle(category, false)}
                            className={`p-3 rounded-lg border-2 text-sm transition-all duration-200 ${isSelected
                              ? 'border-stone-900 bg-stone-900/10 text-stone-900'
                              : 'border-border bg-background hover:border-stone-900/50 hover:bg-stone-900/5'
                              } cursor-pointer`}
                          >
                            <div className="font-medium capitalize" style={categoryFontStyles[category as keyof typeof categoryFontStyles]}>
                              {category.replace('-', ' ')}
                            </div>
                            <div className="inline-flex items-center justify-center px-2 py-1 mt-2 text-xs bg-stone-100 text-stone-700 rounded-full font-normal">
                              {getCategoryCount(category)}
                            </div>
                          </button>
                        )
                      })}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Font Weight */}
              {!isBodyLocked && (
                <AccordionItem value="body-weight" className="border-none">
                  <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                    Font Weight
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{bodyFontFilters.weightRange[0] === bodyFontFilters.weightRange[1] ? bodyFontFilters.weightRange[0] : `${bodyFontFilters.weightRange[0]}-${bodyFontFilters.weightRange[1]}`}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBodyWeightRange([100, 900])}
                          className="h-6 px-2 text-xs"
                        >
                          Reset
                        </Button>
                      </div>
                      <Slider
                        value={bodyFontFilters.weightRange}
                        onValueChange={(value) => setBodyWeightRange(value as [number, number])}
                        min={100}
                        max={900}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>100</span>
                        <span>200</span>
                        <span>300</span>
                        <span>400</span>
                        <span>500</span>
                        <span>600</span>
                        <span>700</span>
                        <span>800</span>
                        <span>900</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>

        </div>
      </div>
    </div>
  )
}