import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Button, 
  Box, 
  ImageList, 
  ImageListItem, 
  IconButton, 
  Typography,
  CircularProgress,
  Tooltip,
  Snackbar
} from '@mui/material'
import { Delete as DeleteIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material'

function ImageUpload({ onUpload, onRemove, existingImages = [] }) {
  const [uploading, setUploading] = useState(false)
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  async function handleUpload(event) {
    try {
      setUploading(true)

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `post-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath)

      if (data?.publicUrl) {
        onUpload([data.publicUrl])
      }
    } catch (error) {
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleCopyMarkdown = (imageUrl) => {
    const markdownSyntax = `![image](${imageUrl})`
    navigator.clipboard.writeText(markdownSyntax)
    setShowCopySuccess(true)
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          component="label"
          disabled={uploading}
        >
          {uploading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>Uploading...</span>
            </Box>
          ) : (
            'Upload Image'
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            hidden
          />
        </Button>
      </Box>

      {existingImages?.length > 0 && (
        <ImageList sx={{ width: '100%', maxHeight: 400 }} cols={3} rowHeight={200}>
          {existingImages.map((imageUrl, index) => (
            <ImageListItem key={imageUrl} sx={{ position: 'relative' }}>
              <Box
                sx={{
                  position: 'relative',
                  height: '100%',
                  '&:hover .image-actions': {
                    opacity: 1,
                  },
                }}
              >
                <img
                  src={imageUrl}
                  alt={`Post image ${index + 1}`}
                  loading="lazy"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Box
                  className="image-actions"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    padding: 1,
                    display: 'flex',
                    gap: 1,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: '0 0 0 8px',
                  }}
                >
                  <Tooltip title="Copy Markdown">
                    <IconButton
                      size="small"
                      onClick={() => handleCopyMarkdown(imageUrl)}
                      sx={{
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                        },
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Image">
                    <IconButton
                      size="small"
                      onClick={() => onRemove(imageUrl)}
                      sx={{
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {existingImages?.length === 0 && (
        <Typography color="text.secondary">
          No images uploaded yet
        </Typography>
      )}

      <Snackbar
        open={showCopySuccess}
        autoHideDuration={2000}
        onClose={() => setShowCopySuccess(false)}
        message="Markdown copied to clipboard!"
      />
    </Box>
  )
}

export default ImageUpload