'use client';

import { DrugCategory } from '@/app/model/drug_model';
import { getDrugCat, newStock } from '@/server/product';
import { Timestamp } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { uploadImages } from '@/utils/uploadImages'
import ImageUploader from '@/components/ImageUploader';
import { toast } from 'react-hot-toast';

const NewStock = () => {
  const [drugCat, setDrugCat] = useState<DrugCategory[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const router = useRouter();

  // Get the search params from the URL
  const searchParams = useSearchParams();
  // Get the pharmacyId from the query parameters
  const pharmacyId = searchParams.get('pharmacyId') || '';


  // Form state
  const [formData, setFormData] = useState({
    name: '',
    amount: 100,
    remaining: 1,
    description: '',
    discount: 0,
    category: '',
    purchasePrice: 100,
    quantity: 1,
  });

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getDrugCat();
        setDrugCat(categories);
      } catch (error) {
        toast.error('Failed to load categories');
      } finally {
        setIsFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'remaining' || name === 'discount' || name === 'purchasePrice' || name === 'quantity'
        ? Number(value)
        : value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    const toastId = toast.loading('Adding new product...');

    try {
      // Upload images first
      const imageUrls = await uploadImages(images);

      // Prepare stock data
      const stockData = {
        ...formData,
        images: imageUrls,
        remaining: formData.quantity, // Set remaining to initial quantity
        createdAt: Timestamp.now(),
        pharmacyId: pharmacyId
      };

      // Add new stock
      await newStock(stockData);
      toast.success('Product added successfully!', { id: toastId });
      router.push('/stocks/active');
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Failed to add product. Please try again.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h4 className="text-2xl font-bold text-center mb-5">Add Stock</h4>
      <form onSubmit={handleSubmit}>
        <div>
          <h4 className="text-2xl font-bold">Product Information</h4>
          <p className="text-gray-600">Upload Product Information</p>
        </div>

        <div className="bg-gray-100 rounded-2xl p-5 mt-5">
          <div className="flex justify-between gap-2 mb-2">
            <div className="w-1/2">
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                placeholder="Paracetamol"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Product Images
              </label>
              <ImageUploader
                onImagesChange={setImages}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-5">
            <div className="w-1/2">
              <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">
                Category
              </label>
              {isFetchingCategories ? (
                <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
              ) : (
                <select
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select category</option>
                  {drugCat.map((cat) => (
                    <option value={cat.name} key={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex justify-between gap-2 mb-5">
            <div className="w-1/2">
              <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                placeholder="100"
                required
                min="0"
                disabled={isLoading}
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                placeholder="Product description"
                rows={3} // You can adjust the number of visible rows
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <h4 className="text-2xl font-bold mt-5">Pricing</h4>
        <p className="text-gray-600">Enter product price</p>

        <div className="bg-gray-100 rounded-2xl p-5 mt-1">
          <div className="flex justify-between gap-2 mb-5">
            <div className="w-1/2">
              <label htmlFor="purchasePrice" className="block mb-2 text-sm font-medium text-gray-900">
                Purchase Price per unit
              </label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                placeholder="1000"
                required
                min="0"
                step="0.01"
                disabled={isLoading}
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900">
                Selling Price
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                placeholder="1200"
                required
                min="0"
                step="0.01"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="w-1/2">
            <label htmlFor="discount" className="block mb-2 text-sm font-medium text-gray-900">
              Discount (%)
            </label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
              placeholder="10"
              min="0"
              max="100"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="footer mt-5">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-10 py-2 border border-blue-300 rounded-sm text-blue-500 text-sm hover:bg-blue-50 transition-colors"
              onClick={() => router.push('/stocks')}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-2 bg-blue-500 rounded-sm text-white text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : 'ADD'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewStock;