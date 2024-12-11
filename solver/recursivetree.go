package solver

import "fmt"

func RecursiveScheduleFromScratch(subjects []*Subject) Set[*Course] {
	var tree = MakeEmptySchedule()
	tree.addChildren(subjects[0])
	fmt.Println(tree)

	return EmptySet[*Course]()
}
