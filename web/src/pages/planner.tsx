import Button from '@/components/button';
import Calendar from '@/components/calendar';
import { useLabel } from '@/contexts/label/label-context';
import {
  CourseType,
  Filter,
  SolverRequest,
  Subject,
} from '@/contexts/subjects/subjects-context';
import { usePlannerStore } from '@/stores/planner';
import { cn, useQuery } from '@/utils';
import {
  CaretUpIcon,
  CheckIcon,
  DoubleArrowRightIcon,
  DropdownMenuIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import CourseDialog from '@/components/course-dialog';
import EventItem from '@/components/event-item';
import Input from '@/components/input';
import SubjectDialog from '@/components/subject-dialog';
import { Time } from '@/time';

export default function Planner() {
  const navigate = useNavigate();
  const {
    savedSubjects,
    setResults,
    calendarSettings,
    setSlotDuration,
    filters,
    addSubject,
  } = usePlannerStore();
  const { labels } = useLabel();
  const solverQuery = useQuery<Subject[], SolverRequest>({
    fetcher: callSolver,
    onSuccess: (output, input) => {
      setResults({
        input,
        output,
      });
      navigate('/results');
    },
  });

  const [earliestStartTime, latestEndTime] = useMemo(() => {
    const earliestStartTime = savedSubjects
      .flatMap((s) => s.courses)
      .reduce(
        (acc, course) =>
          course.slot.start?.isBefore(acc) ? course.slot.start : acc,
        Time.fromHHMM('23:59'),
      );
    const latestEndTime = savedSubjects
      .flatMap((s) => s.courses)
      .reduce(
        (acc, course) =>
          course.slot.end?.isAfter(acc) ? course.slot.end : acc,
        Time.fromHHMM('00:00'),
      );

    return [earliestStartTime, latestEndTime];
  }, [savedSubjects]);

  return (
    <div className="p-3">
      <div className="mx-auto flex max-w-screen-2xl flex-1 flex-col gap-3 overflow-x-auto px-9">
        <div className="flex justify-between">
          <h1 className="text-2xl">{labels.PLANNER}</h1>

          <Button
            label={labels.SOLVER}
            className="btn-primary btn-sm"
            icon={<DoubleArrowRightIcon width={20} height={20} />}
            isLoading={solverQuery.isLoading}
            onClick={() => {
              solverQuery.fetch({
                subjects: savedSubjects.map((s) => ({
                  ...s,
                  courses: s.courses.filter((c) =>
                    Object.values(c.slot).every((v) => !!v),
                  ),
                })),
                filters,
              });
            }}
          />
        </div>

        <details className="collapse collapse-arrow rounded-md border border-base-content/50 bg-base-200">
          <summary className="collapse-title min-h-0 p-2 after:!-translate-y-[200%]">
            <div className="flex items-center gap-2">
              <span>{labels.SAVED_SUBJECTS}</span>
            </div>
          </summary>

          <div className="collapse-content flex flex-col gap-1">
            <SubjectDialog
              mode="create"
              renderTrigger={(dialogRef) => (
                <Button
                  className="btn-outline btn-success btn-sm ml-auto"
                  label={labels.CREATE_SUBJECT}
                  icon={<PlusIcon width={20} height={20} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    dialogRef.current?.showModal();
                  }}
                />
              )}
              onSubmit={addSubject}
            />

            <table className="table table-pin-cols table-fixed">
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
          </div>
        </details>

        <details className="collapse collapse-arrow rounded-md border border-base-content/50 bg-base-200">
          <summary className="collapse-title min-h-0 p-2 after:!-translate-y-[200%]">
            {labels.FILTERS}
          </summary>
          <table className="table collapse-content table-pin-cols table-fixed">
            <thead className="">
              <tr className="text-base font-bold text-base-content">
                <th className="bg-base-100 text-left">{labels.DAY}</th>
                <th className="bg-base-100 text-left">{labels.START}</th>
                <th className="bg-base-100 text-left">{labels.END}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filters.map((filter) => (
                <FilterRow
                  filter={filter}
                  key={`${filter.slot.day}-${filter.slot.start}-${filter.slot.end}`}
                />
              ))}
              <FilterRow isNew={true} />
            </tbody>
          </table>
        </details>

        <h2 className="text-xl">{labels.CALENDAR}</h2>
        <div className="min-w-[800px]">
          <Calendar
            slotMinTime={earliestStartTime.subtract(Time.fromHours(2)).toHHMM()}
            slotMaxTime={latestEndTime.add(Time.fromHours(2)).toHHMM()}
            slotDuration={`00:${calendarSettings.slotDuration}:00`}
            events={[
              ...filters.map((filter) => ({
                daysOfWeek: [filter.slot.day],
                startTime: filter.slot.start!.toHHMM(),
                duration: filter.slot
                  .end!.subtract(filter.slot.start!)
                  .toHHMM(),
                color: 'transparent',
                filter,
              })),
              ...savedSubjects.flatMap((subject) =>
                subject.courses
                  .filter((c) => Object.values(c.slot).every((v) => !!v))
                  .map((course) => ({
                    title: `${subject.name}`,
                    daysOfWeek: [course.slot!.day],
                    startTime: course.slot.start!.toHHMM(),
                    duration: course.slot
                      .end!.subtract(course.slot.start!)
                      .toHHMM(),
                    color: subject.color,
                    course,
                  })),
              ),
            ]}
            eventContent={(eventInfo) =>
              eventInfo.event.extendedProps.course ? (
                <EventItem eventInfo={eventInfo} />
              ) : null
            }
            eventDidMount={(eventInfo) => {
              setTimeout(() => {
                if (
                  eventInfo.event.extendedProps.filter &&
                  eventInfo.el.parentElement
                ) {
                  eventInfo.el.parentElement.style.width = '100%';
                  eventInfo.el.parentElement.style.left = '0';
                  eventInfo.el.parentElement.style.backgroundColor = 'red';
                  eventInfo.el.parentElement.style.opacity = '0.5';
                  eventInfo.el.parentElement.style.zIndex = '100';
                  eventInfo.el.parentElement.style.pointerEvents = 'none';
                }
              });
            }}
          />
          <label htmlFor="slotDuration">{labels.SLOT_DURATION}</label>
          <br />
          <div className="flex gap-1">
            <input
              type="range"
              value={calendarSettings.slotDuration}
              onChange={(e) => setSlotDuration(parseInt(e.target.value))}
              min={10}
              step={5}
              max={40}
              className="range range-xs w-[30%]"
            />
            <span>
              {calendarSettings.slotDuration} {labels.MINUTES}
            </span>
          </div>
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
    body: JSON.stringify(queryOptions, (_key, value) => {
      if (value instanceof Time) {
        return value.minutes;
      }
      return value;
    }),
  })
    .then((res) => res.text())
    .then((jsonString) =>
      JSON.parse(jsonString, (key, value) => {
        if (key === 'slot') {
          return {
            day: value.day,
            start: Time.fromMinutes(value.start),
            end: Time.fromMinutes(value.end),
          };
        }

        return value;
      }),
    );
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
  const {
    updateCourse,
    createCourse,
    removeCourse,
    removeSubject,
    updateSubject,
  } = usePlannerStore();

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
                {subject.origin === 'elte' && (
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
                )}
                <li>
                  <CourseDialog
                    mode="create"
                    courseData={{
                      code: `${subject.code}-custom-${subject.courses.filter((c) => c.code.includes('-custom-')).length + 1}`,
                    }}
                    onSubmit={(courseData) =>
                      createCourse(subject.code, courseData)
                    }
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

                <li>
                  <SubjectDialog
                    mode="edit"
                    subjectData={subject}
                    renderTrigger={(dialogRef) => (
                      <Button
                        className="btn-outline btn-info btn-sm ml-auto w-full"
                        label={labels.EDIT}
                        icon={<Pencil1Icon width={20} height={20} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          dialogRef.current?.showModal();
                        }}
                      />
                    )}
                    onSubmit={updateSubject}
                  />
                </li>

                <li>
                  <Button
                    label={labels.DELETE}
                    className="btn btn-outline btn-error btn-sm w-full"
                    onClick={() => removeSubject(subject)}
                    icon={<TrashIcon width={20} height={20} />}
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
              key={course.id}
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
                {course.slot.day && course.slot.start && course.slot.end
                  ? `${days[course.slot.day]}, ${course.slot.start.toHHMM()}-${course.slot.end.toHHMM()}`
                  : '-'}
              </td>
              <td>
                <div className="flex gap-2">
                  <CourseDialog
                    mode="edit"
                    courseData={course}
                    onSubmit={updateCourse}
                  />
                  <Button
                    title={labels.DELETE}
                    className="btn btn-outline btn-error btn-sm"
                    icon={<TrashIcon width={20} height={20} />}
                    onClick={() => removeCourse(subject.code, course.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
    </>
  );
}

