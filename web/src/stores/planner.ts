import {
  Course,
  Filter,
  SolverRequest,
  Subject,
} from '@/contexts/subjects/subjects-context';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

type Results = {
  input: SolverRequest;
  output: Subject[];
};

type PlannerState = {
  savedSubjects: Subject[];
  results: Results;
  filters: Filter[];
  calendarSettings: {
    slotDuration: number;
  };
  addSubject: (subject: Subject) => void;
  setResults: (results: Results) => void;
  addFilter: (filter: Filter) => void;
  removeFilter: (filter: Filter) => void;
  removeSubject: (subject: Subject) => void;
  updateSubject: (
    subject: { code: Subject['code'] } & Partial<Subject>,
  ) => void;
  updateCourse: (course: { id: Course['id'] } & Partial<Course>) => void;
  createCourse: (subjectCode: Subject['code'], course: Course) => void;
  removeCourse: (subjectCode: Subject['code'], courseId: Course['id']) => void;
  setSlotDuration: (slotDuration: number) => void;
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      savedSubjects: [],
      results: {
        input: {
          subjects: [],
          filters: [],
        },
        output: [],
      },
      filters: [],
      calendarSettings: {
        slotDuration: 30,
        weekends: false,
      },
      addSubject: (subject) => {
        set((state) => {
          const codeExists = state.savedSubjects.find(
            (s) => s.code === subject.code,
          );
          if (codeExists) {
            return state;
          }
          return {
            ...state,
            savedSubjects: [...state.savedSubjects, subject],
          };
        });
      },
      addFilter: (filter) => {
        set((state) => ({
          ...state,
          filters: [...state.filters, filter],
        }));
      },
      // TODO: maybe use an id to identify filters
      removeFilter: (filter) => {
        set((state) => ({
          ...state,
          filters: state.filters.filter(
            (f) =>
              f.time.day !== filter.time.day ||
              f.time.start !== filter.time.start ||
              f.time.end !== filter.time.end,
          ),
        }));
      },
      setResults: (results) => {
        set((state) => ({
          ...state,
          results,
        }));
      },
      removeSubject: (subject) => {
        set((state) => ({
          ...state,
          savedSubjects: state.savedSubjects.filter(
            (s) => s.code !== subject.code,
          ),
        }));
      },
      updateSubject: (subject) => {
        set((state) => ({
          ...state,
          savedSubjects: state.savedSubjects.map((s) =>
            s.code === subject.code
              ? {
                  ...s,
                  ...subject,
                }
              : s,
          ),
        }));
      },
      updateCourse: (course) => {
        set((state) => ({
          ...state,
          savedSubjects: state.savedSubjects.map((s) => ({
            ...s,
            courses: s.courses.map((c) =>
              c.id === course.id
                ? {
                    ...c,
                    ...course,
                  }
                : c,
            ),
          })),
        }));
      },
      removeCourse: (subjectCode, courseId) => {
        set((state) => ({
          ...state,
          savedSubjects: state.savedSubjects.map((s) =>
            s.code === subjectCode
              ? {
                  ...s,
                  courses: s.courses.filter((c) => c.id !== courseId),
                }
              : s,
          ),
        }));
      },
      createCourse: (subjectCode, course) => {
        set((state) => {
          state.savedSubjects
            .find((s) => s.code === subjectCode)
            ?.courses.push(course);

          return { ...state };
        });
      },
      setSlotDuration: (slotDuration) => {
        set((state) => ({
          ...state,
          calendarSettings: {
            ...state.calendarSettings,
            // clamp between 10 and 40
            slotDuration: Math.min(Math.max(slotDuration, 10), 40),
          },
        }));
      },
    }),
    {
      name: 'planner-storage',
      migrate: (_prevState, _version) => {
        console.info('Migrating `planner-storage`.');
        // TODO: maybe validate with zod
        const prevState = _prevState as PlannerState;

        if (Array.isArray(prevState.savedSubjects)) {
          prevState.savedSubjects = prevState.savedSubjects.map((s) => ({
            ...s,
            origin: s.origin ?? 'elte',
            courses: s.courses.map((c: Course) => ({
              ...c,
              id: uuid(),
              fix: c.fix ?? false,
              allowOverlap: c.allowOverlap ?? false,
            })),
          }));
        }

        if (
          !prevState.results ||
          !prevState.results?.output ||
          !prevState.results?.input?.subjects ||
          !prevState.results?.input?.filters
        ) {
          prevState.results = {
            input: {
              subjects: [],
              filters: [],
            },
            output: [],
          };
        }

        return prevState;
      },
      version: 0.4,
    },
  ),
);
