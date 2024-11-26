import { useQuery } from '@/utils';
import { Dispatch, SetStateAction, createContext, useContext } from 'react';

export type QueryOptions = {
  term: string;
  mode: (typeof SEARCH_MODES)[number];
  semester: string;
};

export const SEARCH_MODES = [
  'keresnevre',
  'keres_kod_azon',
  'keres_okt',
  'keres_oktnk',
] as const;

const year = new Date().getFullYear();
export const SEMESTERS: string[] = Array.from(
  { length: 6 },
  (_, i) =>
    `${year - Math.round(i / 2)}-${year + 1 - Math.round(i / 2)}-${(i % 2) + 1}`, // 🤮
);

export type Subject = {
  code: string;
  name: string;
  courses: Course[];
};

export enum CourseType {
  Lecture = 0,
  Practice = 1,
}

export type Course = {
  time?: Time;
  code: string;
  instructor: string;
  place: string;
  capacity: number;
  type: CourseType;
};

export type Time = {
  start: number;
  end: number;
  day: number;
};

type SubjectsContextType = {
  subjectsQuery: ReturnType<typeof useQuery<Subject[], QueryOptions>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  searchMode: (typeof SEARCH_MODES)[number];
  setSearchMode: (value: (typeof SEARCH_MODES)[number]) => void;
  semester: (typeof SEMESTERS)[number];
  setSemester: (value: (typeof SEMESTERS)[number]) => void;
};

export const SubjectsContext = createContext<SubjectsContextType | undefined>(
  undefined,
);

export function useSubjects() {
  const context = useContext(SubjectsContext);

  if (!context) {
    throw new Error('useLabel must be used within a SubjectsProvider');
  }
  return context;
}
