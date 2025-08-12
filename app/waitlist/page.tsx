'use client'

import React, { useEffect, useState } from 'react';
import { FaSearch, FaSpinner, FaCheck } from 'react-icons/fa';
import { WaitlistModel } from '../model/waitlist_model';
import { getWaitlist, updateWaitlist } from '@/server/waitlist';
import toast from 'react-hot-toast';

const Waitlist = () => {
    const [waitlists, setWaitlist] = useState<WaitlistModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const fetchWaitlist = async () => {
            try {
                const data = await getWaitlist();
                setWaitlist(data);
            } catch (error) {
                console.error('Error fetching Waitlist:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWaitlist();
    }, []);

    const handleMarkComplete = async (id: string, userId: string) => {
        try {
            // Optimistically update the UI
            setWaitlist((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, status: 'completed' } : item
                )
            );
            // Update the status in Firestore
            await updateWaitlist(id, userId);
            // Refetch to ensure consistency with server
            const updatedData = await getWaitlist();
            setWaitlist(updatedData);
            toast.success("Waitlist updated");
        } catch (error) {
            toast.error('Error updating waitlist:');
            console.error('Error updating waitlist:', error);
            // Revert optimistic update on error
            setWaitlist((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, status: 'pending' } : item
                )
            );
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Pharmacy Waitlist</h2>

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
                                    <th className="py-3 px-4 text-left">Address</th>
                                    <th className="py-3 px-4 text-left">LatLng</th>
                                    <th className="py-3 px-4 text-left">Status</th>
                                    <th className="py-3 px-4 text-left">Date</th>
                                    <th className="py-3 px-4 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {waitlists.map((waitlist) => (
                                    <tr key={waitlist.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            {waitlist.address.length > 50
                                                ? `${waitlist.address.substring(0, 50)}...`
                                                : waitlist.address}
                                        </td>
                                        <td className="py-3 px-4">
                                            lat: <span className="text-green-600">{waitlist.location.latitude.toString()}</span>,<br />
                                            lng: <span className="text-green-600">{waitlist.location.longitude.toString()}</span>,
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${waitlist.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                    }`}
                                            >
                                                {waitlist.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {new Date(waitlist.createdAt.toDate()).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => handleMarkComplete(waitlist.id, waitlist.userId)}
                                                disabled={waitlist.status === 'completed'}
                                                className={`inline-flex items-center px-3 py-1 rounded-lg text-sm text-white ${waitlist.status === 'completed'
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-500 hover:bg-blue-600'
                                                    }`}
                                            >
                                                <FaCheck className="mr-1" /> Mark Complete
                                            </button>
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
};

export default Waitlist;