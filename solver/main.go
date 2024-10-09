package main

// hard feltételek:
// ne legyen óra ütközés

// preferenciák:
// lyukas óra minimalizálás

type Course struct {
	Code    string   `json:"code"`
	Name    string   `json:"name"`
	Classes []*Class `json:"classes"`
}

type Class struct {
	Time       Time   `json:"time"`
	Code       string `json:"code"`
	Instructor string `json:"instructor"`
	Place      string `json:"place"`
	Capacity   int    `json:"capacity"`
	Type       int    `json:"type"` // 0 = 'lecture' | 1 = 'practice'
}

type Time struct {
	Start int `json:"start"` // 0 - 23.99
	End   int `json:"end"`   // 0 - 23.99
	Day   int `json:"day"`   // 0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday
}

const (
	monday    = iota
	tuesday   = iota
	wednesday = iota
	thursday  = iota
	friday    = iota
	saturday  = iota
	sunday    = iota
)

const (
	lecture  = iota
	practice = iota
)

func main() {
	println("Hello, world!")
}
