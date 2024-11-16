import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, Snackbar } from '@mui/material'

function ImageUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false)
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [url, setUrl] = useState('')

  async function handleUpload(event) {
    try {
      setUploading(true)

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath)

      setUrl(publicUrl)
      onUpload(publicUrl)
    } catch (error) {
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url)
    setShowCopySuccess(true)
  }

  return (
    <div className="image-upload">
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Button
          variant="contained"
          component="label"
          disabled={uploading}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            hidden
          />
        </Button>
        {url && (
          <Button
            variant="outlined"
            onClick={handleCopyUrl}
            size="small"
          >
            Click to Copy URL
          </Button>
        )}
      </div>
      <Snackbar
        open={showCopySuccess}
        autoHideDuration={2000}
        onClose={() => setShowCopySuccess(false)}
        message="URL copied to clipboard!"
      />
    </div>
  )
}

export default ImageUpload