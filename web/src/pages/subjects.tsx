import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@/utils';
import Button from '@/components/button';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useLabel } from '@/contexts/label/label-context';

export default function Subjects() {
  const { labels } = useLabel();
  const {
    data: subjects,
    isLoading,
    isError,
    isSuccess,
    ...courseQuery
  } = useQuery({
    fetcher: (opts: QueryOptions) => scrapeCouses(opts).then(parseSubjects),
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
        {isSuccess && !subjects?.length && <p>{labels.NO_RECORDS_FOUND}</p>}

        {subjects?.map((course) => {
          const lectures = course.courses.filter((c) => c.type === 'lecture');
          const practices = course.courses.filter((c) => c.type === 'practice');

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
    labels.MONDAY,
    labels.TUESDAY,
    labels.WEDNESDAY,
    labels.THURSDAY,
    labels.FRIDAY,
    labels.SATURDAY,
    labels.SUNDAY,
  ];

  const [code, _] = course.code.split(' ');
  const classNumber =
    course.type === 'practice' && code.split('-')[code.split('-').length - 1];

  return (
    <div className="rounded-md bg-base-100 p-3">
      <h2 className="text-lg font-bold">
        {course.type === 'lecture'
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

export type Subject = {
  code: string;
  name: string;
  courses: Course[];
};

type Course = {
  time?: Time;
  code: string;
  instructor: string;
  place: string;
  capacity: number;
  type: 'lecture' | 'practice';
};

type Time = {
  start: number;
  end: number;
  day: number;
};

const COURSE_TYPE_MAP = {
  '(előadás)': 'lecture',
  '(lecture)': 'lecture',
  '(gyakorlat)': 'practice',
  '(practice)': 'practice',
} as const;

async function scrapeCouses(queryOptions: QueryOptions): Promise<string> {
  const query = new URLSearchParams({
    m: queryOptions.mode,
    k: queryOptions.term,
    f: queryOptions.semester,
  });
  const req = new Request(`/tanrendnavigation?${query.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'text/html',
    },
  });

  return fetch(req).then((res) => res.text());
}

function parseSubjects(htmlString: string) {
  const subjects = new Map<string, Subject>();

  const doc = new DOMParser().parseFromString(htmlString, 'text/html');

  const rows = doc.querySelectorAll('tr');
  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('td')).map((cell) =>
      cell.textContent?.trim(),
    );
    if (!cells.length) {
      return;
    }

    if (cells.some((cell) => cell === '' || cell === undefined)) {
      return;
    }
    const [
      timeString,
      _code,
      name,
      place,
      capacity,
      instructor,
      _numberOfClasses,
    ] = cells as string[]; // cast is only valid because we checked (`cells.some(...)`)

    const [code, type] = _code.split(' ');

    const split = code.split('-');
    split.pop();
    const subjectCode = split.join('-');

    let subject = subjects.get(subjectCode);
    if (!subject) {
      subjects.set(subjectCode, {
        code: subjectCode,
        name: name,
        courses: [],
      });
    }
    subject = subjects.get(subjectCode)!;

    const mappedType = COURSE_TYPE_MAP[type as keyof typeof COURSE_TYPE_MAP];
    if (!mappedType) {
      return;
    }

    const time = parseTime(timeString);

    const course: Course = {
      code: code,
      instructor,
      time,
      place,
      capacity: parseInt(capacity),
      type: mappedType,
    };

    const alreadyExists = subject.courses.find(
      // the courses that we are checking are constructed the same way (same order of keys) so this comparison should be fine
      (c) => JSON.stringify(c) === JSON.stringify(course),
    );

    if (!alreadyExists) {
      subject.courses.push(course);
    }
  });

  return Array.from(subjects.values()).filter(
    (course) => course.courses.length > 0,
  );
}

const DAY_MAP = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
  Hétfő: 0,
  Kedd: 1,
  Szerda: 2,
  Csütörtök: 3,
  Péntek: 4,
  Szombat: 5,
  Vasárnap: 6,
};

function parseTime(timeString: string): Time | undefined {
  try {
    const [day, duration] = timeString.split(' ');

    const time: Time = {
      day: DAY_MAP[day as keyof typeof DAY_MAP],
      start: hhmmToFloat(duration.split('-')[0]),
      end: hhmmToFloat(duration.split('-')[1]),
    };

    return time;
  } catch (_e) {
    return undefined;
  }
}

function hhmmToFloat(hhmm: string) {
  const [hour, minute] = hhmm.split(':');
  return parseFloat(hour) + parseFloat(minute) / 60;
}

function floatToHHMM(float: number) {
  const hour = Math.floor(float);
  const minute = Math.floor((float - hour) * 60);
  return `${hour}:${minute.toString().padStart(2, '0')}`;
}
