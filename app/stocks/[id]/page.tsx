'use client';

import { getStockById } from '@/server/product';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { RiArrowLeftLine } from 'react-icons/ri';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import RestockModal from '@/components/RestockModal';


interface StockItem {
    id: string;
    name: string;
    images: string[];
    amount: number;
    remaining: number;
    description: string;
    discount: number;
    category: string;
    purchasePrice: number;
    quantity: number;
    createdAt: { seconds: number; nanoseconds: number };
    pharmacyId: string;
}

const ImageGalleryModal = ({
    images,
    initialIndex = 0,
    onClose
}: {
    images: string[];
    initialIndex?: number;
    onClose: () => void;
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-3xl"
            >
                ✕
            </button>

            <div className="relative w-full max-w-4xl h-full max-h-[90vh]">
                <Image
                    src={images[currentIndex]}
                    alt={`Product image ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                        >
                            ‹
                        </button>

                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                        >
                            ›
                        </button>
                    </>
                )}

                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 w-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-gray-500'}`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const StockDetailPage = () => {
    const params = useParams();
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
        // You can handle it however you prefer — redirect, throw, or show 404
        notFound(); // From `next/navigation`
    }
    const [stockItem, setStockItem] = useState<StockItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

    const openImageModal = (index: number) => {
        setSelectedImageIndex(index);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchStockItem = async () => {
            try {
                const item = await getStockById(id);
                if (!item) {
                    notFound();
                }
                setStockItem(item);
            } catch (error) {
                console.error('Error fetching stock item:', error);
                notFound();
            } finally {
                setLoading(false);
            }
        };

        fetchStockItem();
    }, [id]);

    if (loading) {
        return (
            <div className="p-4 max-w-6xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gray-200 rounded-lg h-96"></div>
                        <div className="space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stockItem) {
        notFound();
    }

    const createdAtDate = new Date(stockItem.createdAt.seconds * 1000);
    const formattedDate = createdAtDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
                <Link href="/stocks/active" className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <RiArrowLeftLine className="text-2xl" />
                </Link>
                <h1 className="text-3xl font-bold">{stockItem.name}</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div
                        className="relative h-96 w-full mb-4 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => openImageModal(0)}
                    >
                        {stockItem.images.length > 0 ? (
                            <Image
                                src={stockItem.images[0]}
                                alt={stockItem.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500">No Image Available</span>
                            </div>
                        )}
                    </div>

                    {stockItem.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {stockItem.images.slice(1).map((image, index) => (
                                <div
                                    key={index}
                                    className="relative h-20 w-full rounded-md overflow-hidden cursor-pointer"
                                    onClick={() => openImageModal(index + 1)}
                                >
                                    <Image
                                        src={image}
                                        alt={`${stockItem.name} ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">Product Information</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Description</h3>
                            <p className="mt-1">{stockItem.description || 'No description available'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                                <p className="mt-1 capitalize">{stockItem.category || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Date Added</h3>
                                <p className="mt-1">{formattedDate}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Initial Quantity</h3>
                                <p className="mt-1">{stockItem.quantity}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Remaining Stock</h3>
                                <p className="mt-1">{stockItem.remaining}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Purchase Price</h3>
                                <p className="mt-1">NGN {stockItem.purchasePrice.toLocaleString()}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Selling Price</h3>
                                <p className="mt-1">NGN {stockItem.amount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Discount</h3>
                            <p className="mt-1">{stockItem.discount}%</p>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Profit Margin</h3>
                            <p className="mt-1 text-green-600 font-medium">
                                NGN {(stockItem.amount - stockItem.purchasePrice).toLocaleString()} per unit
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
                <Link
                    href={`/stocks/edit/${stockItem.id}`}
                    className="px-6 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
                >
                    Edit Product
                </Link>
                <button
                    onClick={() => setIsRestockModalOpen(true)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Restock
                </button>
            </div>

            {/* Image Gallery Modal */}
            {isModalOpen && stockItem.images.length > 0 && (
                <ImageGalleryModal
                    images={stockItem.images}
                    initialIndex={selectedImageIndex}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {/* Restock Modal */}
            {isRestockModalOpen && stockItem && (
                <RestockModal
                    stockItemId={stockItem.id}
                    currentQuantity={stockItem.quantity}
                    onClose={() => setIsRestockModalOpen(false)}
                    onRestockSuccess={() => {
                        // Refresh data
                        const fetchData = async () => {
                            const item = await getStockById(id);
                            if (item) setStockItem(item);
                        };
                        fetchData();
                    }}
                />
            )}
        </div>
    );
};

export default StockDetailPage;