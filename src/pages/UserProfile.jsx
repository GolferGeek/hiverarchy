import { useState, useEffect } from 'react'
import { Box, TextField, Button, Typography, Container } from '@mui/material'
import MarkdownEditor from '../components/MarkdownEditor'
import ImageUpload from '../components/ImageUpload'
import { supabase } from '../lib/supabase'
import { useAI } from '../services/ai/index.jsx'

const UserProfile = () => {
  const [username, setUsername] = useState('')
  const [resume, setResume] = useState('')
  const [logo, setLogo] = useState('')
  const [tagline, setTagline] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [apiOpenai, setApiOpenai] = useState('')
  const [apiAnthropic, setApiAnthropic] = useState('')
  const [apiGrok2, setApiGrok2] = useState('')
  const { loadServices } = useAI()

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('profiles')
        .select('username, resume, logo, tagline, api-openai, api-anthropic, api-grok2')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setUsername(data.username || '')
        setResume(data.resume || '')
        setLogo(data.logo || '')
        setTagline(data.tagline || '')
        setApiOpenai(data['api-openai'] || '')
        setApiAnthropic(data['api-anthropic'] || '')
        setApiGrok2(data['api-grok2'] || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message)
      setMessage('Error fetching profile')
    }
  }

  const handleLogoUpload = (uploadedImages) => {
    if (uploadedImages && uploadedImages.length > 0) {
      setLogo(uploadedImages[0])
    }
  }

  const handleLogoRemove = async () => {
    setLogo('')
  }

  const updateProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      console.log('Updating profile with Grok2 API key:', apiGrok2)

      const updates = {
        id: user.id,
        username,
        resume,
        logo,
        tagline,
        'api-openai': apiOpenai,
        'api-anthropic': apiAnthropic,
        'api-grok2': apiGrok2,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)

      if (error) throw error
      
      await loadServices()
      
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

        <TextField
          margin="normal"
          fullWidth
          label="Tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          disabled={loading}
          helperText="A brief description that appears on the home page"
        />

        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Resume (Markdown)
          </Typography>
          <MarkdownEditor
            value={resume}
            onChange={setResume}
          />
        </Box>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Logo
          </Typography>
          <ImageUpload 
            onUpload={handleLogoUpload}
            onRemove={handleLogoRemove}
            existingImages={logo ? [logo] : []}
            bucket="profile_logos"
            showCopyOption={false}
          />
        </Box>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            API Keys
          </Typography>
          <TextField
            margin="normal"
            fullWidth
            label="OpenAI API Key"
            value={apiOpenai}
            onChange={(e) => setApiOpenai(e.target.value)}
            type="password"
            disabled={loading}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Anthropic API Key"
            value={apiAnthropic}
            onChange={(e) => setApiAnthropic(e.target.value)}
            type="password"
            disabled={loading}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Grok2 API Key"
            value={apiGrok2}
            onChange={(e) => setApiGrok2(e.target.value)}
            type="password"
            disabled={loading}
          />
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
