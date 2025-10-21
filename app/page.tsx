'use client'
import Link from "next/link";
import { MdOutlineDisabledByDefault, MdOutlineInventory2 } from "react-icons/md";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { FiDollarSign, FiCreditCard, FiAlertCircle, FiEye, FiTruck, FiUser } from "react-icons/fi";
import { AiOutlineWallet, AiOutlineStock } from "react-icons/ai";
import { Timestamp } from "firebase/firestore";
import { getPendingOrders } from "@/server/order";
import { BsCheckCircle, BsClockHistory } from "react-icons/bs";
import { useEffect, useState } from "react";
import { getPatients } from "@/server/patients";
import { getDoctors, getPendingDoctors } from "@/server/doctors";
import { getPharmacies } from "@/server/pharmacies";
import { getOngoingAppointments, getPendingAppointments } from "@/server/appointment";
import { AppointmentModel } from "./model/appointment_model";
import {
  getTotalDoctorBalances,
  getTotalDoctorEarnings,
  getTotalPharmacyBalances,
  getTotalPharmacyEarnings
} from "@/server/admin";
import { fetchWithCache } from "@/server/data-fetching";
import { getPendingAnonymousMessages } from "@/server/anonymous";

interface AppointmentWithNames extends AppointmentModel {
  doctorName: string;
  patientName: string;
}

interface DashboardStats {
  patients: number;
  doctors: number;
  anonymous: number;
  pharmacies: number;
  ongoingAppointments: number;
  pendingAppointments: number;
  pendingOrders: number;
  ongoingOrders: number;
  totalPharmacyEarnings: number;
  totalPharmacyBalance: number;
  totalDoctorEarnings: number;
  totalDoctorBalance: number;
}

