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
	http.HandleFunc("/api/solver", handlers.Solver)
	http.HandleFunc("/tanrendnavigation", handlers.TanrendProxy)

	log.Printf("About to listen on %s.", listenAddr)

	log.Fatal(http.ListenAndServe(listenAddr, nil))
}
