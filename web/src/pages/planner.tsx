import Button from '@/components/button';
import Calendar from '@/components/calendar';
import { useLabel } from '@/contexts/label/label-context';
import {
  CourseType,
  SolverRequest,
  Subject,
} from '@/contexts/subjects/subjects-context';
import { usePlannerStore } from '@/stores/planner';
import { floatToHHMM, useQuery } from '@/utils';
import { EventContentArg } from '@fullcalendar/core/index.js';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

export default function Planner() {
  const navigate = useNavigate();
  const { savedSubjects, setResults, calendarSettings, setSlotDuration } =
    usePlannerStore();
  const { labels } = useLabel();
  const solverQuery = useQuery<Subject[], SolverRequest>({
    fetcher: callSolver,
    onSuccess: (data) => {
      setResults(data);
      navigate('/results');
    },
  });

  const [earliestStartTime, latestEndTime] = useMemo(() => {
    const earliestStartTime = savedSubjects.reduce(
      (acc, subject) =>
        Math.min(
          acc,
          subject.courses
            .filter((c) => !!c.time)
            .reduce(
              (acc, course) => Math.min(acc, course.time!.start ?? 0),
              Infinity,
            ),
        ),
      Infinity,
    );
    const latestEndTime = savedSubjects.reduce(
      (acc, subject) =>
        Math.max(
          acc,
          subject.courses
            .filter((c) => !!c.time)
            .reduce(
              (acc, course) => Math.max(acc, course.time!.end ?? Infinity),
              -Infinity,
            ),
        ),
      -Infinity,
    );

    return [earliestStartTime, latestEndTime];
  }, [savedSubjects]);

  return (
    <div className="p-3">
      <div className="mx-auto max-w-screen-2xl flex-1 overflow-x-auto">
        <div className="flex justify-between">
          <h1 className="text-3xl">{labels.PLANNER}</h1>

          <Button
            label="Solver"
            className="btn-primary"
            icon={<MagnifyingGlassIcon width={20} height={20} />}
            isLoading={solverQuery.isLoading}
            onClick={() => {
              solverQuery.fetch({
                subjects: savedSubjects.filter((s) =>
                  s.courses.every((c) => !!c.time),
                ),
                filters: [],
              });
            }}
          />
        </div>
        <div className="min-w-[800px]">
          <Calendar
            slotMinTime={floatToHHMM(
              earliestStartTime === Infinity ? 0 : earliestStartTime - 2,
            )}
            slotMaxTime={floatToHHMM(
              latestEndTime === -Infinity ? 24 : latestEndTime + 2,
            )}
            slotDuration={`00:${calendarSettings.slotDuration}:00`}
            events={savedSubjects.flatMap((subject) =>
              subject.courses
                .filter((c) => c.time)
                .map((course) => ({
                  title: `
                    ${subject.name} ${course.code}{0}
                    ${course.type === CourseType.Lecture ? labels.LECTURE : labels.PRACTICE}{0}
                    ${course.place}{0}
                    ${course.instructor}`,
                  daysOfWeek: [course.time!.day],
                  startTime: floatToHHMM(course.time!.start),
                  duration: floatToHHMM(course.time!.end - course.time!.start),
                  color: subject.color,
                })),
            )}
            eventContent={(eventInfo) => <EventItem eventInfo={eventInfo} />}
          />
          <label htmlFor="slotDuration">Beosztásköz</label>
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

async function callSolver(queryOptions: SolverRequest) {
  return fetch('/api/solver', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(queryOptions),
  }).then((res) => res.json());
}

function EventItem({ eventInfo }: { eventInfo: EventContentArg }) {
  const [isShowingTooltip, setIsShowingTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {createPortal(
        <div ref={tooltipRef} className="absolute z-50">
          {isShowingTooltip && (
            <div className="w-60 rounded-md bg-base-100 p-2 shadow-lg">
              <div className="flex gap-2">
                <div className="flex flex-col">
                  <p className="font-bold">{eventInfo.timeText}</p>
                  <p className="overflow-hidden text-ellipsis">
                    {eventInfo.event.title.split('{0}')[0]}
                  </p>
                  <p className="overflow-hidden text-ellipsis">
                    {eventInfo.event.title.split('{0}')[1]}
                  </p>
                  <p className="overflow-hidden text-ellipsis">
                    {eventInfo.event.title.split('{0}')[3]}
                  </p>
                  <p className="overflow-hidden text-ellipsis">
                    {eventInfo.event.title.split('{0}')[2]}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>,
        document.body,
      )}

      <div
        className="relative z-0 flex h-full flex-col gap-0.5"
        onMouseEnter={(e) => {
          if (!tooltipRef.current) {
            return;
          }
          const { left, width, top } = e.currentTarget.getBoundingClientRect();

          tooltipRef.current.style.right =
            window.innerWidth - left - width + 'px';
          tooltipRef.current.style.bottom = window.innerHeight - top + 'px';
          setIsShowingTooltip(true);
        }}
        onMouseLeave={() => {
          setIsShowingTooltip(false);
        }}
      >
        <p className="font-bold">{eventInfo.timeText}</p>
        <p className="overflow-hidden text-ellipsis">
          {eventInfo.event.title.split('{0}')[0]}
        </p>
        <p className="overflow-hidden text-ellipsis">
          {eventInfo.event.title.split('{0}')[1]}
        </p>
        <p className="overflow-hidden text-ellipsis">
          {eventInfo.event.title.split('{0}')[2]}
        </p>
      </div>
    </>
  );
}
