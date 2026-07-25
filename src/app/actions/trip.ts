'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function joinTripAction(tripId: string) {
  // Create an Admin client that bypasses RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  )
  
  // Hardcoding Vikram's UUID for testing
  const TEST_USER_ID = '33333333-3333-3333-3333-333333333333'

  const { error } = await supabaseAdmin
    .from('trip_members')
    .insert({
      trip_id: tripId,
      user_id: TEST_USER_ID,
      status: 'pending' 
    })

  if (error) {
    console.error('Supabase Trigger Error:', error.message)
    return { success: false, message: error.message }
  }

  revalidatePath('/') 
  return { success: true, message: 'Successfully requested to join!' }
}