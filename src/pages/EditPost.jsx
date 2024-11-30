import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Box, TextField, Button, Container, Paper, Typography } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import MarkdownEditor from '../components/MarkdownEditor'
import WriterButton from '../components/WriterButton'

export default function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPost()
  }, [id])

  const getPost = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setPost(data)
      setTitle(data.title)
      setContent(data.content)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const { error } = await supabase
        .from('posts')
        .update({ title, content })
        .eq('id', id)

      if (error) throw error

      navigate(-1)
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Post
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <WriterButton postId={id} />
          </Box>
        </Box>

        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
          />

          <Box sx={{ mt: 2 }}>
            <MarkdownEditor
              value={content}
              onChange={setContent}
            />
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}