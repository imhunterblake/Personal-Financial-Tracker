package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Define the structure of a transaction
type transaction struct {
	Description string `json:"description"`
	Amount      int    `json:"amount"`
	Category    string `json:"category"`
	Date        string `json:"date"`
	ID          int    `json:"id"`
}

// In-memory cache for transactions
var (
	transactionCache []transaction
	transactionMap   map[int]*transaction
	cacheMutex       sync.RWMutex
	cacheInitialized bool
)

// Helper function to load transactions from the JSON file
func loadTransactionsFromFile() ([]transaction, error) {
	fileContent, err := os.ReadFile("data/transactions.json")
	if err != nil {
		// If file doesn't exist, return empty slice
		if os.IsNotExist(err) {
			return []transaction{}, nil
		}
		return nil, err
	}

	var transactions []transaction
	err = json.Unmarshal(fileContent, &transactions)
	if err != nil {
		return nil, err
	}

	return transactions, nil
}

// Helper function to save transactions to the JSON file
func saveTransactionsToFile(transactions []transaction) error {
	updatedData, err := json.MarshalIndent(transactions, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile("data/transactions.json", updatedData, 0644)
}

// Initialize or refresh the in-memory cache and hashmap
func initializeCache() error {
	cacheMutex.Lock()
	defer cacheMutex.Unlock()

	transactions, err := loadTransactionsFromFile()
	if err != nil {
		return err
	}

	transactionCache = transactions
	transactionMap = make(map[int]*transaction, len(transactions))

	// Build hashmap for ID lookups
	for i := range transactionCache {
		transactionMap[transactionCache[i].ID] = &transactionCache[i]
	}

	cacheInitialized = true
	return nil
}

// Get transactions from cache (avoids file I/O)
func getCachedTransactions() ([]transaction, error) {
	cacheMutex.RLock()
	defer cacheMutex.RUnlock()

	if !cacheInitialized {
		cacheMutex.RUnlock()
		err := initializeCache()
		cacheMutex.RLock()
		if err != nil {
			return nil, err
		}
	}

	// Return a copy to prevent external modifications
	result := make([]transaction, len(transactionCache))
	copy(result, transactionCache)
	return result, nil
}

// Get all transactions
func getTransactions(c *gin.Context) {
	// Use cached transactions instead of reading from file every time
	loadedTransactions, err := getCachedTransactions()
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Could not read transactions"})
		return
	}

	// Return the transactions as a JSON response
	c.IndentedJSON(http.StatusOK, loadedTransactions)
}

// Get a transaction by its ID
func transactionById(c *gin.Context) {
	// Extract the transaction ID from the URL parameter
	id := c.Param("id")
	transaction, err := getTransactionById(id)

	if err != nil {
		// Return a 404 error if the transaction is not found
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "Transaction not found!"})
		return
	}

	// Return the transaction as a JSON response
	c.IndentedJSON(http.StatusOK, transaction)
}

// Helper function to find a transaction by its ID
func getTransactionById(id string) (*transaction, error) {
	// Convert the ID from string to integer
	idInt, err := strconv.Atoi(id)
	if err != nil {
		return nil, errors.New("invalid transaction ID")
	}

	// Ensure cache is initialized
	cacheMutex.RLock()
	if !cacheInitialized {
		cacheMutex.RUnlock()
		if err := initializeCache(); err != nil {
			return nil, err
		}
		cacheMutex.RLock()
	}

	// O(1) hashmap lookup instead of O(n) linear search
	t, found := transactionMap[idInt]
	cacheMutex.RUnlock()

	if !found {
		return nil, errors.New("transaction not found")
	}

	// Return a copy to prevent external modifications
	result := *t
	return &result, nil
}

