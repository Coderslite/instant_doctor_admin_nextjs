import Link from "next/link";
import { MdOutlineDoNotDisturbOff, MdProductionQuantityLimits } from "react-icons/md";
import { RiLogoutCircleRLine } from "react-icons/ri";

// app/page.tsx (or your home page)
const Home = () => {
  return (
    <div className="mt-1">
      <h1 className="text-2xl font-bold mb-4 text-center dark:text-white uppercase">Dashboard</h1>
      <div className="grid lg:grid-cols-3 grid-cols-1 mt-10 md:gap-10 gap-4">
        <div className="bg-blue h-[150px] rounded-2xl text-white">
          <div className="flex justify-between h-full p-4">
            <div className="flex gap-2">
              <div className="bg-white p-1 w-[50px] h-[50px] rounded-4xl items-center justify-center flex">
                <MdProductionQuantityLimits className="text-black text-2xl" />
              </div>
              <div>
                <p className="text-[14px]">Active Stocks</p>
                <h4 className="font-extrabold mt-2 text-2xl">2,000</h4>
              </div>
            </div>
            <div className="flex items-end">
              <div className="flex justify-center items-center gap-2">
                <Link href='' className="underline">View all</Link>
                <RiLogoutCircleRLine />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-pink h-[150px] rounded-2xl text-white">
          <div className="flex justify-between h-full p-4">
            <div className="flex gap-2">
              <div className="bg-white p-1 w-[50px] h-[50px] rounded-4xl items-center justify-center flex">
                <MdProductionQuantityLimits className="text-black text-2xl" />
              </div>
              <div>
                <p className="text-[14px]">Pending Orders</p>
                <h4 className="font-extrabold mt-2 text-2xl">2,000</h4>
              </div>
            </div>
            <div className="flex items-end">
              <div className="flex justify-center items-center gap-2">
                <Link href='' className="underline">View all</Link>
                <RiLogoutCircleRLine />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-dark-green h-[150px] rounded-2xl text-white">
          <div className="flex justify-between h-full p-4">
            <div className="flex gap-2">
              <div className="bg-white p-1 w-[50px] h-[50px] rounded-4xl items-center justify-center flex">
                <MdProductionQuantityLimits className="text-black text-2xl" />
              </div>
              <div>
                <p className="text-[14px]">Delivered</p>
                <h4 className="font-extrabold mt-2 text-2xl">2,000</h4>
              </div>
            </div>
            <div className="flex items-end">
              <div className="flex justify-center items-center gap-2">
                <Link href='' className="underline">View all</Link>
                <RiLogoutCircleRLine />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-green h-[150px] rounded-2xl text-white">
          <div className="flex justify-between h-full p-4">
            <div className="flex gap-2">
              <div className="bg-white p-1 w-[50px] h-[50px] rounded-4xl items-center justify-center flex">
                <MdOutlineDoNotDisturbOff className="text-black text-2xl" />
              </div>
              <div>
                <p className="text-[14px]">Disabled Products</p>
                <h4 className="font-extrabold mt-2 text-2xl">2,000</h4>
              </div>
            </div>
            <div className="flex items-end">
              <div className="flex justify-center items-center gap-2">
                <Link href='' className="underline">View all</Link>
                <RiLogoutCircleRLine />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-red-900 h-[150px] rounded-2xl text-white">
          <div className="flex justify-between h-full p-4">
            <div className="flex gap-2">
              <div className="bg-white p-1 w-[50px] h-[50px] rounded-4xl items-center justify-center flex">
                <MdOutlineDoNotDisturbOff className="text-black text-2xl" />
              </div>
              <div>
                <p className="text-[14px]">Out of stock</p>
                <h4 className="font-extrabold mt-2 text-2xl">2,000</h4>
              </div>
            </div>
            <div className="flex items-end">
              <div className="flex justify-center items-center gap-2">
                <Link href='' className="underline">View all</Link>
                <RiLogoutCircleRLine />
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="relative md:w-full w-[100vw] overflow-x-auto mt-10">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Product name
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Product Price
              </th>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
              <th scope="col" className="px-6 py-3">
                Order Id
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
              <td className="px-6 py-4">
                <b>Paracetamol</b>
              </td>
              <td className="px-6 py-4">
                Pending
              </td>
              <td className="px-6 py-4">
                <b>NGN2,000</b>
              </td>
              <td className="px-6 py-4">
                25th-April-2025
              </td>
              <td className="px-6 py-4">
                3434343434
              </td>
              <td className="px-6 py-4">
                <Link href="/stocks/active" className="btn bg-blue text-white px-5 py-2 pb-2 rounded-2xl">view</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Home;
