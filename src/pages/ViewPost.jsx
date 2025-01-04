import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import MDEditor from '@uiw/react-md-editor'
import { supabase } from '../lib/supabase'
import CommentList from '../components/CommentList'
import ConfirmModal from '../components/ConfirmModal'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
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
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import WriterButton from '../components/WriterButton'
import RefutationList from '../components/RefutationList'

function ViewPost() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [parentPost, setParentPost] = useState(null)
  const [childPosts, setChildPosts] = useState([])
  const [commentCount, setCommentCount] = useState(0)
  const [refutationCount, setRefutationCount] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const isAuthor = user && post && user.id === post.user_id
  const isChildPost = post && post.arc_id && post.arc_id !== post.id
  const { currentUsername } = useProfile()

  useEffect(() => {
    fetchPost()
  }, [id])

  useEffect(() => {
    if (post?.id) {
      fetchPostImages(post.id).then(images => {
        setPost(prev => ({
          ...prev,
          images
        }))
      })
    }
  }, [post?.id])

  useEffect(() => {
    if (post) {
      if (post.parent_id) {
        fetchParentPost(post.parent_id)
      }
      fetchChildPosts(post.id)
    }
  }, [post])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          images (
            url
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      setPost({
        ...data,
        username: currentUsername
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to load post')
      setLoading(false)
    }
  }

  // Fetch images separately if needed
  const fetchPostImages = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('url')
        .eq('post_id', postId)

      if (error) throw error

      console.log('Fetched images:', data)
      return data
    } catch (error) {
      console.error('Error fetching images:', error)
      return []
    }
  }

  async function fetchParentPost(parentId) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', parentId)
        .single()

      if (error) throw error

      setParentPost({
        ...data,
        username: currentUsername
      })
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
      
      // Add username and remove duplicates
      const postsWithUsername = data.map(post => ({
        ...post,
        username: currentUsername
      }))
      const uniquePosts = postsWithUsername ? Array.from(new Map(postsWithUsername.map(post => [post.id, post])).values()) : []
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
          {post.parent_id && parentPost && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Part of thread: <Link to={`/${parentPost.username}/post/${parentPost.id}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                  {parentPost.title}
                </Link>
              </Typography>
            </Box>
          )}
          <Typography variant="h4" gutterBottom>
            {post.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {format(new Date(post.created_at), 'MMMM d, yyyy')}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 4, 
            mt: 2, 
            mb: 2 
          }}>
            <Box sx={{ 
              flex: 1,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Interests
              </Typography>
              {post.interest_names && post.interest_names.map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  component={Link}
                  to={`/interest/${interest}`}
                  clickable
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
            <Box sx={{ 
              flex: 1,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tags
              </Typography>
              {post.tag_names && post.tag_names.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {isAuthor && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/${currentUsername}/create`}
                  state={{ parentPost: post }}
                >
                  Create Child Post
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  component={Link}
                  to={`/${currentUsername}/edit/${post.id}`}
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
              maxWidth: '400px',
              maxHeight: '300px',
              height: 'auto',
              objectFit: 'contain'
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
                    to={`/${childPost.username}/post/${childPost.id}`}
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
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="comments-content"
              id="comments-header"
            >
              <Typography variant="h5">Comments ({commentCount})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CommentList postId={post.id} onCountChange={setCommentCount} />
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Refutations Section */}
        <Box sx={{ mt: 4 }}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="refutations-content"
              id="refutations-header"
            >
              <Typography variant="h5">Refutations ({refutationCount})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RefutationList postId={post.id} onCountChange={setRefutationCount} />
            </AccordionDetails>
          </Accordion>
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