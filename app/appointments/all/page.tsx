'use client'
import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { getAllAppointments, EnhancedAppointmentModel } from '@/server/appointment'
import Link from 'next/link'
import { FiEye, FiUser, FiCheckCircle, FiXCircle, FiLoader, FiClock, FiCalendar } from 'react-icons/fi'
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

    const getAppointmentStatus = (startTime: Date, endTime: Date) => {
        const now = new Date()
        const start = new Date(startTime)
        const end = new Date(endTime)

        if (now >= start && now <= end) {
            return {
                status: 'ongoing',
                class: 'bg-purple-100 text-purple-800',
                icon: <FiLoader className="mr-1 animate-spin text-purple-500" />
            }
        } else if (now > end) {
            return {
                status: 'expired',
                class: 'bg-red-100 text-red-800',
                icon: <FiXCircle className="mr-1 text-red-500" />
            }
        } else {
            return {
                status: 'upcoming',
                class: 'bg-blue-100 text-blue-800',
                icon: <FiClock className="mr-1 text-blue-500" />
            }
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
        const { status } = getAppointmentStatus(appointment.startTime.toDate(), appointment.endTime.toDate())
        return (
            appointment.id.toLowerCase().includes(searchLower) ||
            appointment.doctorName.toLowerCase().includes(searchLower) ||
            appointment.patientName.toLowerCase().includes(searchLower) ||
            formatAppointmentDateTime(appointment.startTime.toDate()).toLowerCase().includes(searchLower) ||
            appointment.complain.toLowerCase().includes(searchLower) ||
            status.toLowerCase().includes(searchLower)
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

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th scope="col">Patient</th>
                            <th scope="col">Doctor</th>
                            <th scope="col">Status</th>
                            <th scope="col">Complaint</th>
                            <th scope="col">Date & Time</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center">
                                    {searchTerm ? 'No appointments found' : 'No appointments scheduled'}
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map((appointment) => {
                                const { status, class: statusClass, icon } = getAppointmentStatus(
                                    appointment.startTime.toDate(),
                                    appointment.endTime.toDate()
                                )
                                return (
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
                                            <span className={`${statusClass} rounded-full px-3 py-1 text-xs flex items-center w-fit`}>
                                                {icon}
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="max-w-xs truncate">
                                            {appointment.complain || 'No complaint noted'}
                                        </td>
                                        <td>
                                            <div className="flex items-center">
                                                <FiCalendar className="mr-2 text-gray-400" />
                                                {formatAppointmentDateTime(appointment.startTime.toDate())}
                                            </div>
                                        </td>
                                        <td>
                                            <Link
                                                href={`/appointments/details/${appointment.id}`}
                                                className="table-action"
                                            >
                                                <FiEye className="mr-1" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AllAppointments