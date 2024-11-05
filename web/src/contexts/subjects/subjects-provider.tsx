import {
  Course,
  QueryOptions,
  Subject,
  SubjectsContext,
  Time,
} from '@/contexts/subjects/subjects-context';
import { useQuery } from '@/utils';

export default function SubjectsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const subjectsQuery = useQuery({
    fetcher: (opts: QueryOptions) => scrapeCouses(opts).then(parseSubjects),
  });
  return (
    <SubjectsContext.Provider
      value={{
        subjectsQuery,
      }}
    >
      {children}
    </SubjectsContext.Provider>
  );
}

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

function hhmmToFloat(hhmm: string) {
  const [hour, minute] = hhmm.split(':');
  return parseFloat(hour) + parseFloat(minute) / 60;
}
