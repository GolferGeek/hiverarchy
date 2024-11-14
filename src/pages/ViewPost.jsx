import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import MDEditor from '@uiw/react-md-editor'
import { supabase } from '../lib/supabase'
import CommentList from '../components/CommentList'

function ViewPost() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [id])

  async function fetchPost() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setPost(data)
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading post...</p>
  if (!post) return <p>Post not found</p>

  return (
    <div className="view-post">
      <h1>{post.title}</h1>
      <p className="post-meta">
        {format(new Date(post.created_at), 'MMMM d, yyyy')}
      </p>
      {post.images && post.images.length > 0 && (
        <div className="post-images">
          {post.images.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Post image ${index + 1}`}
              className="post-image"
            />
          ))}
        </div>
      )}
      <div className="post-content">
        <MDEditor.Markdown source={post.content} />
      </div>
      <div className="post-actions">
        <Link to={`/edit/${post.id}`} className="edit-btn">
          Edit Post
        </Link>
        <Link to={`/${post.category}`} className="back-btn">
          Back to {post.category} posts
        </Link>
      </div>
      <CommentList postId={post.id} />
    </div>
  )
}

export default ViewPost 