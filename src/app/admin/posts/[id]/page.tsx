'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, isPublished })
    })
    router.push('/admin/posts')
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
        <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          保存
        </button>
      </form>
    </div>
  )
}
