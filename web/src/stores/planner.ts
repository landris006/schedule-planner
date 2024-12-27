import { Course, Filter, Subject } from '@/contexts/subjects/subjects-context';
import { generateColor } from '@/utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type PlannerState = {
  savedSubjects: Subject[];
  results: Subject[];
  filters: Filter[];
  calendarSettings: {
    slotDuration: number;
  };
  addSubject: (subject: Subject) => void;
  setResults: (results: Subject[]) => void;
  addFilter: (filter: Filter) => void;
  removeFilter: (filter: Filter) => void;
  removeSubject: (subject: Subject) => void;
  updateSubject: (
    subject: { code: Subject['code'] } & Partial<Subject>,
  ) => void;
  updateCourse: (course: { code: Course['code'] } & Partial<Course>) => void;
  createCourse: (subjectCode: Subject['code'], course: Course) => void;
  setSlotDuration: (slotDuration: number) => void;
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      savedSubjects: [],
      results: [],
      filters: [],
      calendarSettings: {
        slotDuration: 30,
      },
      addSubject: (subject) => {
        set((state) => ({
          ...state,
          savedSubjects: [
            ...state.savedSubjects,
            {
              ...subject,
              color: generateColor(subject.code + subject.name),
            },
          ],
        }));
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
              c.code === course.code
                ? {
                    ...c,
                    ...course,
                  }
                : c,
            ),
          })),
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
      version: 0,
    },
  ),
);
