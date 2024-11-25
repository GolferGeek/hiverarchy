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
  Pagination
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useSiteProfile } from '../contexts/SiteProfileContext'
import ConfirmModal from '../components/ConfirmModal'

function Posts() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { siteProfile, isOwner } = useSiteProfile()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [postToDelete, setPostToDelete] = useState(null)
  const postsPerPage = 10

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
      console.log('Fetching posts for user:', {
        userId: user?.id,
        userEmail: user?.email
      })
      setLoading(true)
      
      if (!user?.id) {
        console.log('No user.id available, aborting fetch')
        setLoading(false)
        return
      }

      let query = supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`)
      }

      // Add pagination
      const from = (page - 1) * postsPerPage
      const to = from + postsPerPage - 1
      
      console.log('Executing query with range:', { from, to })
      const { data, count, error } = await query
        .range(from, to)

      console.log('Query results:', { 
        dataLength: data?.length,
        count, 
        error,
        firstPost: data?.[0]
      })

      if (error) throw error

      setPosts(data || [])
      setTotalPages(Math.ceil((count || 0) / postsPerPage))
    } catch (error) {
      console.error('Error fetching posts:', error.message)
      setPosts([])
      setTotalPages(0)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('useEffect triggered with:', {
      userId: user?.id,
      hasUser: !!user,
      loading
    })
    if (user?.id) {
      fetchPosts()
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
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
          onClick={() => navigate(`/${siteProfile.username}/create-post`)}
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
          <Box>
            <Typography variant="h6" component="h2" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/post/${post.id}`)}>
              {post.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date(post.updated_at).toLocaleDateString()}
            </Typography>
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
