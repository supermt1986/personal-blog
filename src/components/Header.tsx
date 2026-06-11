import Link from 'next/link'

export default function Header() {
  return (
    <header style={{ padding: '1rem 0', borderBottom: '1px solid #E5E7EB' }}>
      <div className="container">
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Blog
          </Link>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/categories">カテゴリ</Link>
            <Link href="/tags">タグ</Link>
            <Link href="/admin">管理</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}