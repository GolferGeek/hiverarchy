import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  Box,
  Button,
  CircularProgress,
  ImageList,
  ImageListItem,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'

const BUCKET_CONFIGS = {
  'post-images': {
    maxSize: 5242880, // 5MB
    allowedTypes: ['image/*'],
    maxDimensions: { width: 2000, height: 2000 }
  },
  'interest-images': {
    maxSize: 5242880, // 5MB
    allowedTypes: ['image/*'],
    maxDimensions: { width: 2000, height: 2000 }
  },
  'profile_logos': {
    maxSize: 1048576, // 1MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxDimensions: { width: 500, height: 500 }
  }
}

// Helper function to resize image
const resizeImage = (file, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      
      let width = img.width
      let height = img.height
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      } else {
        // If image is smaller than max dimensions, return original file
        resolve(file)
        return
      }
      
      // Create canvas and resize image
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to resize image'))
          return
        }
        // Create new file from blob
        const resizedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now()
        })
        resolve(resizedFile)
      }, file.type)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }
  })
}

function ImageUpload({ 
  onUpload, 
  onRemove, 
  existingImages = [], 
  bucket = 'post-images',
  folder = null,
  showCopyOption = true
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const bucketConfig = BUCKET_CONFIGS[bucket]
  const [bucketReady, setBucketReady] = useState(false)

  // Create bucket if it doesn't exist
  const createBucketIfNeeded = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets.some(b => b.name === bucket)
      
      if (!bucketExists) {
        try {
          const { error } = await supabase.storage.createBucket(bucket, {
            public: true,
            allowedMimeTypes: bucketConfig.allowedTypes,
            fileSizeLimit: bucketConfig.maxSize
          })
          
          if (error) {
            console.error('Error creating bucket:', error)
            const { data: checkBuckets } = await supabase.storage.listBuckets()
            return checkBuckets.some(b => b.name === bucket)
          }
        } catch (error) {
          console.error('Error creating bucket:', error)
          const { data: checkBuckets } = await supabase.storage.listBuckets()
          return checkBuckets.some(b => b.name === bucket)
        }
      }
      return true
    } catch (error) {
      console.error('Error checking/creating bucket:', error)
      return false
    }
  }

  useEffect(() => {
    const initBucket = async () => {
      const ready = await createBucketIfNeeded()
      setBucketReady(ready)
    }
    initBucket()
  }, [bucket])

  const validateImage = async (file) => {
    if (!bucketConfig) {
      throw new Error('Invalid bucket configuration')
    }

    // Check file type
    if (!bucketConfig.allowedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/')
      return type === file.type
    })) {
      throw new Error('Invalid file type')
    }

    // Check file size
    if (file.size > bucketConfig.maxSize) {
      throw new Error(`File size must be less than ${bucketConfig.maxSize / 1048576}MB`)
    }

    return true
  }

  async function handleUpload(event) {
    try {
      if (!bucketReady) {
        const ready = await createBucketIfNeeded()
        if (!ready) {
          throw new Error('Unable to initialize storage bucket')
        }
      }

      setError(null)
      setUploading(true)

      const file = event.target.files[0]
      if (!file) return

      // Validate file type and size
      await validateImage(file)

      // Resize image if needed
      const resizedFile = await resizeImage(
        file,
        bucketConfig.maxDimensions.width,
        bucketConfig.maxDimensions.height
      )

      const fileExt = resizedFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, resizedFile)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      if (data?.publicUrl) {
        onUpload([data.publicUrl])
      }
    } catch (error) {
      setError(error.message)
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleCopyMarkdown = (imageUrl) => {
    const markdownSyntax = `![image](${imageUrl})`
    navigator.clipboard.writeText(markdownSyntax)
  }

  if (!bucketConfig) {
    return <Typography color="error">Invalid bucket configuration</Typography>
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          component="label"
          disabled={uploading || !bucketReady}
        >
          {uploading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>Uploading...</span>
            </Box>
          ) : !bucketReady ? (
            'Initializing...'
          ) : (
            'Upload Image'
          )}
          <input
            type="file"
            accept={bucketConfig.allowedTypes.join(',')}
            onChange={handleUpload}
            hidden
          />
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          Max dimensions: {bucketConfig.maxDimensions.width}x{bucketConfig.maxDimensions.height}px
          {' | '}Max size: {bucketConfig.maxSize / 1048576}MB
        </Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

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
                  alt={`Image ${index + 1}`}
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
                  {showCopyOption && (
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
                  )}
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
    </Box>
  )
}

export default ImageUpload