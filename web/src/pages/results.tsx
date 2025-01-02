import { floatToHHMM } from '@/utils';
import Calendar from '@/components/calendar';
import { useLabel } from '@/contexts/label/label-context';
import { usePlannerStore } from '@/stores/planner';
import { useMemo } from 'react';
import EventItem from '@/components/event-item';

export default function Results() {
  const { labels } = useLabel();

  const { results, calendarSettings, setSlotDuration } = usePlannerStore();

  const [earliestStartTime, latestEndTime] = useMemo(() => {
    const earliestStartTime = results.reduce(
      (acc, subject) =>
        Math.min(
          acc,
          subject.courses
            .filter((c) => Object.values(c.time).every((v) => !!v))
            .reduce(
              (acc, course) => Math.min(acc, course.time.start ?? 0),
              Infinity,
            ),
        ),
      Infinity,
    );
    const latestEndTime = results.reduce(
      (acc, subject) =>
        Math.max(
          acc,
          subject.courses
            .filter((c) => Object.values(c.time).every((v) => !!v))
            .reduce(
              (acc, course) => Math.max(acc, course.time.end ?? Infinity),
              -Infinity,
            ),
        ),
      -Infinity,
    );

    return [earliestStartTime, latestEndTime];
  }, [results]);

  return (
    <div className="p-3">
      <div className="mx-auto max-w-7xl flex-1 overflow-x-auto">
        <h1 className="text-3xl">{labels.RESULTS}</h1>

        <div className="min-w-[800px]">
          <Calendar
            slotMinTime={floatToHHMM(
              earliestStartTime === Infinity ? 0 : earliestStartTime - 2,
            )}
            slotMaxTime={floatToHHMM(
              latestEndTime === -Infinity ? 24 : latestEndTime + 2,
            )}
            slotDuration={`00:${calendarSettings.slotDuration}:00`}
            events={results.flatMap((subject) =>
              subject.courses
                .filter((c) => Object.values(c.time).every((v) => !!v))
                .map((course) => ({
                  title: `${subject.name}`,
                  daysOfWeek: [course.time!.day],
                  startTime: floatToHHMM(course.time.start!),
                  duration: floatToHHMM(course.time.end! - course.time.start!),
                  color: subject.color,
                  course,
                })),
            )}
            eventContent={(eventInfo) => (
              <EventItem dialogReadOnly={true} eventInfo={eventInfo} />
            )}
          />
          <label htmlFor="slotDuration">{labels.SLOT_DURATION}</label>
          <br />
          <input
            type="range"
            value={calendarSettings.slotDuration}
            onChange={(e) => setSlotDuration(parseInt(e.target.value))}
            min={10}
            step={5}
            max={40}
            className="range range-xs w-[30%]"
          />
          {calendarSettings.slotDuration}
        </div>
      </div>
    </div>
  );
}
