import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
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
  const { interest: interestName, username: routeUsername } = useParams()
  const { user } = useAuth()
  const { profile, currentUsername } = useProfile()
  const [interestData, setInterestData] = useState(null)
  const [posts, setPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isOwner = user?.id === interestData?.user_id

  useEffect(() => {
    if (interestName) {
      fetchInterest()
    } else {
      setLoading(false)
      setError('No interest specified')
    }
  }, [interestName])

  useEffect(() => {
    if (interestData) {
      fetchPosts()
    }
  }, [interestData, searchTerm])

  const fetchInterest = async () => {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .eq('name', interestName)
        .single()

      if (error) throw error
      setInterestData(data)
    } catch (error) {
      setError('Failed to fetch interest')
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .contains('interest_names', [interestName])

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      setError('Failed to fetch posts')
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
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              borderRadius: 2,
              boxShadow: 3,
              mb: 4
            }}
            onError={(e) => {
              console.error(`Failed to load image for ${interestData.name}:`, interestData.image_path);
              e.target.style.display = 'none';
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
            onClick={() => navigate(`/${currentUsername}/create`, { state: { interest: interestData } })}
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