import Link from 'next/link'
import { getPosts } from '@/lib/api'
import PostCard from '@/components/PostCard'

export const revalidate = 60

export default async function HomePage() {
  let posts: any[] = []
  try {
    posts = await getPosts()
  } catch (e) {
    console.error('Failed to fetch posts:', e)
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h1>Latest Articles</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
          {posts.map((post) => (
            <PostCard key={post.postId} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}