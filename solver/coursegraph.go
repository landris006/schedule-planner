package solver

type CourseNode struct {
	Courses   Set[*Course]     `json:"Courses"`
	Neighbors Set[*CourseNode] `json:"Neighbors"`
}

type CourseGraph struct {
	Nodes []*CourseNode
}

func (course_node *CourseNode) IsInConflictWith(other *CourseNode) bool {
	for _, course_a := range course_node.Courses.Elements() {
		for _, course_b := range other.Courses.Elements() {
			if course_a == course_b || course_a.IsInConflictWith(course_b) {
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

	//Szedjük külön a fix kurzusokat is, és dobjunk el mindent, ami ütközik velük
	fix_courses := EmptySet[*Course]()
	for _, subject := range subjects {
		for _, course := range subject.Courses {
			course.Subject = subject
			if course.BreaksNoRules(filters) && course.Fix {
				fix_courses.Insert(course)
			}
		}
	}

	for _, subject := range subjects {
		courses := CreateSet(subject.Courses...)
		for _, course := range subject.Courses {
			if course.BreaksNoRules(filters) && !course.IsInConflictWithSet(fix_courses) {
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
			} else {
				courses.Remove(course)
			}
		}
		subject.Courses = courses.Elements()
	}

	//Vegyük az előadások és hozzájuk tartozó gyakorlatok (persze ami nem ütközik) keresztszorzatát, és ezeket tegyük a gráfba
	for _, lecture := range lectures.Elements() {

		conflicts := false
		for _, fix_course := range fix_courses.Elements() {
			if fix_course.IsInConflictWith(lecture) {
				conflicts = true
				break
			}
		}
		if !conflicts {
			courses := CreateSet(lecture.Subject.Courses...)
			courses.Remove(lecture)
			for _, course := range courses.Elements() {
				if !lecture.IsInConflictWith(course) {
					graph.Nodes = append(graph.Nodes, &CourseNode{CreateSet(lecture, course), EmptySet[*CourseNode]()})
				}
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
