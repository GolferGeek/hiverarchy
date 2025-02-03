import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterests } from '../contexts/InterestContext'
import { useProfile } from '../contexts/ProfileContext'
import { useAuth } from '../contexts/AuthContext'
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Input,
  ImageList,
  ImageListItem,
  Tab,
  Tabs,
  Divider
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { supabase } from '../lib/supabase'

function Home() {
  const navigate = useNavigate()
  const { interests, loading: interestsLoading } = useInterests()
  const { blogProfile, loading: profileLoading, currentUsername, getFullLogoUrl, setBlogProfile } = useProfile()
  const { user } = useAuth()
  const [openLogoDialog, setOpenLogoDialog] = useState(false)
  const [openTaglineDialog, setOpenTaglineDialog] = useState(false)
  const [newTagline, setNewTagline] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [availableImages, setAvailableImages] = useState([])
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [logoDialogTab, setLogoDialogTab] = useState(0)

  const getImagePath = (interest) => {
    try {
      return interest.image_path || '/images/default.jpg'
    } catch (error) {
      return '/images/default.jpg'
    }
  }

  const handleInterestClick = (interest) => {
    navigate(`/${currentUsername}/interest/${interest.name}`)
  }

  const handleLogoEdit = async () => {
    setOpenLogoDialog(true)
    await loadAvailableImages()
  }

  const handleTaglineEdit = () => {
    setNewTagline(blogProfile?.tagline || '')
    setOpenTaglineDialog(true)
  }

  const loadAvailableImages = async () => {
    setIsLoadingImages(true)
    try {
      const { data, error } = await supabase.storage
        .from('profile_logos')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) throw error

      // Filter out system files and only include image files
      const imageFiles = data?.filter(file => {
        const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        const isNotSystemFile = !file.name.startsWith('.')
        return isImage && isNotSystemFile
      }) || []

      console.log('Filtered images:', imageFiles)
      setAvailableImages(imageFiles)
    } catch (error) {
      console.error('Error loading images:', error)
      alert('Error loading images. Please try again.')
    } finally {
      setIsLoadingImages(false)
    }
  }

  const handleImageSelect = async (fileName) => {
    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ logo: fileName })
        .eq('email', user.email)
        .select()
        .single()

      if (updateError) throw updateError

      setBlogProfile(data)
      setOpenLogoDialog(false)
    } catch (error) {
      console.error('Error updating logo:', error)
      alert('Error updating logo. Please try again.')
    }
  }

  const handleLogoUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${currentUsername}-logo-${Date.now()}.${fileExt}`
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profile_logos')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Update profile with the new logo filename
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ logo: fileName })
        .eq('email', user.email)
        .select()
        .single()

      if (updateError) throw updateError

      setBlogProfile(data)
      await loadAvailableImages() // Refresh the image list
      setLogoDialogTab(0) // Switch back to the gallery tab
      setSelectedFile(null)
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Error updating logo. Please try again.')
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
    }
  }

  const handleTaglineUpdate = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ tagline: newTagline })
        .eq('email', user.email)
        .select()
        .single()

      if (error) throw error

      setBlogProfile(data)
      setOpenTaglineDialog(false)
    } catch (error) {
      console.error('Error updating tagline:', error)
      alert('Error updating tagline. Please try again.')
    }
  }

  if (interestsLoading || profileLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  // Sort interests by sequence
  const sortedInterests = [...(interests || [])]
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))

  const canEdit = user && blogProfile && user.email === blogProfile.email
  
  console.log('Edit permissions:', {
    userExists: !!user,
    userEmail: user?.email,
    blogProfileExists: !!blogProfile,
    blogProfileEmail: blogProfile?.email,
    canEdit
  })

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          py: 8,
          mt: 4,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 4,
            flexDirection: { xs: 'column', md: 'row' }
          }}>
            <Box sx={{ 
              width: { xs: '200px', md: '300px' },
              height: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: 0,
                borderRadius: 2,
                boxShadow: 3
              }
            }}>
              <img 
                src={getFullLogoUrl(blogProfile?.logo)}
                alt={blogProfile?.site_name || 'Site Logo'}
                onError={(e) => {
                  console.log('Logo load error, using default')
                  e.target.src = '/images/gg-logo.jpg'
                }}
              />
              {canEdit && (
                <IconButton
                  onClick={handleLogoEdit}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: 2,
                    '&:hover': {
                      backgroundColor: 'background.paper'
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            <Box sx={{ 
              textAlign: { xs: 'center', md: 'left' },
              flex: 1,
              position: 'relative'
            }}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                {blogProfile?.site_name || 'Welcome'}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  gutterBottom
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 'medium',
                    lineHeight: 1.4
                  }}
                >
                  {blogProfile?.tagline || 'Exploring ideas and sharing experiences'}
                </Typography>
                {canEdit && (
                  <IconButton 
                    onClick={handleTaglineEdit} 
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: 1,
                      ml: 1,
                      '&:hover': {
                        backgroundColor: 'background.paper'
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Logo Edit Dialog */}
      <Dialog 
        open={openLogoDialog} 
        onClose={() => setOpenLogoDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Change Logo</DialogTitle>
        <Tabs
          value={logoDialogTab}
          onChange={(e, newValue) => setLogoDialogTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Image Gallery" />
          <Tab label="Upload New" />
        </Tabs>
        <DialogContent>
          {logoDialogTab === 0 ? (
            isLoadingImages ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ImageList cols={3} gap={8}>
                {availableImages.map((image) => (
                  <ImageListItem 
                    key={image.name}
                    sx={{ 
                      cursor: 'pointer',
                      border: blogProfile?.logo === image.name ? '2px solid primary.main' : 'none',
                      borderRadius: 1,
                      overflow: 'hidden',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                    onClick={() => handleImageSelect(image.name)}
                  >
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profile_logos/${image.name}`}
                      alt={`Logo option ${image.name}`}
                      loading="lazy"
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )
          ) : (
            <Box sx={{ pt: 2 }}>
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept="image/*"
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoDialog(false)}>Cancel</Button>
          {logoDialogTab === 1 && (
            <Button 
              onClick={handleLogoUpload} 
              disabled={!selectedFile || isUploading}
              variant="contained"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Tagline Edit Dialog */}
      <Dialog open={openTaglineDialog} onClose={() => setOpenTaglineDialog(false)}>
        <DialogTitle>Edit Tagline</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tagline"
            fullWidth
            variant="outlined"
            value={newTagline}
            onChange={(e) => setNewTagline(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaglineDialog(false)}>Cancel</Button>
          <Button onClick={handleTaglineUpdate} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Interests Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        {sortedInterests.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No interests found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Check back later for updates!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sortedInterests.map((interest, index) => (
              <Card 
                key={interest.id}
                sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' },
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={() => handleInterestClick(interest)}
              >
                <CardMedia
                  component="img"
                  sx={{ 
                    width: { xs: '100%', md: '40%' },
                    height: { xs: 200, md: 300 },
                    objectFit: 'cover'
                  }}
                  image={getImagePath(interest)}
                  alt={interest.title}
                />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    width: { xs: '100%', md: '60%' },
                    p: 4,
                  }}
                >
                  <Typography variant="h4" component="h2" gutterBottom>
                    {interest.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {interest.description}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default Home