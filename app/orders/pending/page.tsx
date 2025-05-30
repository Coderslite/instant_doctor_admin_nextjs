'use client'
import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { getPendingOrders } from '@/server/order'
import { Timestamp } from 'firebase/firestore'
import Link from 'next/link'
import { FiClock, FiEye, FiAlertCircle } from 'react-icons/fi'
import { getPharmacyId } from '@/server/auth'
import { getPharmacyNameById } from '@/server/pharmacies'
import { OrderModel } from '@/app/model/order_model'

interface OrderItem {
    id: string
    name: string
    amount: number
    quantity: number
}


const PendingOrders = () => {
    const [orders, setOrders] = useState<OrderModel[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true)
                const pendingOrders = await getPendingOrders()
                const ordersWithPharmacyNames = await Promise.all(
                    pendingOrders.map(async (order) => {
                        const pharmacyName = await getPharmacyNameById(order.pharmacyId)
                        return {
                            ...order,
                            pharmacyName
                        }
                    })
                )
                setOrders(ordersWithPharmacyNames);
            } catch (error) {
                console.error('Error fetching orders:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
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

    const filteredOrders = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase()
        return (
            order.id.toLowerCase().includes(searchLower) ||
            order.totalAmount.toString().includes(searchLower) ||
            formatDate(order.createdAt).toLowerCase().includes(searchLower) ||
            order.items.some(item => item.name.toLowerCase().includes(searchLower))
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
            <h4 className='text-3xl font-bold text-center mb-5 uppercase'>Pending Orders</h4>

            <div className="flex justify-center gap-2 md:flex-row flex-col mb-6">
                <div className="relative w-full max-w-2xl">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <IoSearchOutline />
                    </div>
                    <input
                        type="search"
                        className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search by product, order ID, amount, or date"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3">Pharmacy</th>
                            <th scope="col" className="px-4 py-3">Product</th>
                            <th scope="col" className="px-4 py-3">Status</th>
                            <th scope="col" className="px-4 py-3">Amount</th>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3">Invoice</th>
                            <th scope="col" className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr className="bg-white border-b">
                                <td colSpan={6} className="px-4 py-4 text-center">
                                    {searchTerm ? 'No matching orders found' : 'No pending orders yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-4 font-medium text-gray-900">{order.pharmacyName}</td>
                                    <td className="px-4 py-4 font-medium text-gray-900">
                                        {order.items[0]?.name || 'N/A'}
                                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className='bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-xs flex items-center w-fit'>
                                            <FiAlertCircle className="mr-1" /> Pending
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">NGN{order.totalAmount.toLocaleString()}</td>
                                    <td className="px-4 py-4">{formatDate(order.createdAt)}</td>
                                    <td className="px-4 py-4 font-mono">{order.trackingId}</td>
                                    <td className="px-4 py-4">
                                        <Link
                                            href={`/orders/details/${order.id}`}
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

export default PendingOrders