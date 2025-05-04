import React from 'react'

const Profile = () => {
    return (
        <div>
            <h4 className='text-center font-bold text-2xl mb-5'>Profile</h4>
            <div>
                <h4 className='text-2xl font-bold'>Account Information</h4>
                <p className=''>Update your account informationn</p>
            </div>
            <div className='personal-information mt-7'>
                <div className='flex justify-between gap-2'>
                    <h5 className='font-bold text-xl'>Personal Information</h5>
                    <button className='text-primary font-bold'>save</button>
                </div>
                <div className='flex justify-between gap-2 mb-5 mt-4'>
                    <div className='w-1/2'>
                        <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First Name</label>
                        <input type="text" id="first_name" className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary" placeholder="" required />
                    </div>
                    <div className='w-1/2'>
                        <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last Name</label>
                        <input type="text" id="first_name" className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary" placeholder="" required />
                    </div>
                </div>
                <div className='flex justify-between gap-2 mb-5 mt-4'>
                    <div className='w-1/2'>
                        <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Address</label>
                        <input type="text" id="first_name" className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary" placeholder="" required />
                    </div>
                    <div className='w-1/2'>
                        <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone Number</label>
                        <input type="text" id="first_name" className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary" placeholder="" required />
                    </div>
                </div>
                <div className='flex justify-between gap-2 mb-5 mt-4'>
                    <div className='w-full'>
                        <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email Address</label>
                        <input type="text" id="first_name" className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary" placeholder="" disabled required />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile