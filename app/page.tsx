'use client'
import Link from "next/link";
import { MdOutlineDisabledByDefault, MdOutlineInventory2 } from "react-icons/md";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { Timestamp } from "firebase/firestore";
import { getActiveOrdersCounts, getAllOrdersLimitFive, getCompletedOrdersCounts, getPendingOrders, getPendingOrdersCounts } from "@/server/order";
import { OrderModel } from "./model/order_model";
import { FiAlertCircle, FiEye, FiTruck, FiUser } from "react-icons/fi";
import { BsCheckCircle, BsClockHistory } from "react-icons/bs";
import { AiOutlineStock } from "react-icons/ai";
import { useEffect, useState } from "react";
import { getPatients } from "@/server/patients";
import { getDoctors, getPendingDoctors } from "@/server/doctors";
import { getPharmacies } from "@/server/pharmacies";
import { getOngoingAppointments, getPendingAppointments } from "@/server/appointment";
import { AppointmentModel } from "./model/appointment_model";

interface AppointmentWithNames extends AppointmentModel {
  doctorName: string;
  patientName: string;
}

const Home = () => {
  const [appointments, setAppointments] = useState<AppointmentWithNames[]>([])
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    pendingDoctors: 0,
    pharmacies: 0,
    ongoingAppointments: 0,
    pendingAppointments: 0,
    pendingOrders: 0,
    ongoingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patients, doctors, pendingDoctors, pharmacies, ongoingAppointments, pendingAppointments, pendingOrders, ongoingOrders] = await Promise.all([
          (await getPatients()).length,
          (await getDoctors()).length,
          (await getPendingDoctors()).length,
          (await getPharmacies()).length,
          (await getOngoingAppointments()).length,
          (await getPendingAppointments()).length,
          (await getPendingOrders()).length,
          (await getPendingOrders()).length,
          // (await get)

        ]);

        const pendingAppoint = await getPendingAppointments()
        setAppointments(pendingAppoint)
        // setOrders(ordersData);
        setStats({
          patients, doctors, pendingDoctors, pharmacies, ongoingAppointments, pendingAppointments, pendingOrders, ongoingOrders
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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




  if (loading) {
    return (
      <div className="mt-1 p-4">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-8 w-64 mx-auto mb-4" />

        {/* Stats Cards Loading */}
        <div className="grid lg:grid-cols-3 grid-cols-1 mt-10 md:gap-10 gap-4">
          {[...Array(5)].map((_, i) => (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-[150px] rounded-2xl" key={i} />
          ))}
        </div>

        {/* Table Loading */}
        <div className="mt-10 space-y-4">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-16 w-full" key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1">
      <h1 className="text-2xl font-bold mb-4 text-center dark:text-white uppercase">Dashboard</h1>

      <div className="grid lg:grid-cols-3 grid-cols-1 mt-10 md:gap-10 gap-4">
        {/* Active Stocks Card */}
        <StatCard
          icon={<MdOutlineInventory2 className="text-black text-2xl" />}
          title="Patients"
          value={stats.patients.toLocaleString()}
          link="/users/patients"
          bgColor="bg-blue"
        />

        {/* Pending Orders Card */}
        <StatCard
          icon={<BsClockHistory className="text-black text-2xl" />}
          title="Doctors"
          value={stats.doctors.toLocaleString()}
          link="/users/doctors"
          bgColor="bg-pink"
        />

        {/* Delivered Card */}
        <StatCard
          icon={<FiTruck className="text-black text-2xl" />}
          title="Pharmacies"
          value={stats.pharmacies.toLocaleString()}
          link="/pharmacies"
          bgColor="bg-dark-green"
        />

        {/* Active Products Card */}
        <StatCard
          icon={<MdOutlineDisabledByDefault className="text-black text-2xl" />}
          title="Ongoing Appointments"
          value={stats.ongoingAppointments.toLocaleString()}
          link="/appointments/ongoing"
          bgColor="bg-green"
        />


        {/* Disabled Products Card */}
        <StatCard
          icon={<MdOutlineDisabledByDefault className="text-black text-2xl" />}
          title="Pending Appointment"
          value={stats.pendingAppointments.toLocaleString()}
          link="/appointment/pending"
          bgColor="bg-gray-500"
        />

        {/* Out of Stock Card */}
        <StatCard
          icon={<AiOutlineStock className="text-black text-2xl" />}
          title="Pending Orders"
          value={stats.pendingOrders.toLocaleString()}
          link="/orders/pending"
          bgColor="bg-red-900"
        />
      </div>

      {/* Orders Table */}
      <div className="relative md:w-full w-[100vw] overflow-x-auto mt-10">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
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
            {appointments.length === 0 ? (
              <tr className="bg-white border-b">
                <td colSpan={7} className="px-4 py-4 text-center">
                  No pending appointments yet
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
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
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon, title, value, link, bgColor }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  link: string;
  bgColor: string;
}) => (
  <div className={`${bgColor} h-[150px] rounded-2xl text-white`}>
    <div className="flex justify-between h-full p-4">
      <div className="flex gap-2">
        <div className="bg-white p-1 w-[50px] h-[50px] rounded-4xl items-center justify-center flex">
          {icon}
        </div>
        <div>
          <p className="text-[14px]">{title}</p>
          <h4 className="font-extrabold mt-2 text-2xl">{value}</h4>
        </div>
      </div>
      <div className="flex items-end">
        <div className="flex justify-center items-center gap-2">
          <Link href={link} className="underline">View all</Link>
          <RiLogoutCircleRLine />
        </div>
      </div>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    pending: {
      color: 'bg-yellow-200 text-yellow-900',
      icon: <BsClockHistory className="mr-1" />
    },
    confirmed: {
      color: 'bg-orange-200 text-orange-900',
      icon: <BsCheckCircle className="mr-1" />
    },
    delivering: {
      color: 'bg-blue-200 text-blue-900',
      icon: <FiTruck className="mr-1" />
    },
    completed: {
      color: 'bg-green-200 text-green-900',
      icon: <BsCheckCircle className="mr-1" />
    },
    cancelled: {
      color: 'bg-red-200 text-red-900',
      icon: <MdOutlineDisabledByDefault className="mr-1" />
    },
    default: {
      color: 'bg-gray-200 text-gray-900',
      icon: null
    }
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.default;

  return (
    <span className={`${config.color} rounded-full px-3 py-1 text-xs flex items-center w-fit`}>
      {config.icon} {status}
    </span>
  );
};


export default Home;