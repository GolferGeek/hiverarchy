import { useState, useEffect } from 'react'
import { Box, TextField, Button, Typography, Container } from '@mui/material'
import MarkdownEditor from '../components/MarkdownEditor'
import ImageUpload from '../components/ImageUpload'
import { supabase } from '../lib/supabase'
import { useAI } from '../services/ai/index.jsx'

const UserProfile = () => {
  const [username, setUsername] = useState('')
  const [resume, setResume] = useState('')
  const [logo, setLogo] = useState(null)
  const [tagline, setTagline] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [apiOpenai, setApiOpenai] = useState('')
  const [apiAnthropic, setApiAnthropic] = useState('')
  const [apiGrok, setApiGrok] = useState('')
  const [apiPerplexity, setApiPerplexity] = useState('')
  const { loadServices } = useAI()

  useEffect(() => {
    getProfile()
  }, [])

  const getFullLogoUrl = (filename) => {
    if (!filename) return null
    if (filename.startsWith('http')) return filename
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profile_logos/${filename}`
  }

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setUsername(data.username || '')
        setResume(data.resume || '')
        setLogo(data.logo ? getFullLogoUrl(data.logo) : null)
        setTagline(data.tagline || '')
        setApiOpenai(data.api_openai || '')
        setApiAnthropic(data.api_anthropic || '')
        setApiGrok(data.api_grok || '')
        setApiPerplexity(data.api_perplexity || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message)
      setMessage('Error fetching profile')
    }
  }

  const handleLogoUpload = (uploadedImages) => {
    if (uploadedImages && uploadedImages.length > 0) {
      setLogo(getFullLogoUrl(uploadedImages[0]))
    }
  }

  const handleLogoRemove = async () => {
    setLogo(null)
  }

  const updateProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Extract filename from full URL for storage
      let logoFilename = null
      if (logo) {
        const matches = logo.match(/\/([^/]+)$/)
        logoFilename = matches ? matches[1] : null
      }

      const updates = {
        id: user.id,
        username,
        resume,
        logo: logoFilename,  // Store just the filename
        tagline,
        'api_openai': apiOpenai,
        'api_anthropic': apiAnthropic,
        'api_grok': apiGrok,
        'api_perplexity': apiPerplexity,
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
            value={apiGrok}
            onChange={(e) => setApiGrok(e.target.value)}
            type="password"
            disabled={loading}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Perplexity API Key"
            value={apiPerplexity}
            onChange={(e) => setApiPerplexity(e.target.value)}
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
