'use client';

import { useParams, useRouter, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiArrowLeft, FiCheck, FiClock, FiMapPin, FiPackage, FiTruck, FiUser } from 'react-icons/fi';
import { getOrderById, updateOrderStatusInFirestore } from '@/server/order';
import { getUserById } from '@/server/user';
import { Timestamp } from 'firebase/firestore';
import { ItemModel } from '@/app/model/order_model';
import { UserModel } from '@/app/model/user_model';
import { formatDate } from '@/utils/formatTime';

const OrderDetails = () => {
    const params = useParams();
    const router = useRouter();
    const rawId = params?.id;
    const orderId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!orderId) {
        // You can handle it however you prefer — redirect, throw, or show 404
        notFound(); // From `next/navigation`
    }
    console.log(orderId)
    const [order, setOrder] = useState<any>(null);
    const [user, setUser] = useState<UserModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<'pending' | 'confirmed' | 'delivering' | 'completed' | 'cancelled'>('pending');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const orderData = await getOrderById(orderId);
                if (!orderData) return notFound();
                setOrder(orderData);
                setCurrentStatus(orderData?.status ?? 'pending');

                const userData = await getUserById(orderData.userId);
                if (!userData) return notFound();
                setUser(userData);
            } catch (err) {
                console.error(err);
                notFound();
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchData();
    }, [orderId]);

    const sendNotification = async (title: string, body: string, type: string) => {
        if (!user?.token) {
            console.warn('User has no notification token');
            return;
        }

        try {
            const res = await fetch('https://us-central1-instant-doctor-a4e4c.cloudfunctions.net/api/notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    body,
                    tokens: [user.token],
                    id: orderId,
                    type
                })
            });

            if (!res.ok) throw new Error('Failed to send notification');
        } catch (error) {
            console.error('Notification error:', error);
        }
    };

    const updateOrderStatus = async (newStatus: 'confirmed' | 'delivering' | 'completed') => {
        try {
            setUpdatingStatus(true);
            await updateOrderStatusInFirestore(orderId, newStatus);
            setCurrentStatus(newStatus);

            const statusMessages: Record<string, { title: string; body: string; type: string }> = {
                confirmed: {
                    title: 'Order Confirmed',
                    body: `Your order #${order.trackingId} has been confirmed`,
                    type: 'order_confirmed'
                },
                delivering: {
                    title: 'On The Way',
                    body: `Your order #${order.trackingId} is out for delivery`,
                    type: 'order_delivering'
                },
                completed: {
                    title: 'Order Delivered',
                    body: `Your order #${order.trackingId} has been delivered`,
                    type: 'order_completed'
                }
            };

            const { title, body, type } = statusMessages[newStatus];
            await sendNotification(title, body, type);

            if (!user) {
                console.error('User not found');
                alert('Cannot send email: user info is missing');
                return;
            }
            // Send email here
            const emailBody = {
                email: user.email,
                order_id: order.trackingId,
                status_message: title,
                customer_name: `${user.firstname} ${user.lastname}`,
                subtotal: order.items.reduce((sum: number, item: ItemModel) => sum + item.amount * (item.quantity || 1), 0),
                delivery_fee: order.deliveryFee || 0,
                total: order.items.reduce((sum: number, item: ItemModel) => sum + item.amount * (item.quantity || 1), 0) + (order.deliveryFee || 0),
                delivery_address: order.address,
                tracking_link: "", // If available, else keep empty
                items: order.items.map((item: ItemModel) => ({
                    name: item.name,
                    image: item.images[0] || '/default-product.png',
                    quantity: item.quantity || 1,
                    price: item.amount
                })),
                order_status: newStatus
            };

            await fetch('https://us-central1-instant-doctor-a4e4c.cloudfunctions.net/api/mail/order_update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailBody)
            });

            alert(`Order marked as ${newStatus}`);
        } catch (err) {
            console.error(err);
            alert('Failed to update order status');
        } finally {
            setUpdatingStatus(false);
        }
    };




    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!order || !user) return notFound();

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => router.back()}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
                <FiArrowLeft className="mr-2" /> Back to Orders
            </button>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold">Order #{order.trackingId.toUpperCase()}</h1>
                            <div className="flex items-center mt-2">
                                <FiClock className="mr-2" />
                                <span>{formatDate(order.createdAt)}</span>
                            </div>
                        </div>
                        <div className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                            {currentStatus}
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <FiUser className="mr-2" /> Customer Information
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center">
                            <div className="relative h-16 w-16 mr-4">
                                <Image
                                    src={user.photoUrl || '/default-avatar.png'}
                                    alt={`${user.firstname} ${user.lastname}`}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-gray-500">Customer</p>
                                <p className="font-semibold">{user.firstname} {user.lastname}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500">Contact</p>
                            <p className="font-semibold">{user.phoneNumber || 'N/A'}</p>
                        </div>
                        <div className="flex items-start">
                            <FiMapPin className="mt-1 mr-2 flex-shrink-0" />
                            <div>
                                <p className="text-gray-500">Delivery Address</p>
                                <p className="font-semibold">{order.address || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item: ItemModel, index: number) => (
                                    <tr key={index}>
                                        <td className="whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Image
                                                    src={item.images[0] || '/default-product.png'}
                                                    alt={item.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-md"
                                                />
                                                <div className="ml-4 text-sm font-medium text-gray-900">{item.name}</div>
                                            </div>
                                        </td>
                                        <td>NGN {item.amount.toLocaleString()}</td>
                                        <td>{item.quantity || 1}</td>
                                        <td className="font-semibold text-gray-900">
                                            NGN {(item.amount * (item.quantity || 1)).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-6 border-t">
                    <div className="flex justify-end">
                        <div className="w-full max-w-md space-y-2">
                            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span>
                                    NGN {order.items.reduce((sum: number, item: ItemModel) =>
                                        sum + item.amount * (item.quantity || 1), 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span>NGN {order.deliveryFee?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-semibold">Total</span>
                                <span className="font-bold text-lg">
                                    NGN {(order.items.reduce((sum: number, item: ItemModel) =>
                                        sum + item.amount * (item.quantity || 1), 0) + (order.deliveryFee || 0)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Progress and Action */}
                <div className="p-6 border-t">
                    <h3 className="text-lg font-medium mb-4">Order Status</h3>
                    <div className="flex justify-between items-center mb-6">
                        {['pending', 'confirmed', 'delivering', 'completed'].map((status, idx) => {
                            const isActive = currentStatus === status;
                            const iconMap = {
                                pending: <FiClock className="text-lg" />,
                                confirmed: <FiCheck className="text-lg" />,
                                delivering: <FiTruck className="text-lg" />,
                                completed: <FiPackage className="text-lg" />
                            };

                            return (
                                <div key={idx} className={`flex flex-col items-center ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                        {iconMap[status as keyof typeof iconMap]}
                                    </div>
                                    <span className="mt-2 text-sm capitalize">{status}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Status Buttons */}
                    <div className="flex justify-center space-x-4">
                        {currentStatus === 'pending' && (
                            <button onClick={() => updateOrderStatus('confirmed')} disabled={updatingStatus} className="bg-blue-500 text-white px-6 py-2 rounded-lg">
                                {updatingStatus ? 'Confirming...' : 'Confirm Order'}
                            </button>
                        )}
                        {currentStatus === 'confirmed' && (
                            <button onClick={() => updateOrderStatus('delivering')} disabled={updatingStatus} className="bg-orange-500 text-white px-6 py-2 rounded-lg">
                                {updatingStatus ? 'Starting Delivery...' : 'Start Delivery'}
                            </button>
                        )}
                        {currentStatus === 'delivering' && (
                            <button onClick={() => updateOrderStatus('completed')} disabled={updatingStatus} className="bg-green-500 text-white px-6 py-2 rounded-lg">
                                {updatingStatus ? 'Completing...' : 'Mark as Delivered'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
