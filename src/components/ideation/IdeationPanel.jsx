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
  Tabs,
  Tab,
  Chip,
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AIServiceSelector from '../AIServiceSelector'
import { useAI } from '../../services/ai'
import { debounce } from 'lodash'

// Update the system prompt to be more focused on brainstorming and analysis
const DEFAULT_SYSTEM_PROMPT = `You are an enthusiastic and insightful ideation partner with expertise in technology trends, software development, and business analysis. Your role is to generate creative and practical ideas related to the given topic. Your responses should be structured and concise.

Format your response in these specific sections:

IDEAS:
- Start each idea with a dash (-)
- Focus on concrete, actionable concepts
- Include both practical and innovative suggestions
- Keep each idea clear and well-defined

RELATED TOPICS:
- Start each topic with a dash (-)
- List relevant connected themes and concepts
- Consider technical and non-technical relationships
- Focus on topics that expand the main idea

AUDIENCE:
- Start each segment with a dash (-)
- Identify specific groups who would benefit
- Consider both direct and indirect audiences
- Include potential impact and reach

CHILD POSTS:
- Start each post idea with a dash (-)
- Suggest detailed subtopics for deeper exploration
- Ensure each could be a standalone article
- Maintain clear connection to main topic

FUTURE POSTS:
- Start each post idea with a dash (-)
- Explore future developments and trends
- Consider long-term implications
- Identify emerging opportunities

For each section, provide 2-4 high-quality suggestions. Each item should include a brief explanation of its relevance or potential impact. Keep the focus on generating practical, valuable ideas that can be developed further.`

