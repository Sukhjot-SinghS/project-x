'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'


export async function createTripAction(data: {
  host_id: string
  title: string
  description: string
  primary_destination: string
  start_date: string
  end_date: string
  max_members: number
  estimated_cost_per_person: number
  waypoints: { day_number: number, place_name: string, description: string, stay_night: boolean }[]
}) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Insert the trip
  const { data: trip, error: tripError } = await supabaseAdmin
    .from('trips')
    .insert({
      host_id: data.host_id,
      title: data.title,
      description: data.description,
      primary_destination: data.primary_destination,
      start_date: data.start_date,
      end_date: data.end_date,
      max_members: data.max_members,
      estimated_cost_per_person: data.estimated_cost_per_person,
      status: 'open'
    })
    .select()
    .single()

  if (tripError) {
    console.error('Trip insert error:', tripError.message)
    return { success: false, message: tripError.message }
  }

  // 2. Insert waypoints
  if (data.waypoints.length > 0) {
    const waypointsToInsert = data.waypoints.map((wp, index) => ({
      trip_id: trip.id,
      day_number: wp.day_number,
      stop_order: index + 1,
      place_name: wp.place_name,
      description: wp.description,
      stay_night: wp.stay_night
    }))

    const { error: wpError } = await supabaseAdmin
      .from('trip_waypoints')
      .insert(waypointsToInsert)

    if (wpError) {
      console.error('Waypoint insert error:', wpError.message)
      // We don't roll back the trip here for simplicity, but you could.
      return { success: false, message: 'Trip created but waypoints failed: ' + wpError.message }
    }
  }

  revalidatePath('/')
  return { success: true, message: 'Trip created successfully!' }
}

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