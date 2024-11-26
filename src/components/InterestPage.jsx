import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import PostCard from './PostCard'
import MDEditor from '@uiw/react-md-editor'
import {
  Container,
  Typography,
  Box,
  Button,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  Alert
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

function InterestPage() {
  const navigate = useNavigate()
  const { interest: interestName } = useParams()
  const { user } = useAuth()
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER
  const [interestData, setInterestData] = useState(null)
  const [posts, setPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isOwner = user?.id === defaultUserId

  useEffect(() => {
    fetchInterest()
  }, [interestName])

  useEffect(() => {
    if (interestData) {
      fetchPosts()
    }
  }, [interestData, searchTerm])

  async function fetchInterest() {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .eq('name', interestName)
        .eq('user_id', defaultUserId)
        .single()

      if (error) {
        setError('Interest not found')
        setLoading(false)
        return
      }

      setInterestData(data)
    } catch (error) {
      console.error('Error fetching interest:', error)
      setError('Error fetching interest')
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
        .is('parent_id', null) // Only fetch top-level posts
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

  return (
    <Container maxWidth="lg">
      {/* Header Section */}
      <Box sx={{ mt: 4, mb: 6, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            textTransform: 'capitalize'
          }}
        >
          {interestData.name}
        </Typography>
        {interestData.image_path && (
          <Box
            component="img"
            src={interestData.image_path}
            alt={interestData.name}
            sx={{
              maxWidth: '100%',
              height: 'auto',
              maxHeight: '400px',
              borderRadius: 2,
              boxShadow: 3,
              mb: 4
            }}
          />
        )}
      </Box>

      {/* Content Section */}
      {interestData.content && (
        <Box sx={{ 
          mt: 2,
          '& .w-md-editor': { 
            margin: 0,
            boxShadow: 'none',
            border: '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: 1,
            height: '1000px'
          },
          '& .wmde-markdown': {
            padding: '16px'
          },
          '& .w-md-editor-toolbar': {
            padding: '8px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
          },
          '& .w-md-editor-content': {
            height: 'calc(100% - 40px) !important'
          },
          '& .w-md-editor-input': {
            height: '100% !important'
          },
          '& .w-md-editor-text': {
            height: '100% !important'
          },
          '& .w-md-editor-text-input': {
            padding: '16px !important',
            height: '100% !important'
          },
          '& .w-md-editor-preview': {
            padding: '16px !important',
            height: '100% !important'
          }
        }}>
          <MDEditor.Markdown 
            source={interestData.content}
            highlightEnable={false}
          />
        </Box>
      )}

      {/* Actions Section */}
      {isOwner && (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/create', { state: { interest: interestData } })}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Create New Post
          </Button>
        </Box>
      )}

      {/* Search Section */}
      <Paper 
        elevation={1}
        sx={{ 
          p: 3, 
          mb: 4,
          backgroundColor: 'background.paper'
        }}
      >
        <TextField
          fullWidth
          label="Search Posts"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            }
          }}
        />
      </Paper>

      {/* Posts Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post}
            showInterest={false}
            onEdit={isOwner ? () => navigate(`/edit/${post.id}`) : undefined}
            onDelete={() => fetchPosts()}
            level={0}
          />
        ))}
        {posts.length === 0 && (
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              mt: 4,
              color: 'text.secondary',
              fontStyle: 'italic'
            }}
          >
            No posts found
          </Typography>
        )}
      </Box>
    </Container>
  )
}

export default InterestPage