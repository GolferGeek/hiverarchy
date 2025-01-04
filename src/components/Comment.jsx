import { useState } from 'react'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Avatar,
  Tooltip,
  Button,
  TextField
} from '@mui/material'
import { Delete as DeleteIcon, Reply as ReplyIcon } from '@mui/icons-material'

function Comment({ comment, onDelete, onReply, depth = 0 }) {
  const { user } = useAuth()
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const isAuthor = user && user.id === comment.user_id

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent)
      setReplyContent('')
      setIsReplying(false)
    }
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 2,
        ml: depth * 4, // Indentation for nested comments
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {comment.username ? comment.username[0].toUpperCase() : '?'}
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box>
              <Typography variant="subtitle2" component="span">
                {comment.username || 'Anonymous'}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ ml: 1 }}
              >
                {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
              </Typography>
            </Box>
            
            <Box>
              <Button
                startIcon={<ReplyIcon />}
                size="small"
                onClick={() => setIsReplying(!isReplying)}
                sx={{ mr: 1 }}
              >
                Reply
              </Button>
              {isAuthor && (
                <Tooltip title="Delete comment">
                  <IconButton 
                    onClick={() => onDelete(comment.id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
            {comment.content}
          </Typography>

          {isReplying && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim()}
                >
                  Post Reply
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

export default Comment