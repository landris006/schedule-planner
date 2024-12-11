package solver

import (
	"fmt"
	"testing"
)

func TestRecursive(t *testing.T) {
	subjects := ReadSubjects("test_inputs/test_a.json")
	for _, s := range subjects {
		fmt.Println(s)
	}
	RecursiveScheduleFromScratch(subjects)
}
