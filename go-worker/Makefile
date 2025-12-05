.PHONY: help build run test clean docker-build docker-run

help: ## Mostra este help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Compila o worker
	go build -o worker cmd/worker/main.go

run: ## Executa o worker localmente
	go run cmd/worker/main.go

test: ## Executa os testes
	go test -v ./...

test-coverage: ## Executa testes com coverage
	go test -cover ./...

clean: ## Remove arquivos de build
	rm -f worker
	rm -f go-worker

deps: ## Baixa as dependências
	go mod download
	go mod tidy

docker-build: ## Constrói a imagem Docker
	docker build -t go-worker:latest .

docker-run: ## Executa o container Docker
	docker run --rm \
		-e RABBITMQ_URL=amqp://guest:guest@host.docker.internal:5672/ \
		-e NESTJS_API_URL=http://host.docker.internal:3000 \
		go-worker:latest

lint: ## Executa linter (requer golangci-lint)
	golangci-lint run

fmt: ## Formata o código
	go fmt ./...

vet: ## Executa go vet
	go vet ./...

