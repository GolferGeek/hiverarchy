import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ConfirmModal from './ConfirmModal'
import { Paper, Typography, Button, Box, Chip, Stack, Alert } from '@mui/material'
import { useProfile } from '../contexts/ProfileContext'
import { shouldShowUsernameInUrl } from '../utils/urlUtils'
import { useIsMobile } from '../utils/responsive'

export default function PostCard({ post, onDelete, showInterest = true }) {
  const { user } = useAuth()
  const { currentUsername } = useProfile()
  const navigate = useNavigate()
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [firstImage, setFirstImage] = useState(null)
  const [error, setError] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const isAuthor = user?.id === defaultUserId
  const isMobile = useIsMobile()

  const extractFirstImageFromContent = (content) => {
    if (!content) return null
    const imageRegex = /!\[.*?\]\((.*?)\)/
    const match = content.match(imageRegex)
    return match ? match[1] : null
  }

  useEffect(() => {
    // Try to get image from post content
    if (post.content) {
      const contentImage = extractFirstImageFromContent(post.content)
      if (contentImage) {
        setFirstImage(contentImage)
      }
    }
    
    // Set image URL from post images or content
    try {
      const postImageUrl = post.images?.[0]?.url;
      if (postImageUrl) {
        try {
          const parsedUrls = JSON.parse(postImageUrl);
          if (parsedUrls && parsedUrls[0]) {
            setImageUrl(parsedUrls[0]);
          } else if (firstImage) {
            setImageUrl(firstImage);
          } else {
            setImageUrl(null);
          }
        } catch (e) {
          // If parsing fails, check for firstImage from content
          if (firstImage) {
            setImageUrl(firstImage);
          } else {
            setImageUrl(null);
          }
        }
      } else if (firstImage) {
        setImageUrl(firstImage);
      } else {
        setImageUrl(null);
      }
    } catch (error) {
      console.error('Error setting image URL:', error);
      setImageUrl(null);
    }
  }, [post.content, post.images, firstImage]);

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
        return null
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
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2
        }}>
          {/* Thumbnail - Only show if we have an image */}
          {imageUrl && (
            <Box
              component="img"
              src={imageUrl}
              alt={post.title}
              sx={{
                width: isMobile ? '100%' : 150,
                height: isMobile ? 180 : 150,
                objectFit: 'cover',
                borderRadius: 1,
                flexShrink: 0
              }}
              onError={(e) => {
                // If the image fails to load, try using the default image
                const defaultImg = getDefaultImage();
                if (defaultImg && e.target.src !== defaultImg) {
                  e.target.src = defaultImg;
                } else {
                  // If there's no default image or it also failed, hide the image element
                  e.target.style.display = 'none';
                }
              }}
            />
          )}

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
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 1 : 2,
                alignItems: isMobile ? 'flex-start' : 'center', 
                mt: 0.5 
              }}>
                {showInterest && post.interest_names && (
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    sx={{ 
                      flexWrap: 'wrap', 
                      gap: 0.5 
                    }}
                  >
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
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  mt: 1, 
                  mb: 2, 
                  flexWrap: 'wrap', 
                  gap: 1 
                }}
              >
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
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 1,
                // Trim text with ellipsis after 3 lines on mobile
                ...(isMobile && {
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                })
              }}
            >
              {post.brief_description || 'No brief description available'}
            </Typography>

            {/* Actions */}
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                mt: 'auto',
                pt: 2,
                gap: isMobile ? 1 : 0
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="small"
                component={Link}
                to={`/${currentUsername}/post/${post.id}`}
                sx={{ 
                  textTransform: 'none',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                Read More
              </Button>
              
              {isAuthor && (
                <Stack 
                  direction={isMobile ? 'row' : 'row'} 
                  spacing={1}
                  sx={{ 
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'space-between' : 'flex-end',
                    mt: isMobile ? 1 : 0
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    component={Link}
                    to={`/${currentUsername}/edit/${post.id}`}
                    sx={{ 
                      textTransform: 'none',
                      flex: isMobile ? 1 : 'inherit'
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => setShowDeleteModal(true)}
                    sx={{ 
                      textTransform: 'none',
                      flex: isMobile ? 1 : 'inherit'
                    }}
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
        title="Delete Post"
        content="Are you sure you want to delete this post? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  )
}