import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ConfirmModal from './ConfirmModal'
import { Paper, Typography, Button, Box, Chip, Stack } from '@mui/material'

function PostCard({ post, onDelete }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [firstImage, setFirstImage] = useState(null)
  const isAuthor = user && user.id === post.user_id

  const extractFirstImageFromContent = (content) => {
    if (!content) return null
    const imageRegex = /!\[.*?\]\((.*?)\)/
    const match = content.match(imageRegex)
    return match ? match[1] : null
  }

  useEffect(() => {
    const contentImage = extractFirstImageFromContent(post.content)
    if (contentImage) {
      setFirstImage(contentImage)
    }
  }, [post.content])

  async function handleDelete() {
    try {
      const { error: imageError } = await supabase
        .from('images')
        .delete()
        .eq('post_id', post.id)

      if (imageError) throw imageError

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
      alert('Error deleting post. Please try again.')
    }
  }

  const getDefaultImage = () => {
    const category = post.interests?.[0]?.toLowerCase()
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
        return '/images/coder.jpg'
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
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Thumbnail */}
          <Box
            component="img"
            src={firstImage || getDefaultImage()}
            alt={post.title}
            sx={{
              width: 150,
              height: 150,
              objectFit: 'cover',
              borderRadius: 1,
              flexShrink: 0
            }}
          />

          {/* Content */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ mb: 1 }}>
              <Typography 
                variant="h6" 
                component={Link} 
                to={`/post/${post.id}`}
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
                <Stack direction="row" spacing={1}>
                  {post.interests.map(interest => (
                    <Chip
                      key={interest}
                      label={interest}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(post.created_at), 'MMMM d, yyyy')}
                </Typography>
              </Box>
            </Box>

            {/* Tags */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2, flexWrap: 'wrap', gap: 1 }}>
                {post.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ 
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'white'
                      }
                    }}
                  />
                ))}
              </Stack>
            )}

            {/* Excerpt */}
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {post.excerpt || 'No excerpt available'}
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
                to={`/post/${post.id}`}
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
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </>
  )
}

export default PostCard