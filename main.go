package main

import (
	"log"
	"net/http"
	"os"
	"schedule-planner/api"
)

func main() {
	listenAddr := ":8080"
	if val, ok := os.LookupEnv("FUNCTIONS_CUSTOMHANDLER_PORT"); ok {
		listenAddr = ":" + val
	}

	http.Handle("/", http.FileServer(http.Dir("./static")))
	http.HandleFunc("/api/hello", api.Hello)

	log.Printf("About to listen on %s.", listenAddr)

	log.Fatal(http.ListenAndServe(listenAddr, nil))
}
