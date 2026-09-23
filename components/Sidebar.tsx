'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import { IconType } from 'react-icons'
import {
    FiBell,
    FiBookOpen,
    FiCalendar,
    FiChevronDown,
    FiChevronsLeft,
    FiChevronsRight,
    FiCreditCard,
    FiGrid,
    FiHelpCircle,
    FiLogOut,
    FiMail,
    FiMenu,
    FiPackage,
    FiSend,
    FiShoppingBag,
    FiUser,
    FiUsers,
    FiX,
} from 'react-icons/fi'
import { FaUserInjured, FaUserMd } from 'react-icons/fa'
import { MdLocalPharmacy } from 'react-icons/md'
import { BsListOl } from 'react-icons/bs'
import { TbReportMedical } from 'react-icons/tb'
import { canAccess, ROLE_COOKIE, ROLE_OPTIONS } from '@/utils/roles'
import { useRole } from '@/utils/useRole'

// ---------------------------------------------------------------------------
// Navigation config. Add pages here; items are filtered by role automatically.
// ---------------------------------------------------------------------------
type NavChild = { label: string; href: string }
type NavItem = { label: string; icon: IconType; href?: string; children?: NavChild[] }
type NavGroup = { title: string; items: NavItem[] }

const NAV: NavGroup[] = [
    {
        title: 'Overview',
        items: [{ label: 'Dashboard', icon: FiGrid, href: '/' }],
    },
    {
        title: 'People',
        items: [
            { label: 'Patients', icon: FaUserInjured, href: '/users/patients' },
            { label: 'Doctors', icon: FaUserMd, href: '/users/doctors' },
            { label: 'Pharmacies', icon: MdLocalPharmacy, href: '/pharmacies' },
        ],
    },
    {
        title: 'Operations',
        items: [
            {
                label: 'Appointments', icon: FiCalendar, children: [
                    { label: 'All', href: '/appointments/all' },
                    { label: 'Pending', href: '/appointments/pending' },
                    { label: 'Ongoing', href: '/appointments/ongoing' },
                    { label: 'Cancelled', href: '/appointments/cancelled' },
                ],
            },
            {
                label: 'Orders', icon: FiShoppingBag, children: [
                    { label: 'Pending', href: '/orders/pending' },
                    { label: 'Delivered', href: '/orders/delivered' },
                    { label: 'Cancelled', href: '/orders/cancelled' },
                ],
            },
            {
                label: 'Stock', icon: FiPackage, children: [
                    { label: 'Active', href: '/stocks/active' },
                    { label: 'Out of Stock', href: '/stocks/out-of-stock' },
                ],
            },
        ],
    },
    {
        title: 'Finance',
        items: [
            {
                label: 'Withdrawals', icon: FiCreditCard, children: [
                    { label: 'Pending', href: '/withdrawals/pending' },
                    { label: 'Completed', href: '/withdrawals/completed' },
                    { label: 'Rejected', href: '/withdrawals/rejected' },
                ],
            },
        ],
    },
    {
        title: 'Medical',
        items: [
            { label: 'Lab Results', icon: TbReportMedical, href: '/labresult' },
            { label: 'Anonymous Q&A', icon: FiHelpCircle, href: '/anonymous' },
        ],
    },
    {
        title: 'Engagement',
        items: [
            { label: 'Send Email', icon: FiSend, href: '/mail' },
            { label: 'Newsletter', icon: FiMail, href: '/newsletter' },
            { label: 'Notifications', icon: FiBell, href: '/notification' },
            { label: 'Health Tips', icon: FiBookOpen, href: '/healthtips' },
            { label: 'Waitlist', icon: BsListOl, href: '/waitlist' },
        ],
    },
]

const COLLAPSED_KEY = 'sidebarCollapsed'

const isActive = (pathname: string, href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

const readCookie = (name: string) => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : ''
}

