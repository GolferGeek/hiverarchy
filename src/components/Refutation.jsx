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

function Refutation({ refutation, onDelete, onReply, depth = 0 }) {
  const { user } = useAuth()
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const isAuthor = user && user.id === refutation.user_id
  const userInitial = refutation.user_email ? refutation.user_email[0].toUpperCase() : '?'

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(refutation.id, replyContent)
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
        ml: depth * 4, // Indentation for nested refutations
        bgcolor: 'error.lighter',
        border: '1px solid',
        borderColor: 'error.light',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'error.main' }}>
          {refutation.username ? refutation.username[0].toUpperCase() : '?'}
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box>
              <Typography variant="subtitle2" component="span">
                {refutation.username || 'Anonymous'}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ ml: 1 }}
              >
                {format(new Date(refutation.created_at), 'MMM d, yyyy h:mm a')}
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
                <Tooltip title="Delete refutation">
                  <IconButton 
                    onClick={() => onDelete(refutation.id)}
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
            {refutation.content}
          </Typography>

          {isReplying && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your counter-refutation..."
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
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

export default Refutation 