package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

// Tantárgy
type Subject struct {
	Code    string    `json:"code"`
	Name    string    `json:"name"`
	Courses []*Course `json:"courses"`
}

// Kurzus
type Course struct {
	Subject    *Subject   `json:"subject,omitempty"` //A JSON-ba ezt így nem lehet beletenni, olvasás után kell végigfutni az összesen
	Code       string     `json:"code"`
	Time       Time       `json:"time"`
	Instructor string     `json:"instructor"`
	Location   string     `json:"location"`
	Capacity   int        `json:"capacity"`
	Type       CourseType `json:"type"` // 0 = 'lecture' | 1 = 'practice'
}

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

type subjects struct {
	Subjects []*Subject `json:"subjects"`
}

// https://tutorialedge.net/golang/parsing-json-with-golang/
func ReadSubjects(filepath string) []*Subject {
	// Open our jsonFile
	jsonFile, err := os.Open(filepath)
	// if we os.Open returns an error then handle it
	if err != nil {
		fmt.Println(err)
		return []*Subject{}
	}

	// defer the closing of our jsonFile so that we can parse it later on
	defer jsonFile.Close()

	// read our opened xmlFile as a byte array.
	byteValue, _ := io.ReadAll(jsonFile)

	// we initialize our Users array
	var _subjects subjects

	// we unmarshal our byteArray which contains our
	// jsonFile's content into 'users' which we defined above
	json.Unmarshal(byteValue, &_subjects)

	return _subjects.Subjects
}
