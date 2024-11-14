import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Comment from './Comment'

function CommentList({ postId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [postId])

  async function fetchComments() {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, user:user_id(email)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data.map(comment => ({
        ...comment,
        user_email: comment.user.email
      })))
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            content: newComment,
            post_id: postId,
            user_id: user.id
          }
        ])

      if (error) throw error

      setNewComment('')
      fetchComments()
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Error adding comment. Please try again.')
    }
  }

  async function handleDelete(commentId) {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      setComments(comments.filter(comment => comment.id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Error deleting comment. Please try again.')
    }
  }

  if (loading) return <p>Loading comments...</p>

  return (
    <div className="comments-section">
      <h2>Comments</h2>
      
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            required
          />
          <button type="submit">Add Comment</button>
        </form>
      ) : (
        <p>Please log in to comment.</p>
      )}

      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </div>
  )
}

export default CommentList 