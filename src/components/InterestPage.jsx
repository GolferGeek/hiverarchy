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
import { useInterests } from '../contexts/InterestContext'
import ReactMarkdown from 'react-markdown'

function InterestPage() {
  const navigate = useNavigate()
  const params = useParams()
  const { interest: interestParam, username: routeUsername } = params
  const { user } = useAuth()
  const { profile, currentUsername, blogProfile } = useProfile()
  const [interestData, setInterestData] = useState(null)
  const [posts, setPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isOwner = user?.id === interestData?.user_id
  const { interests, loading: interestsLoading } = useInterests()
  
  // Determine the actual interest name, accounting for potential URL format differences
  const interestName = interestParam || (params[0] === 'interest' && params[1]) || null
  
  // Log params to debug issues
  useEffect(() => {
    console.log('InterestPage params:', { 
      rawParams: params,
      interestName, 
      interestParam,
      routeUsername,
      currentUsername,
      blogProfileUsername: blogProfile?.username,
      location: window.location.href,
      isLocalhost4021: window.location.host === 'localhost:4021'
    })
  }, [params, interestName, interestParam, routeUsername, currentUsername, blogProfile])

  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      if (!interestName) {
        setLoading(false)
        setError('No interest specified')
        return
      }

      console.log('Fetching interest data for:', interestName)
      setLoading(true)
      try {
        // Fetch both interest and posts in parallel
        const [interestResult, postsResult] = await Promise.all([
          supabase
            .from('interests')
            .select('*')
            .eq('name', interestName)
            .single(),
          supabase
            .from('posts')
            .select('*')
            .contains('interest_names', [interestName])
        ])

        if (interestResult.error) {
          console.error('Error fetching interest:', interestResult.error)
          throw interestResult.error
        }
        if (postsResult.error) {
          console.error('Error fetching posts:', postsResult.error)
          throw postsResult.error
        }

        if (isMounted) {
          console.log('Interest data fetched:', interestResult.data, 'Posts:', postsResult.data?.length || 0)
          setInterestData(interestResult.data)
          setPosts(postsResult.data || [])
          setError(null)
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to fetch interest data')
          console.error('Error fetching interest data:', error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [interestName])

  useEffect(() => {
    if (!interestsLoading) {
      const foundInterest = interests.find(i => i.name === interestName)
      
      // If interest doesn't exist or is inactive (and user is not the owner), redirect to home
      if (!foundInterest || (!foundInterest.is_active && (!user || user.email !== profile?.email))) {
        navigate(`/${profile?.username || ''}`)
        return
      }
      
      setInterestData(foundInterest)
      setLoading(false)
    }
  }, [interestName, interests, interestsLoading, user, profile, navigate])

  if (loading || interestsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!interestData) {
    return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Interest not found
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      {!interestData.is_active && (
        <Box sx={{ 
          bgcolor: 'warning.main', 
          color: 'warning.contrastText', 
          p: 2, 
          mb: 2,
          borderRadius: 1
        }}>
          <Typography>
            This interest is currently inactive and is only visible to you as the owner.
          </Typography>
        </Box>
      )}
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