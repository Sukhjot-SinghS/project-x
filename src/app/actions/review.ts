// src/app/actions/review.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const SubmitReviewSchema = z.object({
  tripId: z.string(), // Relaxed UUID for dummy data
  reviews: z.array(z.object({
    revieweeId: z.string(), // Relaxed UUID for dummy data
    rating: z.number().min(1).max(5),
    tags: z.array(z.string()).default([]),
    comment: z.string().optional(),
  })),
})

// ============================================
// SUBMIT REVIEWS
// ============================================
export async function submitReviewAction(data: z.infer<typeof SubmitReviewSchema>) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const validated = SubmitReviewSchema.safeParse(data)
  if (!validated.success) return { success: false, message: validated.error.message }

  const reviewObjects = validated.data.reviews.map((r) => ({
    trip_id: validated.data.tripId,
    reviewer_id: user.id,
    reviewee_id: r.revieweeId,
    rating: r.rating,
    tags: r.tags,
    comment: r.comment || '',
  }))

  const { error } = await supabase.from('reviews').insert(reviewObjects)
  if (error) return { success: false, message: error.message }

  revalidatePath('/profile')
  revalidatePath('/')
  return { success: true, message: 'Reviews submitted!' }
}

// ============================================
// CHECK PENDING REVIEWS
// ============================================
export async function hasPendingReviewsAction() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, hasPending: false }

  const { data, error } = await supabase.rpc('has_pending_reviews', { user_uuid: user.id })
  if (error) return { success: false, hasPending: false }

  return { success: true, hasPending: data }
}