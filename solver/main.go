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

func makeTime(day Weekday, start float32, end float32) (*Time, error) { // constructs Time, gives an error if invalid
	var time Time
	var err error
	if day < Monday || day > Sunday { // day is not real
		err = fmt.Errorf("invalid day of the week: %v", day)
	} else if start < 0.0 || start > 24.0 {
		err = fmt.Errorf("invalid start time: %v", start)
	} else if end < 0.0 || end > 24.0 {
		err = fmt.Errorf("invalid end time: %v", end)
	} else if start > end {
		err = fmt.Errorf("end time is greater than start time: %v < %v", start, end)
	} else {
		time.Start = start
		time.End = end
		time.Day = day
	}

	if err == nil {
		return &time, err
	} else {
		return nil, err
	}

}

func forceTime(day Weekday, start float32, end float32) *Time { // constructs Time, gives default value (midnight on Monday) if invalid
	time, err := makeTime(day, start, end)
	if err != nil {
		return &Time{0, 0, Monday}
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
	var course1 = Course{&sub, "", "", *forceTime(Wednesday, 8.0, 8.50), "", "", 100, Lecture}
	var course2 = Course{&sub, "", "", *forceTime(Wednesday, 8.0, 8.50), "", "", 100, Lecture}
	fmt.Println(courseCompatible(course1, course2)) // false

	course1.Time.Day = Tuesday
	fmt.Println(courseCompatible(course1, course2)) // true

	course2.Time = *forceTime(Tuesday, 9.0, 9.50)
	fmt.Println(courseCompatible(course1, course2)) // true

	course1.Time = *forceTime(Tuesday, 9.0, 9.50)
	course2.Time = *forceTime(Tuesday, 8.0, 8.50)
	fmt.Println(courseCompatible(course1, course2)) // true

	course1.Time = *forceTime(Tuesday, 7.0, 9.50)
	course2.Time = *forceTime(Tuesday, 8.0, 8.50)
	fmt.Println(courseCompatible(course1, course2)) // false

	time, err := makeTime(Sunday, 8, 10) // OK
	fmt.Printf("time: %v, err: %v\n", time, err)

	time, err = makeTime(-1, 8, 10) // day not okay
	fmt.Printf("time: %v, err: %v\n", time, err)

	time, err = makeTime(Sunday, -20, 10) // start not okay
	fmt.Printf("time: %v, err: %v\n", time, err)

	time, err = makeTime(Sunday, 20, 24.2) // end not okay
	fmt.Printf("time: %v, err: %v\n", time, err)

	time, err = makeTime(Sunday, 20, 19) // ends before it begins
	fmt.Printf("time: %v, err: %v\n", time, err)

	time = forceTime(Sunday, 20, 19) // default value
	fmt.Printf("time: %v", time)
}
