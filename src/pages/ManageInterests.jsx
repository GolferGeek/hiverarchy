import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import MDEditor from '@uiw/react-md-editor'
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Grid,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

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
    route_path: '',
    content: ''
  })

  const defaultInterests = [
    {
      title: 'Coder',
      description: 'Exploring the world of programming and software development',
      image_path: '/images/coder.jpg',
      route_path: '/coder'
    },
    {
      title: 'Golfer',
      description: 'Sharing golf experiences, tips, and achievements',
      image_path: '/images/golfer.jpg',
      route_path: '/golfer'
    },
    {
      title: 'Mentor',
      description: 'Guiding and supporting others in their journey',
      image_path: '/images/mentor.jpg',
      route_path: '/mentor'
    },
    {
      title: 'Aging',
      description: 'Insights and reflections on the aging process',
      image_path: '/images/aging.jpg',
      route_path: '/aging'
    }
  ]

  useEffect(() => {
    if (!user) {
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
              image_path: defaultInterest.image_path,
              description: defaultInterest.description 
            })
            .eq('title', defaultInterest.title)
          
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
        route_path: interest.route_path,
        content: interest.content || ''
      })
    } else {
      setEditingInterest(null)
      setFormData({
        title: '',
        description: '',
        image_path: '',
        route_path: '',
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
      route_path: '',
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
        description: formData.description
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
          startIcon={<AddIcon />}
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
              <TableCell>Route Path</TableCell>
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
                <TableCell>{interest.route_path}</TableCell>
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
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(interest.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingInterest ? 'Edit Interest' : 'Add Interest'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="image_path"
                label="Image Path"
                value={formData.image_path}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="route_path"
                label="Route Path"
                value={formData.route_path}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Description (Markdown)
              </Typography>
              <Paper sx={{ p: 2 }}>
                <MDEditor
                  value={formData.description}
                  onChange={handleMarkdownChange('description')}
                  preview="edit"
                  height={200}
                />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Content (Markdown)
              </Typography>
              <Paper sx={{ p: 2 }}>
                <MDEditor
                  value={formData.content}
                  onChange={handleMarkdownChange('content')}
                  preview="edit"
                  height={400}
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingInterest ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ManageInterests
