package handlers

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"slices"
)

func TanrendProxy(writer http.ResponseWriter, request *http.Request) {
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

	host := "https://tanrend.elte.hu/tanrendnavigation.php"
	if locale == "en" {
		host = "https://tanrend.elte.hu/tanrendnavigation_en.php"
	}
	remote, _ := url.Parse(host)

	proxy := httputil.NewSingleHostReverseProxy(remote)

	request.Host = remote.Host
	writer.Header().Set("X-Ben", "Rad")
	proxy.ServeHTTP(writer, request)
}
