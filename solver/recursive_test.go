package solver

import (
	"strconv"
	"testing"
)

func TestRecursive(t *testing.T) {
	subjects := CourseSubjectAlloc(ReadSubjects("test_inputs/test_a.json"))

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
