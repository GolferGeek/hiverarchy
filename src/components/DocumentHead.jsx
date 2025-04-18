import { Helmet } from 'react-helmet'
import { useParams, useLocation } from 'react-router-dom'
import { useProfile } from '../contexts/ProfileContext'
import { useEffect, useState } from 'react'
import { shouldShowWelcomePage, isHiverarchyDomain } from '../utils/urlUtils'

const DocumentHead = () => {
  const { blogProfile, currentUsername, getFullLogoUrl } = useProfile()
  const location = useLocation()
  const { postId } = useParams()
  const [pageTitle, setPageTitle] = useState('Hiverarchy')
  const [faviconUrl, setFaviconUrl] = useState('/images/hiverarchy.jpeg')
  const isWelcomePage = shouldShowWelcomePage()
  
  useEffect(() => {
    // Set favicon based on the blog profile
    if (isWelcomePage) {
      setFaviconUrl('/images/hiverarchy.jpeg')
    } else if (blogProfile?.logo) {
      const logoUrl = getFullLogoUrl(blogProfile.logo)
      setFaviconUrl(logoUrl)
    } else {
      setFaviconUrl('/images/gg-logo.jpg')
    }

    // Set the page title based on the blog profile and current path
    if (blogProfile?.site_name) {
      let title = blogProfile.site_name
      
      // Check for specific pages and customize the title
      const path = location.pathname
      const pathParts = path.split('/').filter(Boolean)
      
      // Remove username from path parts if it's the first segment
      const routeParts = pathParts.length > 0 && pathParts[0] === currentUsername 
        ? pathParts.slice(1) 
        : pathParts
      
      if (routeParts.length > 0) {
        if (routeParts[0] === 'post') {
          title = `${title} | View Post`
        } else if (routeParts[0] === 'interest' && routeParts.length > 1) {
          title = `${title} | ${routeParts[1]}`
        } else if (routeParts[0] === 'resume') {
          title = `${title} | Resume`
        } else if (routeParts[0] === 'now') {
          title = `${title} | Now`
        }
      }
      
      setPageTitle(title)
    } else {
      if (isWelcomePage) {
        setPageTitle('Hiverarchy - Developer Knowledge Hub')
      } else {
        // For all other cases, show username blog
        setPageTitle(`${currentUsername ? currentUsername : 'Blog'} | Hiverarchy`)
      }
    }
  }, [blogProfile, location.pathname, isWelcomePage, currentUsername, getFullLogoUrl])

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <link rel="icon" href={faviconUrl} />
      {/* Responsive Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <meta name="theme-color" content="#556B2F" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* SEO Meta Tags */}
      <meta name="description" content={blogProfile?.bio || "Hiverarchy - A blog platform for sharing ideas and connecting with others."} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={blogProfile?.bio || "Hiverarchy - A blog platform for sharing ideas and connecting with others."} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:image" content={blogProfile?.avatar || '/images/hiverarchy.jpeg'} />
      
      {/* Additional Responsive Settings */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Add this to make tap highlights less pronounced on mobile */}
      <style>
        {`
          * {
            -webkit-tap-highlight-color: rgba(0,0,0,0.1);
          }
        `}
      </style>
    </Helmet>
  )
}

export default DocumentHead