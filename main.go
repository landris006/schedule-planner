package main

import (
	"log"
	"net/http"
	"os"
	"schedule-planner/api/handlers"
)

func main() {
	listenAddr := ":8080"
	if val, ok := os.LookupEnv("FUNCTIONS_CUSTOMHANDLER_PORT"); ok {
		listenAddr = ":" + val
	}

	http.HandleFunc("/", handlers.ServeStatic("static", "index.html"))
	http.HandleFunc("/api/hello", handlers.Hello)
	http.HandleFunc("/api/class", handlers.GetClasses)

	log.Printf("About to listen on %s.", listenAddr)

	log.Fatal(http.ListenAndServe(listenAddr, nil))
}
