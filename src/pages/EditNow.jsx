import { useState, useEffect } from 'react'
import { Container, Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../contexts/ProfileContext'
import { supabase } from '../lib/supabase'
import MarkdownEditor from '../components/MarkdownEditor'

export default function EditNow() {
  const [now, setNow] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { userProfile, fetchProfiles } = useProfile()
  const navigate = useNavigate()

  useEffect(() => {
    if (userProfile?.now) {
      setNow(userProfile.now)
    }
  }, [userProfile])

  const handleSave = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error } = await supabase
        .from('profiles')
        .update({ now })
        .eq('id', user.id)

      if (error) throw error

      // Refresh profiles to update navbar and other components
      await fetchProfiles()
      
      setMessage('Now page updated successfully')
      // Navigate back to the Now page
      navigate(`/${userProfile.username}/now`)
    } catch (error) {
      console.error('Error updating Now page:', error)
      setMessage(`Error updating Now page: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Now Page
        </Typography>
        {message && (
          <Typography color={message.includes('Error') ? 'error' : 'success'} gutterBottom>
            {message}
          </Typography>
        )}
      </Box>

      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          What are you working on now? (Markdown supported)
        </Typography>
        <MarkdownEditor
          value={now}
          onChange={setNow}
        />
      </Box>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(`/${userProfile.username}/now`)}
          disabled={loading}
        >
          Cancel
        </Button>
      </Box>
    </Container>
  )
} 