'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaSearch, FaEye, FaSpinner } from 'react-icons/fa';
import { AnonymousModel, getAllAnonymousMessages } from '@/server/anonymous';
import Link from 'next/link';

const AnonymousList = () => {
    const [messages, setMessages] = useState<AnonymousModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    // const router = useRouter();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await getAllAnonymousMessages();
                setMessages(data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    const filteredMessages = messages.filter(message =>
        message.question.toLowerCase().includes(searchText.toLowerCase()) ||
        (message.answer && message.answer.toLowerCase().includes(searchText.toLowerCase()))
    );

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Anonymous Messages</h2>

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
                                    <th>Question</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMessages.map((message) => (
                                    <tr key={message.id}>
                                        <td>
                                            {message.question.length > 50
                                                ? `${message.question.substring(0, 50)}...`
                                                : message.question}
                                        </td>
                                        <td>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${message.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                {message.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {new Date(message.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <Link href={`/anonymous/${message.id}`} className="table-action"><FaEye className="mr-1" /> View</Link>
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

export default AnonymousList;