package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// =================== MODELS ===================
type FetchData struct {
	ID        uint      `gorm:"primaryKey"`
	Location  string    `json:"location"`
	Url       string    `json:"url"`
	Data      string    `json:"data"`
	CreatedAt time.Time `json:"created_at"`
}

type Chat struct {
	ID        uint      `gorm:"primaryKey"`
	Message   string    `json:"message"`
	Response  string    `json:"response"`
	CreatedAt time.Time `json:"created_at"`
}

// =================== DB INIT ===================
var db *gorm.DB

func initDB() {
	var err error
	db, err = gorm.Open(sqlite.Open("nasa.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to database: " + err.Error())
	}
	db.AutoMigrate(&FetchData{}, &Chat{})
}

// =================== GEOCODING ===================
type GeoResponse []struct {
	Lat string `json:"lat"`
	Lon string `json:"lon"`
}

func geocodeLocation(location string) (string, string, error) {
	baseURL := "https://nominatim.openstreetmap.org/search"
	q := url.QueryEscape(location)
	reqURL := fmt.Sprintf("%s?q=%s&format=json&limit=1", baseURL, q)

	resp, err := http.Get(reqURL)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	var geoResp GeoResponse
	if err := json.Unmarshal(body, &geoResp); err != nil {
		return "", "", err
	}
	if len(geoResp) == 0 {
		return "", "", fmt.Errorf("location not found: %s", location)
	}
	return geoResp[0].Lat, geoResp[0].Lon, nil
}

// =================== NASA FETCH ===================
func fetchByLocation() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		location := ctx.Query("location")
		params := ctx.DefaultQuery("params", "ALLSKY_KT,WS10M")

		if location == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "location is required"})
			return
		}

		// Step 1: Check cache
		var record FetchData
		if err := db.Where("location = ?", location).Order("created_at desc").First(&record).Error; err == nil {
			if time.Since(record.CreatedAt) < 24*time.Hour {
				var cached map[string]interface{}
				_ = json.Unmarshal([]byte(record.Data), &cached)

				ctx.JSON(http.StatusOK, gin.H{
					"message":   "Data fetched from cache",
					"location":  location,
					"timestamp": record.CreatedAt,
					"data":      simplifyNASAResponse(cached),
				})
				return
			}
		}

		// Step 2: Fetch fresh from NASA
		lat, lon, err := geocodeLocation(location)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		url := fmt.Sprintf(
			"https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=%s&community=RE&longitude=%s&latitude=%s&format=JSON",
			params, lon, lat,
		)

		resp, err := http.Get(url)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()
		body, _ := ioutil.ReadAll(resp.Body)

		newRecord := FetchData{
			Location: location,
			Url:      url,
			Data:     string(body),
		}
		db.Create(&newRecord)

		var nasaResp map[string]interface{}
		_ = json.Unmarshal(body, &nasaResp)

		ctx.JSON(http.StatusOK, gin.H{
			"message":  "Data fetched from NASA",
			"location": location,
			"data":     simplifyNASAResponse(nasaResp),
		})
	}
}

// =================== RESPONSE SIMPLIFIER ===================
func simplifyNASAResponse(nasaResp map[string]interface{}) gin.H {
	props, ok := nasaResp["properties"].(map[string]interface{})
	if !ok {
		return gin.H{"error": "unexpected response structure"}
	}
	paramData := props["parameter"].(map[string]interface{})

	return gin.H{
		"solar": paramData["ALLSKY_KT"],
		"wind":  paramData["WS10M"],
	}
}

// =================== RECOMMEND ===================
type RecommendRequest struct {
	Region string `json:"region"`
	Type   string `json:"type"`
}

type RecommendResponse struct {
	BestLocations []string `json:"best_locations"`
	Reason        string   `json:"reason"`
}

