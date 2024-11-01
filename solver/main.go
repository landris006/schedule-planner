package main

import "strconv"

// hard feltételek:
// ne legyen óra ütközés

// preferenciák:
// lyukas óra minimalizálás

func main() {
	var subjects = ReadSubjects("test_inputs/test_a.json")

	for i := 0; i < len(subjects); i++ {
		println("")
		println("Subject name: " + subjects[i].Name)
		println("Subject code: " + subjects[i].Code)
		println("Subject Courses:")
		for j := 0; j < len(subjects[i].Courses); j++ {
			println("\tCourse code: " + subjects[i].Courses[j].Code)
			println("\tCourse type: " + strconv.Itoa(subjects[i].Courses[j].Type.ordinal()))
			println("\tCourse Day: " + strconv.Itoa(subjects[i].Courses[j].Time.Day.ordinal()))
			println("\tCourse Start: " + strconv.FormatFloat(float64(subjects[i].Courses[j].Time.Start), 'g', 2, 32))
			println("\tCourse End: " + strconv.FormatFloat(float64(subjects[i].Courses[j].Time.End), 'g', 2, 32))
			println("\tCourse Location: " + subjects[i].Courses[j].Location)
			println("\tCourse Instructor: " + subjects[i].Courses[j].Instructor)
			println("")
		}
		println("")
	}

}
