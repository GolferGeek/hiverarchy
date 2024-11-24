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
  Button,
  Alert
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
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchInterestData()
  }, [interest])

  useEffect(() => {
    if (interestData) {
      fetchPosts()
    }
  }, [searchTerm, interestData])

  async function fetchInterestData() {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .eq('name', interest)
        .eq('user_id', defaultUserId)
        .single()

      if (error) {
        setError('Interest not found')
        setLoading(false)
        return
      }
      
      setInterestData(data)
    } catch (error) {
      setError('Failed to load interest')
    } finally {
      setLoading(false)
    }
  }

  async function fetchPosts() {
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .contains('interests', [interestData.name])
        .eq('user_id', defaultUserId)
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.textSearch('title', searchTerm)
      }

      const { data, error } = await query
      if (error) {
        return
      }
      
      setPosts(data)
    } catch (error) {
      // Handle error silently
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading interest...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </Container>
    )
  }

  const isOwner = user?.id === defaultUserId

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {interestData?.title}
        </Typography>
        {interestData?.description && (
          <Paper sx={{ p: 3, mb: 4, backgroundColor: 'background.paper' }}>
            <MDEditor.Markdown source={interestData.description} />
          </Paper>
        )}
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
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
        />
        {isOwner && (
          <Button
            variant="contained"
            onClick={() => navigate('/create', { state: { interest: interestData } })}
          >
            Create Post
          </Button>
        )}
      </Stack>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post}
            showInterest={false}
            onEdit={isOwner ? () => navigate(`/edit/${post.id}`) : undefined}
          />
        ))}
        {posts.length === 0 && (
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            No posts found
          </Typography>
        )}
      </Box>
    </Container>
  )
}

export default InterestPage