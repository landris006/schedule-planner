package main

import (
	"fmt"
)

// hard feltételek:
// ne legyen óra ütközés

// preferenciák:
// lyukas óra minimalizálás

// Tantárgy
type Subject struct {
	Code    string    `json:"code"`
	Name    string    `json:"name"`
	Courses []*Course `json:"courses"`
}

// Kurzus
type Course struct {
	Subject    *Subject   `json:"subject"`
	Code       string     `json:"code"`
	Name       string     `json:"name"`
	Day        Weekday    `json:"day"` // 0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday
	StartTime  Time       `json:"starttime"`
	EndTime    Time       `json:"endtime"`
	Instructor string     `json:"instructor"`
	Location   string     `json:"location"`
	Capacity   int        `json:"capacity"`
	Type       CourseType `json:"type"` // 0 = 'lecture' | 1 = 'practice'
}

// 5 egész percekre kerekített diszkrét értékek
type Time struct {
	Hour   int32 `json:"hour"`
	Minute int32 `json:"minute"`
}

func (time1 Time) isBefore(time2 Time) bool {
	if time1.Hour < time2.Hour {
		return true
	} else if time1.Hour == time2.Hour && time1.Minute < time2.Minute {
		return true
	} else {
		return false
	}
}

func makeTime(hour int32, minute int32) (*Time, error) {
	// constructs Time, gives an error if invalid
	var time Time
	var err error
	if hour < 0 || hour > 23 || minute < 0 || minute > 59 { // time is not real
		err = fmt.Errorf("invalid start time: %v:%v", hour, minute)
	} else {
		time.Hour = hour
		time.Minute = minute
	}

	if err == nil {
		return &time, err
	} else {
		return nil, err
	}

}

func forceTime(hour int32, minute int32) *Time {
	// constructs Time, gives default value (midnight on Monday) if invalid
	time, err := makeTime(hour, minute)
	if err != nil {
		return &Time{0, 0}
	} else {
		return time
	}
}

// A Golang nem támogatja az Enum-ot, workaround:
// https://builtin.com/software-engineering-perspectives/golang-enum
type Weekday int

const (
	Monday Weekday = iota
	Tuesday
	Wednesday
	Thursday
	Friday
	Saturday
	Sunday
)

func (w Weekday) ordinal() int {
	return int(w)
}

type CourseType int

const (
	Lecture CourseType = iota
	Practice
)

func (ct CourseType) ordinal() int {
	return int(ct)
}

func courseCompatible(course1 Course, course2 Course) bool {
	if course1.Day != course2.Day { // courses are on different days
		return true
	} else if course1.EndTime.isBefore(course2.StartTime) { // first course ends before second course starts
		return true
	} else if course2.EndTime.isBefore(course1.StartTime) { // second course ends before first course starts
		return true
	} else { // courses intersect
		return false
	}
}

func main() {
	var sub = Subject{"", "", []*Course{}}
	var course1 = Course{&sub, "code1", "", Wednesday, *forceTime(8, 0), *forceTime(8, 30), "", "", 100, Lecture}
	var course2 = Course{&sub, "code2", "", Wednesday, *forceTime(8, 0), *forceTime(8, 30), "", "", 100, Lecture}
	fmt.Println(courseCompatible(course1, course2)) // false

	course1.Day = Tuesday
	fmt.Println(courseCompatible(course1, course2)) // true

	course2.Day = Tuesday
	course2.StartTime = *forceTime(9, 0)
	course2.EndTime = *forceTime(9, 30)
	fmt.Println(courseCompatible(course1, course2)) // true

	course1.StartTime = *forceTime(9, 0)
	course1.EndTime = *forceTime(9, 30)
	course2.StartTime = *forceTime(8, 0)
	course2.EndTime = *forceTime(8, 30)
	fmt.Println(courseCompatible(course1, course2)) // true

	course1.StartTime = *forceTime(7, 0)
	course1.EndTime = *forceTime(9, 30)
	course2.StartTime = *forceTime(8, 0)
	course2.EndTime = *forceTime(8, 30)
	fmt.Println(courseCompatible(course1, course2)) // false

	time, err := makeTime(8, 10) // OK
	fmt.Printf("time: %v, err: %v\n", time, err)

	time, err = makeTime(-20, 10) // hour not okay
	fmt.Printf("time: %v, err: %v\n", time, err)

	time, err = makeTime(20, 69) // minute not okay
	fmt.Printf("time: %v, err: %v\n", time, err)

	time = forceTime(26, 19) // default value
	fmt.Printf("time: %v", time)

	err = nil
	table := makeEmptyTimetable() // create timetable
	fmt.Printf("\n\ntable: %v \nerr: %v \n\n", table, err)
	err = table.addCourse(&course1) // add a course, no error
	fmt.Printf("table: %v \nerr: %v \n\n", table, err)
	err = table.removeCourse(&course1) // remove the course, no error
	fmt.Printf("table: %v \nerr: %v \n\n", table, err)
	err = table.removeCourse(&course1) // remove a nonexistant course, error
	fmt.Printf("table: %v \nerr: %v \n\n", table, err)
	table.addCourse(&course1)
	err = table.addCourse(&course1) // add a course that does not fit, error
	fmt.Printf("table: %v \nerr: %v \n\n", table, err)
	course2.StartTime = *forceTime(11, 0)
	course2.EndTime = *forceTime(11, 30)
	err = table.addCourse(&course2) // add a second course, no error
	fmt.Printf("table: %v \nerr: %v", table, err)

	sub = Subject{"code", "name", []*Course{&course1, &course2}}
	table = makeEmptyTimetable()
	err = table.addSubject(&sub, "code1") // add course from a subject with code1, no error
	fmt.Printf("table: %v \nerr: %v \n\n", table, err)
	err = table.addSubject(&sub, "code2") // add course from a subject with code2, no error
	fmt.Printf("table: %v \nerr: %v \n\n", table, err)
	err = table.addSubject(&sub, "code2") // add course from a subject with code3, error
	fmt.Printf("table: %v \nerr: %v \n\n", table, err)
	err = table.removeSubject(&sub) // remove a whole subject, no error
	fmt.Printf("table: %v \nerr: %v \n\n", table, err)
	err = table.removeSubject(&sub) // remove a nonexistant subject, error
	fmt.Printf("table: %v \nerr: %v \n\n", table, err)
}
