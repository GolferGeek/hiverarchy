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
  const [images, setImages] = useState([])
  const isAuthor = user && user.id === post.user_id

  useEffect(() => {
    fetchImages()
  }, [post.id])

  async function fetchImages() {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('url')
        .eq('post_id', post.id)

      if (error) throw error
      setImages(data.map(img => img.url))
    } catch (error) {
      console.error('Error fetching images:', error)
    }
  }

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
          {images.length > 0 ? (
            <Box
              component="img"
              src={images[0]}
              alt={post.title}
              sx={{
                width: 150,
                height: 150,
                objectFit: 'cover',
                borderRadius: 1,
                flexShrink: 0
              }}
            />
          ) : (
            <Box
              sx={{
                width: 150,
                height: 150,
                bgcolor: 'grey.200',
                borderRadius: 1,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No Image
              </Typography>
            </Box>
          )}

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
                  color: 'text.primary',
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

            {/* Excerpt */}
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {post.excerpt}
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