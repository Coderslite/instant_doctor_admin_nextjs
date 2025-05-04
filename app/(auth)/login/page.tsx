import Image from 'next/image'
import React from 'react'

const Login = () => {
    return (
        <div className='flex md:flex-row flex-col justify-between h-screen'>
            <div className='md:w-1/2 md:p-20 p-6 flex flex-col justify-center'>
                <Image alt='logo' src={'/logo.png'} width={200} height={50} />
                <div className='mt-16 mb-4'>
                    <h4 className='font-bold text-3xl'>Welcome back</h4>
                    <p>Welcome back! Please enter your details</p>
                </div>

                <div className='mt-4'>
                    <form action="">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Email
                            </label>
                            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Email Address" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                               Password
                            </label>
                            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Password" />
                        </div>
                        <div className='mb-4'>
                            <button className="bg-primary text-white px-5 py-2 rounded hover:bg-[#87acec] capitalize w-full">Sign In</button>
                        </div>
                    </form>
                </div>

            </div>
            <div className=" hidden md:block relative w-1/2 flex items-center justify-center bg-[url('/login_bg.png')] bg-cover bg-center bg-no-repeat bg-black/60 bg-blend-overlay">
            </div>
        </div>
    )
}

export default Login
