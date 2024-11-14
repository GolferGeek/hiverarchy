import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">GolferGeek</Link>
        <div className="nav-links">
          <Link to="/coder">Coder</Link>
          <Link to="/golfer">Golfer</Link>
          <Link to="/mentor">Mentor</Link>
          <Link to="/aging">Aging</Link>
          {user ? (
            <>
              <Link to="/create" className="create-post-btn">Create Post</Link>
              <button onClick={signOut} className="logout-btn">Logout</button>
            </>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar 