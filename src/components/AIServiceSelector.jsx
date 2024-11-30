import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useAI, AI_SERVICE_NAMES } from '../services/ai'

export default function AIServiceSelector() {
  const { currentService, setCurrentService, services } = useAI()

  const handleChange = (event) => {
    setCurrentService(event.target.value)
  }

  return (
    <FormControl fullWidth size="small">
      <InputLabel>AI Service</InputLabel>
      <Select
        value={currentService}
        label="AI Service"
        onChange={handleChange}
      >
        {Object.entries(services).map(([key]) => (
          <MenuItem key={key} value={key}>
            {AI_SERVICE_NAMES[key] || key}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
} 