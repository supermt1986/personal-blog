const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface Post {
  postId: string
  title: string
  content: string
  featuredImage?: string
  categoryId: string
  tags: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface Category {
  categoryId: string
  name: string
  slug: string
}

interface Tag {
  tagId: string
  name: string
  slug: string
}

interface Comment {
  commentId: string
  author: string
  content: string
  isApproved: boolean
  createdAt: string
}

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/posts`)
  return res.json()
}

export async function getPost(id: string): Promise<Post | null> {
  const res = await fetch(`${API_BASE}/posts/${id}`)
  return res.ok ? res.json() : null
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`)
  return res.json()
}

export async function getTags(): Promise<Tag[]> {
  const res = await fetch(`${API_BASE}/tags`)
  return res.json()
}

export async function getComments(postId: string): Promise<Comment[]> {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`)
  return res.json()
}

export async function createComment(postId: string, author: string, content: string): Promise<void> {
  await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, content })
  })
}