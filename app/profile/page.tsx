'use client'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import {
    AdminProfile,
    changeAdministratorPassword,
    getAdministratorProfile,
    updateAdministratorProfile
} from '@/server/administrators'
import { getPharmacyId } from '@/server/auth'
import { ROLE_OPTIONS } from '@/utils/roles'

const inputClass = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed'
const labelClass = 'block mb-2 text-sm font-medium text-gray-900 dark:text-white'

const emptyPasswords = { current: '', next: '', confirm: '' }

const Profile = () => {
    const [adminId, setAdminId] = useState('')
    const [profile, setProfile] = useState<AdminProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [savingProfile, setSavingProfile] = useState(false)
    const [passwords, setPasswords] = useState(emptyPasswords)
    const [showPasswords, setShowPasswords] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)

    useEffect(() => {
        const id = getPharmacyId()
        setAdminId(id)
        getAdministratorProfile(id)
            .then(setProfile)
            .catch(error => {
                console.error('Error fetching profile:', error)
                toast.error('Could not load your profile')
            })
            .finally(() => setLoading(false))
    }, [])

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile) return
        if (!profile.name.trim()) {
            toast.error('Name is required')
            return
        }
        setSavingProfile(true)
        try {
            await updateAdministratorProfile(adminId, profile)
            // Keep the name cookie set at login in sync
            document.cookie = `adminName=${encodeURIComponent(profile.name.trim())};path=/;max-age=${7 * 24 * 60 * 60}`
            toast.success('Profile updated')
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Could not update profile')
        } finally {
            setSavingProfile(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwords.next.length < 8) {
            toast.error('New password must be at least 8 characters')
            return
        }
        if (passwords.next !== passwords.confirm) {
            toast.error('New passwords do not match')
            return
        }
        if (passwords.next === passwords.current) {
            toast.error('New password must be different from the current one')
            return
        }
        setSavingPassword(true)
        try {
            await changeAdministratorPassword(adminId, passwords.current, passwords.next)
            setPasswords(emptyPasswords)
            toast.success('Password changed')
        } catch (error: any) {
            toast.error(error.message || 'Could not change password')
        } finally {
            setSavingPassword(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!profile) {
        return <p className="text-center text-gray-600 mt-10">Profile not found. Try logging out and back in.</p>
    }

    const roleLabel = ROLE_OPTIONS.find(option => option.value === profile.role)?.label ?? profile.role

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h4 className='text-center font-bold text-2xl mb-5'>Profile</h4>
            <div>
                <h4 className='text-2xl font-bold'>Account Information</h4>
                <p className='text-gray-600'>Update your account information</p>
            </div>

            {/* Personal information */}
            <form onSubmit={handleSaveProfile} className='personal-information mt-7'>
                <div className='flex justify-between items-center gap-2'>
                    <h5 className='font-bold text-xl'>Personal Information</h5>
                    <button type="submit" disabled={savingProfile} className='text-primary font-bold disabled:opacity-60'>
                        {savingProfile ? 'saving…' : 'save'}
                    </button>
                </div>
                <div className='grid md:grid-cols-2 gap-4 mt-4'>
                    <div>
                        <label htmlFor="name" className={labelClass}>Full Name</label>
                        <input
                            type="text"
                            id="name"
                            required
                            value={profile.name}
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className={labelClass}>Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            value={profile.phoneNumber}
                            onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                    <div className='md:col-span-2'>
                        <label htmlFor="address" className={labelClass}>Address</label>
                        <input
                            type="text"
                            id="address"
                            value={profile.address}
                            onChange={e => setProfile({ ...profile, address: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className={labelClass}>Email Address</label>
                        <input type="email" id="email" value={profile.email} disabled className={inputClass} />
                        <p className="text-xs text-gray-500 mt-1">Used to log in. Ask an admin to change it.</p>
                    </div>
                    <div>
                        <label htmlFor="role" className={labelClass}>Role</label>
                        <input type="text" id="role" value={roleLabel} disabled className={inputClass} />
                    </div>
                </div>
            </form>

            {/* Password */}
            <form onSubmit={handleChangePassword} className='mt-10 pt-6 border-t border-gray-200'>
                <div className='flex justify-between items-center gap-2'>
                    <h5 className='font-bold text-xl'>Change Password</h5>
                    <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className='flex items-center gap-1 text-sm text-gray-600'
                    >
                        {showPasswords ? <FaEyeSlash /> : <FaEye />}
                        {showPasswords ? 'Hide' : 'Show'}
                    </button>
                </div>
                <div className='grid md:grid-cols-2 gap-4 mt-4'>
                    <div className='md:col-span-2'>
                        <label htmlFor="current-password" className={labelClass}>Current Password</label>
                        <input
                            type={showPasswords ? 'text' : 'password'}
                            id="current-password"
                            required
                            autoComplete="current-password"
                            value={passwords.current}
                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="new-password" className={labelClass}>New Password</label>
                        <input
                            type={showPasswords ? 'text' : 'password'}
                            id="new-password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={passwords.next}
                            onChange={e => setPasswords({ ...passwords, next: e.target.value })}
                            className={inputClass}
                        />
                        <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className={labelClass}>Confirm New Password</label>
                        <input
                            type={showPasswords ? 'text' : 'password'}
                            id="confirm-password"
                            required
                            autoComplete="new-password"
                            value={passwords.confirm}
                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={savingPassword}
                    className='mt-5 bg-primary text-white py-2.5 px-6 rounded-lg disabled:opacity-60'
                >
                    {savingPassword ? 'Updating…' : 'Update Password'}
                </button>
            </form>
        </div>
    )
}

export default Profile
