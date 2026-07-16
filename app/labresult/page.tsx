'use client'

import React, { useEffect, useState } from 'react';
import { FaSearch, FaSpinner, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getLabresult } from '@/server/labresult';
import { LabresultModel } from '../model/labresult_model';
import Link from 'next/link';

const Labresult = () => {
  const [Labresults, setLabresult] = useState<LabresultModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchLabresult = async () => {
      try {
        const data = await getLabresult();
        setLabresult(data);
      } catch (error) {
        console.error('Error fetching Labresult:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabresult();
  }, []);



  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Lab Result</h2>

        <div className="mb-6 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search messages..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">UserId</th>
                  <th className="py-3 px-4 text-left">File Url</th>
                  <th className="py-3 px-4 text-left">Result Url</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">View</th>
                </tr>
              </thead>
              <tbody>
                {Labresults.map((labresult, index) => (
                  <tr key={labresult.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      {labresult.userId}
                    </td>
                    <td className="py-3 px-4">
                      <a href={labresult.files[0].fileUrl} target='_blank'><img src="https://thumbs.dreamstime.com/b/blue-file-folder-documents-icon-isolated-white-34337927.jpg" alt="" height={100} width={100}/></a>
                    </td>
                   <td className="py-3 px-4">
                      <a href={labresult.resultUrl} target='_blank'><img src="https://thumbs.dreamstime.com/b/blue-file-folder-documents-icon-isolated-white-34337927.jpg" alt="" height={100} width={100}/></a>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${labresult.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                          }`}
                      >
                        {labresult.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(labresult.createdAt.toDate()).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/labresult/${labresult.id}`} className='bg-primary text-white px-5 rounded py-2'>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export default Labresult;