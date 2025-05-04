import React from 'react'
import { RiImageAddFill } from 'react-icons/ri'

const NewStock = () => {
  return (
    <div>
        <h4 className='text-2xl font-bold text-center mb-5'>Add Stock</h4>
      <div>
        <h4 className='text-2xl font-bold'>Product Information</h4>
        <p className=''>Upload Product Information</p>
      </div>
      <div className='bg-gray rounded-2xl p-5 mt-5'>
        <div className='flex justify-between gap-2 mb-2'>
          <div className='w-1/2'>
            <label htmlFor="product_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Product Name</label>
            <input type="text" id="product_name" className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary" placeholder="Paracetamol" required />
          </div>
          <div className='h-[100px] w-[150px] bg-[#D9D9D9] rounded-2xl flex justify-center items-center'>
            <RiImageAddFill className='text-5xl text-center'/>
          </div>
        </div>
        <div className='mb-5'>
          <div className='w-1/2'>
            <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
            <select name="category" id="" className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary">
              <option value="">select category</option>
            </select>
          </div>
          <div></div>
        </div>
        <div className='flex justify-between gap-2 mb-5'>
          <div className='w-1/2'>
            <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Quantity before Purchase</label>
            <input type="text" id="first_name" className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary" placeholder="Paracetamol" required />
          </div>
          <div className='w-1/2'>
            <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Product Name</label>
            <input type="text" id="first_name" className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary" placeholder="Paracetamol" required />
          </div>
        </div>
      </div>

      <h4 className='text-2xl font-bold mt-5'>Pricing</h4>
      <p className=''>Enter product price</p>
      <div className='bg-gray rounded-2xl p-5 mt-1'>
        <div className='flex justify-between gap-2 mb-5'>
          <div className='w-1/2'>
            <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Purchase Price per unit</label>
            <input type="number" id="first_name" className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary" placeholder="1,000" required />
          </div>
          <div className='w-1/2'>
            <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Discount</label>
            <input type="number" id="first_name" className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary" placeholder="10%" required />
          </div>
        </div>
      </div>

      <div className='footer mt-5'>
        <div className='flex justify-end gap-2'>
          <button className='px-10 py-2 pb-2 border-blue/30 rounded-sm border-1 text-blue text-sm'>Cancel</button>
          <button className='px-10 py-2 pb-2 bg-blue rounded-sm border-1 text-white text-sm'>ADD</button>
        </div>
      </div>
    </div>
  )
}

export default NewStock