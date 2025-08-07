import { CustomFont, CustomFontVariant } from './store'

export function loadCustomFont(customFont: CustomFont): Promise<void[]> {
  const promises = customFont.variants.map(variant => 
    loadCustomFontVariant(customFont.family, variant)
  )
  
  return Promise.all(promises)
}

export function loadCustomFontVariant(fontFamily: string, variant: CustomFontVariant): Promise<void> {
  return new Promise((resolve, reject) => {
    const fontFace = new FontFace(
      fontFamily,
      `url(${variant.url})`,
      {
        weight: variant.weight,
        style: variant.style
      }
    )

    fontFace.load()
      .then(loadedFace => {
        document.fonts.add(loadedFace)
        console.log(`Loaded custom font: ${fontFamily} ${variant.weight} ${variant.style}`)
        resolve()
      })
      .catch(error => {
        console.error(`Failed to load custom font: ${fontFamily} ${variant.weight} ${variant.style}`, error)
        reject(error)
      })
  })
}

export function unloadCustomFont(fontFamily: string): void {
  // Remove all font faces for this family
  const fontsToRemove = Array.from(document.fonts).filter(
    font => font.family === fontFamily
  )
  
  fontsToRemove.forEach(font => {
    document.fonts.delete(font)
  })
}

export function getCustomFontWeights(customFont: CustomFont): string[] {
  return customFont.variants
    .map(variant => variant.weight)
    .sort((a, b) => parseInt(a) - parseInt(b))
}

export function hasCustomFontWeight(customFont: CustomFont, weight: string): boolean {
  return customFont.variants.some(variant => variant.weight === weight)
}