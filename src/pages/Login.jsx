import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { shouldShowUsernameInUrl, getRedirectPath, isHiverarchyDomain, extractUsernameFromDomain } from '../utils/urlUtils'
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
  Alert,
  CircularProgress,
  Backdrop
} from '@mui/material'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const { fetchProfiles, userProfile, blogProfile } = useProfile()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signingIn, setSigningIn] = useState(false)

  // Extract redirect URL from state or search params (if any)
  const from = location.state?.from || new URLSearchParams(location.search).get('from') || location.pathname

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setError('')
      setLoading(true)
      setSigningIn(true)
      
      // First sign in
      const { error: signInError } = await signIn({ email, password })
      if (signInError) throw signInError

      // Then fetch profiles and wait for the result
      await fetchProfiles()

      // Wait for profile to be loaded (max 2 seconds)
      let attempts = 0
      while (!userProfile && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      // Determine where to navigate after login
      await handlePostLoginNavigation();

    } catch (error) {
      console.error('Login error:', error)
      setError('Failed to sign in: ' + error.message)
      setSigningIn(false)
    } finally {
      setLoading(false)
    }
  }

  const handlePostLoginNavigation = async () => {
    // If the user doesn't have a profile yet, send them to profile setup
    if (!userProfile?.username) {
      console.log('No user profile found, redirecting to profile setup')
      navigate('/manage/profile')
      return
    }

    // First, handle specific redirects (if we came from a protected route)
    if (from && from !== '/' && !from.includes('/login') && !from.includes('/signup')) {
      console.log('Returning to previous page after login:', from)
      navigate(from)
      return
    }

    // Handle login from Hiverarchy home page - redirect to user's home
    const isHiverarchyHomePage = isHiverarchyDomain() && 
                              (location.pathname === '/' || location.pathname === '/login')
    
    if (isHiverarchyHomePage) {
      // Redirect to the user's home page
      console.log('Logging in from Hiverarchy home, redirecting to user home:', userProfile.username)
      navigate(`/${userProfile.username}`)
      return
    }

    // If we're on a specific blog that isn't the user's, stay there
    if (blogProfile && blogProfile.username !== userProfile.username) {
      console.log('Staying on current blog:', blogProfile.username)
      
      // Extract path without username
      const pathParts = location.pathname.split('/').filter(Boolean)
      const currentPath = pathParts.length > 0 && pathParts[0] === blogProfile.username
        ? '/' + pathParts.slice(1).join('/')
        : location.pathname
        
      // If we're on login page, redirect to the blog's home
      if (currentPath === '/login') {
        navigate(`/${blogProfile.username}`)
      }
      // Otherwise, just stay where we are
      return
    }

    // Default: go to user's home page
    const basePath = `/${userProfile.username}`
    console.log('Redirecting to user home page:', basePath)
    navigate(basePath)
  }

  return (
    <>
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Login
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <MuiLink component={Link} to="/signup" variant="body2">
                  Don't have an account? Sign Up
                </MuiLink>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
        open={signingIn}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6">
          Signing in...
        </Typography>
      </Backdrop>
    </>
  )
}

export default Login