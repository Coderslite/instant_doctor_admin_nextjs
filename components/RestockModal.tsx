// components/RestockModal.tsx
'use client';

import { RiCloseLine } from 'react-icons/ri';
import { restockProduct } from '@/server/product';
import { useState } from 'react';

interface RestockModalProps {
    stockItemId: string;
    currentQuantity: number;
    onClose: () => void;
    onRestockSuccess: () => void;
}

const RestockModal = ({ 
    stockItemId, 
    currentQuantity, 
    onClose, 
    onRestockSuccess 
}: RestockModalProps) => {
    const [quantity, setQuantity] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (quantity <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await restockProduct(stockItemId, quantity);
            onRestockSuccess();
            onClose();
        } catch (err) {
            console.error('Error restocking:', err);
            setError('Failed to restock. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Restock Product</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <RiCloseLine className="text-2xl" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Stock: {currentQuantity}
                        </label>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity to Add
                        </label>
                        <input
                            type="number"
                            id="quantity"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : 'Restock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestockModal;