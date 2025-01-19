import {
  Course,
  Filter,
  SolverRequest,
  Subject,
} from '@/contexts/subjects/subjects-context';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Time } from '@/time';

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
              f.slot.day !== filter.slot.day ||
              f.slot.start !== filter.slot.start ||
              f.slot.end !== filter.slot.end,
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
      storage: createJSONStorage(() => localStorage, {
        reviver: (_key, value) => {
          //@ts-expect-error value is an object
          if (value?.type === 'time') {
            //@ts-expect-error see replacer
            return Time.fromMinutes(value.value);
          }

          return value;
        },
        replacer: (_key, value) => {
          if (value instanceof Time) {
            return { type: 'time', value: value.minutes };
          }
          return value;
        },
      }),
      version: 0.1,
    },
  ),
);
