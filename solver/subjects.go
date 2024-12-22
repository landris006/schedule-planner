package solver

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
	Color   string    `json:"color"`
	Courses []*Course `json:"courses"`
}

// Kurzus
type Course struct {
	Subject      *Subject   `json:"subject,omitempty"` //A JSON-ba ezt így nem lehet beletenni, olvasás után kell végigfutni az összesen
	Code         string     `json:"code"`
	Time         Time       `json:"time"`
	Instructor   string     `json:"instructor"`
	Location     string     `json:"location"`
	Capacity     int        `json:"capacity"`
	Type         CourseType `json:"type"` // 0 = 'lecture' | 1 = 'practice'
	AllowOverlap bool       `json:"allowOverlap"`
	Fix          bool       `json:"fix"` //felhasznalo altal felvett fix kurzus
}

type Time struct {
	Start float32 `json:"start"` // 0 - 23.99
	End   float32 `json:"end"`   // 0 - 23.99
	Day   Weekday `json:"day"`   // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
}

// Szűrő - intervallum: mikor ne legyen óra
type Filter struct {
	Time Time `json:"time"`
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

type filters struct {
	Filters []*Filter `json:"filters"`
}

func (course_a *Course) IsInConflictWith(course_b *Course) bool {
	if course_a.Fix && course_b.Fix {
		return false
	}

	//Egy tárgyhoz csak egy gyakorlatot vegyünk fel!
	if course_a.Subject == course_b.Subject && course_a.Type == course_b.Type {
		return true
	}

	return course_a.AllowOverlap || course_b.AllowOverlap || course_a.OverlapsWith(course_b)
}

func (course_a *Course) OverlapsWith(course_b *Course) bool {

	if course_a.Time.Day == course_b.Time.Day {
		//Leggyakrabban amikor ütköznek, akkor pont ugyanakkor kezdődnek és végződnek
		if course_a.Time.Start == course_b.Time.Start && course_a.Time.End == course_b.Time.End {
			return true
		}

		//A többi esetben akkor ütközik, ha az egyiknek valamelyik végpontja a másik végpontjai közé esik
		//Mindkettőnek meg kel nézni, mert lehet, hogy az egyik óra rövidebb, mint a másik
		if course_a.Time.Start > course_b.Time.Start && course_a.Time.Start < course_b.Time.End {
			return true
		}
		if course_a.Time.End > course_b.Time.Start && course_a.Time.End < course_b.Time.End {
			return true
		}
		if course_b.Time.Start > course_a.Time.Start && course_b.Time.Start < course_a.Time.End {
			return true
		}
		if course_b.Time.End > course_a.Time.Start && course_b.Time.End < course_a.Time.End {
			return true
		}
	}

	return false
}

func (course *Course) ApplyFilter(f *Filter) bool {
	if course.Time.Day == f.Time.Day {
		if course.Time.Start == f.Time.Start && course.Time.End == f.Time.End {
			return true
		}

		if course.Time.Start > f.Time.Start && course.Time.Start < f.Time.End {
			return true
		}
		if course.Time.End > f.Time.Start && course.Time.End < f.Time.End {
			return true
		}
		if f.Time.Start > course.Time.Start && f.Time.Start < course.Time.End {
			return true
		}
		if f.Time.End > course.Time.Start && f.Time.End < course.Time.End {
			return true
		}
	}

	return false
}

// Ide majd később kerülnek a kurzusra vonatkozó szűrők
func (course *Course) BreaksNoRules(f []*Filter) bool {
	if course.Fix {
		return true
	} else {
		for _, filter := range f {
			if !course.ApplyFilter(filter) {
				return false
			}
		}
	}

	return true
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
	_ = json.Unmarshal(byteValue, &_subjects)

	return _subjects.Subjects
}

func ReadFilters(filepath string) []*Filter {
	// Open our jsonFile
	jsonFile, err := os.Open(filepath)
	// if we os.Open returns an error then handle it
	if err != nil {
		fmt.Println(err)
		return []*Filter{}
	}

	defer jsonFile.Close()

	// read our opened xmlFile as a byte array.
	byteValue, _ := io.ReadAll(jsonFile)

	// we initialize our Users array
	var _filters filters

	// we unmarshal our byteArray which contains our
	// jsonFile's content into 'users' which we defined above
	_ = json.Unmarshal(byteValue, &_filters)

	return _filters.Filters
}
