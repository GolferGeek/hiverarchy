import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { supabase } from '../lib/supabase'
import ImageUpload from '../components/ImageUpload'
import { useAuth } from '../contexts/AuthContext'

function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [interests, setInterests] = useState(['coder'])
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])

  const availableInterests = [
    { value: 'coder', label: 'Coder' },
    { value: 'golfer', label: 'Golfer' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'aging', label: 'Aging' }
  ]

  function handleInterestChange(e) {
    const value = e.target.value
    setInterests(prev => {
      if (e.target.checked) {
        return [...prev, value]
      } else {
        return prev.filter(int => int !== value)
      }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (interests.length === 0) {
      alert('Please select at least one interest')
      return
    }

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title,
            content,
            excerpt,
            interests,
            images,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error
      navigate(`/post/${data.id}`)
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Error creating post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleImageUpload(url) {
    setImages([...images, url])
  }

  return (
    <div className="create-post">
      <h1>Create New Post</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Interests</label>
          <div className="interests-group">
            {availableInterests.map(({ value, label }) => (
              <label key={value} className="interest-checkbox">
                <input
                  type="checkbox"
                  value={value}
                  checked={interests.includes(value)}
                  onChange={handleInterestChange}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Write a brief summary of your post..."
            maxLength={150}
            rows={3}
            required
          />
          <small className="character-count">
            {excerpt.length}/150 characters
          </small>
        </div>

        <div className="form-group">
          <label>Content</label>
          <MDEditor
            value={content}
            onChange={setContent}
            preview="edit"
            height={400}
          />
        </div>

        <div className="form-group">
          <label>Images</label>
          <ImageUpload onUpload={handleImageUpload} />
          <div className="image-preview">
            {images.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`Upload ${index + 1}`}
                className="preview-image"
              />
            ))}
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  )
}

export default CreatePost 