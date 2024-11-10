import { Subject } from '@/contexts/subjects/subjects-context';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type PlannerState = {
  subjects: Subject[];
  addSubject: (subject: Subject) => void;
  removeSubject: (subject: Subject) => void;
  calendarSettings: {
    slotDuration: number;
  };
  setSlotDuration: (slotDuration: number) => void;
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      calendarSettings: {
        slotDuration: 30,
      },
      subjects: [],
      addSubject: (subject) => {
        set((state) => ({
          ...state,
          subjects: [...state.subjects, subject],
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
