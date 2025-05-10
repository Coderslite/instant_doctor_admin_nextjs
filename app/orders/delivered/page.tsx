'use client'
import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { getDeliveredOrders } from '@/server/order'
import { Timestamp } from 'firebase/firestore'
import Link from 'next/link'
import { FiClock, FiEye } from 'react-icons/fi'

interface OrderItem {
    id: string
    name: string
    amount: number
    quantity: number
}

interface Order {
    id: string
    items: OrderItem[]
    status: string
    totalAmount: number
    createdAt: Timestamp
    userId: string
}

const DeliveredOrders = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true)
                const deliveredOrders = await getDeliveredOrders()
                console.log(deliveredOrders);
                setOrders(deliveredOrders)
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
            formatDate(order.createdAt).toLowerCase().includes(searchLower))
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
            <h4 className='text-3xl font-bold text-center mb-5 uppercase'>Delivered Orders</h4>

            <div className="flex justify-center gap-2 md:flex-row flex-col mb-6">
                <div className="relative w-full max-w-2xl">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <IoSearchOutline />
                    </div>
                    <input
                        type="search"
                        className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search by order ID, amount, or date"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3">Products</th>
                            <th scope="col" className="px-4 py-3">Status</th>
                            <th scope="col" className="px-4 py-3">Amount</th>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3">Order ID</th>
                            <th scope="col" className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr className="bg-white border-b">
                                <td colSpan={6} className="px-4 py-4 text-center">
                                    {searchTerm ? 'No matching orders found' : 'No delivered orders yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-4 font-medium text-gray-900">
                                        {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className='bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs flex items-center w-fit'>
                                            <FiClock className="mr-1" /> Delivered
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">NGN{order.totalAmount.toLocaleString()}</td>
                                    <td className="px-4 py-4">{formatDate(order.createdAt)}</td>
                                    <td className="px-4 py-4 font-mono">{order.id.slice(0, 8)}</td>
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

export default DeliveredOrders