import { Time } from '@/time';
import { generateSemesters, useQuery } from '@/utils';
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

export const SEMESTERS: string[] = generateSemesters();

export type SolverRequest = {
  subjects: Subject[];
  filters: Filter[];
};

export type Subject = {
  code: string;
  name: string;
  courses: Course[];
  origin: 'elte' | 'custom';
  color?: string;
  credits?: number;
  hidden?: boolean;
};

export type Filter = {
  slot: TimeSlot;
};

export enum CourseType {
  Lecture = 0,
  Practice = 1,
}

export type Course = {
  id: string;
  slot: TimeSlot;
  code: string;
  instructor: string;
  place: string;
  capacity: number;
  type: CourseType;
  fix: boolean;
  allowOverlap: boolean;
};

export type TimeSlot = {
  start: Time | null;
  end: Time | null;
  day: number | null;
};

type SubjectsContextType = {
  subjectsQuery: ReturnType<typeof useQuery<Subject[], QueryOptions>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  searchMode: (typeof SEARCH_MODES)[number];
  setSearchMode: (value: (typeof SEARCH_MODES)[number]) => void;
  semester: (typeof SEMESTERS)[number];
  setSemester: (value: (typeof SEMESTERS)[number]) => void;
  search: () => void;
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