const AdminSidebar = () => {
    const router = useRouter()
    const pathname = usePathname() ?? '/'
    const role = useRole()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
    const [adminName, setAdminName] = useState('')

    // Hide role-gated links until the role is known so they never flash
    const show = (href: string) => role !== null && canAccess(role, href)

    // Filter the config down to what this role can open
    const groups = NAV
        .map(group => ({
            ...group,
            items: group.items
                .map(item => item.children
                    ? { ...item, children: item.children.filter(child => show(child.href)) }
                    : item)
                .filter(item => item.children ? item.children.length > 0 : show(item.href!)),
        }))
        .filter(group => group.items.length > 0)

    useEffect(() => {
        setAdminName(readCookie('adminName'))
        try {
            setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1')
        } catch { /* storage unavailable */ }
    }, [])

    // Open the section that contains the current page, and close the mobile drawer on navigation
    useEffect(() => {
        const activeParent = NAV.flatMap(g => g.items)
            .find(item => item.children?.some(child => isActive(pathname, child.href)))
        if (activeParent) setOpenItems(prev => ({ ...prev, [activeParent.label]: true }))
        setMobileOpen(false)
    }, [pathname])

    const toggleCollapsed = () => {
        const next = !collapsed
        setCollapsed(next)
        try { localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0') } catch { /* ignore */ }
    }

    const toggleItem = (label: string) => {
        // In icon-only mode, clicking a section expands the sidebar to show its pages
        if (collapsed) {
            toggleCollapsed()
            setOpenItems(prev => ({ ...prev, [label]: true }))
            return
        }
        setOpenItems(prev => ({ ...prev, [label]: !prev[label] }))
    }

    const handleLogout = () => {
        document.cookie = 'adminId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = 'adminName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = `${ROLE_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        toast.success('Logged out successfully')
        router.push('/login')
    }

    // Labels show when expanded on desktop, and always in the mobile drawer
    const expanded = !collapsed || mobileOpen
    const roleLabel = ROLE_OPTIONS.find(option => option.value === role)?.label ?? ''
    const initials = adminName.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'A'

    const linkClass = (active: boolean) => `
        group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
        ${active
            ? 'bg-primary/15 text-white'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'}
        ${expanded ? '' : 'justify-center'}
    `

    const ActiveBar = () => (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
    )

    return (
        <>
            {/* Mobile top-left menu button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-40 p-2.5 bg-white rounded-lg shadow-md border border-slate-200 text-slate-700"
                aria-label="Open menu"
            >
                <FiMenu className="text-xl" />
            </button>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
                />
            )}

            <aside
                className={`
                    fixed md:sticky top-0 left-0 z-50 h-screen shrink-0
                    flex flex-col bg-gradient-to-b from-[#0a1a36] to-[#0d2b57] text-slate-300 shadow-xl md:shadow-none
                    transition-all duration-300 ease-in-out
                    ${collapsed ? 'md:w-[76px]' : 'md:w-64'} w-72
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Brand */}
                <div className={`h-16 flex items-center border-b border-white/10 ${expanded ? 'px-5 justify-between' : 'justify-center'}`}>
                    <Link href="/" className="flex items-center gap-2.5">
                        {/* Icon sits on a white tile so it stays crisp on the dark background */}
                        <span className="h-9 w-9 shrink-0 rounded-lg bg-white flex items-center justify-center">
                            <Image src="/logo-icon.png" alt="Instant Doctor" width={28} height={28} className="h-7 w-7 object-contain" priority />
                        </span>
                        {expanded && (
                            <span className="text-lg font-bold tracking-tight">
                                <span className="text-primary">Instant</span><span className="text-white">Doctor</span>
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                        aria-label="Close menu"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
                    {groups.map((group, groupIndex) => (
                        <div key={group.title} className={groupIndex > 0 ? 'mt-5' : ''}>
                            {expanded ? (
                                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    {group.title}
                                </p>
                            ) : (
                                groupIndex > 0 && <div className="mx-3 mb-3 border-t border-white/10" />
                            )}

                            <ul className="space-y-1">
                                {group.items.map(item => {
                                    const Icon = item.icon

                                    if (!item.children) {
                                        const active = isActive(pathname, item.href!)
                                        return (
                                            <li key={item.label}>
                                                <Link href={item.href!} className={linkClass(active)} title={expanded ? undefined : item.label}>
                                                    {active && <ActiveBar />}
                                                    <Icon className={`text-lg shrink-0 ${active ? 'text-primary' : ''}`} />
                                                    {expanded && <span className="truncate">{item.label}</span>}
                                                </Link>
                                            </li>
                                        )
                                    }

                                    const childActive = item.children.some(child => isActive(pathname, child.href))
                                    const open = expanded && !!openItems[item.label]
                                    return (
                                        <li key={item.label}>
                                            <button
                                                type="button"
                                                onClick={() => toggleItem(item.label)}
                                                className={`${linkClass(childActive && !open)} w-full`}
                                                title={expanded ? undefined : item.label}
                                                aria-expanded={open}
                                            >
                                                {childActive && !open && <ActiveBar />}
                                                <Icon className={`text-lg shrink-0 ${childActive ? 'text-primary' : ''}`} />
                                                {expanded && (
                                                    <>
                                                        <span className={`truncate flex-1 text-left ${childActive ? 'text-white' : ''}`}>{item.label}</span>
                                                        <FiChevronDown className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                                                    </>
                                                )}
                                            </button>

                                            {open && (
                                                <ul className="mt-1 ml-5 pl-4 border-l border-white/10 space-y-0.5">
                                                    {item.children.map(child => {
                                                        const active = isActive(pathname, child.href)
                                                        return (
                                                            <li key={child.href}>
                                                                <Link
                                                                    href={child.href}
                                                                    className={`
                                                                        block rounded-md px-3 py-2 text-sm transition-colors
                                                                        ${active
                                                                            ? 'bg-primary/15 text-primary font-medium'
                                                                            : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                                                    `}
                                                                >
                                                                    {child.label}
                                                                </Link>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-white/10 p-3 space-y-1">
                    {show('/team') && (
                        <Link href="/team" className={linkClass(isActive(pathname, '/team'))} title={expanded ? undefined : 'Team & Roles'}>
                            {isActive(pathname, '/team') && <ActiveBar />}
                            <FiUsers className={`text-lg shrink-0 ${isActive(pathname, '/team') ? 'text-primary' : ''}`} />
                            {expanded && <span>Team &amp; Roles</span>}
                        </Link>
                    )}

                    {/* Account card */}
                    <div className={`flex items-center gap-3 rounded-lg p-2 ${expanded ? 'bg-white/5' : 'justify-center'}`}>
                        <Link
                            href="/profile"
                            title="Profile"
                            className={`flex items-center gap-3 min-w-0 flex-1 rounded-lg ${expanded ? '' : 'justify-center'}`}
                        >
                            <span className="h-9 w-9 shrink-0 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                                {adminName ? initials : <FiUser />}
                            </span>
                            {expanded && (
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold text-white truncate">{adminName || 'My account'}</span>
                                    {roleLabel && <span className="block text-xs text-slate-400 truncate">{roleLabel}</span>}
                                </span>
                            )}
                        </Link>
                        {expanded && (
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Log out"
                                aria-label="Log out"
                            >
                                <FiLogOut className="text-lg" />
                            </button>
                        )}
                    </div>

                    {!expanded && (
                        <button
                            onClick={handleLogout}
                            className={`${linkClass(false)} w-full hover:!text-red-400 hover:!bg-red-500/10`}
                            title="Log out"
                            aria-label="Log out"
                        >
                            <FiLogOut className="text-lg shrink-0" />
                        </button>
                    )}

                    {/* Collapse toggle (desktop only) */}
                    <button
                        onClick={toggleCollapsed}
                        className={`hidden md:flex ${linkClass(false)} w-full !text-slate-500 hover:!text-white`}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <FiChevronsRight className="text-lg shrink-0" /> : <FiChevronsLeft className="text-lg shrink-0" />}
                        {expanded && <span>Collapse</span>}
                    </button>
                </div>
            </aside>
        </>
    )
}

export default AdminSidebar
