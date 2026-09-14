package tests

import (
	"testing"
	"time"

	"github.com/Zadigo/gopurchase/internal/backend/rabbit"
	ampq "github.com/rabbitmq/amqp091-go"
	"github.com/stretchr/testify/assert"
)

func TestRabbitMqApp(t *testing.T) {
	app := rabbit.NewRabbitMqApp(t.Context())
	assert.NotNil(t, app)

	defer app.Close()

	t.Run("should be able to get queue", func(t *testing.T) {
		queue := app.GetQueue("test-queue")
		assert.NotNil(t, queue)
	})

	t.Run("should be able to publish message", func(t *testing.T) {
		err := app.Publish("test-queue", []byte("Hello, RabbitMQ!"))
		assert.NoError(t, err)

		t.Run("should be able to get message after publishing", func(t *testing.T) {
			// app.Listen blocks forever by design (it is meant to run as a
			// long-lived consumer for the life of the process), so it is run
			// in a goroutine here and the test waits, with a bound, for the
			// listener callback to fire instead of waiting on Listen itself.
			received := make(chan struct{})

			go app.Listen("test-queue", func(queueName string, response ampq.Delivery) {
				assert.Equal(t, "test-queue", queueName)
				assert.Equal(t, "Hello, RabbitMQ!", string(response.Body))
				close(received)
			})

			select {
			case <-received:
			case <-time.After(5 * time.Second):
				t.Fatal("timed out waiting for published message to be delivered")
			}
		})
	})
}