func recommendHandler(c *gin.Context) {
	var req RecommendRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	}

	candidates := []string{"Nairobi", "Mombasa", "Kisumu", "Garissa", "Eldoret"}
	var results = make(map[string]float64)

	param := "ALLSKY_KT"
	if req.Type == "wind" {
		param = "WS10M"
	}

	for _, city := range candidates {
		lat, lon, err := geocodeLocation(city)
		if err != nil {
			continue
		}
		url := fmt.Sprintf(
			"https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=%s&community=RE&longitude=%s&latitude=%s&format=JSON",
			param, lon, lat,
		)
		resp, err := http.Get(url)
		if err != nil {
			continue
		}
		defer resp.Body.Close()
		body, _ := ioutil.ReadAll(resp.Body)

		var nasaResp map[string]interface{}
		_ = json.Unmarshal(body, &nasaResp)

		props := nasaResp["properties"].(map[string]interface{})
		paramData := props["parameter"].(map[string]interface{})
		data := paramData[param].(map[string]interface{})
		ann := data["ANN"].(float64)

		results[city] = ann
	}

	type kv struct {
		Key   string
		Value float64
	}
	var sorted []kv
	for k, v := range results {
		sorted = append(sorted, kv{k, v})
	}
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Value > sorted[j].Value
	})

	best := []string{}
	for i, kv := range sorted {
		if i >= 3 {
			break
		}
		best = append(best, fmt.Sprintf("%s (%.2f)", kv.Key, kv.Value))
	}

	reason := "Best locations for " + req.Type + " energy in " + req.Region
	c.JSON(http.StatusOK, RecommendResponse{BestLocations: best, Reason: reason})
}

// =================== CHATBOT ===================
type ChatRequest struct {
	Message string `json:"message"`
}
type ChatResponse struct {
	Reply string `json:"reply"`
}

func saveChat(message, response string) {
	db.Create(&Chat{Message: message, Response: response, CreatedAt: time.Now()})
}

func chatHandler(c *gin.Context) {
	var req ChatRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	}

	msg := strings.ToLower(req.Message)
	reply := ""

	if strings.Contains(msg, "hello") || strings.Contains(msg, "hi") {
		reply = "👋 Hello! Ask me about solar or wind energy — e.g., 'solar in Nairobi'."
		saveChat(req.Message, reply)
		c.JSON(http.StatusOK, ChatResponse{Reply: reply})
		return
	}

	// Determine energy type and location
	var param, location string
	if strings.Contains(msg, "solar") {
		param = "ALLSKY_KT"
	} else if strings.Contains(msg, "wind") {
		param = "WS10M"
	}
	words := strings.Fields(msg)
	if len(words) > 0 {
		location = words[len(words)-1]
	}

	if location == "" || param == "" {
		reply = "Try asking like this: 'solar in Nairobi' or 'wind in Garissa'."
		saveChat(req.Message, reply)
		c.JSON(http.StatusOK, ChatResponse{Reply: reply})
		return
	}

	lat, lon, err := geocodeLocation(location)
	if err != nil {
		reply = "❌ Sorry, I couldn’t find that location."
		saveChat(req.Message, reply)
		c.JSON(http.StatusOK, ChatResponse{Reply: reply})
		return
	}

	url := fmt.Sprintf(
		"https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=%s&community=RE&longitude=%s&latitude=%s&format=JSON",
		param, lon, lat,
	)

	resp, err := http.Get(url)
	if err != nil {
		reply = "⚠️ Error fetching NASA data."
		saveChat(req.Message, reply)
		c.JSON(http.StatusOK, ChatResponse{Reply: reply})
		return
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	var nasaResp map[string]interface{}
	_ = json.Unmarshal(body, &nasaResp)

	props, ok := nasaResp["properties"].(map[string]interface{})
	if !ok {
		reply = "Unexpected NASA response format."
		saveChat(req.Message, reply)
		c.JSON(http.StatusOK, ChatResponse{Reply: reply})
		return
	}

	paramData := props["parameter"].(map[string]interface{})
	data := paramData[param].(map[string]interface{})
	annual := data["ANN"]

	if param == "ALLSKY_KT" {
		reply = fmt.Sprintf("🌞 The average solar clearness index in %s is %.2f", location, annual)
	} else {
		reply = fmt.Sprintf("💨 The average wind speed at 10m in %s is %.2f m/s", location, annual)
	}

	saveChat(req.Message, reply)
	c.JSON(http.StatusOK, ChatResponse{Reply: reply})
}

func chatHistoryHandler(c *gin.Context) {
	var chats []Chat
	db.Order("created_at desc").Limit(20).Find(&chats)
	c.JSON(http.StatusOK, chats)
}

// =================== MAIN ===================
func main() {
	initDB()
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://your-frontend.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/energy")
	{
		api.GET("/location", fetchByLocation())
		api.POST("/chat", chatHandler)
		api.GET("/chat/history", chatHistoryHandler)
		api.POST("/recommend", recommendHandler)
	}

	r.Run(":8080")
}
