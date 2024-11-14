import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import MDEditor from '@uiw/react-md-editor'
import { supabase } from '../lib/supabase'
import CommentList from '../components/CommentList'
import ConfirmModal from '../components/ConfirmModal'
import { useAuth } from '../contexts/AuthContext'

function ViewPost() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const isAuthor = user && post && user.id === post.user_id

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

  async function handleDelete() {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      navigate(`/${post.interests[0]}`)
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post. Please try again.')
    }
  }

  if (loading) return <p>Loading post...</p>
  if (!post) return <p>Post not found</p>

  return (
    <>
      <div className="view-post">
        <h1>{post.title}</h1>
        <p className="post-meta">
          {format(new Date(post.created_at), 'MMMM d, yyyy')}
        </p>
        <div className="post-interests">
          {post.interests.map(interest => (
            <span key={interest} className="interest-tag">
              {interest}
            </span>
          ))}
        </div>
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
          {isAuthor && (
            <>
              <Link to={`/edit/${post.id}`} className="edit-btn">
                Edit Post
              </Link>
              <button 
                onClick={() => setShowDeleteModal(true)} 
                className="delete-btn"
              >
                Delete Post
              </button>
            </>
          )}
          <Link to={`/${post.interests[0]}`} className="back-btn">
            Back to {post.interests[0]} posts
          </Link>
        </div>
        <CommentList postId={post.id} />
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        message="Are you sure you want to delete this post? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  )
}

export default ViewPost 