const Home = () => {
  const [appointments, setAppointments] = useState<AppointmentWithNames[]>([]);
  const [stats, setStats] = useState<Partial<DashboardStats>>({});
  const [loading, setLoading] = useState({
    critical: true,
    secondary: true,
    appointments: true
  });

  useEffect(() => {
    const fetchCriticalData = async () => {
      try {
        const [
          patients,
          doctors,
          totalPharmacyEarnings,
          totalPharmacyBalance,
          totalDoctorEarnings,
          totalDoctorBalance
        ] = await Promise.all([
          fetchWithCache('patients', () => getPatients().then(res => res.length)),
          fetchWithCache('doctors', () => getDoctors().then(res => res.length)),
          fetchWithCache('pharmacyEarnings', getTotalPharmacyEarnings),
          fetchWithCache('pharmacyBalances', getTotalPharmacyBalances),
          fetchWithCache('doctorEarnings', getTotalDoctorEarnings),
          fetchWithCache('doctorBalances', getTotalDoctorBalances)
        ]);

        setStats({
          patients,
          doctors,
          totalPharmacyEarnings,
          totalPharmacyBalance,
          totalDoctorEarnings,
          totalDoctorBalance
        });
      } catch (error) {
        console.error("Error fetching critical data:", error);
      } finally {
        setLoading(prev => ({ ...prev, critical: false }));
      }
    };

    const fetchSecondaryData = async () => {
      try {
        const [
          anonymous,
          pharmacies,
          ongoingAppointments,
          pendingAppointments,
          pendingOrders,
        ] = await Promise.all([
          fetchWithCache('anonymous', () => getPendingAnonymousMessages().then(res => res.length)),
          fetchWithCache('pharmacies', () => getPharmacies().then(res => res.length)),
          fetchWithCache('ongoingAppointments', () => getOngoingAppointments().then(res => res.length)),
          fetchWithCache('pendingAppointments', () => getPendingAppointments().then(res => res.length)),
          fetchWithCache('pendingOrders', () => getPendingOrders().then(res => res.length)),
        ]);

        setStats(prev => ({
          ...prev,
          anonymous,
          pharmacies,
          ongoingAppointments,
          pendingAppointments,
          pendingOrders,
          ongoingOrders: pendingOrders // Same as original implementation
        }));
      } catch (error) {
        console.error("Error fetching secondary data:", error);
      } finally {
        setLoading(prev => ({ ...prev, secondary: false }));


      }
    };

    const fetchAppointments = async () => {
      try {
        const data = await fetchWithCache('pendingAppointmentsData', getPendingAppointments);
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(prev => ({ ...prev, appointments: false }));
      }
    };

    fetchCriticalData();
    fetchSecondaryData();
    fetchAppointments();
  }, []);

  // Formatting functions remain the same
  const formatDate = (timestamp: Timestamp) => { /* ... */ };
  const formatTimeRange = (startTime: Timestamp, endTime: Timestamp) => { /* ... */ };

  const isLoading = loading.critical || loading.secondary || loading.appointments;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Admin Dashboard</h1>

      {/* Financial Summary Cards - Loads first */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {loading.critical ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-40 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={<FiDollarSign className="text-black text-2xl" />}
              title="Pharmacy Earnings"
              value={`₦${stats.totalPharmacyEarnings?.toLocaleString() ?? '0'}`}
              description="All-time revenue from pharmacies"
              bgColor="bg-gradient-to-r from-blue-600 to-blue-500"
              textColor="text-white"
            />
            <StatCard
              icon={<AiOutlineWallet className="text-black text-2xl" />}
              title="Pharmacy Balances"
              value={`₦${stats.totalPharmacyBalance?.toLocaleString() ?? '0'}`}
              description="Total pharmacy balances"
              bgColor="bg-gradient-to-r from-green-600 to-green-500"
              textColor="text-white"
            />
            <StatCard
              icon={<FiDollarSign className="text-black text-2xl" />}
              title="Doctor Earnings"
              value={`₦${stats.totalDoctorEarnings?.toLocaleString() ?? '0'}`}
              description="All-time revenue from doctors"
              bgColor="bg-gradient-to-r from-purple-600 to-purple-500"
              textColor="text-white"
            />
            <StatCard
              icon={<AiOutlineWallet className="text-black text-2xl" />}
              title="Doctor Balances"
              value={`₦${stats.totalDoctorBalance?.toLocaleString() ?? '0'}`}
              description="Total doctor balances"
              bgColor="bg-gradient-to-r from-amber-600 to-amber-500"
              textColor="text-white"
            />
          </>
        )}
      </div>

      {/* User Stats Cards - Loads next */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {loading.secondary ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-40 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={<FiUser className="text-black text-2xl" />}
              title="Patients"
              value={stats.patients?.toLocaleString() ?? '0'}
              description="Registered patients"
              bgColor="bg-gradient-to-r from-emerald-600 to-emerald-500"
              textColor="text-white"
              link="/users/patients"
            />
            <StatCard
              icon={<FiUser className="text-black text-2xl" />}
              title="Doctors"
              value={stats.doctors?.toLocaleString() ?? '0'}
              description="Verified doctors"
              bgColor="bg-gradient-to-r from-pink-600 to-pink-500"
              textColor="text-white"
              link="/users/doctors"
            />
            <StatCard
              icon={<FiUser className="text-black text-2xl" />}
              title="Anonymous"
              value={stats.anonymous?.toLocaleString() ?? '0'}
              description="Awaiting verification"
              bgColor="bg-gradient-to-r from-orange-600 to-orange-500"
              textColor="text-white"
              link="/anonymous"
            />
            <StatCard
              icon={<MdOutlineInventory2 className="text-black text-2xl" />}
              title="Pharmacies"
              value={stats.pharmacies?.toLocaleString() ?? '0'}
              description="Registered pharmacies"
              bgColor="bg-gradient-to-r from-indigo-600 to-indigo-500"
              textColor="text-white"
              link="/pharmacies"
            />
          </>
        )}
      </div>

      {/* Activity Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {loading.secondary ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-40 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={<BsClockHistory className="text-black text-2xl" />}
              title="Ongoing Appointments"
              value={stats.ongoingAppointments?.toLocaleString() ?? '0'}
              description="Active consultations"
              bgColor="bg-gradient-to-r from-teal-600 to-teal-500"
              textColor="text-white"
              link="/appointments/ongoing"
            />
            <StatCard
              icon={<BsClockHistory className="text-black text-2xl" />}
              title="Pending Appointments"
              value={stats.pendingAppointments?.toLocaleString() ?? '0'}
              description="Awaiting confirmation"
              bgColor="bg-gradient-to-r from-yellow-600 to-yellow-500"
              textColor="text-white"
              link="/appointments/pending"
            />
            <StatCard
              icon={<FiTruck className="text-black text-2xl" />}
              title="Pending Orders"
              value={stats.pendingOrders?.toLocaleString() ?? '0'}
              description="Awaiting processing"
              bgColor="bg-gradient-to-r from-red-600 to-red-500"
              textColor="text-white"
              link="/orders/pending"
            />
            <StatCard
              icon={<FiTruck className="text-black text-2xl" />}
              title="Ongoing Orders"
              value={stats.ongoingOrders?.toLocaleString() ?? '0'}
              description="In delivery process"
              bgColor="bg-gradient-to-r from-gray-600 to-gray-500"
              textColor="text-white"
              link="/orders/ongoing"
            />
          </>
        )}
      </div>

      {/* Recent Appointments Section - Loads last */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <BsClockHistory className="mr-2 text-blue-600" />
            Recent Appointments
          </h2>
        </div>
        {loading.appointments ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-16 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table headers remain the same */}
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        {/* Table cells remain the same */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {appointments.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 text-right">
                <Link
                  href="/appointments"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View all appointments →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// StatCard component remains the same
const StatCard = ({
  icon,
  title,
  value,
  description,
  link,
  bgColor,
  textColor = "text-gray-900",
  iconBg = "bg-white bg-opacity-20"
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description?: string;
  link?: string;
  bgColor: string;
  textColor?: string;
  iconBg?: string;
}) => (
  <div className={`${bgColor} ${textColor} rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]`}>
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${iconBg} p-3 rounded-lg mr-4`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium opacity-90">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && <p className="text-xs opacity-80 mt-1">{description}</p>}
          </div>
        </div>
      </div>
      {link && (
        <div className="mt-4 pt-3 border-t border-opacity-20 flex justify-end">
          <Link
            href={link}
            className="text-xs font-medium flex items-center hover:underline"
          >
            View details <RiLogoutCircleRLine className="ml-1" />
          </Link>
        </div>
      )}
    </div>
  </div>
);

export default Home;