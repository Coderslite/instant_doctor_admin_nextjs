'use client'
import Image from 'next/image'
import Link from 'next/link';
import React, { useState } from 'react'
import {
    AiOutlineMenu,
    AiOutlineHome,
    AiOutlineShopping,
    AiOutlineStock
} from "react-icons/ai";
import {
    FiPackage,
    FiTruck,
    FiXCircle,
    FiCheckCircle,
    FiUser,
    FiLogOut
} from 'react-icons/fi';
import {
    MdDashboard,
    MdKeyboardArrowDown,
    MdInventory,
    MdOutlineInventory2,
    MdOutlineDisabledByDefault,
    MdLocalPharmacy,
    MdOutlineCancelScheduleSend
} from 'react-icons/md';
import {
    BsBoxSeam,
    BsClockHistory
} from 'react-icons/bs';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FaRegUser } from 'react-icons/fa';
import { FaUserDoctor } from 'react-icons/fa6';
import { GrSchedule } from 'react-icons/gr';
import { RiCalendarScheduleFill } from 'react-icons/ri';

const Sidebar = () => {
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
    const [isStockOpen, setIsStockOpen] = useState(false);
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
    const router = useRouter()
    const toggleSidebar = () => {
        if (window.innerWidth < 768) {
            setIsMobileSidebarVisible(!isMobileSidebarVisible);
        } else {
            setIsSidebarOpen(!isSidebarOpen);
        }
    };

    const handleMobileNav = () => {
        if (window.innerWidth < 768) {
            setIsMobileSidebarVisible(false);
        }
    };

    const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
        <Link href={href} onClick={handleMobileNav}>
            {children}
        </Link>
    );

    const handleLogout = () => {
        // Clear cookies
        document.cookie = 'adminId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'adminName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // Show success message
        toast.success('Logged out successfully');

        // Redirect to login page
        router.push('/login');

        // Close mobile sidebar if open
        if (window.innerWidth < 768) {
            setIsMobileSidebarVisible(false);
        }
    };

    return (
        <>
            {/* Toggle Button - always visible */}
            {!isMobileSidebarVisible && (
                <button onClick={toggleSidebar} className='md:hidden p-3 fixed top-4 left-4 z-50 bg-white rounded shadow'>
                    <AiOutlineMenu className='text-2xl text-black' />
                </button>
            )}

            {/* Backdrop for mobile */}
            {isMobileSidebarVisible && (
                <div
                    onClick={() => setIsMobileSidebarVisible(false)}
                    className="fixed inset-0 bg-black/55 z-30 md:hidden"
                />
            )}

            {/* Sidebar */}
            <div className={`
                h-screen bg-gray dark:bg-black dark:text-white text-black p-5 transition-all duration-300
                ${isSidebarOpen ? 'w-[250px]' : 'w-[70px]'}
                ${isMobileSidebarVisible ? 'left-0' : '-left-full'}
                md:static fixed top-0 z-40 overflow-y-auto
            `}>
                <div className='flex flex-col justify-between h-full'>
                    {/* Header */}
                    <div className='header'>
                        <div className='flex justify-between items-center'>
                            {isSidebarOpen && (
                                <Image src={'/logo.png'} alt='logo' height={100} width={150} />
                            )}
                            <button onClick={toggleSidebar} className="hidden md:block">
                                <AiOutlineMenu className='text-2xl text-black' />
                            </button>
                        </div>

                        <ul className='mt-9'>
                            {/* Dashboard */}
                            <li className='mb-3 border-black/10 border-b-2 pb-2'>
                                <div className=' hover:bg-primary rounded-lg '>
                                    <NavLink href="/">
                                        <div className='flex gap-2 items-center p-2'>
                                            <AiOutlineHome className="text-xl" />
                                            {isSidebarOpen && <span>Dashboard</span>}
                                        </div>
                                    </NavLink>
                                </div>
                            </li>

                            <li className='mb-3 border-black/10 border-b-2 pb-2'>
                                <div className=' hover:bg-primary rounded-lg '>
                                    <NavLink href="/pharmacies">
                                        <div className='flex gap-2 items-center p-2'>
                                            <MdLocalPharmacy className="text-xl" />
                                            {isSidebarOpen && <span>Pharmacies</span>}
                                        </div>
                                    </NavLink>
                                </div>
                            </li>

                            {/* Users */}
                            <li className=' mb-3 rounded-sm border-black/10 border-b-2 pb-2'>
                                <button
                                    type="button"
                                    onClick={() => setIsUsersOpen(!isUsersOpen)}
                                    className="flex p-2 items-center w-full text-base transition duration-75 rounded-lg group hover:bg-primary"
                                >
                                    <FaRegUser className="text-xl" />
                                    {isSidebarOpen && (
                                        <>
                                            <span className="flex-1 ms-3 text-left whitespace-nowrap">Users</span>
                                            <MdKeyboardArrowDown className={`${isUsersOpen ? 'rotate-180' : ''} transition-transform`} />
                                        </>
                                    )}
                                </button>
                                {isUsersOpen && isSidebarOpen && (
                                    <ul className="py-2 space-y-2">
                                        <li>
                                            <NavLink href="/users/patients">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10 border-b-2">
                                                    <div className='flex gap-2'>
                                                        <FaRegUser className="text-xl" />
                                                        <span>Patients</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/users/doctors">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10 border-b-2">
                                                    <div className='flex gap-2'>
                                                        <FaUserDoctor className="text-xl" />
                                                        <span>Doctors</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                        {/* <li>
                                            <NavLink href="/users/delivery-boy">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10">
                                                    <div className='flex gap-2'>
                                                        <MdOutlineDisabledByDefault className="text-xl" />
                                                        <span>Delivery Agents</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li> */}
                                    </ul>
                                )}
                            </li>

                            {/* Users */}
                            <li className=' mb-3 rounded-sm border-black/10 border-b-2 pb-2'>
                                <button
                                    type="button"
                                    onClick={() => setIsAppointmentsOpen(!isAppointmentsOpen)}
                                    className="flex p-2 items-center w-full text-base transition duration-75 rounded-lg group hover:bg-primary"
                                >
                                    <GrSchedule className="text-xl" />
                                    {isSidebarOpen && (
                                        <>
                                            <span className="flex-1 ms-3 text-left whitespace-nowrap">Appointments</span>
                                            <MdKeyboardArrowDown className={`${isAppointmentsOpen ? 'rotate-180' : ''} transition-transform`} />
                                        </>
                                    )}
                                </button>
                                {isAppointmentsOpen && isSidebarOpen && (
                                    <ul className="py-2 space-y-2">
                                        <li>
                                            <NavLink href="/appointments/pending">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10 border-b-2">
                                                    <div className='flex gap-2'>
                                                        <RiCalendarScheduleFill className="text-xl" />
                                                        <span>Pending</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/appointments/ongoing">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10 border-b-2">
                                                    <div className='flex gap-2'>
                                                        <GrSchedule className="text-xl" />
                                                        <span>Ongoing</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/appointments/cancelled">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10">
                                                    <div className='flex gap-2'>
                                                        <MdOutlineCancelScheduleSend className="text-xl"  />
                                                        <span>Cancelled</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            {/* Stocks */}
                            <li className=' mb-3 rounded-sm border-black/10 border-b-2 pb-2'>
                                <button
                                    type="button"
                                    onClick={() => setIsStockOpen(!isStockOpen)}
                                    className="flex p-2 items-center w-full text-base transition duration-75 rounded-lg group hover:bg-primary"
                                >
                                    <MdInventory className="text-xl" />
                                    {isSidebarOpen && (
                                        <>
                                            <span className="flex-1 ms-3 text-left whitespace-nowrap">Stocks</span>
                                            <MdKeyboardArrowDown className={`${isStockOpen ? 'rotate-180' : ''} transition-transform`} />
                                        </>
                                    )}
                                </button>
                                {isStockOpen && isSidebarOpen && (
                                    <ul className="py-2 space-y-2">
                                        <li>
                                            <NavLink href="/stocks/active">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10 border-b-2">
                                                    <div className='flex gap-2'>
                                                        <MdOutlineInventory2 className="text-xl" />
                                                        <span>Active Stock</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/stocks/out-of-stock">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10 border-b-2">
                                                    <div className='flex gap-2'>
                                                        <AiOutlineStock className="text-xl" />
                                                        <span>Out of Stock</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                        {/* <li>
                                            <NavLink href="/stocks/disabled">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10">
                                                    <div className='flex gap-2'>
                                                        <MdOutlineDisabledByDefault className="text-xl" />
                                                        <span>Disabled Stock</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li> */}
                                    </ul>
                                )}
                            </li>

                            {/* Orders */}
                            <li className='mb-3 rounded-sm border-black/10 border-b-2 pb-2'>
                                <button
                                    type="button"
                                    onClick={() => setIsOrderOpen(!isOrderOpen)}
                                    className="flex p-2 items-center w-full text-base transition duration-75 rounded-lg group hover:bg-primary"
                                >
                                    <AiOutlineShopping className="text-xl" />
                                    {isSidebarOpen && (
                                        <>
                                            <span className="flex-1 ms-3 text-left whitespace-nowrap">Orders</span>
                                            <MdKeyboardArrowDown className={`${isOrderOpen ? 'rotate-180' : ''} transition-transform`} />
                                        </>
                                    )}
                                </button>
                                {isOrderOpen && isSidebarOpen && (
                                    <ul className="py-2 space-y-2 rounded-sm">
                                        <li>
                                            <NavLink href="/orders/delivered">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10 border-b-2">
                                                    <div className='flex gap-2'>
                                                        <FiTruck className="text-xl" />
                                                        <span>Delivered</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/orders/pending">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10 border-b-2">
                                                    <div className='flex gap-2'>
                                                        <BsClockHistory className="text-xl" />
                                                        <span>Pending</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/orders/cancelled">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10">
                                                    <div className='flex gap-2'>
                                                        <FiXCircle className="text-xl" />
                                                        <span>Cancelled</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="footer mt-auto">
                        <div className='flex gap-1 mb-3 items-center'>
                            <FiUser className="text-xl" />
                            <a href="/profile" className='text-sm font-semibold'>Pharmacy Profile</a>
                        </div>
                        <button
                            onClick={handleLogout}
                            className='bg-red-600 rounded p-2 text-white w-full flex items-center justify-center gap-2 hover:bg-red-700 transition-colors'
                        >
                            <FiLogOut className="text-xl" />
                            {isSidebarOpen && 'Logout'}
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Sidebar;