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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

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
          <Typography variant="h5">
            Exploring the intersections of technology, golf, mentorship, and life's journey
          </Typography>
        </Container>
      </Box>

      {/* Content Sections */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {interests.map((section, index) => (
            <Card 
              key={section.id}
              sx={{ 
                display: 'flex',
                flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <CardMedia
                component="img"
                sx={{ width: '50%' }}
                image={section.image_path}
                alt={section.title}
              />
              <CardContent 
                sx={{ 
                  width: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 4,
                  height: '500px',
                  position: 'relative'
                }}
              >
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h4" 
                    component="h2" 
                    gutterBottom
                    sx={{ mb: 3 }}
                  >
                    {section.title}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  flex: 1,
                  overflow: 'auto',
                  mb: 5
                }}>
                  <Box data-color-mode="light">
                    <MDEditor.Markdown 
                      source={typeof section.description === 'object'
                        ? JSON.stringify(section.description, null, 2)
                        : section.description || ''} 
                      style={{ 
                        whiteSpace: 'pre-wrap',
                        backgroundColor: 'transparent',
                        fontFamily: 'inherit'
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ 
                  position: 'absolute',
                  bottom: 32,
                  left: 32
                }}>
                  <Button
                    onClick={() => navigate(section.route_path)}
                    variant="contained"
                    size="large"
                  >
                    Explore {section.title}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  )
}

export default Home