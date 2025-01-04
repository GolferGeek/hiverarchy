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
  Divider
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
  const [researchResults, setResearchResults] = useState(data?.research_results || [])
  const [editingSystemPrompt, setEditingSystemPrompt] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState(false)
  const [moveTarget, setMoveTarget] = useState(null)

  const canEdit = user?.email === 'golfergeek@gmail.com'

  // Reset system prompt if it was changed
  useEffect(() => {
    setSystemPrompt(RESEARCH_AGENT_PROMPT)
  }, [])

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
            researchAreas: researchResults,
            ideas: [],
            relatedTopics: [],
            audiences: [],
            childPosts: [],
            futurePosts: []
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
    [originalPrompt, systemPrompt, researchPrompt, researchResults]
  )

  // Auto-save when content changes
  useEffect(() => {
    debouncedSave()
    return () => debouncedSave.cancel()
  }, [originalPrompt, systemPrompt, researchPrompt, researchResults])

  const handleSystemPromptSave = () => {
    setEditingSystemPrompt(false)
    debouncedSave()
  }

  const generateResearch = async () => {
    try {
      setIsGenerating(true)
      const service = await getCurrentService()
      if (!service) {
        throw new Error('No AI service available')
      }

      const response = await service.generateCompletion(RESEARCH_AGENT_PROMPT, {
        temperature: 0.7,
        maxTokens: 2000
      })

      console.log('Research results:', response.text)
      setResearchResults([response.text, ...researchResults])

      // Save to database
      await onUpdate({
        original: originalPrompt,
        system_prompt: systemPrompt,
        research_prompt: researchPrompt,
        ideas: {
          researchAreas: [response.text, ...researchResults],
          ideas: [],
          relatedTopics: [],
          audiences: [],
          childPosts: [],
          futurePosts: []
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

  const handleDelete = (index) => {
    const newResults = researchResults.filter((_, i) => i !== index)
    setResearchResults(newResults)
    debouncedSave()
  }

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

        {/* Research Agent Prompt Section */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle1">Ideation Prompt</Typography>
            {canEdit && (
              <IconButton 
                size="small" 
                onClick={() => editingSystemPrompt ? handleSystemPromptSave() : setEditingSystemPrompt(true)}
              >
                {editingSystemPrompt ? <SaveIcon /> : <EditIcon />}
              </IconButton>
            )}
          </Box>
          <Box 
            sx={{ 
              mb: 1, 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: '200px',
              overflow: 'auto'
            }}
          >
            <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
              {systemPrompt}
            </Typography>
          </Box>
          {editingSystemPrompt && canEdit && (
            <TextField
              fullWidth
              multiline
              rows={8}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              sx={{ mb: 1 }}
            />
          )}
        </Box>

        {/* Research Focus Section */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Specific Research Focus (Optional)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={researchPrompt}
            onChange={(e) => setResearchPrompt(e.target.value)}
            placeholder="Enter any specific aspects or questions you want to focus on..."
          />
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
        <Typography variant="h6" gutterBottom>
          Research Results
        </Typography>
        <List>
          {researchResults.length === 0 ? (
            <ListItem>
              <ListItemText secondary="No research results yet" />
            </ListItem>
          ) : (
            researchResults.map((result, index) => (
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
                        <ReactMarkdown
                          components={{
                            li: ({ node, ...props }) => {
                              return (
                                <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                  <Box {...props} sx={{ flex: 1 }} />
                                  <IconButton
                                    size="small"
                                    onClick={() => setMoveTarget(moveTarget === index ? null : index)}
                                    sx={{ 
                                      mt: -1,
                                      visibility: 'hidden',
                                      '&:hover': {
                                        visibility: 'visible'
                                      }
                                    }}
                                  >
                                    <ArrowForwardIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              )
                            }
                          }}
                        >
                          {result}
                        </ReactMarkdown>
                      </Box>
                    </Box>
                  </Box>
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleDelete(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
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