import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import MarkdownEditor from '../components/MarkdownEditor'
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
    content: ''
  })

  const defaultInterests = [
    {
      name: 'coder',
      title: 'Coder',
      description: 'Exploring the world of programming and software development',
      image_path: '/images/coder.jpg',
      route_path: '/coder'
    },
    {
      name: 'golfer',
      title: 'Golfer',
      description: 'Sharing golf experiences, tips, and achievements',
      image_path: '/images/golfer.jpg',
      route_path: '/golfer'
    },
    {
      name: 'mentor',
      title: 'Mentor',
      description: 'Guiding and supporting others in their journey',
      image_path: '/images/mentor.jpg',
      route_path: '/mentor'
    },
    {
      name: 'older',
      title: 'Older',
      description: 'Insights and reflections on the aging process',
      image_path: '/images/older.jpg',
      route_path: '/older'
    }
  ]

  useEffect(() => {
    if (!user || user.email !== 'golfergeek@gmail.com') {
      navigate('/')
      return
    }
    
    // Update interests with correct image paths
    const updateInterestPaths = async () => {
      try {
        for (const defaultInterest of defaultInterests) {
          const { error } = await supabase
            .from('interests')
            .update({ 
              image_path: defaultInterest.image_path
            })
            .eq('name', defaultInterest.name)
        
          if (error) {
            console.error('Error updating interest:', error)
          }
        }
        console.log('Interest paths updated')
      } catch (error) {
        console.error('Error in updateInterestPaths:', error)
      }
    }
    
    updateInterestPaths()
    fetchInterests()
  }, [user, navigate])

  const fetchInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
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
        image_path: interest.image_path,
        content: interest.content || ''
      })
    } else {
      setEditingInterest(null)
      setFormData({
        title: '',
        description: '',
        image_path: '',
        content: ''
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
      content: ''
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

  const handleSubmit = async () => {
    try {
      const submissionData = {
        ...formData,
        description: formData.description,
        user_id: user?.id || null // Add user_id to submission
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
    if (window.confirm('Are you sure you want to delete this interest?')) {
      try {
        const { error } = await supabase
          .from('interests')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchInterests()
      } catch (error) {
        console.error('Error deleting interest:', error)
      }
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Manage Interests
        </Typography>
        <Button
          variant="contained"
          color="primary"
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
              <TableCell>Content Preview</TableCell>
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
                  {interest.content ? (
                    <Typography noWrap sx={{ maxWidth: 200 }}>
                      {interest.content.substring(0, 100)}
                      {interest.content.length > 100 ? '...' : ''}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No content
                    </Typography>
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
              <TextField
                name="image_path"
                label="Image Path"
                value={formData.image_path}
                onChange={handleChange}
                fullWidth
                margin="normal"
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
