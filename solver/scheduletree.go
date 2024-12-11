package solver

type RecSchedule struct {
	Courses Set[*Course]
}

type ScheduleTree struct {
	Schedule *RecSchedule
	Children []*ScheduleTree
}

func MakeEmptySchedule() *ScheduleTree {
	schedule := RecSchedule{EmptySet[*Course]()}
	tree := ScheduleTree{&schedule, []*ScheduleTree{}}
	return &tree
}

func (tree *ScheduleTree) addChildren(subject *Subject) {
	for _, course := range subject.Courses {
		if course.Insertable(tree.Schedule.Courses) {
			child := ScheduleTree{tree.Schedule, []*ScheduleTree{}}
			tree.Children = append(tree.Children, &child)
		}
	}
}
