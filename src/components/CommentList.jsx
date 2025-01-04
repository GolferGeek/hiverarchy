import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Comment from './Comment'
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'

function CommentList({ postId, onCountChange }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [postId])

  useEffect(() => {
    if (onCountChange) {
      onCountChange(comments.length)
    }
  }, [comments.length, onCountChange])

  async function fetchComments() {
    try {
      setError(null)
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
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

      if (commentsError) throw commentsError
      
      // Organize comments into a tree structure
      const commentMap = new Map()
      const rootComments = []

      commentsData.forEach(comment => {
        comment.user_email = comment.profile?.email
        comment.username = comment.profile?.username
        comment.replies = []
        commentMap.set(comment.id, comment)
      })

      commentsData.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id)
          if (parent) {
            parent.replies.push(comment)
          }
        } else {
          rootComments.push(comment)
        }
      })

      setComments(rootComments)
    } catch (error) {
      console.error('Error fetching comments:', error)
      setError('Failed to load comments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            content: newComment.trim(),
            post_id: postId,
            profile_id: user.id
          }
        ])

      if (error) throw error

      setNewComment('')
      await fetchComments()
    } catch (error) {
      console.error('Error adding comment:', error)
      setError('Failed to add comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId) {
    try {
      setError(null)
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      setComments(comments.filter(comment => comment.id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
      setError('Failed to delete comment. Please try again.')
    }
  }

  const handleReply = async (parentId, content) => {
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            content: content.trim(),
            post_id: postId,
            profile_id: user.id,
            parent_id: parentId
          }
        ])

      if (error) throw error

      await fetchComments()
    } catch (error) {
      console.error('Error adding reply:', error)
      setError('Failed to add reply. Please try again.')
    }
  }

  const renderComments = (commentList, depth = 0) => {
    return commentList.map(comment => (
      <Box key={comment.id}>
        <Comment
          comment={comment}
          onDelete={handleDelete}
          onReply={handleReply}
          depth={depth}
        />
        {comment.replies && comment.replies.length > 0 && (
          renderComments(comment.replies, depth + 1)
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
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            variant="outlined"
            fullWidth
            disabled={submitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.default',
                '&:hover': {
                  backgroundColor: 'background.default',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
                '&.Mui-focused': {
                  backgroundColor: 'background.default',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !newComment.trim()}
              endIcon={<SendIcon />}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Please log in to comment.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {comments.length > 0 ? (
          renderComments(comments)
        ) : (
          <Typography color="text.secondary" align="center">
            No comments yet. Be the first to comment!
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default CommentList