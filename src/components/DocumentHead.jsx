import { Helmet } from 'react-helmet'
import { useProfile } from '../contexts/ProfileContext'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { shouldShowWelcomePage, isHiverarchyDomain, getDomain, getPort } from '../utils/urlUtils'

const DocumentHead = () => {
  const { blogProfile, currentUsername, getFullLogoUrl } = useProfile()
  const location = useLocation()
  const [pageTitle, setPageTitle] = useState('Hiverarchy')
  const [faviconUrl, setFaviconUrl] = useState('/images/hiverarchy.jpeg')
  const isWelcomePage = shouldShowWelcomePage()
  const isHierarchyMode = isHiverarchyDomain() || (getDomain() === 'localhost' && getPort() === '4021')

  useEffect(() => {
    // Set favicon based on the blog profile, not user profile
    if (isWelcomePage) {
      setFaviconUrl('/images/hiverarchy.jpeg')
    } else if (isHierarchyMode && blogProfile?.logo) {
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
      if (path.includes('/post/')) {
        title = `${title} | View Post`
      } else if (path.includes('/interest/')) {
        const interestName = path.split('/').pop()
        title = `${title} | ${interestName}`
      } else if (path.includes('/resume')) {
        title = `${title} | Resume`
      } else if (path === '/login') {
        title = 'Login | Hiverarchy'
      } else if (path === '/signup') {
        title = 'Sign Up | Hiverarchy'
      }
      
      setPageTitle(title)
    } else {
      if (isWelcomePage) {
        setPageTitle('Hiverarchy - Developer Knowledge Hub')
      } else if (isHierarchyMode) {
        setPageTitle(`${currentUsername} Blog`)
      } else {
        setPageTitle('GolferGeek Blog')
      }
    }
  }, [blogProfile, location.pathname, isWelcomePage, isHierarchyMode, currentUsername, getFullLogoUrl])

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <link rel="icon" href={faviconUrl} />
    </Helmet>
  )
}

export default DocumentHead