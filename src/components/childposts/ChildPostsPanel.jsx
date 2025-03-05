import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Snackbar,
  Alert
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

export default function ChildPostsPanel({ data, onUpdate }) {
  const [childPosts, setChildPosts] = useState(data?.ideas?.childPosts || [])
  const [newPost, setNewPost] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState(false)

  // Update posts when data changes
  useEffect(() => {
    if (data?.ideas) {
      setChildPosts(data.ideas.childPosts || [])
    }
  }, [data?.ideas])

  const handleSave = async () => {
    try {
      await onUpdate({
        ideas: {
          ...data?.ideas,
          childPosts
        }
      })
      setSaveMessage('Changes saved')
      setSaveError(false)
    } catch (error) {
      console.error('Error saving:', error)
      setSaveMessage('Error saving changes')
      setSaveError(true)
    }
  }

  const handleDelete = (index) => {
    setChildPosts(prev => {
      const newPosts = prev.filter((_, i) => i !== index)
      return newPosts
    })
    handleSave()
  }

  const handleAdd = () => {
    if (newPost.trim()) {
      setChildPosts(prev => {
        const newPosts = [newPost.trim(), ...prev]
        return newPosts
      })
      setNewPost('')
      setIsAdding(false)
      handleSave()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Child Posts
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Add posts that should be created as children of this post.
        </Typography>

        {/* Add new post section */}
        {isAdding ? (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter post title"
              autoFocus
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={!newPost.trim()}
              >
                Add
              </Button>
              <Button onClick={() => {
                setIsAdding(false)
                setNewPost('')
              }}>
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Button
            startIcon={<AddIcon />}
            onClick={() => setIsAdding(true)}
            sx={{ mb: 2 }}
          >
            Add Child Post
          </Button>
        )}

        {/* List of child posts */}
        <List>
          {childPosts.map((post, index) => (
            <ListItem key={index} divider={index < childPosts.length - 1}>
              <ListItemText primary={post} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDelete(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {childPosts.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No child posts added yet
            </Typography>
          )}
        </List>
      </Paper>

      {/* Save notification */}
      <Snackbar
        open={!!saveMessage}
        autoHideDuration={3000}
        onClose={() => setSaveMessage('')}
      >
        <Alert
          onClose={() => setSaveMessage('')}
          severity={saveError ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {saveMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
} 