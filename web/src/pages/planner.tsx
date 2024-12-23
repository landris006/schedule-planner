import Button from '@/components/button';
import Calendar from '@/components/calendar';
import { useLabel } from '@/contexts/label/label-context';
import {
  CourseType,
  SolverRequest,
  Subject,
  useSubjects,
} from '@/contexts/subjects/subjects-context';
import { usePlannerStore } from '@/stores/planner';
import { cn, floatToHHMM, useQuery } from '@/utils';
import {
  CaretUpIcon,
  DropdownMenuIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import CourseDialog from '@/components/course-dialog';
import EventItem from '@/components/event-item';

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
            .filter((c) => Object.values(c.time).every((v) => !!v))
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
            .filter((c) => Object.values(c.time).every((v) => !!v))
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
      <div className="mx-auto flex max-w-screen-2xl flex-1 flex-col gap-3 overflow-x-auto px-9">
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
                  s.courses.every((c) =>
                    Object.values(c.time).every((v) => !!v),
                  ),
                ),
                filters: [],
              });
            }}
          />
        </div>

        <details className="collapse collapse-arrow rounded-md border border-base-content/50 bg-base-200">
          <summary className="collapse-title text-xl">
            {labels.SAVED_SUBJECTS}
          </summary>
          <table className="table collapse-content table-pin-cols table-fixed">
            <thead className="">
              <tr className="text-base font-bold text-base-content">
                <th className="bg-base-100 text-left">{labels.CODE}</th>
                <th className="bg-base-100 text-left">{labels.NAME}</th>

                <th className="hidden bg-base-100 text-left md:table-cell">
                  {labels.TYPE}
                </th>
                <th className="hidden bg-base-100 text-left md:table-cell">
                  {labels.INSTRUCTOR}
                </th>
                <th className="hidden bg-base-100 text-left md:table-cell">
                  {labels.PLACE}
                </th>
                <th className="hidden bg-base-100 text-left md:table-cell">
                  {labels.TIME}
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {savedSubjects
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((subject, i) => (
                  <SubjectRow
                    key={subject.code}
                    subject={subject}
                    isLast={i === savedSubjects.length - 1}
                  />
                ))}
            </tbody>
          </table>
        </details>

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

function SubjectRow({
  subject,
  isLast,
}: {
  subject: Subject;
  isLast?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { labels, locale } = useLabel();
  const navigate = useNavigate();
  const { updateCourse, createCourse, savedSubjects } = usePlannerStore();

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

        <td className="hidden md:table-cell"></td>
        <td className="hidden md:table-cell"></td>
        <td className="hidden md:table-cell"></td>
        <td className="hidden md:table-cell"></td>

        <td>
          <div className="flex items-center gap-1">
            <details
              className={cn('dropdown dropdown-left', {
                'dropdown-top': isLast,
              })}
            >
              <summary
                className="btn btn-ghost btn-outline btn-sm w-min"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex h-full items-center justify-center">
                  <DropdownMenuIcon width={20} height={20} />
                </div>
              </summary>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] flex w-min flex-col gap-2 rounded-box bg-base-100 p-2 shadow"
              >
                <li>
                  <NavLink
                    to={`/subjects?mode=keres_kod_azon&q=${encodeURI(
                      subject.code,
                    )}&f=true`}
                    className="btn btn-ghost btn-outline btn-sm flex w-full flex-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();

                      navigate(
                        `/subjects?mode=keres_kod_azon&q=${encodeURI(subject.code)}&f=true`,
                      );
                    }}
                  >
                    {labels.SEARCH}
                    <MagnifyingGlassIcon width={20} height={20} />
                  </NavLink>
                </li>
                <li>
                  <CourseDialog
                    mode="create"
                    courseData={{
                      code: `${subject.code}-custom-${subject.courses.filter((c) => c.code.includes('-custom-')).length + 1}`,
                    }}
                    onSubmit={(courseData) => {
                      console.log(courseData);

                      createCourse(subject.code, courseData);
                    }}
                    renderTrigger={(dialogRef) => (
                      <Button
                        label={labels.COURSE}
                        className="btn btn-outline btn-success btn-sm w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          dialogRef.current?.showModal();
                        }}
                        icon={<PlusIcon width={20} height={20} />}
                      />
                    )}
                    onClose={() => {
                      // @ts-expect-error blur is not recognized
                      document.activeElement?.blur?.();
                    }}
                  />
                </li>
              </ul>
            </details>

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

              <td className="hidden md:table-cell">
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
              <td className="hidden md:table-cell">
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
              <td className="hidden md:table-cell">{course.place}</td>
              <td className="hidden md:table-cell">
                {course.time.day && course.time.start && course.time.end
                  ? `${days[course.time.day]}, ${floatToHHMM(course.time.start)}-${floatToHHMM(course.time.end)}`
                  : '-'}
              </td>
              <td>
                <CourseDialog
                  mode="edit"
                  courseData={course}
                  onSubmit={updateCourse}
                />
              </td>
            </tr>
          ))}
    </>
  );
}
