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
import { formatDate } from '@/utils/formatTime'

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

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th scope="col">Type</th>
                            <th scope="col">Bank Details</th>
                            <th scope="col">Status</th>
                            <th scope="col">Amount</th>
                            <th scope="col">Request Date</th>
                            <th scope="col">Approved By</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWithdrawals.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center">
                                    {searchTerm ? 'No matching withdrawals found' : 'No completed withdrawals yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredWithdrawals.map((withdrawal) => (
                                <tr key={withdrawal.id}>
                                    <td className="font-medium text-gray-900 capitalize">
                                        {withdrawal.type}
                                    </td>
                                    <td>
                                        <div className="font-medium text-gray-900">{withdrawal.bankName}</div>
                                        <div className="text-sm text-gray-500">
                                            {withdrawal.accountName} ({withdrawal.accountNumber})
                                        </div>
                                    </td>
                                    <td>
                                        <span className='bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs flex items-center w-fit'>
                                            <FiCheckCircle className="mr-1" /> Completed
                                        </span>
                                    </td>
                                    <td>₦{withdrawal.amount.toLocaleString()}</td>
                                    <td>{formatDate(withdrawal.date)}</td>
                                    <td>{withdrawal.approvedBy || 'System'}</td>
                                    <td>
                                        <Link
                                            href={`/withdrawals/${withdrawal.id}`}
                                            className="table-action"
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