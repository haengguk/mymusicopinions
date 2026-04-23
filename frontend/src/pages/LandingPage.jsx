import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const proofItems = [
    {
        index: '01',
        title: '검색은 빠르게',
        desc: 'iTunes 메타데이터를 바로 끌어와 지금 듣고 있는 곡을 즉시 찾습니다.',
    },
    {
        index: '02',
        title: '리뷰는 깊게',
        desc: '별점만 남기지 않고, 어떤 대목이 남았는지 문장으로 기록합니다.',
    },
    {
        index: '03',
        title: '발견은 사람에게서',
        desc: '추천 알고리즘보다 다른 리스너의 취향과 논쟁에서 다음 곡을 찾습니다.',
    },
]

const detailItems = [
    {
        index: 'A',
        title: '한 곡에서 시작한다',
        desc: '곡 제목이나 아티스트를 찾으면, 커뮤니티의 반응과 함께 첫 감상이 열립니다.',
    },
    {
        index: 'B',
        title: '점수를 문장으로 확장한다',
        desc: '좋아요 수보다 어떤 문장이 남았는지, 무엇을 듣게 했는지가 더 오래 남습니다.',
    },
    {
        index: 'C',
        title: '취향을 아카이브한다',
        desc: '저장, 리뷰, 게시글이 한 사람의 청취 기록이 되도록 차곡차곡 쌓입니다.',
    },
]

const HeroSection = () => {
    const navigate = useNavigate()
    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    })
    const copyY = useTransform(scrollYProgress, [0, 1], [0, 54])
    const imageY = useTransform(scrollYProgress, [0, 1], [0, -72])

    return (
        <section ref={heroRef} className="relative overflow-hidden border-b border-[color:var(--mmo-rule)] pt-28 lg:pt-32">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(159,67,50,0.05),transparent_28%,rgba(23,19,16,0.03)_82%)]" />
            <div className="mx-auto grid max-w-7xl items-end gap-10 px-6 pb-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:gap-14 lg:pb-16">
                <motion.div
                    style={{ y: copyY }}
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10"
                >
                    <p className="mb-5 text-[11px] uppercase tracking-[0.36em] text-[var(--mmo-accent)]">
                        My Music Opinion / Issue 01
                    </p>
                    <div className="mb-8 flex flex-col gap-4 border-b border-[color:var(--mmo-rule)] pb-6 lg:flex-row lg:items-end lg:justify-between">
                        <span className="font-display text-[5rem] leading-none tracking-tight text-[var(--mmo-ink)] md:text-[6.5rem]">
                            MMO
                        </span>
                        <p className="max-w-xs text-sm leading-6 text-[var(--mmo-muted)]">
                            음악을 소비하는 곳이 아니라, 들은 뒤 남는 문장을 쌓아두는 커뮤니티.
                        </p>
                    </div>

                    <h1 className="font-display balance-keep text-[2.8rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--mmo-ink)] sm:text-[3.4rem] md:text-[5.2rem]">
                        <span className="block">취향은 점수가 아니라</span>
                        <span className="block">문장으로 남는다.</span>
                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--mmo-muted)]">
                        MMO는 곡을 검색하고, 리뷰를 남기고, 다른 사람의 해석을 따라 다음 음악으로 넘어가는
                        리스너의 편집물입니다.
                    </p>

                    <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end">
                        <motion.button
                            whileHover={{ x: 8 }}
                            onClick={() => navigate('/signup')}
                            className="group inline-flex items-center gap-3 self-start border-b-2 border-[var(--mmo-ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)]"
                        >
                            Join the issue
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </motion.button>
                        <motion.button
                            whileHover={{ x: 8 }}
                            onClick={() => navigate('/songs')}
                            className="group inline-flex items-center gap-3 self-start border-b border-[color:var(--mmo-rule)] pb-2 text-[12px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]"
                        >
                            Browse the archive
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div
                    style={{ y: imageY }}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    className="relative"
                >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#1c1815]">
                        <img
                            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80"
                            alt="Listening room with records and warm studio lighting"
                            className="h-full w-full object-cover saturate-[0.8] sepia-[0.12]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#16120f]/70 via-[#16120f]/12 to-transparent" />
                        <div className="absolute inset-0 border border-white/20" />
                        <div className="absolute left-6 right-6 top-6 flex items-center justify-between text-[10px] uppercase tracking-[0.34em] text-[#f7f1e8]/70">
                            <span>Seoul</span>
                            <span>Listening room</span>
                        </div>
                        <div className="absolute inset-x-6 bottom-6 border-t border-white/20 pt-4 text-[#f7f1e8]">
                            <p className="font-display text-3xl leading-tight md:text-4xl">
                                Write what stays after the song ends.
                            </p>
                            <p className="mt-3 text-sm uppercase tracking-[0.28em] text-[#f7f1e8]/72">
                                Search, rate, argue, archive
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

