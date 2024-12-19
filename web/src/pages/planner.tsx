import Button from '@/components/button';
import Calendar from '@/components/calendar';
import { useLabel } from '@/contexts/label/label-context';
import {
  CourseType,
  SolverRequest,
  Subject,
} from '@/contexts/subjects/subjects-context';
import { usePlannerStore } from '@/stores/planner';
import { cn, floatToHHMM, useQuery } from '@/utils';
import { EventContentArg } from '@fullcalendar/core/index.js';
import {
  CaretUpIcon,
  EyeOpenIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import styles from './planner.css';

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
      <div className="mx-auto flex max-w-screen-2xl flex-1 flex-col gap-3 overflow-x-auto">
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

        <div className="collapse collapse-arrow rounded-md border border-base-content/50 bg-base-200">
          <input type="checkbox" />
          <h2 className="collapse-title text-xl">{labels.SAVED_SUBJECTS}</h2>
          <table className="table collapse-content table-pin-cols table-fixed">
            <thead className="">
              <tr className="text-base font-bold text-base-content">
                <th className="bg-base-100 text-left">{labels.CODE}</th>
                <th className="bg-base-100 text-left">{labels.NAME}</th>
                <th className="bg-base-100 text-left">{labels.TYPE}</th>
                <th className="bg-base-100 text-left">{labels.INSTRUCTOR}</th>
                <th className="bg-base-100 text-left">{labels.DAY}</th>
                <th className="bg-base-100 text-left">{labels.TIME}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {savedSubjects
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((subject) => (
                  <SubjectRow key={subject.code} subject={subject} />
                ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl">{labels.CALENDAR}</h2>
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
          tooltipRef.current.style.bottom =
            window.innerHeight - top - window.scrollY + 'px';
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

function SubjectRow({ subject }: { subject: Subject }) {
  const [isOpen, setIsOpen] = useState(false);
  const { labels, locale } = useLabel();
  const { removeSubject } = usePlannerStore();

  const days = [
    labels.SUNDAY,
    labels.MONDAY,
    labels.TUESDAY,
    labels.WEDNESDAY,
    labels.THURSDAY,
    labels.FRIDAY,
    labels.SATURDAY,
  ];

  return (
    <>
      <tr
        key={subject.code}
        className={cn('subject-row lz-10 cursor-pointer hover:bg-base-300', {
          'bg-base-300': isOpen,
        })}
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="overflow-hidden text-ellipsis whitespace-nowrap px-3 py-1">
          {subject.code}
        </td>
        <td>{subject.name}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>
          <div className="flex items-center gap-1">
            <Button
              className="btn btn-ghost btn-outline btn-sm w-min"
              onClick={(e) => e.stopPropagation()}
              icon={<EyeOpenIcon width={20} height={20} />}
            />
            <Button
              className="btn btn-outline btn-error btn-sm w-min"
              onClick={(e) => e.stopPropagation()}
              icon={<TrashIcon width={20} height={20} />}
            />
            <CaretUpIcon
              className={cn('ml-auto h-5 w-5', {
                'rotate-180': isOpen,
              })}
            />
          </div>
        </td>
      </tr>

      {isOpen &&
        subject.courses
          .sort((a, b) => a.type - b.type)
          .map((course) => (
            <tr
              key={course.code + course.instructor + course.time?.day}
              className="animate-course-row-pop-in bg-base-300 last-of-type:border-b-white"
            >
              <td className="parent-line relative whitespace-nowrap py-0 pl-6 pr-3">
                {course.code}
              </td>
              <td></td>
              <td>
                {course.type === CourseType.Lecture && (
                  <span className="badge badge-accent badge-outline">
                    {labels.LECTURE}
                  </span>
                )}
                {course.type === CourseType.Practice && (
                  <span className="badge badge-info badge-outline">
                    {labels.PRACTICE}
                  </span>
                )}
              </td>
              <td>
                <a
                  className="link-hover link link-primary"
                  target="_blank"
                  href={
                    locale === 'hu'
                      ? `https://www.markmyprofessor.com/kereses?q=${course.instructor}`
                      : `https://www.markmyprofessor.com/en/search?q=${course.instructor}`
                  }
                >
                  {course.instructor}
                </a>
              </td>
              <td>{course.time?.day ? days[course.time.day] : '-'}</td>
              <td>
                {course.time
                  ? `${floatToHHMM(course.time.start)}-${floatToHHMM(course.time.end)}`
                  : '-'}
              </td>
              <td>
                <Button
                  className="btn-outline btn-info btn-sm"
                  icon={<Pencil1Icon width={20} height={20} />}
                  onClick={() => {
                    // removeSubject(subject);
                  }}
                />
              </td>
            </tr>
          ))}
    </>
  );
}
