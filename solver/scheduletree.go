package solver

type RecSchedule struct {
	Courses Set[*Course]
}

type ScheduleTree struct {
	Schedule *RecSchedule
	Children []*ScheduleTree
}

func RecScheduleToSchedule(recschedule *RecSchedule) *Schedule {
	// Rettenetesen MacGyver megoldás, sorry
	var picked = EmptySet[*CourseNode]()
	for _, elem := range recschedule.Courses.Elements() {
		picked.Insert(&CourseNode{elem, EmptySet[*CourseNode]()})
	}
	return &Schedule{picked, EmptySet[*CourseNode]()}
}

func MakeEmptySchedule() *ScheduleTree {
	schedule := RecSchedule{EmptySet[*Course]()}
	tree := ScheduleTree{&schedule, []*ScheduleTree{}}
	return &tree
}

func (tree *ScheduleTree) AddChildren(subject *Subject) {
	for _, course := range subject.Courses {
		if course.Insertable(tree.Schedule.Courses) {
			copy := tree.Schedule.DeepCopy()
			copy.Courses.Insert(course)
			child := ScheduleTree{copy, []*ScheduleTree{}}
			tree.Children = append(tree.Children, &child)
		}
	}
}

func (tree *ScheduleTree) AddableNumber(subject *Subject) int {
	out := 0
	for _, course := range subject.Courses {
		if course.Insertable(tree.Schedule.Courses) {
			out++
		}
	}
	return out
}

func (s *RecSchedule) DeepCopy() *RecSchedule {
	newCourses := EmptySet[*Course]()
	for _, course := range s.Courses.Elements() {
		newCourses.Insert(course)
	}
	return &RecSchedule{newCourses}
}
