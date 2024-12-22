import {
  Course,
  QueryOptions,
  SEMESTERS,
  SEARCH_MODES,
  Subject,
  SubjectsContext,
  Time,
  CourseType,
} from '@/contexts/subjects/subjects-context';
import { hhmmToFloat, useQuery } from '@/utils';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect } from 'react';

export default function SubjectsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const subjectsQuery = useQuery({
    fetcher: (opts: QueryOptions) => scrapeCouses(opts).then(parseSubjects),
  });

  const [forceSearch, setForceSearch] = useQueryState<boolean>('f', {
    parse: (value) => value === 'true',
    defaultValue: false,
    clearOnDefault: true,
  });
  const [searchTerm, setSearchTerm] = useQueryState('q', { defaultValue: '' });
  const [searchMode, setSearchMode] = useQueryState<
    (typeof SEARCH_MODES)[number]
  >('mode', {
    parse: (value) => SEARCH_MODES.find((v) => v === value) ?? SEARCH_MODES[0],
    defaultValue: 'keresnevre',
  });
  const [semester, setSemester] = useQueryState<(typeof SEMESTERS)[number]>(
    'semester',
    {
      defaultValue: SEMESTERS[0],
      parse: (value) => SEMESTERS.find((v) => v === value) ?? SEMESTERS[0],
    },
  );

  const search = useCallback(() => {
    subjectsQuery.fetch({
      term: searchTerm,
      mode: searchMode,
      semester: semester,
    });
  }, [searchTerm, searchMode, semester, subjectsQuery]);

  useEffect(() => {
    if (forceSearch) {
      search();
      setForceSearch(false);
    }
  }, [forceSearch, search, setForceSearch]);

  return (
    <SubjectsContext.Provider
      value={{
        subjectsQuery,
        searchTerm,
        setSearchTerm,
        searchMode: searchMode,
        setSearchMode: (value: (typeof SEARCH_MODES)[number]) =>
          SEARCH_MODES.find((v) => v === value)
            ? setSearchMode(value)
            : setSearchMode(SEARCH_MODES[0]),
        semester: semester,
        setSemester: (value: (typeof SEMESTERS)[number]) =>
          SEMESTERS.find((v) => v === value)
            ? setSemester(value)
            : setSemester(SEMESTERS[0]),
        search,
      }}
    >
      {children}
    </SubjectsContext.Provider>
  );
}

const COURSE_TYPE_MAP = {
  '(előadás)': CourseType.Lecture,
  '(lecture)': CourseType.Lecture,
  '(gyakorlat)': CourseType.Practice,
  '(practice)': CourseType.Practice,
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
    if (mappedType === undefined) {
      return;
    }

    const time = parseTime(timeString) ?? {};

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

  const subjectsArray = Array.from(subjects.values());
  subjectsArray.forEach((subject) => {
    subject.courses.sort((a, b) =>
      JSON.stringify(a).localeCompare(JSON.stringify(b)),
    );
  });

  return subjectsArray.filter((course) => course.courses.length > 0);
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
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Vasárnap: 0,
  Hétfő: 1,
  Kedd: 2,
  Szerda: 3,
  Csütörtök: 4,
  Péntek: 5,
  Szombat: 6,
};
