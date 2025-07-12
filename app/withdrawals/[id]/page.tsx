'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiAlertCircle, FiCheckCircle, FiClock, FiDollarSign, FiUser, FiPhone, FiMail, FiCreditCard, FiX } from 'react-icons/fi'
import { Timestamp } from 'firebase/firestore'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { approveWithdrawal, getWithdrawalById, rejectWithdrawal } from '@/server/withdrawals'
import { Withdrawal } from '@/app/model/withdraw_model'
import Modal from '@/components/Modal'

const WithdrawalDetails = () => {
    const router = useRouter()
    const params = useParams()
    const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null)
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')

    React.useEffect(() => {
        if (!params?.id) return

        const fetchWithdrawal = async () => {
            try {
                setLoading(true)
                const withdrawalData = await getWithdrawalById(params.id as string)
                if (!withdrawalData) {
                    toast.error('Withdrawal not found')
                    return router.push('/withdrawals/pending')
                }
                setWithdrawal(withdrawalData)
            } catch (error) {
                console.error('Error fetching withdrawal:', error)
                toast.error('Failed to load withdrawal details')
            } finally {
                setLoading(false)
            }
        }

        fetchWithdrawal()
    }, [params?.id, router])

    const handleApprove = async () => {
        if (!params?.id) return

        try {
            setApproving(true)
            await approveWithdrawal(params.id as string)
            toast.success('Withdrawal approved successfully')
            router.refresh()
            setWithdrawal(prev => prev ? {
                ...prev,
                status: 'completed',
                approvedAt: { seconds: Date.now() / 1000 } as Timestamp,
                approvedBy: 'admin_user_id'
            } : null)
        } catch (error) {
            console.error('Error approving withdrawal:', error)
            toast.error('Failed to approve withdrawal')
        } finally {
            setApproving(false)
        }
    }

    const handleReject = async () => {
        if (!params?.id || !rejectionReason.trim()) {
            toast.error('Please provide a rejection reason')
            return
        }

        try {
            setRejecting(true)
            await rejectWithdrawal(params.id as string, 'admin_user_id', rejectionReason)

            toast.success('Withdrawal rejected successfully')
            router.refresh()
            setWithdrawal(prev => prev ? {
                ...prev,
                status: 'rejected',
                rejectedAt: { seconds: Date.now() / 1000 } as Timestamp,
                rejectedBy: 'admin_user_id',
                rejectionReason
            } : null)

            setShowRejectModal(false)
            setRejectionReason('')
        } catch (error) {
            console.error('Error rejecting withdrawal:', error)
            toast.error('Failed to reject withdrawal')
        } finally {
            setRejecting(false)
        }
    }

    const formatDate = (timestamp?: Timestamp) => {
        if (!timestamp) return 'N/A'
        const date = new Date(timestamp.seconds * 1000)
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!withdrawal) {
        return (
            <div className="p-4 text-center">
                <p className="text-lg text-gray-600">Withdrawal not found</p>
                <Link href="/withdrawals/pending" className="text-blue-500 hover:underline mt-4 inline-block">
                    Back to Pending Withdrawals
                </Link>
            </div>
        )
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Link href="/withdrawals/pending" className="mr-4">
                    <FiArrowLeft className="text-2xl" />
                </Link>
                <h1 className="text-2xl font-bold">Withdrawal Details</h1>
                <div className="ml-auto">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${withdrawal.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : withdrawal.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {withdrawal.status === 'pending' ? (
                            <>
                                <FiClock className="mr-1" /> Pending
                            </>
                        ) : withdrawal.status === 'completed' ? (
                            <>
                                <FiCheckCircle className="mr-1" /> Completed
                            </>
                        ) : (
                            <>
                                <FiX className="mr-1" /> Rejected
                            </>
                        )}
                    </span>
                </div>
            </div>

            {/* Rejection Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => {
                    setShowRejectModal(false)
                    setRejectionReason('')
                }}
                title="Reject Withdrawal"
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Rejection *
                        </label>
                        <textarea
                            id="rejectionReason"
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the reason for rejecting this withdrawal..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                setShowRejectModal(false)
                                setRejectionReason('')
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={rejecting || !rejectionReason.trim()}
                            className={`px-4 py-2 rounded-md text-white ${rejecting || !rejectionReason.trim()
                                ? 'bg-red-400'
                                : 'bg-red-500 hover:bg-red-600'
                                }`}
                        >
                            {rejecting ? 'Processing...' : 'Confirm Rejection'}
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header Section */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-medium">Withdrawal #{withdrawal.id}</h2>
                        <div className="text-gray-500 text-sm">
                            Requested on {formatDate(withdrawal.date)}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Amount Card */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <FiDollarSign className="text-gray-500 mr-2" />
                                <h3 className="font-medium">Amount</h3>
                            </div>
                            <p className="text-2xl font-bold">₦{withdrawal.amount.toLocaleString()}</p>
                        </div>

                        {/* Type Card */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <FiUser className="text-gray-500 mr-2" />
                                <h3 className="font-medium">Type</h3>
                            </div>
                            <p className="text-lg capitalize">{withdrawal.type}</p>
                        </div>
                    </div>

                    {/* Bank Details Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                            <FiCreditCard className="mr-2" /> Bank Details
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Bank Name</p>
                                    <p className="font-medium">{withdrawal.bankName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Number</p>
                                    <p className="font-medium">{withdrawal.accountNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Name</p>
                                    <p className="font-medium">{withdrawal.accountName}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Information Section */}
                    {withdrawal.user && (
                        <div className="mb-8">
                            <h3 className="text-lg font-medium mb-4 flex items-center">
                                <FiUser className="mr-2" /> {withdrawal.type === 'pharmacy' ? 'Pharmacy' : 'Doctor'} Information
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium">{withdrawal.user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{withdrawal.user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{withdrawal.user.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Approval/Rejection Information */}
                    {withdrawal.status === 'completed' && withdrawal.approvedAt && (
                        <div className="mb-8">
                            <h3 className="text-lg font-medium mb-4">Approval Information</h3>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Approved By</p>
                                        <p className="font-medium">{withdrawal.approvedBy || 'Admin'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Approved At</p>
                                        <p className="font-medium">{formatDate(withdrawal.approvedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {withdrawal.status === 'rejected' && withdrawal.rejectedAt && (
                        <div className="mb-8">
                            <h3 className="text-lg font-medium mb-4">Rejection Information</h3>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Rejected By</p>
                                        <p className="font-medium">{withdrawal.rejectedBy || 'Admin'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Rejected At</p>
                                        <p className="font-medium">{formatDate(withdrawal.rejectedAt)}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-500">Reason</p>
                                        <p className="font-medium">{withdrawal.rejectionReason || 'No reason provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                        <Link
                            href="/withdrawals/pending"
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Back to List
                        </Link>

                        {withdrawal.status === 'pending' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
                                >
                                    Reject Withdrawal
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={approving}
                                    className={`px-4 py-2 rounded-md text-white ${approving ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'
                                        }`}
                                >
                                    {approving ? 'Processing...' : 'Approve Withdrawal'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WithdrawalDetails