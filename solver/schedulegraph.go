package main

import (
	"math"
	"math/rand"
)

type ScheduleNode struct {
	PickedCourses   Set[*CourseNode]
	PickableCourses Set[*CourseNode]
}

// Ha később meg akarunk adni kurzusokat, amik mindenképpen benne kell, hogy legyenek az órarendben, akkor ezt lehet rá használni
func CalculateStartNode(pickedCourses Set[*CourseNode], allCourses Set[*CourseNode]) *ScheduleNode {
	var node = &ScheduleNode{pickedCourses, allCourses}
	var courseNodes = node.PickableCourses.Elements()

	for i := 0; i < len(courseNodes) && allCourses.Size() > 0; i++ {
		allCourses = allCourses.Intersection(courseNodes[i].Neighbors)
	}

	return node
}

// Ide lehet majd a vágásokat beletenni (ha lesznek)
// Ha később egyszerre akarjuk az órarendbe tenni egy adott tárgy előadását és gyakorlatát, akkor több elemet is megadhatunk
func (schedule *ScheduleNode) Cut(pickedCourses []*CourseNode) bool {
	return false
}

// Ha így meg tudnánk adni az összes feltételt, akkor szerintem nem is kellene az összeset összehasonlítani (?)
func (schedule *ScheduleNode) EvaluatePick(pickedCourses []*CourseNode) int64 {
	var sum = 0

	var pickableCourses = schedule.PickableCourses
	for _, course := range pickedCourses {
		pickableCourses = pickableCourses.Intersection(course.Neighbors)
	}
	sum += pickableCourses.Size()

	//Lyukasórák
	//0, 1 vagy 2 szomszédja lehet az új órának -> a (szomszéd-1) előjelet ad a súlyozásnak
	//Szerintem a súlyozás jobb, ha függ az idáig meglevő kurzusokkal: minél több kurzus van, annál inkább javít vagy ront a lyukasóra
	//Nem ad pontos értéket, ha több, rögtön egymás után következő órát adunk hozzá egyszerre az órarendhez
	for _, pickedCourse := range pickedCourses {
		var neighborValue = -1
		for _, course := range schedule.PickedCourses.Elements() {
			if course.Course.Time.Day == pickedCourse.Course.Time.Day && (course.Course.Time.Start == pickedCourse.Course.Time.End || course.Course.Time.End == pickedCourse.Course.Time.Start) {
				neighborValue++
			}
		}
		sum += neighborValue * schedule.PickedCourses.Size()
	}

	return int64(sum)
}

func ExtendSchedule(pickedCourses Set[*CourseNode], allCourses Set[*CourseNode]) Set[*CourseNode] {
	var schedule = CalculateStartNode(pickedCourses, allCourses)
	for schedule.PickableCourses.Size() > 0 {
		//Kiértékelések
		var bestValue = int64(math.Inf(-1))
		var bestElements = []*CourseNode{}
		for _, node := range schedule.PickableCourses.Elements() {
			if !schedule.Cut([]*CourseNode{node}) {
				var value = schedule.EvaluatePick([]*CourseNode{node})
				if value > bestValue {
					bestValue = value
					bestElements = []*CourseNode{node}
				} else if value == bestValue {
					bestElements = append(bestElements, node)
				}
			}
		}
		//A legjobbak közül egy random kiválasztása
		randomIndex := rand.Intn(len(bestElements))
		var best = bestElements[randomIndex]

		//kiválasztott elem elhelyezése az órarendbe
		schedule.PickedCourses.Insert(best)

		//választható kurzusok megszűrése
		schedule.PickableCourses = schedule.PickableCourses.Intersection(best.Neighbors)
	}
	return schedule.PickedCourses
}

func CreateScheduleFromScratch(graph *CourseGraph) Set[*CourseNode] {
	var schedule = ScheduleNode{EmptySet[*CourseNode](), CreateSet(graph.Nodes...)}

	for schedule.PickableCourses.Size() > 0 {
		//Kiértékelések
		var bestValue = int64(math.Inf(-1))
		var bestElements = []*CourseNode{}

		for _, node := range schedule.PickableCourses.Elements() {
			if !schedule.Cut([]*CourseNode{node}) {
				var value = schedule.EvaluatePick([]*CourseNode{node})
				if value > bestValue {
					bestValue = value
					bestElements = []*CourseNode{node}
				} else if value == bestValue {
					bestElements = append(bestElements, node)
				}
			}
		}
		//A legjobbak közül egy random kiválasztása
		randomIndex := rand.Intn(len(bestElements))
		var best = bestElements[randomIndex]

		//kiválasztott elem elhelyezése az órarendbe
		schedule.PickedCourses.Insert(best)

		//választható kurzusok megszűrése
		schedule.PickableCourses = schedule.PickableCourses.Intersection(best.Neighbors)
	}

	return schedule.PickedCourses
}
