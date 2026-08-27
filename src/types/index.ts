export interface Genome {
  reliability: number;
  flexibility: number;
  fun: number;
  safety: number;
  contribution: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  verified: boolean;
  cScore: number;
  isHost: boolean;
  bio?: string;
  interests?: string;
  memberSince?: string;
  genome: Genome;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  cScore: number;
  verified?: boolean;
}

export interface DayPlan {
  day: number;
  summary: string;
  weather: string;
  driveTime: string;
}

export interface Itinerary {
  days: DayPlan[];
}

export interface BudgetBreakdown {
  transport: number;
  stay: number;
  food: number;
  misc: number;
}

export type TripType = 'trek' | 'roadtrip' | 'staycation' | 'adventure' | 'nature' | 'other';
export type TripStatus = 'open' | 'closed' | 'completed';

export interface Trip {
  id: string;
  hostId: string;
  title: string;
  coverImage: string;
  keyDestinations: string[];
  startDate: string;
  endDate: string;
  estimatedCost: number;
  description: string;
  about?: string;
  itinerary: Itinerary;
  budgetBreakdown: BudgetBreakdown;
  tags: string[];
  status: TripStatus;
  squadsJoined: number;
  joinedSquadMembers?: string[];
  rating?: number;
}

export interface TripFormData {
  title: string;
  coverImage: string;
  keyDestinations: string[];
  tripType: TripType;
  description: string;
  startDate: string;
  endDate: string;
  about: string;
  itinerary: Itinerary;
  budget: number;
  tags: string[];
}

export interface Squad {
  id: string;
  name: string;
  captainId: string;
  members: string[];
  isLocked: boolean;
  status: 'active' | 'pending';
  pendingRequests: InviteRequest[];
  description?: string;
}

export interface InviteRequest {
  userId: string;
  requestedAt: string;
  squadId?: string;
  squadName?: string;
  captain?: string;
  members?: Member[];
  tripId?: string;
  tripTitle?: string;
}

export type NotificationType =
  | 'offer_received'
  | 'request_approved'
  | 'request_rejected'
  | 'trip_edited'
  | 'review_prompt';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: { tripId?: string; squadId?: string };
  isRead: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  name: string;
  message: string;
  timestamp: string;
  isMe?: boolean;
}

export interface Application {
  id: string;
  tripId: string;
  tripTitle: string;
  status: 'pending' | 'offered' | 'active' | 'withdrawn';
  appliedAt: string;
}

export interface CompletedTrip {
  tripId: string;
  title: string;
  startDate: string;
  endDate: string;
  rating: number;
}
