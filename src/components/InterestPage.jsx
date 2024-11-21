import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import MDEditor from '@uiw/react-md-editor'
import { 
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Stack,
  Paper,
  Button
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import PostCard from './PostCard'
import { useAuth } from '../contexts/AuthContext'

function InterestPage() {
  const { interest } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER
  const [interestData, setInterestData] = useState(null)
  const [posts, setPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInterestData()
  }, [interest, user])

  useEffect(() => {
    if (interestData) {
      fetchPosts()
    }
  }, [searchTerm, interestData])

  async function fetchInterestData() {
    try {
      // Try to get user-specific interest first if logged in
      if (user) {
        const { data, error } = await supabase
          .from('interests')
          .select('*')
          .eq('name', interest)
          .eq('user_id', user.id)
          .single()
        
        if (!error && data) {
          setInterestData(data)
          return
        }
      }

      // If no user or no user-specific interest, get default user's interest
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .eq('name', interest)
        .eq('user_id', defaultUserId)
        .single()
      
      if (error) {
        console.error('Error fetching interest:', error)
        navigate('/')
        return
      }
      setInterestData(data)
    } catch (error) {
      console.error('Error in fetchInterestData:', error)
      navigate('/')
    }
  }

  async function fetchPosts() {
    try {
      setLoading(true)
      let query = supabase
        .from('posts')
        .select(`
          *,
          tags
        `)
        .contains('interests', [interestData.name])
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
        query = query.limit(10)
      } else {
        query = query.limit(4)
      }

      const { data, error } = await query
      if (error) throw error
      
      // Parse tags JSON string for each post
      const postsWithParsedTags = data.map(post => ({
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : []
      }))
      
      setPosts(postsWithParsedTags)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handlePostDelete = async (postId) => {
    setPosts(posts.filter(post => post.id !== postId))
  }

  const getHeroImage = () => {
    if (!interestData?.image_path) {
      return '/images/coder.jpg' // default image
    }
    return interestData.image_path
  }

  if (!interestData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ mb: 6 }}>
        <Box 
          sx={{
            position: 'relative',
            height: '300px',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={getHeroImage()}
            alt={interestData.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
        <Box
          sx={{
            textAlign: 'center',
            bgcolor: 'background.paper',
            py: 4
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            {interestData.title}
          </Typography>
        </Box>
      </Box>

      {/* Content Section */}
      <Container maxWidth="lg">
        {interestData.content && (
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <MDEditor.Markdown source={interestData.content} />
          </Paper>
        )}

        {/* Search Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : posts.length > 0 ? (
            <Stack spacing={4}>
              {posts.map(post => (
                <Box key={post.id}>
                  <PostCard post={post} onDelete={handlePostDelete} />
                </Box>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No posts found
              </Typography>
              <Typography color="text.secondary" paragraph>
                Try adjusting your search or check back later for new content.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  )
}

export default InterestPage