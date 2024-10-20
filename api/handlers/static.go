package handlers

import (
	"net/http"
	"os"
	"path/filepath"
)

func ServeStatic(staticPath string, indexPath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(staticPath, r.URL.Path)
		fi, err := os.Stat(path)
		if os.IsNotExist(err) || fi.IsDir() {
			http.ServeFile(w, r, filepath.Join(staticPath, indexPath))
			return
		}
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		http.FileServer(http.Dir(staticPath)).ServeHTTP(w, r)
	}
}
