import { useRef, useState } from 'react';
import { cn, useQuery } from './utils';

export default function App() {
  const {
    data: courses,
    fetch,
    isLoading,
    isError,
    isSuccess,
  } = useQuery({
    fetcher: fetchCourses,
  });

  const [formState, setFormState] = useState<QueryOptions>({
    name: '',
    mode: 'course',
  });

  const input = useRef<HTMLInputElement>(null);

  return (
    <main className="flex flex-col items-center">
      <div className="card-body">
        <label htmlFor="name">Mode</label>
        <select
          className="select select-bordered w-full max-w-xs"
          value={formState.mode}
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              mode: e.target.value as (typeof SEARCH_MODES)[number],
            }))
          }
        >
          {SEARCH_MODES.map((mode) => (
            <option value={mode} key={mode}>
              {mode}
            </option>
          ))}
        </select>

        <label htmlFor="name">Course Name</label>

        <input
          ref={input}
          value={formState.name}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, name: e.target.value }))
          }
          id="name"
          className="input input-bordered"
          type="text"
        />

        <button
          className={cn('btn btn-primary', {
            'btn-disabled': !formState.name,
          })}
          onClick={() => {
            fetch(formState);
          }}
        >
          Search
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {isSuccess && !courses?.length && <p>No courses found</p>}
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error loading courses...</p>}

        {courses?.map((course) => (
          <div className="card" key={course.code}>
            <div className="card-body rounded-md bg-base-200">
              <h2 className="card-title">{course.name}</h2>
              <h2 className="card-title">Classes:</h2>

              <div className="flex flex-col gap-1">
                {course.classes.map((classItem) => (
                  <div
                    key={classItem.code}
                    className="rounded-md bg-base-100 p-3"
                  >
                    <h2 className="text-lg font-bold">{classItem.type}</h2>
                    <p>Code: {classItem.code.split(' ')[0]}</p>
                    <p>Instructor: {classItem.instructor}</p>
                    <p>Time: {classItem.time}</p>
                    <p>Place: {classItem.place}</p>
                    <p>Capacity: {classItem.capacity}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const SEARCH_MODES = ['course', 'instructor'] as const;
type QueryOptions = {
  name: string;
  mode: (typeof SEARCH_MODES)[number];
};

type Course = {
  code: string;
  name: string;
  classes: Class[];
};

type Class = {
  code: string;
  instructor: string;
  time: string;
  place: string;
  capacity: number;
  type: string;
};

async function fetchCourses(queryOptions: QueryOptions): Promise<Course[]> {
  const query = new URLSearchParams(queryOptions);
  const url = `/api/courses?${query.toString()}`;

  const res = await fetch(url);

  return res.json();
}
