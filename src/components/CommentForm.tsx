'use client'

import { useState } from 'react'

export default function CommentForm({ postId }: { postId: string }) {
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content })
      })

      if (!res.ok) {
        throw new Error('コメントの投稿に失敗しました')
      }

      setAuthor('')
      setContent('')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コメントの投稿に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>コメントを投稿</h3>

      {showSuccess && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#ECFDF5', borderRadius: '8px', color: '#065F46' }}>
          コメントを投稿しました。承認後に表示されます。
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#FEF2F2', borderRadius: '8px', color: '#991B1B' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>名前</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>コメント</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            disabled={isLoading}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px' }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '0.75rem 1.5rem',
            background: isLoading ? '#9CA3AF' : 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: '500'
          }}
        >
          {isLoading ? '投稿中...' : '投稿する'}
        </button>
      </div>
    </form>
  )
}