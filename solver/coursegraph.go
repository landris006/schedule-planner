package solver

type CourseNode struct {
	Courses   Set[*Course]
	Neighbors Set[*CourseNode]
}

type CourseGraph struct {
	Nodes []*CourseNode
}

func (course_node *CourseNode) IsInConflictWith(other *CourseNode) bool {
	for _, course_a := range course_node.Courses.Elements() {
		for _, course_b := range other.Courses.Elements() {
			if course_a.IsInConflictWith(course_b) {
				return true
			}
		}
	}
	return false
}

func (graph *CourseGraph) BuildGraph(subjects []*Subject, filters []*Filter) {
	//Szedjük külön az előadásokat; és azokat a gyakorlatokat, amikhez nem tartozik előadás vagy azokat az előadásokat, amikhez gyakorlat nem tartozik
	//Ha nincsen előadás, akkor egy az egyben kerül a gráf kurzuscsúcsai közé
	lectures := EmptySet[*Course]()

	for _, subject := range subjects {
		for _, course := range subject.Courses {
			if course.BreaksNoRules(filters) {
				course.Subject = subject
				if course.Type == Lecture {
					hasPractice := false
					for _, course2 := range subject.Courses {
						if course2.Type == Practice {
							hasPractice = true
							break
						}
					}
					if hasPractice {
						lectures.Insert(course)
					} else {
						graph.Nodes = append(graph.Nodes, &CourseNode{CreateSet(course), EmptySet[*CourseNode]()})
					}
				} else {
					hasLecture := false
					for _, course2 := range subject.Courses {
						if course2.Type == Lecture {
							hasLecture = true
							break
						}
					}
					if !hasLecture {
						graph.Nodes = append(graph.Nodes, &CourseNode{CreateSet(course), EmptySet[*CourseNode]()})
					}
				}
			}
		}
	}

	//Vegyük az előadások és hozzájuk tartozó gyakorlatok (persze ami nem ütközik) keresztszorzatát, és ezeket tegyük a gráfba
	for _, lecture := range lectures.Elements() {
		courses := CreateSet(lecture.Subject.Courses...)
		courses.Remove(lecture)
		for _, course := range courses.Elements() {
			if !lecture.IsInConflictWith(course) {
				graph.Nodes = append(graph.Nodes, &CourseNode{CreateSet(lecture, course), EmptySet[*CourseNode]()})
			}
		}
	}

	for i := 0; i < len(graph.Nodes)-1; i++ {
		var node_a *CourseNode = graph.Nodes[i]
		for j := i + 1; j < len(graph.Nodes); j++ {
			var node_b = graph.Nodes[j]
			//println(node_a.Course.Code + " - " + node_b.Course.Code + ": " + strconv.FormatBool(node_a.Course.OverlapsWith(node_b.Course)))
			if !node_a.IsInConflictWith(node_b) {
				node_a.Neighbors.Insert(node_b)
				node_b.Neighbors.Insert(node_a)
			}
		}
	}
}
