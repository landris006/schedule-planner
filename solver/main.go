package main

// hard feltételek:
// ne legyen óra ütközés

// preferenciák:
// lyukas óra minimalizálás

//Tantárgy
type Subject struct {
	Code    string    `json:"code"`
	Name    string    `json:"name"`
	Courses []*Course `json:"courses"`
}

//Kurzus
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

//5 egész percekre kerekített diszkrét értékek
type Time struct {
	Start int     `json:"start"` // 0 - 287
	End   int     `json:"end"`   // 0 - 287
	Day   Weekday `json:"day"`   // 0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday
}

//A Golang nem támogatja az Enum-ot, workaround:
//https://builtin.com/software-engineering-perspectives/golang-enum
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

func main() {
	println("Hello, world!")
}
