// app/create-trip/page.tsx
'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTripAction } from '@/app/actions/trip'

export default function CreateTripPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // We hardcode Aarav for testing
  const HOST_ID = '11111111-1111-1111-1111-111111111111'

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setError(null)
      
      const rawWaypoints = formData.get('waypoints') as string
      const waypoints = rawWaypoints.split('\n').filter(Boolean).map((line, index) => {
        const parts = line.split('|').map(s => s.trim())
        return {
          day_number: parseInt(parts[0]) || 1,
          place_name: parts[1] || 'Stop ' + (index + 1),
          description: parts[2] || '',
          stay_night: parts[3]?.toLowerCase() === 'stay'
        }
      })

      const tripData = {
        host_id: HOST_ID,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        primary_destination: formData.get('destination') as string,
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        max_members: parseInt(formData.get('max_members') as string) || 4,
        estimated_cost_per_person: parseInt(formData.get('cost') as string) || 1000,
        waypoints
      }

      const result = await createTripAction(tripData)
      
      if (result.success) {
        router.push('/')
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🧪 TEST: Create a Trip (Ugly Scaffold)</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 border border-red-300">
          ❌ {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Trip Title</label>
          <input name="title" required className="w-full border rounded-lg p-2" placeholder="Weekend Trek to..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" className="w-full border rounded-lg p-2" rows={2} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Primary Destination</label>
          <input name="destination" required className="w-full border rounded-lg p-2" placeholder="Shillong" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input name="start_date" type="date" required className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input name="end_date" type="date" required className="w-full border rounded-lg p-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Members</label>
            <input name="max_members" type="number" defaultValue={4} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cost per Person (₹)</label>
            <input name="cost" type="number" defaultValue={1500} className="w-full border rounded-lg p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Waypoints (One per line: Day | Place | Description | stay)
          </label>
          <textarea 
            name="waypoints" 
            rows={5} 
            className="w-full border rounded-lg p-2 font-mono text-sm"
            placeholder="1 | Guwahati | Pickup point | no&#10;1 | Shillong | Cafe hopping | stay&#10;2 | Mawlynnong | Village tour | no"
            defaultValue="1 | Guwahati | Pickup at 6 AM | no&#10;1 | Shillong | Explore cafes & Umiam | stay&#10;2 | Mawlynnong | Cleanest village | no&#10;2 | Guwahati | Return by 6 PM | no"
          />
          <p className="text-xs text-gray-400 mt-1">Use 'stay' in the last column to mark overnight stops.</p>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 w-full"
        >
          {isPending ? 'Creating...' : '🚀 Create Trip (Test)'}
        </button>
      </form>
    </main>
  )
}