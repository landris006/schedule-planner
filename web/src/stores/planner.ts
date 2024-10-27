import { Course } from '@/pages/courses';
import { create } from 'zustand';

type PlannerState = {
  courses: Course[];
  saveCourse: (course: Course) => void;
};

export const usePlannerStore = create<PlannerState>((set) => ({
  courses: [],
  saveCourse: (course) => {
    set((state) => ({
      courses: [...state.courses, course],
    }));
  },
}));
