package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"slices"
	"strconv"

	"golang.org/x/net/html"
)

func GetClasses(writer http.ResponseWriter, request *http.Request) {
	mode := request.URL.Query().Get("mode")
	term := request.URL.Query().Get("term")
	semester := request.URL.Query().Get("semester")

	cookie, err := request.Cookie("locale")
	var locale string
	if err != nil {
		locale = "en"
	} else {
		locale = cookie.Value
	}

	if !slices.Contains([]string{"hu", "en"}, locale) {
		log.Print("Invalid locale")
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	doc, err := scrapeClasses(mode, term, semester, locale)
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

func scrapeClasses(mode string, term string, semester string, locale string) (*html.Node, error) {
	url := "https://tanrend.elte.hu/tanrendnavigation.php"
	if locale == "en" {
		url = "https://tanrend.elte.hu/tanrendnavigation_en.php"
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add(
		"Accept",
		"text/html",
	)

	query := req.URL.Query()
	query.Add("m", mode)
	query.Add("k", term)
	query.Add("f", semester)
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

type Row struct {
	Time            string `json:"time"`
	Code            string `json:"code"`
	Name            string `json:"name"`
	Place           string `json:"place"`
	Capacity        int    `json:"capacity"`
	Instructor      string `json:"instructor"`
	NumberOfClasses string `json:"numberOfClasses"`
}

// TODO: error handling
func parseHtml(root *html.Node) []Row {
	rows := make([]Row, 0)

	var traverse func(*html.Node)
	traverse = func(n *html.Node) {
		if n != nil && n.Type == html.ElementNode && n.Parent.Data == "tbody" && n.Data == "tr" {

			row := Row{}
			index := 0
			for c := n.FirstChild; c != nil && c.FirstChild != nil; c = c.NextSibling {
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
