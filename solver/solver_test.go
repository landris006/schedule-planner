package solver

import (
	"fmt"
	"strconv"
	"testing"
)

func TestSolver(t *testing.T) {
	for i := 0; i < 1; i++ {
		testSchedule("test_inputs/test_fix.json")
		testQuickSchedule("test_inputs/test_fix.json")
	}
}

func TestGraphBuilder(t *testing.T) {
	graph_a := CourseGraph{}
	graph_b := CourseGraph{}

	subjects := ReadSubjects("test_inputs/test_course_order.json")
	filters := ReadFilters("test_inputs/test_course_order.json")
	graph_a.BuildGraph(subjects, filters)

	subjects[0].Courses[1], subjects[0].Courses[2] = subjects[0].Courses[2], subjects[0].Courses[1]
	graph_b.BuildGraph(subjects, filters)

	set_a := EmptySet[*Course]()
	for _, node := range graph_a.Nodes {
		set_a = set_a.Union(node.Courses)
	}

	set_b := EmptySet[*Course]()
	for _, node := range graph_b.Nodes {
		set_b = set_b.Union(node.Courses)
	}

	if !set_a.Equals(set_b) {
		t.Logf("Course count of graph_a: %d", set_a.Size())
		t.Logf("Course count of graph_b: %d", set_b.Size())
		t.Logf("Course count their intersection: %d", set_a.Intersection(set_b).Size())
		t.Fatalf("The order of the input shall not determine the elements of the graph")
	}
}

func TestGraphBuilder2(t *testing.T) {
	graph_a := CourseGraph{}
	graph_b := CourseGraph{}

	subjects := ReadSubjects("test_inputs/test_course_order.json")
	filters := ReadFilters("test_inputs/test_course_order.json")
	graph_a.BuildGraph(subjects, filters)

	subjects[0].Courses[1], subjects[0].Courses[2] = subjects[0].Courses[2], subjects[0].Courses[1]
	graph_b.BuildGraph(subjects, filters)

	set_a := EmptySet[string]()
	for _, node := range graph_a.Nodes {
		set_a.Insert(fmt.Sprintf("%d", node))
	}

	set_b := EmptySet[string]()
	for _, node := range graph_b.Nodes {
		set_b.Insert(fmt.Sprintf("%d", node))
	}

	if !set_a.Equals(set_b) {
		t.Logf("Node count of graph_a: %d", set_a.Size())
		t.Logf("Node count of graph_b: %d", set_b.Size())
		t.Logf("Node count their intersection: %d", set_a.Intersection(set_b).Size())
		t.Fatalf("The order of the input shall not determine the elements of the graph")
	}
}

func testQuickSchedule(filepath string) {
	courseGraph := CourseGraph{}
	courseGraph.BuildGraph(ReadSubjects(filepath), ReadFilters(filepath))
	scheduledCourses := CreateQuickSchedule(&courseGraph)
	println("Felvett tárgyak száma: " + strconv.Itoa(scheduledCourses.Size()))
	sum := 0
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

func testSchedule(filepath string) {
	var courseGraph = CourseGraph{}
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
}
