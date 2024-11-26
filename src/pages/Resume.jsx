import { Container, Typography, Paper, Box, CircularProgress } from '@mui/material'
import { useProfile } from '../contexts/ProfileContext'
import MDEditor from '@uiw/react-md-editor'

function Resume() {
  const { profile, loading } = useProfile()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!profile?.resume) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Resume Not Available
        </Typography>
        <Typography>
          The resume content is currently not available.
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Resume
        </Typography>
        <Box data-color-mode="light">
          <MDEditor.Markdown source={profile.resume} highlightEnable={false} />
        </Box>
      </Paper>
    </Container>
  )
}

export default Resume
