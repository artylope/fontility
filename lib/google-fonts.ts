export interface GoogleFont {
  family: string
  variants: string[]
  category: string
}

export interface GoogleFontsResponse {
  items: GoogleFont[]
}

const GOOGLE_FONTS_API_URL = 'https://www.googleapis.com/webfonts/v1/webfonts'

export async function fetchGoogleFonts(): Promise<GoogleFont[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY

  if (!apiKey) {
    console.warn('Google Fonts API key not found. Please add NEXT_PUBLIC_GOOGLE_FONTS_API_KEY to your .env.local file')
    return []
  }

  try {
    console.log('Fetching Google Fonts...')
    const response = await fetch(
      `${GOOGLE_FONTS_API_URL}?key=${apiKey}&sort=popularity`
    )

    if (!response.ok) {
      console.error('Google Fonts API response not ok:', response.status, response.statusText)
      throw new Error(`Failed to fetch Google Fonts: ${response.status}`)
    }

    const data: GoogleFontsResponse = await response.json()
    console.log(`Loaded ${data.items.length} fonts from Google Fonts API`)
    return data.items
  } catch (error) {
    console.error('Error fetching Google Fonts:', error)
    return []
  }
}

export function loadGoogleFont(fontFamily: string, weights: string[] = ['400']) {
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`
  
  // Remove existing font link to reload with new weights
  const existingLink = document.getElementById(fontId)
  if (existingLink) {
    existingLink.remove()
    console.log('Removed existing font link:', fontFamily)
  }

  const weightQuery = weights.join(',')
  // Properly encode the font family name for URLs
  const encodedFontFamily = encodeURIComponent(fontFamily)
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFontFamily}:wght@${weightQuery}&display=swap`

  console.log('Loading font:', fontFamily, 'with weights:', weights, 'URL:', fontUrl)

  const link = document.createElement('link')
  link.id = fontId
  link.rel = 'stylesheet'
  link.href = fontUrl

  // Add error handling
  link.onerror = () => {
    console.error('Failed to load font:', fontFamily, 'URL:', fontUrl)
  }
  
  link.onload = () => {
    console.log('Successfully loaded font:', fontFamily)
  }

  document.head.appendChild(link)
  console.log('Font link added to document head:', fontId)
  
  // Use Font Loading API if available, otherwise fallback to timeout
  if ('fonts' in document) {
    document.fonts.load(`${weights[0]} 16px "${fontFamily}"`).then(() => {
      console.log('Font loaded via Font Loading API:', fontFamily)
    }).catch((error) => {
      console.error('Font loading failed via Font Loading API:', fontFamily, error)
    })
  } else {
    // Fallback: Force browser to load the font by creating a temporary element
    const testDiv = document.createElement('div')
    testDiv.style.fontFamily = `"${fontFamily}"`
    testDiv.style.position = 'absolute'
    testDiv.style.visibility = 'hidden'
    testDiv.style.fontSize = '1px'
    testDiv.textContent = 'test'
    document.body.appendChild(testDiv)
    setTimeout(() => document.body.removeChild(testDiv), 100)
  }
}

export function getFontWeights(font: GoogleFont): string[] {
  const standardWeights = ['100', '200', '300', '400', '500', '600', '700', '800', '900']

  const availableWeights = font.variants
    .filter(variant => !variant.includes('italic'))
    .map(variant => variant === 'regular' ? '400' : variant)
    .filter(weight => standardWeights.includes(weight))
    .sort((a, b) => parseInt(a) - parseInt(b))

  // Always include 400 if no weights are available
  return availableWeights.length > 0 ? availableWeights : ['400']
}

// Check if a font is available via Google Fonts API
export async function validateGoogleFont(fontFamily: string): Promise<boolean> {
  try {
    const encodedFontFamily = encodeURIComponent(fontFamily)
    const testUrl = `https://fonts.googleapis.com/css2?family=${encodedFontFamily}:wght@400&display=swap`
    
    const response = await fetch(testUrl, { method: 'HEAD' })
    const isValid = response.ok
    
    if (!isValid) {
      console.warn('Font not available on Google Fonts:', fontFamily, 'Status:', response.status)
    }
    
    return isValid
  } catch (error) {
    console.error('Error validating font:', fontFamily, error)
    return false
  }
}