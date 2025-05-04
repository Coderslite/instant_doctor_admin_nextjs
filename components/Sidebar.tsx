'use client'
import Image from 'next/image'
import Link from 'next/link';
import React, { useState } from 'react'
import { AiOutlineMenu, AiOutlineProduct } from "react-icons/ai";
import { CgProfile } from 'react-icons/cg';
import { MdDashboard, MdKeyboardArrowDown, MdProductionQuantityLimits } from 'react-icons/md';

const Sidebar = () => {
    const [isStockOpen, setIsStockOpen] = useState(false);
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);

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
                                            <MdDashboard />
                                            {isSidebarOpen && <span>Dashboard</span>}
                                        </div>
                                    </NavLink>
                                </div>
                            </li>

                            {/* Stocks */}
                            <li className=' mb-3 rounded-sm border-black/10 border-b-2 pb-2'>
                                <button
                                    type="button"
                                    onClick={() => setIsStockOpen(!isStockOpen)}
                                    className="flex p-2 items-center w-full text-base transition duration-75 rounded-lg group hover:bg-primary"
                                >
                                    <AiOutlineProduct />
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
                                                    <div className='flex gap-2'><MdProductionQuantityLimits className="text-black text-2xl" />
                                                        <span>Active Stock</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/stocks/out-of-stock">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10 border-b-2">
                                                    <div className='flex gap-2'><MdProductionQuantityLimits className="text-black text-2xl" />
                                                        <span>Out of Stock</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/stocks/disabled">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10">
                                                    <div className='flex gap-2'><MdProductionQuantityLimits className="text-black text-2xl" />
                                                        <span>Disabled Stock</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
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
                                    <AiOutlineProduct />
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
                                                    <div className='flex gap-2'><MdProductionQuantityLimits className="text-black text-2xl" />
                                                        <span>Delivered</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/orders/pending">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10 border-b-2">
                                                    <div className='flex gap-2'><MdProductionQuantityLimits className="text-black text-2xl" />
                                                        <span>Pending</span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink href="/orders/cancelled">
                                                <div className="block pl-11 hover:bg-primary p-1 rounded-sm border-black/10">
                                                    <div className='flex gap-2'><MdProductionQuantityLimits className="text-black text-2xl" />
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
                        <div className='flex gap-1 mb-3'>
                            <CgProfile />
                            <a href="/profile" className='text-sm font-semibold'>Pharmacy Profile</a>
                        </div>
                        <button className='bg-red-600 rounded p-2 text-white w-full'>
                            {isSidebarOpen ? 'Logout' : <span className='text-center block'>🚪</span>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
