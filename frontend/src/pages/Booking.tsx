import React, { useState } from 'react';
import { useAppState } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, AlertTriangle, CheckCircle2, User, Plus } from 'lucide-react';

const localizer = momentLocalizer(moment);

const bookingSchema = z.object({
  assetId: z.string().min(1, { message: 'Asset is required' }),
  bookedBy: z.string().min(3, { message: 'Requester name is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  startTime: z.string().min(1, { message: 'Start time is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  endTime: z.string().min(1, { message: 'End time is required' }),
});

type BookingFormSchema = z.infer<typeof bookingSchema>;

export const Booking: React.FC = () => {
  const { bookings, assets, createBooking } = useAppState();
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form setup
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<BookingFormSchema>({
    resolver: zodResolver(bookingSchema)
  });

  // Available assets to book
  const bookableAssets = assets.filter(a => a.status === 'Available' || a.status === 'Reserved');

  // Watch fields to check for conflicts reactively
  const watchedAssetId = watch('assetId');
  const watchedStartDate = watch('startDate');
  const watchedStartTime = watch('startTime');
  const watchedEndDate = watch('endDate');
  const watchedEndTime = watch('endTime');

  const onSubmit = (data: BookingFormSchema) => {
    const startStr = `${data.startDate}T${data.startTime}:00`;
    const endStr = `${data.endDate}T${data.endTime}:00`;
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (start >= end) {
      setConflictError('Start time must be before end time.');
      return;
    }

    // Check overlap conflict with existing bookings
    const conflict = bookings.find(b => {
      if (b.assetId !== data.assetId || b.status === 'Cancelled') return false;
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return start < bEnd && end > bStart;
    });

    if (conflict) {
      setConflictError(`Time conflict: Asset is already booked by ${conflict.bookedBy} during this period.`);
      return;
    }

    setConflictError(null);
    createBooking({
      assetId: data.assetId,
      assetName: assets.find(a => a.id === data.assetId)?.name || 'Unknown Asset',
      bookedBy: data.bookedBy,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });

    setSuccessMessage('Booking successfully confirmed!');
    reset();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Convert bookings for React Big Calendar format
  const calendarEvents = bookings.map(b => ({
    id: b.id,
    title: `${b.assetName} - ${b.bookedBy}`,
    start: new Date(b.startDate),
    end: new Date(b.endDate)
  }));

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Asset Bookings"
        description="Reserve devices, facilities, and equipment for projects and temporary allocations."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Calendar - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Reservations Calendar" className="h-[600px] flex flex-col">
            <div className="flex-1 h-full min-h-[400px]">
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={['month', 'week', 'day']}
              />
            </div>
          </Card>
        </div>

        {/* Booking Form and Overlapping Warnings - Right Column */}
        <div className="space-y-6">
          {/* Conflict warnings */}
          {conflictError && (
            <div className="bg-[#dc3545]/10 border border-[#dc3545]/20 text-[#dc3545] p-4 rounded-btn flex items-start gap-3 select-none">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[14px]">Conflict Detected</h4>
                <p className="text-xs mt-1 font-medium leading-relaxed">{conflictError}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-[#198754]/10 border border-[#198754]/20 text-[#198754] p-4 rounded-btn flex items-start gap-3 select-none">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[14px]">Success</h4>
                <p className="text-xs mt-1 font-medium leading-relaxed">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Reservation Card Form */}
          <Card title="Book an Asset">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[14px] font-semibold text-[#495057]">Select Asset</label>
                <select
                  {...register('assetId')}
                  className="h-[44px] px-3.5 bg-white border border-[#ced4da] rounded-input text-[#212529] focus:outline-none focus:border-[#6c757d]"
                >
                  <option value="">-- Choose Asset --</option>
                  {bookableAssets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                  ))}
                </select>
                {errors.assetId && <span className="text-xs text-[#dc3545] font-medium">{errors.assetId.message}</span>}
              </div>

              <Input
                label="Booked By"
                placeholder="Your Name"
                error={errors.bookedBy?.message}
                {...register('bookedBy')}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  error={errors.startDate?.message}
                  {...register('startDate')}
                />
                <Input
                  label="Start Time"
                  type="time"
                  error={errors.startTime?.message}
                  {...register('startTime')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="End Date"
                  type="date"
                  error={errors.endDate?.message}
                  {...register('endDate')}
                />
                <Input
                  label="End Time"
                  type="time"
                  error={errors.endTime?.message}
                  {...register('endTime')}
                />
              </div>

              <Button type="submit" variant="primary" className="w-full mt-2">
                Confirm Reservation
              </Button>
            </form>
          </Card>

          {/* Upcoming List */}
          <Card title="Upcoming Bookings" className="max-h-[300px] overflow-y-auto">
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-xs text-[#6c757d]">No upcoming reservations found.</p>
              ) : (
                bookings.map(b => (
                  <div key={b.id} className="flex items-start justify-between border-b border-[#dee2e6] pb-3 last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#212529]">{b.assetName}</h4>
                      <div className="flex items-center gap-1 text-[12px] text-[#6c757d] font-semibold mt-1">
                        <User className="w-3.5 h-3.5" />
                        <span>Reserved by {b.bookedBy}</span>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-[#6c757d] font-bold">
                      <p>{moment(b.startDate).format('MMM D, h:mm a')}</p>
                      <p className="text-white/0 select-none">-</p>
                      <p>{moment(b.endDate).format('MMM D, h:mm a')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
