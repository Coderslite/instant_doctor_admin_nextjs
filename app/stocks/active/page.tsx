import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { IoSearchOutline } from 'react-icons/io5'

const drugs = [
  {
    id: 1,
    name: 'Paracetamol',
    detail: 'Pain relief',
    units: 332,
    image: '/drug.png'
  },
  {
    id: 2,
    name: 'Amoxicillin',
    detail: 'Antibiotic',
    units: 120,
    image: '/drug.png'
  },
  // Add more drug objects as needed
];

const ActiveStock = () => {
  return (
    <div>
      <h4 className='text-2xl font-bold text-center mb-5 uppercase'>Active Stocks</h4>
      <div className="flex md:justify-between gap-2 md:flex-row flex-col">
        <form className="md:w-1/2 w-full">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <IoSearchOutline />
            </div>
            <input type="search" id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search anything on Transactions" required />
          </div>
        </form>
        <div className='md:justify-start justify-end md:flex-col md:mr-0 mr-5  flex md:w-fit w-full'>
          <Link href="new-stock" className='btn bg-blue text-white rounded-2xl px-10 p-2'>Add Stock</Link>
        </div>
      </div>

      <div className='grid md:grid-cols-5 grid-cols-1 gap-4 mt-5'>
        {drugs.map((drug) => (
          <div key={drug.id} className='bg-gray rounded-2xl flex flex-col justify-between items-center p-2'>
            <div className='bg-white text-black p-2 rounded-2xl'>
              <h5>{drug.units} units available</h5>
            </div>
            <Image src={drug.image} height={150} width={100} alt={drug.name} />
            <p className='text-2xl font-extrabold'>{drug.name}</p>
            <p className='font-medium'>{drug.detail}</p>
          </div>
        ))}
      </div>

      <div className='mt-5 w-full flex justify-center'>
        <nav aria-label="Page navigation example w-full">
          <ul className="inline-flex -space-x-px text-base h-10">
            <li>
              <a href="#" className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Previous</a>
            </li>
            <li>
              <a href="#" className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a>
            </li>
            <li>
              <a href="#" className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">2</a>
            </li>
            <li>
              <a href="#" aria-current="page" className="flex items-center justify-center px-4 h-10 text-primary border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-primary dark:border-gray-700 dark:bg-gray-700 dark:text-white">3</a>
            </li>
            <li>
              <a href="#" className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">4</a>
            </li>
            <li>
              <a href="#" className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">5</a>
            </li>
            <li>
              <a href="#" className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Next</a>
            </li>
          </ul>
        </nav>
      </div>

    </div>
  )
}

export default ActiveStock