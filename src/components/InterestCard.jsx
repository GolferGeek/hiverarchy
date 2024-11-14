import { Link } from 'react-router-dom'

function InterestCard({ title, description, image, link }) {
  return (
    <div className="interest-card">
      <img src={image} alt={title} className="interest-image" />
      <h2>{title}</h2>
      <p>{description}</p>
      <Link to={link} className="interest-link">
        View Posts
      </Link>
    </div>
  )
}

export default InterestCard 