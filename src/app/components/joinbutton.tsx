'use client'

import { useTransition, useState } from 'react'
import { joinTripAction } from '@/app/actions/trip'

export default function JoinButton({ tripId }: { tripId: string }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null)

  const handleJoin = () => {
    startTransition(async () => {
      setFeedback(null)
      const result = await joinTripAction(tripId)
      setFeedback(result)
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button 
        onClick={handleJoin} 
        disabled={isPending}
        className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm disabled:bg-gray-400"
      >
        {isPending ? 'Processing...' : 'Request to Join'}
      </button>
      
      {/* Display the error or success message from the DB triggers */}
      {feedback && (
        <span className={`text-xs font-semibold ${feedback.success ? 'text-green-600' : 'text-red-600'}`}>
          {feedback.message}
        </span>
      )}
    </div>
  )
}