'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { db } from '@/firebase/clientApp'
import { collection, query, where, getDocs } from 'firebase/firestore'

const Login = () => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Direct Firestore query (matches your backend pattern)
            const pharmaciesRef = collection(db, 'Administrator')
            const q = query(pharmaciesRef, where('email', '==', email))
            const querySnapshot = await getDocs(q)

            if (querySnapshot.empty) {
                throw new Error('No administrator found with this email')
            }

            const pharmacyDoc = querySnapshot.docs[0]
            const pharmacyData = pharmacyDoc.data()

            // Password comparison (in production, use bcrypt!)
            if (pharmacyData.password !== password) {
                throw new Error('Invalid password')
            }

            // Set cookies (using document.cookie as fallback)
            const setCookie = (name: string, value: string, days: number) => {
                const date = new Date()
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
                const expires = `expires=${date.toUTCString()}`
                document.cookie = `${name}=${value};${expires};path=/`
            }

            setCookie('adminId', pharmacyDoc.id, 7) // 7 days expiration
            setCookie('adminName', pharmacyData.name, 7)

            toast.success('Login successful!')
            router.push('/')
        } catch (error:any) {
            toast.error(error.message || 'Login failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex md:flex-row flex-col justify-between h-screen bg-gray-50'>
            {/* Left side - Form */}
            <div className='md:w-1/2 md:p-20 p-6 flex flex-col justify-center'>
                <Image
                    alt='logo'
                    src={'/logo.png'}
                    width={200}
                    height={50}
                    className='mx-auto md:mx-0'
                    priority
                />

                <div className='mt-16 mb-4 text-center md:text-left'>
                    <h4 className='font-bold text-3xl text-gray-800'>Welcome back</h4>
                    <p className='text-gray-600'>Welcome back! Please enter your details</p>
                </div>

                <form onSubmit={handleLogin} className='mt-4'>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Email
                        </label>
                        <input
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="mb-6 relative">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent pr-10"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        disabled={isLoading}
                        type="submit"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>

            {/* Right side - Image */}
            <div className="hidden md:block relative w-1/2 bg-[url('/login_bg.png')] bg-cover bg-center">
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                        <h2 className="text-4xl font-bold mb-4">Admin Dashboard</h2>
                        <p className="text-xl opacity-90">Admin Management system</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login