function IdeationList({ items, onDelete, onAdd, title, emptyMessage, onMove }) {
  const [newItem, setNewItem] = useState('')
  const [isAdding, setIsAdding] = useState('')
  const [moveTarget, setMoveTarget] = useState(null)

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim())
      setNewItem('')
      setIsAdding(false)
    }
  }

  const handleMove = (index, target) => {
    if (onMove) {
      onMove(index, target)
      setMoveTarget(null)
    }
  }

  const getShortenedName = (target) => {
    switch (target) {
      case 'Related Topics':
        return 'Related'
      case 'Audience':
        return 'Audience'
      case 'Child Posts':
        return 'Child'
      case 'Future Posts':
        return 'Future'
      default:
        return target
    }
  }

  const renderContent = (item) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <ListItemText primary={item} sx={{ flex: 1 }} />
    </Box>
  )

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <List>
        {items.length === 0 ? (
          <ListItem>
            <ListItemText secondary={emptyMessage} />
          </ListItem>
        ) : (
          items.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative'
              }}
            >
              <Box sx={{ width: '100%', pr: 16 }}>
                {renderContent(item)}
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                <IconButton
                  edge="end"
                  onClick={() => setMoveTarget(moveTarget === index ? null : index)}
                  sx={{ mr: 1 }}
                >
                  <ArrowForwardIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => onDelete(index)}>
                  <DeleteIcon />
                </IconButton>
                {moveTarget === index && (
                  <Box
                    sx={{ 
                      position: 'absolute',
                      left: '100%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'background.paper',
                      boxShadow: 3,
                      borderRadius: 1,
                      p: 1.5,
                      pb: 2,
                      zIndex: 1000,
                      ml: 1,
                      '& .MuiButton-root': {
                        width: '100%',
                        justifyContent: 'center',
                        minWidth: '80px',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      },
                      '& button:last-child': {
                        mb: 0
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {['Ideas', 'Related Topics', 'Audience', 'Child Posts', 'Future Posts'].map((target) => (
                        target !== title && (
                          <Button
                            key={target}
                            size="small"
                            onClick={() => handleMove(index, target)}
                          >
                            {getShortenedName(target)}
                          </Button>
                        )
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </ListItem>
          ))
        )}
      </List>
      {isAdding ? (
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Type and press Enter"
          />
          <Button onClick={handleAdd} variant="contained" size="small">
            Add
          </Button>
        </Box>
      ) : (
        <Button
          startIcon={<AddIcon />}
          onClick={() => setIsAdding(true)}
          sx={{ mt: 1 }}
        >
          Add {title}
        </Button>
      )}
    </Box>
  )
}

export default function IdeationPanel({ data, onUpdate }) {
  const { getCurrentService, services } = useAI()
  const [activeTab, setActiveTab] = useState(0)
  const [originalPrompt, setOriginalPrompt] = useState(data?.content || '')
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [ideas, setIdeas] = useState(data?.ideas?.ideas || [])
  const [relatedTopics, setRelatedTopics] = useState(data?.ideas?.relatedTopics || [])
  const [audiences, setAudiences] = useState(data?.ideas?.audiences || [])
  const [childPosts, setChildPosts] = useState(data?.ideas?.childPosts || [])
  const [futurePosts, setFuturePosts] = useState(data?.ideas?.futurePosts || [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState(false)

  // Update originalPrompt when data.content changes
  useEffect(() => {
    if (data?.content) {
      setOriginalPrompt(data.content)
    }
  }, [data?.content])

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async () => {
      try {
        setSaving(true)
        await onUpdate({
          content: originalPrompt,
          ideas: {
            ideas,
            relatedTopics,
            audiences,
            childPosts,
            futurePosts
          }
        })
        setSaveMessage('Changes saved successfully')
        setSaveError(false)
      } catch (error) {
        setSaveMessage('Error saving changes')
        setSaveError(true)
      } finally {
        setSaving(false)
        setTimeout(() => setSaveMessage(''), 3000)
      }
    }, 1000),
    [originalPrompt, ideas, relatedTopics, audiences, childPosts, futurePosts, onUpdate]
  )

  // Auto-save when content changes
  useEffect(() => {
    debouncedSave()
    return () => debouncedSave.cancel()
  }, [originalPrompt, systemPrompt, ideas, relatedTopics, audiences, childPosts, futurePosts])

  const handlePromptSave = async () => {
    setEditingPrompt(false)
    try {
      setSaving(true)
      await onUpdate({
        original: originalPrompt
      })
      setSaveMessage('Prompt saved successfully')
      setSaveError(false)
    } catch (error) {
      setSaveMessage('Error saving prompt')
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  const handleItemAdd = (section, item) => {
    switch (section) {
      case 'ideas':
        setIdeas(prev => [...prev, item])
        break
      case 'relatedTopics':
        setRelatedTopics(prev => [...prev, item])
        break
      case 'audiences':
        setAudiences(prev => [...prev, item])
        break
      case 'childPosts':
        setChildPosts(prev => [...prev, item])
        break
      case 'futurePosts':
        setFuturePosts(prev => [...prev, item])
        break
      default:
        // Silently ignore unknown sections
        break
    }
  }

  const handleItemDelete = (section, index) => {
    switch (section) {
      case 'ideas':
        setIdeas(prev => prev.filter((_, i) => i !== index))
        break
      case 'relatedTopics':
        setRelatedTopics(prev => prev.filter((_, i) => i !== index))
        break
      case 'audiences':
        setAudiences(prev => prev.filter((_, i) => i !== index))
        break
      case 'childPosts':
        setChildPosts(prev => prev.filter((_, i) => i !== index))
        break
      case 'futurePosts':
        setFuturePosts(prev => prev.filter((_, i) => i !== index))
        break
    }
  }

  const handleItemMove = (section, index, targetSection) => {
    // Map the target section name to the correct section key
    const sectionMap = {
      'Ideas': 'ideas',
      'Related Topics': 'relatedTopics',
      'Audience': 'audiences',
      'Child Posts': 'childPosts',
      'Future Posts': 'futurePosts'
    }
    
    // Get the item from the current section
    const sourceItems = tabs[section].items
    const item = sourceItems[index]
    
    // Remove from current section
    handleItemDelete(tabs[section].section, index)
    
    // Add to target section using the mapped section key
    const targetKey = sectionMap[targetSection]
    if (targetKey) {
      handleItemAdd(targetKey, item)
    }
  }

  const handleGenerate = async () => {
    if (!originalPrompt.trim()) return

    try {
      setIsGenerating(true)
      const service = await getCurrentService()
      if (!service) {
        throw new Error('No AI service available')
      }

      const fullPrompt = `${systemPrompt}\n\nTopic: "${originalPrompt}"`

      const response = await service.generateCompletion(fullPrompt, {
        temperature: 0.7,
        maxTokens: 2000
      })

      // Handle different response formats
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
      } else {
        throw new Error('Unexpected response format from AI service')
      }

      // Process the response and extract sections
      const sections = parseSections(responseText)
      
      // Update all sections at once
      setIdeas(sections.ideas)
      setRelatedTopics(sections.relatedTopics)
      setAudiences(sections.audiences)
      setChildPosts(sections.childPosts)
      setFuturePosts(sections.futurePosts)

      // Save the generated content
      await onUpdate({
        content: originalPrompt,
        ideas: {
          ideas: sections.ideas,
          relatedTopics: sections.relatedTopics,
          audiences: sections.audiences,
          childPosts: sections.childPosts,
          futurePosts: sections.futurePosts
        }
      })

      setSaveMessage('Ideas generated successfully')
      setSaveError(false)
    } catch (error) {
      setSaveMessage('Failed to generate ideas. Please try again.')
      setSaveError(true)
    } finally {
      setIsGenerating(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const parseSections = (text) => {
    if (!text || typeof text !== 'string') {
      return {
        ideas: [],
        relatedTopics: [],
        audiences: [],
        childPosts: [],
        futurePosts: []
      }
    }

    const sections = {
      ideas: [],
      relatedTopics: [],
      audiences: [],
      childPosts: [],
      futurePosts: []
    }

    // Split text into sections (now handles both ### and plain headers)
    const parts = text.split(/\n(?:###\s*)?(?=[A-Z][A-Z\s]+:)/g)
    
    parts.forEach(part => {
      const trimmedPart = part.trim()
      if (!trimmedPart) return
      
      const headerMatch = trimmedPart.match(/^([A-Z][A-Z\s]+):/)
      if (!headerMatch) return
      
      const header = headerMatch[1].trim()
      let currentSection = null
      
      // Normalize section headers
      switch (header.toLowerCase().replace(/\s+/g, '')) {
        case 'ideas':
          currentSection = 'ideas'
          break
        case 'relatedtopics':
          currentSection = 'relatedTopics'
          break
        case 'audience':
          currentSection = 'audiences'
          break
        case 'childposts':
          currentSection = 'childPosts'
          break
        case 'futureposts':
          currentSection = 'futurePosts'
          break
      }

      if (currentSection) {
        // Extract items (lines starting with - or •)
        const items = trimmedPart
          .split('\n')
          .slice(1) // Skip the header line
          .filter(line => line.trim().match(/^[-•]\s/))
          .map(line => {
            // Remove bullet point and any markdown formatting
            let cleanedLine = line
              .replace(/^[-•]\s+/, '') // Remove bullet point
              .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
              .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove markdown links
              .trim()

            // If there's a colon with explanation, just take the main point
            const colonIndex = cleanedLine.indexOf(':')
            if (colonIndex > 0) {
              cleanedLine = cleanedLine.substring(0, colonIndex).trim()
            } else {
              // If there's a period, take everything before the first period
              const periodIndex = cleanedLine.indexOf('.')
              if (periodIndex > 0) {
                cleanedLine = cleanedLine.substring(0, periodIndex).trim()
              }
            }

            return cleanedLine
          })
          .filter(item => item.length > 0)

        sections[currentSection].push(...items)
      }
    })

    return sections
  }

  const handleSave = async () => {
    await onUpdate({
      original: originalPrompt,
      system_prompt: systemPrompt,
      ideas: {
        ideas,
        relatedTopics,
        audiences,
        childPosts,
        futurePosts
      }
    })
    setEditingPrompt(false)
  }

  const tabs = [
    { 
      label: 'Ideas', 
      items: ideas, 
      section: 'ideas',
      empty: 'No ideas yet' 
    },
    { 
      label: 'Related Topics', 
      items: relatedTopics, 
      section: 'relatedTopics',
      empty: 'No related topics yet' 
    },
    { 
      label: 'Audience', 
      items: audiences, 
      section: 'audiences',
      empty: 'No audience segments yet' 
    },
    { 
      label: 'Child Posts', 
      items: childPosts, 
      section: 'childPosts',
      empty: 'No child posts yet' 
    },
    { 
      label: 'Future Posts', 
      items: futurePosts, 
      section: 'futurePosts',
      empty: 'No future posts yet' 
    }
  ]

  return (
    <Box>
      {/* Prompt Input Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ideation Prompt
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Enter a prompt to generate ideas based on your post's concept. Be specific about what aspects you want to explore.
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={originalPrompt}
          onChange={(e) => setOriginalPrompt(e.target.value)}
          placeholder="Enter your prompt for idea generation..."
          sx={{ mb: 2 }}
        />
        
        {/* AI Service Selector */}
        <Box sx={{ mb: 2 }}>
          <AIServiceSelector />
        </Box>

        {/* System Prompt Section */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle1">Ideation Agent Prompt</Typography>
            <IconButton 
              size="small" 
              onClick={() => editingPrompt ? handlePromptSave() : setEditingPrompt(true)}
            >
              {editingPrompt ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Box>
          {editingPrompt ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              sx={{ mb: 1 }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {systemPrompt.split('\n')[0]}...
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={isGenerating || !originalPrompt.trim()}
          startIcon={isGenerating ? <CircularProgress size={20} /> : <RefreshIcon />}
          sx={{ mt: 2 }}
        >
          {isGenerating ? 'Generating...' : 'Generate Ideas'}
        </Button>
      </Paper>

      {/* Ideas Tabs Section */}
      <Paper sx={{ p: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.label}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

        <Box sx={{ mt: 2 }}>
          <IdeationList
            items={tabs[activeTab].items}
            onDelete={(index) => handleItemDelete(tabs[activeTab].section, index)}
            onAdd={(item) => handleItemAdd(tabs[activeTab].section, item)}
            onMove={(index, target) => handleItemMove(activeTab, index, target)}
            title={tabs[activeTab].label}
            emptyMessage={tabs[activeTab].empty}
          />
        </Box>
      </Paper>

      {/* Save Status Snackbar */}
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