type FilterRowProps =
  | {
      isNew: true;
      filter?: undefined;
    }
  | {
      isNew?: undefined;
      filter: Filter;
    };

function FilterRow({ isNew, filter }: FilterRowProps) {
  const { labels } = useLabel();
  const { addFilter, removeFilter, filters } = usePlannerStore();

  const days = [
    labels.SUNDAY,
    labels.MONDAY,
    labels.TUESDAY,
    labels.WEDNESDAY,
    labels.THURSDAY,
    labels.FRIDAY,
    labels.SATURDAY,
  ];
  const [filterData, setFilterData] = useState<Filter>(
    filter ?? { slot: { start: null, end: null, day: 1 } },
  );

  return (
    <tr>
      <td>
        <select
          className="select select-bordered select-sm disabled:pl-0 disabled:text-base-content"
          value={filterData.slot.day ?? 0}
          disabled={!isNew}
          onChange={(e) => {
            setFilterData((f) => ({
              ...f,
              slot: {
                ...f.slot,
                day: parseInt(e.target.value),
              },
            }));
          }}
        >
          {days.map((day, i) => (
            <option key={day} value={i}>
              {day}
            </option>
          ))}
        </select>
      </td>
      <td>
        <Input
          type="time"
          className="w-min disabled:pl-0 disabled:text-base-content"
          disabled={!isNew}
          value={filterData.slot.start ? filterData.slot.start.toHHMM() : ''}
          onChange={(e) => {
            setFilterData((f) => ({
              ...f,
              slot: {
                ...f.slot,
                start: Time.fromHHMM(e.target.value),
              },
            }));
          }}
        />
      </td>
      <td>
        <Input
          type="time"
          className="w-min disabled:pl-0 disabled:text-base-content"
          disabled={!isNew}
          value={filterData.slot.end ? filterData.slot.end.toHHMM() : ''}
          onChange={(e) => {
            setFilterData((f) => ({
              ...f,
              slot: {
                ...f.slot,
                end: Time.fromHHMM(e.target.value),
              },
            }));
          }}
        />
      </td>
      <td>
        <div className="flex justify-end gap-3">
          {isNew ? (
            <Button
              title={labels.CREATE}
              className="btn btn-outline btn-success btn-sm"
              icon={<CheckIcon width={20} height={20} />}
              disabled={
                !filterData.slot.day ||
                !filterData.slot.start ||
                !filterData.slot.end ||
                filters.some(
                  (f) =>
                    f.slot.day === filterData.slot.day &&
                    f.slot.start === filterData.slot.start &&
                    f.slot.end === filterData.slot.end,
                )
              }
              onClick={() => {
                addFilter(filterData);
                setFilterData({ slot: { start: null, end: null, day: null } });
              }}
            />
          ) : (
            <Button
              title={labels.DELETE}
              className="btn btn-outline btn-error btn-sm"
              icon={<TrashIcon width={20} height={20} />}
              onClick={() => removeFilter(filterData)}
            />
          )}
        </div>
      </td>
    </tr>
  );
}
