import { notFound } from 'next/navigation'
import { getPost, getComments } from '@/lib/api'
import PostContent from '@/components/PostContent'
import CommentList from '@/components/CommentList'
import CommentForm from '@/components/CommentForm'

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)
  if (!post) notFound()

  const comments = await getComments(params.id)

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <PostContent post={post} />
      <CommentList comments={comments} />
      <CommentForm postId={params.id} />
    </div>
  )
}