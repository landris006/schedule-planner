package main

import "fmt"

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
	Time       Time       `json:"time"`
	Instructor string     `json:"instructor"`
	Location   string     `json:"location"`
	Capacity   int        `json:"capacity"`
	Type       CourseType `json:"type"` // 0 = 'lecture' | 1 = 'practice'
}

// 5 egész percekre kerekített diszkrét értékek
type Time struct {
	Start float32 `json:"start"` // 0 - 23.99
	End   float32 `json:"end"`   // 0 - 23.99
	Day   Weekday `json:"day"`   // 0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday
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
	if course1.Time.Day != course2.Time.Day { // courses are on different days
		return true
	} else if course1.Time.End < course2.Time.Start { // first course ends before second course starts
		return true
	} else if course2.Time.End < course1.Time.Start { // second course ends before first course starts
		return true
	} else { // courses intersect
		return false
	}
}

func main() {
	var sub = Subject{"", "", []*Course{}}
	var course1 = Course{&sub, "", "", Time{8.0, 8.50, Wednesday}, "", "", 100, Lecture}
	var course2 = Course{&sub, "", "", Time{8.0, 8.50, Wednesday}, "", "", 100, Lecture}
	fmt.Println(courseCompatible(course1, course2)) // false

	course1.Time.Day = Tuesday
	fmt.Println(courseCompatible(course1, course2)) // true

	course2.Time.Day = Tuesday
	course2.Time.Start = 9.0
	course2.Time.End = 9.50
	fmt.Println(courseCompatible(course1, course2)) // true

	course1.Time.Start = 9.0
	course1.Time.End = 9.50
	course2.Time.Start = 8.0
	course2.Time.End = 8.50
	fmt.Println(courseCompatible(course1, course2)) // true

	course1.Time.Start = 7.0
	course1.Time.End = 9.50
	course2.Time.Start = 8.0
	course2.Time.End = 8.50
	fmt.Println(courseCompatible(course1, course2)) // false
}
