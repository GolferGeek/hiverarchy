import { useState, useEffect } from 'react'
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
  Grid,
  Chip,
  Stack
} from '@mui/material'

function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [interests, setInterests] = useState(['coder'])
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [error, setError] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const availableInterests = [
    { value: 'coder', label: 'Coder' },
    { value: 'golfer', label: 'Golfer' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'aging', label: 'Aging' }
  ]

  useEffect(() => {
    fetchAllTags()
  }, [])

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

  function handleInterestChange(value) {
    setInterests(prev => {
      if (prev.includes(value)) {
        return prev.filter(int => int !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value)
  }

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag(e)
    }
  }

  const handleAddTag = async (event) => {
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
            tags: JSON.stringify(tags),
            images,
            user_id: user?.id
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

  // Filter suggestions based on input
  const filteredSuggestions = tagSuggestions.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !tags.includes(tag)
  )

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
                onKeyDown={handleTagInputKeyDown}
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
              <Typography variant="subtitle1" gutterBottom>
                Images
              </Typography>
              <ImageUpload 
                onUpload={handleImageUpload}
                onRemove={handleRemoveImage}
                existingImages={images}
              />
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