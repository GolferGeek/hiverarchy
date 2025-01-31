import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getEffectiveUsername, shouldShowUsernameInUrl, removeUsernameFromPath } from '../utils/urlUtils'

function RouteWrapper({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const processRoute = async () => {
      try {
        const username = await getEffectiveUsername()
        
        if (shouldShowUsernameInUrl()) {
          // For hiverarchy.com - ensure username is in URL
          const parts = location.pathname.split('/').filter(Boolean)
          if (!parts.length || parts[0] !== username) {
            const cleanPath = await removeUsernameFromPath(location.pathname)
            navigate(`/${username}${cleanPath}`, { replace: true })
            return
          }
        } else {
          // For other domains - remove username from URL if present
          const parts = location.pathname.split('/').filter(Boolean)
          if (parts.length && parts[0] === username) {
            const newPath = '/' + parts.slice(1).join('/')
            navigate(newPath, { replace: true })
            return
          }
        }
      } catch (error) {
        console.error('Error processing route:', error)
      } finally {
        setIsProcessing(false)
      }
    }

    processRoute()
  }, [location.pathname, navigate])

  if (isProcessing) {
    return null // Or a loading spinner
  }

  return children
}

export default RouteWrapper 