import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField,
  Paper,
  IconButton,
  InputAdornment,
  Pagination,
  CircularProgress
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useSiteProfile } from '../contexts/SiteProfileContext'
import ConfirmModal from '../components/ConfirmModal'
import { useProfile } from '../contexts/ProfileContext'

function Posts() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { siteProfile, loading: profileLoading } = useSiteProfile()
  const { currentUsername, loading: profileContextLoading } = useProfile()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [postToDelete, setPostToDelete] = useState(null)
  const postsPerPage = 10

  const fetchPosts = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          images (
            url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      setError('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id && currentUsername && currentUsername !== 'undefined') {
      fetchPosts()
    }
  }, [user?.id, currentUsername])

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
    setPage(1) // Reset to first page when searching
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleDeleteClick = (post) => {
    setPostToDelete(post)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return

    try {
      const { error: imageError } = await supabase
        .from('images')
        .delete()
        .eq('post_id', postToDelete.id)

      if (imageError) throw imageError

      const { error: postError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postToDelete.id)

      if (postError) throw postError

      setPosts(posts.filter(p => p.id !== postToDelete.id))
      setShowDeleteModal(false)
      setPostToDelete(null)
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handlePostClick = (post) => {
    if (!currentUsername || currentUsername === 'undefined') {
      console.warn('Username not available')
      return
    }
    navigate(`/${currentUsername}/post/${post.id}`)
  }

  if (loading || profileLoading || profileContextLoading || !currentUsername || currentUsername === 'undefined') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Manage Posts
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (!currentUsername || currentUsername === 'undefined') {
              console.warn('Username not available')
              return
            }
            navigate(`/${currentUsername}/create`)
          }}
        >
          Create Post
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {posts.map((post) => {
        const imageUrl = post.images?.[0]?.url;
        let parsedImageUrl = null;
        try {
          const parsed = JSON.parse(imageUrl);
          parsedImageUrl = parsed[0];
        } catch (e) {
          // If parsing fails, use the original URL
          parsedImageUrl = imageUrl;
        }

        return (
          <Paper key={post.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
              <Box sx={{ width: 100, flexShrink: 0 }}>
                {parsedImageUrl && (
                  <Box
                    component="img"
                    src={parsedImageUrl}
                    alt={post.title}
                    sx={{
                      width: '100%',
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                    onError={(e) => {
                      e.target.src = '/images/default.jpg'
                    }}
                  />
                )}
              </Box>
              <Box>
                <Typography variant="h6" component="h2" sx={{ cursor: 'pointer' }} onClick={() => handlePostClick(post)}>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated: {new Date(post.updated_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <Box>
              <IconButton onClick={() => handleDeleteClick(post)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Paper>
        );
      })}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setPostToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        content="Are you sure you want to delete this post? This action cannot be undone."
      />
    </Container>
  )
}

export default Posts
