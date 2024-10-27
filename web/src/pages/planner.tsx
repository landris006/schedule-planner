import Calendar from '@/components/calendar';
import { usePlannerStore } from '@/stores/planner';

export default function Planner() {
  const courses = usePlannerStore((state) => state.courses);

  return (
    <div>
      <h1>Planner</h1>

      <div className="flex justify-center p-3">
        <Calendar
          className="max-w-7xl flex-1"
          events={[
            {
              title: 'event 1',
              daysOfWeek: ['1'],
              startTime: '09:00',
              duration: '01:00',
            },

            {
              title: 'event 1',
              daysOfWeek: ['1'],
              startTime: '09:00',
              duration: '01:20',
              color: '#ff0000',
            },
          ]}
        />
      </div>
    </div>
  );
}
