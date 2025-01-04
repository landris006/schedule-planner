import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useLabel } from '@/contexts/label/label-context';
import { CalendarOptions } from '@fullcalendar/core/index.js';

export default function Calendar(props: CalendarOptions) {
  const { locale } = useLabel();

  return (
    <FullCalendar
      plugins={[timeGridPlugin]}
      // height="auto"
      initialView="timeGridWeek"
      dayHeaderFormat={{ weekday: 'long' }}
      slotEventOverlap={false}
      locale={locale}
      contentHeight="80vh"
      headerToolbar={false}
      nowIndicator={true}
      weekends={false}
      firstDay={1}
      allDaySlot={false}
      slotLabelFormat={{
        hour: '2-digit',
        minute: '2-digit',
      }}
      {...props}
    />
  );
}
