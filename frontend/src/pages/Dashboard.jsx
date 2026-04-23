import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useScrollRestoration } from '../hooks/useScrollRestoration'

export default function Dashboard() {
    const [songs, setSongs] = useState([])
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    // Scroll Restoration
    useScrollRestoration('dashboard_scroll', songs)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Songs (8 items for grid/carousel look)
                // Fetch Reviews (Top 3 popular)
                const [songsRes, reviewsRes] = await Promise.all([
                    api.get('/api/songs?size=8&sort=id,desc&hasReviews=true'),
                    api.get('/api/reviews?size=3&sort=likeCount,desc')
                ])
                // Filter out songs without iTunes ID (likely test/junk data) to keep dashboard clean
                const cleanSongs = songsRes.data.content.filter(song => song.itunesTrackId)
                setSongs(cleanSongs)
                setReviews(reviewsRes.data.content)
            } catch (err) {
                console.error("Failed to fetch dashboard data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent px-6 pt-28">
                <div className="mx-auto max-w-7xl border-t border-[color:var(--mmo-rule)] py-8 text-[11px] uppercase tracking-[0.3em] text-[var(--mmo-muted)]">
                    Curating today&apos;s issue...
                </div>
            </div>
        )
    }

    const heroSong = songs.length > 0 ? songs[0] : null

    return (
        <div className="min-h-screen bg-transparent pb-24 pt-24 text-[var(--mmo-ink)]">
            <header className="border-b border-[color:var(--mmo-rule)]">
                <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:gap-14">
                    <motion.div
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--mmo-accent)]">
                            Today
                        </p>
                        <h1 className="font-display balance-keep mt-5 max-w-[10ch] text-[2.75rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--mmo-ink)] sm:text-[3rem] md:max-w-none md:text-[4.3rem]">
                            <span className="block">오늘 많이 읽힌 리뷰와</span>
                            <span className="block">최근 등록된 음반</span>
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--mmo-muted)]">
                            상위 리뷰 3개와 최근 등록 곡 8개를 한 화면에서 확인합니다.
                        </p>

                        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-[color:var(--mmo-rule)] pt-6 md:grid-cols-4">
                            <div>
                                <div className="font-display text-4xl leading-none text-[var(--mmo-ink)]">
                                    {songs.length}
                                </div>
                                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[var(--mmo-muted)]">
                                    최신 등록 곡
                                </p>
                            </div>
                            <div>
                                <div className="font-display text-4xl leading-none text-[var(--mmo-ink)]">
                                    {reviews.length}
                                </div>
                                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[var(--mmo-muted)]">
                                    인기 리뷰
                                </p>
                            </div>
                            <div>
                                <div className="font-display text-4xl leading-none text-[var(--mmo-ink)]">
                                    {heroSong?.reviewCount || 0}
                                </div>
                                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[var(--mmo-muted)]">
                                    리드 곡 메모
                                </p>
                            </div>
                            <div>
                                <div className="font-display text-4xl leading-none text-[var(--mmo-ink)]">
                                    {heroSong?.averageRating ? heroSong.averageRating.toFixed(1) : '0.0'}
                                </div>
                                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[var(--mmo-muted)]">
                                    평균 평점
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.08 }}
                        onClick={() => heroSong && navigate(`/songs/${heroSong.itunesTrackId || heroSong.id}`)}
                        className="relative overflow-hidden bg-[#1c1815] text-left"
                    >
                        {heroSong ? (
                            <>
                                <img
                                    src={heroSong.imageUrl?.replace('100x100', '1000x1000')}
                                    alt={heroSong.title}
                                    className="aspect-[4/5] h-full w-full object-cover saturate-[0.86] sepia-[0.08]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#16120f]/78 via-[#16120f]/12 to-transparent" />
                                <div className="absolute inset-x-6 top-6 flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-[#f7f1e8]/72">
                                    <span>현재 리드 곡</span>
                                    <span>{heroSong.genre || 'Music'}</span>
                                </div>
                                <div className="absolute inset-x-6 bottom-6 border-t border-white/20 pt-4 text-[#f7f1e8]">
                                    <h2 className="font-display text-4xl leading-tight md:text-[3rem]">
                                        {heroSong.title}
                                    </h2>
                                    <div className="mt-3 flex items-center gap-4 text-sm text-[#f7f1e8]/78">
                                        <span>{heroSong.artist}</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-current" />
                                            {heroSong.averageRating ? heroSong.averageRating.toFixed(1) : '0.0'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex aspect-[4/5] h-full items-end bg-[#1c1815] p-8 text-[#f7f1e8]">
                                <h2 className="font-display text-4xl leading-tight">첫 곡이 등록되면 여기가 오늘의 리드가 됩니다.</h2>
                            </div>
                        )}
                    </motion.button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl space-y-20 px-6 pt-16">
                <section className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
                    <div className="lg:sticky lg:top-28 h-fit">
                        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                            Latest songs
                        </p>
                        <h2 className="font-display balance-keep mt-4 max-w-[7ch] text-[2.45rem] font-bold leading-[1.06] tracking-[-0.045em] text-[var(--mmo-ink)] md:max-w-none md:text-5xl">
                            <span className="block">최근 등록된</span>
                            <span className="block">음악</span>
                        </h2>
                        <p className="mt-5 max-w-xs text-base leading-7 text-[var(--mmo-muted)]">
                            등록 순으로 정렬된 곡 목록입니다. 항목을 누르면 상세 화면으로 이동합니다.
                        </p>
                    </div>

                    <div className="border-t border-[color:var(--mmo-rule)]">
                        {songs.map((song, idx) => (
                            <motion.button
                                key={song.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/songs/${song.itunesTrackId || song.id}`)}
                                className="group grid w-full gap-4 border-b border-[color:var(--mmo-rule)] py-5 text-left transition-colors hover:bg-[rgba(23,19,16,0.03)] md:grid-cols-[74px_minmax(0,1fr)_auto] md:items-center"
                            >
                                <div className="relative overflow-hidden bg-[#1c1815]">
                                    {song.imageUrl ? (
                                        <img
                                            src={song.imageUrl.replace('100x100', '400x400')}
                                            alt={song.title}
                                            className="aspect-square h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="aspect-square h-full w-full bg-[rgba(23,19,16,0.08)]" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                        {String(idx + 1).padStart(2, '0')} / {song.genre || 'Music'}
                                    </div>
                                    <h3 className="mt-2 font-display text-3xl leading-tight text-[var(--mmo-ink)]">
                                        {song.title}
                                    </h3>
                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--mmo-muted)]">
                                        <span>{song.artist}</span>
                                        <span>{song.releaseYear || 'Unknown year'}</span>
                                        <span className="inline-flex items-center gap-1 text-[var(--mmo-ink)]">
                                            <Star className="w-4 h-4 fill-current text-[var(--mmo-accent)]" />
                                            {song.averageRating ? song.averageRating.toFixed(1) : '0.0'}
                                        </span>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                    상세 보기
                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </motion.button>
                        ))}

                        {songs.length === 0 && (
                            <div className="border-b border-[color:var(--mmo-rule)] py-8 text-base text-[var(--mmo-muted)]">
                                아직 등록된 곡이 없습니다.
                            </div>
                        )}
                    </div>
                </section>

                <section className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
                    <div className="lg:sticky lg:top-28 h-fit">
                        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                            Top reviews
                        </p>
                        <h2 className="font-display balance-keep mt-4 max-w-[7ch] text-[2.45rem] font-bold leading-[1.06] tracking-[-0.045em] text-[var(--mmo-ink)] md:max-w-none md:text-5xl">
                            <span className="block">많이 읽힌</span>
                            <span className="block">리뷰</span>
                        </h2>
                        <p className="mt-5 max-w-xs text-base leading-7 text-[var(--mmo-muted)]">
                            좋아요 순으로 정렬된 리뷰 3개입니다. 오른쪽에서 연결된 곡을 바로 열 수 있습니다.
                        </p>
                    </div>

                    <div className="border-t border-[color:var(--mmo-rule)]">
                        {reviews.map((review, idx) => (
                            <motion.article
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="grid gap-5 border-b border-[color:var(--mmo-rule)] py-8 lg:grid-cols-[72px_minmax(0,1fr)_220px]"
                            >
                                <div className="font-display text-5xl leading-none text-[var(--mmo-accent-soft)]">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>

                                <div>
                                    <p className="font-display text-3xl leading-[1.35] text-[var(--mmo-ink)] md:text-[2.4rem]">
                                        “{review.comment}”
                                    </p>
                                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--mmo-muted)]">
                                        <span>{review.username || '익명'}</span>
                                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        <span className="inline-flex items-center gap-1 text-[var(--mmo-ink)]">
                                            <Star className="w-4 h-4 fill-current text-[var(--mmo-accent)]" />
                                            {review.rating}
                                        </span>
                                        <span>{review.likeCount}명이 공감함</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(review.songId ? `/songs/${review.songId}` : '#')}
                                    className="border-t border-[color:var(--mmo-rule)] pt-4 text-left transition-colors hover:text-[var(--mmo-accent)] lg:border-t-0 lg:border-l lg:pl-6"
                                >
                                    <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                        연결된 곡
                                    </div>
                                    <div className="mt-2 font-display text-2xl leading-tight text-[var(--mmo-ink)]">
                                        {review.songTitle}
                                    </div>
                                    <div className="mt-2 text-sm text-[var(--mmo-muted)]">
                                        {review.songArtist}
                                    </div>
                                </button>
                            </motion.article>
                        ))}

                        {reviews.length === 0 && (
                            <div className="border-b border-[color:var(--mmo-rule)] py-8 text-base text-[var(--mmo-muted)]">
                                아직 등록된 리뷰가 없습니다.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
