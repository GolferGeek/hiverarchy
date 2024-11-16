import { useState, useEffect } from 'react'
import { Container, Paper, Typography, CircularProgress, Box } from '@mui/material'
import MDEditor from '@uiw/react-md-editor'

function Resume() {
  const [resumeContent, setResumeContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchResume()
  }, [])

  async function fetchResume() {
    try {
      setLoading(true)
      console.log('Fetching resume...')
      
      // First try the direct path
      let response = await fetch('/resume.md')
      
      // If that fails, try with public prefix
      if (!response.ok) {
        console.log('Direct path failed, trying with /public prefix...')
        response = await fetch('/public/resume.md')
      }
      
      // If both fail, try relative to images
      if (!response.ok) {
        console.log('Public prefix failed, trying images directory...')
        response = await fetch('/images/resume.md')
      }
      
      if (!response.ok) {
        console.error('Response status:', response.status)
        console.error('Response URL:', response.url)
        throw new Error(`Failed to load resume: ${response.statusText}`)
      }
      
      const content = await response.text()
      console.log('Resume content length:', content.length)
      
      if (!content.trim()) {
        throw new Error('Resume content is empty')
      }
      
      setResumeContent(content)
      setError(null)
      console.log('Resume loaded successfully')
    } catch (error) {
      console.error('Error loading resume:', error)
      setError(error.message || 'Failed to load resume. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Typography>
            Please ensure that resume.md exists in one of these locations:
            <ul>
              <li>/resume.md</li>
              <li>/public/resume.md</li>
              <li>/images/resume.md</li>
            </ul>
          </Typography>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, md: 4 },
          maxWidth: '900px',
          mx: 'auto'
        }}
      >
        <Box 
          data-color-mode="light" 
          sx={{ 
            '& .wmde-markdown': { 
              background: 'transparent',
              fontSize: '1rem',
              lineHeight: 1.7,
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            },
            '& .wmde-markdown h1': {
              borderBottom: '2px solid #1976d2',
              paddingBottom: 1,
              marginBottom: 2,
              color: '#1976d2'
            },
            '& .wmde-markdown h2': {
              color: '#1976d2',
              marginTop: 3
            },
            '& .wmde-markdown hr': {
              margin: '1rem 0',
              borderColor: '#e0e0e0'
            },
            '& .wmde-markdown strong': {
              color: '#424242'
            },
            '& .wmde-markdown ul': {
              paddingLeft: 3
            },
            '& .wmde-markdown p': {
              marginBottom: 1.5
            },
            '@media print': {
              '& .wmde-markdown': {
                fontSize: '12pt'
              }
            }
          }}
        >
          <MDEditor.Markdown source={resumeContent} />
        </Box>
      </Paper>
    </Container>
  )
}

export default Resume
