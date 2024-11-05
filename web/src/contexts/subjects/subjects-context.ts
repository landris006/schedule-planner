import { useQuery } from '@/utils';
import { createContext, useContext } from 'react';

export type QueryOptions = {
  term: string;
  mode: SearchModes;
  semester: string;
};

export type SearchModes =
  | 'keresnevre'
  | 'keres_kod_azon'
  | 'keres_okt'
  | 'keres_oktnk';

export type Subject = {
  code: string;
  name: string;
  courses: Course[];
};

export type Course = {
  time?: Time;
  code: string;
  instructor: string;
  place: string;
  capacity: number;
  type: 'lecture' | 'practice';
};

export type Time = {
  start: number;
  end: number;
  day: number;
};

type SubjectsContextType = {
  subjectsQuery: ReturnType<typeof useQuery<Subject[], QueryOptions>>;
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
