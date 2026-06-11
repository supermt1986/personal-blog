'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function generateStaticParams() {
  return []
}

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
        const res = await fetch(`${API_BASE}/posts/${params.id}`)
        if (res.ok) {
          const post = await res.json()
          setTitle(post.title)
          setContent(post.content)
          setIsPublished(post.isPublished)
        }
      } catch (error) {
        console.error('Failed to fetch post:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPost()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, isPublished })
      })
      if (!res.ok) {
        throw new Error('更新に失敗しました')
      }
      router.push('/admin/posts')
    } catch (error) {
      setError(error instanceof Error ? error.message : '更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>記事編集</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>タイトル</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>本文</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={20} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            公開する
          </label>
        </div>
        {error && <p style={{ color: '#DC2626', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  )
}
