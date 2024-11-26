package solver

type CourseNode struct {
	Course    *Course
	Neighbors Set[*CourseNode]
}

type CourseGraph struct {
	Nodes []*CourseNode
}

func (graph *CourseGraph) BuildGraph(subjects []*Subject) {
	for _, subject := range subjects {
		for _, course := range subject.Courses {
			if course.BreaksNoRules() {
				course.Subject = subject
				graph.Nodes = append(graph.Nodes, &CourseNode{course, EmptySet[*CourseNode]()})
			}
		}
	}

	for i := 0; i < len(graph.Nodes)-1; i++ {
		var node_a *CourseNode = graph.Nodes[i]
		for j := i + 1; j < len(graph.Nodes); j++ {
			var node_b = graph.Nodes[j]
			//println(node_a.Course.Code + " - " + node_b.Course.Code + ": " + strconv.FormatBool(node_a.Course.OverlapsWith(node_b.Course)))
			if !node_a.Course.OverlapsWith(node_b.Course) {
				node_a.Neighbors.Insert(node_b)
				node_b.Neighbors.Insert(node_a)
			}
		}
	}
}
