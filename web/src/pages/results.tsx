import Calendar from '@/components/calendar';
import { useLabel } from '@/contexts/label/label-context';
import { usePlannerStore } from '@/stores/planner';
import { useMemo } from 'react';
import EventItem from '@/components/event-item';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Time } from '@/time';

export default function Results() {
  const { labels } = useLabel();
  const { results, calendarSettings, setSlotDuration } = usePlannerStore();

  const [earliestStartTime, latestEndTime, credits] = useMemo(() => {
    const earliestStartTime = results.output
      .flatMap((s) => s.courses)
      .reduce(
        (acc, course) =>
          course.slot.start?.isBefore(acc) ? course.slot.start : acc,
        Time.fromHHMM('23:59'),
      );
    const latestEndTime = results.output
      .flatMap((s) => s.courses)
      .reduce(
        (acc, course) =>
          course.slot.end?.isAfter(acc) ? course.slot.end : acc,
        Time.fromHHMM('00:00'),
      );

    const credits = results.output.reduce(
      (acc, subject) => acc + (subject.credits ?? 0),
      0,
    );

    return [earliestStartTime, latestEndTime, credits];
  }, [results.output]);

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
        <h1 className="text-2xl">
          {labels.RESULTS}{' '}
          {credits > 0 && (
            <span className="text-success">
              ({labels.TOTAL_CREDITS.toLowerCase()}: {credits})
            </span>
          )}
        </h1>

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
            slotMinTime={earliestStartTime.subtract(Time.fromHours(2)).toHHMM()}
            slotMaxTime={latestEndTime.add(Time.fromHours(2)).toHHMM()}
            slotDuration={`00:${calendarSettings.slotDuration}:00`}
            events={results.output.flatMap((subject) =>
              subject.courses
                .filter((c) => Object.values(c.slot).every((v) => !!v))
                .map((course) => ({
                  title: `${subject.name}`,
                  daysOfWeek: [course.slot!.day],
                  startTime: course.slot.start!.toHHMM(),
                  duration: course.slot.end!.subtract(course.slot.start!),
                  color: subject.color,
                  course,
                })),
            )}
            eventContent={(eventInfo) => (
              <EventItem
                dialogReadOnly={true}
                eventInfo={eventInfo}
                showPlace
              />
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
