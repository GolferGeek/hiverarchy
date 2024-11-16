import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ImageUpload from '../components/ImageUpload'
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
  Grid,
  CircularProgress
} from '@mui/material'

function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState([])
  const [error, setError] = useState('')
  const { user } = useAuth()

  const availableInterests = [
    { value: 'coder', label: 'Coder' },
    { value: 'golfer', label: 'Golfer' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'aging', label: 'Aging' }
  ]

  useEffect(() => {
    fetchPost()
  }, [id])

  async function fetchPost() {
    try {
      // Fetch post data
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (postError) throw postError

      // Fetch associated images
      const { data: imageData, error: imageError } = await supabase
        .from('images')
        .select('url')
        .eq('post_id', id)

      if (imageError) throw imageError

      setTitle(post.title)
      setContent(post.content)
      setExcerpt(post.excerpt)
      setInterests(post.interests)
      setImages(imageData.map(img => img.url))

      if (post.author_id !== user.id) {
        navigate('/')
        return
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to fetch post')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

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

    setSaving(true)
    setError('')

    try {
      // Update post
      const { error: postError } = await supabase
        .from('posts')
        .update({
          title,
          content,
          excerpt,
          interests,
          updated_at: new Date()
        })
        .eq('id', id)

      if (postError) throw postError

      // Handle images
      const { data: existingImages } = await supabase
        .from('images')
        .select('url')
        .eq('post_id', id)

      const existingUrls = existingImages.map(img => img.url)
      const newImages = images.filter(url => !existingUrls.includes(url))
      const removedImages = existingUrls.filter(url => !images.includes(url))

      // Add new images
      if (newImages.length > 0) {
        const { error: insertError } = await supabase
          .from('images')
          .insert(newImages.map(url => ({
            url,
            post_id: id
          })))

        if (insertError) throw insertError
      }

      // Remove deleted images
      if (removedImages.length > 0) {
        const { error: deleteError } = await supabase
          .from('images')
          .delete()
          .eq('post_id', id)
          .in('url', removedImages)

        if (deleteError) throw deleteError
      }

      navigate('/post/' + id)
    } catch (error) {
      console.error('Error updating post:', error)
      setError('Failed to update post. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Post
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
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/post/' + id)}
                  disabled={saving}
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

export default EditPost