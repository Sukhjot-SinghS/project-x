'use client'

import { useTransition, useState } from 'react'
import { acceptMemberAction, rejectMemberAction } from '@/app/actions/dashboard'

export default function AcceptRejectButton({ 
  memberId, 
  tripId,
  isFull
}: { 
  memberId: string, 
  tripId: string,
  isFull: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null)

  const handleAction = (action: 'accept' | 'reject') => {
    startTransition(async () => {
      setFeedback(null)
      const result = action === 'accept' 
        ? await acceptMemberAction(memberId)
        : await rejectMemberAction(memberId)
      
      setFeedback(result)
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => handleAction('accept')}
          disabled={isPending || isFull}
          className="px-4 py-2 rounded-lg text-sm font-bold bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isPending ? 'Processing...' : '✅ Accept'}
        </button>
        
        <button
          onClick={() => handleAction('reject')}
          disabled={isPending}
          className="px-4 py-2 rounded-lg text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition"
        >
          {isPending ? '...' : '❌ Reject'}
        </button>
      </div>

      {/* Surface Database Constraint Errors Here */}
      {feedback && !feedback.success && (
        <span className="text-xs font-semibold text-red-600 max-w-[250px] text-right">
          {feedback.message}
        </span>
      )}
    </div>
  )
}