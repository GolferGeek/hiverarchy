import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SearchBar from './SearchBar'
import PostCard from './PostCard'

function InterestPage({ category, title }) {
  const [posts, setPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [searchTerm, category])

  async function fetchPosts() {
    try {
      setLoading(true)
      let query = supabase
        .from('posts')
        .select('*')
        .contains('interests', [category])
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`)
        query = query.limit(10)
      } else {
        query = query.limit(4)
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostDelete = async (postId) => {
    setPosts(posts.filter(post => post.id !== postId))
    await fetchPosts()
  }

  return (
    <div>
      <h1>{title}</h1>
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="post-list">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={handlePostDelete} 
              />
            ))
          ) : (
            <p>No posts found</p>
          )}
        </div>
      )}
    </div>
  )
}

export default InterestPage 