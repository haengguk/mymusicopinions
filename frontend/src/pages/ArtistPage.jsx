import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Disc, Star, ExternalLink, ArrowRight } from 'lucide-react'
import api from '../api/axios'

const formatYear = (dateString) => {
    if (!dateString) return '연도 미상'
    return new Date(dateString).getFullYear()
}

export default function ArtistPage() {
    const { artistName } = useParams()
    const navigate = useNavigate()

    const [topTracks, setTopTracks] = useState([])
    const [albums, setAlbums] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [tracksRes, albumsRes] = await Promise.all([
                    api.get(`/api/artists/${artistName}/top-tracks`),
                    api.get(`/api/artists/${artistName}/albums`),
                ])

                setTopTracks(tracksRes.data)
                setAlbums(albumsRes.data)
            } catch (error) {
                console.error('Failed to fetch artist data', error)
            } finally {
                setLoading(false)
            }
        }

        if (artistName) {
            fetchData()
        }
    }, [artistName])

    const artistImage =
        albums.length > 0
            ? albums[0].artworkUrl100?.replace('100x100', '600x600')
            : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop'

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent px-6 pt-28 text-center text-[var(--mmo-muted)]">
                아티스트 정보를 불러오는 중입니다.
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent pb-16 pt-24 text-[var(--mmo-ink)]">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14">
                    <aside className="h-fit lg:sticky lg:top-28">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 border-b border-[color:var(--mmo-rule)] pb-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors hover:text-[var(--mmo-ink)]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            뒤로가기
                        </button>

                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 overflow-hidden border border-[color:var(--mmo-rule)]"
                        >
                            <img
                                src={artistImage}
                                alt={artistName}
                                className="aspect-square w-full object-cover"
                            />
                        </motion.div>

                        <p className="mt-6 text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                            Artist archive
                        </p>
                        <h1 className="font-display balance-keep mt-4 max-w-[10ch] text-[2.8rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--mmo-ink)] sm:text-[3.2rem]">
                            {artistName}
                        </h1>

                        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[color:var(--mmo-rule)] pt-5">
                            <div>
                                <div className="font-display text-[2.3rem] font-bold leading-none tracking-[-0.05em] text-[var(--mmo-ink)]">
                                    {topTracks.length}
                                </div>
                                <div className="mt-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                    Rated songs
                                </div>
                            </div>
                            <div>
                                <div className="font-display text-[2.3rem] font-bold leading-none tracking-[-0.05em] text-[var(--mmo-ink)]">
                                    {albums.length}
                                </div>
                                <div className="mt-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                    Albums
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="space-y-12 border-t border-[color:var(--mmo-rule)] pt-8">
                        <section>
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                                        Top rated
                                    </p>
                                    <h2 className="font-display mt-3 text-[2.3rem] font-bold tracking-[-0.05em] text-[var(--mmo-ink)] md:text-[3rem]">
                                        우리들의 명곡
                                    </h2>
                                </div>
                                <div className="text-sm leading-7 text-[var(--mmo-muted)]">
                                    커뮤니티에서 높은 평점을 받은 곡 순서입니다.
                                </div>
                            </div>

                            {topTracks.length > 0 ? (
                                <div className="mt-6 border-b border-[color:var(--mmo-rule)]">
                                    {topTracks.map((track, index) => (
                                        <motion.button
                                            key={track.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => navigate(`/songs/${track.itunesTrackId || track.id}`)}
                                            className="group grid w-full gap-5 border-t border-[color:var(--mmo-rule)] py-6 text-left transition-colors hover:bg-[rgba(23,19,16,0.03)] lg:grid-cols-[70px_88px_minmax(0,1fr)_150px]"
                                        >
                                            <div className="font-display text-[2rem] font-bold leading-none tracking-[-0.05em] text-[var(--mmo-accent-soft)] transition-colors group-hover:text-[var(--mmo-accent)]">
                                                {index + 1}
                                            </div>
                                            <img
                                                src={track.imageUrl}
                                                alt={track.title}
                                                className="h-[88px] w-[88px] object-cover"
                                            />
                                            <div className="min-w-0">
                                                <h3 className="font-display text-[1.9rem] leading-[1.06] tracking-[-0.045em] text-[var(--mmo-ink)]">
                                                    {track.title}
                                                </h3>
                                                <p className="mt-2 text-sm text-[var(--mmo-muted)]">{track.album}</p>
                                                <div className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors group-hover:text-[var(--mmo-ink)]">
                                                    곡 보기
                                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-start gap-3 text-sm leading-7 text-[var(--mmo-muted)] lg:items-end">
                                                <span className="inline-flex items-center gap-1.5 text-[var(--mmo-accent)]">
                                                    <Star className="h-4 w-4 fill-current" />
                                                    {track.averageRating.toFixed(1)}
                                                </span>
                                                <span>리뷰 {track.reviewCount}개</span>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-6 border-y border-[color:var(--mmo-rule)] py-16 text-center text-[var(--mmo-muted)]">
                                    아직 등록된 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요.
                                </div>
                            )}
                        </section>

                        <section className="border-t border-[color:var(--mmo-rule)] pt-8">
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                                        Latest releases
                                    </p>
                                    <h2 className="font-display mt-3 text-[2.3rem] font-bold tracking-[-0.05em] text-[var(--mmo-ink)] md:text-[3rem]">
                                        최신 앨범
                                    </h2>
                                </div>
                                <div className="text-sm leading-7 text-[var(--mmo-muted)]">
                                    iTunes에서 연결된 앨범 정보입니다.
                                </div>
                            </div>

                            {albums.length > 0 ? (
                                <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {albums.map((album) => (
                                        <a
                                            key={album.collectionId}
                                            href={album.collectionViewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group block"
                                        >
                                            <div className="overflow-hidden border border-[color:var(--mmo-rule)]">
                                                <img
                                                    src={album.artworkUrl100?.replace('100x100', '500x500')}
                                                    alt={album.collectionName}
                                                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <h3 className="font-display text-[1.5rem] leading-[1.08] tracking-[-0.04em] text-[var(--mmo-ink)]">
                                                    {album.collectionName}
                                                </h3>
                                                <div className="mt-2 flex items-center justify-between gap-4 text-sm text-[var(--mmo-muted)]">
                                                    <span>{formatYear(album.releaseDate)}</span>
                                                    <span className="inline-flex items-center gap-1.5 transition-colors group-hover:text-[var(--mmo-ink)]">
                                                        <ExternalLink className="h-4 w-4" />
                                                        이동
                                                    </span>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-6 border-y border-[color:var(--mmo-rule)] py-16 text-center text-[var(--mmo-muted)]">
                                    앨범 정보를 불러올 수 없습니다.
                                </div>
                            )}
                        </section>
                    </section>
                </div>
            </div>
        </div>
    )
}
