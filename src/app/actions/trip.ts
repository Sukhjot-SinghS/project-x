// src/app/actions/trip.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ============================================
// SCHEMAS
// ============================================
const CreateTripSchema = z.object({
  title: z.string().min(3),
  coverImageUrl: z.string().optional(),
  keyDestinations: z.array(z.string()).min(1),
  tripType: z.enum(['trek', 'roadtrip', 'staycation', 'event', 'other']),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  estimatedCost: z.number().positive(),
  itinerary: z.object({
    days: z.array(z.object({
      day: z.number(),
      summary: z.string(),
      weather: z.string().optional(),
      driveTime: z.string().optional(),
    })),
  }),
  budgetBreakdown: z.object({
    transport: z.number().default(0),
    stay: z.number().default(0),
    food: z.number().default(0),
    misc: z.number().default(0),
  }),
  preferredSquadSize: z.number().optional(),
  tags: z.array(z.string()).default([]),
  squadId: z.string().nullable().optional(), // Null or empty means Host Solo
})

const ApplyTripSchema = z.object({
  tripId: z.string(),
  squadId: z.string(),
})

// ============================================
// CREATE TRIP
// ============================================
export async function createTripAction(data: z.infer<typeof CreateTripSchema>) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const validated = CreateTripSchema.safeParse(data)
  if (!validated.success) return { success: false, message: validated.error.message }

  let targetSquadId = validated.data.squadId

  if (!targetSquadId || targetSquadId === 'solo' || targetSquadId === 's1') {
    // HOST SOLO: Auto-create a virtual solo squad to maintain schema integrity
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    const squadName = profile?.full_name ? `${profile.full_name}'s Solo Squad` : 'Solo Traveler'

    const { data: newSquad, error: squadError } = await supabase
      .from('squads')
      .insert({
        captain_id: user.id,
        name: squadName,
        description: 'Auto-generated solo squad',
        status: 'active',
      })
      .select()
      .single()

    if (squadError) return { success: false, message: 'Failed to create solo squad.' }

    // Add user to the new virtual squad
    await supabase.from('squad_members').insert({
      squad_id: newSquad.id,
      user_id: user.id,
      status: 'active'
    })

    targetSquadId = newSquad.id
  } else {
    // HOST WITH SQUAD: Verify the user is the captain of the squad they're hosting with
    const { data: squad, error: squadError } = await supabase
      .from('squads')
      .select('id, captain_id')
      .eq('id', targetSquadId)
      .single()

    if (squadError || !squad) return { success: false, message: 'Squad not found.' }
    if (squad.captain_id !== user.id) return { success: false, message: 'You must be the captain of this squad.' }
  }

  // Insert trip
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert({
      host_id: user.id,
      title: validated.data.title,
      cover_image_url: validated.data.coverImageUrl || null,
      key_destinations: validated.data.keyDestinations,
      trip_type: validated.data.tripType,
      description: validated.data.description || '',
      start_date: validated.data.startDate,
      end_date: validated.data.endDate,
      estimated_cost_per_person: validated.data.estimatedCost,
      itinerary: validated.data.itinerary,
      budget_breakdown: validated.data.budgetBreakdown,
      preferred_squad_size: validated.data.preferredSquadSize || 0,
      tags: validated.data.tags,
      status: 'open',
    })
    .select()
    .single()

  if (tripError) {
    if (tripError.message?.includes('valid_dates')) {
      return { success: false, message: 'End date must be after the start date.' }
    }
    return { success: false, message: 'Failed to create trip: ' + tripError.message }
  }

  // Add host as active member
  const { error: memberError } = await supabase
    .from('trip_members')
    .insert({ trip_id: trip.id, squad_id: targetSquadId, status: 'active', confirmed_at: new Date().toISOString() })

  if (memberError) return { success: false, message: 'Trip created but failed to add host.' }

  revalidatePath('/')
  revalidatePath('/dashboard')
  return { success: true, tripId: trip.id }
}

