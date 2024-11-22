package main

import "fmt"

type Timetable struct {
	Courses []*Course `json:"courses"`
}

func makeEmptyTimetable() *Timetable {
	return &Timetable{}
}

func (table *Timetable) courseFits(course *Course) bool {
	for _, v := range table.Courses {
		if !courseCompatible(*v, *course) {
			return false
		}
	}
	return true
}

func (table *Timetable) courseInTable(course *Course) bool {
	for _, v := range table.Courses {
		if v == course {
			return true
		}
	}
	return false
}

func (table *Timetable) addCourse(course *Course) error {
	if table.courseFits(course) {
		table.Courses = append(table.Courses, course)
		return nil
	} else {
		return fmt.Errorf("Course %v cannot be added to Timetable %v", *course, *table)
	}
}

func (table *Timetable) removeCourse(course *Course) error {
	for i, v := range table.Courses {
		if v == course {
			table.Courses[i] = table.Courses[len(table.Courses)-1]
			table.Courses = table.Courses[:len(table.Courses)-1]
			return nil
		}
	}
	return fmt.Errorf("Course %v cannot be deleted from Timetable %v", *course, *table)
}

func (table *Timetable) addSubject(subject *Subject, courseCode string) error {
	added := false
	for _, v := range subject.Courses {
		if v.Code == courseCode {
			err := table.addCourse(v)
			if err != nil {
				return fmt.Errorf("Subject %v cannot be added to Timetable %v", *subject, *table)
			} else {
				added = true
			}
		}
	}
	if !added {
		return fmt.Errorf("Course with code %v does not exists in Subject %v", courseCode, *subject)
	} else {
		return nil
	}
}

func (table *Timetable) removeSubject(subject *Subject) error {
	removed := false
	for _, v := range subject.Courses {
		if table.courseInTable(v) {
			table.removeCourse(v)
			removed = true
		}
	}
	if !removed {
		return fmt.Errorf("Subject %v is not in Timetable %v", *subject, *table)
	} else {
		return nil
	}
}
