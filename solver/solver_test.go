package solver

import (
	"strconv"
	"testing"
)

func TestSolver(t *testing.T) {
	for i := 0; i < 1; i++ {
		var courseGraph = CourseGraph{}
		filepath := "test_inputs/test_no_filter.json"
		courseGraph.BuildGraph(ReadSubjects(filepath), ReadFilters(filepath))

		var scheduledCourses = CreateSchedule(&courseGraph)

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

		courseGraph = CourseGraph{}
		courseGraph.BuildGraph(ReadSubjects(filepath), ReadFilters(filepath))
		scheduledCourses = CreateQuickSchedule(&courseGraph)
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
