'use client'
import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { getPatients } from '@/server/patients'
import { Timestamp } from 'firebase/firestore'
import Link from 'next/link'
import { FiClock, FiEye, FiX } from 'react-icons/fi'
import { UserModel } from '@/app/model/user_model'
import { formatDate } from '@/utils/formatTime'
import { maskEmail, maskPhone } from '@/utils/roles'
import { useRole } from '@/utils/useRole'

const Patients = () => {
    const role = useRole()
    // Marketers see masked contact details and a restricted profile
    const isAdmin = role === 'admin'
    const [patients, setPatients] = useState<UserModel[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const patientsPerPage = 10 // Number of patients per page

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true)
                const patients = await getPatients()
                setPatients(patients)
            } catch (error) {
                console.error('Error fetching patients:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPatients()
    }, [])

    const filteredPatients = patients.filter(patient => {
        const searchLower = searchTerm.toLowerCase()
        return (
            patient.id.toLowerCase().includes(searchLower) ||
            (patient.firstname.toString() + ' ' + patient.lastname.toString()).toLowerCase().includes(searchLower) ||
            formatDate(patient.createdAt!).toLowerCase().includes(searchLower) ||
            // Lets marketers find patients by city, state or country
            (patient.address ?? '').toLowerCase().includes(searchLower) ||
            (patient.country ?? '').toLowerCase().includes(searchLower)
        )
    })

    // Calculate pagination
    const totalPatients = filteredPatients.length
    const totalPages = Math.ceil(totalPatients / patientsPerPage)
    const indexOfLastPatient = currentPage * patientsPerPage
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage
    const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient)

    // Handle page change
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
    }

    // Page numbers to show: first, last, and a window around the current page,
    // with '…' for the gaps so the bar stays short however many pages there are
    const pageNumbers: (number | '…')[] = []
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
            pageNumbers.push(i)
        } else if (pageNumbers[pageNumbers.length - 1] !== '…') {
            pageNumbers.push('…')
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
            <h4 className='text-3xl font-bold text-center mb-5 uppercase'>Patients</h4>

            <div className="flex justify-center gap-2 md:flex-row flex-col mb-6">
                <div className="relative w-full max-w-2xl">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <IoSearchOutline />
                    </div>
                    <input
                        type="search"
                        className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search by name, address, country or date"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List Count */}
            <div className="mb-4 text-gray-600">
                Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, totalPatients)} of {totalPatients} patients
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Phone Number</th>
                            <th scope="col">Address</th>
                            <th scope="col">Date</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPatients.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center">
                                    {searchTerm ? 'No matching patients found' : 'No patients yet'}
                                </td>
                            </tr>
                        ) : (
                            currentPatients.map((patient, index) => (
                                <tr key={patient.id}>
                                    <td className="font-medium text-gray-900">
                                        {(currentPage - 1) * patientsPerPage + index + 1}
                                    </td>
                                    <td>
                                        <Link href={`/users/patients/${patient.id}`} className="font-medium text-gray-900 hover:text-primary hover:underline">
                                            {patient.firstname + " " + patient.lastname}
                                        </Link>
                                    </td>
                                    <td>
                                        {isAdmin ? patient.email : maskEmail(patient.email)}
                                    </td>
                                    <td>
                                        {isAdmin ? patient.phoneNumber : maskPhone(patient.phoneNumber)}
                                    </td>
                                    {/* Address is visible to every role, including marketers */}
                                    <td className="max-w-xs">
                                        {patient.address ? (
                                            <>
                                                <span className="block truncate" title={patient.address}>{patient.address}</span>
                                                {patient.country && !patient.address.toLowerCase().includes(patient.country.toLowerCase()) && (
                                                    <span className="block text-xs text-gray-400">{patient.country}</span>
                                                )}
                                            </>
                                        ) : patient.country ? (
                                            patient.country
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td>
                                        {formatDate(patient.lastSeen == null ? Timestamp.now() : patient.lastSeen)}
                                    </td>
                                    <td>
                                        <div className="flex gap-2 whitespace-nowrap">
                                            <Link href={`/users/patients/${patient.id}`} className="table-action">View</Link>
                                            {patient.email && <Link href={`/mail?userId=${patient.id}`} className="table-action">Email</Link>}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav className="inline-flex rounded-md shadow">
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            Previous
                        </button>

                        {/* Page Numbers */}
                        {pageNumbers.map((number, i) => number === '…' ? (
                            <span
                                key={`gap-${i}`}
                                className="px-3 py-2 border border-gray-300 bg-white text-sm text-gray-500"
                            >
                                …
                            </span>
                        ) : (
                            <button
                                key={number}
                                onClick={() => handlePageChange(number)}
                                className={`px-3 py-2 border border-gray-300 text-sm font-medium ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                {number}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>
    )
}

export default Patients