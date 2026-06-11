import Image from 'next/image'

interface Post {
  title: string
  content: string
  featuredImage?: string
  createdAt: string
}

export default function PostContent({ post }: { post: Post }) {
  return (
    <article>
      {post.featuredImage && (
        <div style={{ position: 'relative', width: '100%', height: '70vh', marginBottom: '2rem' }}>
          <Image src={post.featuredImage} alt={post.title} fill style={{ objectFit: 'cover' }} priority />
        </div>
      )}
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{post.title}</h1>
        <time style={{ color: 'var(--color-muted)' }}>
          {new Date(post.createdAt).toLocaleDateString('ja-JP')}
        </time>
      </header>
      <div style={{ fontSize: '1.125rem', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}