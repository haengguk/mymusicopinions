import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import api from '../api/axios'

const fieldClassName =
    'mt-3 flex items-center gap-3 border-b border-[color:var(--mmo-rule)] pb-3 transition-colors focus-within:border-[var(--mmo-ink)]'

const inputClassName =
    'w-full bg-transparent text-lg text-[var(--mmo-ink)] placeholder:text-[#9a8f84] outline-none'

export default function SignupPage() {
    const [formData, setFormData] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await api.post('/api/auth/signup', formData)
            setSuccess(true)
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.message || '회원가입 실패. 다시 시도해주세요.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-transparent px-6 pb-16 pt-28 text-[var(--mmo-ink)]">
                <div className="mx-auto max-w-4xl border-y border-[color:var(--mmo-rule)]">
                    <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)]">
                        <motion.section
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55 }}
                            className="border-b border-[color:var(--mmo-rule)] px-0 py-12 lg:border-b-0 lg:border-r lg:px-10"
                        >
                            <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--mmo-accent)]">
                                Account created
                            </p>
                            <h1 className="font-display balance-keep mt-5 max-w-[9ch] text-[2.7rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--mmo-ink)] md:text-[4rem]">
                                <span className="block">계정 생성이</span>
                                <span className="block">완료되었습니다.</span>
                            </h1>
                            <p className="mt-6 max-w-md text-lg leading-8 text-[var(--mmo-muted)]">
                                잠시 후 로그인 페이지로 이동합니다.
                            </p>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.08 }}
                            className="px-0 py-12 lg:px-10"
                        >
                            <div className="flex items-center gap-3 text-[var(--mmo-accent)]">
                                <CheckCircle2 className="h-6 w-6" />
                                <span className="text-[11px] font-semibold uppercase tracking-[0.32em]">
                                    Ready to log in
                                </span>
                            </div>
                            <p className="mt-6 max-w-md text-base leading-7 text-[var(--mmo-muted)]">
                                생성한 계정으로 바로 로그인할 수 있습니다.
                            </p>
                            <Link
                                to="/login"
                                className="group mt-10 inline-flex items-center gap-3 border-b-2 border-[var(--mmo-ink)] pb-3 text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)]"
                            >
                                로그인 페이지로 이동
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </motion.section>
                    </div>
                </div>
            </div>
        )
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
                            Create account
                        </p>
                        <h1 className="font-display balance-keep mt-5 max-w-[10ch] text-[2.7rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--mmo-ink)] sm:text-[3rem] md:text-[4.3rem]">
                            <span className="block">계정을 만들고</span>
                            <span className="block">첫 기록을 남기기</span>
                        </h1>
                        <p className="mt-6 max-w-md text-lg leading-8 text-[var(--mmo-muted)]">
                            아이디와 비밀번호만 입력하면 바로 시작할 수 있습니다.
                        </p>

                        <div className="mt-10 space-y-5 border-t border-[color:var(--mmo-rule)] pt-6">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                    Start
                                </p>
                                <p className="mt-2 text-base leading-7 text-[var(--mmo-muted)]">
                                    가입 후 로그인 페이지로 이동합니다.
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-accent)]">
                                    Input
                                </p>
                                <p className="mt-2 text-base leading-7 text-[var(--mmo-muted)]">
                                    현재는 아이디와 비밀번호 두 항목만 받습니다.
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
                            Sign up
                        </p>
                        <h2 className="font-display balance-keep mt-4 max-w-[10ch] text-[2.15rem] font-bold leading-[1.08] tracking-[-0.05em] text-[var(--mmo-ink)] md:max-w-none md:text-[2.8rem]">
                            <span className="block">가입 정보를 입력하고</span>
                            <span className="block">바로 시작합니다.</span>
                        </h2>
                        <p className="mt-4 max-w-md text-base leading-7 text-[var(--mmo-muted)]">
                            회원가입이 완료되면 로그인 페이지로 이동합니다.
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
                                        placeholder="사용할 아이디를 입력하세요"
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
                                        placeholder="사용할 비밀번호를 입력하세요"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={inputClassName}
                                        autoComplete="new-password"
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
                                <span>{loading ? '가입 중' : '회원가입'}</span>
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </motion.button>
                        </form>

                        <div className="mt-10 border-t border-[color:var(--mmo-rule)] pt-6 text-sm text-[var(--mmo-muted)]">
                            이미 계정이 있으신가요?{' '}
                            <Link
                                to="/login"
                                className="border-b border-[var(--mmo-ink)] pb-0.5 font-semibold text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)]"
                            >
                                로그인
                            </Link>
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    )
}
