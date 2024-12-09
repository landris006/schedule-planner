package solver

import (
	"strconv"
	"testing"
)

func TestSolver(t *testing.T) {
	for i := 0; i < 1; i++ {
		var courseGraph = CourseGraph{}
		courseGraph.BuildGraph(ReadSubjects("test_inputs/test_a.json"))

		var scheduledCourses = CreateScheduleFromScratch(&courseGraph)

		println("Felvett kurzusok száma: " + strconv.Itoa(scheduledCourses.Size()))
		for _, course := range scheduledCourses.Elements() {
			println("\tTárgy neve: " + course.Course.Subject.Name)
			println("\tKurzuskód: " + course.Course.Code)
			println("\tNap: " + strconv.Itoa(course.Course.Time.Day.ordinal()))
			println(
				"\tKezdés: " + strconv.FormatFloat(float64(course.Course.Time.Start), 'g', 4, 32),
			)
			println("\tVégzés: " + strconv.FormatFloat(float64(course.Course.Time.End), 'g', 4, 32))
			println("")
		}

		scheduledCourses = CreateQuickScheduleFromScratch(&courseGraph)

		println("Felvett kurzusok száma: " + strconv.Itoa(scheduledCourses.Size()))
		for _, course := range scheduledCourses.Elements() {
			println("\tTárgy neve: " + course.Course.Subject.Name)
			println("\tKurzuskód: " + course.Course.Code)
			println("\tNap: " + strconv.Itoa(course.Course.Time.Day.ordinal()))
			println("\tKezdés: " + strconv.FormatFloat(float64(course.Course.Time.Start), 'g', 4, 32))
			println("\tVégzés: " + strconv.FormatFloat(float64(course.Course.Time.End), 'g', 4, 32))
			println("")
		}
	}
}
