'use client'
import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { getAllAppointments, EnhancedAppointmentModel } from '@/server/appointment'
import Link from 'next/link'
import { FiEye, FiUser, FiCheckCircle, FiXCircle, FiLoader, FiClock, FiCalendar, FiActivity } from 'react-icons/fi'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'

const AllAppointments = () => {
    const [appointments, setAppointments] = useState<EnhancedAppointmentModel[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true)
                const allAppointments = await getAllAppointments()
                setAppointments(allAppointments)
            } catch (error) {
                console.error('Error fetching appointments:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAppointments()
    }, [])

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <FiCheckCircle className="mr-1 text-green-500" />
            case 'cancelled':
                return <FiXCircle className="mr-1 text-red-500" />
            case 'ongoing':
                return <FiLoader className="mr-1 animate-spin text-purple-500" />
            case 'confirmed':
                return <FiCheckCircle className="mr-1 text-blue-500" />
            case 'active':
                return <FiActivity className="mr-1 text-green-600" />
            default: // pending
                return <FiClock className="mr-1 text-yellow-500" />
        }
    }

    const formatAppointmentDateTime = (startTime: Date) => {
        const date = new Date(startTime)
        const timeString = format(date, 'h:mm a')
        
        if (isToday(date)) {
            return `Today, ${timeString}`
        } else if (isYesterday(date)) {
            return `Yesterday, ${timeString}`
        } else if (isThisWeek(date)) {
            return `${format(date, 'EEE')}, ${timeString}`
        } else {
            return `${format(date, 'MMM d')}, ${timeString}`
        }
    }

    const filteredAppointments = appointments.filter(appointment => {
        const searchLower = searchTerm.toLowerCase()
        return (
            appointment.id.toLowerCase().includes(searchLower) ||
            appointment.doctorName.toLowerCase().includes(searchLower) ||
            appointment.patientName.toLowerCase().includes(searchLower) ||
            formatAppointmentDateTime(appointment.startTime.toDate()).toLowerCase().includes(searchLower) ||
            appointment.complain.toLowerCase().includes(searchLower) ||
            appointment.status.toLowerCase().includes(searchLower)
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
            <h4 className='text-3xl font-bold text-center mb-5 uppercase'>All Appointments</h4>

            <div className="flex justify-center gap-2 md:flex-row flex-col mb-6">
                <div className="relative w-full max-w-2xl">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <IoSearchOutline />
                    </div>
                    <input
                        type="search"
                        className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search appointments..."
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
                            <th scope="col" className="px-4 py-3">Date & Time</th>
                            <th scope="col" className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length === 0 ? (
                            <tr className="bg-white border-b">
                                <td colSpan={6} className="px-4 py-4 text-center">
                                    {searchTerm ? 'No appointments found' : 'No appointments scheduled'}
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
                                        <span className={`${appointment.statusInfo.class} rounded-full px-3 py-1 text-xs flex items-center w-fit`}>
                                            {getStatusIcon(appointment.status)}
                                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 max-w-xs truncate">
                                        {appointment.complain || 'No complaint noted'}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <FiCalendar className="mr-2 text-gray-400" />
                                            {formatAppointmentDateTime(appointment.startTime.toDate())}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Link
                                            href={`/appointments/details/${appointment.id}`}
                                            className='inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors'
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

export default AllAppointments