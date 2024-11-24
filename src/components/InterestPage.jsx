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
import { useSiteProfile } from '../contexts/SiteProfileContext'

function InterestPage() {
  const { interest } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { siteProfile, isOwner } = useSiteProfile()
  const [interestData, setInterestData] = useState(null)
  const [posts, setPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (siteProfile) {
      fetchInterestData()
    }
  }, [interest, siteProfile])

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
        .eq('user_id', siteProfile.id)
        .single()

      if (error) throw error
      setInterestData(data)
    } catch (error) {
      console.error('Error fetching interest:', error)
      navigate(`/${siteProfile.username}`)
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
        .eq('user_id', siteProfile.id)
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.textSearch('title', searchTerm)
      }

      const { data, error } = await query
      if (error) throw error
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

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
        {isOwner(user) && (
          <Button
            variant="contained"
            onClick={() => navigate(`/${siteProfile.username}/create`, { state: { interest: interestData } })}
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
            onEdit={isOwner(user) ? () => navigate(`/${siteProfile.username}/edit/${post.id}`) : undefined}
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