// Create a new transaction
func createTransaction(c *gin.Context) {
	var newTransaction transaction

	// Bind the incoming JSON to the transaction struct
	if err := c.BindJSON(&newTransaction); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	// Read the existing transactions from the file
	transactions, err := loadTransactionsFromFile()
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Could not read transactions"})
		return
	}

	// Add the new transaction to the slice
	transactions = append(transactions, newTransaction)

	// Save the updated transactions back to the file
	err = saveTransactionsToFile(transactions)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Could not save transaction"})
		return
	}

	// Refresh cache after modification
	initializeCache()

	// Return the newly created transaction as a JSON response
	c.IndentedJSON(http.StatusCreated, newTransaction)
}

// Update a transaction
func updateTransaction(c *gin.Context) {
	var newTransaction transaction
	var updatedTransaction transaction

	// Extract the transaction ID
	id := c.Param("id")

	// Convert the ID from string to integer
	idInt, err := strconv.Atoi(id)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	// Bind the incoming JSON to the transaction struct
	if err := c.BindJSON(&newTransaction); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	// Read the existing transactions from the file
	transactions, err := loadTransactionsFromFile()
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Could not read transactions"})
		return
	}

	// Find the transaction with the given ID
	found := false
	for i, t := range transactions {
		if t.ID == idInt {
			newTransaction.ID = t.ID
			transactions[i] = newTransaction
			updatedTransaction = newTransaction
			found = true
			break
		}
	}

	// If the transaction is not found, return a 404 error
	if !found {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	// Save the updated transactions back to the file
	err = saveTransactionsToFile(transactions)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Could not save transaction"})
		return
	}

	// Refresh cache after modification
	initializeCache()

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Update Successful!", "transaction": updatedTransaction})
}

// Delete a transaction
func deleteTransaction(c *gin.Context) {
	// Extract the transaction ID from the URL parameter
	id := c.Param("id")

	// Convert the ID from string to integer
	idInt, err := strconv.Atoi(id)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	// Read the existing transactions from the file
	transactions, err := loadTransactionsFromFile()
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Could not read transactions"})
		return
	}

	// Find and remove the transaction with the given ID
	found := false
	for i, t := range transactions {
		if t.ID == idInt {
			transactions = append(transactions[:i], transactions[i+1:]...)
			found = true
			break
		}
	}

	// If the transaction is not found, return a 404 error
	if !found {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	// Save the updated transactions back to the file
	err = saveTransactionsToFile(transactions)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "Could not save transaction"})
		return
	}

	// Refresh cache after modification
	initializeCache()

	// Return a success message as a JSON response
	c.IndentedJSON(http.StatusOK, gin.H{"message": "Transaction deleted successfully"})
}

func main() {
	// Initialize the cache at startup for better performance
	if err := initializeCache(); err != nil {
		// If cache initialization fails, log a warning but continue
		// The cache will be lazy-loaded on first request
		println("Warning: Failed to initialize cache at startup:", err.Error())
	}

	// Initialize the Gin router
	router := gin.Default()

	allowedOrigins := []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	if frontendURL := os.Getenv("FRONTEND_URL"); frontendURL != "" {
		for _, origin := range strings.Split(frontendURL, ",") {
			trimmed := strings.TrimSpace(origin)
			if trimmed != "" {
				allowedOrigins = append(allowedOrigins, trimmed)
			}
		}
	}

	// Enable CORS to allow requests from the frontend
	router.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			for _, allowedOrigin := range allowedOrigins {
				if origin == allowedOrigin {
					return true
				}
			}

			return strings.HasSuffix(origin, ".up.railway.app") || strings.HasSuffix(origin, ".railway.app")
		},
		AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Define the API routes
	router.GET("/data/transactions", getTransactions)
	router.GET("/data/transactions/:id", transactionById)
	router.POST("/data/transactions", createTransaction)
	router.DELETE("/data/transactions/:id", deleteTransaction)
	router.PATCH("/data/transactions/:id", updateTransaction)

	// Start the server on Railway-provided port in production
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router.Run(":" + port)
}
