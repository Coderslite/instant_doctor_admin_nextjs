'use client'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { IoSearchOutline } from 'react-icons/io5'
import { FiSend, FiX } from 'react-icons/fi'
import { UserModel } from '@/app/model/user_model'
import { getAllUsers } from '@/server/user'
import { getPharmacyId } from '@/server/auth'
import { getRecentSentEmails, logSentEmail, SentEmailModel } from '@/server/sentEmails'
import { buildPersonalEmailHtml, isSafeUrl, sendMail } from '@/utils/mailApi'
import { maskEmail } from '@/utils/roles'
import { useRole } from '@/utils/useRole'
import { formatDate } from '@/utils/formatTime'

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'

const fullName = (user: UserModel) => `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() || 'Unnamed user'

const readCookie = (name: string) => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : ''
}

const SendMail = () => {
    const role = useRole()
    const isAdmin = role === 'admin'
    const [users, setUsers] = useState<UserModel[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [recipient, setRecipient] = useState<UserModel | null>(null)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [ctaText, setCtaText] = useState('')
    const [ctaUrl, setCtaUrl] = useState('')
    const [isPreview, setIsPreview] = useState(false)
    const [previewWidth, setPreviewWidth] = useState<'desktop' | 'mobile'>('desktop')
    const [isSending, setIsSending] = useState(false)
    const [recent, setRecent] = useState<SentEmailModel[]>([])

    const loadRecent = () =>
        getRecentSentEmails().then(setRecent).catch(error => console.error('Error fetching sent emails:', error))

    useEffect(() => {
        getAllUsers()
            .then(allUsers => {
                const withEmail = allUsers.filter(u => u.email)
                setUsers(withEmail)
                // Pre-select a recipient when opened from a user list (?userId=...)
                const userId = new URLSearchParams(window.location.search).get('userId')
                const preselected = withEmail.find(u => u.id === userId)
                if (preselected) setRecipient(preselected)
            })
            .catch(error => {
                console.error('Error fetching users:', error)
                toast.error('Could not load users')
            })
            .finally(() => setLoading(false))
        loadRecent()
    }, [])

    const matches = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return []
        return users
            .filter(u =>
                fullName(u).toLowerCase().includes(term) ||
                // Only admins can look people up by their (unmasked) email
                (isAdmin && u.email.toLowerCase().includes(term))
            )
            .slice(0, 8)
    }, [search, users, isAdmin])

    const displayEmail = (email: string) => (isAdmin ? email : maskEmail(email))

    const html = recipient
        ? buildPersonalEmailHtml({ recipientName: recipient.firstname ?? '', subject, message, ctaText, ctaUrl })
        : ''

    const handleSend = async () => {
        if (!recipient) return toast.error('Choose a recipient')
        if (!subject.trim()) return toast.error('Enter a subject')
        if (!message.trim()) return toast.error('Write a message')
        if ((ctaText.trim() || ctaUrl.trim()) && !(ctaText.trim() && isSafeUrl(ctaUrl))) {
            return toast.error('A button needs both text and a full link starting with https://')
        }
        if (!confirm(`Send "${subject}" to ${fullName(recipient)}?`)) return

        setIsSending(true)
        try {
            await sendMail({ subject: subject.trim(), html, emails: [recipient.email] })
            await logSentEmail({
                recipientId: recipient.id,
                recipientName: fullName(recipient),
                subject: subject.trim(),
                message,
                sentById: getPharmacyId(),
                sentByName: readCookie('adminName'),
            }).catch(error => console.error('Email sent but could not be logged:', error))
            toast.success(`Email sent to ${fullName(recipient)}`)
            setSubject('')
            setMessage('')
            setCtaText('')
            setCtaUrl('')
            setIsPreview(false)
            loadRecent()
        } catch (error: any) {
            console.error('Error sending email:', error)
            toast.error(error.message === 'Failed to fetch'
                ? 'Could not reach the mail server'
                : error.message || 'Failed to send email')
        } finally {
            setIsSending(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h4 className='text-3xl font-bold text-center mb-2 uppercase'>Send Email</h4>
            <p className="text-center text-gray-600 mb-8">Send a personal email to a single patient or doctor</p>

            <div className="bg-white rounded-2xl shadow p-6 space-y-5">
                {/* Recipient */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">To:</label>
                    {recipient ? (
                        <div className="flex items-center justify-between gap-3 border border-blue-500 bg-blue-50 rounded-lg px-3 py-2">
                            <div>
                                <span className="font-medium text-gray-900">{fullName(recipient)}</span>
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">{recipient.role}</span>
                                <span className="block text-sm text-gray-600">{displayEmail(recipient.email)}</span>
                            </div>
                            <button onClick={() => setRecipient(null)} className="text-gray-500 hover:text-gray-700" aria-label="Change recipient">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <IoSearchOutline />
                            </div>
                            <input
                                type="search"
                                placeholder={isAdmin ? 'Search by name or email' : 'Search by name'}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className={`${inputClass} ps-10`}
                            />
                            {search.trim() && (
                                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                                    {matches.length === 0 ? (
                                        <li className="px-4 py-3 text-sm text-gray-500">No users found</li>
                                    ) : matches.map(user => (
                                        <li key={user.id}>
                                            <button
                                                type="button"
                                                onClick={() => { setRecipient(user); setSearch('') }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-50"
                                            >
                                                <span className="font-medium text-gray-900">{fullName(user)}</span>
                                                <span className="ml-2 text-xs text-gray-500">{user.role}</span>
                                                <span className="block text-sm text-gray-600">{displayEmail(user.email)}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Subject */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Subject:</label>
                    <input
                        type="text"
                        placeholder="Enter email subject..."
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {/* Message / preview */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-gray-700 font-medium">Message:</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsPreview(false)}
                                className={`px-3 py-1 rounded-lg border text-sm ${!isPreview ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                            >
                                Write
                            </button>
                            <button
                                onClick={() => setIsPreview(true)}
                                disabled={!recipient}
                                className={`px-3 py-1 rounded-lg border text-sm disabled:opacity-50 ${isPreview ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}
                            >
                                Preview
                            </button>
                        </div>
                    </div>
                    {isPreview && recipient ? (
                        <div>
                            <div className="flex justify-end gap-2 mb-2">
                                {(['desktop', 'mobile'] as const).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setPreviewWidth(mode)}
                                        className={`px-3 py-1 rounded-lg text-xs border capitalize ${previewWidth === mode ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                            <div className="bg-gray-100 rounded-lg p-2 flex justify-center">
                                <iframe
                                    title="email-preview"
                                    srcDoc={html}
                                    className={`h-[600px] border border-gray-200 rounded-lg bg-white transition-all ${previewWidth === 'mobile' ? 'w-[375px] max-w-full' : 'w-full'}`}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <textarea
                                rows={10}
                                placeholder="Write your message. It will start with “Hi {first name},” and end with the Instant Doctor sign-off."
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className={inputClass}
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave a blank line between paragraphs.</p>
                        </>
                    )}
                </div>

                {/* Optional button */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">
                        Button <span className="text-gray-400 font-normal text-sm">(optional)</span>
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Button text, e.g. Book a consultation"
                            value={ctaText}
                            onChange={e => setCtaText(e.target.value)}
                            className={inputClass}
                        />
                        <input
                            type="url"
                            placeholder="https://instantdoctor.co/..."
                            value={ctaUrl}
                            onChange={e => setCtaUrl(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
                    >
                        <FiSend /> {isSending ? 'Sending…' : 'Send Email'}
                    </button>
                </div>
            </div>

            {/* Recently sent */}
            <div className="mt-10">
                <h5 className="font-bold text-xl mb-3">Recently sent</h5>
                {recent.length === 0 ? (
                    <p className="text-gray-500 text-sm">No individual emails sent yet.</p>
                ) : (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>To</th>
                                    <th>Subject</th>
                                    <th>Sent by</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map(entry => (
                                    <tr key={entry.id}>
                                        <td className="font-medium text-gray-900">{entry.recipientName}</td>
                                        <td>{entry.subject}</td>
                                        <td>{entry.sentByName || '—'}</td>
                                        <td>{formatDate(entry.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SendMail
