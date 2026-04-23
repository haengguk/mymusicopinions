import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const fieldClassName =
    'mt-3 flex items-center gap-3 border-b border-[color:var(--mmo-rule)] pb-3 transition-colors focus-within:border-[var(--mmo-ink)]'

const inputClassName =
    'w-full bg-transparent text-lg text-[var(--mmo-ink)] placeholder:text-[#9a8f84] outline-none'

export default function LoginPage() {
    const [formData, setFormData] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await api.post('/api/auth/login', formData)

            const token = response.headers['authorization']
            if (token) {
                login(token, formData.username)
                navigate('/')
            } else {
                setError('로그인 실패: 토큰을 받지 못했습니다.')
            }
        } catch (err) {
            console.error(err)
            setError('아이디 또는 비밀번호가 올바르지 않습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-transparent px-6 pb-16 pt-28 text-[var(--mmo-ink)]">
            <div className="mx-auto max-w-6xl border-y border-[color:var(--mmo-rule)]">
                <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
                    <motion.section
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                        className="border-b border-[color:var(--mmo-rule)] px-0 py-12 lg:border-b-0 lg:border-r lg:px-10"
                    >
                        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                            Log in
                        </p>
                        <h1 className="font-display balance-keep mt-5 max-w-[9ch] text-[2.7rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--mmo-ink)] sm:text-[3rem] md:text-[4.3rem]">
                            <span className="block">계정에 로그인하고</span>
                            <span className="block">이어서 둘러보기</span>
                        </h1>
                        <p className="mt-6 max-w-md text-lg leading-8 text-[var(--mmo-muted)]">
                            저장한 곡, 리뷰, 게시글을 계속 보려면 등록된 계정 정보를 입력하세요.
                        </p>

                        <div className="mt-10 space-y-5 border-t border-[color:var(--mmo-rule)] pt-6">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                    Access
                                </p>
                                <p className="mt-2 text-base leading-7 text-[var(--mmo-muted)]">
                                    로그인 후 홈, 프로필, 리뷰 작성 화면을 바로 이어서 이용할 수 있습니다.
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                    Account
                                </p>
                                <p className="mt-2 text-base leading-7 text-[var(--mmo-muted)]">
                                    아이디와 비밀번호만 입력하면 됩니다.
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.08 }}
                        className="px-0 py-12 lg:px-10"
                    >
                        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                            Account access
                        </p>
                        <h2 className="font-display balance-keep mt-4 max-w-[11ch] text-[2.15rem] font-bold leading-[1.08] tracking-[-0.05em] text-[var(--mmo-ink)] md:max-w-none md:text-[2.8rem]">
                            <span className="block">아이디와 비밀번호를</span>
                            <span className="block">입력합니다.</span>
                        </h2>
                        <p className="mt-4 max-w-md text-base leading-7 text-[var(--mmo-muted)]">
                            등록된 계정 정보로 로그인합니다.
                        </p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 flex items-start gap-3 border border-[rgba(159,67,50,0.24)] bg-[rgba(159,67,50,0.06)] px-4 py-4 text-sm text-[var(--mmo-accent)]"
                            >
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                            <div>
                                <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                    아이디
                                </label>
                                <div className={fieldClassName}>
                                    <User className="h-5 w-5 text-[var(--mmo-muted)]" />
                                    <input
                                        type="text"
                                        placeholder="아이디를 입력하세요"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className={inputClassName}
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)]">
                                    비밀번호
                                </label>
                                <div className={fieldClassName}>
                                    <Lock className="h-5 w-5 text-[var(--mmo-muted)]" />
                                    <input
                                        type="password"
                                        placeholder="비밀번호를 입력하세요"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={inputClassName}
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ x: 8 }}
                                whileTap={{ x: 2 }}
                                disabled={loading}
                                className="group inline-flex w-full items-center justify-between border-b-2 border-[var(--mmo-ink)] pb-3 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span>{loading ? '로그인 중' : '로그인'}</span>
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </motion.button>
                        </form>

                        <div className="mt-10 border-t border-[color:var(--mmo-rule)] pt-6 text-sm text-[var(--mmo-muted)]">
                            계정이 없으신가요?{' '}
                            <Link
                                to="/signup"
                                className="border-b border-[var(--mmo-ink)] pb-0.5 font-semibold text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)]"
                            >
                                회원가입하기
                            </Link>
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    )
}
