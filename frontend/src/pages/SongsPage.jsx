import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Disc, Play, Pause, Plus, Star, ArrowRight } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import api from '../api/axios'

const searchTypeOptions = [
    { value: 'all', label: '전체' },
    { value: 'song', label: '제목' },
    { value: 'artist', label: '가수' },
]

const useDebounce = (callback, delay) => {
    const timer = useRef(null)

    return useCallback((...args) => {
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => {
            callback(...args)
        }, delay)
    }, [callback, delay])
}

const formatYear = (releaseDate) => {
    if (!releaseDate) return '연도 미상'
    return releaseDate.substring(0, 4)
}

export default function SongsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchType, setSearchType] = useState('all')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [playingPreview, setPlayingPreview] = useState(null)
    const [visibleLimit, setVisibleLimit] = useState(20)
    const navigate = useNavigate()

    const searchMusic = async (term, type) => {
        if (!term.trim()) {
            setResults([])
            return
        }

        setLoading(true)
        setVisibleLimit(20)
        try {
            const response = await api.get(`/api/music/search?term=${encodeURIComponent(term)}&type=${type}`)
            setResults(response.data)
        } catch (error) {
            console.error('Search failed', error)
        } finally {
            setLoading(false)
        }
    }

    const debouncedSearch = useDebounce((term, type) => searchMusic(term, type), 500)

    const handleInput = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        debouncedSearch(value, searchType)
    }

    const handleTypeChange = (value) => {
        setSearchType(value)
        if (searchTerm) {
            searchMusic(searchTerm, value)
        }
    }

    const togglePreview = (e, url) => {
        e.stopPropagation()

        if (playingPreview === url) {
            setPlayingPreview(null)
            const audio = document.getElementById('audio-preview')
            if (audio) audio.pause()
            return
        }

        setPlayingPreview(url)
        setTimeout(() => {
            const audio = document.getElementById('audio-preview')
            if (audio) {
                audio.src = url
                audio.play()
            }
        }, 0)
    }

    const goToDetail = (track) => {
        navigate(`/songs/${track.itunesTrackId || track.trackId}`, { state: { track } })
    }

    const visibleResults = results.slice(0, visibleLimit)

    return (
        <div className="min-h-screen bg-transparent pb-16 pt-24 text-[var(--mmo-ink)]">
            <audio id="audio-preview" onEnded={() => setPlayingPreview(null)} className="hidden" />

            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
                    <aside className="lg:sticky lg:top-28 h-fit">
                        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                            Music search
                        </p>
                        <h1 className="font-display balance-keep mt-5 max-w-[9ch] text-[2.7rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--mmo-ink)] sm:text-[3rem] md:text-[4.2rem]">
                            <span className="block">곡을 검색하고</span>
                            <span className="block">바로 확인하기</span>
                        </h1>
                        <p className="mt-6 max-w-md text-lg leading-8 text-[var(--mmo-muted)]">
                            제목이나 아티스트 기준으로 검색합니다. 결과 목록에서 미리듣기와 상세 이동을 함께 처리합니다.
                        </p>

                        <div className="mt-10 space-y-5 border-t border-[color:var(--mmo-rule)] pt-6">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                    Source
                                </p>
                                <p className="mt-2 text-base leading-7 text-[var(--mmo-muted)]">
                                    iTunes 검색 결과와 커뮤니티 리뷰 데이터를 같이 보여줍니다.
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                    Result count
                                </p>
                                <p className="mt-2 text-base leading-7 text-[var(--mmo-muted)]">
                                    현재 {visibleResults.length}개 항목이 화면에 표시되고 있습니다.
                                </p>
                            </div>
                        </div>
                    </aside>

                    <section className="border-t border-[color:var(--mmo-rule)] pt-8">
                        <div className="grid gap-8 lg:grid-cols-[170px_minmax(0,1fr)]">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                                    Search type
                                </p>
                                <div className="mt-5 flex flex-row gap-4 border-b border-[color:var(--mmo-rule)] pb-4 lg:flex-col lg:border-b-0 lg:pb-0">
                                    {searchTypeOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleTypeChange(option.value)}
                                            className={`self-start border-b pb-2 text-[11px] uppercase tracking-[0.28em] transition-colors ${
                                                searchType === option.value
                                                    ? 'border-[var(--mmo-ink)] text-[var(--mmo-ink)]'
                                                    : 'border-transparent text-[var(--mmo-muted)] hover:text-[var(--mmo-ink)]'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-4 border-b border-[color:var(--mmo-rule)] pb-4">
                                    <Search className="h-5 w-5 text-[var(--mmo-muted)]" />
                                    <input
                                        type="text"
                                        className="w-full bg-transparent text-[1.15rem] text-[var(--mmo-ink)] placeholder:text-[#988d82] outline-none"
                                        placeholder="곡 제목 또는 아티스트를 입력하세요"
                                        value={searchTerm}
                                        onChange={handleInput}
                                        autoFocus
                                    />
                                </div>
                                <p className="mt-4 text-sm leading-7 text-[var(--mmo-muted)]">
                                    {searchTerm
                                        ? `검색어 "${searchTerm}" 결과를 ${searchTypeOptions.find((option) => option.value === searchType)?.label} 기준으로 표시합니다.`
                                        : '검색어를 입력하면 결과 목록이 아래에 나타납니다.'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 border-t border-[color:var(--mmo-rule)]">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-4 border-b border-[color:var(--mmo-rule)] py-5 md:grid-cols-[84px_minmax(0,1fr)_180px] md:items-center"
                                    >
                                        <Skeleton className="aspect-square" height={84} width={84} borderRadius={0} />
                                        <div>
                                            <Skeleton width="28%" height={14} className="mb-3" />
                                            <Skeleton width="62%" height={34} className="mb-3" />
                                            <Skeleton width="52%" height={18} />
                                        </div>
                                        <div className="hidden md:block">
                                            <Skeleton width="70%" height={18} className="mb-3" />
                                            <Skeleton width="55%" height={18} />
                                        </div>
                                    </div>
                                ))
                            ) : visibleResults.length > 0 ? (
                                visibleResults.map((track, index) => (
                                    <motion.button
                                        key={track.trackId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.04 }}
                                        onClick={() => goToDetail(track)}
                                        className="group grid w-full gap-4 border-b border-[color:var(--mmo-rule)] py-5 text-left transition-colors hover:bg-[rgba(23,19,16,0.03)] md:grid-cols-[84px_minmax(0,1fr)_190px] md:items-center"
                                    >
                                        <div className="relative overflow-hidden bg-[#1c1815]">
                                            {track.artworkUrl100 ? (
                                                <img
                                                    src={track.artworkUrl100.replace('100x100', '600x600')}
                                                    alt={track.trackName}
                                                    className="aspect-square h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                />
                                            ) : (
                                                <div className="flex aspect-square h-full w-full items-center justify-center bg-[rgba(23,19,16,0.06)]">
                                                    <Disc className="h-8 w-8 text-[var(--mmo-muted)]" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                                {formatYear(track.releaseDate)} / {track.primaryGenreName || 'Music'}
                                            </div>
                                            <h2 className="font-display mt-2 text-[2rem] leading-[1.06] tracking-[-0.045em] text-[var(--mmo-ink)] md:text-[2.25rem]">
                                                {track.trackName}
                                            </h2>
                                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--mmo-muted)]">
                                                <span>{track.artistName}</span>
                                                <span>{track.collectionName || 'Single'}</span>
                                                {track.reviewCount > 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-[var(--mmo-ink)]">
                                                        <Star className="h-4 w-4 fill-current text-[var(--mmo-accent)]" />
                                                        {track.averageRating ? track.averageRating.toFixed(1) : '0.0'}
                                                        <span className="text-[var(--mmo-muted)]">({track.reviewCount})</span>
                                                    </span>
                                                ) : (
                                                    <span>리뷰 없음</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-row items-center justify-between gap-4 pt-2 md:flex-col md:items-end md:justify-center md:pt-0">
                                            {track.previewUrl ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => togglePreview(e, track.previewUrl)}
                                                    className="inline-flex items-center gap-2 border-b border-[color:var(--mmo-rule)] pb-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors hover:text-[var(--mmo-ink)]"
                                                >
                                                    {playingPreview === track.previewUrl ? (
                                                        <>
                                                            <Pause className="h-4 w-4" />
                                                            미리듣기 중지
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="h-4 w-4" />
                                                            미리듣기
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                                    미리듣기 없음
                                                </span>
                                            )}

                                            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                                <Plus className="h-4 w-4" />
                                                리뷰 보기
                                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </span>
                                        </div>
                                    </motion.button>
                                ))
                            ) : searchTerm ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--mmo-muted)]">
                                    <Disc className="mb-4 h-12 w-12 opacity-30" />
                                    <p className="text-base">검색 결과가 없습니다.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--mmo-muted)]">
                                    <Search className="mb-4 h-12 w-12 opacity-30" />
                                    <p className="text-base">검색어를 입력하면 결과를 확인할 수 있습니다.</p>
                                </div>
                            )}
                        </div>

                        {results.length > visibleLimit && (
                            <div className="pt-8">
                                <button
                                    onClick={() => setVisibleLimit((prev) => prev + 20)}
                                    className="inline-flex items-center gap-3 border-b-2 border-[var(--mmo-ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)]"
                                >
                                    더 보기
                                    <span className="text-[var(--mmo-muted)]">
                                        {visibleResults.length} / {results.length}
                                    </span>
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}
