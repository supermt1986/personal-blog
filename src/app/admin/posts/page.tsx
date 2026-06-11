'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Post {
  postId: string
  title: string
  isPublished: boolean
  createdAt: string
}

export default function AdminPostsPage() {
  const [postList, setPostList] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
        const res = await fetch(`${API_BASE}/posts`)
        if (res.ok) {
          const data = await res.json()
          setPostList(data)
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const handleDelete = (postId: string, title: string) => {
    if (window.confirm(`「${title}」を削除してもよろしいですか？`)) {
      setPostList(postList.filter(p => p.postId !== postId))
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>記事管理</h1>
        <Link href="/admin/posts/new" style={{ padding: '0.75rem 1.5rem', background: 'var(--color-accent)', color: 'white', borderRadius: '6px' }}>
          新規作成
        </Link>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>タイトル</th>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>ステータス</th>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>作成日</th>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {postList.map((post) => (
            <tr key={post.postId} style={{ borderBottom: '1px solid #E5E7EB' }}>
              <td style={{ padding: '0.75rem' }}>{post.title}</td>
              <td style={{ padding: '0.75rem' }}>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', background: post.isPublished ? '#ECFDF5' : '#FEF3C7', color: post.isPublished ? '#065F46' : '#92400E' }}>
                  {post.isPublished ? '公開' : '下書き'}
                </span>
              </td>
              <td style={{ padding: '0.75rem', color: 'var(--color-muted)' }}>
                {new Date(post.createdAt).toLocaleDateString('ja-JP')}
              </td>
              <td style={{ padding: '0.75rem' }}>
                <Link href={`/admin/posts/${post.postId}`} style={{ marginRight: '1rem' }}>編集</Link>
                <button onClick={() => handleDelete(post.postId, post.title)} style={{ color: '#DC2626' }}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
