import { Link } from 'react-router-dom'
import { Box, Container, Typography, Button, Paper, Grid } from '@mui/material'
import { useTheme } from '../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'
import { useProfile } from '../contexts/ProfileContext'

export default function Welcome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { userProfile } = useProfile()
  const { darkMode } = useTheme()

  useEffect(() => {
    if (user && userProfile?.username) {
      navigate(`/${userProfile.username}`)
    }
  }, [user, userProfile, navigate])

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        py: 8
      }}>
        <Grid container spacing={4}>
          {/* Hero Section */}
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" component="h1" gutterBottom>
                Welcome to Hiverarchy
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph>
                A collaborative platform where developers share and evolve knowledge together
              </Typography>
            </Box>
          </Grid>

          {/* Features */}
          <Grid item xs={12}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
                    borderRadius: 0
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    Share Your Knowledge
                  </Typography>
                  <Typography>
                    Create your own space to share technical insights, tutorials, and experiences
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
                    borderRadius: 0
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    Organize by Interests
                  </Typography>
                  <Typography>
                    Group your content by topics and interests for easy navigation
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
                    borderRadius: 0
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    AI-Powered Writing
                  </Typography>
                  <Typography>
                    Use AI tools to help research, structure, and enhance your content
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Featured Blog */}
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                mt: 4,
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
                textAlign: 'center',
                borderRadius: 0
              }}
            >
              <Typography variant="h5" gutterBottom>
                Featured Blog
              </Typography>
              <Typography paragraph>
                Check out GolferGeek's blog to see the platform in action
              </Typography>
              <Button 
                component={Link}
                to="/golfergeek"
                variant="contained" 
                size="large"
                sx={{ mt: 2, borderRadius: 0 }}
              >
                Visit GolferGeek's Blog
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
} 