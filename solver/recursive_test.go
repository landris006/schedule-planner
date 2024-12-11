package solver

import (
	"fmt"
	"strconv"
	"testing"
)

func TestRecursive(t *testing.T) {
	subjects := ReadSubjects("test_inputs/test_a.json")
	for _, subject := range subjects {
		for _, course := range subject.Courses {
			if course.BreaksNoRules() {
				course.Subject = subject
			}
		}
	}
	for _, s := range subjects {
		fmt.Println(s)
	}

	scheduledCourses := RecursiveScheduleFromScratch(subjects)

	println("Felvett kurzusok száma: " + strconv.Itoa(scheduledCourses.Size()))
	for _, course := range scheduledCourses.Elements() {
		println("\tTárgy neve: " + course.Subject.Name)
		println("\tKurzuskód: " + course.Code)
		println("\tNap: " + strconv.Itoa(course.Time.Day.ordinal()))
		println(
			"\tKezdés: " + strconv.FormatFloat(float64(course.Time.Start), 'g', 4, 32),
		)
		println("\tVégzés: " + strconv.FormatFloat(float64(course.Time.End), 'g', 4, 32))
		println("")
	}
}
