// // app/orders/details/[id]/OrderDetailsClient.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { FiArrowLeft, FiCheck, FiClock, FiMapPin, FiPackage, FiTruck, FiUser } from 'react-icons/fi';
// import { getOrderById, updateOrderStatusInFirestore } from '@/server/order';
// import { getUserById } from '@/server/user';
// import { Timestamp } from 'firebase/firestore';
// import { ItemModel } from '@/app/model/order_model';
// import { UserModel } from '@/app/model/user_model';

// type Props = {
//     id: string;
// };

// const OrderDetailsClient = ({ id }: Props) => {
//     const [order, setOrder] = useState<any>(null);
//     const [user, setUser] = useState<UserModel | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [updatingStatus, setUpdatingStatus] = useState(false);
//     const [currentStatus, setCurrentStatus] = useState<'pending' | 'confirmed' | 'delivering' | 'completed'>('pending');
//     const router = useRouter();

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 const orderData = await getOrderById(id);
//                 if (!orderData) {
//                     router.push('/404');
//                 }
//                 setOrder(orderData);
//                 setCurrentStatus(orderData.status || 'pending');

//                 const userData = await getUserById(orderData.userId);
//                 if (!userData) {
//                     router.push('/404');
//                 }
//                 setUser(userData);
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//                 router.push('/404');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [id]);

//     const sendNotification = async (title: string, body: string, type: string) => {
//         if (!user?.token) return;
//         try {
//             await fetch('https://us-central1-instant-doctor-a4e4c.cloudfunctions.net/api/notification', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ title, body, tokens: [user.token], id, type }),
//             });
//         } catch (error) {
//             console.error('Error sending notification:', error);
//         }
//     };

//     const updateOrderStatus = async (newStatus: 'confirmed' | 'delivering' | 'completed') => {
//         try {
//             setUpdatingStatus(true);
//             await updateOrderStatusInFirestore(id, newStatus);
//             setCurrentStatus(newStatus);

//             let title = '', body = '', type = '';
//             switch (newStatus) {
//                 case 'confirmed':
//                     title = 'Order Confirmed';
//                     body = `Your order #${id.slice(0, 8)} has been confirmed`;
//                     type = 'order_confirmed';
//                     break;
//                 case 'delivering':
//                     title = 'On The Way';
//                     body = `Your order #${id.slice(0, 8)} is out for delivery`;
//                     type = 'order_delivering';
//                     break;
//                 case 'completed':
//                     title = 'Order Delivered';
//                     body = `Your order #${id.slice(0, 8)} has been delivered`;
//                     type = 'order_completed';
//                     break;
//             }

//             await sendNotification(title, body, type);
//             alert(`Order marked as ${newStatus}`);
//         } catch (error) {
//             console.error('Error updating status:', error);
//             alert('Failed to update status');
//         } finally {
//             setUpdatingStatus(false);
//         }
//     };

//     const formatDate = (timestamp: Timestamp) =>
//         new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit',
//         });

//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//         );
//     }
//     if (!order || !user) return null;

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <button
//                 onClick={() => router.back()}
//                 className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
//             >
//                 <FiArrowLeft className="mr-2" /> Back to Orders
//             </button>

