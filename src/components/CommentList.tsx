interface Comment {
  commentId: string
  author: string
  content: string
  createdAt: string
}

export default function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <section style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #E5E7EB' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>コメント ({comments.length})</h2>
      {comments.length === 0 ? (
        <p style={{ color: 'var(--color-muted)' }}>コメントはまだありません</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {comments.map((comment) => (
            <div key={comment.commentId} style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>{comment.author}</strong>
                <time style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                  {new Date(comment.createdAt).toLocaleDateString('ja-JP')}
                </time>
              </div>
              <p style={{ margin: 0 }}>{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}