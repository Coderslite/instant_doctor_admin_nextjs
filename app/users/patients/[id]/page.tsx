'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FiClock, FiCalendar, FiShoppingBag, FiDollarSign, FiUser, FiPhone, FiMail, FiHome, FiAlertTriangle, FiDroplet, FiHeart, FiActivity, FiScissors, FiInfo } from 'react-icons/fi'
import { getUserById } from '@/server/user'
import { getOrderById, getOrdersByUserId } from '@/server/order'
import { getAppointmentsByUserId } from '@/server/appointment'
import { UserModel } from '@/app/model/user_model'
import { OrderModel } from '@/app/model/order_model'
import { AppointmentModel } from '@/app/model/appointment_model'
import Link from 'next/link'
import { Timestamp } from 'firebase/firestore'
import { formatDate } from '@/utils/formatTime'

const PatientDetails = () => {
    const { id } = useParams()
    const [user, setUser] = useState<UserModel | null>(null)
    const [orders, setOrders] = useState<OrderModel[]>([])
    const [appointments, setAppointments] = useState<(AppointmentModel & { doctorName: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'orders' | 'appointments'>('orders')

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const userData = await getUserById(id as string)
                const userOrders = await getOrdersByUserId(id as string)
                const userAppointments = await getAppointmentsByUserId(id as string)

                setUser(userData)
                setOrders(userOrders)
                setAppointments(userAppointments)
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    const formatBirthDate = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return 'Not provided'
        const date = timestamp.toDate()
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatTimeRange = (startDate: Timestamp | undefined, endDate: Timestamp | undefined) => {
        if (!startDate || !endDate) return 'Not available'
        const start = startDate.toDate()
        const end = endDate.toDate()

        return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }

    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined) return 'NGN 0.00'
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount)
    }

    const getAge = (dobTimestamp: Timestamp | undefined) => {
        if (!dobTimestamp) return 'Unknown'
        const dob = dobTimestamp.toDate()
        const diff = Date.now() - dob.getTime()
        const ageDate = new Date(diff)
        return Math.abs(ageDate.getUTCFullYear() - 1970)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Patient not found</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                <Link href="/users/patients" className="mr-4 text-blue-500 hover:text-blue-700">
                    &larr; Back to Patients
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">Patient Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Patient Profile Card */}
                <div className="bg-white rounded-lg shadow-md p-6 col-span-1">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                            <FiUser className="text-blue-500 text-3xl" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {user.firstname} {user.lastname}
                        </h2>
                        <p className="text-gray-500">Patient ID: {user.id}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <FiMail className="text-gray-400 mr-3" />
                            <span className="text-gray-600">{user.email}</span>
                        </div>
                        <div className="flex items-center">
                            <FiPhone className="text-gray-400 mr-3" />
                            <span className="text-gray-600">{user.phoneNumber || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center">
                            <FiHome className="text-gray-400 mr-3" />
                            <span className="text-gray-600">{user.address || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center">
                            <FiCalendar className="text-gray-400 mr-3" />
                            <span className="text-gray-600">
                                {formatBirthDate(user.dob)} ({user.dob ? `${getAge(user.dob)} years` : 'Age unknown'})
                            </span>
                        </div>
                        <div className="flex items-center">
                            <FiUser className="text-gray-400 mr-3" />
                            <span className="text-gray-600">{user.gender || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center">
                            <FiDroplet className="text-gray-400 mr-3" />
                            <span className="text-gray-600">Blood Group: {user.bloodGroup || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center">
                            <FiActivity className="text-gray-400 mr-3" />
                            <span className="text-gray-600">Genotype: {user.genotype || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center">
                            <FiInfo className="text-gray-400 mr-3" />
                            <span className="text-gray-600">
                                Marital Status: {user.maritalStatus || 'Not specified'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-500">Total Orders</p>
                                <p className="text-xl font-bold text-blue-600">{orders.length}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-500">Total Appointments</p>
                                <p className="text-xl font-bold text-green-600">{appointments.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patient Medical Information */}
                <div className="bg-white rounded-lg shadow-md p-6 col-span-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Information</h3>

                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                                <FiActivity className="mr-2" /> Vital Statistics
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-sm text-gray-500">Height</p>
                                    <p className="font-medium">{user.height || 'Not recorded'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Weight</p>
                                    <p className="font-medium">{user.weight || 'Not recorded'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                                <FiDroplet className="mr-2" /> Blood Information
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-sm text-gray-500">Blood Group</p>
                                    <p className="font-medium">{user.bloodGroup || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Genotype</p>
                                    <p className="font-medium">{user.genotype || 'Unknown'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                                <FiScissors className="mr-2" /> Surgical History
                            </h4>
                            <p className="text-gray-600">
                                {user.surgicalHistory || 'No surgical history recorded'}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                                <FiClock className="mr-2" /> Last Seen
                            </h4>
                            <p className="text-gray-600">
                                {formatDate(user.lastSeen) || 'No record of last visit'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Activity Summary */}
                <div className="bg-white rounded-lg shadow-md p-6 col-span-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Summary</h3>

                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`py-2 px-4 font-medium ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Orders ({orders.length})
                        </button>
                        <button
                            className={`py-2 px-4 font-medium ${activeTab === 'appointments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('appointments')}
                        >
                            Appointments ({appointments.length})
                        </button>
                    </div>

                    {activeTab === 'orders' ? (
                        <div>
                            {orders.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FiShoppingBag className="mx-auto text-3xl mb-2" />
                                    <p>No orders found</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium text-gray-800">Order #{order.id.substring(0, 8)}</p>
                                                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : order.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <FiDollarSign className="text-gray-400 mr-1" />
                                                    <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            {appointments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FiCalendar className="mx-auto text-3xl mb-2" />
                                    <p>No appointments found</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {appointments.map((appointment) => (
                                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        Appointment with Dr. {appointment.doctorName}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(appointment.startTime)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.isPaid
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {appointment.isPaid ? 'Paid' : 'Pending Payment'}
                                                    </span>
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {formatTimeRange(appointment.startTime, appointment.endTime)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <FiDollarSign className="text-gray-400 mr-1" />
                                                    <span className="font-medium">{formatCurrency(appointment.price)}</span>
                                                </div>
                                                <div className="text-sm text-gray-500 max-w-[50%] truncate">
                                                    {appointment.complain || 'No complaint noted'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {[...orders, ...appointments.map(a => ({ ...a, type: 'appointment' as const }))]
                        .sort((a, b) => {
                            const aDate = a.createdAt
                            const bDate = b.createdAt;
                            return bDate.seconds - aDate.seconds;
                        })
                        .slice(0, 5)
                        .map((item) => (
                            <div key={item.id} className="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                <div className={`p-2 rounded-full mr-4 ${'type' in item
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-green-100 text-green-600'
                                    }`}>
                                    {'type' in item ? <FiCalendar /> : <FiShoppingBag />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">
                                        {'type' in item
                                            ? `Appointment with Dr. ${item.doctorName}`
                                            : `Order #${item.id.substring(0, 8)}`}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-1">
                                        {'type' in item
                                            ? formatDate(item.startTime)
                                            : formatDate(item.createdAt)}
                                    </p>
                                    <div className="flex gap-2">
                                        {'type' in item ? (
                                            <>
                                                <span className={`text-xs px-2 py-1 rounded-full ${item.isPaid
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {item.isPaid ? 'Paid' : 'Pending Payment'}
                                                </span>
                                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                    {formatTimeRange(item.startTime, item.endTime)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : item.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {item.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm font-medium">
                                    {'price' in item
                                        ? formatCurrency(item.price)
                                        : formatCurrency(item.totalAmount)}
                                </div>
                            </div>
                        ))
                    }
                    {orders.length === 0 && appointments.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PatientDetails