//             <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                 {/* Order Header */}
//                 <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
//                     <div className="flex justify-between items-start">
//                         <div>
//                             <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
//                             <div className="flex items-center mt-2">
//                                 <FiClock className="mr-2" />
//                                 <span>{formatDate(order.createdAt)}</span>
//                             </div>
//                         </div>
//                         <div className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
//                             {currentStatus}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Customer Info */}
//                 <div className="p-6 border-b">
//                     <h2 className="text-xl font-semibold mb-4 flex items-center">
//                         <FiUser className="mr-2" /> Customer Information
//                     </h2>
//                     <div className="grid md:grid-cols-3 gap-6">
//                         <div className="flex items-center">
//                             <div className="relative h-16 w-16 mr-4">
//                                 <Image
//                                     src={user.photoUrl || '/default-avatar.png'}
//                                     alt={`${user.firstname} ${user.lastname}`}
//                                     fill
//                                     className="rounded-full object-cover"
//                                 />
//                             </div>
//                             <div>
//                                 <p className="text-gray-500">Customer</p>
//                                 <p className="font-semibold">{user.firstname} {user.lastname}</p>
//                             </div>
//                         </div>
//                         <div>
//                             <p className="text-gray-500">Contact</p>
//                             <p className="font-semibold">{user.phoneNumber || 'N/A'}</p>
//                         </div>
//                         <div className="flex items-start">
//                             <FiMapPin className="mt-1 mr-2 flex-shrink-0" />
//                             <div>
//                                 <p className="text-gray-500">Delivery Address</p>
//                                 <p className="font-semibold">{order.address || 'N/A'}</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Order Items */}
//                 <div className="p-6">
//                     <h2 className="text-xl font-semibold mb-4">Order Items</h2>
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gray-50">
//                                 <tr>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {order.items.map((item: ItemModel, index: number) => (
//                                     <tr key={index}>
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <div className="flex items-center">
//                                                 <div className="flex-shrink-0 h-10 w-10">
//                                                     <Image
//                                                         src={item.images[0] || '/default-product.png'}
//                                                         alt={item.name}
//                                                         width={40}
//                                                         height={40}
//                                                         className="rounded-md"
//                                                     />
//                                                 </div>
//                                                 <div className="ml-4">
//                                                     <div className="text-sm font-medium text-gray-900">{item.name}</div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                             NGN {item.amount.toLocaleString()}
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                             {item.quantity || 1}
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
//                                             NGN {(item.amount * (item.quantity || 1)).toLocaleString()}
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 {/* Order Summary */}
//                 <div className="bg-gray-50 p-6 border-t">
//                     <div className="flex justify-end">
//                         <div className="w-full max-w-md">
//                             <h3 className="text-lg font-medium mb-4">Order Summary</h3>
//                             <div className="space-y-2">
//                                 <div className="flex justify-between">
//                                     <span className="text-gray-600">Subtotal</span>
//                                     <span>
//                                         NGN {order.items.reduce((sum: number, item: ItemModel) =>
//                                             sum + (item.amount * (item.quantity || 1)), 0).toLocaleString()}
//                                     </span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-gray-600">Delivery Fee</span>
//                                     <span>NGN {order.deliveryFee?.toLocaleString() || '0'}</span>
//                                 </div>
//                                 <div className="flex justify-between border-t pt-2 mt-2">
//                                     <span className="font-semibold">Total</span>
//                                     <span className="font-bold text-lg">
//                                         NGN {(
//                                             order.items.reduce((sum: number, item: ItemModel) =>
//                                                 sum + (item.amount * (item.quantity || 1)), 0) +
//                                             (order.deliveryFee || 0)
//                                         ).toLocaleString()}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Order Status Progress */}
//                 <div className="p-6 border-t">
//                     <h3 className="text-lg font-medium mb-4">Order Status</h3>
//                     <div className="flex justify-between items-center mb-6">
//                         <div className={`flex flex-col items-center ${currentStatus === 'pending' ? 'text-blue-600' : 'text-gray-400'}`}>
//                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStatus === 'pending' ? 'bg-blue-100' : 'bg-gray-100'}`}>
//                                 <FiClock className="text-lg" />
//                             </div>
//                             <span className="mt-2 text-sm">Pending</span>
//                         </div>

//                         <div className={`flex flex-col items-center ${currentStatus === 'confirmed' ? 'text-blue-600' : 'text-gray-400'}`}>
//                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStatus === 'confirmed' ? 'bg-blue-100' : 'bg-gray-100'}`}>
//                                 <FiCheck className="text-lg" />
//                             </div>
//                             <span className="mt-2 text-sm">Confirmed</span>
//                         </div>

//                         <div className={`flex flex-col items-center ${currentStatus === 'delivering' ? 'text-blue-600' : 'text-gray-400'}`}>
//                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStatus === 'delivering' ? 'bg-blue-100' : 'bg-gray-100'}`}>
//                                 <FiTruck className="text-lg" />
//                             </div>
//                             <span className="mt-2 text-sm">Delivering</span>
//                         </div>

//                         <div className={`flex flex-col items-center ${currentStatus === 'completed' ? 'text-blue-600' : 'text-gray-400'}`}>
//                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStatus === 'completed' ? 'bg-blue-100' : 'bg-gray-100'}`}>
//                                 <FiPackage className="text-lg" />
//                             </div>
//                             <span className="mt-2 text-sm">Completed</span>
//                         </div>
//                     </div>

//                     {/* Status Update Buttons */}
//                     <div className="flex justify-center space-x-4">
//                         {currentStatus === 'pending' && (
//                             <button
//                                 onClick={() => updateOrderStatus('confirmed')}
//                                 disabled={updatingStatus}
//                                 className={`btn bg-blue-500 text-white px-6 py-2 rounded-lg ${updatingStatus ? 'opacity-70 cursor-not-allowed' : ''}`}
//                             >
//                                 {updatingStatus ? 'Confirming...' : 'Confirm Order'}
//                             </button>
//                         )}

//                         {currentStatus === 'confirmed' && (
//                             <button
//                                 onClick={() => updateOrderStatus('delivering')}
//                                 disabled={updatingStatus}
//                                 className={`btn bg-orange-500 text-white px-6 py-2 rounded-lg ${updatingStatus ? 'opacity-70 cursor-not-allowed' : ''}`}
//                             >
//                                 {updatingStatus ? 'Starting Delivery...' : 'Start Delivery'}
//                             </button>
//                         )}

//                         {currentStatus === 'delivering' && (
//                             <button
//                                 onClick={() => updateOrderStatus('completed')}
//                                 disabled={updatingStatus}
//                                 className={`btn bg-green-500 text-white px-6 py-2 rounded-lg ${updatingStatus ? 'opacity-70 cursor-not-allowed' : ''}`}
//                             >
//                                 {updatingStatus ? 'Completing...' : 'Mark as Delivered'}
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OrderDetailsClient;
