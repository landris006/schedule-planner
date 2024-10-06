import { useRef, useState } from 'react';
import { cn, useQuery } from './utils';

export default function App() {
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

  return (
    <main className="flex flex-col items-center">
      <form className="card-body">
        <div className="flex gap-2">
          <div className="flex flex-col">
            <label htmlFor="name">Semester</label>
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
            <label htmlFor="name">Mode</label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={formState.mode}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  mode: e.target
                    .value as (typeof SEARCH_MODE_OPTIONS)[number]['value'],
                }))
              }
            >
              {SEARCH_MODE_OPTIONS.map((mode) => (
                <option value={mode.value} key={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="name">Search term</label>

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

        <button
          className={cn('btn btn-primary', {
            'btn-disabled': !formState.term,
          })}
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            courseQuery.fetch(formState);
          }}
        >
          Search
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error loading courses...</p>}
        {isSuccess && !courses?.length && <p>No courses found</p>}

        {courses?.map((course) => (
          <div className="card" key={course.code}>
            <div className="card-body rounded-md bg-base-200">
              <h2 className="card-title">
                {course.name} ({course.code})
              </h2>

              {course.lecture && (
                <>
                  <h2 className="card-title">Lecture:</h2>

                  <ClassCard classItem={course.lecture} />
                </>
              )}

              {course.practices.length > 0 && (
                <>
                  <h2 className="card-title">Practices:</h2>
                  <div className="flex flex-col gap-1">
                    {course.practices.map((classItem) => (
                      <ClassCard
                        key={
                          classItem.code + classItem.time + classItem.instructor
                        }
                        classItem={classItem}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function ClassCard({ classItem }: { classItem: Class }) {
  const [code, _] = classItem.code.split(' ');
  const classNumber =
    classItem.type === 'practice' &&
    code.split('-')[code.split('-').length - 1];

  return (
    <div className="rounded-md bg-base-100 p-3">
      <h2 className="text-lg font-bold">
        {classItem.type === 'lecture' ? 'Lecture' : `Practice ${classNumber}.`}
      </h2>
      <div className="grid gap-x-3 [grid-template-columns:auto_1fr]">
        <span className="font-bold">Code:</span>
        <span>{code}</span>

        <span className="font-bold">Instructor:</span>
        <span>{classItem.instructor}</span>

        <span className="font-bold">Time:</span>
        <span>{classItem.time}</span>

        <span className="font-bold">Place:</span>
        <span>{classItem.place}</span>

        <span className="font-bold">Capacity:</span>
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

const SEARCH_MODE_OPTIONS = [
  {
    label: 'Course name',
    value: 'keresnevre',
  },
  {
    label: 'Course code',
    value: 'keres_kod_azon',
  },
  {
    label: 'Instructor name',
    value: 'keres_okt',
  },
  {
    label: 'Instructor code',
    value: 'keres_oktnk',
  },
] as const;

type QueryOptions = {
  term: string;
  mode: (typeof SEARCH_MODE_OPTIONS)[number]['value'];
  semester: string;
};

type Course = {
  code: string;
  name: string;
  lecture: Class | undefined;
  practices: Class[];
};

type Class = {
  time: string;
  code: string;
  instructor: string;
  place: string;
  capacity: number;
  type: 'lecture' | 'practice' | 'unknown';
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

const typeMap = {
  '(előadás)': 'lecture',
  '(gyakorlat)': 'practice',
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
        lecture: undefined,
        practices: [],
      });
    }
    course = courses.get(courseCode)!;

    const classItem: Class = {
      code: row.code,
      instructor: row.instructor,
      time: row.time,
      place: row.place,
      capacity: row.capacity,
      type: typeMap[type as keyof typeof typeMap] ?? 'unknown',
    };

    if (type === '(előadás)') {
      course.lecture = classItem;
    }
    if (type === '(gyakorlat)') {
      course.practices.push(classItem);
    }
  });

  return Array.from(courses.values());
}