const Features = () => {
    return (
        <section className="border-b border-[color:var(--mmo-rule)]">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                        Why it feels different
                    </p>
                    <h2 className="font-display balance-keep mt-4 max-w-[9ch] text-[2.5rem] font-bold leading-[1.06] tracking-[-0.045em] text-[var(--mmo-ink)] md:max-w-none md:text-5xl">
                        <span className="block">플랫폼보다</span>
                        <span className="block">한 권의 음악 잡지처럼.</span>
                    </h2>
                    <p className="mt-5 max-w-xs text-base leading-7 text-[var(--mmo-muted)]">
                        첫 화면부터 끝까지 작은 카드 대신 여백, 분리선, 리듬으로 읽히는 구조를 택합니다.
                    </p>
                </div>

                <div className="grid border-t border-[color:var(--mmo-rule)] md:grid-cols-3 md:border-t-0 md:border-l">
                    {proofItems.map((item, index) => (
                        <motion.article
                            key={item.index}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.55, delay: index * 0.08 }}
                            className="border-b border-[color:var(--mmo-rule)] py-8 md:border-b-0 md:border-r md:px-8 md:py-0 last:border-r-0"
                        >
                            <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--mmo-muted)]">
                                {item.index}
                            </div>
                            <h3 className="font-display mt-5 text-3xl leading-tight text-[var(--mmo-ink)]">
                                {item.title}
                            </h3>
                            <p className="mt-4 max-w-sm text-base leading-7 text-[var(--mmo-muted)]">
                                {item.desc}
                            </p>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    )
}

const DetailSection = () => {
    return (
        <section className="bg-[rgba(230,218,199,0.34)]">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
                <div className="lg:sticky lg:top-28 h-fit">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                        Listening ritual
                    </p>
                    <h2 className="font-display balance-keep mt-4 max-w-[10ch] text-[2.55rem] font-bold leading-[1.06] tracking-[-0.045em] text-[var(--mmo-ink)] md:max-w-none md:text-5xl">
                        <span className="block">검색하고, 남기고,</span>
                        <span className="block">이어 붙입니다.</span>
                    </h2>
                    <p className="mt-5 max-w-xs text-base leading-7 text-[var(--mmo-muted)]">
                        MMO의 흐름은 설명보다 동선이 먼저 보이도록 설계합니다. 한 섹션에 하나의 역할만 남깁니다.
                    </p>
                </div>

                <div className="space-y-8 border-t border-[color:var(--mmo-rule)]">
                    {detailItems.map((item, index) => (
                        <motion.div
                            key={item.index}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.55, delay: index * 0.08 }}
                            className="border-b border-[color:var(--mmo-rule)] py-8"
                        >
                            <div>
                                <h3 className="font-display text-3xl leading-tight text-[var(--mmo-ink)] md:text-[2.5rem]">
                                    {item.title}
                                </h3>
                                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--mmo-muted)]">
                                    {item.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="font-display balance-keep pt-4 max-w-4xl text-[2.2rem] font-extrabold leading-[1.08] tracking-[-0.05em] text-[var(--mmo-ink)] md:text-[3.5rem]"
                    >
                        알고리즘이 아닌 사람의 문장으로 다음 곡을 찾는 곳.
                    </motion.p>
                </div>
            </div>
        </section>
    )
}

const FinalCta = () => {
    const navigate = useNavigate()

    return (
        <section className="mx-auto max-w-7xl px-6 py-20">
            <div className="flex flex-col gap-8 border-y border-[color:var(--mmo-rule)] py-12 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                        Final call
                    </p>
                    <h2 className="font-display balance-keep mt-4 max-w-3xl text-[2.55rem] font-extrabold leading-[1.06] tracking-[-0.05em] text-[var(--mmo-ink)] md:text-6xl">
                        <span className="block">첫 감상을 남기고,</span>
                        <span className="block">다음 사람의 취향에 불을 붙이세요.</span>
                    </h2>
                </div>

                <motion.button
                    whileHover={{ x: 8 }}
                    onClick={() => navigate('/signup')}
                    className="group inline-flex items-center gap-3 self-start border-b-2 border-[var(--mmo-ink)] pb-2 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)]"
                >
                    Create your account
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>
            </div>
        </section>
    )
}

export default function LandingPage() {
    return (
        <div className="bg-transparent text-[var(--mmo-ink)]">
            <HeroSection />
            <Features />
            <DetailSection />
            <FinalCta />

            <footer className="border-t border-[color:var(--mmo-rule)] py-10 text-center text-xs uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                <p>&copy; 2026 My Music Opinion. All rights reserved.</p>
            </footer>
        </div>
    )
}
