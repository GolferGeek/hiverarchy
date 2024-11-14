import { Link } from 'react-router-dom'
import { format } from 'date-fns'

function PostCard({ post }) {
  return (
    <div className="post-card">
      <h2>{post.title}</h2>
      <div className="post-categories">
        {post.categories.map(category => (
          <span key={category} className="category-tag">
            {category}
          </span>
        ))}
      </div>
      <p className="post-meta">
        {format(new Date(post.created_at), 'MMMM d, yyyy')}
      </p>
      <p className="post-excerpt">{post.excerpt}</p>
      <div className="post-actions">
        <Link to={`/post/${post.id}`} className="read-more">
          Read More
        </Link>
        <Link to={`/edit/${post.id}`} className="edit-post">
          Edit
        </Link>
      </div>
    </div>
  )
}

export default PostCard 