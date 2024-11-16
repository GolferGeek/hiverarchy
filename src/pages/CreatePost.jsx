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
  Alert,
  Grid
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

    if (!title || !content) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Insert post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert([
          {
            title,
            content,
            excerpt,
            interests,
            author_id: user.id
          }
        ])
        .select()
        .single()

      if (postError) throw postError

      // Handle image uploads if any
      if (images.length > 0) {
        const imagePromises = images.map(async (image) => {
          const { error: imageError } = await supabase
            .from('images')
            .insert([
              {
                url: image,
                post_id: post.id
              }
            ])
          
          if (imageError) throw imageError
        })

        await Promise.all(imagePromises)
      }

      navigate('/post/' + post.id)
    } catch (error) {
      console.error('Error creating post:', error)
      setError('Failed to create post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Post
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                helperText="A brief summary of your post"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Content
              </Typography>
              <Paper sx={{ p: 2 }}>
                <MDEditor
                  value={content}
                  onChange={setContent}
                  preview="edit"
                  height={400}
                  highlightEnable={true}
                  enableScroll={true}
                />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Interests
              </Typography>
              <FormGroup row>
                {availableInterests.map((interest) => (
                  <FormControlLabel
                    key={interest.value}
                    control={
                      <Checkbox
                        checked={interests.includes(interest.value)}
                        onChange={() => handleInterestChange(interest.value)}
                      />
                    }
                    label={interest.label}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Images
              </Typography>
              <ImageUpload images={images} setImages={setImages} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Post'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  )
}

export default CreatePost