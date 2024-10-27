import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useLabel } from '@/contexts/label/label-context';
import { cn } from '@/utils';
import { EventSourceInput } from '@fullcalendar/core/index.js';

type Props = {
  events: EventSourceInput;
} & React.HTMLAttributes<HTMLDivElement>;

export default function Calendar({ events, className, ...props }: Props) {
  const { locale } = useLabel();

  return (
    <div className={cn('overflow-x-auto', className)} {...props}>
      <div className="min-w-[800px]">
        <FullCalendar
          plugins={[timeGridPlugin]}
          // height="auto"
          initialView="timeGridWeek"
          dayHeaderFormat={{ weekday: 'long' }}
          locale={locale}
          contentHeight="80vh"
          headerToolbar={false}
          nowIndicator={true}
          allDaySlot={false}
          slotDuration="00:20:00"
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
          }}
          events={events}
        />
      </div>
    </div>
  );
}
