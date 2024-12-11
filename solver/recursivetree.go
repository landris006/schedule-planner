package solver

import (
	"math"
	"sort"
)

func CourseSubjectAlloc(subjects []*Subject) []*Subject {
	for _, subject := range subjects {
		for _, course := range subject.Courses {
			if course.BreaksNoRules() {
				// tárgy hozzáadása a kurzushoz
				course.Subject = subject
			}
		}
	}
	// EA+GY tárgyak előadás és gyakorlat különválasztása...
	var subjectsNew = []*Subject{}
	for _, subject := range subjects {
		courseType := subject.Courses[0].Type
		toSplit := false
		for _, course := range subject.Courses {
			if course.Type != courseType {
				toSplit = true
			}
		}
		if !toSplit {
			subjectsNew = append(subjectsNew, subject)
		} else {
			lectureSubject := Subject{}
			practiceSubject := Subject{}
			for _, course := range subject.Courses {
				if course.Type == 0 {
					lectureSubject.Courses = append(lectureSubject.Courses, course)
				} else {
					practiceSubject.Courses = append(practiceSubject.Courses, course)
				}
			}
			subjectsNew = append(subjectsNew, &lectureSubject)
			subjectsNew = append(subjectsNew, &practiceSubject)
		}
	}

	return subjectsNew
}

func RecursiveScheduleFromScratch(subjects []*Subject) Set[*Course] {
	var tree = MakeEmptySchedule()
	schedule, _ := GetScheduleRecursive(subjects, tree)

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
