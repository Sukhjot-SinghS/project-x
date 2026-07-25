// app/page.tsx
import { createClient } from '@/lib/supabase/server'
import JoinButton from '@/app/components/joinbutton'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch open trips with host profiles and member counts
  const { data: trips, error } = await supabase
    .from('trips')
    .select(`
      *,
      host:profiles!host_id ( full_name, avatar_url, is_verified ),
      members:trip_members ( status )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching trips:', error)
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Failed to load trips. Please try again later.
        </div>
      </div>
    )
  }

  // Calculate available spots
  const tripsWithSpots = trips?.map((trip) => {
    const activeMembers = trip.members?.filter(
      (m: any) => m.status === 'active'
    ).length || 0
    const spotsLeft = trip.max_members - activeMembers
    return { ...trip, spotsLeft, activeMembers }
  })

  return (
    <main className="max-w-2xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🌍 Find Your Crew</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
          + Create Trip
        </button>
      </div>

      <div className="space-y-4">
        {(!tripsWithSpots || tripsWithSpots.length === 0) && (
          <div className="text-center text-gray-500 py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-lg font-medium">No open trips yet</p>
            <p className="text-sm mt-1">Be the first to create an adventure!</p>
          </div>
        )}

        {tripsWithSpots?.map((trip) => (
          <div 
            key={trip.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {trip.title}
                  </h2>
                  {trip.host?.is_verified && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  📍 {trip.primary_destination || 'Destination TBD'}
                </p>
              </div>
              
              <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ml-4 ${
                trip.spotsLeft > 2 ? 'bg-green-100 text-green-700' : 
                trip.spotsLeft > 0 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'
              }`}>
                {trip.spotsLeft} spots left
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span>👤</span>
                <span>{trip.host?.full_name || 'Unknown Host'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📅</span>
                <span>
                  {new Date(trip.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} 
                  {' - '}
                  {new Date(trip.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center border-t border-gray-50 pt-4">
              <div>
                <span className="font-semibold text-indigo-600 text-lg">
                  ₹{trip.estimated_cost_per_person}
                </span>
                <span className="text-xs text-gray-400 ml-1">/ person</span>
              </div>
              {/* Join Button */}
              <div>
                <JoinButton tripId={trip.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}