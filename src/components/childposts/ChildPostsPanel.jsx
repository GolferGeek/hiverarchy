import { useState, useEffect, useCallback } from 'react'
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
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Tabs,
  Tab,
  Chip
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import AddIcon from '@mui/icons-material/Add'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AIServiceSelector from '../AIServiceSelector'
import { useAI } from '../../services/ai'
import { debounce } from 'lodash'

const DEFAULT_SYSTEM_PROMPT = `You are a strategic content planning assistant. Based on the main topic and any referenced posts, suggest potential child posts that would create a comprehensive content hierarchy. Consider:

1. Breaking down complex topics into manageable subtopics
2. Creating a logical progression of ideas
3. Identifying specific aspects that deserve deeper exploration
4. Ensuring each child post can stand alone while contributing to the larger topic

Provide exactly 5 suggestions, each formatted as a clear title followed by a brief explanation of its relevance and connection to the main topic.`

export default function ChildPostsPanel({ data, onUpdate }) {
  const { getCurrentService, setCurrentStep } = useAI()
  const [originalPrompt, setOriginalPrompt] = useState(data?.original || '')
  const [activeTab, setActiveTab] = useState(0)
  const [currentPosts, setCurrentPosts] = useState(data?.ideas?.currentPosts || [])
  const [futurePosts, setFuturePosts] = useState(data?.ideas?.futurePosts || [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [moveTarget, setMoveTarget] = useState(null)

  // Set current step when component mounts
  useEffect(() => {
    setCurrentStep('child_posts')
  }, [setCurrentStep])

  // Update posts when data changes
  useEffect(() => {
    if (data?.ideas) {
      setCurrentPosts(data.ideas.currentPosts || [])
      setFuturePosts(data.ideas.futurePosts || [])
    }
  }, [data?.ideas])

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async () => {
      try {
        setSaving(true)
        await onUpdate({
          original: originalPrompt,
          ideas: {
            ...data?.ideas,
            currentPosts,
            futurePosts
          }
        })
        setSaveMessage('Changes saved')
        setSaveError(false)
      } catch (error) {
        console.error('Error saving:', error)
        setSaveMessage('Error saving changes')
        setSaveError(true)
      } finally {
        setSaving(false)
      }
    }, 1000),
    [originalPrompt, currentPosts, futurePosts, data?.ideas]
  )

  // Save when prompt or posts change
  useEffect(() => {
    debouncedSave()
  }, [originalPrompt, currentPosts, futurePosts])

  const handleDelete = (index) => {
    if (activeTab === 0) {
      setCurrentPosts(prev => prev.filter((_, i) => i !== index))
    } else {
      setFuturePosts(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleAdd = () => {
    if (newPost.trim()) {
      if (activeTab === 0) {
        setCurrentPosts(prev => [newPost.trim(), ...prev])
      } else {
        setFuturePosts(prev => [newPost.trim(), ...prev])
      }
      setNewPost('')
      setIsAdding(false)
    }
  }

  const handleMove = (fromIndex) => {
    if (activeTab === 0) {
      const post = currentPosts[fromIndex]
      setCurrentPosts(prev => prev.filter((_, i) => i !== fromIndex))
      setFuturePosts(prev => [post, ...prev])
    } else {
      const post = futurePosts[fromIndex]
      setFuturePosts(prev => prev.filter((_, i) => i !== fromIndex))
      setCurrentPosts(prev => [post, ...prev])
    }
    setMoveTarget(null)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  const generateChildPosts = async () => {
    try {
      setIsGenerating(true)
      const service = await getCurrentService()
      if (!service) {
        throw new Error('No AI service available')
      }

      console.log('Using AI service:', service)

      const prompt = `Main Topic: ${data?.brief_description || ''}\n\n${originalPrompt}`

      const completionMethod = service.generateCompletion ? 'generateCompletion' :
                             service.createCompletion ? 'createCompletion' :
                             service.complete ? 'complete' :
                             service.chat ? 'chat' : null

      if (!completionMethod) {
        throw new Error('Selected service does not support text generation')
      }

      console.log('Using completion method:', completionMethod)

      const response = await service[completionMethod](prompt, {
        temperature: 0.7,
        maxTokens: 2000
      })

      console.log('AI Response:', response)

      let responseText = ''
      if (typeof response === 'string') {
        responseText = response
      } else if (response?.text) {
        responseText = response.text
      } else if (response?.content) {
        responseText = response.content
      } else if (response?.choices?.[0]?.text) {
        responseText = response.choices[0].text
      } else if (response?.choices?.[0]?.message?.content) {
        responseText = response.choices[0].message.content
      }

      console.log('Processed response text:', responseText)

      // Split into individual suggestions and limit to 5
      const suggestions = responseText
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[-*]\s*/, ''))
        .filter(line => line.length > 0)
        .slice(0, 5)

      console.log('Parsed suggestions:', suggestions)

      if (activeTab === 0) {
        setCurrentPosts(prev => [...suggestions, ...prev])
      } else {
        setFuturePosts(prev => [...suggestions, ...prev])
      }

      await onUpdate({
        original: originalPrompt,
        ideas: {
          ...data?.ideas,
          currentPosts: activeTab === 0 ? [...suggestions, ...currentPosts] : currentPosts,
          futurePosts: activeTab === 1 ? [...suggestions, ...futurePosts] : futurePosts
        }
      })

      setSaveMessage('Generated post suggestions')
      setSaveError(false)
    } catch (error) {
      console.error('Error generating posts:', error)
      setSaveMessage('Error generating suggestions')
      setSaveError(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const tabs = [
    { 
      label: 'Current Posts', 
      items: currentPosts,
      empty: 'No current posts yet'
    },
    { 
      label: 'Future Posts', 
      items: futurePosts,
      empty: 'No future posts yet'
    }
  ]

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Child Posts Planning
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Describe what you're looking for in child posts. Reference any existing posts you want to build upon.
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={originalPrompt}
          onChange={(e) => setOriginalPrompt(e.target.value)}
          placeholder="Example: I want to break down the main topic into detailed sub-topics, focusing on..."
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ mb: 2 }}>
          <AIServiceSelector />
        </Box>

        <Button
          variant="contained"
          onClick={generateChildPosts}
          disabled={isGenerating || !originalPrompt.trim()}
          startIcon={isGenerating ? <CircularProgress size={20} /> : <RefreshIcon />}
        >
          {isGenerating ? 'Generating...' : 'Generate Suggestions'}
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {tab.label}
                  <Chip
                    label={tab.items.length}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
            />
          ))}
        </Tabs>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setIsAdding(true)}
            variant="outlined"
            size="small"
          >
            Add Post
          </Button>
        </Box>

        {isAdding && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a title for the child post..."
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAdd}
                disabled={!newPost.trim()}
              >
                Add
              </Button>
            </Box>
          </Box>
        )}

        <List>
          {tabs[activeTab].items.length === 0 ? (
            <ListItem>
              <ListItemText secondary={tabs[activeTab].empty} />
            </ListItem>
          ) : (
            tabs[activeTab].items.map((post, index) => (
              <Box key={index}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText primary={post} />
                  <ListItemSecondaryAction>
                    <IconButton 
                      onClick={() => handleMove(index)}
                      sx={{ mr: 1 }}
                      title={`Move to ${activeTab === 0 ? 'Future' : 'Current'} Posts`}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDelete(index)}
                      title="Delete Post"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            ))
          )}
        </List>
      </Paper>

      <Snackbar
        open={!!saveMessage}
        autoHideDuration={3000}
        onClose={() => setSaveMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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