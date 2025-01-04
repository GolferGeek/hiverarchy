const fetchPost = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:user_id (
          email
        ),
        images (
          url
        )
      `)
      .eq('id', postId)
      .single()

    if (error) throw error

    setPost(data)
    setLoading(false)
  } catch (error) {
    console.error('Error fetching post:', error)
    setError('Failed to load post')
    setLoading(false)
  }
} 