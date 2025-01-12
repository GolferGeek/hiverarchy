import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import MarkdownEditor from '../components/MarkdownEditor'
import ImageUpload from '../components/ImageUpload'
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Grid,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'

function ManageInterests() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [interests, setInterests] = useState([])
  const [open, setOpen] = useState(false)
  const [editingInterest, setEditingInterest] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_path: '',
    content: '',
    name: ''
  })

  useEffect(() => {
    if (!user || user.email !== 'golfergeek@gmail.com') {
      navigate('/')
      return
    }
    
    // Create interest-images bucket if it doesn't exist
    const setupStorage = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets()
        const bucketExists = buckets.some(bucket => bucket.name === 'interest-images')
        
        if (!bucketExists) {
          const { error } = await supabase.storage.createBucket('interest-images', {
            public: true,
            allowedMimeTypes: ['image/*'],
            fileSizeLimit: 5242880, // 5MB
          })
          
          if (error) {
            console.error('Error creating bucket:', error)
          }
        }
      } catch (error) {
        console.error('Error in setupStorage:', error)
      }
    }

    setupStorage()
    fetchInterests()
  }, [user, navigate])

  const fetchInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .eq('user_id', user.id)
        .order('title')

      if (error) throw error
      setInterests(data)
    } catch (error) {
      console.error('Error fetching interests:', error)
    }
  }

  const handleOpen = (interest = null) => {
    if (interest) {
      setEditingInterest(interest)
      setFormData({
        title: interest.title,
        description: typeof interest.description === 'object' 
          ? JSON.stringify(interest.description, null, 2)
          : interest.description || '',
        image_path: interest.image_path || '',
        content: interest.content || '',
        name: interest.name || ''
      })
    } else {
      setEditingInterest(null)
      setFormData({
        title: '',
        description: '',
        image_path: '',
        content: '',
        name: ''
      })
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingInterest(null)
    setFormData({
      title: '',
      description: '',
      image_path: '',
      content: '',
      name: ''
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMarkdownChange = (name) => (value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value || ''
    }))
  }

  const handleImageUpload = (uploadedImages) => {
    if (uploadedImages && uploadedImages.length > 0) {
      setFormData(prev => ({
        ...prev,
        image_path: uploadedImages[0]
      }))
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image_path: ''
    }))
  }

  const handleSubmit = async () => {
    try {
      const submissionData = {
        ...formData,
        description: formData.description,
        name: formData.name || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        user_id: user.id
      }

      if (editingInterest) {
        const { error } = await supabase
          .from('interests')
          .update(submissionData)
          .eq('id', editingInterest.id)

        if (error) throw error
      } else {
        // Generate a new UUID for the interest
        const newId = crypto.randomUUID()
        
        const { error } = await supabase
          .from('interests')
          .insert([{
            ...submissionData,
            id: newId,
            arcid: newId // Set arcid same as id for root interests
          }])

        if (error) throw error
      }

      handleClose()
      fetchInterests()
    } catch (error) {
      console.error('Error saving interest:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!user?.id) return

    try {
      const { data: existingInterest, error: fetchError } = await supabase
        .from('interests')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const { error: deleteError } = await supabase
        .from('interests')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setInterests(interests.filter(interest => interest.id !== id))
    } catch (error) {
      setError('Failed to delete interest')
    }
  }

  const createInitialInterests = async () => {
    const initialInterests = [
      {
        title: 'Coding Journey',
        description: JSON.stringify({
          sections: [
            { title: 'Near the metal', items: ['Assembler', 'C++'] },
            { title: 'Business Developer', items: ['Power Builder', 'VB', 'C#', '.NET', 'SS(RAI)S', 'Angular'] },
            { title: 'Semi-Retirement', items: ['React', 'AI', 'Mentoring'] }
          ]
        }),
        image_path: '/images/default.jpg',
        name: 'coding',
        sequence: 1,
        content: '# Coding Journey\n\nFrom assembly language to modern web development, my journey in software development spans decades of technological evolution.'
      },
      {
        title: 'Golf Adventures',
        description: JSON.stringify({
          text: 'Sharing golf experiences, tips, and achievements'
        }),
        image_path: '/images/default.jpg',
        name: 'golf',
        sequence: 2,
        content: '# Golf Adventures\n\nExploring the game of golf, sharing experiences, and documenting the journey of improvement.'
      },
      {
        title: 'Mentorship',
        description: JSON.stringify({
          text: 'Guiding and supporting others in their journey'
        }),
        image_path: '/images/default.jpg',
        name: 'mentoring',
        sequence: 3,
        content: '# Mentorship\n\nSharing knowledge and experience to help others grow in their careers and personal development.'
      },
      {
        title: "Life's Journey",
        description: JSON.stringify({
          text: 'Insights and reflections on the aging process'
        }),
        image_path: '/images/default.jpg',
        name: 'aging',
        sequence: 4,
        content: "# Life's Journey\n\nReflections on aging, personal growth, and the continuous process of learning and adaptation."
      }
    ]

    for (const interest of initialInterests) {
      try {
        const newId = crypto.randomUUID()
        const { error } = await supabase
          .from('interests')
          .insert([{
            ...interest,
            id: newId,
            arcid: newId, // Set arcid same as id for root interests
            user_id: user.id
          }])

        if (error) throw error
      } catch (error) {
        console.error('Error creating interest:', error)
      }
    }

    fetchInterests()
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Manage Interests
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={createInitialInterests}
          >
            Create Initial Interests
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            onClick={() => handleOpen()}
          >
            Add Interest
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {interests.map((interest) => (
              <TableRow key={interest.id}>
                <TableCell>{interest.title}</TableCell>
                <TableCell>
                  <Typography noWrap sx={{ maxWidth: 200 }}>
                    {typeof interest.description === 'object' 
                      ? JSON.stringify(interest.description).substring(0, 100)
                      : (interest.description || '').substring(0, 100)}
                    {(typeof interest.description === 'object' 
                      ? JSON.stringify(interest.description).length > 100
                      : (interest.description || '').length > 100) ? '...' : ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  {interest.image_path && (
                    <Box
                      component="img"
                      src={interest.image_path}
                      alt={interest.title}
                      sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(interest)} color="primary">
                    <EditOutlinedIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(interest.id)} color="error">
                    <DeleteOutlineOutlinedIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingInterest ? 'Edit Interest' : 'Add Interest'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="URL Name (optional)"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                helperText="Leave blank to auto-generate from title"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Interest Image
              </Typography>
              <ImageUpload 
                onUpload={handleImageUpload}
                onRemove={handleRemoveImage}
                existingImages={formData.image_path ? [formData.image_path] : []}
                bucket="interest-images"
                folder="interest-images"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Content
              </Typography>
              <MarkdownEditor
                value={formData.content}
                onChange={handleMarkdownChange('content')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ManageInterests
