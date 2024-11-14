import { Link } from 'react-router-dom'
import { useState } from 'react'

function InterestCard({ title, description, image, link }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="interest-card">
      <img 
        src={image} 
        alt={title} 
        className="interest-image"
        onError={(e) => {
          console.error(`Failed to load image for ${title}:`, image);
          setImageError(true);
          e.target.style.display = 'none';
        }}
      />
      <h2>{title}</h2>
      <p>{description}</p>
      <Link to={link} className="interest-link">
        View Posts
      </Link>
    </div>
  )
}

export default InterestCard 