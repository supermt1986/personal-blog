import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '240px', padding: '1.5rem', background: '#F9FAFB', borderRight: '1px solid #E5E7EB' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>管理画面</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link href="/admin">ダッシュボード</Link>
          <Link href="/admin/posts">記事管理</Link>
          <Link href="/admin/categories">カテゴリ</Link>
          <Link href="/admin/tags">タグ</Link>
          <Link href="/admin/comments">コメント</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  )
}
