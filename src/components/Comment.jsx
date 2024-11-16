import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Avatar,
  Tooltip
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'

function Comment({ comment, onDelete }) {
  const { user } = useAuth()
  const isAuthor = user && user.id === comment.user_id
  const userInitial = comment.user_email ? comment.user_email[0].toUpperCase() : '?'

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 2, 
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {userInitial}
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box>
              <Typography variant="subtitle2" component="span">
                {comment.user_email}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ ml: 1 }}
              >
                {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
              </Typography>
            </Box>
            
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
          
          <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
            {comment.content}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default Comment