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
import { canAccess, getRoleFromCookie } from "@/utils/roles";
import { useRole } from "@/utils/useRole";

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
  const role = useRole();
  // Only link cards to pages this role can open
  const linkFor = (href: string) => (canAccess(role, href) ? href : undefined);
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
        // Financial totals are admin-only, so don't fetch them for other roles
        const includeFinancials = getRoleFromCookie() === 'admin';
        const skip = () => Promise.resolve(undefined);

        // allSettled so one failing query doesn't blank every card
        const results = await Promise.allSettled([
          fetchWithCache('patients', () => getPatients().then(res => res.length)),
          fetchWithCache('doctors', () => getDoctors().then(res => res.length)),
          includeFinancials ? fetchWithCache('pharmacyEarnings', getTotalPharmacyEarnings) : skip(),
          includeFinancials ? fetchWithCache('pharmacyBalances', getTotalPharmacyBalances) : skip(),
          includeFinancials ? fetchWithCache('doctorEarnings', getTotalDoctorEarnings) : skip(),
          includeFinancials ? fetchWithCache('doctorBalances', getTotalDoctorBalances) : skip()
        ]);
        const keys = [
          'patients',
          'doctors',
          'totalPharmacyEarnings',
          'totalPharmacyBalance',
          'totalDoctorEarnings',
          'totalDoctorBalance'
        ] as const;

        const values: Partial<DashboardStats> = {};
        results.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            values[keys[i]] = result.value;
          } else {
            console.error(`Error fetching ${keys[i]}:`, result.reason);
          }
        });

        // Merge with prev: secondary data may have already arrived
        setStats((prev: Partial<DashboardStats>) => ({ ...prev, ...values }));
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

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === now.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatTimeRange = (startTime: Timestamp, endTime: Timestamp) => {
    const time = (t: Timestamp) => t.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${time(startTime)} – ${time(endTime)}`;
  };

  const isLoading = loading.critical || loading.secondary || loading.appointments;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Admin Dashboard</h1>

      {/* Financial Summary Cards - Loads first (admin only) */}
      {role === 'admin' && (
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
      )}

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
              link={linkFor("/users/patients")}
            />
            <StatCard
              icon={<FiUser className="text-black text-2xl" />}
              title="Doctors"
              value={stats.doctors?.toLocaleString() ?? '0'}
              description="Verified doctors"
              bgColor="bg-gradient-to-r from-pink-600 to-pink-500"
              textColor="text-white"
              link={linkFor("/users/doctors")}
            />
            <StatCard
              icon={<FiUser className="text-black text-2xl" />}
              title="Anonymous"
              value={stats.anonymous?.toLocaleString() ?? '0'}
              description="Awaiting verification"
              bgColor="bg-gradient-to-r from-orange-600 to-orange-500"
              textColor="text-white"
              link={linkFor("/anonymous")}
            />
            <StatCard
              icon={<MdOutlineInventory2 className="text-black text-2xl" />}
              title="Pharmacies"
              value={stats.pharmacies?.toLocaleString() ?? '0'}
              description="Registered pharmacies"
              bgColor="bg-gradient-to-r from-indigo-600 to-indigo-500"
              textColor="text-white"
              link={linkFor("/pharmacies")}
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
              link={linkFor("/appointments/ongoing")}
            />
            <StatCard
              icon={<BsClockHistory className="text-black text-2xl" />}
              title="Pending Appointments"
              value={stats.pendingAppointments?.toLocaleString() ?? '0'}
              description="Awaiting confirmation"
              bgColor="bg-gradient-to-r from-yellow-600 to-yellow-500"
              textColor="text-white"
              link={linkFor("/appointments/pending")}
            />
            <StatCard
              icon={<FiTruck className="text-black text-2xl" />}
              title="Pending Orders"
              value={stats.pendingOrders?.toLocaleString() ?? '0'}
              description="Awaiting processing"
              bgColor="bg-gradient-to-r from-red-600 to-red-500"
              textColor="text-white"
              link={linkFor("/orders/pending")}
            />
            <StatCard
              icon={<FiTruck className="text-black text-2xl" />}
              title="Ongoing Orders"
              value={stats.ongoingOrders?.toLocaleString() ?? '0'}
              description="In delivery process"
              bgColor="bg-gradient-to-r from-gray-600 to-gray-500"
              textColor="text-white"
              link={linkFor("/orders/ongoing")}
            />
          </>
        )}
      </div>

      {/* Pending Appointments - admin only, since it shows patients' complaints */}
      {role === 'admin' && (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <BsClockHistory className="mr-2 text-blue-600" />
            Pending Appointments
          </h2>
          {appointments.length > 0 && (
            <span className="text-sm text-gray-500">{appointments.length} awaiting confirmation</span>
          )}
        </div>
        {loading.appointments ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-16 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Patient</th>
                    <th scope="col">Doctor</th>
                    <th scope="col">Status</th>
                    <th scope="col">Complaint</th>
                    <th scope="col">Time</th>
                    <th scope="col">Date</th>
                    <th scope="col" className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No pending appointments</td>
                    </tr>
                  ) : (
                    // Latest few only; the full list is one click away
                    appointments.slice(0, 6).map((appointment) => (
                      <tr key={appointment.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <FiUser className="text-gray-400 shrink-0" />
                            {appointment.patientName}
                          </div>
                        </td>
                        <td>{appointment.doctorName || <span className="text-gray-400">Unassigned</span>}</td>
                        <td>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            <FiAlertCircle /> Pending
                          </span>
                        </td>
                        <td className="max-w-xs truncate">{appointment.complain || <span className="text-gray-400">No complaint noted</span>}</td>
                        <td className="whitespace-nowrap">{formatTimeRange(appointment.startTime, appointment.endTime)}</td>
                        <td className="whitespace-nowrap">{formatDate(appointment.startTime)}</td>
                        <td className="text-right">
                          <Link href={`/appointments/details/${appointment.id}`} className="table-action">
                            <FiEye /> View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {appointments.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 text-right">
                <Link
                  href="/appointments/pending"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View all pending appointments →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      )}
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