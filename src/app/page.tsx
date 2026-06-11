import Link from 'next/link'
import { getPosts } from '@/lib/api'
import PostCard from '@/components/PostCard'

export default async function HomePage() {
  const posts = await getPosts()

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h1>Latest Articles</h1>
      <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
        {posts.map((post) => (
          <PostCard key={post.postId} post={post} />
        ))}
      </div>
    </div>
  )
}