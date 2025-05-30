// src/app/pharmacies/edit/[id]/page.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPharmacyById, updatePharmacy } from '@/server/pharmacies';
import { PharmacyModel } from '@/app/model/pharmacy_model';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { GeoPoint } from 'firebase/firestore';

const EditPharmacyPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        email: '',
        phoneNumber: '',
        deliveryFee: 100,
        password: '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchPharmacy = async () => {
            try {
                setLoading(true);
                const pharmacy = await getPharmacyById(id as string);

                if (!pharmacy) {
                    toast.error('Pharmacy not found');
                    router.push('/pharmacies');
                    return;
                }

                setFormData({
                    name: pharmacy.name,
                    address: pharmacy.address,
                    latitude: pharmacy.location.latitude.toString(),
                    longitude: pharmacy.location.longitude.toString(),
                    email: pharmacy.email,
                    phoneNumber: pharmacy.phoneNumber,
                    deliveryFee: pharmacy.deliveryFee,
                    password: '' // Don't pre-fill password for security
                });

                if (pharmacy.image) {
                    setCurrentImageUrl(pharmacy.image);
                }
            } catch (error) {
                toast.error('Failed to fetch pharmacy details');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacy();
    }, [id, router]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.latitude.trim()) newErrors.latitude = 'Latitude is required';
        if (!formData.longitude.trim()) newErrors.longitude = 'Longitude is required';
        if (isNaN(Number(formData.latitude))) newErrors.latitude = 'Must be a number';
        if (isNaN(Number(formData.longitude))) newErrors.longitude = 'Must be a number';
        if (formData.deliveryFee && isNaN(Number(formData.deliveryFee))) {
            newErrors.deliveryFee = 'Must be a valid number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setUpdating(true);

        try {
            const updateData = {
                name: formData.name,
                address: formData.address,
                location: new GeoPoint(
                    parseFloat(formData.latitude),
                    parseFloat(formData.longitude)
                ),
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                deliveryFee: formData.deliveryFee,
                ...(formData.password && { password: formData.password }) // Only update password if changed
            };

            await updatePharmacy(id as string, updateData, imageFile || undefined);
            toast.success('Pharmacy updated successfully!');
            router.push('/pharmacies');
        } catch (error) {
            console.error('Error updating pharmacy:', error);
            toast.error('Failed to update pharmacy. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-6">Edit Pharmacy</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pharmacy Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pharmacy Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter pharmacy name"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address *
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter full address"
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter email address"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Enter phone number"
                        />
                    </div>

                    {/* Delivery Fee */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Fee (₦)
                        </label>
                        <input
                            type="number"
                            name="deliveryFee"
                            value={formData.deliveryFee}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${errors.deliveryFee ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter delivery fee"
                            min="0"
                            step="0.01"
                        />
                        {errors.deliveryFee && <p className="text-red-500 text-sm mt-1">{errors.deliveryFee}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password (leave blank to keep current)
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    {/* Latitude */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude *
                        </label>
                        <input
                            type="text"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${errors.latitude ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="e.g., 6.5244"
                        />
                        {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
                    </div>

                    {/* Longitude */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude *
                        </label>
                        <input
                            type="text"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${errors.longitude ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="e.g., 3.3792"
                        />
                        {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
                    </div>

                    {/* Image Upload */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pharmacy Image
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Change Image
                                </button>
                            </div>
                            {(imagePreview || currentImageUrl) && (
                                <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                                    <Image
                                        src={imagePreview || currentImageUrl || ''}
                                        alt="Pharmacy Preview"
                                        className="w-full h-full object-cover"
                                        width={64}
                                        height={64}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => router.push('/pharmacies')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={updating}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        disabled={updating}
                    >
                        {updating ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </span>
                        ) : 'Update Pharmacy'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPharmacyPage;