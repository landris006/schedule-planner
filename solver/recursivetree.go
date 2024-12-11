package solver

import (
	"fmt"
	"math"
	"sort"
)

func CourseSubjectAlloc(subjects []*Subject) []*Subject {
	for _, subject := range subjects {
		for _, course := range subject.Courses {
			if course.BreaksNoRules() {
				course.Subject = subject
			}
		}
	}
	return subjects
}

func RecursiveScheduleFromScratch(subjects []*Subject) Set[*Course] {
	var tree = MakeEmptySchedule()
	schedule, value := GetScheduleRecursive(subjects, tree)
	fmt.Printf("Végleges value: %v\n\n", value)

	if schedule != nil {
		return schedule.Courses
	} else {
		return EmptySet[*Course]()
	}
}

func GetScheduleRecursive(to_add []*Subject, tree *ScheduleTree) (*RecSchedule, float64) {
	// Rendezd a tárgyakat kurzusok szerint növekvő sorrendbe
	sort.SliceStable(to_add, func(i, j int) bool {
		return tree.AddableNumber(to_add[i]) < tree.AddableNumber(to_add[j])
	})
	// Ha már nincs mit hozzáadni, add vissza az órarendet
	if len(to_add) == 0 {
		return tree.Schedule, RecScheduleToSchedule(tree.Schedule).Value()
	}
	// Ha nem lehet órát hozzáadni, nem lehet valid órarendet készíteni ezen az ágon
	if tree.AddableNumber(to_add[0]) == 0 {
		return nil, -1
	}
	// Add hozzá a kurzust
	tree.AddChildren(to_add[0])

	var bestValue = float64(math.Inf(-1))
	var bestChild *RecSchedule = nil
	for _, child := range tree.Children {
		schedule, value := GetScheduleRecursive(to_add[1:], child)
		if schedule != nil {
			if value > bestValue {
				bestValue = value
				bestChild = schedule
			}
		}
	}
	return bestChild, bestValue
}
