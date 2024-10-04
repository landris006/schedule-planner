package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	utils "schedule-planner/api"
	"strconv"
	"strings"

	"golang.org/x/net/html"
)

func GetCourses(writer http.ResponseWriter, request *http.Request) {
	name := request.URL.Query().Get("name")
	// TODO: mode
	// mode := request.URL.Query().Get("mode")

	doc, err := scrapeCourses(name)
	if err != nil {
		log.Print(err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	courses := parseHtml(doc)

	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusOK)
	err = json.NewEncoder(writer).Encode(courses)
	if err != nil {
		log.Print(err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func scrapeCourses(name string) (*html.Node, error) {
	url := "https://tanrend.elte.hu/tanrendnavigation.php"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add(
		"Accept",
		"text/html",
	)

	query := req.URL.Query()
	query.Add("m", "keresnevre")
	query.Add("k", name)
	query.Add("f", "2024-2025-1")
	req.URL.RawQuery = query.Encode()

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	doc, err := html.Parse(resp.Body)
	defer resp.Body.Close()
	if err != nil {
		return nil, err
	}

	return doc, nil
}

type Course struct {
	Code    string   `json:"code"`
	Name    string   `json:"name"`
	Classes []*Class `json:"classes"`
}

type Class struct {
	Code       string `json:"code"`
	Instructor string `json:"instructor"`
	Time       string `json:"time"`
	Place      string `json:"place"`
	Capacity   int    `json:"capacity"`
	Type       string `json:"type"`
}

// TODO: error handling
func parseHtml(root *html.Node) []*Course {
	rows := parseIntoRows(root)

	courses := make(map[string]*Course)

	for _, row := range rows {
		split := strings.Split(row.Code, " ")
		code, classType := split[0], split[1]

		// TODO: find a more sofisticated way to find the common part of the code
		courseCode := utils.FirstN(code, 10)

		if _, ok := courses[courseCode]; !ok {
			courses[courseCode] = &Course{
				Code:    courseCode,
				Name:    row.Name,
				Classes: make([]*Class, 0),
			}
		}
		course := courses[courseCode]

		course.Classes = append(course.Classes, &Class{
			Code:       row.Code,
			Instructor: row.Instructor,
			Time:       row.Time,
			Place:      row.Place,
			Capacity:   row.Capacity,
			Type:       classType,
		})
	}

	coursesArray := make([]*Course, len(courses))
	i := 0
	for _, course := range courses {
		coursesArray[i] = course
		i++
	}

	return coursesArray
}

type Row struct {
	Time            string
	Code            string
	Name            string
	Place           string
	Capacity        int
	Instructor      string
	NumberOfClasses string
}

func parseIntoRows(root *html.Node) []Row {
	rows := make([]Row, 0)

	var traverse func(*html.Node)
	traverse = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Parent.Data == "tbody" && n.Data == "tr" {

			row := Row{}
			index := 0
			for c := n.FirstChild; c != nil; c = c.NextSibling {
				if c.Type == html.ElementNode && c.Data == "td" {
					switch index {
					case 0:
						row.Time = c.FirstChild.Data
					case 1:
						row.Code = c.FirstChild.Data
					case 2:
						row.Name = c.FirstChild.Data
					case 3:
						row.Place = c.FirstChild.Data
					case 4:
						parsed, err := strconv.Atoi(c.FirstChild.Data)
						if err != nil {
							row.Capacity = 0
						}
						row.Capacity = parsed
					case 5:
						row.Instructor = c.FirstChild.Data
					case 6:
						row.NumberOfClasses = c.FirstChild.Data
					default:
						log.Printf("Unexpected structure. <%s>", c.Data)
					}
					index++
				}
			}

			rows = append(rows, row)
		}

		for c := n.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}
	traverse(root)

	return rows
}
