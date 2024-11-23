import { useState, useEffect } from 'react'
import { Box, TextField, Button, Typography, Container } from '@mui/material'
import MDEditor from '@uiw/react-md-editor'
import { supabase } from '../lib/supabase'

const UserProfile = () => {
  const [username, setUsername] = useState('')
  const [resume, setResume] = useState('')
  const [logo, setLogo] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('profiles')
        .select('username, resume, logo')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setUsername(data.username || '')
        setResume(data.resume || '')
        setLogo(data.logo || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message)
      setMessage('Error fetching profile')
    }
  }

  const uploadLogo = async (event) => {
    try {
      setLoading(true)
      const file = event.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const filePath = `site-logo.${fileExt}`

      // Remove existing logo if any
      await supabase.storage
        .from('logos')
        .remove([filePath])
        .catch(console.error) // Ignore error if file doesn't exist

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      setLogo(publicUrl)
      setMessage('Logo uploaded successfully')
    } catch (error) {
      console.error('Error uploading logo:', error.message)
      setMessage('Error uploading logo')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const updates = {
        id: user.id,
        username,
        resume,
        logo,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)

      if (error) throw error
      setMessage('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error.message)
      setMessage('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>
        {message && (
          <Typography color={message.includes('Error') ? 'error' : 'success'} gutterBottom>
            {message}
          </Typography>
        )}
      </Box>

      <Box component="form" noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />

        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Resume (Markdown)
          </Typography>
          <MDEditor
            value={resume}
            onChange={setResume}
            preview="edit"
            height={400}
          />
        </Box>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Logo
          </Typography>
          {logo && (
            <Box sx={{ mb: 2 }}>
              <img src={logo} alt="Profile logo" style={{ maxWidth: '200px' }} />
            </Box>
          )}
          <Button
            variant="contained"
            component="label"
            disabled={loading}
          >
            Upload Logo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={uploadLogo}
            />
          </Button>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={updateProfile}
          disabled={loading}
          sx={{ mt: 3, mb: 2 }}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </Box>
    </Container>
  )
}

export default UserProfile
