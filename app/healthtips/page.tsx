'use client'

import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import Link from 'next/link'
import Image from 'next/image'
import { getHealtips, getHealthCategory } from '@/server/healthtips'
import { db } from '@/firebase/clientApp'
import { deleteDoc, doc } from 'firebase/firestore'
import { HealthtipsModel, HealthCategoryModel } from '@/app/model/healthtips_model'
import { formatDate } from '@/utils/formatTime'

const HealthTips = () => {
  const [tips, setTips] = useState<HealthtipsModel[]>([])
  const [categories, setCategories] = useState<HealthCategoryModel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const tipsPerPage = 8

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [fetchedTips, fetchedCategories] = await Promise.all([
          getHealtips(),
          getHealthCategory(),
        ])
        setTips(fetchedTips)
        setCategories(fetchedCategories)
      } catch (error) {
        console.error('Error fetching health tips:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Helper to get category name by ID
  const getCategoryName = (id: string) => {
    const category = categories.find((c) => c.id === id)
    return category ? category.name : 'Uncategorized'
  }

  // 🔹 Delete function
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this health tip?')) return
    try {
      await deleteDoc(doc(db, 'HealthTips', id))
      setTips((prev) => prev.filter((tip) => tip.id !== id))
      alert('✅ Health tip deleted successfully!')
    } catch (error) {
      console.error('Error deleting health tip:', error)
      alert('❌ Failed to delete health tip. Please try again.')
    }
  }

  // Filter and paginate
  const filteredTips = tips.filter((tip) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      tip.title.toLowerCase().includes(searchLower) ||
      getCategoryName(tip.categoryId).toLowerCase().includes(searchLower) ||
      formatDate(tip.createdAt).toLowerCase().includes(searchLower)
    )
  })

  const totalTips = filteredTips.length
  const totalPages = Math.ceil(totalTips / tipsPerPage)
  const indexOfLastTip = currentPage * tipsPerPage
  const indexOfFirstTip = indexOfLastTip - tipsPerPage
  const currentTips = filteredTips.slice(indexOfFirstTip, indexOfLastTip)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h4 className="text-3xl font-bold mb-4 md:mb-0 uppercase text-gray-800">
          Health Tips
        </h4>
        <Link
          href="/healthtips/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-md font-semibold flex items-center gap-2 transition duration-200"
        >
          ➕ Create New Health Tip
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center gap-2 md:flex-row flex-col mb-6">
        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
            <IoSearchOutline />
          </div>
          <input
            type="search"
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by title, category, or date"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List Count */}
      <div className="mb-4 text-gray-600 text-sm">
        Showing {indexOfFirstTip + 1} to {Math.min(indexOfLastTip, totalTips)} of {totalTips} health tips
      </div>

      {/* Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Type</th>
              <th>Date</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTips.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  {searchTerm ? 'No matching health tips found' : 'No health tips yet'}
                </td>
              </tr>
            ) : (
              currentTips.map((tip, index) => (
                <tr key={tip.id}>
                  <td className="font-medium text-gray-900">
                    {(currentPage - 1) * tipsPerPage + index + 1}
                  </td>
                  <td>
                    {tip.image ? (
                      <Image
                        src={tip.image}
                        alt={tip.title}
                        width={60}
                        height={40}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 italic">No Image</span>
                    )}
                  </td>
                  <td>{tip.title}</td>
                  <td>{getCategoryName(tip.categoryId)}</td>
                  <td className="capitalize">{tip.type}</td>
                  <td>{formatDate(tip.createdAt)}</td>
                  <td className="text-center flex justify-center gap-2">
                    <Link
                      href={`/healthtips/${tip.id}`}
                      className="table-action"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(tip.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`px-3 py-2 border border-gray-300 text-sm font-medium ${
                  currentPage === number
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}

export default HealthTips
