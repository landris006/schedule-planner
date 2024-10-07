export const localeOptions = ['hu', 'en'] as const;
export type Locale = (typeof localeOptions)[number];

export const labels = {
  CONFIRM: {
    hu: 'Rendben',
    en: 'Confirm',
  },
  SELECT: {
    hu: 'Válasszon',
    en: 'Select',
  },
  SEARCH: {
    hu: 'Keresés',
    en: 'Search',
  },
  CREATE: {
    hu: 'Létrehozás',
    en: 'Create',
  },
  LOADING: {
    hu: 'Betöltés',
    en: 'Loading',
  },
  CANCEL: {
    hu: 'Mégse',
    en: 'Cancel',
  },
  UPDATE: {
    hu: 'Frissítés',
    en: 'Update',
  },
  ERROR: {
    hu: 'Hiba',
    en: 'Error',
  },
  CAPACITY: {
    hu: 'Kapacitás',
    en: 'Capacity',
  },
  PREFERENCES: {
    hu: 'Preferenciák',
    en: 'Preferences',
  },
  RANK: {
    hu: 'Rang',
    en: 'Rank',
  },
  TITLE: {
    hu: 'Cím',
    en: 'Title',
  },
  DESCRIPTION: {
    hu: 'Leírás',
    en: 'Description',
  },
  TYPE: {
    hu: 'Típus',
    en: 'Type',
  },
  INSTRUCTOR: {
    hu: 'Oktató',
    en: 'Instructor',
  },
  INSTRUCTORS: {
    hu: 'Oktatók',
    en: 'Instructors',
  },
  SAVE: {
    hu: 'Mentés',
    en: 'Save',
  },
  SAVING: {
    hu: 'Mentés',
    en: 'Saving',
  },
  SAVED: {
    hu: 'Mentve',
    en: 'Saved',
  },
  CONFIGURE_WEIGHTS: {
    hu: 'Súlyok konfigurálása',
    en: 'Configure weights',
  },
  NO_RECORDS_FOUND: {
    hu: 'Nincsenek találatok',
    en: 'No records found',
  },
  ALL: {
    hu: 'Összes',
    en: 'All',
  },
  NORMAL: {
    hu: 'Normál',
    en: 'Normal',
  },
  CLEAR_FILTERS: {
    hu: 'Szűrők törlése',
    en: 'Clear filters',
  },
  DETAILS: {
    hu: 'Részletek',
    en: 'Details',
  },
  CLOSE: {
    hu: 'Bezár',
    en: 'Close',
  },
  MOVE_UP: {
    hu: 'Mozgatás fel',
    en: 'Move up',
  },
  MOVE_DOWN: {
    hu: 'Mozgatás le',
    en: 'Move down',
  },
  WEIGHT: {
    hu: 'Súly',
    en: 'Weight',
  },
  WEIGHTS: {
    hu: 'Súlyok',
    en: 'Weights',
  },
  STUDENTS: {
    hu: 'Hallgatók',
    en: 'Students',
  },
  EDIT: {
    hu: 'Szerkesztés',
    en: 'Edit',
  },
  DELETE: {
    hu: 'Törlés',
    en: 'Delete',
  },
  EMAIL: {
    hu: 'Email',
    en: 'Email',
  },
  NAME: {
    hu: 'Név',
    en: 'Name',
  },
  INTERNAL_SERVER_ERROR: {
    hu: 'Szerver hiba',
    en: 'Internal server error',
  },
  UNKNOWN_FILE_TYPE: {
    hu: 'Ismeretlen fájltípus',
    en: 'Unknown file type',
  },
  UNAUTHORIZED_REQUEST: {
    hu: 'Hozzáférés megtagadva',
    en: 'Unauthorized request',
  },
  UNPROCESSABLE_ENTITY: {
    hu: 'Hibás kérés',
    en: 'Unprocessable request',
  },
  COURSE: {
    hu: 'Tantárgy',
    en: 'Course',
  },
  COURSES: {
    hu: 'Tantárgyak',
    en: 'Courses',
  },
  PLANNER: {
    hu: 'Tervező',
    en: 'Planner',
  },
  CLASS: {
    hu: 'Óra',
    en: 'Class',
  },
  SEMESTER: {
    hu: 'Szemeszter',
    en: 'Semester',
  },
  MODE: {
    hu: 'Mód',
    en: 'Mode',
  },
  SEARCH_TERM: {
    hu: 'Keresési kifejezés',
    en: 'Search term',
  },
  CREDITS: {
    hu: 'Kreditek',
    en: 'Credits',
  },
  SOLVER: {
    hu: 'Solver',
    en: 'Solver',
  },
  RUN_SOLVER: {
    hu: 'Solver futtatása',
    en: 'Run solver',
  },
  LANGUAGE: {
    hu: 'Nyelv',
    en: 'Language',
  },
  NOT_SPECIFIED: {
    hu: 'Nincs megadva',
    en: 'Not specified',
  },
  MIN: {
    hu: 'Min',
    en: 'Min',
  },
  MAX: {
    hu: 'Max',
    en: 'Max',
  },
  FILTER: {
    hu: 'Szűrés',
    en: 'Filter',
  },
  MORE: {
    hu: 'További',
    en: 'More',
  },
  CLEAR_ALL: {
    hu: 'Összes törlése',
    en: 'Clear all',
  },
  PRACTICES: {
    hu: 'Gyakorlatok',
    en: 'Practices',
  },
  CODE: {
    hu: 'Kód',
    en: 'Code',
  },
  TIME: {
    hu: 'Időpont',
    en: 'Time',
  },
  PLACE: {
    hu: 'Hely',
    en: 'Place',
  },
  COURSE_NAME: {
    hu: 'Tantárgy neve',
    en: 'Course name',
  },
  COURSE_CODE: {
    hu: 'Tantárgy kódja',
    en: 'Course code',
  },
  INSTRUCTOR_NAME: {
    hu: 'Oktató neve',
    en: 'Instructor name',
  },
  INSTRUCTOR_CODE: {
    hu: 'Oktató kódja',
    en: 'Instructor code',
  },
} satisfies Record<string, Record<Locale, string>>;

export type Labels = typeof labels;
