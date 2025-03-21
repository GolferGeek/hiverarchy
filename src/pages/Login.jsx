import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { shouldShowUsernameInUrl, getRedirectPath } from '../utils/urlUtils'
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
      // If we came from a specific page (not login or root), go back there
      if (from && from !== '/' && !from.includes('/login')) {
        console.log('Returning to previous page after login:', from)
        navigate(from)
      } else {
        // Navigate to the appropriate path based on domain
        if (userProfile?.username) {
          // If we're on a specific blog profile page, stay there
          if (blogProfile && blogProfile.username !== userProfile.username) {
            console.log('Staying on current blog profile:', blogProfile.username)
            // We're already on the correct URL, no need to navigate
          } else {
            // Otherwise go to the user's own profile
            const basePath = shouldShowUsernameInUrl() ? `/${userProfile.username}` : ''
            navigate(basePath || '/')
          }
        } else {
          // For profile setup, don't include username in path
          navigate('/manage/profile')
        }
      }

    } catch (error) {
      console.error('Login error:', error)
      setError('Failed to sign in: ' + error.message)
      setSigningIn(false)
    } finally {
      setLoading(false)
    }
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