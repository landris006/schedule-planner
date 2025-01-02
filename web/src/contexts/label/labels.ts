export const localeOptions = ['hu', 'en'] as const;
export type Locale = (typeof localeOptions)[number];

export const labels = {
  RESULTS: {
    hu: 'Eredmények',
    en: 'Results',
  },
  DAY: {
    hu: 'Nap',
    en: 'Day',
  },
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
    hu: 'Óra',
    en: 'Course',
  },
  CREATE_COURSE: {
    hu: 'Óra létrehozása',
    en: 'Create course',
  },
  SUBJECTS: {
    hu: 'Tantárgyak',
    en: 'Subjects',
  },
  PLANNER: {
    hu: 'Tervező',
    en: 'Planner',
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
  LECTURE: {
    hu: 'Előadás',
    en: 'Lecture',
  },
  LECTURES: {
    hu: 'Előadások',
    en: 'Lectures',
  },
  PRACTICE: {
    hu: 'Gyakorlat',
    en: 'Practice',
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
  MONDAY: {
    hu: 'Hétfő',
    en: 'Monday',
  },
  TUESDAY: {
    hu: 'Kedd',
    en: 'Tuesday',
  },
  WEDNESDAY: {
    hu: 'Szerda',
    en: 'Wednesday',
  },
  THURSDAY: {
    hu: 'Csütörtök',
    en: 'Thursday',
  },
  FRIDAY: {
    hu: 'Péntek',
    en: 'Friday',
  },
  SATURDAY: {
    hu: 'Szombat',
    en: 'Saturday',
  },
  SUNDAY: {
    hu: 'Vasárnap',
    en: 'Sunday',
  },
  ADD_TO_PLANNER: {
    hu: 'Tervezőhöz adás',
    en: 'Add to planner',
  },
  REMOVE_FROM_PLANNER: {
    hu: 'Eltávolítás a tervezőből',
    en: 'Remove from planner',
  },
  UPDATE_PLANNER: {
    hu: 'Tervező frissítése',
    en: 'Update planner',
  },
  UPDATE_PLANNER_TOOLTIP: {
    hu: 'A tárgy koábban már mentésre került, de azóta módosítva lett.',
    en: 'The subject is already saved, but it was modified.',
  },
  SAVED_SUBJECTS: {
    hu: 'Mentett tantárgyak',
    en: 'Saved subjects',
  },
  CALENDAR: {
    hu: 'Naptár',
    en: 'Calendar',
  },
  EDIT_COURSE: {
    hu: 'Kurzus szerkesztése',
    en: 'Edit course',
  },
  CODE_REQUIRED: {
    hu: 'Kód megadása kötelező',
    en: 'Code required',
  },
  START: {
    hu: 'Kezdet',
    en: 'Start',
  },
  END: {
    hu: 'Vég',
    en: 'End',
  },
  FIX: {
    hu: 'Fix',
    en: 'Fix',
  },
  FIX_TOOLTIP: {
    hu: 'Kikényszeríti a solvert, hogy mindig vegye fel ezt a kurzust.',
    en: 'Forces the solver to always include this course.',
  },
  COLOR: {
    hu: 'Szín',
    en: 'Color',
  },
  ALLOW_OVERLAP: {
    hu: 'Átfedés engedélyezése',
    en: 'Allow overlap',
  },
  ALLOW_OVERLAP_TOOLTIP: {
    hu: 'Engedi más tárgy felvételét ugyanebben az időpontban.',
    en: 'Allows the inclusion of other courses in this time slot.',
  },
  FILTERS: {
    hu: 'Szűrők',
    en: 'Filters',
  },
  SLOT_DURATION: {
    hu: 'Beosztásköz',
    en: 'Slot duration',
  },
  MINUTES: {
    hu: 'perc',
    en: 'minutes',
  },
  HERE: {
    hu: 'itt',
    en: 'here',
  },
  ISSUE_NOTICE: {
    hu: 'Bármilyen észrevételt vagy javaslatot várunk',
    en: 'If you encounter any issues or have any suggestions, please feel free to open an issue',
  },
} satisfies Record<string, Record<Locale, string>>;

export type Labels = typeof labels;
