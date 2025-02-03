import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useInterests } from '../contexts/InterestContext'
import { useProfile } from '../contexts/ProfileContext'
import { AppBar, Toolbar, Button, IconButton, Box, Menu, MenuItem, Stack } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import SettingsIcon from '@mui/icons-material/Settings'
import DescriptionIcon from '@mui/icons-material/Description'
import { useState } from 'react'
import { shouldShowUsernameInUrl } from '../utils/urlUtils'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const { interests, loading: interestsLoading } = useInterests()
  const { blogProfile, userProfile, loading: profileLoading, currentUsername, getFullLogoUrl } = useProfile()
  const [manageAnchorEl, setManageAnchorEl] = useState(null)
  const location = useLocation()

  // Sort interests by sequence
  const sortedInterests = [...(interests || [])]
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))

  const handleManageClick = (event) => {
    setManageAnchorEl(event.currentTarget)
  }

  const handleManageClose = () => {
    setManageAnchorEl(null)
  }

  // Get the active profile (blog profile or user profile)
  const activeProfile = blogProfile || userProfile

  // Check if we're on the welcome page
  const isWelcomePage = location.pathname === '/'

  // If we're loading and not on welcome page, don't show navbar
  if ((interestsLoading || profileLoading || !currentUsername) && !isWelcomePage) {
    return null
  }

  // Get the full logo URL - ensure we're getting it from the active profile
  const logoUrl = isWelcomePage ? '/images/hiverarchy.jpeg' : getFullLogoUrl(activeProfile?.logo)

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        borderRadius: 0,
        '& .MuiButton-root': {
          borderRadius: 0
        }
      }}
    >
      <Toolbar>
        {/* Left section - Logo and Resume */}
        <Stack 
          direction="row" 
          spacing={1} 
          alignItems="center" 
          sx={{ flex: '0 0 auto' }}
        >
          <Button
            color="inherit"
            component={Link}
            to={isWelcomePage ? '/' : `/${blogProfile?.username}`}
            sx={{ 
              textTransform: 'none',
              fontSize: '1.2rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box
              component="img"
              src={logoUrl}
              alt={isWelcomePage ? 'Hiverarchy logo' : `${blogProfile?.username}'s logo`}
              sx={{
                height: 32,
                width: 32,
                objectFit: 'contain',
                borderRadius: '4px'
              }}
              onError={(e) => {
                console.log('Logo load error, using default')
                e.target.src = '/images/gg-logo.jpg'
              }}
            />
            {isWelcomePage ? 'Hiverarchy' : (blogProfile?.username || 'Hiverarchy')}
          </Button>
          
          {/* Resume Link - Only show if resume exists and not on welcome page */}
          {!isWelcomePage && activeProfile?.resume && (
            <Button
              color="inherit"
              component={Link}
              to={shouldShowUsernameInUrl() ? `/${blogProfile?.username}/resume` : '/resume'}
              startIcon={<DescriptionIcon />}
              size="small"
              sx={{ 
                textTransform: 'none',
                whiteSpace: 'nowrap',
                ml: 1
              }}
            >
              Resume
            </Button>
          )}
        </Stack>

        {/* Middle section - Interests (only show if not on welcome page) */}
        {!isWelcomePage && (
          <Box sx={{ 
            flex: '1 1 auto', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center', 
            gap: 1,
            mx: 2,
            overflow: 'auto'
          }}>
            {sortedInterests.map((interest) => (
              <Button
                key={interest.id}
                color="inherit"
                component={Link}
                to={`/${blogProfile?.username}/interest/${interest.name}`}
                sx={{
                  whiteSpace: 'nowrap'
                }}
              >
                {interest.title}
              </Button>
            ))}
          </Box>
        )}

        {/* Right section - Actions */}
        <Box sx={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={toggleDarkMode} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {user ? (
            <>
              <IconButton
                color="inherit"
                onClick={handleManageClick}
                aria-controls="manage-menu"
                aria-haspopup="true"
              >
                <SettingsIcon />
              </IconButton>
              <Menu
                id="manage-menu"
                anchorEl={manageAnchorEl}
                keepMounted
                open={Boolean(manageAnchorEl)}
                onClose={handleManageClose}
              >
                <MenuItem 
                  component={Link} 
                  to={`/${blogProfile?.username}/manage/posts`}
                  onClick={handleManageClose}
                >
                  Manage Posts
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  to={`/${blogProfile?.username}/manage/profile`}
                  onClick={handleManageClose}
                >
                  Manage Profile
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  to={`/${blogProfile?.username}/manage/interests`}
                  onClick={handleManageClose}
                >
                  Manage Interests
                </MenuItem>
              </Menu>
              <Button color="inherit" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}