// ============================================
// APPLY TO TRIP
// ============================================
export async function applyToTripAction(tripId: string, squadId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const validated = ApplyTripSchema.safeParse({ tripId, squadId })
  if (!validated.success) return { success: false, message: validated.error.message }

  let targetSquadId = validated.data.squadId

  if (targetSquadId === 'solo' || !targetSquadId) {
    // HOST/APPLY SOLO: Auto-create a virtual solo squad
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    const squadName = profile?.full_name ? `${profile.full_name}'s Solo Squad` : 'Solo Traveler'

    const { data: newSquad, error: createError } = await supabase
      .from('squads')
      .insert({
        captain_id: user.id,
        name: squadName,
        description: 'Auto-generated solo squad',
        status: 'active',
      })
      .select()
      .single()

    if (createError) return { success: false, message: 'Failed to create solo squad.' }

    // Add user to the new virtual squad
    await supabase.from('squad_members').insert({
      squad_id: newSquad.id,
      user_id: user.id,
      status: 'active'
    })

    targetSquadId = newSquad.id
  } else {
    // Verify captain
    const { data: squad, error: squadError } = await supabase
      .from('squads')
      .select('captain_id, is_locked')
      .eq('id', targetSquadId)
      .single()

    if (squadError || !squad) return { success: false, message: 'Squad not found.' }
    if (squad.captain_id !== user.id) return { success: false, message: 'Only the captain can apply.' }
    if (squad.is_locked) return { success: false, message: 'Squad is locked.' }
  }

  // Check existing
  const { data: existing } = await supabase
    .from('trip_members')
    .select('status')
    .eq('trip_id', validated.data.tripId)
    .eq('squad_id', targetSquadId)
    .maybeSingle()

  if (existing) {
    if (['pending', 'offered'].includes(existing.status)) return { success: false, message: 'Already applied.' }
    if (existing.status === 'active') return { success: false, message: 'Already on this trip.' }
  }

  // Get trip dates for clash check
  const { data: trip } = await supabase
    .from('trips')
    .select('start_date, end_date')
    .eq('id', validated.data.tripId)
    .single()

  if (!trip) return { success: false, message: 'Trip not found.' }

  // Check busy dates for all squad members
  const { data: members } = await supabase
    .from('squad_members')
    .select('user_id')
    .eq('squad_id', targetSquadId)
    .eq('status', 'active')

  if (members && members.length > 0) {
    const userIds = members.map(m => m.user_id)
    const { data: busyUsers } = await supabase
      .from('user_busy_dates')
      .select('user_id')
      .in('user_id', userIds)
      .gte('date', trip.start_date)
      .lte('date', trip.end_date)

    if (busyUsers && busyUsers.length > 0) {
      const { data: busyProfiles } = await supabase
        .from('profiles')
        .select('full_name')
        .in('id', busyUsers.map(b => b.user_id))
      const names = busyProfiles?.map(p => p.full_name).join(', ') || 'Some members'
      return { success: false, message: `${names} ${busyUsers.length > 1 ? 'are' : 'is'} already busy on these dates.` }
    }
  }

  const { error: insertError } = await supabase
    .from('trip_members')
    .insert({ trip_id: validated.data.tripId, squad_id: targetSquadId, status: 'pending' })

  if (insertError) return { success: false, message: 'Failed to apply: ' + insertError.message }

  revalidatePath(`/trip/${tripId}`)
  revalidatePath('/dashboard')
  return { success: true, message: 'Application submitted!' }
}

// ============================================
// OFFER SQUAD (Host → offered)
// ============================================
export async function offerSquadAction(memberId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const { data: member, error: memberError } = await supabase
    .from('trip_members')
    .select('trip_id, squad_id')
    .eq('id', memberId)
    .single()

  if (memberError || !member) return { success: false, message: 'Application not found.' }

  const { data: trip } = await supabase
    .from('trips')
    .select('host_id')
    .eq('id', member.trip_id)
    .single()

  if (!trip || trip.host_id !== user.id) return { success: false, message: 'Only the host can offer spots.' }

  const { error: updateError } = await supabase
    .from('trip_members')
    .update({ status: 'offered', offered_at: new Date().toISOString() })
    .eq('id', memberId)

  if (updateError) return { success: false, message: 'Failed to offer: ' + updateError.message }

  // Notify captain
  const { data: squad } = await supabase.from('squads').select('captain_id, name').eq('id', member.squad_id).single()
  if (squad) {
    await supabase.from('notifications').insert({
      user_id: squad.captain_id,
      type: 'offer_received',
      title: 'Trip offer received!',
      body: `Your squad "${squad.name}" was offered a spot. You have 24 hours to confirm.`,
      data: { trip_id: member.trip_id, squad_id: member.squad_id, member_id: memberId },
    })
  }

  revalidatePath('/dashboard')
  return { success: true, message: 'Offer sent!' }
}

