'use client'
import Image from 'next/image'
import Link from 'next/link';
import React, { useState, useEffect } from 'react'
import {
    AiOutlineMenu,
    AiOutlineHome,
    AiOutlineShopping,
    AiOutlineStock,
    AiOutlineWallet,
    AiOutlineMoneyCollect
} from "react-icons/ai";
import {
    FiPackage,
    FiTruck,
    FiXCircle,
    FiCheckCircle,
    FiUser,
    FiLogOut,
    FiChevronDown,
    FiChevronRight,
    FiDollarSign
} from 'react-icons/fi';
import {
    MdDashboard,
    MdInventory,
    MdOutlineInventory2,
    MdOutlineDisabledByDefault,
    MdLocalPharmacy,
    MdOutlineCancelScheduleSend,
    MdOutlineEmail
} from 'react-icons/md';
import {
    BsBoxSeam,
    BsClockHistory,
    BsListOl,
    BsListTask
} from 'react-icons/bs';
import { FaList, FaQuestionCircle, FaRegUser, FaUserNurse } from 'react-icons/fa';
import { GrNotification, GrSchedule } from 'react-icons/gr';
import { RiCalendarScheduleFill } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';

const AdminSidebar = () => {
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
    const [isStockOpen, setIsStockOpen] = useState(false);
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const [isWithdrawalsOpen, setIsWithdrawalsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileSidebarVisible(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        // Clear admin cookies
        document.cookie = 'adminId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'adminName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        toast.success('Logged out successfully');
        router.push('/login');

        if (window.innerWidth < 768) {
            setIsMobileSidebarVisible(false);
        }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className='md:hidden p-3 fixed top-4 left-4 z-50 bg-white rounded-lg shadow-md hover:shadow-lg transition-all'
            >
                <AiOutlineMenu className='text-xl text-gray-800' />
            </button>

            {/* Mobile Backdrop */}
            {isMobileSidebarVisible && (
                <div
                    onClick={() => setIsMobileSidebarVisible(false)}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
                />
            )}

            {/* Sidebar Container */}
            <div
                className={`
          h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          text-gray-800 dark:text-gray-200 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          ${isMobileSidebarVisible ? 'left-0' : '-left-full'}
          md:static fixed top-0 z-50 overflow-y-auto
        `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className='flex flex-col h-full'>
                    {/* Sidebar Header */}
                    <div className='p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between'>
                        {isSidebarOpen ? (
                            <div className="flex items-center">
                                <Image
                                    src={'/logo.png'}
                                    alt='logo'
                                    height={40}
                                    width={150}
                                    className="h-10 object-contain"
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center w-full">
                                <Image
                                    src={'/logo-icon.png'}
                                    alt='logo'
                                    height={40}
                                    width={40}
                                    className="h-10 w-10 object-contain"
                                />
                            </div>
                        )}

                        <button
                            onClick={toggleSidebar}
                            className="hidden md:block p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <AiOutlineMenu className='text-xl' />
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 px-3 py-4 overflow-y-auto">
                        <ul className='space-y-1'>
                            {/* Dashboard */}
                            <li>
                                <NavLink href="/">
                                    <div className={`
                    flex items-center p-3 rounded-lg 
                    ${pathname === '/' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}>
                                        <AiOutlineHome className="text-xl min-w-[24px]" />
                                        {(isSidebarOpen || isHovered) && <span className="ml-3">Dashboard</span>}
                                    </div>
                                </NavLink>
                            </li>

                            {/* Pharmacies */}
                            <li>
                                <NavLink href="/pharmacies">
                                    <div className={`
                    flex items-center p-3 rounded-lg 
                    ${pathname === '/pharmacies' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}>
                                        <MdLocalPharmacy className="text-xl min-w-[24px]" />
                                        {(isSidebarOpen || isHovered) && <span className="ml-3">Pharmacies</span>}
                                    </div>
                                </NavLink>
                            </li>

                            {/* Users Section */}
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setIsUsersOpen(!isUsersOpen)}
                                    className={`
                    flex items-center justify-between w-full p-3 rounded-lg 
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}
                                >
                                    <div className="flex items-center">
                                        <FaRegUser className="text-xl min-w-[24px]" />
                                        {(isSidebarOpen || isHovered) && <span className="ml-3">Users</span>}
                                    </div>
                                    {(isSidebarOpen || isHovered) && (
                                        isUsersOpen ? <FiChevronDown /> : <FiChevronRight />
                                    )}
                                </button>

                                {(isUsersOpen && (isSidebarOpen || isHovered)) && (
                                    <ul className="py-1 pl-4 ml-5 space-y-1 border-l border-gray-200 dark:border-gray-700">
                                        <li>
                                            <NavLink href="/users/patients">
                                                <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/users/patients' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                                                    <FaRegUser className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Patients</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/users/doctors">
                                                <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/users/doctors' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                                                    <FaUserNurse className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Doctors</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            {/* Appointments Section */}
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setIsAppointmentsOpen(!isAppointmentsOpen)}
                                    className={`
                    flex items-center justify-between w-full p-3 rounded-lg 
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}
                                >
                                    <div className="flex items-center">
                                        <GrSchedule className="text-xl min-w-[24px]" />
                                        {(isSidebarOpen || isHovered) && <span className="ml-3">Appointments</span>}
                                    </div>
                                    {(isSidebarOpen || isHovered) && (
                                        isAppointmentsOpen ? <FiChevronDown /> : <FiChevronRight />
                                    )}
                                </button>

                                {(isAppointmentsOpen && (isSidebarOpen || isHovered)) && (
                                    <ul className="py-1 pl-4 ml-5 space-y-1 border-l border-gray-200 dark:border-gray-700">
                                        <li>
                                            <NavLink href="/appointments/all">
                                                <div className={`
                                                    flex items-center p-2 rounded-lg 
                                                    ${pathname === '/appointments/all' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                                                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                                                    `}>
                                                    <RiCalendarScheduleFill className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">All</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/appointments/pending">
                                                <div className={`
                                                    flex items-center p-2 rounded-lg 
                                                    ${pathname === '/appointments/pending' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                                                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                                                    `}>
                                                    <RiCalendarScheduleFill className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Pending</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/appointments/ongoing">
                                                <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/appointments/ongoing' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                                                    <GrSchedule className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Ongoing</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/appointments/cancelled">
                                                <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/appointments/cancelled' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                                                    <MdOutlineCancelScheduleSend className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Cancelled</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            {/* Pharmacies */}
                            <li>
                                <NavLink href="/anonymous">
                                    <div className={`
                    flex items-center p-3 rounded-lg 
                    ${pathname === '/anonymous' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}>
                                        <FaQuestionCircle className="text-xl min-w-[24px]" />
                                        {(isSidebarOpen || isHovered) && <span className="ml-3">Anonymous</span>}
                                    </div>
                                </NavLink>
                            </li>

                            {/* Stocks Section */}
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setIsStockOpen(!isStockOpen)}
                                    className={`
                    flex items-center justify-between w-full p-3 rounded-lg 
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}
                                >
                                    <div className="flex items-center">
                                        <MdInventory className="text-xl min-w-[24px]" />
                                        {(isSidebarOpen || isHovered) && <span className="ml-3">Stocks</span>}
                                    </div>
                                    {(isSidebarOpen || isHovered) && (
                                        isStockOpen ? <FiChevronDown /> : <FiChevronRight />
                                    )}
                                </button>

                                {(isStockOpen && (isSidebarOpen || isHovered)) && (
                                    <ul className="py-1 pl-4 ml-5 space-y-1 border-l border-gray-200 dark:border-gray-700">
                                        <li>
                                            <NavLink href="/stocks/active">
                                                <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/stocks/active' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                                                    <MdOutlineInventory2 className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Active Stock</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/stocks/out-of-stock">
                                                <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/stocks/out-of-stock' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                                                    <AiOutlineStock className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Out of Stock</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            {/* Orders Section */}
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setIsOrderOpen(!isOrderOpen)}
                                    className={`
                    flex items-center justify-between w-full p-3 rounded-lg 
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}
                                >
                                    <div className="flex items-center">
                                        <AiOutlineShopping className="text-xl min-w-[24px]" />
                                        {(isSidebarOpen || isHovered) && <span className="ml-3">Orders</span>}
                                    </div>
                                    {(isSidebarOpen || isHovered) && (
                                        isOrderOpen ? <FiChevronDown /> : <FiChevronRight />
                                    )}
                                </button>

                                {(isOrderOpen && (isSidebarOpen || isHovered)) && (
                                    <ul className="py-1 pl-4 ml-5 space-y-1 border-l border-gray-200 dark:border-gray-700">
                                        <li>
                                            <NavLink href="/orders/delivered">
                                                <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/orders/delivered' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                                                    <FiTruck className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Delivered</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/orders/pending">
                                                <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/orders/pending' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                                                    <BsClockHistory className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Pending</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/orders/cancelled">
                                                <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/orders/cancelled' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                                                    <FiXCircle className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Cancelled</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            {/* Withdrawals Section */}
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setIsWithdrawalsOpen(!isWithdrawalsOpen)}
                                    className={`
                    flex items-center justify-between w-full p-3 rounded-lg 
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}
                                >
                                    <div className="flex items-center">
                                        <AiOutlineMoneyCollect className="text-xl min-w-[24px]" />
                                        {(isSidebarOpen || isHovered) && <span className="ml-3">Withdrawals</span>}
                                    </div>
                                    {(isSidebarOpen || isHovered) && (
                                        isWithdrawalsOpen ? <FiChevronDown /> : <FiChevronRight />
                                    )}
                                </button>

                                {(isWithdrawalsOpen && (isSidebarOpen || isHovered)) && (
                                    <ul className="py-1 pl-4 ml-5 space-y-1 border-l border-gray-200 dark:border-gray-700">
                                        <li>
                                            <NavLink href="/withdrawals/pending">
                                                <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/withdrawals/pending' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                                                    <BsClockHistory className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Pending</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/withdrawals/completed">
                                                <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/withdrawals/completed' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                                                    <FiCheckCircle className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Completed</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/withdrawals/rejected">
                                                <div className={`
                          flex items-center p-2 rounded-lg 
                          ${pathname === '/withdrawals/rejected' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        `}>
                                                    <FiXCircle className="text-lg min-w-[20px]" />
                                                    <span className="ml-2">Rejected</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            {/* waitlist */}
                            <li>
                                <NavLink href="/waitlist">
                                    <div className={`
                    flex items-center p-3 rounded-lg 
                    ${pathname === '/waitlist' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}>
                                        <BsListOl className="text-xl min-w-[24px]" />
                                        {(isSidebarOpen || isHovered) && <span className="ml-3">Waitlist</span>}
                                    </div>
                                </NavLink>
                            </li>

                            {/* notification */}
                            <li>
                                <NavLink href="/notification">
                                    <div className={`
                    flex items-center p-3 rounded-lg 
                    ${pathname === '/notification' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}>
                                        <GrNotification className="text-xl min-w-[24px]" />
                                        {(isSidebarOpen || isHovered) && <span className="ml-3">Notification</span>}
                                    </div>
                                </NavLink>
                            </li>

                            {/* newsletter */}
                            <li>
                                <NavLink href="/newsletter">
                                    <div className={`
                    flex items-center p-3 rounded-lg 
                    ${pathname === '/newsletter' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}>
                                        <MdOutlineEmail className="text-xl min-w-[24px]" />
                                        {(isSidebarOpen || isHovered) && <span className="ml-3">Newsletter</span>}
                                    </div>
                                </NavLink>
                            </li>
                        </ul>
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        <NavLink href="/profile">
                            <div className={`
                flex items-center p-2 rounded-lg 
                ${pathname === '/profile' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
              `}>
                                <FiUser className="text-lg min-w-[20px]" />
                                {(isSidebarOpen || isHovered) && <span className="ml-2">Admin Profile</span>}
                            </div>
                        </NavLink>

                        <button
                            onClick={handleLogout}
                            className={`
                flex items-center justify-center w-full p-2 rounded-lg 
                bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400
                hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors
              `}
                        >
                            <FiLogOut className="text-lg min-w-[20px]" />
                            {(isSidebarOpen || isHovered) && <span className="ml-2">Logout</span>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;