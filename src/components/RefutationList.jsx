import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Refutation from './Refutation'
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'

function RefutationList({ postId, onCountChange }) {
  const { user } = useAuth()
  const [refutations, setRefutations] = useState([])
  const [newRefutation, setNewRefutation] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRefutations()
  }, [postId])

  useEffect(() => {
    if (onCountChange) {
      onCountChange(refutations.length)
    }
  }, [refutations.length, onCountChange])

  const fetchRefutations = async () => {
    try {
      const { data, error } = await supabase
        .from('refutations')
        .select(`
          *,
          profile:profiles (
            id,
            username,
            email
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Organize refutations into a tree structure
      const refutationMap = new Map()
      const rootRefutations = []

      data.forEach(refutation => {
        refutation.user_email = refutation.profile?.email
        refutation.username = refutation.profile?.username
        refutation.replies = []
        refutationMap.set(refutation.id, refutation)
      })

      data.forEach(refutation => {
        if (refutation.parent_id) {
          const parent = refutationMap.get(refutation.parent_id)
          if (parent) {
            parent.replies.push(refutation)
          }
        } else {
          rootRefutations.push(refutation)
        }
      })

      setRefutations(rootRefutations || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching refutations:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleSubmit(e, parentId = null) {
    e.preventDefault()
    if (!user || !newRefutation.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('refutations')
        .insert([
          {
            content: newRefutation.trim(),
            post_id: postId,
            profile_id: user.id,
            parent_id: parentId
          }
        ])

      if (error) throw error

      setNewRefutation('')
      await fetchRefutations()
    } catch (error) {
      console.error('Error adding refutation:', error)
      setError('Failed to add refutation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(refutationId) {
    try {
      setError(null)
      const { error } = await supabase
        .from('refutations')
        .delete()
        .eq('id', refutationId)

      if (error) throw error

      await fetchRefutations()
    } catch (error) {
      console.error('Error deleting refutation:', error)
      setError('Failed to delete refutation. Please try again.')
    }
  }

  const handleReply = async (parentId, content) => {
    try {
      const { error } = await supabase
        .from('refutations')
        .insert([
          {
            content: content.trim(),
            post_id: postId,
            profile_id: user.id,
            parent_id: parentId
          }
        ])

      if (error) throw error

      await fetchRefutations()
    } catch (error) {
      console.error('Error adding reply:', error)
      setError('Failed to add reply. Please try again.')
    }
  }

  const renderRefutations = (refutationList, depth = 0) => {
    return refutationList.map(refutation => (
      <Box key={refutation.id}>
        <Refutation
          refutation={refutation}
          onDelete={handleDelete}
          onReply={handleReply}
          depth={depth}
        />
        {refutation.replies && refutation.replies.length > 0 && (
          renderRefutations(refutation.replies, depth + 1)
        )}
      </Box>
    ))
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {user ? (
        <Paper 
          component="form" 
          onSubmit={handleSubmit}
          elevation={1}
          sx={{ 
            p: 3,
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <TextField
            multiline
            rows={3}
            value={newRefutation}
            onChange={(e) => setNewRefutation(e.target.value)}
            placeholder="Write a refutation..."
            variant="outlined"
            fullWidth
            disabled={submitting}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={submitting || !newRefutation.trim()}
              endIcon={<SendIcon />}
            >
              {submitting ? 'Posting...' : 'Post Refutation'}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Please log in to post refutations.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {refutations.length > 0 ? (
          renderRefutations(refutations)
        ) : (
          <Typography color="text.secondary" align="center">
            No refutations yet. Be the first to refute!
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default RefutationList 