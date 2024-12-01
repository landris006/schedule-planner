import Button from '@/components/button';
import Calendar from '@/components/calendar';
import { useLabel } from '@/contexts/label/label-context';
import { Subject } from '@/contexts/subjects/subjects-context';
import { usePlannerStore } from '@/stores/planner';
import { floatToHHMM, useQuery } from '@/utils';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

async function callSolver(queryOptions: Subject[]) {
  return fetch('/api/solver', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(queryOptions),
  }).then((res) => res.json());
}

export default function Planner() {
  const navigate = useNavigate();
  const { savedSubjects, setResults, calendarSettings, setSlotDuration } =
    usePlannerStore();
  const { labels } = useLabel();
  const solverQuery = useQuery<Subject[], Subject[]>({
    fetcher: callSolver,
    onSuccess: (data) => {
      setResults(data);
      navigate('/results');
    },
  });

  const [earliestStartTime, latestEndTime] = useMemo(() => {
    const earliestStartTime = savedSubjects.reduce(
      (acc, subject) =>
        Math.min(
          acc,
          subject.courses.reduce(
            (acc, course) => Math.min(acc, course.time?.start ?? 0),
            Infinity,
          ),
        ),
      Infinity,
    );
    const latestEndTime = savedSubjects.reduce(
      (acc, subject) =>
        Math.max(
          acc,
          subject.courses.reduce(
            (acc, course) => Math.max(acc, course.time?.end ?? Infinity),
            -Infinity,
          ),
        ),
      -Infinity,
    );

    return [earliestStartTime, latestEndTime];
  }, [savedSubjects]);

  return (
    <div className="p-3">
      <div className="mx-auto max-w-7xl flex-1 overflow-x-auto">
        <div className="flex justify-between">
          <h1 className="text-3xl">{labels.PLANNER}</h1>

          <Button
            label="Solver"
            className="btn-primary"
            icon={<MagnifyingGlassIcon width={20} height={20} />}
            isLoading={solverQuery.isLoading}
            onClick={() => {
              solverQuery.fetch(savedSubjects);
            }}
          />
        </div>
        <div className="min-w-[800px]">
          <Calendar
            slotMinTime={floatToHHMM(
              earliestStartTime === Infinity ? 0 : earliestStartTime - 2,
            )}
            slotMaxTime={floatToHHMM(
              latestEndTime === -Infinity ? 24 : latestEndTime + 2,
            )}
            slotDuration={`00:${calendarSettings.slotDuration}:00`}
            events={savedSubjects.flatMap((subject) =>
              subject.courses
                .filter((c) => c.time)
                .map((course) => ({
                  title: subject.name + ' ' + course.code,
                  daysOfWeek: [course.time!.day],
                  startTime: floatToHHMM(course.time!.start),
                  duration: floatToHHMM(course.time!.end - course.time!.start),
                  color: '#007bff',
                })),
            )}
          />
          <label htmlFor="slotDuration">Beosztásköz</label>
          <br />
          <input
            type="range"
            value={calendarSettings.slotDuration}
            onChange={(e) => setSlotDuration(parseInt(e.target.value))}
            min={10}
            step={5}
            max={40}
            className="range range-xs w-[30%]"
          />
          {calendarSettings.slotDuration}
        </div>
      </div>
    </div>
  );
}
