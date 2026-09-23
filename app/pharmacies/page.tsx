'use client'
import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { deletePharmacy, getPharmacies } from '@/server/pharmacies'
import { Timestamp } from 'firebase/firestore'
import Link from 'next/link'
import { PharmacyModel } from '@/app/model/pharmacy_model'
import { toast } from 'react-toastify'
import { formatDate } from '@/utils/formatTime'

const Pharmacies = () => {
    const [pharmacies, setPharmacies] = useState<PharmacyModel[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchPharmacies = async () => {
            try {
                setLoading(true)
                const pharmacies = await getPharmacies()
                setPharmacies(pharmacies)
            } catch (error) {
                console.error('Error fetching pharmacies:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPharmacies()
    }, [])

    const handleDeletePharmacy = async (pharmacyId: string) => {
        if (window.confirm('Are you sure you want to delete this pharmacy? This will also mark all its stocks as deleted.')) {
            try {
                await deletePharmacy(pharmacyId);
                toast.success('Pharmacy and its stocks marked as deleted successfully');
                // Refresh the pharmacies list
                const updatedPharmacies = await getPharmacies();
                setPharmacies(updatedPharmacies);
            } catch (error) {
                console.error('Error deleting pharmacy:', error);
                toast.error('Failed to delete pharmacy');
            }
        }
    };


    const filteredPharmacies = pharmacies.filter(pharmacy => {
        const searchLower = searchTerm.toLowerCase()
        return (
            pharmacy.id.toLowerCase().includes(searchLower) ||
            pharmacy.name.toLowerCase().includes(searchLower) ||
            pharmacy.address.toLowerCase().includes(searchLower) ||
            pharmacy.email.toLowerCase().includes(searchLower) ||
            pharmacy.phoneNumber.toLowerCase().includes(searchLower) ||
            formatDate(pharmacy.createdAt).toLowerCase().includes(searchLower)
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
            <h4 className='text-3xl font-bold text-center mb-5 uppercase'>Pharmacies</h4>

            <div className="flex md:justify-between gap-2 md:flex-row flex-col mb-6">
                <form className="md:w-1/2 w-full">
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <IoSearchOutline />
                        </div>
                        <input
                            type="search"
                            id="default-search"
                            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search drugs by name or description"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                // setCurrentPage(1); // Reset to first page when searching
                            }}
                        />
                    </div>
                </form>
                <div className='md:justify-start justify-end md:flex-col flex md:w-fit w-full'>
                    <Link href="/pharmacies/create-pharmacy" className='btn bg-blue text-white rounded-2xl px-10 p-2 hover:bg-blue-600 transition'>
                        Add Pharmacy
                    </Link>
                </div>
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Address</th>
                            <th scope="col">Email</th>
                            <th scope="col">Phone Number</th>
                            <th scope="col">Delivery Fee</th>
                            <th scope="col">Date Added</th>
                            <th scope="col">Edit</th>
                            <th scope="col">Delete</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPharmacies.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center">
                                    {searchTerm ? 'No matching pharmacies found' : 'No pharmacies registered yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredPharmacies.map((pharmacy) => (
                                <tr key={pharmacy.id}>
                                    <td className="font-medium text-gray-900">
                                        {pharmacy.name}
                                    </td>
                                    <td>
                                        {pharmacy.address}
                                    </td>
                                    <td>
                                        {pharmacy.email}
                                    </td>
                                    <td>
                                        {pharmacy.phoneNumber}
                                    </td>
                                    <td>
                                        {pharmacy.deliveryFee}
                                    </td>
                                    <td>
                                        {formatDate(pharmacy.createdAt)}
                                    </td>
                                    <td>
                                        <Link
                                            href={`/pharmacies/edit/${pharmacy.id}`}
                                            className="table-action"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDeletePharmacy(pharmacy.id)}
                                            className="px-5 py-2 bg-red-500 rounded-2xl text-white hover:bg-red-600 transition"
                                            disabled={pharmacy.status === 'deleted'}
                                        >
                                            {pharmacy.status === 'deleted' ? 'Deleted' : 'Delete'}
                                        </button>
                                    </td>
                                    <td>
                                        <Link
                                            href={`/pharmacies/${pharmacy.id}`}
                                            className="table-action"
                                        >
                                            View
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

export default Pharmacies