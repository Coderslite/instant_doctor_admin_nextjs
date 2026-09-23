'use client'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import Modal from '@/components/Modal'
import { AdminModel } from '@/app/model/admin_model'
import {
    createAdministrator,
    deleteAdministrator,
    getAdministrators,
    updateAdministratorRole
} from '@/server/administrators'
import { getPharmacyId } from '@/server/auth'
import { AdminRole, ROLE_OPTIONS } from '@/utils/roles'
import { formatDate } from '@/utils/formatTime'

const emptyForm = { name: '', email: '', password: '', role: 'marketer' as AdminRole }

const inputClass = 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'

const Team = () => {
    const [admins, setAdmins] = useState<AdminModel[]>([])
    const [loading, setLoading] = useState(true)
    const [currentAdminId, setCurrentAdminId] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)
    const [busyId, setBusyId] = useState<string | null>(null)

    const loadAdmins = async () => {
        try {
            setAdmins(await getAdministrators())
        } catch (error) {
            console.error('Error fetching administrators:', error)
            toast.error('Could not load users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setCurrentAdminId(getPharmacyId())
        loadAdmins()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }
        setSaving(true)
        try {
            await createAdministrator(form)
            toast.success(`${form.name} added as ${form.role}`)
            setForm(emptyForm)
            setIsModalOpen(false)
            await loadAdmins()
        } catch (error: any) {
            toast.error(error.message || 'Could not add user')
        } finally {
            setSaving(false)
        }
    }

    const handleRoleChange = async (admin: AdminModel, role: AdminRole) => {
        setBusyId(admin.id)
        try {
            await updateAdministratorRole(admin.id, role)
            toast.success(`${admin.name} is now ${role === 'admin' ? 'an admin' : 'a ' + role}`)
            await loadAdmins()
        } catch (error: any) {
            toast.error(error.message || 'Could not update role')
        } finally {
            setBusyId(null)
        }
    }

    const handleDelete = async (admin: AdminModel) => {
        if (!confirm(`Remove ${admin.name} (${admin.email})? They will no longer be able to log in.`)) return
        setBusyId(admin.id)
        try {
            await deleteAdministrator(admin.id)
            toast.success(`${admin.name} removed`)
            await loadAdmins()
        } catch (error: any) {
            toast.error(error.message || 'Could not remove user')
        } finally {
            setBusyId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div>
                    <h4 className='text-3xl font-bold uppercase'>Team &amp; Roles</h4>
                    <p className="text-gray-600 text-sm mt-1">People who can log in to this admin panel and what they can access</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white py-2 px-5 rounded-2xl"
                >
                    <FiPlus /> Add user
                </button>
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Role</th>
                            <th scope="col">Added</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => {
                            const isSelf = admin.id === currentAdminId
                            return (
                                <tr key={admin.id}>
                                    <td className="font-medium text-gray-900">
                                        {admin.name}
                                        {isSelf && <span className="ml-2 text-xs text-gray-500">(you)</span>}
                                    </td>
                                    <td>{admin.email}</td>
                                    <td>
                                        {/* Changing your own role could lock you out, so it's read-only */}
                                        <select
                                            value={admin.role}
                                            disabled={isSelf || busyId === admin.id}
                                            onChange={e => handleRoleChange(admin, e.target.value as AdminRole)}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 disabled:opacity-60"
                                        >
                                            {ROLE_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        {admin.createdAt ? formatDate(admin.createdAt) : '—'}
                                    </td>
                                    <td>
                                        {!isSelf && (
                                            <button
                                                onClick={() => handleDelete(admin)}
                                                disabled={busyId === admin.id}
                                                className="flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-60"
                                            >
                                                <FiTrash2 /> Remove
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add user">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Full name</label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Temporary password</label>
                        <input
                            type="text"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className={inputClass}
                        />
                        <p className="text-xs text-gray-500 mt-1">At least 8 characters. Share it with them privately.</p>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">Role</label>
                        <div className="space-y-2">
                            {ROLE_OPTIONS.map(option => (
                                <label
                                    key={option.value}
                                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${form.role === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={option.value}
                                        checked={form.role === option.value}
                                        onChange={() => setForm({ ...form, role: option.value })}
                                        className="mt-1"
                                    />
                                    <span>
                                        <span className="block font-medium text-gray-900">{option.label}</span>
                                        <span className="block text-xs text-gray-500">{option.description}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-primary text-white py-2.5 rounded-lg disabled:opacity-60"
                    >
                        {saving ? 'Adding…' : 'Add user'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}

export default Team
