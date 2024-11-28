import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
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
  const { state } = useLocation()
  const { user } = useAuth()
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [post, setPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    interests: state?.interest ? [state.interest.name] : ['coder'],
    tags: [],
    images: [],
    parent_id: state?.parentPost?.id || null,
    arc_id: state?.parentPost ? (state.arcId || state.parentPost.id) : null
  })

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
      const { data, error } = await supabase
        .from('tags')
        .select('name')
        .or(`user_id.eq.${defaultUserId},user_id.eq.${user?.id}`)
        .order('name')

      if (error) throw error

      setTagSuggestions(data.map(tag => tag.name))
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  function handleInterestChange(value) {
    setPost(prev => {
      if (prev.interests.includes(value)) {
        return { ...prev, interests: prev.interests.filter(int => int !== value) }
      } else {
        return { ...prev, interests: [...prev.interests, value] }
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
    
    if (trimmedInput && !post.tags.includes(trimmedInput)) {
      try {
        // First, add to tags table if it doesn't exist
        const { error } = await supabase
          .from('tags')
          .insert([{ 
            name: trimmedInput,
            user_id: user?.id || defaultUserId 
          }])

        if (error) throw error
        setPost(prev => ({ ...prev, tags: [...prev.tags, trimmedInput] }))
        event.target.value = ''
        await fetchAllTags()
      } catch (error) {
        console.error('Error adding tag:', error)
      }
    }
  }

  const handleTagSelect = (tagName) => {
    if (!post.tags.includes(tagName)) {
      setPost(prev => ({ ...prev, tags: [...prev.tags, tagName] }))
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove) => {
    setPost(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const handleImageUpload = (uploadedImages) => {
    setPost(prev => ({ ...prev, images: [...prev.images, ...uploadedImages] }))
  }

  const handleRemoveImage = (imageUrl) => {
    setPost(prev => ({ ...prev, images: prev.images.filter(img => img !== imageUrl) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // First, insert the post without arc_id to get its ID
      const { data: newPost, error: insertError } = await supabase
        .from('posts')
        .insert([{
          ...post,
          user_id: user.id,
          parent_id: post.parent_id ? parseInt(post.parent_id) : null,
          arc_id: null // Always set to null initially
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // If this is a child post and parent has an arc_id, update this post's arc_id
      if (post.parent_id) {
        const { data: parentPost, error: parentError } = await supabase
          .from('posts')
          .select('arc_id')
          .eq('id', parseInt(post.parent_id))
          .single()

        if (parentError) throw parentError

        // Use parent's arc_id if it exists, otherwise use parent's id as the arc_id
        const arcId = parentPost.arc_id || parseInt(post.parent_id)

        // Update both this post and parent (if parent doesn't have arc_id set)
        const { error: updateError } = await supabase
          .rpc('update_post_arc', { 
            post_id: newPost.id,
            parent_post_id: parseInt(post.parent_id),
            arc_identifier: arcId
          })

        if (updateError) throw updateError
      }

      // Navigate to the new post's view page
      navigate(`/post/${newPost.id}`)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredSuggestions = tagSuggestions.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !post.tags.includes(tag)
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
            {state?.parentPost && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Creating child post for: <Link to={`/post/${state.parentPost.id}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                      {state.parentPost.title}
                    </Link>
                  </Typography>
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="Title"
                value={post.title}
                onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Excerpt"
                value={post.excerpt}
                onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
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
              <Box sx={{ 
                '& .w-md-editor': { 
                  margin: 0,
                  boxShadow: 'none',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: 1,
                  height: '1000px'
                },
                '& .wmde-markdown': {
                  padding: '16px'
                },
                '& .w-md-editor-toolbar': {
                  padding: '8px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                },
                '& .w-md-editor-content': {
                  height: 'calc(100% - 40px) !important'
                },
                '& .w-md-editor-input': {
                  height: '100% !important'
                },
                '& .w-md-editor-text': {
                  height: '100% !important'
                },
                '& .w-md-editor-text-input': {
                  padding: '16px !important',
                  height: '100% !important'
                },
                '& .w-md-editor-preview': {
                  padding: '16px !important',
                  height: '100% !important'
                }
              }}>
                <MDEditor
                  value={post.content}
                  onChange={(value) => setPost(prev => ({ ...prev, content: value }))}
                  preview="edit"
                  highlightEnable={false}
                  enableScroll={true}
                />
              </Box>
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
                        checked={post.interests.includes(interest.value)}
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
                    .filter(tag => !post.tags.includes(tag))
                    .map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onClick={() => handleTagSelect(tag)}
                        variant="outlined"
                        size="small"
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
                  {post.tags.map((tag, index) => (
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
                sx={{ mt: 2 }}
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
                existingImages={post.images}
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