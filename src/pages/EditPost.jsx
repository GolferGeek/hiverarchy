import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ImageUpload from '../components/ImageUpload'

function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState([])
  const { user } = useAuth()

  const availableInterests = [
    { value: 'coder', label: 'Coder' },
    { value: 'golfer', label: 'Golfer' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'aging', label: 'Aging' }
  ]

  useEffect(() => {
    fetchPost()
  }, [id])

  async function fetchPost() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setTitle(data.title)
      setContent(data.content)
      setExcerpt(data.excerpt)
      setInterests(data.interests)
      setImages(data.images || [])
    } catch (error) {
      console.error('Error fetching post:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

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

  function handleImageUpload(url) {
    setImages([...images, url])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (interests.length === 0) {
      alert('Please select at least one interest')
      return
    }

    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('posts')
        .update({
          title,
          content,
          excerpt,
          interests,
          images,
          user_id: user.id
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      navigate(`/post/${id}`)
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Error updating post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading post...</p>

  return (
    <div className="create-post">
      <h1>Edit Post</h1>
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
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

export default EditPost 