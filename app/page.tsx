'use client'
import Link from "next/link";
import { MdOutlineDisabledByDefault, MdOutlineInventory2 } from "react-icons/md";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { Timestamp } from "firebase/firestore";
import { getActiveOrdersCounts, getAllOrdersLimitFive, getCompletedOrdersCounts, getPendingOrdersCounts } from "@/server/order";
import { OrderModel } from "./model/order_model";
import { FiTruck } from "react-icons/fi";
import { BsCheckCircle, BsClockHistory } from "react-icons/bs";
import { AiOutlineStock } from "react-icons/ai";
import { useEffect, useState } from "react";

const Home = () => {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [stats, setStats] = useState({
    activeStocks: 0,
    pendingOrders: 0,
    delivered: 0,
    disabledProducts: 0,
    outOfStock: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersData, activeStocks, pendingOrders, delivered] = await Promise.all([
          getAllOrdersLimitFive(),
          getActiveOrdersCounts(),
          getPendingOrdersCounts(),
          getCompletedOrdersCounts()
        ]);

        setOrders(ordersData);
        setStats({
          activeStocks,
          pendingOrders,
          delivered,
          disabledProducts: 0, // You'll need to implement these
          outOfStock: 0         // You'll need to implement these
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="mt-1 p-4">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-8 w-64 mx-auto mb-4" />

        {/* Stats Cards Loading */}
        <div className="grid lg:grid-cols-3 grid-cols-1 mt-10 md:gap-10 gap-4">
          {[...Array(5)].map((_, i) => (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-[150px] rounded-2xl" key={i} />
          ))}
        </div>

        {/* Table Loading */}
        <div className="mt-10 space-y-4">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-16 w-full" key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1">
      <h1 className="text-2xl font-bold mb-4 text-center dark:text-white uppercase">Dashboard</h1>

      <div className="grid lg:grid-cols-3 grid-cols-1 mt-10 md:gap-10 gap-4">
        {/* Active Stocks Card */}
        <StatCard
          icon={<MdOutlineInventory2 className="text-black text-2xl" />}
          title="Ongoing Orders"
          value={stats.activeStocks.toLocaleString()}
          link="/stocks/active"
          bgColor="bg-blue"
        />

        {/* Pending Orders Card */}
        <StatCard
          icon={<BsClockHistory className="text-black text-2xl" />}
          title="Pending Orders"
          value={stats.pendingOrders.toLocaleString()}
          link="/orders/pending"
          bgColor="bg-pink"
        />

        {/* Delivered Card */}
        <StatCard
          icon={<FiTruck className="text-black text-2xl" />}
          title="Delivered"
          value={stats.delivered.toLocaleString()}
          link="/orders/delivered"
          bgColor="bg-dark-green"
        />

        {/* Active Products Card */}
        <StatCard
          icon={<MdOutlineDisabledByDefault className="text-black text-2xl" />}
          title="Active Products"
          value={stats.disabledProducts.toLocaleString()}
          link="/products/disabled"
          bgColor="bg-green"
        />


        {/* Disabled Products Card */}
        <StatCard
          icon={<MdOutlineDisabledByDefault className="text-black text-2xl" />}
          title="Disabled Products"
          value={stats.disabledProducts.toLocaleString()}
          link="/products/disabled"
          bgColor="bg-gray-500"
        />

        {/* Out of Stock Card */}
        <StatCard
          icon={<AiOutlineStock className="text-black text-2xl" />}
          title="Out of stock"
          value={stats.outOfStock.toLocaleString()}
          link="/products/out-of-stock"
          bgColor="bg-red-900"
        />
      </div>

      {/* Orders Table */}
      <div className="relative md:w-full w-[100vw] overflow-x-auto mt-10">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Order name</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Total Price</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Order Id</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                  <td className="px-6 py-4">
                    <b>{order.items.length} items</b>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <b>NGN{order.totalAmount.toLocaleString()}</b>
                  </td>
                  <td className="px-6 py-4">
                    {order.createdAt.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {order.id.slice(0, 8) || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/orders/details/${order.id}`}
                      className="btn bg-blue text-white px-5 py-2 pb-2 rounded-2xl hover:bg-blue-600 transition"
                    >
                      view
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon, title, value, link, bgColor }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  link: string;
  bgColor: string;
}) => (
  <div className={`${bgColor} h-[150px] rounded-2xl text-white`}>
    <div className="flex justify-between h-full p-4">
      <div className="flex gap-2">
        <div className="bg-white p-1 w-[50px] h-[50px] rounded-4xl items-center justify-center flex">
          {icon}
        </div>
        <div>
          <p className="text-[14px]">{title}</p>
          <h4 className="font-extrabold mt-2 text-2xl">{value}</h4>
        </div>
      </div>
      <div className="flex items-end">
        <div className="flex justify-center items-center gap-2">
          <Link href={link} className="underline">View all</Link>
          <RiLogoutCircleRLine />
        </div>
      </div>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    pending: {
      color: 'bg-yellow-200 text-yellow-900',
      icon: <BsClockHistory className="mr-1" />
    },
    confirmed: {
      color: 'bg-orange-200 text-orange-900',
      icon: <BsCheckCircle className="mr-1" />
    },
    delivering: {
      color: 'bg-blue-200 text-blue-900',
      icon: <FiTruck className="mr-1" />
    },
    completed: {
      color: 'bg-green-200 text-green-900',
      icon: <BsCheckCircle className="mr-1" />
    },
    cancelled: {
      color: 'bg-red-200 text-red-900',
      icon: <MdOutlineDisabledByDefault className="mr-1" />
    },
    default: {
      color: 'bg-gray-200 text-gray-900',
      icon: null
    }
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.default;

  return (
    <span className={`${config.color} rounded-full px-3 py-1 text-xs flex items-center w-fit`}>
      {config.icon} {status}
    </span>
  );
};


export default Home;