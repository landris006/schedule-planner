import { Subject } from '@/pages/subjects';
import { create } from 'zustand';

type PlannerState = {
  courses: Subject[];
  saveCourse: (course: Subject) => void;
};

export const usePlannerStore = create<PlannerState>((set) => ({
  courses: [],
  saveCourse: (course) => {
    set((state) => ({
      courses: [...state.courses, course],
    }));
  },
}));
