import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { IoSearchOutline } from 'react-icons/io5'

const CancelledOrders = () => {
    return (
        <div>
            <h4 className='text-3xl font-bold text-center mb-5 uppercase'>Cancelled Orders</h4>
            <div className="flex justify-center gap-2 md:flex-row flex-col">
                <form className="w-full">
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <IoSearchOutline />
                        </div>
                        <input type="search" id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search anything on Transactions" required />
                    </div>
                </form>
            </div>

            <div className="w-full overflow-x-auto mt-5">
                <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-4 py-3">Product name</th>
                            <th scope="col" className="px-4 py-3">Status</th>
                            <th scope="col" className="px-4 py-3">Amount</th>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3">Invoice</th>
                            <th scope="col" className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                            <th scope="row" className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                Apple MacBook Pro 17"
                            </th>
                            <td className="px-4 py-4"><span className='text-white bg-red-600 rounded-2xl px-8 pb1 py-1 text-xs'>Cancelled</span></td>
                            <td className="px-4 py-4">$2999</td>
                            <td className="px-4 py-4">Today</td>
                            <td className="px-4 py-4">121212121</td>
                            <td className="px-4 py-4"><button className='btn bg-blue text-white px-5 py-2 pb-2 rounded-2xl'>View</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>


        </div>
    )
}

export default CancelledOrders