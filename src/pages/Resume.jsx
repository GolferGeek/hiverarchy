import { Container, Box, Typography } from '@mui/material'
import { useProfile } from '../contexts/ProfileContext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Resume() {
  const { blogProfile } = useProfile()
  const resume = blogProfile?.resume

  if (!resume) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary">
            No resume available
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        mt: 4,
        mb: 4,
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
            // Add custom components for markdown elements if needed
            h1: ({ node, ...props }) => <Typography variant="h1" {...props} />,
            h2: ({ node, ...props }) => <Typography variant="h2" {...props} />,
            h3: ({ node, ...props }) => <Typography variant="h3" {...props} />,
            p: ({ node, ...props }) => <Typography variant="body1" {...props} />,
          }}
        >
          {resume}
        </ReactMarkdown>
      </Box>
    </Container>
  )
}
