package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

func Hello(writer http.ResponseWriter, request *http.Request) {
	log.Println("Hello from server!")

	name := request.URL.Query().Get("name")
	if name != "" {
		fmt.Fprintf(writer, "Hello, %s.", name)
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(writer).
		Encode(map[string]string{"message": "Hello from server! 👋\nCurrent time: " + fmt.Sprint(time.Now())})

}
