import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@/utils';
import Button from '@/components/button';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useLabel } from '@/contexts/label/label-context';

export default function Courses() {
  const { labels } = useLabel();
  const {
    data: courses,
    isLoading,
    isError,
    isSuccess,
    ...courseQuery
  } = useQuery({
    fetcher: fetchCourses,
  });

  const [formState, setFormState] = useState<QueryOptions>({
    term: '',
    mode: 'keresnevre',
    semester: semesters[0],
  });

  const input = useRef<HTMLInputElement>(null);

  const searchModeOptions: {
    label: string;
    value: SearchModes;
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
              value={formState.semester}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  semester: e.target.value,
                }))
              }
            >
              {semesters.map((semester) => (
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
              value={formState.mode}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  mode: e.target.value as SearchModes,
                }))
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
            value={formState.term}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, term: e.target.value }))
            }
            id="name"
            className="input input-bordered"
            type="text"
          />
        </div>

        <Button
          label="Search"
          type="submit"
          className="btn-primary"
          disabled={!formState.term}
          isLoading={isLoading}
          icon={<MagnifyingGlassIcon width={20} height={20} />}
          onClick={(e) => {
            e.preventDefault();
            if (courseQuery.status === 'loading') {
              return;
            }
            courseQuery.fetch(formState);
          }}
        />
      </form>

      <div className="flex flex-col gap-4">
        {isError && <p>{labels.ERROR}...</p>}
        {isSuccess && !courses?.length && <p>{labels.NO_RECORDS_FOUND}</p>}

        {courses?.map((course) => {
          const lectures = course.classes.filter((c) => c.type === 'lecture');
          const practices = course.classes.filter((c) => c.type === 'practice');

          return (
            <div className="card" key={course.code}>
              <div className="card-body rounded-md bg-base-200">
                <h2 className="card-title">
                  {course.name} ({course.code})
                </h2>

                {lectures.length > 0 && (
                  <>
                    <h2 className="card-title">
                      {lectures.length > 1 ? labels.LECTURES : labels.LECTURE}
                    </h2>
                    <div>
                      {lectures.map((classItem) => (
                        <ClassCard
                          key={
                            classItem.code +
                            classItem.time +
                            classItem.instructor
                          }
                          classItem={classItem}
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
                      {practices.map((classItem) => (
                        <ClassCard
                          key={
                            classItem.code +
                            classItem.time +
                            classItem.instructor
                          }
                          classItem={classItem}
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

function ClassCard({ classItem }: { classItem: Class }) {
  const { labels } = useLabel();
  const [code, _] = classItem.code.split(' ');
  const classNumber =
    classItem.type === 'practice' &&
    code.split('-')[code.split('-').length - 1];

  return (
    <div className="rounded-md bg-base-100 p-3">
      <h2 className="text-lg font-bold">
        {classItem.type === 'lecture'
          ? labels.LECTURE
          : `${labels.PRACTICE} ${classNumber}.`}
      </h2>
      <div className="grid gap-x-3 [grid-template-columns:auto_1fr]">
        <span className="font-bold">{labels.CODE}:</span>
        <span>{code}</span>

        <span className="font-bold">{labels.INSTRUCTOR}:</span>
        <span>{classItem.instructor}</span>

        <span className="font-bold">{labels.TIME}:</span>
        <span>{classItem.time}</span>

        <span className="font-bold">{labels.PLACE}:</span>
        <span>{classItem.place}</span>

        <span className="font-bold">{labels.CAPACITY}:</span>
        <span>{classItem.capacity}</span>
      </div>
    </div>
  );
}

const year = new Date().getFullYear();
const semesters: string[] = Array.from(
  { length: 6 },
  (_, i) =>
    `${year - Math.round(i / 2)}-${year + 1 - Math.round(i / 2)}-${(i % 2) + 1}`, // 🤮
);

type SearchModes =
  | 'keresnevre'
  | 'keres_kod_azon'
  | 'keres_okt'
  | 'keres_oktnk';

type QueryOptions = {
  term: string;
  mode: SearchModes;
  semester: string;
};

type Course = {
  code: string;
  name: string;
  classes: Class[];
};

type Class = {
  time: string;
  code: string;
  instructor: string;
  place: string;
  capacity: number;
  type: 'lecture' | 'practice';
};

type ClassRow = {
  time: string;
  code: string;
  name: string;
  place: string;
  capacity: number;
  instructor: string;
  numberOfClasses: string;
};

const COURSE_TYPE_MAP = {
  '(előadás)': 'lecture',
  '(lecture)': 'lecture',
  '(gyakorlat)': 'practice',
  '(practice)': 'practice',
} as const;

async function fetchCourses(queryOptions: QueryOptions): Promise<Course[]> {
  const query = new URLSearchParams(queryOptions);
  const url = `/api/class?${query.toString()}`;

  const res = await fetch(url);
  const classRows: ClassRow[] = await res.json();

  return groupClassesIntoCourses(classRows);
}

function groupClassesIntoCourses(classRows: ClassRow[]): Course[] {
  const courses = new Map<string, Course>();

  classRows.forEach((row) => {
    const [code, type] = row.code.split(' ');

    const split = code.split('-');
    split.pop();
    const courseCode = split.join('-');

    let course = courses.get(courseCode);
    if (!course) {
      courses.set(courseCode, {
        code: courseCode,
        name: row.name,
        classes: [],
      });
    }
    course = courses.get(courseCode)!;

    const mappedType = COURSE_TYPE_MAP[type as keyof typeof COURSE_TYPE_MAP];
    if (!mappedType) {
      return;
    }

    const classItem: Class = {
      code: row.code,
      instructor: row.instructor,
      time: row.time,
      place: row.place,
      capacity: row.capacity,
      type: mappedType,
    };

    course.classes.push(classItem);
  });

  return Array.from(courses.values()).filter(
    (course) => course.classes.length > 0,
  );
}
