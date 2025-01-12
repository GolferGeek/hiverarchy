import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tabs,
  Tab,
  Chip
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ReactMarkdown from 'react-markdown'
import AIServiceSelector from '../AIServiceSelector'
import { useAI } from '../../services/ai'
import { useAuth } from '../../contexts/AuthContext'
import debounce from 'lodash/debounce'

const RESEARCH_AGENT_PROMPT = `You are a thorough and methodical research agent focused on gathering comprehensive, factual information.

Your research process should:
1. Current State & Latest Developments
   - Identify and analyze the most recent developments
   - Assess the current state of technology/knowledge
   - Highlight emerging trends and patterns

2. Key Statistics & Data
   - Find relevant statistics and metrics
   - Verify data sources and accuracy
   - Present quantitative insights clearly

3. Expert Insights & Market Analysis
   - Gather expert opinions and analysis
   - Evaluate market trends and predictions
   - Consider multiple perspectives

4. Real-World Examples & Case Studies
   - Identify notable implementations
   - Extract key lessons and insights
   - Analyze success factors and challenges

Format your findings with:
- Clear bullet points for easy scanning
- Citations where possible
- Focus on verifiable facts over speculation
- Maximum of 4 key points per section
- Brief explanations for complex concepts`

export default function ResearchPanel({ data, onUpdate }) {
  const { getCurrentService, services } = useAI()
  const { user } = useAuth()
  const [originalPrompt, setOriginalPrompt] = useState(data?.original || '')
  const [systemPrompt, setSystemPrompt] = useState(RESEARCH_AGENT_PROMPT)
  const [researchPrompt, setResearchPrompt] = useState(data?.research_prompt || '')
  const [activeTab, setActiveTab] = useState(0)
  const [currentResearch, setCurrentResearch] = useState(data?.ideas?.currentResearch || [])
  const [futureResearch, setFutureResearch] = useState(data?.ideas?.futureResearch || [])
  const [childResearch, setChildResearch] = useState(data?.ideas?.childResearch || [])
  const [editingSystemPrompt, setEditingSystemPrompt] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState(false)
  const [moveTarget, setMoveTarget] = useState(null)

  const canEdit = user?.email === 'golfergeek@gmail.com'

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async () => {
      try {
        setSaving(true)
        await onUpdate({
          original: originalPrompt,
          system_prompt: systemPrompt,
          research_prompt: researchPrompt,
          ideas: {
            currentResearch,
            futureResearch,
            childResearch,
            ideas: [],
            relatedTopics: [],
            audiences: []
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
    [originalPrompt, systemPrompt, researchPrompt, currentResearch, futureResearch, childResearch]
  )

  const handleDelete = (index) => {
    switch (activeTab) {
      case 0:
        setCurrentResearch(prev => prev.filter((_, i) => i !== index))
        break
      case 1:
        setFutureResearch(prev => prev.filter((_, i) => i !== index))
        break
      case 2:
        setChildResearch(prev => prev.filter((_, i) => i !== index))
        break
    }
  }

  const handleMove = (fromIndex, toTab) => {
    let item
    // Get item from source tab
    switch (activeTab) {
      case 0:
        item = currentResearch[fromIndex]
        setCurrentResearch(prev => prev.filter((_, i) => i !== fromIndex))
        break
      case 1:
        item = futureResearch[fromIndex]
        setFutureResearch(prev => prev.filter((_, i) => i !== fromIndex))
        break
      case 2:
        item = childResearch[fromIndex]
        setChildResearch(prev => prev.filter((_, i) => i !== fromIndex))
        break
    }

    // Add to target tab
    switch (toTab) {
      case 'Current Research':
        setCurrentResearch(prev => [item, ...prev])
        break
      case 'Future Research':
        setFutureResearch(prev => [item, ...prev])
        break
      case 'Child Research':
        setChildResearch(prev => [item, ...prev])
        break
    }
  }

  const generateResearch = async () => {
    try {
      setIsGenerating(true)
      const service = await getCurrentService()
      if (!service) {
        throw new Error('No AI service available')
      }

      console.log('Using AI service:', service)
      console.log('Available methods on service:', Object.getOwnPropertyNames(service))
      console.log('Service prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(service)))

      const completionMethod = service.generateCompletion ? 'generateCompletion' :
                             service.createCompletion ? 'createCompletion' :
                             service.complete ? 'complete' :
                             service.chat ? 'chat' : null

      if (!completionMethod) {
        console.error('No completion method found on service:', service)
        throw new Error('Selected service does not support text generation. Please select an AI service like OpenAI or Anthropic.')
      }

      console.log('Using completion method:', completionMethod)
      const response = await service[completionMethod](originalPrompt, {
        temperature: 0.7,
        maxTokens: 2000
      }).catch(error => {
        console.error('AI service error:', error)
        throw error
      })

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
        console.error('Unexpected response format:', response)
        throw new Error('Unexpected response format from AI service')
      }

      console.log('Research results:', responseText)

      // Split response into separate items by the separator
      const items = responseText.split('\n\n---\n\n').filter(Boolean)

      // Add to current tab
      switch (activeTab) {
        case 0:
          setCurrentResearch(prev => [...items, ...prev])
          break
        case 1:
          setFutureResearch(prev => [...items, ...prev])
          break
        case 2:
          setChildResearch(prev => [...items, ...prev])
          break
      }

      // Save to database
      await onUpdate({
        original: originalPrompt,
        system_prompt: systemPrompt,
        research_prompt: researchPrompt,
        ideas: {
          currentResearch: activeTab === 0 ? [...items, ...currentResearch] : currentResearch,
          futureResearch: activeTab === 1 ? [...items, ...futureResearch] : futureResearch,
          childResearch: activeTab === 2 ? [...items, ...childResearch] : childResearch,
          ideas: [],
          relatedTopics: [],
          audiences: []
        }
      })

      setSaveMessage('Generated and saved research results')
      setSaveError(false)
    } catch (error) {
      console.error('Error generating research:', error)
      setSaveMessage('Error generating research')
      setSaveError(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const tabs = [
    { 
      label: 'Current Research', 
      items: currentResearch,
      empty: 'No research results yet'
    },
    { 
      label: 'Future Research', 
      items: futureResearch,
      empty: 'No future research yet'
    },
    { 
      label: 'Child Research', 
      items: childResearch,
      empty: 'No child research yet'
    }
  ]

  return (
    <Box>
      {/* Original Prompt Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Research Topic
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={originalPrompt}
          onChange={(e) => setOriginalPrompt(e.target.value)}
          placeholder="Enter your research topic here..."
          sx={{ mb: 2 }}
        />
        
        {/* AI Service Selector */}
        <Box sx={{ mb: 2 }}>
          <AIServiceSelector />
        </Box>

        <Button
          variant="contained"
          onClick={generateResearch}
          disabled={isGenerating || !originalPrompt.trim()}
          startIcon={isGenerating ? <CircularProgress size={20} /> : <RefreshIcon />}
        >
          {isGenerating ? 'Researching...' : 'Research Topic'}
        </Button>
      </Paper>

      {/* Research Results Section */}
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

        <List>
          {tabs[activeTab].items.length === 0 ? (
            <ListItem>
              <ListItemText secondary={tabs[activeTab].empty} />
            </ListItem>
          ) : (
            tabs[activeTab].items.map((result, index) => (
              <Box key={index}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    position: 'relative',
                    py: 2
                  }}
                >
                  <Box sx={{ width: '100%', pr: 8 }}>
                    <Box sx={{ 
                      '& pre': { 
                        whiteSpace: 'pre-wrap',
                        backgroundColor: 'background.paper',
                        p: 1,
                        borderRadius: 1
                      },
                      '& code': {
                        backgroundColor: 'background.paper',
                        p: 0.5,
                        borderRadius: 0.5
                      },
                      '& ul, & ol': {
                        pl: 2,
                        '& li': {
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: '-1.5em',
                            top: '0.5em',
                            width: '0.5em',
                            height: '0.5em',
                            backgroundColor: 'text.primary',
                            borderRadius: '50%'
                          }
                        }
                      },
                      '& blockquote': {
                        borderLeft: '4px solid',
                        borderColor: 'divider',
                        pl: 2,
                        ml: 0,
                        my: 1
                      }
                    }}>
                      <Box sx={{ position: 'relative' }}>
                        <ReactMarkdown>{result}</ReactMarkdown>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ position: 'absolute', right: 0, top: 8 }}>
                    <IconButton
                      edge="end"
                      onClick={() => setMoveTarget(moveTarget === index ? null : index)}
                      sx={{ mr: 1 }}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDelete(index)}>
                      <DeleteIcon />
                    </IconButton>
                    {moveTarget === index && (
                      <Box
                        sx={{ 
                          position: 'absolute',
                          right: '100%',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'background.paper',
                          boxShadow: 3,
                          borderRadius: 1,
                          p: 1,
                          zIndex: 1000,
                          mr: 1
                        }}
                      >
                        {tabs.map((tab) => (
                          tab.label !== tabs[activeTab].label && (
                            <Button
                              key={tab.label}
                              size="small"
                              onClick={() => {
                                handleMove(index, tab.label)
                                setMoveTarget(null)
                              }}
                              sx={{ display: 'block', mb: 0.5 }}
                            >
                              {tab.label}
                            </Button>
                          )
                        ))}
                      </Box>
                    )}
                  </Box>
                </ListItem>
              </Box>
            ))
          )}
        </List>
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