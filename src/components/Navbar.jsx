import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useInterests } from '../contexts/InterestContext'
import { useProfile } from '../contexts/ProfileContext'
import { AppBar, Toolbar, Button, IconButton, Box, Menu, MenuItem } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import SettingsIcon from '@mui/icons-material/Settings'
import { useState } from 'react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const { interests, loading: interestsLoading } = useInterests()
  const { blogProfile, userProfile, loading: profileLoading, currentUsername } = useProfile()
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
        {/* Left section - Logo */}
        <Box sx={{ flex: '0 0 auto' }}>
          <Button
            color="inherit"
            component={Link}
            to={isWelcomePage ? '/' : `/${currentUsername}`}
            sx={{ 
              textTransform: 'none',
              fontSize: '1.2rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {!isWelcomePage && activeProfile?.logo && (
              <Box
                component="img"
                src={activeProfile.logo}
                alt={`${activeProfile.username}'s logo`}
                sx={{
                  height: 32,
                  width: 32,
                  objectFit: 'contain'
                }}
              />
            )}
            {isWelcomePage ? 'Hiverarchy' : (activeProfile?.username || 'Hiverarchy')}
          </Button>
        </Box>

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
                to={`/${currentUsername}/interest/${interest.name}`}
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
                  to={`/${currentUsername}/manage/posts`}
                  onClick={handleManageClose}
                >
                  Manage Posts
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  to={`/${currentUsername}/manage/profile`}
                  onClick={handleManageClose}
                >
                  Manage Profile
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  to={`/${currentUsername}/manage/interests`}
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