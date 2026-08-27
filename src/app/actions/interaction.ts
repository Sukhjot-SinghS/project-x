// src/app/actions/interaction.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const SendMessageSchema = z.object({
  squadId: z.string(), // Relaxed UUID for dummy data
  message: z.string().min(1),
  imageUrl: z.string().optional(),
})

// ============================================
// SEND SQUAD MESSAGE
// ============================================
export async function sendSquadMessageAction(data: z.infer<typeof SendMessageSchema>) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const validated = SendMessageSchema.safeParse(data)
  if (!validated.success) return { success: false, message: validated.error.message }

  const { data: member } = await supabase
    .from('squad_members')
    .select('id')
    .eq('squad_id', validated.data.squadId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!member) return { success: false, message: 'You are not a member of this squad.' }

  const { error } = await supabase.from('squad_chat').insert({
    squad_id: validated.data.squadId,
    user_id: user.id,
    message: validated.data.message,
    image_url: validated.data.imageUrl || null,
  })

  if (error) return { success: false, message: error.message }

  revalidatePath(`/squad/${validated.data.squadId}`)
  return { success: true, message: 'Message sent!' }
}

// ============================================
// SEND TRIP MESSAGE
// ============================================
export async function sendTripMessageAction(tripId: string, message: string, imageUrl?: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  // Check if user is active on this trip
  const { data: userSquads } = await supabase
    .from('squad_members')
    .select('squad_id')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const squadIds = userSquads?.map(s => s.squad_id) || []

  const { data: tripMember } = await supabase
    .from('trip_members')
    .select('id')
    .eq('trip_id', tripId)
    .in('squad_id', squadIds)
    .eq('status', 'active')
    .single()

  if (!tripMember) return { success: false, message: 'You are not an active member of this trip.' }

  const { error } = await supabase.from('trip_chat').insert({
    trip_id: tripId,
    user_id: user.id,
    message: message,
    image_url: imageUrl || null,
  })

  if (error) return { success: false, message: error.message }

  revalidatePath(`/trip/${tripId}`)
  return { success: true, message: 'Message sent!' }
}