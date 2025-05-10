// app/orders/details/[id]/page.tsx
import { getOrderById, getOrdersForStaticGeneration } from '@/server/order';
import { getPharmacyId } from '@/server/auth';
import { notFound } from 'next/navigation';
import OrderDetailsComponent from '@/components/OrderDetails'

export async function generateStaticParams() {
    const pharmacyId = getPharmacyId();
    const orders = await getOrdersForStaticGeneration(pharmacyId);

    return orders.map((order) => ({
        id: order.id,
    }));
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    const order = await getOrderById(params.id);

    if (!order) {
        notFound();
    }

    return <OrderDetailsComponent order={order} />;
}