import Link from 'next/link'
import Image from 'next/image'

interface Post {
  postId: string
  title: string
  featuredImage?: string
  createdAt: string
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <article style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
      {post.featuredImage && (
        <div style={{ position: 'relative', height: '200px' }}>
          <Image src={post.featuredImage} alt={post.title} fill style={{ objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '1.5rem' }}>
        <time style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
          {new Date(post.createdAt).toLocaleDateString('ja-JP')}
        </time>
        <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
          <Link href={`/posts/${post.postId}`}>{post.title}</Link>
        </h2>
      </div>
    </article>
  )
}