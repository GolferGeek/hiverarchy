import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Collapse
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { supabase } from '../lib/supabase'

export default function PostTree({ arcId }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [postHierarchy, setPostHierarchy] = useState(null)
  const [expanded, setExpanded] = useState(new Set())
  const navigate = useNavigate()

  useEffect(() => {
    if (arcId) {
      console.log('PostTree: Fetching posts for arcId:', arcId)
      fetchPosts()
    }
  }, [arcId])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, parent_id, arc_id, title')
        .eq('arc_id', arcId)
        .order('created_at', { ascending: true })

      if (postsError) throw postsError

      console.log('PostTree: Raw posts data:', posts)

      if (!posts || posts.length === 0) {
        setError('No posts found')
        return
      }

      // Validate posts have required fields
      const validPosts = posts.filter(post => {
        const isValid = post.id && post.arc_id && post.title
        if (!isValid) {
          console.warn('Invalid post data:', post)
        }
        return isValid
      })

      // Create a map for quick lookup
      const postsById = new Map(validPosts.map(post => [post.id, { ...post, children: [] }]))

      // Find the root and build the tree
      let root = null
      postsById.forEach(post => {
        if (!post.parent_id) {
          root = post
        } else {
          const parent = postsById.get(post.parent_id)
          if (parent) {
            parent.children.push(post)
          }
        }
      })

      if (!root) {
        setError('Root post not found')
        return
      }

      // Expand all nodes by default
      const allIds = new Set(validPosts.map(post => post.id))
      setExpanded(allIds)
      setPostHierarchy(root)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (nodeId) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const renderNode = (node, level = 0) => {
    if (!node?.id || !node?.title) return null

    const hasChildren = Array.isArray(node.children) && node.children.length > 0
    const isNodeExpanded = expanded.has(node.id)

    return (
      <Box key={node.id}>
        <ListItem 
          sx={{ 
            pl: level * 2,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          {hasChildren && (
            <ListItemIcon sx={{ minWidth: 32 }}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpand(node.id)
                }}
              >
                {isNodeExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              </IconButton>
            </ListItemIcon>
          )}
          <ListItemText 
            primary={node.title}
            onClick={() => navigate(`/post/${node.id}`)}
            sx={{ 
              ml: hasChildren ? 0 : 4,
              '& .MuiTypography-root': {
                fontWeight: level === 0 ? 500 : 400
              }
            }}
          />
        </ListItem>
        {hasChildren && (
          <Collapse in={isNodeExpanded}>
            <List disablePadding>
              {node.children.map(child => renderNode(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        {error}
      </Typography>
    )
  }

  if (!postHierarchy) {
    return (
      <Typography color="text.secondary" sx={{ p: 2 }}>
        No posts found
      </Typography>
    )
  }

  return (
    <Paper 
      sx={{ 
        p: 2,
        position: 'sticky',
        top: 93,
        maxHeight: 'calc(100vh - 100px)',
        minWidth: '375px',
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        overflowY: 'auto'
      }}
    >
      <List disablePadding>
        {renderNode(postHierarchy)}
      </List>
    </Paper>
  )
} 