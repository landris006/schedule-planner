package solver

import (
	"strconv"
	"testing"
)

func TestSolver(t *testing.T) {
	for i := 0; i < 1; i++ {
		var courseGraph = CourseGraph{}
		courseGraph.BuildGraph(ReadSubjects("test_inputs/test_no_filter.json"), ReadFilters("test_inputs/test_no_filter.json"))

		var scheduledCourses = CreateScheduleFromScratch(&courseGraph)

		println("Felvett tárgyak száma: " + strconv.Itoa(scheduledCourses.Size()))
		sum := 0
		for _, course_node := range scheduledCourses.Elements() {
			sum += course_node.Courses.Size()
			for _, course := range course_node.Courses.Elements() {
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
		println("Felvett kurzusok száma: " + strconv.Itoa(sum))

		scheduledCourses = CreateQuickScheduleFromScratch(&courseGraph)
		println("Felvett tárgyak száma: " + strconv.Itoa(scheduledCourses.Size()))
		sum = 0
		for _, course_node := range scheduledCourses.Elements() {
			sum += course_node.Courses.Size()
			for _, course := range course_node.Courses.Elements() {
				println("\tTárgy neve: " + course.Subject.Name)
				println("\tKurzuskód: " + course.Code)
				println("\tNap: " + strconv.Itoa(course.Time.Day.ordinal()))
				println("\tKezdés: " + strconv.FormatFloat(float64(course.Time.Start), 'g', 4, 32))
				println("\tVégzés: " + strconv.FormatFloat(float64(course.Time.End), 'g', 4, 32))
				println("")
			}
		}
		println("Felvett kurzusok száma: " + strconv.Itoa(sum))
	}
}
