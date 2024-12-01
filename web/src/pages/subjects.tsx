import { useMemo, useRef } from 'react';
import Button from '@/components/button';
import {
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import { useLabel } from '@/contexts/label/label-context';
import {
  Course,
  CourseType,
  SEARCH_MODES,
  SEMESTERS,
  useSubjects,
} from '@/contexts/subjects/subjects-context';
import { usePlannerStore } from '@/stores/planner';
import { floatToHHMM } from '@/utils';

export default function Subjects() {
  const { labels } = useLabel();
  const {
    subjectsQuery: {
      data: subjects,
      isLoading,
      isError,
      isSuccess,
      ...subjectsQuery
    },
    ...subjectsContext
  } = useSubjects();
  const { savedSubjects, addSubject, removeSubject } = usePlannerStore();

  const input = useRef<HTMLInputElement>(null);

  const searchModeOptions: {
    label: string;
    value: (typeof SEARCH_MODES)[number];
  }[] = useMemo(
    () => [
      {
        label: labels.COURSE_NAME,
        value: 'keresnevre',
      },
      {
        label: labels.COURSE_CODE,
        value: 'keres_kod_azon',
      },
      {
        label: labels.INSTRUCTOR_NAME,
        value: 'keres_okt',
      },
      {
        label: labels.INSTRUCTOR_CODE,
        value: 'keres_oktnk',
      },
    ],
    [labels],
  );

  return (
    <main className="flex flex-col items-center">
      <form className="card-body">
        <div className="flex gap-2">
          <div className="flex flex-col">
            <label htmlFor="name">{labels.SEMESTER}</label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={subjectsContext.semester}
              onChange={(e) => subjectsContext.setSemester(e.target.value)}
            >
              {SEMESTERS.map((semester) => (
                <option value={semester} key={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="name">{labels.MODE}</label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={subjectsContext.searchMode}
              onChange={(e) =>
                subjectsContext.setSearchMode(
                  e.target.value as (typeof SEARCH_MODES)[number], // TODO: make custom type safe select
                )
              }
            >
              {searchModeOptions.map((mode) => (
                <option value={mode.value} key={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="name">{labels.SEARCH_TERM}</label>

          <input
            ref={input}
            value={subjectsContext.searchTerm}
            onChange={(e) => subjectsContext.setSearchTerm(e.target.value)}
            id="name"
            className="input input-bordered"
            type="text"
          />
        </div>

        <Button
          label="Search"
          type="submit"
          className="btn-primary"
          disabled={!subjectsContext.searchTerm}
          isLoading={isLoading}
          icon={<MagnifyingGlassIcon width={20} height={20} />}
          onClick={(e) => {
            e.preventDefault();
            if (subjectsQuery.status === 'loading') {
              return;
            }
            subjectsQuery.fetch({
              term: subjectsContext.searchTerm,
              mode: subjectsContext.searchMode,
              semester: subjectsContext.semester,
            });
          }}
        />
      </form>

      <div className="flex flex-col gap-4">
        {isError && <p>{labels.ERROR}...</p>}
        {isSuccess && !subjects?.length && <p>{labels.NO_RECORDS_FOUND}</p>}

        {subjects?.map((subject) => {
          const lectures = subject.courses.filter(
            (c) => c.type === CourseType.Lecture,
          );
          const practices = subject.courses.filter(
            (c) => c.type === CourseType.Practice,
          );

          const isSaved = savedSubjects.find((s) => s.code === subject.code);

          return (
            <div className="card" key={subject.code}>
              <div className="card-body rounded-md bg-base-200">
                <h2 className="card-title">
                  {subject.name} ({subject.code})
                </h2>

                {isSaved ? (
                  <Button
                    className="btn btn-outline btn-error w-min text-nowrap"
                    label={labels.REMOVE_FROM_PLANNER}
                    icon={<MinusIcon width={20} height={20} />}
                    onClick={() => removeSubject(subject)}
                  />
                ) : (
                  <Button
                    className="btn btn-outline btn-success w-min text-nowrap"
                    label={labels.ADD_TO_PLANNER}
                    icon={<PlusIcon width={20} height={20} />}
                    onClick={() => addSubject(subject)}
                  />
                )}

                {lectures.length > 0 && (
                  <>
                    <h2 className="card-title">
                      {lectures.length > 1 ? labels.LECTURES : labels.LECTURE}
                    </h2>
                    <div>
                      {lectures.map((course) => (
                        <CourseCard
                          key={
                            course.code +
                            course.time?.day +
                            course.time?.start +
                            course.place +
                            course.instructor
                          }
                          course={course}
                        />
                      ))}
                    </div>
                  </>
                )}

                {practices.length > 0 && (
                  <>
                    <h2 className="card-title">
                      {practices.length > 1
                        ? labels.PRACTICES
                        : labels.PRACTICE}
                    </h2>
                    <div className="flex flex-col gap-1">
                      {practices.map((course) => (
                        <CourseCard
                          key={
                            course.code +
                            course.time?.day +
                            course.time?.start +
                            course.place +
                            course.instructor
                          }
                          course={course}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function CourseCard({ course }: { course: Course }) {
  const { labels } = useLabel();
  const days = [
    labels.SUNDAY,
    labels.MONDAY,
    labels.TUESDAY,
    labels.WEDNESDAY,
    labels.THURSDAY,
    labels.FRIDAY,
    labels.SATURDAY,
  ];

  const [code, _] = course.code.split(' ');
  const classNumber =
    course.type === CourseType.Practice &&
    code.split('-')[code.split('-').length - 1];

  return (
    <div className="rounded-md bg-base-100 p-3">
      <h2 className="text-lg font-bold">
        {course.type === CourseType.Lecture
          ? labels.LECTURE
          : `${labels.PRACTICE} ${classNumber}.`}
      </h2>
      <div className="grid gap-x-3 [grid-template-columns:auto_1fr]">
        <span className="font-bold">{labels.CODE}:</span>
        <span>{code}</span>

        <span className="font-bold">{labels.INSTRUCTOR}:</span>
        <span>{course.instructor}</span>

        <>
          <span className="font-bold">{labels.DAY}:</span>
          <span>{course.time?.day ? days[course.time.day] : '-'}</span>

          <span className="font-bold">{labels.TIME}:</span>
          <span>
            {course.time
              ? `${floatToHHMM(course.time.start)}-${floatToHHMM(course.time.end)}`
              : '-'}
          </span>
        </>

        <span className="font-bold">{labels.PLACE}:</span>
        <span>{course.place}</span>

        <span className="font-bold">{labels.CAPACITY}:</span>
        <span>{course.capacity}</span>
      </div>
    </div>
  );
}
