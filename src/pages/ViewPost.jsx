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

function ViewPost() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const isAuthor = user && post && user.id === post.user_id

  useEffect(() => {
    fetchPost()
  }, [id])

  async function fetchPost() {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setPost(data)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to load post. Please try again later.')
    } finally {
      setLoading(false)
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Post Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {post.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(post.created_at), 'MMMM d, yyyy')}
            </Typography>
            <Stack direction="row" spacing={1}>
              {post.interests.map(interest => (
                <Chip
                  key={interest}
                  label={interest}
                  color="primary"
                  variant="outlined"
                  component={Link}
                  to={`/${interest.toLowerCase()}`}
                  clickable
                />
              ))}
            </Stack>
          </Box>
          
          {isAuthor && (
            <Box sx={{ mt: 2 }}>
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                component={Link}
                to={`/edit/${post.id}`}
                sx={{ mr: 2 }}
              >
                Edit Post
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="error"
                onClick={handleDeleteClick}
              >
                Delete Post
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Post Content */}
        <Box 
          sx={{ 
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              maxHeight: '600px',
              display: 'block',
              margin: '20px auto'
            }
          }}
          data-color-mode="light"
        >
          <MDEditor.Markdown 
            source={post.content} 
            style={{ 
              whiteSpace: 'pre-wrap',
              background: 'transparent',
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          />
        </Box>

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
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </Container>
  )
}

export default ViewPost