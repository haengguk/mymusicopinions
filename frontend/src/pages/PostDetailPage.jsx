import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Calendar, MessageSquare, Heart, ArrowRight } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })

export default function PostDetailPage() {
    const { postId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)

    useEffect(() => {
        fetchPost()
        fetchComments()
    }, [postId])

    const fetchPost = async () => {
        try {
            const res = await api.get(`/api/board/${postId}`)
            setPost(res.data)
        } catch (err) {
            console.error(err)
            setError('게시글을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const fetchComments = async () => {
        try {
            const res = await api.get(`/api/board/${postId}/comments`)
            setComments(res.data.content || res.data)
        } catch (err) {
            console.error('Failed to fetch comments', err)
        }
    }

    const handlePostLike = async () => {
        if (!user) {
            alert('로그인이 필요합니다.')
            return
        }

        const previousPost = { ...post }
        setPost((prev) => ({
            ...prev,
            likeCount: (prev.likeCount || 0) + 1,
        }))

        try {
            await api.post(`/api/board/${postId}/like`)
            fetchPost()
        } catch (err) {
            console.error(err)
            alert('좋아요 처리에 실패했습니다.')
            setPost(previousPost)
        }
    }

    const handleCommentLike = async (commentId) => {
        if (!user) {
            alert('로그인이 필요합니다.')
            return
        }

        const previousComments = [...comments]
        setComments((prev) =>
            prev.map((comment) =>
                comment.id === commentId
                    ? { ...comment, likeCount: (comment.likeCount || 0) + 1 }
                    : comment
            )
        )

        try {
            await api.post(`/api/board/${postId}/comments/${commentId}/like`)
            fetchComments()
        } catch (err) {
            console.error(err)
            alert('댓글 좋아요 처리에 실패했습니다.')
            setComments(previousComments)
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()

        if (!newComment.trim()) return
        if (!user) {
            alert('로그인이 필요합니다.')
            return
        }

        const tempId = Date.now()
        const optimisticComment = {
            id: tempId,
            content: newComment,
            username: user.username || '나',
            createdAt: new Date().toISOString(),
            likeCount: 0,
        }

        setComments((prev) => [...prev, optimisticComment])
        const commentToSubmit = newComment
        setNewComment('')
        setCommentLoading(true)

        try {
            await api.post(`/api/board/${postId}/comments`, {
                comment: commentToSubmit,
            })
            fetchComments()
        } catch (err) {
            console.error(err)
            alert('댓글 작성에 실패했습니다.')
            setComments((prev) => prev.filter((comment) => comment.id !== tempId))
            setNewComment(commentToSubmit)
        } finally {
            setCommentLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent px-6 pt-28 text-center text-[var(--mmo-muted)]">
                게시글을 불러오는 중입니다.
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-transparent px-6 pt-28 text-center text-[var(--mmo-muted)]">
                {error}
            </div>
        )
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-transparent px-6 pt-28 text-center text-[var(--mmo-muted)]">
                게시글을 찾을 수 없습니다.
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent pb-16 pt-24 text-[var(--mmo-ink)]">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14">
                    <aside className="h-fit lg:sticky lg:top-28">
                        <button
                            onClick={() => navigate('/board')}
                            className="inline-flex items-center gap-2 border-b border-[color:var(--mmo-rule)] pb-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors hover:text-[var(--mmo-ink)]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            목록으로
                        </button>

                        <p className="mt-8 text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                            {post.category === 'RECOMMEND' ? 'Song pick' : 'Community note'}
                        </p>
                        <h1 className="font-display balance-keep mt-4 max-w-[10ch] text-[2.8rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--mmo-ink)] sm:text-[3.2rem]">
                            {post.title}
                        </h1>

                        <div className="mt-8 space-y-4 border-t border-[color:var(--mmo-rule)] pt-5 text-sm leading-7 text-[var(--mmo-muted)]">
                            <div className="inline-flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {post.username || '익명'}
                            </div>
                            <div className="inline-flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {formatDate(post.createdAt)}
                            </div>
                            <div className="inline-flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                댓글 {comments.length}
                            </div>
                        </div>

                        <div className="mt-8 border-t border-[color:var(--mmo-rule)] pt-5">
                            <button
                                type="button"
                                onClick={handlePostLike}
                                className="inline-flex items-center gap-2 border-b border-[color:var(--mmo-rule)] pb-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors hover:text-[var(--mmo-ink)]"
                            >
                                <Heart className={`h-4 w-4 ${post.likeCount > 0 ? 'fill-current text-[var(--mmo-accent)]' : ''}`} />
                                좋아요 {post.likeCount || 0}
                            </button>
                        </div>

                        {post.songTitle && (
                            <button
                                type="button"
                                onClick={() => navigate(`/songs/${post.songId}`)}
                                className="group mt-8 w-full border-t border-[color:var(--mmo-rule)] pt-5 text-left"
                            >
                                <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                    연결된 곡
                                </div>
                                <div className="mt-4 flex items-center gap-4">
                                    {post.songImageUrl ? (
                                        <img
                                            src={post.songImageUrl}
                                            alt={post.songTitle}
                                            className="h-20 w-20 shrink-0 object-cover"
                                        />
                                    ) : null}
                                    <div className="min-w-0">
                                        <div className="truncate text-xl font-semibold text-[var(--mmo-ink)]">
                                            {post.songTitle}
                                        </div>
                                        <div className="truncate text-sm text-[var(--mmo-muted)]">
                                            {post.songArtist}
                                        </div>
                                        <div className="mt-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors group-hover:text-[var(--mmo-ink)]">
                                            곡 보기
                                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}
                    </aside>

                    <section className="border-t border-[color:var(--mmo-rule)] pt-8">
                        <div className="border-b border-[color:var(--mmo-rule)] pb-8">
                            <p className="max-w-3xl whitespace-pre-wrap text-[1.05rem] leading-9 text-[var(--mmo-ink)]">
                                {post.content}
                            </p>
                        </div>

                        <div className="pt-8">
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                                        Comments
                                    </p>
                                    <h2 className="font-display mt-3 text-[2.3rem] font-bold tracking-[-0.05em] text-[var(--mmo-ink)] md:text-[3rem]">
                                        댓글
                                    </h2>
                                </div>

                                <div className="text-sm leading-7 text-[var(--mmo-muted)]">
                                    현재 {comments.length}개 댓글이 표시됩니다.
                                </div>
                            </div>

                            <form onSubmit={handleAddComment} className="mt-8 border-y border-[color:var(--mmo-rule)] py-6">
                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_130px] lg:items-end">
                                    <div>
                                        <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                            Add comment
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-4 w-full border-b border-[color:var(--mmo-rule)] bg-transparent px-0 py-3 text-base text-[var(--mmo-ink)] outline-none placeholder:text-[#988d82]"
                                            placeholder={user ? '댓글을 입력하세요.' : '로그인이 필요합니다.'}
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            disabled={!user || commentLoading}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!user || commentLoading || !newComment.trim()}
                                        className="inline-flex items-center justify-center gap-2 border-b-2 border-[var(--mmo-ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)] disabled:text-[var(--mmo-muted)]"
                                    >
                                        {commentLoading ? '등록 중' : '등록'}
                                    </button>
                                </div>
                            </form>

                            <div className="border-b border-[color:var(--mmo-rule)]">
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="grid gap-5 border-t border-[color:var(--mmo-rule)] py-6 lg:grid-cols-[170px_minmax(0,1fr)]"
                                        >
                                            <div className="text-sm leading-7 text-[var(--mmo-muted)]">
                                                <div>{comment.username || '익명'}</div>
                                                <div>{formatDate(comment.createdAt)}</div>
                                            </div>

                                            <div>
                                                <p className="whitespace-pre-wrap text-base leading-8 text-[var(--mmo-ink)]">
                                                    {comment.content}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCommentLike(comment.id)}
                                                    className="mt-4 inline-flex items-center gap-2 border-b border-[color:var(--mmo-rule)] pb-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors hover:text-[var(--mmo-ink)]"
                                                >
                                                    <Heart className={`h-4 w-4 ${comment.likeCount > 0 ? 'fill-current text-[var(--mmo-accent)]' : ''}`} />
                                                    좋아요 {comment.likeCount || 0}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-16 text-center text-[var(--mmo-muted)]">
                                        아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
