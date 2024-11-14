import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to GolferGeek</h1>
          <p className="hero-subtitle">Exploring the intersections of technology, golf, mentorship, and life's journey</p>
        </div>
      </section>

      {/* Coder Section */}
      <section className="content-section coder-section">
        <div className="section-content">
          <div className="section-text">
            <h2>Coding Journey</h2>
            <p>Exploring the world of programming and software development</p>
            <Link to="/coder" className="section-link">View Coding Posts</Link>
          </div>
          <div className="section-image">
            <img src="/gg-blog/images/coder.jpg" alt="Coding" />
          </div>
        </div>
      </section>

      {/* Golfer Section */}
      <section className="content-section golfer-section">
        <div className="section-content reverse">
          <div className="section-image">
            <img src="/gg-blog/images/golfer.jpg" alt="Golf" />
          </div>
          <div className="section-text">
            <h2>Golf Adventures</h2>
            <p>Sharing golf experiences, tips, and achievements</p>
            <Link to="/golfer" className="section-link">View Golf Posts</Link>
          </div>
        </div>
      </section>

      {/* Mentor Section */}
      <section className="content-section mentor-section">
        <div className="section-content">
          <div className="section-text">
            <h2>Mentorship</h2>
            <p>Guiding and supporting others in their journey</p>
            <Link to="/mentor" className="section-link">View Mentoring Posts</Link>
          </div>
          <div className="section-image">
            <img src="/gg-blog/images/mentor.jpg" alt="Mentoring" />
          </div>
        </div>
      </section>

      {/* Aging Section */}
      <section className="content-section aging-section">
        <div className="section-content reverse">
          <div className="section-image">
            <img src="/gg-blog/images/aging.jpg" alt="Aging" />
          </div>
          <div className="section-text">
            <h2>Life's Journey</h2>
            <p>Insights and reflections on the aging process</p>
            <Link to="/aging" className="section-link">View Aging Posts</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home 