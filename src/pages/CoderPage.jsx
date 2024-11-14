import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SearchBar from '../components/SearchBar'
import PostCard from '../components/PostCard'

function CoderPage() {
  const [posts, setPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [searchTerm])

  async function fetchPosts() {
    try {
      setLoading(true)
      let query = supabase
        .from('posts')
        .select('*')
        .eq('category', 'coder')
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

  return (
    <div>
      <h1>Coding Posts</h1>
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="post-list">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <p>No posts found</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CoderPage 