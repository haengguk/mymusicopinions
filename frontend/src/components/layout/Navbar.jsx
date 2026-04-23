import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const { user, logout } = useAuth()
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: '홈', path: '/' },
        { name: '음악', path: '/songs' },
        { name: '커뮤니티', path: '/board' },
    ]

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
                scrolled
                    ? 'border-[color:var(--mmo-rule)] bg-[rgba(243,237,226,0.92)] py-3 shadow-[0_10px_30px_var(--mmo-shadow)] backdrop-blur-md'
                    : 'border-transparent bg-[rgba(243,237,226,0.72)] py-5 backdrop-blur-sm'
            }`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
                <Link to="/" className="group">
                    <span className="block text-[10px] uppercase tracking-[0.34em] text-[var(--mmo-muted)]">
                        Music review journal
                    </span>
                    <span className="font-display text-[1.9rem] leading-none tracking-tight text-[var(--mmo-ink)]">
                        MMO
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`border-b pb-1 text-[11px] uppercase tracking-[0.28em] transition-colors ${
                                location.pathname === link.path
                                    ? 'border-[var(--mmo-ink)] text-[var(--mmo-ink)]'
                                    : 'border-transparent text-[var(--mmo-muted)] hover:text-[var(--mmo-ink)]'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-5">
                    {user ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 border border-[color:var(--mmo-rule)] px-4 py-2 text-sm font-semibold text-[var(--mmo-ink)] transition-colors hover:bg-[rgba(23,19,16,0.04)]">
                                <User className="w-4 h-4" />
                                {user.username}
                            </button>

                            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 w-48">
                                <div className="overflow-hidden border border-[color:var(--mmo-rule)] bg-[var(--mmo-paper)] p-1 shadow-[0_12px_24px_var(--mmo-shadow)]">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--mmo-muted)] transition-colors hover:bg-[rgba(23,19,16,0.04)] hover:text-[var(--mmo-ink)]"
                                    >
                                        <User className="w-4 h-4" /> 마이페이지
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-[var(--mmo-accent)] transition-colors hover:bg-[rgba(159,67,50,0.08)]"
                                    >
                                        <LogOut className="w-4 h-4" /> 로그아웃
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="border-b border-transparent pb-1 text-[11px] uppercase tracking-[0.28em] text-[var(--mmo-muted)] transition-colors hover:border-[var(--mmo-ink)] hover:text-[var(--mmo-ink)]"
                            >
                                로그인
                            </Link>
                            <Link
                                to="/signup"
                                className="border-b-2 border-[var(--mmo-ink)] pb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--mmo-ink)] transition-colors hover:text-[var(--mmo-accent)]"
                            >
                                회원가입
                            </Link>
                        </>
                    )}
                </div>

                <button className="md:hidden text-[var(--mmo-ink)]" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden overflow-hidden border-t border-[color:var(--mmo-rule)] bg-[var(--mmo-paper)]"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="border-b border-[color:var(--mmo-rule)] pb-3 text-sm font-medium text-[var(--mmo-ink)]"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <hr className="border-[color:var(--mmo-rule)]" />
                            {user ? (
                                <>
                                    <div className="flex items-center gap-2 text-[var(--mmo-ink)]">
                                        <User className="w-4 h-4" />
                                        {user.username}
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout()
                                            setIsOpen(false)
                                        }}
                                        className="text-left font-semibold text-[var(--mmo-accent)]"
                                    >
                                        로그아웃
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-[var(--mmo-ink)]">
                                        로그인
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="font-semibold text-[var(--mmo-accent)]"
                                    >
                                        회원가입
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
