import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { SECTION_TYPES } from './StructurePlanner'

export default function SectionEditForm({ section, ideas, onSave }) {
  const [editedSection, setEditedSection] = useState(section)
  const [newReference, setNewReference] = useState('')

  useEffect(() => {
    setEditedSection(section)
  }, [section])

  const handleChange = (field) => (event) => {
    setEditedSection(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleAddReference = () => {
    if (newReference) {
      setEditedSection(prev => ({
        ...prev,
        references: [...prev.references, newReference]
      }))
      setNewReference('')
    }
  }

  const handleRemoveReference = (index) => {
    setEditedSection(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    onSave(editedSection)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
      <FormControl fullWidth>
        <InputLabel>Type</InputLabel>
        <Select
          value={editedSection.type}
          label="Type"
          onChange={handleChange('type')}
        >
          {Object.entries(SECTION_TYPES).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Content"
        multiline
        rows={4}
        value={editedSection.content}
        onChange={handleChange('content')}
      />

      <TextField
        fullWidth
        label="Word Count"
        type="number"
        value={editedSection.wordCount}
        onChange={handleChange('wordCount')}
      />

      <TextField
        fullWidth
        label="Notes"
        multiline
        rows={2}
        value={editedSection.notes}
        onChange={handleChange('notes')}
      />

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          References
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Add Reference"
            value={newReference}
            onChange={(e) => setNewReference(e.target.value)}
          />
          <IconButton onClick={handleAddReference} color="primary">
            <AddIcon />
          </IconButton>
        </Box>
        <List>
          {editedSection.references.map((ref, index) => (
            <ListItem key={index}>
              <ListItemText primary={ref} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveReference(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Available Ideas and Research
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {ideas.ideas.map((idea, index) => (
            <Chip
              key={`idea-${index}`}
              label={idea}
              onClick={() => setNewReference(idea)}
              variant="outlined"
              size="small"
            />
          ))}
          {ideas.relatedTopics.map((topic, index) => (
            <Chip
              key={`topic-${index}`}
              label={topic}
              onClick={() => setNewReference(topic)}
              variant="outlined"
              size="small"
              color="primary"
            />
          ))}
          {ideas.researchAreas.map((research, index) => (
            <Chip
              key={`research-${index}`}
              label={research}
              onClick={() => setNewReference(research)}
              variant="outlined"
              size="small"
              color="secondary"
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
} 