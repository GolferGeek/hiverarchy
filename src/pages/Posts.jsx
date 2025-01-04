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
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [postToDelete, setPostToDelete] = useState(null)
  const postsPerPage = 10
  const { currentUsername } = useProfile()

  console.log('Component rendered with user details:', {
    userId: user?.id,
    userEmail: user?.email,
    userMetadata: user?.user_metadata,
    siteProfileId: siteProfile?.id,
    loading,
    postsLength: posts.length
  })

  const fetchPosts = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available, skipping fetch')
        setLoading(false)
        return
      }

      setLoading(true)
      console.log('Fetching posts with params:', {
        userId: user.id,
        page,
        from: (page - 1) * postsPerPage,
        to: (page - 1) * postsPerPage + postsPerPage - 1
      })

      const from = (page - 1) * postsPerPage
      const to = from + postsPerPage - 1

      let query = supabase
        .from('posts')
        .select(`
          *,
          images (
            url
          )
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`)
      }

      const { data, count, error } = await query

      if (error) {
        console.error('Error in query:', error)
        throw error
      }

      console.log('Query results:', {
        postsCount: data?.length || 0,
        totalCount: count,
        posts: data
      })

      setPosts(data || [])
      setTotalPages(Math.ceil((count || 0) / postsPerPage))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('useEffect triggered with:', {
      userId: user?.id,
      hasUser: !!user,
      loading,
      page,
      searchTerm
    })
    
    if (user?.id) {
      fetchPosts()
    } else {
      console.log('No user ID in useEffect, skipping fetch')
    }
  }, [user?.id, page, searchTerm])

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
    navigate(`/${currentUsername}/post/${post.id}`)
  }

  // Add debug render log
  console.log('Render state:', {
    postsLength: posts.length,
    loading,
    totalPages,
    currentPage: page,
    userId: user?.id
  })

  if (loading || profileLoading) {
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
          onClick={() => navigate(`/${currentUsername}/create`)}
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

      {posts.map((post) => (
        <Paper key={post.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
            <Box
              component="img"
              src={(() => {
                const imageUrl = post.images?.[0]?.url;
                try {
                  const parsedUrls = JSON.parse(imageUrl);
                  return parsedUrls[0] || '/images/default.jpg';
                } catch (e) {
                  return '/images/default.jpg';
                }
              })()}
              alt={post.title}
              sx={{
                width: 100,
                height: 100,
                objectFit: 'cover',
                borderRadius: 1,
                flexShrink: 0
              }}
              onError={(e) => {
                e.target.src = '/images/default.jpg'
              }}
            />
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
      ))}

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
