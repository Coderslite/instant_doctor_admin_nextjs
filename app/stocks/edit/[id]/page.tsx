// // app/stocks/edit/[id]/page.tsx
// 'use client';

// import { getStockById, updateStock, updateProductImages } from '@/server/product';
// import { notFound } from 'next/navigation';
// import { useState, useEffect } from 'react';
// import { RiArrowLeftLine, RiCloseFill } from 'react-icons/ri';
// import Link from 'next/link';
// import Image from 'next/image';
// import { uploadImages } from '@/utils/uploadImages';
// import { DrugCategory } from '@/app/model/drug_model';
// import { getDrugCat } from '@/server/product';

// const EditStockPage = ({ params }: { params: { id: string } }) => {
//     const [stockItem, setStockItem] = useState<any>(null);
//     const [loading, setLoading] = useState(true);
//     const [drugCategories, setDrugCategories] = useState<DrugCategory[]>([]);
//     const [formData, setFormData] = useState({
//         name: '',
//         amount: 0,
//         description: '',
//         discount: 0,
//         category: '',
//         purchasePrice: 0,
//     });
//     const [images, setImages] = useState<string[]>([]);
//     const [newImages, setNewImages] = useState<File[]>([]);
//     const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const [item, categories] = await Promise.all([
//                     getStockById(params.id),
//                     getDrugCat()
//                 ]);

//                 if (!item) {
//                     notFound();
//                 }

//                 setStockItem(item);
//                 setFormData({
//                     name: item.name,
//                     amount: item.amount,
//                     description: item.description || '',
//                     discount: item.discount || 0,
//                     category: item.category || '',
//                     purchasePrice: item.purchasePrice || 0,
//                 });
//                 setImages(item.images || []);
//                 setDrugCategories(categories);
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//                 notFound();
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [params.id]);

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: name === 'amount' || name === 'discount' || name === 'purchasePrice'
//                 ? Number(value)
//                 : value
//         }));
//     };

//     const handleImageUpload = (files: File[]) => {
//         setNewImages(prev => [...prev, ...files]);
//     };

//     const handleRemoveImage = (imageUrl: string, index: number) => {
//         if (images.includes(imageUrl)) {
//             setImagesToDelete(prev => [...prev, imageUrl]);
//         } else {
//             setNewImages(prev => prev.filter((_, i) => i !== index));
//         }
//         setImages(prev => prev.filter(img => img !== imageUrl));
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsSubmitting(true);

//         try {
//             // Update basic product info
//             await updateStock(params.id, formData);

//             // Handle image updates if there are changes
//             if (newImages.length > 0 || imagesToDelete.length > 0) {
//                 const uploadedUrls = newImages.length > 0 ? await uploadImages(newImages) : [];
//                 await updateProductImages(params.id, uploadedUrls, imagesToDelete);
//             }

//             alert('Product updated successfully!');
//             // Optionally redirect or refresh data
//         } catch (error) {
//             console.error('Error updating product:', error);
//             alert('Failed to update product. Please try again.');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="p-4 max-w-6xl mx-auto">
//                 <div className="animate-pulse">
//                     <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
//                     <div className="grid md:grid-cols-2 gap-8">
//                         <div className="bg-gray-200 rounded-lg h-96"></div>
//                         <div className="space-y-4">
//                             <div className="h-6 bg-gray-200 rounded w-3/4"></div>
//                             <div className="h-4 bg-gray-200 rounded w-full"></div>
//                             <div className="h-4 bg-gray-200 rounded w-5/6"></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (!stockItem) {
//         notFound();
//     }

//     return (
//         <div className="p-4 max-w-6xl mx-auto">
//             <div className="flex items-center mb-6">
//                 <Link href="/stocks" className="mr-4 p-2 rounded-full hover:bg-gray-100">
//                     <RiArrowLeftLine className="text-2xl" />
//                 </Link>
//                 <h1 className="text-3xl font-bold">Edit {stockItem.name}</h1>
//             </div>

//             <form onSubmit={handleSubmit}>
//                 <div className="grid md:grid-cols-2 gap-8">
//                     {/* Image Gallery */}
//                     <div className="bg-white rounded-lg shadow-md p-4">
//                         <h2 className="text-xl font-semibold mb-4">Product Images</h2>

//                         <div className="flex flex-wrap gap-4 mb-4">
//                             {images.map((image, index) => (
//                                 <div key={index} className="relative h-32 w-32">
//                                     <Image
//                                         src={image}
//                                         alt={`Product image ${index + 1}`}
//                                         fill
//                                         className="object-cover rounded-lg"
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={() => handleRemoveImage(image, index)}
//                                         className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
//                                     >
//                                         <RiCloseFill className="text-white text-sm" />
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>

//                         <label className="block mb-2 text-sm font-medium text-gray-900">
//                             Add More Images
//                         </label>
//                         <input
//                             type="file"
//                             accept="image/*"
//                             multiple
//                             onChange={(e) => e.target.files && handleImageUpload(Array.from(e.target.files))}
//                             className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
//                         />
//                         <p className="mt-1 text-sm text-gray-500">Upload up to 5 additional images</p>
//                     </div>

//                     {/* Product Details Form */}
//                     <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
//                         <div>
//                             <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
//                                 Product Name
//                             </label>
//                             <input
//                                 type="text"
//                                 id="name"
//                                 name="name"
//                                 value={formData.name}
//                                 onChange={handleInputChange}
//                                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">
//                                 Category
//                             </label>
//                             <select
//                                 id="category"
//                                 name="category"
//                                 value={formData.category}
//                                 onChange={handleInputChange}
//                                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
//                             >
//                                 <option value="">Select a category</option>
//                                 {drugCategories.map((cat) => (
//                                     <option key={cat.id} value={cat.name}>
//                                         {cat.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div>
//                             <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">
//                                 Description
//                             </label>
//                             <input
//                                 type="text"
//                                 id="description"
//                                 name="description"
//                                 value={formData.description}
//                                 onChange={handleInputChange}
//                                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
//                             />
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <label htmlFor="purchasePrice" className="block mb-2 text-sm font-medium text-gray-900">
//                                     Purchase Price
//                                 </label>
//                                 <input
//                                     type="number"
//                                     id="purchasePrice"
//                                     name="purchasePrice"
//                                     value={formData.purchasePrice}
//                                     onChange={handleInputChange}
//                                     className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
//                                     min="0"
//                                     step="0.01"
//                                 />
//                             </div>
//                             <div>
//                                 <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900">
//                                     Selling Price
//                                 </label>
//                                 <input
//                                     type="number"
//                                     id="amount"
//                                     name="amount"
//                                     value={formData.amount}
//                                     onChange={handleInputChange}
//                                     className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
//                                     min="0"
//                                     step="0.01"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label htmlFor="discount" className="block mb-2 text-sm font-medium text-gray-900">
//                                 Discount (%)
//                             </label>
//                             <input
//                                 type="number"
//                                 id="discount"
//                                 name="discount"
//                                 value={formData.discount}
//                                 onChange={handleInputChange}
//                                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
//                                 min="0"
//                                 max="100"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="mt-8 flex justify-end space-x-4">
//                     <Link
//                         href={`/stocks/${params.id}`}
//                         className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
//                     >
//                         Cancel
//                     </Link>
//                     <button
//                         type="submit"
//                         className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
//                         disabled={isSubmitting}
//                     >
//                         {isSubmitting ? 'Saving...' : 'Save Changes'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default EditStockPage;

import React from 'react'

const EditStockPage = () => {
    return (
        <div>EditStockPage</div>
    )
}

export default EditStockPage