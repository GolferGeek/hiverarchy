import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import MDEditor from '@uiw/react-md-editor'
import ImageUpload from '../components/ImageUpload'
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  Chip,
  Stack,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material'

export default function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [interests, setInterests] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [images, setImages] = useState([])
  const [loadingPost, setLoadingPost] = useState(true)

  const availableInterests = [
    { value: 'coder', label: 'Coder' },
    { value: 'golfer', label: 'Golfer' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'leader', label: 'Leader' }
  ]

  useEffect(() => {
    fetchPost()
    fetchAllTags()
  }, [id])

  async function fetchPost() {
    try {
      setLoadingPost(true)
      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (post) {
        setTitle(post.title)
        setContent(post.content)
        setExcerpt(post.excerpt || '')
        setInterests(post.interests || [])
        setTags(post.tags ? JSON.parse(post.tags) : [])
        setImages(post.images || [])
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Error fetching post')
    } finally {
      setLoadingPost(false)
    }
  }

  async function fetchAllTags() {
    try {
      setLoadingSuggestions(true)
      const { data, error } = await supabase
        .from('tags')
        .select('name')
        .or(`user_id.eq.${defaultUserId},user_id.eq.${user?.id}`)
        .order('name')

      if (error) throw error
      setTagSuggestions(data.map(tag => tag.name))
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value)
  }

  const handleAddTag = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const trimmedInput = event.target.value.trim().toLowerCase()
      
      if (trimmedInput && !tags.includes(trimmedInput)) {
        try {
          // First, add to tags table if it doesn't exist
          const { error } = await supabase
            .from('tags')
            .insert([{ 
              name: trimmedInput,
              user_id: user?.id || defaultUserId 
            }])

          if (error) throw error
          setTags([...tags, trimmedInput])
          event.target.value = ''
          await fetchAllTags()
        } catch (error) {
          console.error('Error adding tag:', error)
        }
      }
    }
  }

  const handleTagSelect = (tagName) => {
    if (!tags.includes(tagName)) {
      setTags([...tags, tagName])
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleImageUpload = (uploadedImages) => {
    setImages(prev => [...prev, ...uploadedImages])
  }

  const handleRemoveImage = (imageUrl) => {
    setImages(prev => prev.filter(img => img !== imageUrl))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to edit a post')
      return
    }

    try {
      setError(null)
      setLoading(true)

      const { error } = await supabase
        .from('posts')
        .update({
          title,
          content,
          excerpt,
          interests,
          tags: JSON.stringify(tags),
          images,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      navigate(`/post/${id}`)
    } catch (error) {
      console.error('Error updating post:', error)
      setError('Failed to update post')
    } finally {
      setLoading(false)
    }
  }

  const filteredSuggestions = tagSuggestions.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !tags.includes(tag)
  )

  if (loadingPost) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
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
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Content
              </Typography>
              <MDEditor
                value={content}
                onChange={setContent}
                height={400}
                preview="edit"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Available Tags
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  {tagSuggestions
                    .filter(tag => !tags.includes(tag))
                    .map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onClick={() => handleTagSelect(tag)}
                        color="default"
                        variant="outlined"
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                </Stack>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Selected Tags
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Add New Tag
              </Typography>
              <TextField
                fullWidth
                label="New Tag"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleAddTag}
                placeholder="Type a new tag and press Enter"
                helperText="Press Enter to add a new tag"
                size="small"
                margin="normal"
              />
              {tagInput && filteredSuggestions.length > 0 && (
                <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                  <Stack>
                    {filteredSuggestions.map((suggestion) => (
                      <Box
                        key={suggestion}
                        sx={{
                          p: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                        onClick={() => handleTagSelect(suggestion)}
                      >
                        <Typography variant="body2">{suggestion}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Images
              </Typography>
              <ImageUpload 
                onUpload={handleImageUpload}
                onRemove={handleRemoveImage}
                existingImages={images}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/post/${id}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  )
}