'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function NewManagerOrderPage() {
  const [formData, setFormData] = useState({
    title: '',
    raw_text: '',
    client_user_id: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.client_user_id.trim()) {
      setError('Client ID is required')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await api.post('/api/manager/orders', {
        title: formData.title,
        raw_text: formData.raw_text || undefined,
        client_user_id: formData.client_user_id,
      })

      if (error) {
        setError(error)
        return
      }

      router.push('/manager')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <a href="/manager" className="text-blue-600 hover:underline">
            &larr; Back to My Orders
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Order</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="client_user_id" className="block text-sm font-medium text-gray-700 mb-1">
                Client User ID
              </label>
              <input
                id="client_user_id"
                name="client_user_id"
                type="text"
                value={formData.client_user_id}
                onChange={handleChange}
                required
                placeholder="Enter client user ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter order title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="raw_text" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="raw_text"
                name="raw_text"
                value={formData.raw_text}
                onChange={handleChange}
                rows={6}
                placeholder="Enter order description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