// ============================================
// CONFIRM TRIP (Captain → active)
// ============================================
export async function confirmTripAction(memberId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const { data: member, error: memberError } = await supabase
    .from('trip_members')
    .select('trip_id, squad_id, status')
    .eq('id', memberId)
    .single()

  if (memberError || !member) return { success: false, message: 'Application not found.' }
  if (member.status !== 'offered') return { success: false, message: 'Not in offered state.' }

  const { data: squad } = await supabase.from('squads').select('captain_id').eq('id', member.squad_id).single()
  if (!squad || squad.captain_id !== user.id) return { success: false, message: 'Only the captain can confirm.' }

  // This triggers: check_date_clash, populate_busy_dates, withdraw_other
  const { error: updateError } = await supabase
    .from('trip_members')
    .update({ status: 'active', confirmed_at: new Date().toISOString() })
    .eq('id', memberId)

  if (updateError) {
    if (updateError.message.includes('Date clash')) {
      return { success: false, message: 'Conflict: ' + updateError.message }
    }
    return { success: false, message: 'Failed to confirm: ' + updateError.message }
  }

  // Notify host
  const { data: trip } = await supabase.from('trips').select('host_id').eq('id', member.trip_id).single()
  if (trip) {
    await supabase.from('notifications').insert({
      user_id: trip.host_id,
      type: 'request_approved',
      title: 'Squad confirmed!',
      body: 'Your offer has been accepted. The squad is now active on the trip.',
      data: { trip_id: member.trip_id, squad_id: member.squad_id },
    })
  }

  revalidatePath('/dashboard')
  revalidatePath(`/trip/${member.trip_id}`)
  return { success: true, message: 'Trip confirmed!' }
}

// ============================================
// DECLINE OFFER
// ============================================
export async function declineOfferAction(memberId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const { data: member } = await supabase.from('trip_members').select('trip_id, squad_id').eq('id', memberId).single()
  if (!member) return { success: false, message: 'Not found.' }

  const { data: squad } = await supabase.from('squads').select('captain_id').eq('id', member.squad_id).single()
  if (!squad || squad.captain_id !== user.id) return { success: false, message: 'Only captain can decline.' }

  const { error } = await supabase.from('trip_members').update({ status: 'withdrawn' }).eq('id', memberId)
  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard')
  return { success: true, message: 'Offer declined.' }
}

// ============================================
// REJECT SQUAD
// ============================================
export async function rejectSquadAction(memberId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const { data: member } = await supabase.from('trip_members').select('trip_id').eq('id', memberId).single()
  if (!member) return { success: false, message: 'Not found.' }

  const { data: trip } = await supabase.from('trips').select('host_id').eq('id', member.trip_id).single()
  if (!trip || trip.host_id !== user.id) return { success: false, message: 'Only host can reject.' }

  const { error } = await supabase.from('trip_members').update({ status: 'rejected' }).eq('id', memberId)
  if (error) return { success: false, message: error.message }

  revalidatePath('/dashboard')
  return { success: true, message: 'Rejected.' }
}

// ============================================
// WITHDRAW APPLICATION
// ============================================
export async function withdrawApplicationAction(memberId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const { data: member } = await supabase.from('trip_members').select('squad_id').eq('id', memberId).single()
  if (!member) return { success: false, message: 'Not found.' }

  const { data: squad } = await supabase.from('squads').select('captain_id').eq('id', member.squad_id).single()
  if (!squad || squad.captain_id !== user.id) return { success: false, message: 'Only captain can withdraw.' }

  const { error } = await supabase.from('trip_members').update({ status: 'withdrawn' }).eq('id', memberId)
  if (error) return { success: false, message: error.message }

  revalidatePath('/profile')
  return { success: true, message: 'Application withdrawn.' }
}

// ============================================
// GENERATE AI ITINERARY
// ============================================
export async function generateAIItineraryAction(prompt: string, destinations: string[], dates: { start: string; end: string }) {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a travel expert for North East India. Generate a day-by-day itinerary for a trip visiting: ${destinations.join(', ')}. Dates: ${dates.start} to ${dates.end}. User request: "${prompt}". 
            Return a STRICT JSON object with:
            {
              "days": [{ "day": 1, "summary": "text", "weather": "text", "driveTime": "text" }],
              "budget_estimate": { "transport": 0, "stay": 0, "food": 0, "misc": 0 }
            }
            Do NOT include any other text.`
          }]
        }]
      })
    })
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return { success: false, message: 'AI returned no response.' }
    const parsed = JSON.parse(text)
    return { success: true, data: parsed }
  } catch (error) {
    return { success: false, message: 'Failed to generate itinerary.' }
  }
}

// ============================================
// EDIT TRIP
// ============================================
export async function editTripAction(tripId: string, updates: any) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const { data: trip } = await supabase.from('trips').select('host_id').eq('id', tripId).single()
  if (!trip || trip.host_id !== user.id) return { success: false, message: 'Only host can edit.' }

  const { error } = await supabase.from('trips').update(updates).eq('id', tripId)
  if (error) return { success: false, message: error.message }

  revalidatePath(`/trip/${tripId}`)
  revalidatePath('/dashboard')
  return { success: true, message: 'Trip updated!' }
}
