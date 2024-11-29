import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useInterests } from '../contexts/InterestContext'
import { useProfile } from '../contexts/ProfileContext'
import { AppBar, Toolbar, Button, IconButton, Box, Typography } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const { interests, loading: interestsLoading } = useInterests()
  const { profile, loading: profileLoading } = useProfile()
  const { username } = useParams()
  const defaultUsername = import.meta.env.VITE_DEFAULT_USERNAME
  const currentUsername = username || defaultUsername

  // Sort interests by sequence
  const sortedInterests = [...(interests || [])]
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))

  if (interestsLoading || profileLoading) {
    return null
  }

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Left section - Brand */}
        <Box sx={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            component={Link}
            to={`/${currentUsername}`}
            sx={{
              fontFamily: 'monospace',
              letterSpacing: '.3rem',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1.2rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            {profile?.username || currentUsername}
          </Button>
          <Button color="inherit" component={Link} to={`/${currentUsername}/resume`}>
            Resume
          </Button>
        </Box>

        {/* Middle section - Interests */}
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

        {/* Right section - Actions */}
        <Box sx={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={toggleDarkMode} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {user ? (
            <>
              <Button color="inherit" component={Link} to={`/${currentUsername}/create`}>
                Create Post
              </Button>
              <Button color="inherit" component={Link} to={`/${currentUsername}/manage/posts`}>
                Posts
              </Button>
              <Button color="inherit" component={Link} to={`/${currentUsername}/manage/interests`}>
                Interests
              </Button>
              <Button color="inherit" component={Link} to={`/${currentUsername}/manage/profile`}>
                Profile
              </Button>
              <Button color="inherit" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/signup">
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}