package main

import (
	"strconv"
)

// hard feltételek:
// ne legyen óra ütközés

// preferenciák:
// lyukas óra minimalizálás

func main() {
	for i := 0; i < 1; i++ {
		var courseGraph = CourseGraph{}
		courseGraph.BuildGraph(ReadSubjects("test_inputs/test_a.json"))

		var scheduledCourses = CreateScheduleFromScratch(&courseGraph).Elements()

		println("Felvett kurzusok száma: " + strconv.Itoa(len(scheduledCourses)))
		for _, course := range scheduledCourses {
			println("\tTárgy neve: " + course.Course.Subject.Name)
			println("\tKurzuskód: " + course.Course.Code)
			println("\tNap: " + strconv.Itoa(course.Course.Time.Day.ordinal()))
			println("\tKezdés: " + strconv.FormatFloat(float64(course.Course.Time.Start), 'g', 4, 32))
			println("\tVégzés: " + strconv.FormatFloat(float64(course.Course.Time.End), 'g', 4, 32))
			println("")
		}
	}
}
