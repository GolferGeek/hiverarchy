import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress
} from '@mui/material'
import {
  DragIndicator as DragIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AutoAwesome as AIIcon,
  Notes as NotesIcon,
  Link as LinkIcon
} from '@mui/icons-material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useAI } from '../../services/ai'
import SectionEditForm from './SectionEditForm'

// Section types for different content blocks
const SECTION_TYPES = {
  HEADING: 'heading',
  SUBHEADING: 'subheading',
  PARAGRAPH: 'paragraph',
  LIST: 'list',
  CODE: 'code'
}

export default function StructurePlanner({ ideas, onUpdate }) {
  const { getCurrentService } = useAI()
  const [loading, setLoading] = useState(false)
  const [structure, setStructure] = useState([])
  const [editingSection, setEditingSection] = useState(null)
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)

  // Initial structure generation using AI
  const generateInitialStructure = async () => {
    try {
      setLoading(true)
      const service = await getCurrentService()
      if (!service) {
        throw new Error('No AI service available')
      }

      const prompt = `Please analyze these ideas and create a well-structured outline for an article:

Ideas:
${ideas.ideas.join('\n')}

Related Topics:
${ideas.relatedTopics.join('\n')}

Research:
${ideas.researchAreas.join('\n')}

Create a hierarchical structure with:
1. Main sections (with estimated word counts)
2. Subsections
3. Key points to cover
4. Places to include research/data
5. Code example sections where relevant

Format the response as a JSON structure with:
{
  "sections": [
    {
      "id": "unique_id",
      "type": "heading|subheading|paragraph|list|code",
      "content": "section content",
      "wordCount": estimated_words,
      "children": [], // nested sections
      "notes": "any special instructions or notes",
      "references": [] // links to original ideas or research
    }
  ]
}`

      const response = await service.generateCompletion(prompt, {
        temperature: 0.7,
        maxTokens: 2000
      })

      const newStructure = JSON.parse(response.text)
      setStructure(newStructure.sections)
    } catch (error) {
      console.error('Error generating structure:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(structure)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setStructure(items)
    onUpdate({ sections: items })
  }

  // Section editing
  const handleEditSection = (section) => {
    setEditingSection(section)
    setSectionDialogOpen(true)
  }

  const handleSaveSection = (updatedSection) => {
    const updateSectionInStructure = (sections, sectionId) => {
      return sections.map(section => {
        if (section.id === sectionId) {
          return { ...section, ...updatedSection }
        }
        if (section.children) {
          return {
            ...section,
            children: updateSectionInStructure(section.children, sectionId)
          }
        }
        return section
      })
    }

    const newStructure = updateSectionInStructure(structure, updatedSection.id)
    setStructure(newStructure)
    onUpdate({ sections: newStructure })
    setSectionDialogOpen(false)
    setEditingSection(null)
  }

  // Section expansion toggle
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  // Render a single section
  const renderSection = (section, index, level = 0) => (
    <Draggable key={section.id} draggableId={section.id} index={index}>
      {(provided) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{ pl: level * 4 }}
        >
          <ListItemIcon {...provided.dragHandleProps}>
            <DragIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant={level === 0 ? 'h6' : 'body1'}>
                  {section.content}
                </Typography>
                {section.notes && (
                  <Tooltip title={section.notes}>
                    <NotesIcon color="action" fontSize="small" />
                  </Tooltip>
                )}
                {section.references?.length > 0 && (
                  <Tooltip title="Has references">
                    <LinkIcon color="action" fontSize="small" />
                  </Tooltip>
                )}
              </Box>
            }
            secondary={`${section.type} • ${section.wordCount} words`}
          />
          <ListItemSecondaryAction>
            <IconButton onClick={() => handleEditSection(section)}>
              <EditIcon />
            </IconButton>
            {section.children?.length > 0 && (
              <IconButton onClick={() => toggleSection(section.id)}>
                {expandedSections[section.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      )}
    </Draggable>
  )

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Structure Planning</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<AIIcon />}
            variant="contained"
            onClick={generateInitialStructure}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Structure'}
          </Button>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => handleEditSection({
              id: Date.now().toString(),
              type: SECTION_TYPES.HEADING,
              content: '',
              wordCount: 0,
              children: [],
              notes: '',
              references: []
            })}
          >
            Add Section
          </Button>
        </Box>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="structure">
          {(provided) => (
            <List ref={provided.innerRef} {...provided.droppableProps}>
              {structure.map((section, index) => (
                <Box key={section.id}>
                  {renderSection(section, index)}
                  {section.children?.length > 0 && expandedSections[section.id] && (
                    <Collapse in={expandedSections[section.id]}>
                      <List>
                        {section.children.map((child, childIndex) =>
                          renderSection(child, childIndex, 1)
                        )}
                      </List>
                    </Collapse>
                  )}
                </Box>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog
        open={sectionDialogOpen}
        onClose={() => setSectionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSection?.id ? 'Edit Section' : 'Add Section'}
        </DialogTitle>
        <DialogContent>
          {editingSection && (
            <SectionEditForm
              section={editingSection}
              ideas={ideas}
              onSave={handleSaveSection}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSectionDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleSaveSection(editingSection)} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
} 