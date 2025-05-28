'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  FiClock, FiCalendar, FiUser, FiPhone, FiMail, FiHome, 
  FiDollarSign, FiCheck, FiX, FiFileText, FiBriefcase, 
  FiAward, FiHeart, FiEdit2, FiCheckCircle, FiXCircle 
} from 'react-icons/fi'
import { getUserById, updateUser } from '@/server/user'
import { getAppointmentsByDoctorId } from '@/server/appointment'
import { UserModel } from '@/app/model/user_model'
import { AppointmentModel } from '@/app/model/appointment_model'
import Link from 'next/link'
import { Timestamp } from 'firebase/firestore'
import { toast } from 'react-toastify'
import Image from 'next/image'

const DoctorAppointments = () => {
    const { id } = useParams()
    const [doctor, setDoctor] = useState<UserModel | null>(null)
    const [appointments, setAppointments] = useState<(AppointmentModel & { patientName: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [showCertificate, setShowCertificate] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const doctorData = await getUserById(id as string)
                const doctorAppointments = await getAppointmentsByDoctorId(id as string)

                setDoctor(doctorData)
                setAppointments(doctorAppointments)
            } catch (error) {
                console.error('Error fetching data:', error)
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
            month: 'short',
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
        if (!doctor) return
        
        try {
            setUpdating(true)
            await updateUser(doctor.id, { accountStatus: newStatus })
            setDoctor({ ...doctor, accountStatus: newStatus })
            toast.success(`Doctor ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`)
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        } finally {
            setUpdating(false)
        }
    }

    const toggleAvailability = async () => {
        if (!doctor) return
        
        try {
            setUpdating(true)
            const newAvailability = !doctor.isAvailable
            await updateUser(doctor.id, { isAvailable: newAvailability })
            setDoctor({ ...doctor, isAvailable: newAvailability })
            toast.success(`Availability set to ${newAvailability ? 'available' : 'unavailable'}`)
        } catch (error) {
            console.error('Error updating availability:', error)
            toast.error('Failed to update availability')
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

    if (!doctor) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Doctor not found</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                <Link href="/doctors" className="mr-4 text-blue-500 hover:text-blue-700">
                    &larr; Back to Doctors
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">Doctor Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Doctor Profile Card */}
                <div className="bg-white rounded-lg shadow-md p-6 col-span-1">
                    <div className="flex flex-col items-center mb-4">
                        {doctor.photoUrl ? (
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
                                <Image 
                                    src={doctor.photoUrl} 
                                    alt={`Dr. ${doctor.firstname} ${doctor.lastname}`}
                                    width={96}
                                    height={96}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                                <FiUser className="text-blue-500 text-3xl" />
                            </div>
                        )}
                        <h2 className="text-xl font-semibold text-gray-800">
                            Dr. {doctor.firstname} {doctor.lastname}
                        </h2>
                        <p className="text-gray-500">Doctor ID: {doctor.id}</p>
                        
                        {/* Account Status Badge */}
                        <div className="mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                doctor.accountStatus === 'approved' 
                                    ? 'bg-green-100 text-green-800' 
                                    : doctor.accountStatus === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                            }`}>
                                {doctor.accountStatus || 'pending'}
                            </span>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <FiMail className="text-gray-400 mr-3" />
                            <span className="text-gray-600">{doctor.email}</span>
                        </div>
                        <div className="flex items-center">
                            <FiPhone className="text-gray-400 mr-3" />
                            <span className="text-gray-600">{doctor.phoneNumber || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center">
                            <FiHome className="text-gray-400 mr-3" />
                            <span className="text-gray-600">{doctor.address || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center">
                            <FiBriefcase className="text-gray-400 mr-3" />
                            <span className="text-gray-600">{doctor.specialization || 'Not specified'}</span>
                        </div>
                    </div>

                    {/* Availability Toggle */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Availability</span>
                            <button
                                onClick={toggleAvailability}
                                disabled={updating}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    doctor.isAvailable ? 'bg-green-500' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        doctor.isAvailable ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Approval Actions for Pending Doctors */}
                    {doctor.accountStatus === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Account Approval</h4>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleStatusUpdate('approved')}
                                    disabled={updating}
                                    className="flex items-center bg-green-500 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                                >
                                    <FiCheckCircle className="mr-1" /> Approve
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('rejected')}
                                    disabled={updating}
                                    className="flex items-center bg-red-500 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                                >
                                    <FiXCircle className="mr-1" /> Reject
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Doctor Details Card */}
                <div className="bg-white rounded-lg shadow-md p-6 col-span-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FiFileText className="mr-2 text-blue-500" />
                        Professional Details
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Certificate */}
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Medical Certificate</p>
                            {doctor.certificate ? (
                                <div>
                                    <button
                                        onClick={() => setShowCertificate(!showCertificate)}
                                        className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                                    >
                                        <FiFileText className="mr-1" /> 
                                        {showCertificate ? 'Hide Certificate' : 'View Certificate'}
                                    </button>
                                    {showCertificate && (
                                        <div className="mt-2">
                                            <Image 
                                                src={doctor.certificate} 
                                                alt="Medical Certificate"
                                                width={400}
                                                height={300}
                                                className="border rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No certificate uploaded</p>
                            )}
                        </div>

                        {/* Experience */}
                        <div>
                            <p className="text-sm text-gray-500">Years of Experience</p>
                            <p className="font-medium">{doctor.experience || 'Not specified'} years</p>
                        </div>

                        {/* Bio */}
                        <div>
                            <p className="text-sm text-gray-500">Bio</p>
                            <p className="font-medium">{doctor.bio || 'No bio provided'}</p>
                        </div>

                        {/* Work Address */}
                        <div>
                            <p className="text-sm text-gray-500">Work Address</p>
                            <p className="font-medium">{doctor.workAddress || 'Not specified'}</p>
                        </div>

                        {/* Year of Housemanship */}
                        <div>
                            <p className="text-sm text-gray-500">Year of Housemanship</p>
                            <p className="font-medium">{doctor.yearHousemanship || 'Not specified'}</p>
                        </div>

                        {/* Consultation Fee */}
                        <div>
                            <p className="text-sm text-gray-500">Consultation Fee</p>
                            <p className="font-medium">{formatCurrency(doctor.amount || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Medical Details Card */}
                <div className="bg-white rounded-lg shadow-md p-6 col-span-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FiHeart className="mr-2 text-blue-500" />
                        Medical Information
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {/* Blood Group */}
                        <div>
                            <p className="text-sm text-gray-500">Blood Group</p>
                            <p className="font-medium">{doctor.bloodGroup || 'Not specified'}</p>
                        </div>

                        {/* Genotype */}
                        <div>
                            <p className="text-sm text-gray-500">Genotype</p>
                            <p className="font-medium">{doctor.genotype || 'Not specified'}</p>
                        </div>

                        {/* Height */}
                        <div>
                            <p className="text-sm text-gray-500">Height</p>
                            <p className="font-medium">{doctor.height || 'Not specified'}</p>
                        </div>

                        {/* Weight */}
                        <div>
                            <p className="text-sm text-gray-500">Weight</p>
                            <p className="font-medium">{doctor.weight || 'Not specified'}</p>
                        </div>

                        {/* Gender */}
                        <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium">{doctor.gender || 'Not specified'}</p>
                        </div>

                        {/* Marital Status */}
                        <div>
                            <p className="text-sm text-gray-500">Marital Status</p>
                            <p className="font-medium">{doctor.maritalStatus || 'Not specified'}</p>
                        </div>

                        {/* Date of Birth */}
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="font-medium">
                                {doctor.dob ? formatDate(doctor.dob) : 'Not specified'}
                            </p>
                        </div>

                        {/* Surgical History */}
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Surgical History</p>
                            <p className="font-medium">{doctor.surgicalHistory || 'None reported'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointments Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
                    <div className="flex space-x-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Upcoming
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                        </span>
                    </div>
                </div>

                {appointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FiCalendar className="mx-auto text-3xl mb-2" />
                        <p>No appointments found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            Appointment with {appointment.patientName}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(appointment.startTime)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            appointment.isPaid
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {appointment.isPaid ? 'Paid' : 'Pending Payment'}
                                        </span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {formatTimeRange(appointment.startTime, appointment.endTime)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <FiDollarSign className="text-gray-400 mr-1" />
                                        <span className="font-medium">{formatCurrency(appointment.price)}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 max-w-[50%] truncate">
                                        {appointment.complain || 'No complaint noted'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DoctorAppointments