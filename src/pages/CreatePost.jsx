import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { supabase } from '../lib/supabase'
import ImageUpload from '../components/ImageUpload'
import { useAuth } from '../contexts/AuthContext'
import {
  Container,
  Paper,
  Typography,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Alert
} from '@mui/material'

function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [interests, setInterests] = useState(['coder'])
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [error, setError] = useState('')

  const availableInterests = [
    { value: 'coder', label: 'Coder' },
    { value: 'golfer', label: 'Golfer' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'aging', label: 'Aging' }
  ]

  function handleInterestChange(value) {
    setInterests(prev => {
      if (prev.includes(value)) {
        return prev.filter(int => int !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (interests.length === 0) {
      setError('Please select at least one interest')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title,
            content,
            excerpt,
            interests,
            images,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error
      navigate(`/post/${data.id}`)
    } catch (error) {
      console.error('Error creating post:', error)
      setError('Error creating post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (url) => {
    setImages(prev => [...prev, url])
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Post
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
          />

          <FormGroup>
            <Typography variant="subtitle1" gutterBottom>
              Interests
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {availableInterests.map(({ value, label }) => (
                <FormControlLabel
                  key={value}
                  control={
                    <Checkbox
                      checked={interests.includes(value)}
                      onChange={() => handleInterestChange(value)}
                    />
                  }
                  label={label}
                />
              ))}
            </Box>
          </FormGroup>

          <TextField
            label="Excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            multiline
            rows={3}
            required
            fullWidth
            inputProps={{ maxLength: 150 }}
            helperText={`${excerpt.length}/150 characters`}
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Content
            </Typography>
            <MDEditor
              value={content}
              onChange={setContent}
              preview="edit"
              height={400}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Images
            </Typography>
            <ImageUpload onUpload={handleImageUpload} />
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              mt: 2 
            }}>
              {images.map((url, index) => (
                <Box
                  key={index}
                  component="img"
                  src={url}
                  alt={`Upload ${index + 1}`}
                  sx={{
                    width: 200,
                    height: 150,
                    objectFit: 'cover',
                    borderRadius: 1
                  }}
                />
              ))}
            </Box>
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            size="large"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default CreatePost 