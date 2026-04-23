import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Save, Music, Search, X, Loader, ArrowRight } from 'lucide-react'
import api from '../api/axios'

const categoryCopy = {
    FREE: {
        eyebrow: 'Free board',
        title: '자유게시판 글쓰기',
        desc: '자유 주제 게시글을 남기는 화면입니다. 제목과 본문만 입력하면 바로 등록할 수 있습니다.',
        placeholder: '자유롭게 이야기를 나누어보세요.',
    },
    RECOMMEND: {
        eyebrow: 'Song picks',
        title: '추천 글 작성',
        desc: '추천할 곡을 연결한 뒤 이유를 적는 화면입니다. 먼저 곡을 하나 고른 다음 본문을 남깁니다.',
        placeholder: '이 노래를 추천하는 이유를 적어주세요.',
    },
}

export default function PostWritePage() {
    const navigate = useNavigate()
    const location = useLocation()

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('FREE')
    const [loading, setLoading] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)

    useEffect(() => {
        if (location.state?.category) {
            setCategory(location.state.category)
        }
    }, [location])

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setSearchLoading(true)
        try {
            const res = await api.get(`/api/music/search?term=${encodeURIComponent(searchQuery)}`)
            setSearchResults(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setSearchLoading(false)
        }
    }

    const handleSelectSong = (song) => {
        setSelectedSong(song)
        setIsSearchOpen(false)
        setSearchResults([])
        setSearchQuery('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                title,
                content,
                category: category.toUpperCase(),
                ...(category === 'RECOMMEND' &&
                    selectedSong && {
                        itunesTrackId: selectedSong.trackId,
                        songTitle: selectedSong.trackName,
                        songArtist: selectedSong.artistName,
                        songImageUrl: selectedSong.artworkUrl100,
                        previewUrl: selectedSong.previewUrl,
                    }),
            }

            await api.post('/api/board', payload)
            navigate('/board')
        } catch (err) {
            console.error(err)
            alert('글 작성에 실패했습니다.')
        } finally {
            setLoading(false)
        }
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
                            게시판으로
                        </button>

                        <p className="mt-8 text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                            {categoryCopy[category].eyebrow}
                        </p>
                        <h1 className="font-display balance-keep mt-4 max-w-[10ch] text-[2.8rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--mmo-ink)] sm:text-[3.2rem]">
                            {categoryCopy[category].title}
                        </h1>
                        <p className="mt-6 max-w-md text-lg leading-8 text-[var(--mmo-muted)]">
                            {categoryCopy[category].desc}
                        </p>

                        <div className="mt-8 space-y-4 border-t border-[color:var(--mmo-rule)] pt-5 text-sm leading-7 text-[var(--mmo-muted)]">
                            <div>카테고리를 먼저 정하고 제목과 본문을 입력합니다.</div>
                            <div>추천 글은 곡 연결이 완료되어야 등록 버튼이 활성화됩니다.</div>
                        </div>
                    </aside>

                    <section className="border-t border-[color:var(--mmo-rule)] pt-8">
                        <div className="border-b border-[color:var(--mmo-rule)] pb-4">
                            <div className="flex flex-wrap gap-6">
                                {Object.keys(categoryCopy).map((categoryKey) => (
                                    <button
                                        key={categoryKey}
                                        type="button"
                                        onClick={() => {
                                            if (categoryKey === 'FREE') {
                                                setSelectedSong(null)
                                            }
                                            setCategory(categoryKey)
                                        }}
                                        className={`border-b pb-2 text-[11px] uppercase tracking-[0.28em] transition-colors ${
                                            category === categoryKey
                                                ? 'border-[var(--mmo-ink)] text-[var(--mmo-ink)]'
                                                : 'border-transparent text-[var(--mmo-muted)] hover:text-[var(--mmo-ink)]'
                                        }`}
                                    >
                                        {categoryKey === 'FREE' ? '자유게시판' : '노래 추천'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {category === 'RECOMMEND' && (
                                <div className="border-b border-[color:var(--mmo-rule)] py-6">
                                    <div className="grid gap-5 lg:grid-cols-[170px_minmax(0,1fr)]">
                                        <div>
                                            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                                Linked song
                                            </p>
                                        </div>

                                        <div>
                                            {selectedSong ? (
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={selectedSong.artworkUrl100}
                                                            alt={selectedSong.trackName}
                                                            className="h-16 w-16 shrink-0 object-cover"
                                                        />
                                                        <div className="min-w-0">
                                                            <div className="truncate text-xl font-semibold text-[var(--mmo-ink)]">
                                                                {selectedSong.trackName}
                                                            </div>
                                                            <div className="truncate text-sm text-[var(--mmo-muted)]">
                                                                {selectedSong.artistName}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsSearchOpen(true)}
                                                            className="inline-flex items-center gap-2 border-b border-[color:var(--mmo-rule)] pb-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors hover:text-[var(--mmo-ink)]"
                                                        >
                                                            <Search className="h-4 w-4" />
                                                            다시 검색
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedSong(null)}
                                                            className="inline-flex items-center gap-2 border-b border-[color:var(--mmo-rule)] pb-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors hover:text-[var(--mmo-ink)]"
                                                        >
                                                            <X className="h-4 w-4" />
                                                            연결 해제
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-base leading-8 text-[var(--mmo-muted)]">
                                                        추천 글에는 먼저 곡을 하나 연결해야 합니다.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsSearchOpen(true)}
                                                        className="mt-4 inline-flex items-center gap-2 border-b-2 border-[var(--mmo-ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)]"
                                                    >
                                                        <Music className="h-4 w-4" />
                                                        노래 검색하기
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="border-b border-[color:var(--mmo-rule)] py-6">
                                <div className="grid gap-5 lg:grid-cols-[170px_minmax(0,1fr)]">
                                    <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full border-b border-[color:var(--mmo-rule)] bg-transparent px-0 py-3 text-[1.15rem] font-semibold text-[var(--mmo-ink)] outline-none placeholder:text-[#988d82]"
                                        placeholder="제목을 입력하세요"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="border-b border-[color:var(--mmo-rule)] py-6">
                                <div className="grid gap-5 lg:grid-cols-[170px_minmax(0,1fr)]">
                                    <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                        Content
                                    </label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="h-72 w-full border border-[color:var(--mmo-rule)] bg-transparent px-4 py-4 text-base leading-8 text-[var(--mmo-ink)] outline-none placeholder:text-[#988d82] resize-none"
                                        placeholder={categoryCopy[category].placeholder}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-8">
                                <button
                                    type="submit"
                                    disabled={loading || (category === 'RECOMMEND' && !selectedSong)}
                                    className="inline-flex items-center gap-2 border-b-2 border-[var(--mmo-ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)] disabled:text-[var(--mmo-muted)]"
                                >
                                    {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    등록하기
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>

            {isSearchOpen && (
                <div className="fixed inset-0 z-50 bg-[rgba(23,19,16,0.65)] px-4 py-10">
                    <div className="mx-auto flex h-full max-w-4xl flex-col overflow-hidden border border-[color:var(--mmo-rule)] bg-[var(--mmo-paper)] shadow-[0_28px_60px_rgba(23,19,16,0.24)]">
                        <div className="flex items-center justify-between border-b border-[color:var(--mmo-rule)] px-6 py-5">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                                    Search song
                                </p>
                                <h3 className="font-display mt-3 text-[2rem] font-bold tracking-[-0.05em] text-[var(--mmo-ink)]">
                                    연결할 곡 찾기
                                </h3>
                            </div>

                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="inline-flex items-center gap-2 border-b border-[color:var(--mmo-rule)] pb-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors hover:text-[var(--mmo-ink)]"
                            >
                                <X className="h-4 w-4" />
                                닫기
                            </button>
                        </div>

                        <div className="border-b border-[color:var(--mmo-rule)] px-6 py-5">
                            <form onSubmit={handleSearch} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_110px]">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full border-b border-[color:var(--mmo-rule)] bg-transparent px-0 py-3 text-[1.1rem] text-[var(--mmo-ink)] outline-none placeholder:text-[#988d82]"
                                    placeholder="노래 제목 또는 아티스트 검색"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center gap-2 border-b-2 border-[var(--mmo-ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)] disabled:text-[var(--mmo-muted)]"
                                    disabled={searchLoading}
                                >
                                    <Search className="h-4 w-4" />
                                    검색
                                </button>
                            </form>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6">
                            {searchLoading ? (
                                <div className="py-16 text-center text-[var(--mmo-muted)]">검색 중입니다.</div>
                            ) : searchResults.length > 0 ? (
                                <div className="border-b border-[color:var(--mmo-rule)]">
                                    {searchResults.map((song) => (
                                        <button
                                            key={song.trackId}
                                            type="button"
                                            onClick={() => handleSelectSong(song)}
                                            className="group grid w-full gap-4 border-t border-[color:var(--mmo-rule)] py-5 text-left transition-colors hover:bg-[rgba(23,19,16,0.03)] md:grid-cols-[72px_minmax(0,1fr)_120px] md:items-center"
                                        >
                                            <img
                                                src={song.artworkUrl100}
                                                alt={song.trackName}
                                                className="h-[72px] w-[72px] object-cover"
                                            />
                                            <div className="min-w-0">
                                                <div className="truncate text-xl font-semibold text-[var(--mmo-ink)]">
                                                    {song.trackName}
                                                </div>
                                                <div className="truncate text-sm text-[var(--mmo-muted)]">
                                                    {song.artistName}
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors group-hover:text-[var(--mmo-ink)]">
                                                선택
                                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center text-[var(--mmo-muted)]">
                                    {searchQuery ? '검색 결과가 없습니다.' : '검색어를 입력하면 결과가 표시됩니다.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
