package solver

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
			if course.Course.Time.Day == pickedCourse.Course.Time.Day &&
				(course.Course.Time.Start == pickedCourse.Course.Time.End || course.Course.Time.End == pickedCourse.Course.Time.Start) {
				neighborValue++
			}
		}
		sum += neighborValue * schedule.PickedCourses.Size()
	}

	return int64(sum)
}

func (schedule *ScheduleNode) Value() float64 {
	var size_factor = 2.0
	var hole_factor = 1.0

	var sum = size_factor * float64(schedule.PickedCourses.Size())

	//Lyukasórák számolása a nem fedett végpontok alapján
	days := EmptySet[int]()
	endPoints := EmptySet[float32]()
	invalidCourses := EmptySet[*CourseNode]()
	excludedCourses := EmptySet[*CourseNode]()

	//Szűrjük ki azokat az órákat, amik ütköznének, ha nem lenne megengedett az ütközés
	for _, course1 := range schedule.PickedCourses.Elements() {
		//Ha megengedtük az ütközést, akkor biztosan a szomszédai között van
		for _, course2 := range course1.Neighbors.Minus(excludedCourses).Elements() {
			if course1.Course.Time.Start <= course2.Course.Time.Start && course1.Course.Time.End >= course2.Course.Time.End {
				invalidCourses.Insert(course2)
			} else if course1.Course.Time.Start > course2.Course.Time.Start && course1.Course.Time.End < course2.Course.Time.End {
				invalidCourses.Insert(course1)
			}
			//Ne vizsgáljuk többször azokat, amiket már megvizsgáltunk
			excludedCourses.Insert(course1)
		}
	}

	for _, course := range schedule.PickedCourses.Minus(invalidCourses).Elements() {
		days.Insert(course.Course.Time.Day.ordinal())
		if endPoints.Contains(course.Course.Time.Start) {
			endPoints.Remove(course.Course.Time.Start)
		} else {
			endPoints.Insert(course.Course.Time.Start)
		}
		if endPoints.Contains(course.Course.Time.End) {
			endPoints.Remove(course.Course.Time.End)
		} else {
			endPoints.Insert(course.Course.Time.End)
		}
	}

	//Ha minden igaz, itt az endPoints.Size()-nak muszáj párosnak lennie
	sum -= hole_factor * float64(days.Size()-(endPoints.Size()/2))

	return float64(sum)
}

func QuickExtendSchedule(pickedCourses Set[*CourseNode], allCourses Set[*CourseNode]) Set[*CourseNode] {
	var schedule = CalculateStartNode(pickedCourses, allCourses)
	for schedule.PickableCourses.Size() > 0 {
		//Kiértékelések
		var bestValue = int64(math.Inf(-1))
		var bestElements = []*CourseNode{}
		for _, node := range schedule.PickableCourses.Elements() {
			var value = schedule.EvaluatePick([]*CourseNode{node})
			if value > bestValue {
				bestValue = value
				bestElements = []*CourseNode{node}
			} else if value == bestValue {
				bestElements = append(bestElements, node)
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

func CreateQuickScheduleFromScratch(graph *CourseGraph) Set[*CourseNode] {
	var schedule = ScheduleNode{EmptySet[*CourseNode](), CreateSet(graph.Nodes...)}

	for schedule.PickableCourses.Size() > 0 {
		//Kiértékelések
		var bestValue = int64(math.Inf(-1))
		var bestElements = []*CourseNode{}

		for _, node := range schedule.PickableCourses.Elements() {
			var value = schedule.EvaluatePick([]*CourseNode{node})
			if value > bestValue {
				bestValue = value
				bestElements = []*CourseNode{node}
			} else if value == bestValue {
				bestElements = append(bestElements, node)
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

func BK(clique Set[*CourseNode], available_vertices Set[*CourseNode], excluded_vertices Set[*CourseNode], cliques *[]ScheduleNode) {
	if available_vertices.Union(excluded_vertices).IsEmpty() {
		*cliques = append(*cliques, ScheduleNode{clique, EmptySet[*CourseNode]()})
	}

	//TODO: pivot pont
	for _, vertex := range available_vertices.Elements() {
		BK(clique.Union(CreateSet(vertex)), available_vertices.Intersection(vertex.Neighbors), excluded_vertices.Intersection(vertex.Neighbors), cliques)
		available_vertices = available_vertices.Minus(CreateSet(vertex))
		excluded_vertices.Insert(vertex)
	}
}

func CreateScheduleFromScratch(graph *CourseGraph) Set[*CourseNode] {
	//https://en.wikipedia.org/wiki/Bron%E2%80%93Kerbosch_algorithm
	max_cliques := []ScheduleNode{}
	BK(EmptySet[*CourseNode](), CreateSet(graph.Nodes...), EmptySet[*CourseNode](), &max_cliques)

	var bestValue = float64(math.Inf(-1))
	var bestElements = []ScheduleNode{}

	for _, schedule := range max_cliques {
		var value = schedule.Value()
		if value > bestValue {
			bestValue = value
			bestElements = []ScheduleNode{schedule}
		} else if value == bestValue {
			bestElements = append(bestElements, schedule)
		}
	}

	randomIndex := rand.Intn(len(bestElements))
	return bestElements[randomIndex].PickedCourses
}
