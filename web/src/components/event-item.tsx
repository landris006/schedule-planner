import Button from '@/components/button';
import { useLabel } from '@/contexts/label/label-context';
import {
  Course,
  CourseType,
  Subject,
} from '@/contexts/subjects/subjects-context';
import { usePlannerStore } from '@/stores/planner';
import { cn, floatToHHMM } from '@/utils';
import { EventContentArg } from '@fullcalendar/core/index.js';
import {
  CaretUpIcon,
  EyeOpenIcon,
  LockClosedIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CourseDialog from '@/components/course-dialog';

export default function EventItem({
  eventInfo,
  dialogReadOnly = false,
}: {
  eventInfo: EventContentArg;
  dialogReadOnly?: boolean;
}) {
  const [isShowingTooltip, setIsShowingTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { labels } = useLabel();
  const course: Course = eventInfo.event.extendedProps.course;

  return (
    <>
      {createPortal(
        <div ref={tooltipRef} className="absolute z-50">
          {isShowingTooltip && (
            <div className="w-72 rounded-md bg-base-100 p-2 shadow-lg">
              <div className="flex gap-2">
                <div className="flex flex-col">
                  <p className="flex justify-between overflow-hidden text-ellipsis font-bold">
                    {course.time.start && course.time.end
                      ? `${floatToHHMM(course.time.start)}-${floatToHHMM(course.time.end)}`
                      : '-'}

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
                  </p>

                  <p className="overflow-hidden text-ellipsis">
                    {eventInfo.event.title}
                  </p>
                  <p className="overflow-hidden text-ellipsis">{course.code}</p>

                  <p className="overflow-hidden text-ellipsis">
                    {course.instructor}
                  </p>
                  <p className="overflow-hidden text-ellipsis">
                    {course.place}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>,
        document.body,
      )}

      <CourseDialog
        mode={dialogReadOnly ? 'read' : 'edit'}
        courseData={course}
        renderTrigger={(dialogRef) => (
          <div
            className="relative z-0 flex h-full cursor-pointer flex-col gap-0.5"
            onClick={() => dialogRef.current?.showModal()}
            onMouseEnter={(e) => {
              if (!tooltipRef.current) {
                return;
              }
              const { left, width, top } =
                e.currentTarget.getBoundingClientRect();

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
            {course.fix && (
              <span
                className="tooltip tooltip-left absolute bottom-0 right-0 z-10 text-yellow-300"
                data-tip={labels.FIX_TOOLTIP}
              >
                <LockClosedIcon width={20} height={20} />
              </span>
            )}

            <p className="flex justify-between font-bold">
              {course.time.start && course.time.end
                ? `${floatToHHMM(course.time.start)}-${floatToHHMM(course.time.end)}`
                : '-'}

              {course.type === CourseType.Lecture && (
                <span className="overflow-hidden text-ellipsis">
                  {labels.LECTURE}
                </span>
              )}
              {course.type === CourseType.Practice && (
                <span className="overflow-hidden text-ellipsis">
                  {labels.PRACTICE}
                </span>
              )}
            </p>
            <p className="overflow-hidden text-ellipsis">
              {eventInfo.event.title}
            </p>
            <p className="overflow-hidden text-ellipsis">{course.code}</p>

            <p className="overflow-hidden text-ellipsis">{course.place}</p>
          </div>
        )}
      />
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
              <td>{course.place}</td>
              <td>
                {course.time.day && course.time.start && course.time.end
                  ? `${days[course.time.day]}, ${floatToHHMM(course.time.start)}-${floatToHHMM(course.time.end)}`
                  : '-'}
              </td>
              <td>
                <CourseDialog mode="edit" courseData={course} />
              </td>
            </tr>
          ))}
    </>
  );
}
