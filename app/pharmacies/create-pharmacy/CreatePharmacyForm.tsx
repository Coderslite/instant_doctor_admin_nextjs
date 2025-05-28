// src/app/components/pharmacies/CreatePharmacyForm.tsx
'use client';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPharmacy } from '@/server/pharmacies';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreatePharmacyForm = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        email: '',
        phoneNumber: '',
        deliveryFee: '',
        password: '',
        confirmPassword: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);

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
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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

        setLoading(true);

        try {
            const pharmacyData = {
                name: formData.name,
                address: formData.address,
                location: {
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude)
                },
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                deliveryFee: formData.deliveryFee || '0',
                imageFile: imageFile || undefined,
                password: formData.password,
                status: 'active',
            };

            await createPharmacy(pharmacyData);
            toast.success('Pharmacy created successfully!');
            router.push('/pharmacies');
        } catch (error) {
            console.error('Error creating pharmacy:', error);
            toast.error('Failed to create pharmacy. Please try again.');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-6">Create New Pharmacy</h1>

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


                    {/* Image Upload Field */}
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
                                    Choose Image
                                </button>
                            </div>
                            {imagePreview && (
                                <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
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

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password *
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Enter password (min 6 characters)"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password *
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Confirm password"
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => router.push('/pharmacies')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </span>
                        ) : 'Create Pharmacy'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePharmacyForm;