import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, PenSquare, Calendar, User, Heart, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useScrollRestoration } from '../hooks/useScrollRestoration'

const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })

const getPostPreview = (post) => {
    if (post.songTitle) {
        return `${post.songTitle} · ${post.songArtist || '아티스트 정보 없음'}`
    }

    if (!post.content) return '본문 미리보기가 없습니다.'

    return post.content.length > 92 ? `${post.content.slice(0, 92)}...` : post.content
}

export default function BoardPage() {
    const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('board_active_tab') || 'FREE')
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)

    const { user } = useAuth()
    const navigate = useNavigate()

    useScrollRestoration(`board_scroll_${activeTab}`, posts)

    const categories = {
        FREE: {
            label: '자유게시판',
            eyebrow: 'Free board',
            desc: '자유 주제 게시글 목록입니다. 최신순으로 표시합니다.',
        },
        RECOMMEND: {
            label: '노래 추천',
            eyebrow: 'Song picks',
            desc: '추천 곡이 연결된 게시글 목록입니다. 최신순으로 표시합니다.',
        },
    }

    const fetchPosts = async (pageNum, isNewTab = false) => {
        if (!isNewTab && loading) return

        setLoading(true)
        try {
            const response = await api.get(`/api/board?category=${activeTab}&size=20&page=${pageNum}&sort=createdAt,desc`)
            const newPosts = response.data.content
            const isLast = response.data.last

            setPosts((prev) => (isNewTab ? newPosts : [...prev, ...newPosts]))
            setHasMore(!isLast)
        } catch (error) {
            console.error('Failed to fetch posts', error)
            setHasMore(false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        sessionStorage.setItem('board_active_tab', activeTab)
        setPage(0)
        setHasMore(true)
        setPosts([])
        fetchPosts(0, true)
    }, [activeTab])

    useEffect(() => {
        if (loading || !hasMore) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setPage((prev) => {
                        const nextPage = prev + 1
                        fetchPosts(nextPage, false)
                        return nextPage
                    })
                }
            },
            { threshold: 1.0 }
        )

        const sentinel = document.getElementById('scroll-sentinel')
        if (sentinel) observer.observe(sentinel)

        return () => observer.disconnect()
    }, [loading, hasMore, activeTab])

    const handleWrite = () => {
        if (!user) {
            alert('로그인이 필요한 서비스입니다.')
            navigate('/login')
            return
        }

        navigate('/board/write', { state: { category: activeTab } })
    }

    return (
        <div className="min-h-screen bg-transparent pb-16 pt-24 text-[var(--mmo-ink)]">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
                    <aside className="lg:sticky lg:top-28 h-fit">
                        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                            Community
                        </p>
                        <h1 className="font-display balance-keep mt-5 max-w-[9ch] text-[2.7rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--mmo-ink)] sm:text-[3rem] md:text-[4.2rem]">
                            <span className="block">커뮤니티</span>
                            <span className="block">게시글 목록</span>
                        </h1>
                        <p className="mt-6 max-w-md text-lg leading-8 text-[var(--mmo-muted)]">
                            카테고리별 게시글을 최신순으로 확인합니다. 로그인하면 새 글을 바로 작성할 수 있습니다.
                        </p>

                        <button
                            onClick={handleWrite}
                            className="group mt-10 inline-flex items-center gap-3 border-b-2 border-[var(--mmo-ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)]"
                        >
                            글쓰기
                            <PenSquare className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                    </aside>

                    <section className="border-t border-[color:var(--mmo-rule)] pt-8">
                        <div className="border-b border-[color:var(--mmo-rule)] pb-4">
                            <div className="flex flex-wrap gap-6">
                                {Object.keys(categories).map((categoryKey) => (
                                    <button
                                        key={categoryKey}
                                        onClick={() => setActiveTab(categoryKey)}
                                        className={`border-b pb-2 text-[11px] uppercase tracking-[0.28em] transition-colors ${
                                            activeTab === categoryKey
                                                ? 'border-[var(--mmo-ink)] text-[var(--mmo-ink)]'
                                                : 'border-transparent text-[var(--mmo-muted)] hover:text-[var(--mmo-ink)]'
                                        }`}
                                    >
                                        {categories[categoryKey].label}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                                        {categories[activeTab].eyebrow}
                                    </p>
                                    <h2 className="font-display balance-keep mt-4 max-w-[8ch] text-[2.45rem] font-bold leading-[1.06] tracking-[-0.045em] text-[var(--mmo-ink)] md:max-w-none md:text-[3.2rem]">
                                        {categories[activeTab].label}
                                    </h2>
                                    <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--mmo-muted)]">
                                        {categories[activeTab].desc}
                                    </p>
                                </div>

                                <p className="text-sm leading-7 text-[var(--mmo-muted)]">
                                    {loading && posts.length === 0
                                        ? '게시글을 불러오는 중입니다.'
                                        : `${posts.length}개 글이 현재 목록에 표시되고 있습니다.`}
                                </p>
                            </div>
                        </div>

                        <div className="border-b border-[color:var(--mmo-rule)]">
                            {posts.map((post, index) => (
                                <motion.button
                                    key={post.id}
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => navigate(`/board/${post.id}`)}
                                    className="group grid w-full gap-5 border-t border-[color:var(--mmo-rule)] py-6 text-left transition-colors hover:bg-[rgba(23,19,16,0.03)] lg:grid-cols-[minmax(0,1fr)_240px]"
                                >
                                    <div className="min-w-0">
                                        <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                            {post.category === 'RECOMMEND' ? '추천 글' : '자유 글'}
                                        </div>
                                        <h3 className="font-display mt-2 text-[2rem] leading-[1.08] tracking-[-0.045em] text-[var(--mmo-ink)] md:text-[2.3rem]">
                                            {post.title}
                                        </h3>
                                        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--mmo-muted)]">
                                            {getPostPreview(post)}
                                        </p>
                                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--mmo-muted)]">
                                            <span className="inline-flex items-center gap-1.5">
                                                <User className="h-4 w-4" />
                                                {post.username || '익명'}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(post.createdAt)}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <MessageSquare className="h-4 w-4" />
                                                댓글 {post.commentCount || 0}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Heart className="h-4 w-4" />
                                                좋아요 {post.likeCount || 0}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between gap-4 border-t border-[color:var(--mmo-rule)] pt-4 lg:border-l lg:border-t-0 lg:pl-6">
                                        {post.songTitle ? (
                                            <div className="min-w-0">
                                                <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                                    연결 곡
                                                </div>
                                                <div className="mt-3 flex items-center gap-3">
                                                    {post.songImageUrl ? (
                                                        <img
                                                            src={post.songImageUrl}
                                                            alt={post.songTitle}
                                                            className="h-14 w-14 shrink-0 object-cover"
                                                        />
                                                    ) : null}
                                                    <div className="min-w-0">
                                                        <div className="truncate text-base font-semibold text-[var(--mmo-ink)]">
                                                            {post.songTitle}
                                                        </div>
                                                        <div className="truncate text-sm text-[var(--mmo-muted)]">
                                                            {post.songArtist}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-[var(--mmo-muted)]">
                                                자유 주제 게시글
                                            </div>
                                        )}

                                        <span className="inline-flex shrink-0 items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                            글 보기
                                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </motion.button>
                            ))}

                            {loading && posts.length === 0 && (
                                <div className="flex items-center justify-center py-20 text-[var(--mmo-muted)]">
                                    게시글을 불러오는 중입니다...
                                </div>
                            )}

                            {!loading && posts.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--mmo-muted)]">
                                    <MessageSquare className="mb-4 h-12 w-12 opacity-30" />
                                    <p className="text-base">아직 게시글이 없습니다.</p>
                                </div>
                            )}
                        </div>

                        <div id="scroll-sentinel" className="flex h-12 items-center py-4 text-[var(--mmo-muted)]">
                            {loading && posts.length > 0 ? '게시글을 더 불러오는 중입니다...' : ''}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
