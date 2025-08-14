'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Lock } from 'lucide-react'
import { useFontPairStore, FontCategory, FontLockType } from '@/lib/store'
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
    setFontLockEnabled,
    setFontLockType,
    setGlobalHeadingFont,
    setGlobalBodyFont,
    updateFontPair
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

  // Font lock handlers
  const handleFontLockToggle = (enabled: boolean) => {
    if (!canAccessFontLocking()) return
    setFontLockEnabled(enabled)
  }

  const handleFontLockTypeChange = (value: string) => {
    if (!canAccessFontLocking()) return
    setFontLockType(value as FontLockType)
  }

  const handleGlobalHeadingFontChange = (family: string, weight: string, category?: string, isCustom?: boolean) => {
    setGlobalHeadingFont(family, weight, category, isCustom)
    // Update all pairs to use this font for headings
    fontPairs.forEach(pair => {
      updateFontPair(pair.id, {
        headingFont: { family, weight, category, lineHeight: 1.25, letterSpacing: -0.025, isCustom }
      })
    })
  }

  const handleGlobalBodyFontChange = (family: string, weight: string, category?: string, isCustom?: boolean) => {
    setGlobalBodyFont(family, weight, category, isCustom)
    // Update all pairs to use this font for body text
    fontPairs.forEach(pair => {
      updateFontPair(pair.id, {
        bodyFont: { family, weight, category, lineHeight: 1.625, letterSpacing: 0, isCustom }
      })
    })
  }


  // Lock state checks
  const isHeadingLocked = fontLock.enabled && fontLock.lockType === 'headings' && canAccessFontLocking()
  const isBodyLocked = fontLock.enabled && fontLock.lockType === 'body' && canAccessFontLocking()

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
              <AccordionItem value="heading-style" className={`border-none ${isHeadingLocked ? 'opacity-50' : ''}`}>
                <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                  <div className="flex items-center gap-2">
                    Font Style
                    {isHeadingLocked && <Lock className="w-3 h-3" />}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {categoryOrder.map(category => {
                      const isSelected = headingFontFilters.categories.includes(category)

                      return (
                        <button
                          key={`heading-${category}`}
                          onClick={() => !isHeadingLocked && handleCategoryToggle(category, true)}
                          disabled={isHeadingLocked}
                          className={`p-3 rounded-lg border-2 text-sm transition-all duration-200 ${isSelected
                            ? 'border-stone-900 bg-stone-900/10 text-stone-900'
                            : 'border-border bg-background hover:border-stone-900/50 hover:bg-stone-900/5'
                            } ${isHeadingLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
                </AccordionContent>
              </AccordionItem>

              {/* Font Weight */}
              <AccordionItem value="heading-weight" className={`border-none ${isHeadingLocked ? 'opacity-50' : ''}`}>
                <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                  <div className="flex items-center gap-2">
                    Font Weight
                    {isHeadingLocked && <Lock className="w-3 h-3" />}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{headingFontFilters.weightRange[0] === headingFontFilters.weightRange[1] ? headingFontFilters.weightRange[0] : `${headingFontFilters.weightRange[0]}-${headingFontFilters.weightRange[1]}`}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => !isHeadingLocked && setHeadingWeightRange([100, 900])}
                        disabled={isHeadingLocked}
                        className="h-6 px-2 text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                    <Slider
                      value={headingFontFilters.weightRange}
                      onValueChange={(value) => !isHeadingLocked && setHeadingWeightRange(value as [number, number])}
                      min={100}
                      max={900}
                      step={100}
                      disabled={isHeadingLocked}
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
              <AccordionItem value="body-style" className={`border-none ${isBodyLocked ? 'opacity-50' : ''}`}>
                <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                  <div className="flex items-center gap-2">
                    Font Style
                    {isBodyLocked && <Lock className="w-3 h-3" />}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {categoryOrder.map(category => {
                      const isSelected = bodyFontFilters.categories.includes(category)

                      return (
                        <button
                          key={`body-${category}`}
                          onClick={() => !isBodyLocked && handleCategoryToggle(category, false)}
                          disabled={isBodyLocked}
                          className={`p-3 rounded-lg border-2 text-sm transition-all duration-200 ${isSelected
                            ? 'border-stone-900 bg-stone-900/10 text-stone-900'
                            : 'border-border bg-background hover:border-stone-900/50 hover:bg-stone-900/5'
                            } ${isBodyLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
                </AccordionContent>
              </AccordionItem>

              {/* Font Weight */}
              <AccordionItem value="body-weight" className={`border-none ${isBodyLocked ? 'opacity-50' : ''}`}>
                <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                  <div className="flex items-center gap-2">
                    Font Weight
                    {isBodyLocked && <Lock className="w-3 h-3" />}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{bodyFontFilters.weightRange[0] === bodyFontFilters.weightRange[1] ? bodyFontFilters.weightRange[0] : `${bodyFontFilters.weightRange[0]}-${bodyFontFilters.weightRange[1]}`}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => !isBodyLocked && setBodyWeightRange([100, 900])}
                        disabled={isBodyLocked}
                        className="h-6 px-2 text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                    <Slider
                      value={bodyFontFilters.weightRange}
                      onValueChange={(value) => !isBodyLocked && setBodyWeightRange(value as [number, number])}
                      min={100}
                      max={900}
                      step={100}
                      disabled={isBodyLocked}
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
            </Accordion>
          </div>

          {/* Font Lock Settings */}
          <div className="space-y-4 border-b border-border py-4 px-4">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-[1px]">Advanced</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 w-full">
                  <div className="flex flex-col gap-1 w-full">
                    <Label htmlFor="font-lock" className="text-sm font-medium">
                      Lock to a single font for all pairs
                    </Label>
                  </div>
                  <div className="h-5 flex items-center">
                    <Switch
                      id="font-lock"
                      checked={fontLock.enabled && canAccessFontLocking()}
                      onCheckedChange={handleFontLockToggle}
                      disabled={!canAccessFontLocking()}
                    />
                  </div>
                </div>
              </div>

              {fontLock.enabled && canAccessFontLocking() && (
                <div className="space-y-4 p-4 border border-border rounded-lg">

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Choose which text type to lock</p>
                    <RadioGroup
                      value={fontLock.lockType}
                      onValueChange={handleFontLockTypeChange}
                      className="-space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="headings" id="headings" />
                        <Label htmlFor="headings" className="text-sm">
                          Heading
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="body" id="body" />
                        <Label htmlFor="body" className="text-sm">
                          Body
                        </Label>
                      </div>
                    </RadioGroup>

                    {(isHeadingLocked || isBodyLocked) && (
                      <div className="space-y-3 bg-muted rounded-lg px-4 pt-2 pb-4 mt-2">
                        {isHeadingLocked && (
                          <div className="space-y-2">
                            <FontSelector
                              label=""
                              fontFamily={fontLock.globalHeadingFont?.family || 'Inter'}
                              fontWeight={fontLock.globalHeadingFont?.weight || '700'}
                              onFontChange={handleGlobalHeadingFontChange}
                            />
                          </div>
                        )}

                        {isBodyLocked && (
                          <div className="space-y-2">
                            <FontSelector
                              label=""
                              fontFamily={fontLock.globalBodyFont?.family || 'Inter'}
                              fontWeight={fontLock.globalBodyFont?.weight || '400'}
                              onFontChange={handleGlobalBodyFontChange}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!canAccessFontLocking() && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Font locking is a Pro feature. Upgrade to unlock this functionality.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}