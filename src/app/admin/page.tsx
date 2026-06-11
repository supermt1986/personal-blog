import { getPosts, getCategories } from '@/lib/api'

export const revalidate = 60

export default async function AdminDashboard() {
  let posts: any[] = []
  let categories: any[] = []

  try {
    posts = await getPosts()
  } catch (e) {
    console.error('Failed to fetch posts:', e)
  }

  try {
    categories = await getCategories()
  } catch (e) {
    console.error('Failed to fetch categories:', e)
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>ダッシュボード</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }}>記事数</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{posts.length}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }}>カテゴリ数</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{categories.length}</p>
        </div>
      </div>
    </div>
  )
}
