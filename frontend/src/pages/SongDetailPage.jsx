import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ArrowLeft, MessageSquare, Play, Pause, Save, Heart, Bookmark, ThumbsUp } from 'lucide-react'
import YouTube from 'react-youtube'
import Skeleton from 'react-loading-skeleton'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const defaultArtwork =
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop'

const mapSongData = (rawSong = {}) => ({
    ...rawSong,
    trackName: rawSong.trackName || rawSong.title || 'Unknown Title',
    artistName: rawSong.artistName || rawSong.artist || 'Unknown Artist',
    collectionName: rawSong.collectionName || rawSong.album || 'Unknown Album',
    artworkUrl100: rawSong.artworkUrl100 || rawSong.imageUrl || defaultArtwork,
    primaryGenreName: rawSong.primaryGenreName || rawSong.genre || 'Music',
    releaseDate: rawSong.releaseDate
        ? rawSong.releaseDate
        : rawSong.releaseYear
            ? new Date(rawSong.releaseYear, 0, 1).toISOString()
            : null,
    trackId: rawSong.itunesTrackId || rawSong.trackId || rawSong.id,
    itunesTrackId: rawSong.itunesTrackId || rawSong.trackId || null,
    previewUrl: rawSong.previewUrl || null,
    likeCount: rawSong.likeCount || 0,
})

const formatDate = (dateString) => {
    if (!dateString) return '날짜 정보 없음'
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
}

const formatYear = (dateString) => {
    if (!dateString) return '연도 미상'
    return new Date(dateString).getFullYear()
}

