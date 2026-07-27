'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function acceptMemberAction(memberId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Updating to active is what triggers our Date Clash / Capacity checks
  const { error } = await supabaseAdmin
    .from('trip_members')
    .update({ status: 'active' })
    .eq('id', memberId)

  if (error) {
    console.error('Accept error:', error.message)
    return { success: false, message: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true, message: 'Member accepted!' }
}

export async function rejectMemberAction(memberId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Deleting the row completely clears the request
  const { error } = await supabaseAdmin
    .from('trip_members')
    .delete()
    .eq('id', memberId)

  if (error) {
    console.error('Reject error:', error.message)
    return { success: false, message: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true, message: 'Member rejected.' }
}