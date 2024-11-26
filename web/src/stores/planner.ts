import { Subject } from '@/contexts/subjects/subjects-context';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type PlannerState = {
  subjects: Subject[];
  results: Subject[];
  calendarSettings: {
    slotDuration: number;
  };
  addSubject: (subject: Subject) => void;
  setResults: (results: Subject[]) => void;
  removeSubject: (subject: Subject) => void;
  setSlotDuration: (slotDuration: number) => void;
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      subjects: [],
      results: [],
      calendarSettings: {
        slotDuration: 30,
      },
      addSubject: (subject) => {
        set((state) => ({
          ...state,
          subjects: [...state.subjects, subject],
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
          subjects: state.subjects.filter((s) => s.code !== subject.code),
        }));
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
    },
  ),
);
