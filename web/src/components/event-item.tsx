import { useLabel } from '@/contexts/label/label-context';
import { Course, CourseType } from '@/contexts/subjects/subjects-context';
import { EventContentArg } from '@fullcalendar/core/index.js';
import { CopyIcon, LockClosedIcon } from '@radix-ui/react-icons';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CourseDialog from '@/components/course-dialog';
import { usePlannerStore } from '@/stores/planner';

export default function EventItem({
  eventInfo,
  dialogReadOnly = false,
}: {
  eventInfo: EventContentArg;
  dialogReadOnly?: boolean;
}) {
  const [isShowingTooltip, setIsShowingTooltip] = useState(false);
  const { updateCourse } = usePlannerStore();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { labels } = useLabel();
  const course: Course = eventInfo.event.extendedProps.course;

  return (
    <>
      {createPortal(
        <div ref={tooltipRef} className="absolute z-50">
          {isShowingTooltip && (
            <div className="w-72 rounded-md border border-base-content/50 bg-base-100 p-2 shadow-lg">
              <div className="flex gap-2">
                <div className="flex w-full flex-col">
                  <p className="flex justify-between overflow-hidden text-ellipsis font-bold">
                    {course.slot.start && course.slot.end
                      ? `${course.slot.start.toHHMM()}-${course.slot.end.toHHMM()}`
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

                  <p>
                    {course.allowOverlap && (
                      <span
                        className="tooltip tooltip-left text-yellow-300 before:-translate-y-[70%]"
                        data-tip={labels.ALLOW_OVERLAP_TOOLTIP}
                      >
                        <CopyIcon width={20} height={20} />
                      </span>
                    )}
                    {course.fix && (
                      <span
                        className="tooltip tooltip-left text-yellow-300 before:-translate-y-[70%]"
                        data-tip={labels.FIX_TOOLTIP}
                      >
                        <LockClosedIcon width={20} height={20} />
                      </span>
                    )}
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
        onSubmit={updateCourse}
        renderTrigger={(dialogRef) => (
          <div
            className="relative z-0 flex h-full cursor-pointer flex-col gap-0.5 [container-type:size]"
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
            <div className="absolute bottom-0 right-0 z-10">
              {course.allowOverlap && (
                <span
                  className="tooltip tooltip-left text-yellow-300 before:-translate-y-[70%]"
                  data-tip={labels.ALLOW_OVERLAP_TOOLTIP}
                >
                  <CopyIcon width={20} height={20} />
                </span>
              )}
              {course.fix && (
                <span
                  className="tooltip tooltip-left text-yellow-300 before:-translate-y-[70%]"
                  data-tip={labels.FIX_TOOLTIP}
                >
                  <LockClosedIcon width={20} height={20} />
                </span>
              )}
            </div>
            <p className="flex justify-between gap-1 font-bold">
              {course.slot.start && course.slot.end
                ? `${course.slot.start.toHHMM()}-${course.slot.end.toHHMM()}`
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
            <p className="overflow-x-hidden text-ellipsis">
              {eventInfo.event.title}
            </p>
          </div>
        )}
      />
    </>
  );
}
