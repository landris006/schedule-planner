package solver

import (
	"fmt"
	"sort"
)

func RecursiveScheduleFromScratch(subjects []*Subject) Set[*Course] {
	var tree = MakeEmptySchedule()
	schedule := GetScheduleRecursive(subjects, tree)

	return schedule.Courses
}

func GetScheduleRecursive(to_add []*Subject, tree *ScheduleTree) *RecSchedule {
	// Rendezd a tárgyakat kurzusok szerint növekvő sorrendbe
	sort.SliceStable(to_add, func(i, j int) bool {
		return tree.AddableNumber(to_add[i]) < tree.AddableNumber(to_add[j])
	})
	for _, sub := range to_add {
		fmt.Println(tree.AddableNumber(sub), sub.Name)
	}
	fmt.Println()
	// Ha már nincs mit hozzáadni, add vissza az órarendet
	if len(to_add) == 0 {
		return tree.Schedule
	}
	// Ha nem lehet órát hozzáadni, nem lehet valid órarendet készíteni ezen az ágon
	if tree.AddableNumber(to_add[0]) == 0 {
		return nil
	}
	// Add hozzá a kurzust
	tree.AddChildren(to_add[0])
	for _, child := range tree.Children {
		schedule := GetScheduleRecursive(to_add[1:], child)
		if schedule != nil {
			return schedule
		}
	}
	// Ide nem kéne eljutni, de a fordító kényes
	return nil
}
