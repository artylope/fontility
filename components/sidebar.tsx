'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

import { useFontPairStore, FontCategory } from '@/lib/store'
import { GoogleFont, fetchGoogleFonts } from '@/lib/google-fonts'
import { FontSelector } from './font-selector'
import { CategorySelector } from './category-selector'

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
    <div className="w-88 flex flex-col h-full">
      <div className="pb-48 flex-1 overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent hover:scrollbar-thumb-muted-foreground">
        <div className="">
          {/* Heading Section */}
          <div className="space-y-4 py-6 px-6">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-[1px]">Heading</h2>

            <div className="space-y-6">
              {/* Display Text */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Display Text</h3>
                <Input
                  id="heading-text"
                  value={globalText.headingText}
                  onChange={(e) => setGlobalText(e.target.value, globalText.bodyText)}
                  className="text-sm bg-background"
                />
              </div>

              {/* Font Size */}
              <div className="space-y-3">

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="heading-font-size" className="text-sm font-medium">
                      Font Size
                    </Label>
                  </div>
                  <Input
                    id="heading-font-size"
                    type="number"
                    value={headingFontFilters.fontSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (!isNaN(value) && value >= 12 && value <= 96) {
                        setHeadingFontSize(value)
                      }
                    }}
                    min={12}
                    max={96}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Style (Categories) */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Font Style</h3>
                <div className="space-y-4">
                  {/* Lock to single font toggle */}
                  <div className="flex items-center justify-between py-1">
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
                    <div className="">
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
                    <CategorySelector
                      categories={categoryOrder}
                      selectedCategories={headingFontFilters.categories}
                      onCategoryToggle={(category) => handleCategoryToggle(category, true)}
                      getCategoryCount={getCategoryCount}
                      categoryOrder={categoryOrder}
                    />
                  )}
                </div>
              </div>

              {/* Font Weight */}
              {!isHeadingLocked && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Font Weight</h3>
                  <div className="space-y-3">

                    <div className="grid grid-cols-5 gap-2">
                      {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(weight => {
                        const isSelected = headingFontFilters.weightRange[0] <= weight && weight <= headingFontFilters.weightRange[1]
                        return (
                          <button
                            key={weight}
                            onClick={() => {
                              if (headingFontFilters.weightRange[0] === headingFontFilters.weightRange[1] && headingFontFilters.weightRange[0] === weight) {
                                // If only this weight is selected, expand to include adjacent weights
                                setHeadingWeightRange([Math.max(100, weight - 100), Math.min(900, weight + 100)])
                              } else if (isSelected) {
                                // If this weight is in the range, try to exclude it
                                const newRange: [number, number] = headingFontFilters.weightRange[0] === weight
                                  ? [weight + 100, headingFontFilters.weightRange[1]]
                                  : headingFontFilters.weightRange[1] === weight
                                    ? [headingFontFilters.weightRange[0], weight - 100]
                                    : [headingFontFilters.weightRange[0], weight - 100]
                                if (newRange[0] <= newRange[1]) {
                                  setHeadingWeightRange(newRange)
                                }
                              } else {
                                // If this weight is not in the range, include it
                                const newRange: [number, number] = [
                                  Math.min(headingFontFilters.weightRange[0], weight),
                                  Math.max(headingFontFilters.weightRange[1], weight)
                                ]
                                setHeadingWeightRange(newRange)
                              }
                            }}
                            className={`px-2 py-1 rounded-md border text-xs transition-all duration-200 ${isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-transparent hover:border-primary/50 hover:bg-primary/5'
                              } cursor-pointer`}
                          >
                            {weight}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Body Section */}
          <div className="space-y-4  py-6 px-6">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-[1px]">Body</h2>

            <div className="space-y-6">
              {/* Display Text */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Display Text</h3>
                <Textarea
                  id="body-text"
                  value={globalText.bodyText}
                  onChange={(e) => setGlobalText(globalText.headingText, e.target.value)}
                  className="text-sm min-h-[80px] resize-none bg-background"
                />
              </div>

              {/* Font Size */}
              <div className="space-y-3">

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="body-font-size" className="text-sm font-medium">
                      Font Size
                    </Label>
                  </div>
                  <Input
                    id="body-font-size"
                    type="number"
                    value={bodyFontFilters.fontSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (!isNaN(value) && value >= 8 && value <= 32) {
                        setBodyFontSize(value)
                      }
                    }}
                    min={8}
                    max={32}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Style (Categories) */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Font Style</h3>
                <div className="space-y-4">
                  {/* Lock to single font toggle */}
                  <div className="flex items-center justify-between py-1">
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
                    <div className="">
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
                    <CategorySelector
                      categories={categoryOrder}
                      selectedCategories={bodyFontFilters.categories}
                      onCategoryToggle={(category) => handleCategoryToggle(category, false)}
                      getCategoryCount={getCategoryCount}
                      categoryOrder={categoryOrder}
                    />
                  )}
                </div>
              </div>

              {/* Font Weight */}
              {!isBodyLocked && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Font Weight</h3>
                  <div className="space-y-3">

                    <div className="grid grid-cols-5 gap-2">
                      {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(weight => {
                        const isSelected = bodyFontFilters.weightRange[0] <= weight && weight <= bodyFontFilters.weightRange[1]
                        return (
                          <button
                            key={weight}
                            onClick={() => {
                              if (bodyFontFilters.weightRange[0] === bodyFontFilters.weightRange[1] && bodyFontFilters.weightRange[0] === weight) {
                                // If only this weight is selected, expand to include adjacent weights
                                setBodyWeightRange([Math.max(100, weight - 100), Math.min(900, weight + 100)])
                              } else if (isSelected) {
                                // If this weight is in the range, try to exclude it
                                const newRange: [number, number] = bodyFontFilters.weightRange[0] === weight
                                  ? [weight + 100, bodyFontFilters.weightRange[1]]
                                  : bodyFontFilters.weightRange[1] === weight
                                    ? [bodyFontFilters.weightRange[0], weight - 100]
                                    : [bodyFontFilters.weightRange[0], weight - 100]
                                if (newRange[0] <= newRange[1]) {
                                  setBodyWeightRange(newRange)
                                }
                              } else {
                                // If this weight is not in the range, include it
                                const newRange: [number, number] = [
                                  Math.min(bodyFontFilters.weightRange[0], weight),
                                  Math.max(bodyFontFilters.weightRange[1], weight)
                                ]
                                setBodyWeightRange(newRange)
                              }
                            }}
                            className={`px-2 py-1 rounded-md border text-xs transition-all duration-200 ${isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-transparent hover:border-primary/50 hover:bg-primary/5'
                              } cursor-pointer`}
                          >
                            {weight}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}