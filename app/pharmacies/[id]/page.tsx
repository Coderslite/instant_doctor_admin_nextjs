'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getPharmacyById } from '@/server/pharmacies'
import { PharmacyModel } from '@/app/model/pharmacy_model'
import Image from 'next/image'
import { Timestamp } from 'firebase/firestore'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getPharmacyStocks, getPharmacyOrders, getPharmacyRevenue } from '@/server/pharmacies'
import { DrugModel } from '@/app/model/drug_model'
import { OrderModel } from '@/app/model/order_model'

const PharmacyDetail = () => {
    const { id } = useParams()
    const [pharmacy, setPharmacy] = useState<PharmacyModel | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('stocks')
    const [stocks, setStocks] = useState<DrugModel[]>([])
    const [orders, setOrders] = useState<OrderModel[]>([])
    const [stats, setStats] = useState({
        totalStocks: 0,
        totalOrders: 0,
        totalRevenue: 0
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                // Fetch pharmacy details
                const pharmacyData = await getPharmacyById(id as string)
                setPharmacy(pharmacyData)

                // Fetch pharmacy-specific data
                const [stocks, orders, revenue] = await Promise.all([
                    getPharmacyStocks(id as string),
                    getPharmacyOrders(id as string),
                    getPharmacyRevenue(id as string)
                ])

                setStocks(stocks)
                setOrders(orders)

                setStats({
                    totalStocks: stocks.length,
                    totalOrders: orders.length,
                    totalRevenue: revenue
                })
            } catch (error) {
                toast.error('Failed to fetch pharmacy details')
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    const formatDate = (timestamp: Timestamp) => {
        return new Date(timestamp.seconds * 1000).toLocaleDateString()
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!pharmacy) {
        return <div className="p-4">Pharmacy not found</div>
    }

    return (
        <div className="p-4">
            <h4 className='text-3xl font-bold text-center mb-10 uppercase'>{pharmacy.name}</h4>

            <ToastContainer />
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="md:w-1/3">
                    <div className="bg-white rounded-lg shadow p-4">
                        {pharmacy.image ? (
                            <Image
                                src={pharmacy.image}
                                alt={pharmacy.name}
                                width={300}
                                height={300}
                                className="w-full h-64 object-cover rounded-lg mb-4"
                            />
                        ) : (
                            <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                                <span>No Image</span>
                            </div>
                        )}

                        <h2 className="text-2xl font-bold mb-2">{pharmacy.name}</h2>
                        <p className="text-gray-600 mb-1"><strong>Address:</strong> {pharmacy.address}</p>
                        <p className="text-gray-600 mb-1"><strong>Email:</strong> {pharmacy.email}</p>
                        <p className="text-gray-600 mb-1"><strong>Phone:</strong> {pharmacy.phoneNumber}</p>
                        <p className="text-gray-600 mb-1"><strong>Delivery Fee:</strong> {formatCurrency(Number(pharmacy.deliveryFee))}</p>
                        <p className="text-gray-600"><strong>Joined:</strong> {formatDate(pharmacy.createdAt)}</p>
                    </div>
                </div>

                <div className="md:w-2/3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-800">Total Stocks</h3>
                            <p className="text-2xl font-bold">{stats.totalStocks}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-800">Total Orders</h3>
                            <p className="text-2xl font-bold">{stats.totalOrders}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-purple-800">Total Revenue</h3>
                            <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px">
                                <button
                                    onClick={() => setActiveTab('stocks')}
                                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'stocks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Stocks ({stocks.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'orders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Orders ({orders.length})
                                </button>
                            </nav>
                        </div>

                        <div className="p-4">
                            {activeTab === 'stocks' ? (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Stocks in this Pharmacy</h3>
                                    {stocks.length === 0 ? (
                                        <p className="text-gray-500">No stocks found for this pharmacy</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {stocks.map((stock) => (
                                                        <tr key={stock.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    {stock.images?.[0] && (
                                                                        <div className="flex-shrink-0 h-10 w-10">
                                                                            <Image
                                                                                className="h-10 w-10 rounded-full"
                                                                                src={stock.images[0]}
                                                                                alt={stock.name}
                                                                                width={40}
                                                                                height={40}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900">{stock.name}</div>
                                                                        <div className="text-sm text-gray-500">{stock.description.split('', 30)}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatCurrency(stock.amount || 0)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {stock.remaining}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(stock.remaining || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                    {(stock.remaining || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                                    {orders.length === 0 ? (
                                        <p className="text-gray-500">No orders found for this pharmacy</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {orders.map((order) => (
                                                        <tr key={order.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                #{order.trackingId || order.id.slice(0, 8)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(order.createdAt)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatCurrency(order.totalAmount || 0)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PharmacyDetail