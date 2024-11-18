import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  CardMedia, 
  Button
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
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
                  width: { xs: '100%', md: '50%' },
                  height: { xs: '200px', md: '400px' },
                  objectFit: 'cover'
                }}
                image={getImagePath(interest)}
                alt={interest.name}
                onError={(e) => {
                  e.target.src = '/images/default.jpg'
                }}
              />
              <CardContent 
                sx={{ 
                  width: { xs: '100%', md: '50%' },
                  display: 'flex',
                  flexDirection: 'column',
                  p: 4,
                  height: { xs: 'auto', md: '400px' }
                }}
              >
                <Typography 
                  variant="h4" 
                  component="h2" 
                  gutterBottom
                  sx={{ mb: 3 }}
                >
                  {interest.title}
                </Typography>
                <Box sx={{ 
                  flex: 1,
                  overflow: 'auto',
                  mb: 2
                }}>
                  <MDEditor.Markdown 
                    source={interest.description} 
                    style={{ 
                      whiteSpace: 'pre-wrap',
                      backgroundColor: 'transparent',
                      color: 'inherit'
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    navigate(`/${interest.name}`);
                  }}
                  sx={{
                    alignSelf: 'flex-start',
                    textTransform: 'none'
                  }}
                >
                  View Posts
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default Home