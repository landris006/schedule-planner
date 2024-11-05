import { Subject } from '@/contexts/subjects/subjects-context';
import { create } from 'zustand';

type PlannerState = {
  courses: Subject[];
  saveCourse: (subject: Subject) => void;
};

export const usePlannerStore = create<PlannerState>((set) => ({
  courses: [],
  saveCourse: (subject) => {
    set((state) => ({
      courses: [...state.courses, subject],
    }));
  },
}));
