import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { growthGet } from './api';
import { EmptyState, ErrorNotice, PageHeader } from './GrowthUI';

type Booking = { id: number; full_name: string; service_type: string | null; event_date: string | null; location: string | null; source: string | null; created_at: string; status: string };

const BookingsDashboard = () => {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { growthGet<Booking[]>('bookings').then(setBookings).catch((reason: Error) => setError(reason.message)); }, []);
  return <div><PageHeader eyebrow="CRM" title="Bookings" description="Confirmed work from existing contact records. Revenue is intentionally omitted until a verified revenue field exists." />{error && <ErrorNotice message={error} />}<Card><CardContent className="p-0">{bookings?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b bg-neutral-900 text-xs uppercase tracking-wide text-neutral-400"><tr><th className="p-4">Client</th><th className="p-4">Service</th><th className="p-4">Event date</th><th className="p-4">Location</th><th className="p-4">Source</th><th className="p-4">Status</th></tr></thead><tbody className="divide-y">{bookings.map((booking) => <tr key={booking.id}><td className="p-4 font-medium">{booking.full_name}</td><td className="p-4">{booking.service_type || 'No data'}</td><td className="p-4">{booking.event_date || 'No data'}</td><td className="p-4">{booking.location || 'No data'}</td><td className="p-4">{booking.source || 'No data'}</td><td className="p-4"><Badge>{booking.status}</Badge></td></tr>)}</tbody></table></div> : bookings ? <div className="p-6"><EmptyState title="No confirmed bookings yet" text="A contact appears here when its existing CRM status becomes Booked or Completed." /></div> : <div className="p-8 text-center text-sm text-neutral-400">Loading bookings…</div>}</CardContent></Card></div>;
};

export default BookingsDashboard;
