import { useState } from 'react'
import { 
  Autocomplete, 
  TextField, 
  Chip
} from '@mui/material'

export default function TagSelector({ tags = [], onChange }) {
  const [inputValue, setInputValue] = useState('')

  const handleChange = (event, newValue) => {
    // newValue will be an array of strings
    onChange(newValue)
  }

  return (
    <Autocomplete
      multiple
      id="tags-filled"
      options={[]} // We don't need predefined options since we're using freeSolo
      value={tags}
      onChange={handleChange}
      freeSolo
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={option}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="Tags"
          placeholder="Add tags"
          helperText="Type and press Enter to add tags"
        />
      )}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
    />
  )
}
