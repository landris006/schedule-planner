package handlers

import (
	"encoding/json"
	"net/http"
	"schedule-planner/solver"
)

type SolverRequest struct {
	Subjects []*solver.Subject `json:"subjects"`
	Filters  []*solver.Filter  `json:"filters"`
}

func Solver(writer http.ResponseWriter, request *http.Request) {
	var requestBody SolverRequest
	err := json.NewDecoder(request.Body).Decode(&requestBody)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}

	var courseGraph = solver.CourseGraph{}
	courseGraph.BuildGraph(requestBody.Subjects, requestBody.Filters)

	var scheduledCourses = solver.CreateScheduleFromScratch(&courseGraph).Elements()

	var subjectsResult = courseNodesToSubjects(scheduledCourses)

	writer.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(writer).Encode(subjectsResult)
}

func courseNodesToSubjects(courseNodes []*solver.CourseNode) []*solver.Subject {
	var subjectMap = make(map[string]*solver.Subject)
	for _, courseNode := range courseNodes {
		for _, course := range courseNode.Courses.Elements() {
			var subjectCode = course.Subject.Code

			if _, ok := subjectMap[subjectCode]; !ok {
				course.Subject.Courses = make([]*solver.Course, 0)
				subjectMap[subjectCode] = course.Subject
			}

			var subject = subjectMap[subjectCode]

			course.Subject = nil
			subject.Courses = append(subject.Courses, course)
		}
	}

	var subjectsArray = make([]*solver.Subject, 0, len(subjectMap))
	for _, subject := range subjectMap {
		subjectsArray = append(subjectsArray, subject)
	}

	return subjectsArray
}
