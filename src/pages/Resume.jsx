import { Box, Container, Typography } from '@mui/material'
import MDEditor from '@uiw/react-md-editor'
import { useSiteProfile } from '../contexts/SiteProfileContext'

function Resume() {
  const { siteProfile, loading } = useSiteProfile()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (!siteProfile?.resume) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Resume not available
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {siteProfile.username}'s Resume
      </Typography>
      <Box data-color-mode="light">
        <MDEditor.Markdown source={siteProfile.resume} />
      </Box>
    </Container>
  )
}

export default Resume
