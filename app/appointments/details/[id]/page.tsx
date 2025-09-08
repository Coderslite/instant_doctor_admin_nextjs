'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FiClock, FiCalendar, FiUser, FiPhone, FiMail, FiHome, FiDollarSign, FiCheck, FiX, FiEdit } from 'react-icons/fi'
import { getAppointmentById, updateAppointment, getAvailableDoctors } from '@/server/appointment'
import { AppointmentModel } from '@/app/model/appointment_model'
import { UserModel } from '@/app/model/user_model'
import Link from 'next/link'
import { Timestamp } from 'firebase/firestore'
import { toast } from 'react-toastify'

const AppointmentDetails = () => {
    const { id } = useParams()
    const router = useRouter()
    const [appointment, setAppointment] = useState<AppointmentModel & { doctorName: string, patientName: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [availableDoctors, setAvailableDoctors] = useState<UserModel[]>([])
    const [showDoctorDropdown, setShowDoctorDropdown] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const appointmentData = await getAppointmentById(id as string)
                const doctors = await getAvailableDoctors()
                
                if (appointmentData) {
                    setAppointment(appointmentData)
                    setSelectedDoctor(appointmentData.doctorId)
                }
                setAvailableDoctors(doctors)
            } catch (error) {
                console.error('Error fetching data:', error)
                toast.error('Failed to load appointment details')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    const formatDate = (timestamp: Timestamp) => {
        const date = new Date(timestamp.seconds * 1000)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatTimeRange = (startTime: Timestamp, endTime: Timestamp) => {
        const start = new Date(startTime.seconds * 1000)
        const end = new Date(endTime.seconds * 1000)
        return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }

    const handleStatusUpdate = async (newStatus: 'pending' | 'active' | 'cancelled') => {
        if (!appointment) return
        
        try {
            setUpdating(true)
            await updateAppointment(appointment.id, { status: newStatus })
            setAppointment({ ...appointment, status: newStatus })
            toast.success(`Appointment marked as ${newStatus}`)
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        } finally {
            setUpdating(false)
        }
    }

    const handlePaymentUpdate = async (isPaid: boolean) => {
        if (!appointment) return
        
        try {
            setUpdating(true)
            await updateAppointment(appointment.id, { isPaid })
            setAppointment({ ...appointment, isPaid })
            toast.success(`Payment status updated to ${isPaid ? 'Paid' : 'Unpaid'}`)
        } catch (error) {
            console.error('Error updating payment:', error)
            toast.error('Failed to update payment status')
        } finally {
            setUpdating(false)
        }
    }

    const handleDoctorTransfer = async () => {
        if (!appointment || !selectedDoctor) return
        
        try {
            setUpdating(true)
            const newDoctor = availableDoctors.find(d => d.id === selectedDoctor)
            await updateAppointment(appointment.id, { 
                doctorId: selectedDoctor,
                status: 'active' // Automatically set to active when assigned
            })
            
            setAppointment({ 
                ...appointment, 
                doctorId: selectedDoctor,
                doctorName: newDoctor ? `${newDoctor.firstname} ${newDoctor.lastname}` : 'Unknown Doctor',
                status: 'active'
            })
            setShowDoctorDropdown(false)
            toast.success('Doctor assigned successfully')
        } catch (error) {
            console.error('Error transferring doctor:', error)
            toast.error('Failed to transfer appointment')
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!appointment) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Appointment not found</p>
                <Link href="/appointments" className="ml-2 text-blue-500 hover:text-blue-700">
                    Back to Appointments
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <Link href="/appointments" className="mr-4 text-blue-500 hover:text-blue-700">
                    &larr; Back to Appointments
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">Appointment Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Patient Details Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FiUser className="mr-2 text-blue-500" />
                        Patient Information
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{appointment.patientName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Appointment ID</p>
                            <p className="font-mono">{appointment.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Complaint</p>
                            <p className="font-medium">{appointment.complain || 'Not specified'}</p>
                        </div>
                    </div>
                </div>

                {/* Appointment Details Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FiCalendar className="mr-2 text-blue-500" />
                        Appointment Details
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">{formatDate(appointment.startTime)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-medium">{formatTimeRange(appointment.startTime, appointment.endTime)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    appointment.status === 'active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : appointment.status === 'cancelled' 
                                            ? 'bg-red-100 text-red-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {appointment.status}
                                </span>
                                <div className="flex space-x-1">
                                    <button 
                                        onClick={() => handleStatusUpdate('active')}
                                        disabled={updating || appointment.status === 'active'}
                                        className="p-1 text-green-500 hover:text-green-700 disabled:opacity-50"
                                    >
                                        <FiCheck />
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate('cancelled')}
                                        disabled={updating || appointment.status === 'cancelled'}
                                        className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Payment</p>
                            <div className="flex items-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    appointment.isPaid 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {appointment.isPaid ? 'Paid' : 'Pending'}
                                </span>
                                <button 
                                    onClick={() => handlePaymentUpdate(!appointment.isPaid)}
                                    disabled={updating}
                                    className="ml-2 p-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"
                                >
                                    <FiEdit size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doctor Details Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FiUser className="mr-2 text-blue-500" />
                        Doctor Information
                    </h3>
                    {appointment.doctorId ? (
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Doctor</p>
                                <p className="font-medium">{appointment.doctorName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium">Assigned</p>
                            </div>
                            <div className="pt-2">
                                <button 
                                    onClick={() => setShowDoctorDropdown(!showDoctorDropdown)}
                                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                                >
                                    <FiEdit className="mr-1" /> Transfer to another doctor
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-yellow-600">No doctor assigned yet</p>
                            <button 
                                onClick={() => setShowDoctorDropdown(!showDoctorDropdown)}
                                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                            >
                                <FiUser className="mr-1" /> Assign Doctor
                            </button>
                        </div>
                    )}

                    {showDoctorDropdown && (
                        <div className="mt-4 space-y-2">
                            <select
                                value={selectedDoctor || ''}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Select a doctor</option>
                                {availableDoctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>
                                        Dr. {doctor.firstname} {doctor.lastname}
                                    </option>
                                ))}
                            </select>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleDoctorTransfer}
                                    disabled={!selectedDoctor || updating}
                                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                                >
                                    {updating ? 'Processing...' : 'Confirm Transfer'}
                                </button>
                                <button
                                    onClick={() => setShowDoctorDropdown(false)}
                                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => router.push(`/users/patients/${appointment.userId}`)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center"
                    >
                        <FiUser className="mr-2" /> View Patient Profile
                    </button>
                    {appointment.doctorId && (
                        <button
                            onClick={() => router.push(`/users/doctors/${appointment.doctorId}`)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center"
                        >
                            <FiUser className="mr-2" /> View Doctor Profile
                        </button>
                    )}
                    <button
                        onClick={() => window.print()}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center"
                    >
                        <FiEdit className="mr-2" /> Print Appointment Summary
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AppointmentDetails