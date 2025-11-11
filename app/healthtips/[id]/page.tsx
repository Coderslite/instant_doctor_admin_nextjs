'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getHealthtipById, updateHealthtip } from '@/server/healthtips'
import { getHealthCategory } from '@/server/healthtips'
import { HealthtipsModel, HealthCategoryModel } from '@/app/model/healthtips_model'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

const EditHealthtip = () => {
  const router = useRouter()
  const { id } = useParams()
  const [tip, setTip] = useState<HealthtipsModel | null>(null)
  const [categories, setCategories] = useState<HealthCategoryModel[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tipData, cats] = await Promise.all([
          getHealthtipById(id as string),
          getHealthCategory(),
        ])
        setTip(tipData)
        setCategories(cats)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load health tip')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTip((prev) => (prev ? { ...prev, [name]: value } : prev))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tip) return
    setSaving(true)
    try {
      await updateHealthtip(tip.id, tip)
      toast.success('Health tip updated successfully!')
      router.push('/healthtips')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update health tip')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!tip) {
    return <p className="text-center text-gray-600 mt-6">Health tip not found</p>
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">Edit Health Tip</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={tip.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
          <select
            name="categoryId"
            value={tip.categoryId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Type</label>
          <input
            type="text"
            name="type"
            value={tip.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Content</label>
          <textarea
            name="content"
            rows={6}
            value={tip.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
          ></textarea>
        </div>

        {/* Image */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="text"
              name="image"
              value={tip.image}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
            />
          </div>
          {tip.image && (
            <Image
              src={tip.image}
              alt={tip.title}
              width={120}
              height={80}
              className="rounded-md object-cover shadow-sm"
            />
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={() => router.push('/healthtips')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
          >
            {saving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditHealthtip
