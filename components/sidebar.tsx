'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useFontPairStore, FontCategory } from '@/lib/store'
import { GoogleFont, fetchGoogleFonts } from '@/lib/google-fonts'

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
    setGlobalText,
    setHeadingFontFilters,
    setBodyFontFilters,
    setHeadingWeightRange,
    setBodyWeightRange,
    setHeadingFontSize,
    setBodyFontSize
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

  return (
    <div className="w-88 border-r border-border flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent">
        <div className="py-4 px-4">
          {/* Heading Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-[1px]">Heading</h2>

            <Accordion type="multiple" defaultValue={["heading-display", "heading-size", "heading-style", "heading-weight"]} className="space-y-2">
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
                  <div className="flex items-center justify-end mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHeadingFontSize(48)}
                      className="h-6 px-2 text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{headingFontFilters.fontSize}px</span>
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
                  Style
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {categoryOrder.map(category => {
                      const isSelected = headingFontFilters.categories.includes(category)

                      return (
                        <button
                          key={`heading-${category}`}
                          onClick={() => handleCategoryToggle(category, true)}
                          className={`p-3 rounded-lg border-2 text-sm transition-all duration-200 ${isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          style={categoryFontStyles[category as keyof typeof categoryFontStyles]}
                        >
                          <div className="font-medium capitalize">{category.replace('-', ' ')}</div>
                          <div className="text-xs opacity-60 mt-1">({getCategoryCount(category)})</div>
                        </button>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Font Weight */}
              <AccordionItem value="heading-weight" className="border-none">
                <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                  Font Weight
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="flex items-center justify-end mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHeadingWeightRange([100, 900])}
                      className="h-6 px-2 text-xs"
                    >
                      {isFullWeightRange(true) ? 'Reset' : 'Full Range'}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{headingFontFilters.weightRange[0]}</span>
                      <span>{headingFontFilters.weightRange[1]}</span>
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
            </Accordion>
          </div>

          {/* Body Section */}
          <div className="space-y-4 mt-8">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-[1px]">Body</h2>

            <Accordion type="multiple" defaultValue={["body-display", "body-size", "body-style", "body-weight"]} className="space-y-2">
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
                  <div className="flex items-center justify-end mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBodyFontSize(16)}
                      className="h-6 px-2 text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{bodyFontFilters.fontSize}px</span>
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
                  Style
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {categoryOrder.map(category => {
                      const isSelected = bodyFontFilters.categories.includes(category)

                      return (
                        <button
                          key={`body-${category}`}
                          onClick={() => handleCategoryToggle(category, false)}
                          className={`p-3 rounded-lg border-2 text-sm transition-all duration-200 ${isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          style={categoryFontStyles[category as keyof typeof categoryFontStyles]}
                        >
                          <div className="font-medium capitalize">{category.replace('-', ' ')}</div>
                          <div className="text-xs opacity-60 mt-1">({getCategoryCount(category)})</div>
                        </button>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Font Weight */}
              <AccordionItem value="body-weight" className="border-none">
                <AccordionTrigger className="py-1 text-sm font-medium hover:no-underline">
                  Font Weight
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="flex items-center justify-end mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBodyWeightRange([100, 900])}
                      className="h-6 px-2 text-xs"
                    >
                      {isFullWeightRange(false) ? 'Reset' : 'Full Range'}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{bodyFontFilters.weightRange[0]}</span>
                      <span>{bodyFontFilters.weightRange[1]}</span>
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
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  )
}