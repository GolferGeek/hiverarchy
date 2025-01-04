import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterests } from '../contexts/InterestContext'
import { useProfile } from '../contexts/ProfileContext'
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CircularProgress
} from '@mui/material'

function Home() {
  const navigate = useNavigate()
  const { interests, loading: interestsLoading } = useInterests()
  const { profile, loading: profileLoading, currentUsername } = useProfile()

  const getImagePath = (interest) => {
    try {
      return interest.image_path || '/images/default.jpg'
    } catch (error) {
      return '/images/default.jpg'
    }
  }

  const handleInterestClick = (interest) => {
    navigate(`/${currentUsername}/interest/${interest.name}`)
  }

  if (interestsLoading || profileLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  // Sort interests by sequence
  const sortedInterests = [...(interests || [])]
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          py: 8,
          mt: 4,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 4,
            flexDirection: { xs: 'column', md: 'row' }
          }}>
            {profile?.logo ? (
              <Box sx={{ 
                width: { xs: '200px', md: '300px' },
                height: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  margin: 0,
                  borderRadius: 2,
                  boxShadow: 3
                }
              }}>
                <img 
                  src={profile.logo}
                  alt={profile.site_name || 'Site Logo'}
                />
              </Box>
            ) : (
              <Box sx={{ 
                width: { xs: '200px', md: '300px' },
                height: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <img 
                  src="/images/gg-logo.jpg"
                  alt="Default Logo"
                  style={{ 
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    margin: 0,
                    borderRadius: 2,
                    boxShadow: 3
                  }}
                />
              </Box>
            )}
            <Box sx={{ 
              textAlign: { xs: 'center', md: 'left' },
              flex: 1
            }}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                {profile?.site_name || 'Welcome'}
              </Typography>
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 'medium',
                  lineHeight: 1.4
                }}
              >
                {profile?.tagline || 'Exploring ideas and sharing experiences'}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Interests Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        {sortedInterests.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No interests found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Check back later for updates!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sortedInterests.map((interest, index) => (
              <Card 
                key={interest.id}
                sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' },
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={() => handleInterestClick(interest)}
              >
                <CardMedia
                  component="img"
                  sx={{ 
                    width: { xs: '100%', md: '40%' },
                    height: { xs: 200, md: 300 },
                    objectFit: 'cover'
                  }}
                  image={getImagePath(interest)}
                  alt={interest.title}
                />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    width: { xs: '100%', md: '60%' },
                    p: 4,
                  }}
                >
                  <Typography variant="h4" component="h2" gutterBottom>
                    {interest.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {interest.description}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default Home