package main

import (
	"context"
	"log"
	"os"
	"os/signal"

	"github.com/bayzed123/mycommerce/services/gopurchase/internal/server"
	"github.com/bayzed123/mycommerce/services/gopurchase/internal/utils"
	"github.com/joho/godotenv"
)

func main() {
	// .env is optional: local development loads it for convenience, but
	// deployed environments (Docker, Railway, Render, systemd, etc.) inject
	// real environment variables directly and ship no .env file at all.
	if err := godotenv.Load(".env"); err != nil {
		log.Printf("no .env file loaded (%v); continuing with process environment", err)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	absPath, err := utils.GetAbsolutePath(".")
	if err != nil {
		log.Panicf("❌ Could not get absolute path: %v", err)
	}

	ctx = context.WithValue(ctx, "rootDir", absPath)
	ctx = context.WithValue(ctx, "debug", os.Getenv("DEBUG") == "true")

	server := server.NewServerApp(ctx)
	err = server.Start()
	if err != nil {
		log.Panicf("❌ Could not start server: %v", err)
	}
}
