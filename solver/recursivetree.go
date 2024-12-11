package solver

import (
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
	schedule := GetScheduleRecursive(subjects, tree)

	if schedule != nil {
		return schedule.Courses
	} else {
		return EmptySet[*Course]()
	}
}

func GetScheduleRecursive(to_add []*Subject, tree *ScheduleTree) *RecSchedule {
	// Rendezd a tárgyakat kurzusok szerint növekvő sorrendbe
	sort.SliceStable(to_add, func(i, j int) bool {
		return tree.AddableNumber(to_add[i]) < tree.AddableNumber(to_add[j])
	})
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
