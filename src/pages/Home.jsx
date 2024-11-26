import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  CircularProgress
} from '@mui/material'
import { useInterests } from '../contexts/InterestContext'
import MDEditor from '@uiw/react-md-editor'

function Home() {
  const navigate = useNavigate()
  const { interests, loading } = useInterests()

  const getImagePath = (interest) => {
    try {
      return `/images/${interest.name}.jpg`
    } catch (error) {
      return '/images/default.jpg'
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading interests...</Typography>
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
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mt: 4,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to GolferGeek
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Exploring the intersections of code, golf, mentorship, and life
          </Typography>
        </Container>
      </Box>

      {/* Interests Column */}
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
                onClick={() => navigate(`/${interest.name}`)}
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
                <CardContent sx={{ 
                  flex: '1 1 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 4
                }}>
                  <Box>
                    <Typography variant="h4" component="h2" gutterBottom>
                      {interest.title}
                    </Typography>
                    <Box data-color-mode="light" sx={{ mb: 2 }}>
                      <MDEditor.Markdown source={interest.description || 'No description available.'} />
                    </Box>
                  </Box>
                  <Button 
                    variant="contained" 
                    color="primary"
                    sx={{ alignSelf: 'flex-start' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/${interest.name}`)
                    }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default Home