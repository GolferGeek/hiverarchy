import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ImageUpload from '../components/ImageUpload'
import MarkdownEditor from '../components/MarkdownEditor'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
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
  Stack,
  List,
  ListItem,
  ListItemText
} from '@mui/material'

function CreatePost() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { user } = useAuth()
  const { currentUsername } = useProfile()
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [post, setPost] = useState({
    title: '',
    brief_description: '',
    content: '',
    tag_names: [],
    tag_ids: [],
    interest_names: [],
    interest_ids: [],
    images: []
  })

  const availableInterests = [
    { id: '1c6d9fa6-908b-4e83-8c1e-3baf6571d6d9', value: 'coder', label: 'Coder' },
    { id: '2a8b7c9d-456e-4f12-9a3b-8c7d6e5f4e3d', value: 'golfer', label: 'Golfer' },
    { id: '3e4f5c6d-789a-4b1c-9d2e-1f2e3d4c5b6a', value: 'mentor', label: 'Mentor' },
    { id: '4d5e6f7g-890b-4c2d-ae3f-2g3h4i5j6k7l', value: 'aging', label: 'Aging' }
  ]

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }

    fetchAllTags()
  }, [user])

  async function fetchAllTags() {
    try {
      // Only fetch if we have a user ID
      if (!user?.id) {
        console.log('No user ID available for fetching tags')
        return
      }

      const { data, error } = await supabase
        .from('tags')
        .select('name')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error

      setTagSuggestions(data.map(tag => tag.name))
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleInterestChange = (interest) => {
    setPost(prev => {
      const interestId = interest.id
      const interestLabel = interest.label

      // If interest is already selected, remove it
      if (prev.interest_names.includes(interestLabel)) {
        return {
          ...prev,
          interest_ids: prev.interest_ids.filter(id => id !== interestId),
          interest_names: prev.interest_names.filter(name => name !== interestLabel)
        }
      }

      // Otherwise, add it
      return {
        ...prev,
        interest_ids: [...prev.interest_ids, interestId],
        interest_names: [...prev.interest_names, interestLabel]
      }
    })
  }

  const handleTagChange = (tag) => {
    setPost(prev => {
      const tagId = tag.id
      const tagName = tag.name

      // If tag is already selected, remove it
      if (prev.tag_ids.includes(tagId)) {
        return {
          ...prev,
          tag_ids: prev.tag_ids.filter(id => id !== tagId),
          tag_names: prev.tag_names.filter(name => name !== tagName)
        }
      }

      // Otherwise, add it
      return {
        ...prev,
        tag_ids: [...prev.tag_ids, tagId],
        tag_names: [...prev.tag_names, tagName]
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
    
    if (trimmedInput && !post.tag_names.includes(trimmedInput)) {
      try {
        // First, add to tags table if it doesn't exist
        const { data, error } = await supabase
          .from('tags')
          .insert([{ 
            name: trimmedInput,
            user_id: user?.id
          }])
          .select()
          .single()

        if (error) throw error
        
        // Update post with new tag
        setPost(prev => ({
          ...prev,
          tag_ids: [...prev.tag_ids, data.id],
          tag_names: [...prev.tag_names, data.name]
        }))
        
        event.target.value = ''
        await fetchAllTags()
      } catch (error) {
        console.error('Error adding tag:', error)
      }
    }
  }

  const handleTagSelect = async (tagName) => {
    if (!post.tag_names.includes(tagName)) {
      try {
        // Get the tag ID from the database
        const { data, error } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single()

        if (error) throw error

        setPost(prev => ({
          ...prev,
          tag_ids: [...prev.tag_ids, data.id],
          tag_names: [...prev.tag_names, tagName]
        }))
      } catch (error) {
        console.error('Error getting tag ID:', error)
      }
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove) => {
    setPost(prev => ({
      ...prev,
      tag_names: prev.tag_names.filter(tag => tag !== tagToRemove),
      tag_ids: prev.tag_ids.filter((_, index) => prev.tag_names[index] !== tagToRemove)
    }))
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
      // For child posts, use parent's arc_id, otherwise generate a new one
      const arc_id = state?.parentPost ? state.parentPost.arc_id : crypto.randomUUID()

      // Create the post
      const { data: newPost, error: createError } = await supabase
        .from('posts')
        .insert([{
          title: post.title,
          brief_description: post.brief_description,
          content: post.content,
          tag_names: post.tag_names,
          tag_ids: post.tag_ids,
          interest_names: post.interest_names,
          interest_ids: post.interest_ids,
          user_id: user.id,
          arc_id: arc_id,
          parent_id: state?.parentPost?.id || null,
          post_writer: {
            status: 'child_posts',
            version: 1,
            content: post.brief_description || '',
            ideas: { ideas: [], relatedTopics: [], audiences: [], childPosts: [], futurePosts: [] },
            research_findings: null,
            refutations: null,
            post_outline: null,
            post_images: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }])
        .select()
        .single()

      if (createError) throw createError

      // If this is not a child post, update arc_id to be the post's own ID
      if (!state?.parentPost) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ arc_id: newPost.id })
          .eq('id', newPost.id)

        if (updateError) throw updateError
      }

      // Handle image uploads if any
      if (post.images && post.images.length > 0) {
        const { error: imageError } = await supabase
          .from('images')
          .insert(
            post.images.map(image => ({
              url: image.url,
              post_id: newPost.id
            }))
          )

        if (imageError) throw imageError
      }

      navigate(`/${currentUsername}/post/${newPost.id}`)
    } catch (error) {
      console.error('Error creating post:', error)
      setError('Failed to create post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredSuggestions = tagSuggestions.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !post.tag_names.includes(tag)
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
                required
                fullWidth
                label="Title"
                value={post.title}
                onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                error={!post.title}
                helperText={!post.title ? 'Title is required' : ''}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={3}
                label="Brief Description"
                placeholder="Enter a brief description of your post"
                value={post.brief_description}
                onChange={(e) => setPost(prev => ({ ...prev, brief_description: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Interests
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {availableInterests.map((interest) => (
                  <Chip
                    key={interest.value}
                    label={interest.label}
                    onClick={() => handleInterestChange(interest)}
                    color={post.interest_names.includes(interest.label) ? 'primary' : 'default'}
                    variant={post.interest_names.includes(interest.label) ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tags
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Previously used tags:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {tagSuggestions.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onClick={() => handleTagSelect(tag)}
                    variant="outlined"
                    color={post.tag_names.includes(tag) ? 'primary' : 'default'}
                  />
                ))}
              </Stack>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add tags"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  helperText="Press Enter to add a tag"
                />
                {filteredSuggestions.length > 0 && tagInput && (
                  <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                    <List dense>
                      {filteredSuggestions.map((suggestion, index) => (
                        <ListItem
                          key={index}
                          button
                          onClick={() => handleTagSelect(suggestion)}
                        >
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {post.tag_names.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                  />
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Content
              </Typography>
              <TextField
                required
                fullWidth
                multiline
                rows={10}
                value={post.content}
                onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                error={!post.content}
                helperText={!post.content ? 'Content is required' : ''}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Images
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Tip: Hover over an uploaded image and click the "Copy" icon to get the markdown code for embedding the image in your post.
              </Typography>
              <ImageUpload
                onUpload={handleImageUpload}
                onRemove={handleRemoveImage}
                existingImages={post.images}
                bucket="post-images"
                folder="post-images"
                showCopyOption={true}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !post.title || !post.content}
                >
                  {loading ? 'Creating...' : 'Create Post'}
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