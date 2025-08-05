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
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@${weightQuery}&display=swap`

  console.log('Loading font:', fontFamily, 'with weights:', weights, 'URL:', fontUrl)

  const link = document.createElement('link')
  link.id = fontId
  link.rel = 'stylesheet'
  link.href = fontUrl

  document.head.appendChild(link)
  console.log('Font link added to document head:', fontId)
  
  // Force browser to load the font by creating a temporary element
  const testDiv = document.createElement('div')
  testDiv.style.fontFamily = `"${fontFamily}"`
  testDiv.style.position = 'absolute'
  testDiv.style.visibility = 'hidden'
  testDiv.style.fontSize = '1px'
  testDiv.textContent = 'test'
  document.body.appendChild(testDiv)
  setTimeout(() => document.body.removeChild(testDiv), 100)
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