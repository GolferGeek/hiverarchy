import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { shouldShowWelcomePage } from '../utils/urlUtils'

function DocumentHead() {
  const location = useLocation()
  const isWelcomePage = shouldShowWelcomePage()

  useEffect(() => {
    // Update favicon
    const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link')
    favicon.type = 'image/jpeg'
    favicon.rel = 'shortcut icon'
    favicon.href = isWelcomePage ? '/images/hiverarchy.jpeg' : '/images/gg-logo.jpg'
    document.head.appendChild(favicon)

    // Update title
    document.title = isWelcomePage ? 'Hiverarchy - Developer Knowledge Hub' : 'GolferGeek Blog'

    return () => {
      // Cleanup if needed
    }
  }, [isWelcomePage])

  return null
}

export default DocumentHead 