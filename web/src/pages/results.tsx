import { floatToHHMM } from '@/utils';
import Calendar from '@/components/calendar';
import { useLabel } from '@/contexts/label/label-context';
import { usePlannerStore } from '@/stores/planner';
import { useMemo } from 'react';
import EventItem from '@/components/event-item';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export default function Results() {
  const { labels } = useLabel();
  const { results, calendarSettings, setSlotDuration } = usePlannerStore();

  const [earliestStartTime, latestEndTime] = useMemo(() => {
    const earliestStartTime = results.output.reduce(
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
    const latestEndTime = results.output.reduce(
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

  const leftOutSubjects = useMemo(
    () =>
      results.input.subjects.filter(
        (subject) => !results.output.find((s) => s.code === subject.code),
      ),
    [results],
  );

  return (
    <div className="p-3">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 overflow-x-auto">
        <h1 className="hidden">{labels.RESULTS}</h1>

        {leftOutSubjects.length > 0 && (
          <details role="alert" className="collapse collapse-arrow bg-base-200">
            <summary className="collapse-title text-xl font-medium">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon
                  className="text-error"
                  width={20}
                  height={20}
                />
                <span>{labels.SUBJECTS_WERE_LEFT_OUT}</span>
              </div>
            </summary>
            <div className="collapse-content">
              {leftOutSubjects.map((subject, i) => (
                <span key={subject.code}>
                  {i + 1}. {subject.name} ({subject.code})
                </span>
              ))}
            </div>
          </details>
        )}

        <div className="min-w-[800px]">
          <Calendar
            slotMinTime={floatToHHMM(
              earliestStartTime === Infinity ? 0 : earliestStartTime - 2,
            )}
            slotMaxTime={floatToHHMM(
              latestEndTime === -Infinity ? 24 : latestEndTime + 2,
            )}
            slotDuration={`00:${calendarSettings.slotDuration}:00`}
            events={results.output.flatMap((subject) =>
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
