import { useState, useEffect } from 'react'
import { Save, AlertCircle, MessageSquare, Star, Calendar, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })

const truncate = (text, limit = 90) => {
    if (!text) return ''
    return text.length > limit ? `${text.slice(0, limit)}...` : text
}

export default function ProfilePage() {
    const navigate = useNavigate()

    const [userInfo, setUserInfo] = useState({
        username: '',
        bio: '',
    })
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [activeTab, setActiveTab] = useState('reviews')
    const [myReviews, setMyReviews] = useState([])
    const [myPosts, setMyPosts] = useState([])

    useEffect(() => {
        fetchUserInfo()
        fetchMyActivity()
    }, [])

    const fetchUserInfo = async () => {
        try {
            const res = await api.get('/api/users/me')
            setUserInfo({
                username: res.data.username,
                bio: res.data.bio || '',
            })
        } catch (err) {
            console.error('Failed to fetch user info', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchMyActivity = async () => {
        try {
            const [reviewsRes, postsRes] = await Promise.all([
                api.get('/api/users/me/reviews'),
                api.get('/api/users/me/posts'),
            ])
            setMyReviews(reviewsRes.data)
            setMyPosts(postsRes.data)
        } catch (err) {
            console.error('Failed to fetch activity', err)
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setMessage({ type: '', text: '' })

        try {
            await api.put('/api/users/me', {
                bio: userInfo.bio,
                password: password || undefined,
            })
            setMessage({ type: 'success', text: '정보가 성공적으로 수정되었습니다.' })
            setPassword('')
        } catch (err) {
            console.error(err)
            setMessage({ type: 'error', text: '정보 수정에 실패했습니다.' })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent px-6 pt-28 text-center text-[var(--mmo-muted)]">
                마이페이지를 불러오는 중입니다.
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent pb-16 pt-24 text-[var(--mmo-ink)]">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14">
                    <aside className="h-fit lg:sticky lg:top-28">
                        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                            My page
                        </p>
                        <h1 className="font-display balance-keep mt-4 max-w-[10ch] text-[2.8rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--mmo-ink)] sm:text-[3.2rem]">
                            {userInfo.username}
                        </h1>

                        <div className="mt-8 flex h-28 w-28 items-center justify-center border border-[color:var(--mmo-rule)] bg-[var(--mmo-paper-deep)] text-4xl font-extrabold text-[var(--mmo-ink)]">
                            {userInfo.username?.charAt(0)?.toUpperCase() || 'M'}
                        </div>

                        <div className="mt-6 space-y-4 border-t border-[color:var(--mmo-rule)] pt-5 text-sm leading-7 text-[var(--mmo-muted)]">
                            <div>{userInfo.bio || '아직 소개글이 없습니다.'}</div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[color:var(--mmo-rule)] pt-5">
                            <div>
                                <div className="font-display text-[2.3rem] font-bold leading-none tracking-[-0.05em] text-[var(--mmo-ink)]">
                                    {myReviews.length}
                                </div>
                                <div className="mt-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                    Reviews
                                </div>
                            </div>
                            <div>
                                <div className="font-display text-[2.3rem] font-bold leading-none tracking-[-0.05em] text-[var(--mmo-ink)]">
                                    {myPosts.length}
                                </div>
                                <div className="mt-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                    Posts
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="space-y-12 border-t border-[color:var(--mmo-rule)] pt-8">
                        <section>
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                                        Profile
                                    </p>
                                    <h2 className="font-display mt-3 text-[2.3rem] font-bold tracking-[-0.05em] text-[var(--mmo-ink)] md:text-[3rem]">
                                        내 정보 수정
                                    </h2>
                                </div>
                                <div className="text-sm leading-7 text-[var(--mmo-muted)]">
                                    닉네임은 변경할 수 없고 소개글과 비밀번호만 수정할 수 있습니다.
                                </div>
                            </div>

                            <form onSubmit={handleUpdate} className="mt-8">
                                <div className="border-y border-[color:var(--mmo-rule)]">
                                    <div className="grid gap-5 border-b border-[color:var(--mmo-rule)] py-6 lg:grid-cols-[170px_minmax(0,1fr)]">
                                        <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={userInfo.username}
                                            disabled
                                            className="w-full border-b border-[color:var(--mmo-rule)] bg-transparent px-0 py-3 text-[1.1rem] text-[var(--mmo-muted)] outline-none"
                                        />
                                    </div>

                                    <div className="grid gap-5 border-b border-[color:var(--mmo-rule)] py-6 lg:grid-cols-[170px_minmax(0,1fr)]">
                                        <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                            Bio
                                        </label>
                                        <textarea
                                            value={userInfo.bio}
                                            onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                                            className="h-28 w-full border border-[color:var(--mmo-rule)] bg-transparent px-4 py-4 text-base leading-8 text-[var(--mmo-ink)] outline-none placeholder:text-[#988d82] resize-none"
                                            placeholder="나를 표현하는 한 줄 소개를 입력하세요."
                                        />
                                    </div>

                                    <div className="grid gap-5 py-6 lg:grid-cols-[170px_minmax(0,1fr)]">
                                        <div>
                                            <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                                Password
                                            </div>
                                            <div className="mt-4 inline-flex items-start gap-2 text-sm leading-7 text-[var(--mmo-muted)]">
                                                <AlertCircle className="mt-1 h-4 w-4 shrink-0" />
                                                새 비밀번호를 입력한 경우에만 변경됩니다.
                                            </div>
                                        </div>
                                        <div>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full border-b border-[color:var(--mmo-rule)] bg-transparent px-0 py-3 text-[1.1rem] text-[var(--mmo-ink)] outline-none placeholder:text-[#988d82]"
                                                placeholder="새 비밀번호 입력"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {message.text && (
                                    <div
                                        className={`mt-5 text-sm leading-7 ${
                                            message.type === 'success'
                                                ? 'text-[var(--mmo-accent)]'
                                                : 'text-[#a84635]'
                                        }`}
                                    >
                                        {message.text}
                                    </div>
                                )}

                                <div className="flex justify-end pt-8">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 border-b-2 border-[var(--mmo-ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)]"
                                    >
                                        <Save className="h-4 w-4" />
                                        저장하기
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="border-t border-[color:var(--mmo-rule)] pt-8">
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                                        Activity
                                    </p>
                                    <h2 className="font-display mt-3 text-[2.3rem] font-bold tracking-[-0.05em] text-[var(--mmo-ink)] md:text-[3rem]">
                                        내 활동
                                    </h2>
                                </div>

                                <div className="flex gap-6 border-b border-[color:var(--mmo-rule)] pb-2">
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className={`text-[11px] uppercase tracking-[0.28em] transition-colors ${
                                            activeTab === 'reviews'
                                                ? 'text-[var(--mmo-ink)]'
                                                : 'text-[var(--mmo-muted)] hover:text-[var(--mmo-ink)]'
                                        }`}
                                    >
                                        나의 리뷰
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('posts')}
                                        className={`text-[11px] uppercase tracking-[0.28em] transition-colors ${
                                            activeTab === 'posts'
                                                ? 'text-[var(--mmo-ink)]'
                                                : 'text-[var(--mmo-muted)] hover:text-[var(--mmo-ink)]'
                                        }`}
                                    >
                                        나의 게시글
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'reviews' && (
                                <div className="mt-6 border-b border-[color:var(--mmo-rule)]">
                                    {myReviews.length > 0 ? (
                                        myReviews.map((review) => (
                                            <button
                                                key={review.id}
                                                type="button"
                                                onClick={() => navigate(`/songs/${review.songId}`)}
                                                className="group grid w-full gap-5 border-t border-[color:var(--mmo-rule)] py-6 text-left transition-colors hover:bg-[rgba(23,19,16,0.03)] lg:grid-cols-[88px_minmax(0,1fr)_130px]"
                                            >
                                                <img
                                                    src={review.songImageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop'}
                                                    alt={review.songTitle}
                                                    className="h-[88px] w-[88px] object-cover"
                                                />
                                                <div className="min-w-0">
                                                    <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                                        Review
                                                    </div>
                                                    <h3 className="font-display mt-2 truncate text-[1.8rem] leading-[1.06] tracking-[-0.045em] text-[var(--mmo-ink)]">
                                                        {review.songTitle}
                                                    </h3>
                                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[var(--mmo-accent)]">
                                                        {[...Array(review.rating)].map((_, index) => (
                                                            <Star key={index} className="h-4 w-4 fill-current" />
                                                        ))}
                                                    </div>
                                                    <p className="mt-3 text-base leading-8 text-[var(--mmo-muted)]">
                                                        {truncate(review.comment)}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-start gap-3 text-sm leading-7 text-[var(--mmo-muted)] lg:items-end">
                                                    <span>{formatDate(review.createdAt)}</span>
                                                    <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] transition-colors group-hover:text-[var(--mmo-ink)]">
                                                        상세 보기
                                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                    </span>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="py-16 text-center text-[var(--mmo-muted)]">
                                            작성한 리뷰가 없습니다.
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'posts' && (
                                <div className="mt-6 border-b border-[color:var(--mmo-rule)]">
                                    {myPosts.length > 0 ? (
                                        myPosts.map((post) => (
                                            <button
                                                key={post.id}
                                                type="button"
                                                onClick={() => navigate(`/board/${post.id}`)}
                                                className="group grid w-full gap-5 border-t border-[color:var(--mmo-rule)] py-6 text-left transition-colors hover:bg-[rgba(23,19,16,0.03)] lg:grid-cols-[160px_minmax(0,1fr)_130px]"
                                            >
                                                <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                                    {post.category === 'RECOMMEND' ? 'Song pick' : 'Free board'}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-display text-[1.9rem] leading-[1.06] tracking-[-0.045em] text-[var(--mmo-ink)]">
                                                        {post.title}
                                                    </h3>
                                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--mmo-muted)]">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatDate(post.createdAt)}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <MessageSquare className="h-4 w-4" />
                                                            댓글 {post.commentCount || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] lg:justify-end">
                                                    <span className="inline-flex items-center gap-2 transition-colors group-hover:text-[var(--mmo-ink)]">
                                                        상세 보기
                                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                    </span>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="py-16 text-center text-[var(--mmo-muted)]">
                                            작성한 게시글이 없습니다.
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </section>
                </div>
            </div>
        </div>
    )
}
