'use client'
import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import Link from 'next/link'
import { FiEye, FiCheckCircle } from 'react-icons/fi'
import { getCompletedWithdrawals, getWithdrawalUserDetails } from '@/server/withdrawals'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { Withdrawal } from '@/app/model/withdraw_model'
import { Timestamp } from 'firebase/firestore'

const CompletedWithdrawals = () => {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    const fetchWithdrawals = async () => {
        try {
            setLoading(true)
            const completedWithdrawals = await getCompletedWithdrawals()

            // Enhance withdrawals with user details
            const enhancedWithdrawals = await Promise.all(
                completedWithdrawals.map(async withdrawal => {
                    const userDetails = await getWithdrawalUserDetails(withdrawal)
                    return {
                        ...withdrawal,
                        user: userDetails || undefined
                    }
                })
            )

            setWithdrawals(enhancedWithdrawals)
        } catch (error) {
            console.error('Error fetching withdrawals:', error)
            toast.error('Failed to load withdrawals')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWithdrawals()
    }, [])

    const formatDate = (timestamp: Timestamp) => {
        const date = new Date(timestamp.seconds * 1000)
        const now = new Date()

        // If today, show time
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        // If yesterday, show "Yesterday"
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday'
        }

        // Otherwise show full date
        return date.toLocaleDateString()
    }

    const filteredWithdrawals = withdrawals.filter(withdrawal => {
        const searchLower = searchTerm.toLowerCase()
        return (
            withdrawal.id.toLowerCase().includes(searchLower) ||
            withdrawal.amount.toString().includes(searchLower) ||
            formatDate(withdrawal.date).toLowerCase().includes(searchLower) ||
            withdrawal.bankName.toLowerCase().includes(searchLower) ||
            withdrawal.accountName.toLowerCase().includes(searchLower) ||
            withdrawal.accountNumber.includes(searchTerm) ||
            (withdrawal.approvedBy && withdrawal.approvedBy.toLowerCase().includes(searchLower))
        )
    })

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <h4 className='text-3xl font-bold text-center mb-5 uppercase'>Completed Withdrawals</h4>

            <div className="flex justify-center gap-2 md:flex-row flex-col mb-6">
                <div className="relative w-full max-w-2xl">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <IoSearchOutline />
                    </div>
                    <input
                        type="search"
                        className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search by bank, account name, amount, or date"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3">Type</th>
                            <th scope="col" className="px-4 py-3">Bank Details</th>
                            <th scope="col" className="px-4 py-3">Status</th>
                            <th scope="col" className="px-4 py-3">Amount</th>
                            <th scope="col" className="px-4 py-3">Request Date</th>
                            <th scope="col" className="px-4 py-3">Approved By</th>
                            <th scope="col" className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWithdrawals.length === 0 ? (
                            <tr className="bg-white border-b">
                                <td colSpan={7} className="px-4 py-4 text-center">
                                    {searchTerm ? 'No matching withdrawals found' : 'No completed withdrawals yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredWithdrawals.map((withdrawal) => (
                                <tr key={withdrawal.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-4 font-medium text-gray-900 capitalize">
                                        {withdrawal.type}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-gray-900">{withdrawal.bankName}</div>
                                        <div className="text-sm text-gray-500">
                                            {withdrawal.accountName} ({withdrawal.accountNumber})
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className='bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs flex items-center w-fit'>
                                            <FiCheckCircle className="mr-1" /> Completed
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">₦{withdrawal.amount.toLocaleString()}</td>
                                    <td className="px-4 py-4">{formatDate(withdrawal.date)}</td>
                                    <td className="px-4 py-4">{withdrawal.approvedBy || 'System'}</td>
                                    <td className="px-4 py-4">
                                        <Link
                                            href={`/withdrawals/${withdrawal.id}`}
                                            className='inline-flex items-center bg-blue-500 text-white px-3 py-1 rounded-lg text-sm'
                                        >
                                            <FiEye className="mr-1" /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CompletedWithdrawals