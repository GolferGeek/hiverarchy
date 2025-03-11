import { Container, Box, Typography, Button } from '@mui/material'
import { useProfile } from '../contexts/ProfileContext'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import EditIcon from '@mui/icons-material/Edit'

export default function Now() {
  const { blogProfile, userProfile } = useProfile()
  const { user } = useAuth()
  const now = blogProfile?.now

  // Check if the user is viewing their own Now page
  const isOwnProfile = user && blogProfile && userProfile && blogProfile.username === userProfile.username

  if (!now && !isOwnProfile) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary">
            No current status available
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header with Edit Button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4
        }}>
          <Typography variant="h4" component="h1">
            Now
          </Typography>
          {isOwnProfile && (
            <Button
              component={Link}
              to={`/${userProfile.username}/now/edit`}
              startIcon={<EditIcon />}
              variant="contained"
            >
              Edit
            </Button>
          )}
        </Box>

        {/* Content */}
        {now ? (
          <Box sx={{ 
            '& h1': {
              fontSize: '2.5rem',
              fontWeight: 600,
              mb: 3
            },
            '& h2': {
              fontSize: '2rem',
              fontWeight: 500,
              mb: 2,
              mt: 4
            },
            '& h3': {
              fontSize: '1.5rem',
              fontWeight: 500,
              mb: 2,
              mt: 3
            },
            '& p': {
              mb: 2,
              lineHeight: 1.6
            },
            '& ul, & ol': {
              mb: 2,
              pl: 3
            },
            '& li': {
              mb: 1
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'divider',
              pl: 2,
              ml: 0,
              my: 2
            },
            '& code': {
              backgroundColor: 'action.hover',
              padding: '2px 4px',
              borderRadius: 1,
              fontSize: '0.875em'
            },
            '& pre': {
              backgroundColor: 'action.hover',
              padding: 2,
              borderRadius: 1,
              overflow: 'auto',
              '& code': {
                backgroundColor: 'transparent',
                padding: 0
              }
            }
          }}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => <Typography variant="h1" {...props} />,
                h2: ({ node, ...props }) => <Typography variant="h2" {...props} />,
                h3: ({ node, ...props }) => <Typography variant="h3" {...props} />,
                p: ({ node, ...props }) => <Typography variant="body1" {...props} />,
              }}
            >
              {now}
            </ReactMarkdown>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Share what you're working on
            </Typography>
            <Button
              component={Link}
              to={`/${userProfile.username}/now/edit`}
              variant="contained"
              startIcon={<EditIcon />}
            >
              Add Now Page
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  )
} 