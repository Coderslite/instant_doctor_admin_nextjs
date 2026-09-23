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
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>UserId</th>
                  <th>File Url</th>
                  <th>Result Url</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {Labresults.map((labresult, index) => (
                  <tr key={labresult.id}>
                    <td>
                      {index + 1}
                    </td>
                    <td>
                      {labresult.userId}
                    </td>
                    <td>
                      {labresult.files?.[0]?.fileUrl ? (
                        <a href={labresult.files[0].fileUrl} target='_blank'><img src="https://thumbs.dreamstime.com/b/blue-file-folder-documents-icon-isolated-white-34337927.jpg" alt="" height={100} width={100}/></a>
                      ) : (
                        <span className="text-gray-400">No file</span>
                      )}
                    </td>
                   <td>
                      <a href={labresult.resultUrl} target='_blank'><img src="https://thumbs.dreamstime.com/b/blue-file-folder-documents-icon-isolated-white-34337927.jpg" alt="" height={100} width={100}/></a>
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${labresult.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                          }`}
                      >
                        {labresult.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {new Date(labresult.createdAt.toDate()).toLocaleDateString()}
                    </td>
                    <td>
                      <Link href={`/labresult/${labresult.id}`} className="table-action">View</Link>
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