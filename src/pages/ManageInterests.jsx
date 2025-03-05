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
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

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
    name: '',
    sequence: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, interest: null, action: '' })

  useEffect(() => {
    // Check if user is authenticated
    if (user) {
      setupStorage()
      fetchInterests()
    } else {
      // Redirect to login if not authenticated
      navigate('/')
    }
  }, [user])

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

  const fetchInterests = async () => {
    try {
      setLoading(true)
      setError(null)

      // Query interests that belong to the current user
      let { data, error } = await supabase
        .from('interests')
        .select('*')
        .eq('user_id', user.id)
        .order('sequence', { ascending: true })
        .order('title')

      if (error) throw error
      console.log('Fetched interests:', data)
      setInterests(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching interests:', error)
      setError('Failed to fetch interests')
      setLoading(false)
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
        name: interest.name || '',
        sequence: interest.sequence || 0
      })
    } else {
      setEditingInterest(null)
      setFormData({
        title: '',
        description: '',
        image_path: '',
        content: '',
        name: '',
        sequence: 0
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
      name: '',
      sequence: 0
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
      // First, make a select query to refresh the schema cache
      await supabase
        .from('interests')
        .select('id')
        .limit(1)

      // Only include fields that exist in the database schema
      const submissionData = {
        id: editingInterest ? editingInterest.id : crypto.randomUUID(),
        title: formData.title,
        description: formData.description,
        image_path: formData.image_path || '/images/default.jpg',
        name: formData.name || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sequence: formData.sequence || 0,
        content: formData.content || '',
        user_id: user.id,
        is_active: editingInterest ? editingInterest.is_active : true // Keep existing state or default to true for new
      }

      if (editingInterest) {
        const { error } = await supabase
          .from('interests')
          .update(submissionData)
          .eq('id', editingInterest.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('interests')
          .insert([submissionData])

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
            user_id: user.id
          }])

        if (error) throw error
      } catch (error) {
        console.error('Error creating interest:', error)
      }
    }

    fetchInterests()
  }

  const handleToggleActive = async (interest) => {
    try {
      const newActiveState = !interest.is_active
      console.log('Toggling interest:', interest.title, 'to:', newActiveState)
      
      const { error } = await supabase
        .from('interests')
        .update({ is_active: newActiveState })
        .eq('id', interest.id)

      if (error) throw error

      console.log('Successfully updated interest active state')
      
      // Update local state
      setInterests(interests.map(i => 
        i.id === interest.id ? { ...i, is_active: newActiveState } : i
      ))
    } catch (error) {
      console.error('Error toggling interest active state:', error)
      alert('Failed to update interest status')
    }
  }

  const handleConfirmToggle = (interest) => {
    if (interest.is_active) {
      // If deactivating, show confirmation dialog
      setConfirmDialog({
        open: true,
        interest,
        action: 'deactivate',
        title: 'Deactivate Interest?',
        message: 'This interest will be hidden from navigation and the home page. Users will not be able to access it. Continue?'
      })
    } else {
      // If activating, no need for confirmation
      handleToggleActive(interest)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {!user ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1" paragraph>
            You need to be logged in to manage your interests.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Manage Interests
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              onClick={() => handleOpen()}
            >
              Add Interest
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {interests.map((interest) => (
                  <TableRow key={interest.id}>
                    <TableCell>{interest.title}</TableCell>
                    <TableCell>{interest.description}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tooltip title={interest.is_active ? 'Active' : 'Inactive'}>
                          <IconButton size="small" sx={{ mr: 1 }}>
                            {interest.is_active ? 
                              <VisibilityIcon color="primary" /> : 
                              <VisibilityOffIcon color="action" />
                            }
                          </IconButton>
                        </Tooltip>
                        <Switch
                          checked={interest.is_active}
                          onChange={() => handleConfirmToggle(interest)}
                          color="primary"
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleOpen(interest)}>
                        <EditOutlinedIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(interest.id)}>
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
                <Grid item xs={12}>
                  <TextField
                    name="sequence"
                    label="Sequence"
                    type="number"
                    value={formData.sequence}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">
                {editingInterest ? 'Save Changes' : 'Create Interest'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          >
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogContent>
              <Typography>{confirmDialog.message}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleToggleActive(confirmDialog.interest)
                  setConfirmDialog({ ...confirmDialog, open: false })
                }}
                color="primary"
                variant="contained"
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  )
}

export default ManageInterests
