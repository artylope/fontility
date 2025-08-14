'use client'

import { FontCategory } from '@/lib/store'

// Font styles for category visualization
const categoryFontStyles = {
    'serif': { fontFamily: 'Georgia, serif' },
    'sans-serif': { fontFamily: 'Inter, -apple-system, system-ui, sans-serif' },
    'monospace': { fontFamily: 'Monaco, Consolas, "Liberation Mono", monospace' },
    'handwriting': { fontFamily: 'Brush Script MT, cursive' },
    'display': { fontFamily: 'Impact, "Arial Black", sans-serif' }
}

interface CategorySelectorProps {
    categories: FontCategory[]
    selectedCategories: FontCategory[]
    onCategoryToggle: (category: FontCategory) => void
    getCategoryCount: (category: FontCategory) => number
    categoryOrder?: FontCategory[]
}

export function CategorySelector({
    categories,
    selectedCategories,
    onCategoryToggle,
    getCategoryCount,
    categoryOrder = ['sans-serif', 'serif', 'monospace', 'handwriting', 'display']
}: CategorySelectorProps) {
    return (
        <div className="grid grid-cols-2 gap-2">
            {categoryOrder.map(category => {
                const isSelected = selectedCategories.includes(category)

                return (
                    <button
                        key={category}
                        onClick={() => onCategoryToggle(category)}
                        className={`p-3 rounded-lg border-2 text-sm transition-all duration-200 ${isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-transparent hover:border-primary/50 hover:bg-primary/5'
                            } cursor-pointer`}
                    >
                        <div
                            className="font-medium capitalize"
                            style={categoryFontStyles[category as keyof typeof categoryFontStyles]}
                        >
                            {category.replace('-', ' ')}
                        </div>
                        <div className="inline-flex items-center justify-center px-2 py-1 mt-2 text-xs bg-muted text-muted-foreground rounded-full font-normal">
                            {getCategoryCount(category)}
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
