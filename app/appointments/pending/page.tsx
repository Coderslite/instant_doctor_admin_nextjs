'use client'
import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { getPendingAppointments } from '@/server/appointment'
import { Timestamp } from 'firebase/firestore'
import Link from 'next/link'
import { FiClock, FiEye, FiAlertCircle, FiUser } from 'react-icons/fi'
import { UserModel } from '@/app/model/user_model'
import { AppointmentModel } from '@/app/model/appointment_model'

interface AppointmentWithNames extends AppointmentModel {
    doctorName: string;
    patientName: string;
}

const PendingAppointments = () => {
    const [appointments, setAppointments] = useState<AppointmentWithNames[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true)
                const pendingAppointments = await getPendingAppointments()
                setAppointments(pendingAppointments)
            } catch (error) {
                console.error('Error fetching appointments:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAppointments()
    }, [])

    const formatDate = (timestamp: Timestamp) => {
        const date = new Date(timestamp.seconds * 1000)
        const now = new Date()

        // If today, show time
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        // If yesterday, show "Yesterday"
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday'
        }

        // Otherwise show full date
        return date.toLocaleDateString()
    }

    const formatTimeRange = (startTime: Timestamp, endTime: Timestamp) => {
        const start = new Date(startTime.seconds * 1000)
        const end = new Date(endTime.seconds * 1000)
        return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }

    const filteredAppointments = appointments.filter(appointment => {
        const searchLower = searchTerm.toLowerCase()
        return (
            appointment.id.toLowerCase().includes(searchLower) ||
            appointment.doctorName.toLowerCase().includes(searchLower) ||
            appointment.patientName.toLowerCase().includes(searchLower) ||
            formatDate(appointment.startTime).toLowerCase().includes(searchLower) ||
            appointment.complain.toLowerCase().includes(searchLower)
        )
    })

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <h4 className='text-3xl font-bold text-center mb-5 uppercase'>Pending Appointments</h4>

            <div className="flex justify-center gap-2 md:flex-row flex-col mb-6">
                <div className="relative w-full max-w-2xl">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <IoSearchOutline />
                    </div>
                    <input
                        type="search"
                        className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search by patient, doctor, complaint, or date"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3">Patient</th>
                            <th scope="col" className="px-4 py-3">Doctor</th>
                            <th scope="col" className="px-4 py-3">Status</th>
                            <th scope="col" className="px-4 py-3">Complaint</th>
                            <th scope="col" className="px-4 py-3">Time</th>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length === 0 ? (
                            <tr className="bg-white border-b">
                                <td colSpan={7} className="px-4 py-4 text-center">
                                    {searchTerm ? 'No matching appointments found' : 'No pending appointments yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map((appointment) => (
                                <tr key={appointment.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-4 font-medium text-gray-900">
                                        <div className="flex items-center">
                                            <FiUser className="mr-2 text-gray-400" />
                                            {appointment.patientName}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        {appointment.doctorName || 'Unassigned'}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className='bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-xs flex items-center w-fit'>
                                            <FiAlertCircle className="mr-1" /> Pending
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 max-w-xs truncate">
                                        {appointment.complain || 'No complaint noted'}
                                    </td>
                                    <td className="px-4 py-4">
                                        {formatTimeRange(appointment.startTime, appointment.endTime)}
                                    </td>
                                    <td className="px-4 py-4">{formatDate(appointment.startTime)}</td>
                                    <td className="px-4 py-4">
                                        <Link
                                            href={`/appointments/details/${appointment.id}`}
                                            className='inline-flex items-center bg-blue-500 text-white px-3 py-1 rounded-lg text-sm'
                                        >
                                            <FiEye className="mr-1" /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PendingAppointments