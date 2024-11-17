import { useState, useEffect } from 'react'
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

function InterestPage({ category, title }) {
  const [posts, setPosts] = useState([])
  const [interestContent, setInterestContent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInterestContent()
    fetchPosts()
  }, [category])

  useEffect(() => {
    fetchPosts()
  }, [searchTerm])

  async function fetchInterestContent() {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('content, title')
        .eq('title', category)
        .single()
      
      if (error) throw error
      setInterestContent(data?.content || '')
    } catch (error) {
      console.error('Error fetching interest content:', error)
    }
  }

  async function fetchPosts() {
    try {
      setLoading(true)
      let query = supabase
        .from('posts')
        .select('*')
        .contains('interests', [category])
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`)
        query = query.limit(10)
      } else {
        query = query.limit(4)
      }

      const { data, error } = await query
      if (error) throw error
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostDelete = async (postId) => {
    setPosts(posts.filter(post => post.id !== postId))
  }

  const getHeroImage = () => {
    switch(category) {
      case 'coder':
        return '/images/coder.jpg'
      case 'golfer':
        return '/images/golfer.jpg'
      case 'mentor':
        return '/images/mentor.jpg'
      case 'older':
        return '/images/aging.jpg'
      default:
        return '/images/coder.jpg'
    }
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
            alt={title}
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
            {title}
          </Typography>
        </Box>
      </Box>

      {/* Content Section */}
      <Container maxWidth="lg">
        {interestContent && (
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <MDEditor.Markdown source={interestContent} />
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