export default function SongDetailPage() {
    const { itunesTrackId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [songInfo, setSongInfo] = useState(() =>
        location.state?.track ? mapSongData(location.state.track) : null
    )
    const [resolvedSongId, setResolvedSongId] = useState(location.state?.track?.id || null)
    const [songLoading, setSongLoading] = useState(!location.state?.track)
    const [songError, setSongError] = useState('')

    const [reviews, setReviews] = useState([])
    const [averageRating, setAverageRating] = useState(0)
    const [status, setStatus] = useState({ liked: false, favorited: false, reviewed: false })
    const [likeCount, setLikeCount] = useState(location.state?.track?.likeCount || 0)
    const [videoId, setVideoId] = useState(null)
    const [reviewSort, setReviewSort] = useState('latest')
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [playing, setPlaying] = useState(false)

    const resolveSongRecord = async (trackKey) => {
        if (!trackKey) return null

        try {
            const response = await api.get(`/api/songs/itunes/${trackKey}`)
            return mapSongData(response.data)
        } catch (itunesError) {
            try {
                const fallbackResponse = await api.get(`/api/songs/${trackKey}`)
                return mapSongData(fallbackResponse.data)
            } catch (fallbackError) {
                console.error('Failed to resolve song record', fallbackError)
                return null
            }
        }
    }

    const ensureSongId = async () => {
        if (resolvedSongId) return resolvedSongId

        const resolvedSong = await resolveSongRecord(itunesTrackId)
        if (!resolvedSong?.id) return null

        setSongInfo((prev) => ({ ...(prev || {}), ...resolvedSong }))
        setResolvedSongId(resolvedSong.id)
        return resolvedSong.id
    }

    useEffect(() => {
        let active = true

        if (!songInfo && !itunesTrackId) {
            navigate('/songs')
            return undefined
        }

        const fetchSongDetailsAndStatus = async () => {
            setSongLoading(true)
            setSongError('')
            setVideoId(null)

            const dbSong = await resolveSongRecord(itunesTrackId)

            if (!active) return

            if (!dbSong) {
                setSongError('곡 정보를 찾을 수 없습니다.')
                setSongLoading(false)
                return
            }

            setSongInfo(dbSong)
            setResolvedSongId(dbSong.id || null)
            setLikeCount(dbSong.likeCount || 0)

            if (user && dbSong.id) {
                try {
                    const statusRes = await api.get(`/api/songs/${dbSong.id}/status`)
                    if (active) {
                        setStatus(statusRes.data)
                    }
                } catch (error) {
                    console.error('Failed to fetch song status', error)
                    if (active) {
                        setStatus({ liked: false, favorited: false, reviewed: false })
                    }
                }
            } else {
                setStatus({ liked: false, favorited: false, reviewed: false })
            }

            setSongLoading(false)
        }

        fetchSongDetailsAndStatus()

        return () => {
            active = false
        }
    }, [itunesTrackId, user])

    useEffect(() => {
        const fetchReviews = async () => {
            const songId = resolvedSongId || (await ensureSongId())
            if (!songId) return

            try {
                const reviewResponse = await api.get(`/api/reviews?songId=${songId}&sort=${reviewSort}`)
                const fetchedReviews = reviewResponse.data.content || reviewResponse.data
                setReviews(fetchedReviews)

                const total = fetchedReviews.reduce((acc, rev) => acc + rev.rating, 0)
                setAverageRating(fetchedReviews.length ? (total / fetchedReviews.length).toFixed(1) : 0)
            } catch (error) {
                console.error('Failed to fetch reviews', error)
            }
        }

        fetchReviews()
    }, [itunesTrackId, reviewSort])

    useEffect(() => {
        const fetchYoutubeVideo = async () => {
            if (!songInfo?.artistName || !songInfo?.trackName) return

            try {
                const queryTerm = `${songInfo.artistName} ${songInfo.trackName} official audio`
                const res = await api.get(`/api/music/youtube-video?term=${encodeURIComponent(queryTerm)}`)
                if (res.data?.videoId) {
                    setVideoId(res.data.videoId)
                }
            } catch (error) {
                console.error('Failed to fetch YouTube video ID', error)
            }
        }

        if (songInfo) {
            fetchYoutubeVideo()
        }
    }, [songInfo])

    const handleToggleLike = async () => {
        if (!user) {
            alert('로그인이 필요합니다.')
            return
        }

        const songId = await ensureSongId()
        if (!songId) return

        try {
            await api.post(`/api/songs/${songId}/like`)
            setLikeCount((prev) => (status.liked ? Math.max(prev - 1, 0) : prev + 1))
            setStatus((prev) => ({ ...prev, liked: !prev.liked }))
        } catch (error) {
            console.error('Like failed', error)
        }
    }

    const handleToggleFavorite = async () => {
        if (!user) {
            alert('로그인이 필요합니다.')
            return
        }

        const songId = await ensureSongId()
        if (!songId) return

        try {
            await api.post(`/api/songs/${songId}/favorite`)
            setStatus((prev) => ({ ...prev, favorited: !prev.favorited }))
        } catch (error) {
            console.error('Favorite failed', error)
        }
    }

    const handleToggleReviewLike = async (reviewId) => {
        if (!user) {
            alert('로그인이 필요합니다.')
            return
        }

        try {
            await api.post(`/api/reviews/${reviewId}/like`)
            const songId = resolvedSongId || (await ensureSongId())
            if (!songId) return

            const reviewResponse = await api.get(`/api/reviews?songId=${songId}&sort=${reviewSort}`)
            const fetchedReviews = reviewResponse.data.content || reviewResponse.data
            setReviews(fetchedReviews)
            const total = fetchedReviews.reduce((acc, rev) => acc + rev.rating, 0)
            setAverageRating(fetchedReviews.length ? (total / fetchedReviews.length).toFixed(1) : 0)
        } catch (error) {
            console.error('Review like failed', error)
        }
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault()

        if (!user) {
            alert('로그인이 필요합니다.')
            navigate('/login')
            return
        }

        if (status.reviewed) {
            alert('이미 리뷰를 작성하셨습니다.')
            return
        }

        if (!songInfo) return

        setIsSubmitting(true)

        const payload = {
            itunesTrackId: songInfo.itunesTrackId || songInfo.trackId,
            title: songInfo.trackName,
            artist: songInfo.artistName,
            album: songInfo.collectionName,
            imageUrl: songInfo.artworkUrl100,
            releaseYear: formatYear(songInfo.releaseDate),
            genre: songInfo.primaryGenreName,
            rating: Number.parseInt(rating, 10),
            comment,
        }

        try {
            await api.post('/api/reviews', payload)
            setShowReviewForm(false)
            setComment('')
            setStatus((prev) => ({ ...prev, reviewed: true }))

            const songId = resolvedSongId || (await ensureSongId())
            if (songId) {
                const reviewResponse = await api.get(`/api/reviews?songId=${songId}&sort=${reviewSort}`)
                const fetchedReviews = reviewResponse.data.content || reviewResponse.data
                setReviews(fetchedReviews)
                const total = fetchedReviews.reduce((acc, rev) => acc + rev.rating, 0)
                setAverageRating(fetchedReviews.length ? (total / fetchedReviews.length).toFixed(1) : 0)
            }
        } catch (error) {
            console.error('Review submit failed', error)
            alert(error.response?.data?.message || '리뷰 작성에 실패했습니다.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleAudio = () => {
        const audio = document.getElementById('audio-detail')
        if (!audio) return

        if (audio.paused) {
            audio.play()
        } else {
            audio.pause()
        }
    }

    if (songLoading && !songInfo) {
        return (
            <div className="min-h-screen bg-transparent px-6 pt-28 text-center text-[var(--mmo-muted)]">
                곡 정보를 불러오는 중입니다.
            </div>
        )
    }

    if (songError && !songInfo) {
        return (
            <div className="min-h-screen bg-transparent px-6 pt-28 text-center text-[var(--mmo-muted)]">
                {songError}
            </div>
        )
    }

    if (!songInfo) {
        return (
            <div className="min-h-screen bg-transparent px-6 pt-28 text-center text-[var(--mmo-muted)]">
                곡 정보를 찾을 수 없습니다.
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent pb-16 pt-24 text-[var(--mmo-ink)]">
            <audio
                id="audio-detail"
                src={songInfo.previewUrl || undefined}
                onEnded={() => setPlaying(false)}
                onPause={() => setPlaying(false)}
                onPlay={() => setPlaying(true)}
            />

            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14">
                    <aside className="h-fit lg:sticky lg:top-28">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 border-b border-[color:var(--mmo-rule)] pb-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors hover:text-[var(--mmo-ink)]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            목록으로
                        </button>

                        <div className="mt-8 overflow-hidden bg-[#1c1815]">
                            <img
                                src={
                                    songInfo.artworkUrl100
                                        ? songInfo.artworkUrl100.replace('100x100', '800x800')
                                        : defaultArtwork
                                }
                                alt={songInfo.trackName}
                                className="aspect-square w-full object-cover"
                            />
                        </div>

                        <p className="mt-6 text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                            Song detail
                        </p>
                        <h1 className="font-display balance-keep mt-4 max-w-[10ch] text-[2.8rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--mmo-ink)] sm:text-[3.3rem]">
                            {songInfo.trackName}
                        </h1>
                        <button
                            type="button"
                            onClick={() => navigate(`/artists/${encodeURIComponent(songInfo.artistName)}`)}
                            className="mt-4 border-b border-transparent pb-1 text-lg text-[var(--mmo-muted)] transition-colors hover:border-[color:var(--mmo-rule)] hover:text-[var(--mmo-ink)]"
                        >
                            {songInfo.artistName}
                        </button>

                        <div className="mt-8 space-y-4 border-t border-[color:var(--mmo-rule)] pt-5 text-sm leading-7 text-[var(--mmo-muted)]">
                            <div>{songInfo.collectionName}</div>
                            <div>{formatYear(songInfo.releaseDate)}</div>
                            <div>{songInfo.primaryGenreName}</div>
                        </div>

                        <div className="mt-8 space-y-4 border-t border-[color:var(--mmo-rule)] pt-5">
                            {songInfo.previewUrl ? (
                                <button
                                    type="button"
                                    onClick={toggleAudio}
                                    className="inline-flex items-center gap-2 border-b border-[color:var(--mmo-ink)] pb-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)]"
                                >
                                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    {playing ? '미리듣기 중지' : '미리듣기'}
                                </button>
                            ) : (
                                <div className="text-sm text-[var(--mmo-muted)]">미리듣기 없음</div>
                            )}

                            <div className="flex flex-wrap gap-4">
                                <button
                                    type="button"
                                    onClick={handleToggleLike}
                                    className={`inline-flex items-center gap-2 border-b pb-2 text-[11px] uppercase tracking-[0.28em] transition-colors ${
                                        status.liked
                                            ? 'border-[var(--mmo-accent)] text-[var(--mmo-accent)]'
                                            : 'border-[color:var(--mmo-rule)] text-[var(--mmo-muted)] hover:text-[var(--mmo-ink)]'
                                    }`}
                                >
                                    <Heart className={`h-4 w-4 ${status.liked ? 'fill-current' : ''}`} />
                                    좋아요 {likeCount}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleToggleFavorite}
                                    className={`inline-flex items-center gap-2 border-b pb-2 text-[11px] uppercase tracking-[0.28em] transition-colors ${
                                        status.favorited
                                            ? 'border-[var(--mmo-accent)] text-[var(--mmo-accent)]'
                                            : 'border-[color:var(--mmo-rule)] text-[var(--mmo-muted)] hover:text-[var(--mmo-ink)]'
                                    }`}
                                >
                                    <Bookmark className={`h-4 w-4 ${status.favorited ? 'fill-current' : ''}`} />
                                    {status.favorited ? '보관 중' : '보관함'}
                                </button>
                            </div>
                        </div>
                    </aside>

                    <section className="border-t border-[color:var(--mmo-rule)] pt-8">
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_180px]">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                                    Community note
                                </p>
                                <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--mmo-muted)]">
                                    앨범 정보, 미리듣기, 영상, 유저 리뷰를 한 화면에서 확인합니다. 이 곡에 대한 반응은 아래 편집면처럼 정리됩니다.
                                </p>
                            </div>

                            <div className="border-t border-[color:var(--mmo-rule)] pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                                <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                    Community rating
                                </div>
                                <div className="font-display mt-3 text-[4rem] font-extrabold leading-none tracking-[-0.06em] text-[var(--mmo-ink)]">
                                    {averageRating || '0.0'}
                                </div>
                                <div className="mt-2 text-sm leading-7 text-[var(--mmo-muted)]">
                                    리뷰 {reviews.length}개
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 border-t border-[color:var(--mmo-rule)] pt-8">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                                        Video
                                    </p>
                                    <h2 className="font-display mt-3 text-[2.3rem] font-bold tracking-[-0.05em] text-[var(--mmo-ink)] md:text-[3rem]">
                                        연결된 영상
                                    </h2>
                                </div>

                                <div className="text-sm leading-7 text-[var(--mmo-muted)]">자동 검색된 YouTube 결과</div>
                            </div>

                            <div className="mt-6 aspect-video overflow-hidden border border-[color:var(--mmo-rule)] bg-[rgba(23,19,16,0.04)]">
                                {videoId ? (
                                    <YouTube
                                        videoId={videoId}
                                        className="h-full w-full"
                                        iframeClassName="h-full w-full"
                                        opts={{
                                            width: '100%',
                                            height: '100%',
                                            playerVars: {
                                                autoplay: 0,
                                                modestbranding: 1,
                                                rel: 0,
                                            },
                                        }}
                                    />
                                ) : (
                                    <Skeleton className="h-full w-full" height="100%" borderRadius={0} />
                                )}
                            </div>
                        </div>

                        <div className="mt-12 border-t border-[color:var(--mmo-rule)] pt-8">
                            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                                        Reviews
                                    </p>
                                    <h2 className="font-display mt-3 text-[2.3rem] font-bold tracking-[-0.05em] text-[var(--mmo-ink)] md:text-[3rem]">
                                        유저 리뷰
                                    </h2>
                                </div>

                                <div className="flex flex-wrap items-center gap-5">
                                    <div className="flex gap-4 border-b border-[color:var(--mmo-rule)] pb-2">
                                        <button
                                            type="button"
                                            onClick={() => setReviewSort('latest')}
                                            className={`text-[11px] uppercase tracking-[0.28em] transition-colors ${
                                                reviewSort === 'latest'
                                                    ? 'text-[var(--mmo-ink)]'
                                                    : 'text-[var(--mmo-muted)] hover:text-[var(--mmo-ink)]'
                                            }`}
                                        >
                                            최신순
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setReviewSort('likes')}
                                            className={`text-[11px] uppercase tracking-[0.28em] transition-colors ${
                                                reviewSort === 'likes'
                                                    ? 'text-[var(--mmo-ink)]'
                                                    : 'text-[var(--mmo-muted)] hover:text-[var(--mmo-ink)]'
                                            }`}
                                        >
                                            추천순
                                        </button>
                                    </div>

                                    {!status.reviewed ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowReviewForm((prev) => !prev)}
                                            className="inline-flex items-center gap-2 border-b-2 border-[var(--mmo-ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)]"
                                        >
                                            <Save className="h-4 w-4" />
                                            {showReviewForm ? '입력 닫기' : '리뷰 쓰기'}
                                        </button>
                                    ) : (
                                        <div className="text-sm leading-7 text-[var(--mmo-muted)]">리뷰 작성 완료</div>
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {showReviewForm && (
                                    <motion.form
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        onSubmit={handleReviewSubmit}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-8 border-y border-[color:var(--mmo-rule)] py-6">
                                            <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
                                                <div>
                                                    <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                                        Rating
                                                    </p>
                                                    <div className="mt-4 flex gap-2">
                                                        {[1, 2, 3, 4, 5].map((starValue) => (
                                                            <button
                                                                key={starValue}
                                                                type="button"
                                                                onClick={() => setRating(starValue)}
                                                                className={`transition-colors ${
                                                                    starValue <= rating
                                                                        ? 'text-[var(--mmo-accent)]'
                                                                        : 'text-[var(--mmo-accent-soft)]'
                                                                }`}
                                                            >
                                                                <Star className="h-7 w-7 fill-current" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                                        Comment
                                                    </label>
                                                    <textarea
                                                        value={comment}
                                                        onChange={(e) => setComment(e.target.value)}
                                                        placeholder="이 곡에 대한 생각을 남겨주세요."
                                                        className="mt-4 h-28 w-full border border-[color:var(--mmo-rule)] bg-transparent px-4 py-3 text-base leading-7 text-[var(--mmo-ink)] outline-none placeholder:text-[#988d82]"
                                                        required
                                                    />
                                                    <div className="mt-5 flex justify-end">
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmitting}
                                                            className="inline-flex items-center gap-2 border-b-2 border-[var(--mmo-ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)] disabled:text-[var(--mmo-muted)]"
                                                        >
                                                            <Save className="h-4 w-4" />
                                                            {isSubmitting ? '등록 중' : '등록'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <div className="mt-2 border-b border-[color:var(--mmo-rule)]">
                                {reviews.length > 0 ? (
                                    reviews.map((review, index) => (
                                        <motion.div
                                            key={review.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="grid gap-5 border-t border-[color:var(--mmo-rule)] py-6 lg:grid-cols-[170px_minmax(0,1fr)]"
                                        >
                                            <div className="text-sm leading-7 text-[var(--mmo-muted)]">
                                                <div>{review.username || '익명'}</div>
                                                <div>{formatDate(review.createdAt)}</div>
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 text-[var(--mmo-accent)]">
                                                    {[...Array(review.rating)].map((_, starIndex) => (
                                                        <Star key={starIndex} className="h-4 w-4 fill-current" />
                                                    ))}
                                                </div>
                                                <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-[var(--mmo-ink)]">
                                                    {review.comment}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleReviewLike(review.id)}
                                                    className="mt-4 inline-flex items-center gap-2 border-b border-[color:var(--mmo-rule)] pb-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors hover:text-[var(--mmo-ink)]"
                                                >
                                                    <ThumbsUp className="h-4 w-4" />
                                                    도움돼요 {review.likeCount || 0}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-16 text-center text-[var(--mmo-muted)]">
                                        아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요.
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
