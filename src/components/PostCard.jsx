import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ConfirmModal from './ConfirmModal'

function PostCard({ post, onDelete }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const isAuthor = user && user.id === post.user_id

  async function handleDelete() {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)

      if (error) throw error
      
      if (onDelete) {
        onDelete(post.id)
      }
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post. Please try again.')
    }
  }

  return (
    <>
      <div className="post-card">
        <div className="post-card-header">
          {post.images && post.images.length > 0 ? (
            <div className="post-card-header-with-image">
              <div className="post-card-info">
                <h2>{post.title}</h2>
                <div className="post-interests">
                  {post.interests.map(interest => (
                    <span key={interest} className="interest-tag">
                      {interest}
                    </span>
                  ))}
                </div>
                <p className="post-meta">
                  {format(new Date(post.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="post-card-image-container">
                <img
                  src={post.images[0]}
                  alt={post.title}
                  className="post-card-image"
                />
              </div>
            </div>
          ) : (
            <div className="post-card-info">
              <h2>{post.title}</h2>
              <div className="post-interests">
                {post.interests.map(interest => (
                  <span key={interest} className="interest-tag">
                    {interest}
                  </span>
                ))}
              </div>
              <p className="post-meta">
                {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          )}
        </div>
        <div className="post-card-content">
          <p className="post-excerpt">{post.excerpt}</p>
          <div className="post-actions">
            <Link to={`/post/${post.id}`} className="read-more">
              Read More
            </Link>
            {isAuthor && (
              <>
                <Link to={`/edit/${post.id}`} className="edit-post">
                  Edit
                </Link>
                <button 
                  onClick={() => setShowDeleteModal(true)} 
                  className="delete-post"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
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

export default PostCard 