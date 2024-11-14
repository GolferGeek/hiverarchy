import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'

function Comment({ comment, onDelete }) {
  const { user } = useAuth()
  const isAuthor = user && user.id === comment.user_id

  return (
    <div className="comment">
      <div className="comment-header">
        <span className="comment-author">{comment.user_email}</span>
        <span className="comment-date">
          {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
        </span>
      </div>
      <p className="comment-content">{comment.content}</p>
      {isAuthor && (
        <button onClick={() => onDelete(comment.id)} className="delete-comment">
          Delete
        </button>
      )}
    </div>
  )
}

export default Comment 