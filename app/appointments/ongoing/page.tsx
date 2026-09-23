'use client'
import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { getOngoingAppointments } from '@/server/appointment'
import { Timestamp } from 'firebase/firestore'
import Link from 'next/link'
import { FiClock, FiEye, FiAlertCircle, FiUser } from 'react-icons/fi'
import { UserModel } from '@/app/model/user_model'
import { AppointmentModel } from '@/app/model/appointment_model'

interface AppointmentWithNames extends AppointmentModel {
    doctorName: string;
    patientName: string;
}

const OngoingAppointments = () => {
    const [appointments, setAppointments] = useState<AppointmentWithNames[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true)
                const OngoingAppointments = await getOngoingAppointments()
                setAppointments(OngoingAppointments)
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
            <h4 className='text-3xl font-bold text-center mb-5 uppercase'>Ongoing Appointments</h4>

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

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th scope="col">Patient</th>
                            <th scope="col">Doctor</th>
                            <th scope="col">Status</th>
                            <th scope="col">Complaint</th>
                            <th scope="col">Time</th>
                            <th scope="col">Date</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center">
                                    {searchTerm ? 'No matching appointments found' : 'No Ongoing appointments yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td className="font-medium text-gray-900">
                                        <div className="flex items-center">
                                            <FiUser className="mr-2 text-gray-400" />
                                            {appointment.patientName}
                                        </div>
                                    </td>
                                    <td>
                                        {appointment.doctorName || 'Unassigned'}
                                    </td>
                                    <td>
                                        <span className='bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs flex items-center w-fit'>
                                            <FiAlertCircle className="mr-1" /> Ongoing
                                        </span>
                                    </td>
                                    <td className="max-w-xs truncate">
                                        {appointment.complain || 'No complaint noted'}
                                    </td>
                                    <td>
                                        {formatTimeRange(appointment.startTime, appointment.endTime)}
                                    </td>
                                    <td>{formatDate(appointment.startTime)}</td>
                                    <td>
                                        <Link
                                            href={`/appointments/details/${appointment.id}`}
                                            className="table-action"
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

export default OngoingAppointments