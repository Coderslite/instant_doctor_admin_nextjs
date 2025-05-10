// app/orders/details/[id]/OrderDetailsComponent.tsx
'use client';

import { OrderModel } from '@/app/model/order_model';
import { UserModel } from '@/app/model/user_model';
import { getUserById } from '@/server/user';
import { useState, useEffect } from 'react';
import { updateOrderStatusInFirestore } from '@/server/order';
import { Timestamp } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiClock, FiMapPin, FiPackage, FiTruck, FiUser } from 'react-icons/fi';
import Image from 'next/image';

interface OrderDetailsProps {
    order: OrderModel;
}

export default function OrderDetailsComponent({ order }: OrderDetailsProps) {
    const [user, setUser] = useState<UserModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getUserById(order.userId);
                if (!userData) notFound();
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user:', error);
                notFound();
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [order.userId]);

    const updateOrderStatus = async (newStatus: 'confirmed' | 'delivering' | 'completed') => {
        try {
            setUpdatingStatus(true);
            await updateOrderStatusInFirestore(order.id, newStatus);
            setCurrentStatus(newStatus);
            // Add notification logic here if needed
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const formatDate = (timestamp: Timestamp) => {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Your existing UI code from the original component */}
            {/* Keep all the JSX from your original component */}
            {/* Just replace the data sources to use the order prop and user state */}
        </div>
    );
}