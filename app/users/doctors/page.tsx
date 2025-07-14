'use client'
import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { Timestamp } from 'firebase/firestore'
import Link from 'next/link'
import { FiClock, FiEye, FiX } from 'react-icons/fi'
import { UserModel } from '@/app/model/user_model'
import { getDoctors } from '@/server/doctors'
import { formatDate } from '@/utils/formatTime'


const Doctors = () => {
    const [doctors, setdoctors] = useState<UserModel[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchdoctors = async () => {
            try {
                setLoading(true)
                const doctors = await getDoctors();
                setdoctors(doctors)
            } catch (error) {
                console.error('Error fetching doctors:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchdoctors()
    }, [])


    const filtereddoctors = doctors.filter(patient => {
        const searchLower = searchTerm.toLowerCase()
        return (
            patient.id.toLowerCase().includes(searchLower) ||
            (patient.firstname.toString() + ' ' + patient.lastname.toString()).includes(searchLower) ||
            formatDate(patient.createdAt!).toLowerCase().includes(searchLower)
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
            <h4 className='text-3xl font-bold text-center mb-5 uppercase'>Doctors</h4>

            <div className="flex justify-center gap-2 md:flex-row flex-col mb-6">
                <div className="relative w-full max-w-2xl">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <IoSearchOutline />
                    </div>
                    <input
                        type="search"
                        className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search by product, order ID, amount, or date"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3">Name</th>
                            <th scope="col" className="px-4 py-3">Email</th>
                            <th scope="col" className="px-4 py-3">Phone Number</th>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtereddoctors.length === 0 ? (
                            <tr className="bg-white border-b">
                                <td colSpan={6} className="px-4 py-4 text-center">
                                    {searchTerm ? 'No matching doctors found' : 'No doctors yet'}
                                </td>
                            </tr>
                        ) : (
                            filtereddoctors.map((patient) => (
                                <tr key={patient.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-4 font-medium text-gray-900">
                                        {patient.firstname + " " + patient.lastname}
                                    </td>
                                    <td className="px-4 py-4">
                                        {patient.email}
                                    </td>
                                    <td className="px-4 py-4">
                                        {patient.phoneNumber}
                                    </td>
                                    <td className="px-4 py-4">
                                        {formatDate(patient.createdAt == null ? Timestamp.now() : patient.createdAt)}
                                    </td>
                                    <td>
                                        <Link href={`/users/doctors/${patient.id}`} className='bg-primary py-2 px-5 rounded-2xl text-white'>View</Link>
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

export default Doctors