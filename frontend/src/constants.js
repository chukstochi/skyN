export const CATEGORIES = [
  'Home',
  'Nigeria',
  'World',
  'Business',
  'Technology',
  'Politics',
  'Health',
  'Entertainment',
  'Sports',
  'Lifestyle',
]

// Categories an article or a source can be filed under (everything except "Home")
export const ARTICLE_CATEGORIES = CATEGORIES.filter((c) => c !== 'Home')

// Social media links for the footer
export const SOCIAL_LINKS = [
  { name: 'Facebook', url: 'https://facebook.com/YOUR_PAGE' },
  { name: 'X', url: 'https://x.com/YOUR_HANDLE' },
  { name: 'Instagram', url: 'https://instagram.com/YOUR_HANDLE' },
  { name: 'TikTok', url: 'https://tiktok.com/@YOUR_HANDLE' },
]