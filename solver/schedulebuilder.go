package solver

import (
	"math"
	"math/rand"
	"sort"
)

type Schedule struct {
	PickedCourses   Set[*CourseNode]
	PickableCourses Set[*CourseNode]
}

// Ha később meg akarunk adni kurzusokat, amik mindenképpen benne kell, hogy legyenek az órarendben, akkor ezt lehet rá használni
func CalculateStartNode(pickedCourses Set[*CourseNode], allCourses Set[*CourseNode]) *Schedule {
	var node = &Schedule{pickedCourses, allCourses}
	var courseNodes = node.PickableCourses.Elements()

	for i := 0; i < len(courseNodes) && allCourses.Size() > 0; i++ {
		allCourses = allCourses.Intersection(courseNodes[i].Neighbors)
	}

	return node
}

// Ha így meg tudnánk adni az összes feltételt, akkor szerintem nem is kellene az összeset összehasonlítani (?)
func (schedule *Schedule) EvaluatePick(pickedCourses []*CourseNode) int64 {
	var sum = 0

	var pickableCourses = schedule.PickableCourses
	for _, course := range pickedCourses {
		pickableCourses = pickableCourses.Intersection(course.Neighbors)
	}
	sum += pickableCourses.Size()

	invalidCourses := EmptySet[*CourseNode]()
	excludedCourses := EmptySet[*CourseNode]()

	//Szűrjük ki azokat az órákat, amik ütköznének, ha nem lenne megengedett az ütközés
	for _, course1 := range schedule.PickedCourses.Elements() {
		//Ha megengedtük az ütközést, akkor biztosan a szomszédai között van
		for _, course2 := range course1.Neighbors.Minus(excludedCourses).Elements() {
			if course1.Course.OverlapsWith(course2.Course) {
				invalidCourses.Insert(course1)
				break
			}
		}
		//Ne vizsgáljuk többször azokat, amiket már megvizsgáltunk
		excludedCourses.Insert(course1)
	}

	//Lyukasórák
	//0, 1 vagy 2 szomszédja lehet az új órának -> a (szomszéd-1) előjelet ad a súlyozásnak
	//Szerintem a súlyozás jobb, ha függ az idáig meglevő kurzusokkal: minél több kurzus van, annál inkább javít vagy ront a lyukasóra
	//Nem ad pontos értéket, ha több, rögtön egymás után következő órát adunk hozzá egyszerre az órarendhez
	for _, pickedCourse := range CreateSet(pickedCourses...).Minus(invalidCourses).Elements() {
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

func (schedule *Schedule) CountGaps() int {
	//Ha minden igaz, itt az endPoints.Size()-nak muszáj párosnak lennie
	//Lyukasórák számolása a nem fedett végpontok alapján
	days := EmptySet[int]()
	endPoints := make(map[int]Set[float32])
	invalidCourses := EmptySet[*CourseNode]()
	excludedCourses := EmptySet[*CourseNode]()

	//Szűrjük ki azokat az órákat, amik ütköznének, ha nem lenne megengedett az ütközés
	for _, course1 := range schedule.PickedCourses.Elements() {
		//Ha megengedtük az ütközést, akkor biztosan a szomszédai között van
		for _, course2 := range course1.Neighbors.Minus(excludedCourses).Elements() {
			if course1.Course.OverlapsWith(course2.Course) {
				invalidCourses.Insert(course1)
				break
			}
		}
		//Ne vizsgáljuk többször azokat, amiket már megvizsgáltunk
		excludedCourses.Insert(course1)
	}

	for _, course := range schedule.PickedCourses.Minus(invalidCourses).Elements() {
		day := course.Course.Time.Day.ordinal()
		if !days.Contains(day) {
			days.Insert(day)
			endPoints[day] = EmptySet[float32]()
		}

		//Az esti órák között van negyed óra szünet => kerekítsünk fél órákra, hogy "összeérjenek"
		startTime := course.Course.Time.Start
		endTime := course.Course.Time.End

		if startTime >= 16 {
			startTime = float32(math.Floor(float64(2*startTime)) / 2)
			endTime = float32(math.Ceil(float64(2*endTime)) / 2)
		}

		if endPoints[day].Contains(startTime) {
			endPoints[day].Remove(startTime)
		} else {
			endPoints[day].Insert(startTime)
		}
		if endPoints[day].Contains(endTime) {
			endPoints[day].Remove(endTime)
		} else {
			endPoints[day].Insert(endTime)
		}
	}

	sum := 0
	for _, set := range endPoints {
		sum += set.Size()/2 - 1
	}

	return sum
}

func (schedule *Schedule) Value() float64 {
	var size_factor = 2.0
	var gap_factor = 3.0

	var sum = size_factor * float64(schedule.PickedCourses.Size())

	sum -= gap_factor * float64(schedule.CountGaps())

	return sum
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
	var schedule = Schedule{EmptySet[*CourseNode](), CreateSet(graph.Nodes...)}

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

func BK(clique Set[*CourseNode], available_vertices Set[*CourseNode], excluded_vertices Set[*CourseNode], cliques *[]Schedule, ordering *map[*CourseNode]float64) {
	if available_vertices.Union(excluded_vertices).IsEmpty() {
		*cliques = append(*cliques, Schedule{clique, EmptySet[*CourseNode]()})
	} else {
		var bestValue = math.Inf(1)
		var bestElements = []*CourseNode{}

		for _, node := range available_vertices.Union(excluded_vertices).Elements() {
			value := float64(available_vertices.Intersection(node.Neighbors).Size())
			if value < bestValue {
				bestValue = value
				bestElements = []*CourseNode{node}
			} else if value == bestValue {
				bestElements = append(bestElements, node)
			}
		}

		pivot := bestElements[0]

		elements := available_vertices.Minus(pivot.Neighbors).Elements()
		sort.Slice(elements, func(i, j int) bool {
			return (*ordering)[elements[i]] < (*ordering)[elements[j]]
		})

		for _, vertex := range elements {
			BK(clique.Union(CreateSet(vertex)), available_vertices.Intersection(vertex.Neighbors), excluded_vertices.Intersection(vertex.Neighbors), cliques, ordering)
			available_vertices = available_vertices.Minus(CreateSet(vertex))
			excluded_vertices.Insert(vertex)
		}
	}
}

func CreateScheduleFromScratch(graph *CourseGraph) Set[*CourseNode] {

	//Rendezés
	//https://dl.acm.org/doi/pdf/10.1145/2402.322385 418.oldal
	courseDegMap := make(map[*CourseNode]float64)
	remainingNodes := CreateSet(graph.Nodes...)

	for remainingNodes.Size() > 0 {
		var bestValue = math.Inf(1)
		var bestElements = []*CourseNode{}

		for _, node := range remainingNodes.Elements() {
			value := float64(node.Neighbors.Intersection(remainingNodes).Size())
			if value < bestValue {
				bestValue = value
				bestElements = []*CourseNode{node}
			} else if value == bestValue {
				bestElements = append(bestElements, node)
			}
		}

		best := bestElements[0]
		//Ez itt igazából az indexe az elemnek, ha visszafelé indexelnénk
		//Szívem szerint egy rendezett tömbbe tenném, de nincsen kedvem megírni a rendezést vele
		//a másik függvényben (sort.Slice(elements, func(i, j int) bool {-os sor)
		courseDegMap[best] = float64(len(graph.Nodes) - len(courseDegMap))
		remainingNodes.Remove(best)
	}

	//https://en.wikipedia.org/wiki/Bron%E2%80%93Kerbosch_algorithm
	max_cliques := []Schedule{}
	BK(EmptySet[*CourseNode](), CreateSet(graph.Nodes...), EmptySet[*CourseNode](), &max_cliques, &courseDegMap)

	var bestValue = float64(math.Inf(-1))
	var bestElements = []Schedule{}

	for _, schedule := range max_cliques {
		var value = schedule.Value()
		if value > bestValue {
			bestValue = value
			bestElements = []Schedule{schedule}
		} else if value == bestValue {
			bestElements = append(bestElements, schedule)
		}
	}

	randomIndex := rand.Intn(len(bestElements))

	return bestElements[randomIndex].PickedCourses
}
