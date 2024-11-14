import { useState } from 'react'
import { supabase } from '../lib/supabase'

function ImageUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false)

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

      onUpload(publicUrl)
    } catch (error) {
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="image-upload">
      <label className="upload-button">
        {uploading ? 'Uploading...' : 'Upload Image'}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  )
}

export default ImageUpload 