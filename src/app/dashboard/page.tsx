// app/dashboard/page.tsx
import { createClient } from '@supabase/supabase-js'
import AcceptRejectButton from '@/app/components/AcceptRejectButton'

export default async function DashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ user?: string }> 
}) {
  // IMPORTANT: Await searchParams because Next.js 15 makes it a Promise
  const params = await searchParams
  
  // Hardcoded UUIDs for testing
  const AARAV_ID = '11111111-1111-1111-1111-111111111111'
  const VIKRAM_ID = '33333333-3333-3333-3333-333333333333'
  const PRIYA_ID = '22222222-2222-2222-2222-222222222222'

  // Determine who is logged in based on URL param (defaults to Aarav)
  const CURRENT_USER_ID = params.user === 'vikram' ? VIKRAM_ID : 
                          params.user === 'priya' ? PRIYA_ID : 
                          AARAV_ID

  // Use Admin client to bypass RLS (testing only!)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch trips hosted by the current user
  const { data: trips, error } = await supabaseAdmin
    .from('trips')
    .select(`
      id,
      title,
      status,
      max_members,
      members:trip_members (
        id,
        user_id,
        status,
        joined_at,
        profiles ( full_name, email )
      )
    `)
    .eq('host_id', CURRENT_USER_ID)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Dashboard fetch error:', error)
    return <div className="p-4 text-red-500 font-mono">Error: {error.message}</div>
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* BIG UGLY BANNER SO YOU KNOW WHO YOU ARE */}
      <div className="bg-yellow-200 text-yellow-900 p-3 mb-6 rounded-lg font-bold text-center border-2 border-yellow-400">
        🧪 TESTING MODE: You are currently acting as {
          params.user === 'vikram' ? 'VIKRAM' : 
          params.user === 'priya' ? 'PRIYA' : 
          'AARAV'
        }
        <br />
        <span className="text-sm font-normal">
          Change the URL to <code>?user=vikram</code> or <code>?user=priya</code> to switch.
        </span>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">🛠️ Host Dashboard</h1>
      
      {trips?.length === 0 && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
          You haven't created any trips yet.
        </div>
      )}

      <div className="space-y-6">
        {trips?.map((trip) => {
          const pendingMembers = trip.members?.filter((m: any) => m.status === 'pending') || []
          const activeCount = trip.members?.filter((m: any) => m.status === 'active').length || 0
          const isFull = activeCount >= trip.max_members

          return (
            <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{trip.title}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className={`font-medium ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                      {activeCount} / {trip.max_members} Joined
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 uppercase text-xs font-bold tracking-wider">{trip.status}</span>
                  </div>
                </div>
                <div className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-full">
                  {pendingMembers.length} Pending
                </div>
              </div>

              <div className="p-5">
                {pendingMembers.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No pending requests at the moment.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {pendingMembers.map((member: any) => (
                      <div key={member.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {member.profiles?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">{member.profiles?.email}</p>
                        </div>
                        <AcceptRejectButton 
                          memberId={member.id} 
                          tripId={trip.id}
                          isFull={isFull}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}