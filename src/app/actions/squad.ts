// src/app/actions/squad.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateSquadSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().optional(),
})

const InviteSquadSchema = z.object({
  squadId: z.string(), // Temporarily relaxed UUID check
  inviteeUserId: z.string(), // Temporarily relaxed UUID check
})

// ============================================
// CREATE SQUAD
// ============================================
export async function createSquadAction(data: z.infer<typeof CreateSquadSchema>) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const validated = CreateSquadSchema.safeParse(data)
  if (!validated.success) return { success: false, message: validated.error.message }

  const { data: squad, error: squadError } = await supabase
    .from('squads')
    .insert({
      captain_id: user.id,
      name: validated.data.name,
      description: validated.data.description || '',
      status: 'active',
    })
    .select()
    .single()

  if (squadError) return { success: false, message: squadError.message }

  await supabase.from('squad_members').insert({
    squad_id: squad.id,
    user_id: user.id,
    status: 'active',
  })

  revalidatePath('/squads')
  return { success: true, squadId: squad.id }
}

// ============================================
// INVITE TO SQUAD
// ============================================
export async function inviteToSquadAction(squadId: string, inviteeUserId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const validated = InviteSquadSchema.safeParse({ squadId, inviteeUserId })
  if (!validated.success) return { success: false, message: validated.error.message }

  const { data: squad } = await supabase.from('squads').select('captain_id, name').eq('id', validated.data.squadId).single()
  if (!squad || squad.captain_id !== user.id) return { success: false, message: 'Only captain can invite.' }

  const { data: existing } = await supabase
    .from('squad_members')
    .select('status')
    .eq('squad_id', validated.data.squadId)
    .eq('user_id', validated.data.inviteeUserId)
    .maybeSingle()

  if (existing) {
    if (existing.status === 'active') return { success: false, message: 'Already a member.' }
    if (existing.status === 'pending') return { success: false, message: 'Already invited.' }
  }

  await supabase.from('squad_members').insert({
    squad_id: validated.data.squadId,
    user_id: validated.data.inviteeUserId,
    status: 'pending',
  })

  await supabase.from('notifications').insert({
    user_id: validated.data.inviteeUserId,
    type: 'join_request',
    title: 'Squad invitation!',
    body: `You've been invited to join "${squad.name}".`,
    data: { squad_id: validated.data.squadId, inviter_id: user.id },
  })

  revalidatePath(`/squad/${squadId}`)
  return { success: true, message: 'Invitation sent!' }
}

// ============================================
// APPROVE JOIN REQUEST
// ============================================
export async function approveJoinRequestAction(memberId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const { data: member } = await supabase.from('squad_members').select('squad_id, user_id').eq('id', memberId).single()
  if (!member) return { success: false, message: 'Member not found.' }

  const { data: squad } = await supabase.from('squads').select('captain_id, name').eq('id', member.squad_id).single()
  if (!squad || squad.captain_id !== user.id) return { success: false, message: 'Only captain can approve.' }

  await supabase.from('squad_members').update({ status: 'active', joined_at: new Date().toISOString() }).eq('id', memberId)

  await supabase.from('notifications').insert({
    user_id: member.user_id,
    type: 'request_approved',
    title: 'Joined squad!',
    body: `You've been added to "${squad.name}".`,
    data: { squad_id: member.squad_id },
  })

  revalidatePath(`/squad/${member.squad_id}`)
  return { success: true, message: 'Approved!' }
}

// ============================================
// REJECT JOIN REQUEST
// ============================================
export async function rejectJoinRequestAction(memberId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const { data: member } = await supabase.from('squad_members').select('squad_id').eq('id', memberId).single()
  if (!member) return { success: false, message: 'Member not found.' }

  const { data: squad } = await supabase.from('squads').select('captain_id').eq('id', member.squad_id).single()
  if (!squad || squad.captain_id !== user.id) return { success: false, message: 'Only captain can reject.' }

  await supabase.from('squad_members').delete().eq('id', memberId)

  revalidatePath(`/squad/${member.squad_id}`)
  return { success: true, message: 'Rejected.' }
}

// ============================================
// LEAVE SQUAD
// ============================================
export async function leaveSquadAction(squadId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const { data: squad } = await supabase.from('squads').select('captain_id').eq('id', squadId).single()
  if (!squad) return { success: false, message: 'Squad not found.' }
  if (squad.captain_id === user.id) return { success: false, message: 'Captain cannot leave. Transfer captaincy first.' }

  await supabase.from('squad_members').delete().eq('squad_id', squadId).eq('user_id', user.id)

  revalidatePath('/squads')
  return { success: true, message: 'Left squad.' }
}

// ============================================
// TRANSFER CAPTAINCY
// ============================================
export async function transferCaptaincyAction(squadId: string, newCaptainId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const { data: squad } = await supabase.from('squads').select('captain_id, name').eq('id', squadId).single()
  if (!squad || squad.captain_id !== user.id) return { success: false, message: 'Only captain can transfer.' }

  const { data: member } = await supabase
    .from('squad_members')
    .select('id')
    .eq('squad_id', squadId)
    .eq('user_id', newCaptainId)
    .eq('status', 'active')
    .single()

  if (!member) return { success: false, message: 'User is not an active member.' }

  await supabase.from('squads').update({ captain_id: newCaptainId }).eq('id', squadId)

  await supabase.from('notifications').insert({
    user_id: newCaptainId,
    type: 'trip_edited',
    title: 'You are now the captain!',
    body: `${user.email} has transferred captaincy of "${squad.name}" to you.`,
    data: { squad_id: squadId },
  })

  revalidatePath(`/squad/${squadId}`)
  return { success: true, message: 'Captaincy transferred!' }
}

// ============================================
// DISBAND SQUAD
// ============================================
export async function disbandSquadAction(squadId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, message: 'Unauthorized' }

  const { data: squad } = await supabase.from('squads').select('captain_id').eq('id', squadId).single()
  if (!squad || squad.captain_id !== user.id) return { success: false, message: 'Only captain can disband.' }

  await supabase.from('squads').update({ status: 'disbanded' }).eq('id', squadId)

  revalidatePath('/squads')
  return { success: true, message: 'Squad disbanded.' }
}
