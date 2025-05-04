// app/orders/details/[id]/page.tsx

import React from 'react'

const OrderDetails = ({ params }: { params: { id: string } }) => {
    return (
        <div>
            <h4 className='text-3xl font-bold text-center mb-5 uppercase'>Order Details</h4>
            <div className='grid md:grid-cols-4 grid-cols-2 mt-10 mb-3'>
                <div className='h-[70px] w-[70px] rounded-full bg-gray-500'>
                </div>
                <div>
                    <p>Username</p>
                    <h2 className='text-2xl font-bold'>Johnson Lee</h2>
                </div>
                <div>
                    <p>Username</p>
                    <h2 className='text-2xl font-bold'>Johnson Lee</h2>
                </div>
                <div>
                    <p>Username</p>
                    <h2 className='text-2xl font-bold'>Johnson Lee</h2>
                </div>
            </div>

            {/* table and buttons below */}
            <div className="w-full overflow-x-auto mt-10">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">Product name</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Invoice</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                            <th className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                Apple MacBook Pro 17"
                            </th>
                            <td className="px-4 py-4">Cancelled</td>
                            <td className="px-4 py-4">$2999</td>
                            <td className="px-4 py-4">Today</td>
                            <td className="px-4 py-4">121212121</td>
                            <td className="px-4 py-4">
                                <button className='btn bg-blue text-white px-5 py-2 pb-2 rounded-2xl'>View</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className='flex justify-end mt-4'>
                <h5 className='mr-2'>Total :</h5>
                <h5 className='text-3xl font-extrabold'>#2,000.00</h5>
            </div>

            <div className='mx-auto mt-20'>
                <p className='text-center'>You have Accepted this order, click on the icon below to confirm delivery</p>
                <div className='flex justify-center mt-4'>
                    <button className='btn bg-green-600 text-white rounded-2xl px-3 pb-2 py-2'>Completed</button>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails
