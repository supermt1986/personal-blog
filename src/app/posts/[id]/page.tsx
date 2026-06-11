import { notFound } from 'next/navigation'
import { getPost, getPosts, getComments } from '@/lib/api'
import PostContent from '@/components/PostContent'
import CommentList from '@/components/CommentList'
import CommentForm from '@/components/CommentForm'

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const posts = await getPosts()
    return posts.map((post) => ({ id: post.postId }))
  } catch {
    return []
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  let post = null
  let comments: any[] = []

  try {
    post = await getPost(params.id)
  } catch (e) {
    console.error('Failed to fetch post:', e)
  }

  if (!post) notFound()

  try {
    comments = await getComments(params.id)
  } catch (e) {
    console.error('Failed to fetch comments:', e)
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <PostContent post={post} />
      <CommentList comments={comments} />
      <CommentForm postId={params.id} />
    </div>
  )
}