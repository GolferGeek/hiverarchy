import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ConfirmModal from './ConfirmModal'
import { Paper, Typography, Button, Box, Chip, Stack, Alert } from '@mui/material'
import { useProfile } from '../contexts/ProfileContext'
import { shouldShowUsernameInUrl } from '../utils/urlUtils'

export default function PostCard({ post, onDelete, showInterest = true }) {
  const { user } = useAuth()
  const { currentUsername } = useProfile()
  const navigate = useNavigate()
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [firstImage, setFirstImage] = useState(null)
  const [error, setError] = useState(null)
  const isAuthor = user?.id === defaultUserId

  const extractFirstImageFromContent = (content) => {
    if (!content) return null
    const imageRegex = /!\[.*?\]\((.*?)\)/
    const match = content.match(imageRegex)
    return match ? match[1] : null
  }

  useEffect(() => {
    if (post.content) {
      const contentImage = extractFirstImageFromContent(post.content)
      if (contentImage) {
        setFirstImage(contentImage)
      }
    }
  }, [post.content])

  async function handleDelete() {
    try {
      setError(null)
      const { error: imageError } = await supabase
        .from('images')
        .delete()
        .eq('post_id', post.id)

      if (imageError) {
        console.error('Error deleting images:', imageError)
      }

      const { error: postError } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)

      if (postError) throw postError
      
      if (onDelete) {
        onDelete(post.id)
      }
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting post:', error)
      setError('Failed to delete post. Please try again.')
    }
  }

  const getDefaultImage = () => {
    const category = post.interest_names?.[0]?.toLowerCase()
    switch(category) {
      case 'coder':
        return '/images/coder.jpg'
      case 'golfer':
        return '/images/golfer.jpg'
      case 'mentor':
        return '/images/mentor.jpg'
      case 'aging':
        return '/images/aging.jpg'
      default:
        return '/images/default.jpg'
    }
  }

  return (
    <>
      <Paper 
        elevation={3}
        sx={{
          p: 2,
          width: '100%',
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Thumbnail */}
          <Box
            component="img"
            src={(() => {
              const imageUrl = post.images?.[0]?.url;
              try {
                const parsedUrls = JSON.parse(imageUrl);
                return parsedUrls[0] || getDefaultImage();
              } catch (e) {
                return getDefaultImage();
              }
            })()}
            alt={post.title}
            sx={{
              width: 150,
              height: 150,
              objectFit: 'cover',
              borderRadius: 1,
              flexShrink: 0
            }}
            onError={(e) => {
              e.target.src = '/images/default.jpg'
            }}
          />

          {/* Content */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ mb: 1 }}>
              <Typography 
                variant="h6" 
                component={Link} 
                to={`/${currentUsername}/post/${post.id}`}
                sx={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                {post.title}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5 }}>
                {showInterest && post.interest_names && (
                  <Stack direction="row" spacing={1}>
                    {post.interest_names.map((interest, index) => (
                      <Chip
                        key={index}
                        label={interest}
                        size="small"
                        color="primary"
                        variant="outlined"
                        component={Link}
                        to={`/${interest}`}
                        clickable
                      />
                    ))}
                  </Stack>
                )}
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(post.created_at), 'MMMM d, yyyy')}
                </Typography>
              </Box>
            </Box>

            {/* Tags */}
            {Array.isArray(post.tag_names) && post.tag_names.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2, flexWrap: 'wrap', gap: 1 }}>
                {post.tag_names.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{ 
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: 'secondary.light',
                        color: 'white'
                      }
                    }}
                  />
                ))}
              </Stack>
            )}

            {/* Brief Description */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {post.brief_description || 'No brief description available'}
            </Typography>

            {/* Actions */}
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 'auto'
              }}
            >
              <Button
                component={Link}
                to={shouldShowUsernameInUrl() ? `/${currentUsername}/post/${post.id}` : `/post/${post.id}`}
                variant="contained"
                color="primary"
                size="small"
              >
                Read More
              </Button>
              
              {isAuthor && (
                <Stack direction="row" spacing={1}>
                  <Button
                    onClick={() => navigate(`/edit/${post.id}`)}
                    variant="outlined"
                    color="primary"
                    size="small"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Delete
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        content="Are you sure you want to delete this post? This action cannot be undone."
      />
    </>
  )
}