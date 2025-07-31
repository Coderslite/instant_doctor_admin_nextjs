'use client'
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'
import { FaArrowLeft, FaClock, FaCheck, FaSpinner } from 'react-icons/fa';
import { AnonymousModel, getAnonymousMessageById, updateAnonymousMessage } from '@/server/anonymous';

const AnonymousDetail = () => {
    const { id } = useParams()
    const router = useRouter()
    const [message, setMessage] = useState<AnonymousModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answer, setAnswer] = useState('');

    useEffect(() => {
        const fetchMessage = async () => {
            if (!id) return;

            try {
                const data = await getAnonymousMessageById(id as string);
                setMessage(data);
                if (data?.answer) {
                    setAnswer(data.answer);
                }
            } catch (error) {
                console.error('Error fetching message:', error);
                alert('Failed to load message');
            } finally {
                setLoading(false);
            }
        };

        fetchMessage();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setSubmitting(true);
        try {
            await updateAnonymousMessage(id as string, answer);
            alert('Response updated successfully');
            const updatedMessage = await getAnonymousMessageById(id as string);
            setMessage(updatedMessage);
        } catch (error) {
            console.error('Error updating message:', error);
            alert('Failed to update response');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    if (!message) {
        return (
            <div className="p-4 max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4">Message not found</h2>
                    <button
                        onClick={() => router.push('/admin/anonymous')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to list
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => router.push('/anonymous')}
                        className="mr-2 text-blue-600 hover:text-blue-800"
                    >
                        <FaArrowLeft className="inline mr-1" /> Back
                    </button>
                    <h2 className="text-2xl font-bold">Anonymous Message</h2>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Question:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="whitespace-pre-line">{message.question}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Status:</h3>
                    <div className="flex items-center">
                        {message.status === 'pending' ? (
                            <>
                                <FaClock className="text-yellow-500 mr-2" />
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                    PENDING
                                </span>
                            </>
                        ) : (
                            <>
                                <FaCheck className="text-green-500 mr-2" />
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    completed
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Received:</h3>
                    <p>{new Date(message.createdAt).toLocaleString()}</p>
                </div>

                {message.updatedAt && (
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Last Updated:</h3>
                        <p>{new Date(message.updatedAt).toLocaleString()}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="answer" className="block font-semibold mb-2">
                            Your Response:
                        </label>
                        <textarea
                            id="answer"
                            rows={6}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type your response here..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || (message.status === 'completed' && answer === message.answer)}
                        className={`px-4 py-2 rounded-lg text-white ${submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center">
                                <FaSpinner className="animate-spin mr-2" />
                                Processing...
                            </span>
                        ) : message.status === 'completed' ? (
                            'Update Response'
                        ) : (
                            'Submit Response'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AnonymousDetail;