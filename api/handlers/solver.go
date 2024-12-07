package handlers

import (
	"encoding/json"
	"net/http"
	"schedule-planner/solver"
)

func Solver(writer http.ResponseWriter, request *http.Request) {
	var subjectsInput []*solver.Subject

	err := json.NewDecoder(request.Body).Decode(&subjectsInput)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}

	var courseGraph = solver.CourseGraph{}
	courseGraph.BuildGraph(subjectsInput)

	var scheduledCourses = solver.CreateScheduleFromScratch(&courseGraph).Elements()

	var subjectsResult = courseNodesToSubjects(scheduledCourses)

	writer.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(writer).Encode(subjectsResult)
}

func courseNodesToSubjects(courseNodes []*solver.CourseNode) []*solver.Subject {
	var subjectMap = make(map[string]*solver.Subject)
	for _, courseNode := range courseNodes {
		var subjectCode = courseNode.Course.Subject.Code

		if _, ok := subjectMap[subjectCode]; !ok {
			courseNode.Course.Subject.Courses = make([]*solver.Course, 0)
			subjectMap[subjectCode] = courseNode.Course.Subject
		}

		var subject = subjectMap[subjectCode]

		courseNode.Course.Subject = nil
		subject.Courses = append(subject.Courses, courseNode.Course)
	}

	var subjectsArray = make([]*solver.Subject, 0, len(subjectMap))
	for _, subject := range subjectMap {
		subjectsArray = append(subjectsArray, subject)
	}

	return subjectsArray
}
