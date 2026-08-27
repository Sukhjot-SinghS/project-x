import { createClient } from '@/lib/supabase/server'
import { FeedClient } from '@/components/Feed/FeedClient'

export const revalidate = 0; // Disable static rendering for feed

export default async function FeedPage() {
  const supabase = await createClient()

  // Fetch real trips from Supabase
  const { data: trips, error } = await supabase
    .from('trips')
    .select(`
      *,
      profiles!host_id (
        full_name,
        avatar_url,
        c_score,
        is_verified
      )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Feed fetch error:', error)
  }

  // Transform the data shape to match what FeedClient expects
  const formattedTrips = (trips || []).map((trip) => ({
    ...trip,
    id: trip.id,
    title: trip.title,
    hostId: trip.host_id,
    host: {
      name: trip.profiles?.full_name,
      avatar: trip.profiles?.avatar_url,
      cScore: trip.profiles?.c_score,
      verified: trip.profiles?.is_verified,
    },
    startDate: trip.start_date,
    endDate: trip.end_date,
    estimatedCost: trip.estimated_cost_per_person,
    keyDestinations: trip.key_destinations,
    coverImage: trip.cover_image_url,
    tags: trip.tags || [],
    squadsJoined: 0, // Mocked for now, can be aggregated later
  }))

  return <FeedClient initialTrips={formattedTrips} />
}
