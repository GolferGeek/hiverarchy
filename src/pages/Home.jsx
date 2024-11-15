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

function Home() {
  const navigate = useNavigate()

  const sections = [
    {
      title: 'Coding Journey',
      description: 'Exploring the world of programming and software development',
      image: '/gg-blog/images/coder.jpg',
      link: '/coder',
    },
    {
      title: 'Golf Adventures',
      description: 'Sharing golf experiences, tips, and achievements',
      image: '/gg-blog/images/golfer.jpg',
      link: '/golfer',
    },
    {
      title: 'Mentorship',
      description: 'Guiding and supporting others in their journey',
      image: '/gg-blog/images/mentor.jpg',
      link: '/mentor',
    },
    {
      title: "Life's Journey",
      description: 'Insights and reflections on the aging process',
      image: '/gg-blog/images/aging.jpg',
      link: '/aging',
    },
  ]

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
          {sections.map((section, index) => (
            <Card 
              key={section.title}
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
                image={section.image}
                alt={section.title}
              />
              <CardContent 
                sx={{ 
                  width: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: 4
                }}
              >
                <Typography variant="h4" component="h2" gutterBottom>
                  {section.title}
                </Typography>
                <Typography variant="body1" paragraph>
                  {section.description}
                </Typography>
                <Button
                  onClick={() => navigate(section.link)}
                  variant="contained"
                  size="large"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  View {section.title} Posts
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