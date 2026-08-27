// src/app/actions/dashboard.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// GET PENDING REQUESTS
// ============================================
export async function getPendingRequestsAction() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, data: [], message: 'Unauthorized' }

  const { data: trips } = await supabase
    .from('trips')
    .select('id')
    .eq('host_id', user.id)
    .in('status', ['open', 'in_progress'])

  if (!trips || trips.length === 0) return { success: true, data: [] }

  const tripIds = trips.map(t => t.id)

  const { data: pending, error } = await supabase
    .from('trip_members')
    .select(`
      id,
      trip_id,
      squad_id,
      status,
      roster_snapshot,
      created_at,
      squads (
        name,
        captain_id,
        profiles!squads_captain_id_fkey (
          full_name,
          avatar_url,
          c_score
        )
      )
    `)
    .in('trip_id', tripIds)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) return { success: false, data: [], message: error.message }

  return { success: true, data: pending }
}

// ============================================
// REFRESH GHOST ROSTER
// ============================================
export async function refreshRosterSnapshotAction(memberId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const { data: member } = await supabase.from('trip_members').select('trip_id, squad_id').eq('id', memberId).single()
  if (!member) return { success: false, message: 'Member not found.' }

  const { data: trip } = await supabase.from('trips').select('host_id').eq('id', member.trip_id).single()
  if (!trip || trip.host_id !== user.id) return { success: false, message: 'Only host can refresh.' }

  const { data: roster } = await supabase
    .from('squad_members')
    .select(`
      user_id,
      profiles!squad_members_user_id_fkey (
        full_name,
        avatar_url,
        reliability,
        flexibility,
        fun,
        safety,
        contribution,
        c_score
      )
    `)
    .eq('squad_id', member.squad_id)
    .eq('status', 'active')

  const snapshot = roster?.map((sm: any) => ({
    user_id: sm.user_id,
    full_name: sm.profiles?.full_name || 'Unknown',
    avatar_url: sm.profiles?.avatar_url || null,
    genome: {
      reliability: sm.profiles?.reliability || 0.5,
      flexibility: sm.profiles?.flexibility || 0.5,
      fun: sm.profiles?.fun || 0.5,
      safety: sm.profiles?.safety || 0.5,
      contribution: sm.profiles?.contribution || 0.5,
    },
    c_score: sm.profiles?.c_score || 0,
  })) || []

  const { error: updateError } = await supabase
    .from('trip_members')
    .update({ roster_snapshot: snapshot })
    .eq('id', memberId)

  if (updateError) return { success: false, message: 'Failed to update snapshot.' }

  revalidatePath('/dashboard')
  return { success: true, message: 'Roster snapshot refreshed.' }
}