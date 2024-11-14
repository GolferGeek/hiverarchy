import InterestCard from '../components/InterestCard'

const interests = [
  {
    title: 'Coder',
    description: 'Exploring the world of programming and software development',
    image: '/images/coder.jpg',
    link: '/coder'
  },
  {
    title: 'Golfer',
    description: 'Sharing golf experiences, tips, and achievements',
    image: '/images/golfer.jpg',
    link: '/golfer'
  },
  {
    title: 'Mentor',
    description: 'Guiding and supporting others in their journey',
    image: '/images/mentor.jpg',
    link: '/mentor'
  },
  {
    title: 'Aging',
    description: 'Insights and reflections on the aging process',
    image: '/images/aging.jpg',
    link: '/aging'
  }
]

function Home() {
  return (
    <div>
      <h1>Welcome to GG Blog</h1>
      <div className="card-grid">
        {interests.map((interest) => (
          <InterestCard
            key={interest.title}
            title={interest.title}
            description={interest.description}
            image={interest.image}
            link={interest.link}
          />
        ))}
      </div>
    </div>
  )
}

export default Home 