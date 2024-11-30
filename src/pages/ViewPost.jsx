import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import MDEditor from '@uiw/react-md-editor'
import { supabase } from '../lib/supabase'
import CommentList from '../components/CommentList'
import ConfirmModal from '../components/ConfirmModal'
import { useAuth } from '../contexts/AuthContext'
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Divider,
  Alert,
  Stack
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import WriterButton from '../components/WriterButton'

function ViewPost() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [parentPost, setParentPost] = useState(null)
  const [childPosts, setChildPosts] = useState([])
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const isAuthor = user && post && user.id === post.user_id
  const isChildPost = post && post.arc_id && post.arc_id !== post.id

  useEffect(() => {
    fetchPost()
  }, [id])

  useEffect(() => {
    if (post) {
      if (post.parent_id) {
        fetchParentPost(post.parent_id)
      }
      fetchChildPosts(post.id)
    }
  }, [post])

  async function fetchPost() {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          tags
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      // Parse tags JSON string and ensure it's an array
      let parsedTags = [];
      try {
        if (data.tags) {
          const parsed = JSON.parse(data.tags);
          parsedTags = Array.isArray(parsed) ? parsed : [];
        }
      } catch (parseError) {
        console.error('Error parsing tags:', parseError);
      }
      
      const postWithParsedTags = {
        ...data,
        tags: parsedTags
      }
      
      setPost(postWithParsedTags)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to load post. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchParentPost(parentId) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title')
        .eq('id', parentId)
        .single()

      if (error) throw error
      setParentPost(data)
    } catch (error) {
      console.error('Error fetching parent post:', error)
    }
  }

  async function fetchChildPosts(postId) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, created_at')
        .eq('parent_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      // Remove duplicates by ID
      const uniquePosts = data ? Array.from(new Map(data.map(post => [post.id, post])).values()) : []
      setChildPosts(uniquePosts)
    } catch (error) {
      console.error('Error fetching child posts:', error)
    }
  }

  async function handleDelete() {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Get the first interest or default to 'coder'
      const defaultInterest = post?.interests?.[0] || 'coder'
      navigate(`/${defaultInterest}`)
    } catch (error) {
      console.error('Error deleting post:', error)
      setError('Failed to delete post. Please try again.')
      setShowDeleteModal(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  if (!post) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">Post not found</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Post Header */}
        <Box sx={{ mb: 4 }}>
          {isChildPost && parentPost && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Part of thread: <Link to={`/post/${parentPost.id}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                  {parentPost.title}
                </Link>
              </Typography>
            </Box>
          )}

          <Typography variant="h3" component="h1" gutterBottom>
            {post.title}
          </Typography>

          {/* Meta Information */}
          <Box sx={{ mb: 3, color: 'text.secondary' }}>
            <Typography variant="body2">
              Posted on {format(new Date(post.created_at), 'MMMM d, yyyy')}
            </Typography>
          </Box>

          {/* Categories and Tags */}
          <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
            {/* Interests */}
            {Array.isArray(post.interests) && post.interests.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Categories
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {post.interests.map((interest, index) => (
                    <Chip
                      key={index}
                      label={interest}
                      color="secondary"
                      sx={{ 
                        borderRadius: '4px',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Tags */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tags
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {post.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'white'
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>

          {/* Edit/Delete Buttons */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {isAuthor && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/create`}
                  state={{ parentPost: post }}
                >
                  Create Child Post
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  component={Link}
                  to={`/edit/${post.id}`}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteClick}
                >
                  Delete
                </Button>
                <WriterButton postId={post.id} />
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Post Content */}
        <Box 
          sx={{ 
            '& img': {
              maxWidth: '100%',
              height: 'auto'
            }
          }}
        >
          <MDEditor.Markdown source={post.content} />
        </Box>

        {/* Child Posts Section */}
        {childPosts.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Continued in:
              </Typography>
              <Stack spacing={2}>
                {childPosts.map((childPost) => (
                  <Box 
                    key={childPost.id}
                    component={Link}
                    to={`/post/${childPost.id}`}
                    sx={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <Typography variant="subtitle1">
                      {childPost.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(childPost.created_at), 'MMMM d, yyyy')}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Comments Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Comments
          </Typography>
          <CommentList postId={post.id} />
        </Box>
      </Paper>

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        content="Are you sure you want to delete this post? This action cannot be undone."
      />
    </Container>
  )
}

export default ViewPost