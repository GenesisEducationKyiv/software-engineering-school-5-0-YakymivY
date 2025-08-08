# Weather App

## Live Demo

[View Live Application](https://weather-app-6nyd.onrender.com)

A NestJS-based weather application that provides weather information and related services. The application is built with TypeScript and uses PostgreSQL as its database.

## Features

- Weather data retrieval and processing
- RESTful API endpoints
- Database integration with PostgreSQL
- Docker containerization
- Automated database migrations
- Static file serving
- Email notifications (via nodemailer)

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js (v16 or higher)
- npm (v7 or higher)
- Docker and Docker Compose
- PostgreSQL (if running locally without Docker)

## Environment Setup

Create a `.env` file in the weather-app directory with the following variables:

```env
NODE_ENV=development
BASE_URL=http://localhost:3000/api

WEATHER_API_KEY=apikey
OPENWEATHERMAP_API_KEY=apikey
METRICS_API_KEY=apikey

DB_HOST=db
DB_PORT=5432
DB_USER=db_user
DB_PASS=db_pass
DB_NAME=weather_app

POSTGRES_USER=db_user
POSTGRES_PASSWORD=db_pass
POSTGRES_DB=weather_app

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASS=

MAIL_USER=mail_user
MAIL_PASS=mail_pass

PROTO_PATH=../../proto/mail.proto
MS_HOST=mail
MS_PORT=4000

RMQ_HOST=rabbitmq
RMQ_PORT=5672
RMQ_MGMT_PORT=15672
RMQ_USER=rabbitmq_user
RMQ_PASS=rabbitmq_pass
```

Create a `.env` file in the mail directory with the following variables:

```env
NODE_ENV=development
BASE_URL=http://localhost:4000/api

METRICS_API_KEY=apikey

MAIL_USER=mail_user
MAIL_PASS=mail_pass

RMQ_HOST=rabbitmq
RMQ_PORT=5672
RMQ_USER=rabbitmq_user
RMQ_PASS=rabbitmq_pass
```

## Running the Application

### Using Docker (Recommended)

1. Build and start the containers:

```bash
docker-compose up --build
```

This will:

- Start a PostgreSQL database
- Run database migrations
- Start the application server
- Start the mail server
- Start the RabbitMQ server
- Start the Prometheus server
- Start Redis instance

The weather-app will be available at `http://localhost:3000`
The mail microservice will be available at `http://localhost:4000`

## Development

### Available Scripts

- `npm run build` - Build the application
- `npm run start:dev` - Start development server with hot-reload
- `npm run start:debug` - Start development server in debug mode
- `npm run start:prod` - Start production server
- `npm run start:mail` - Start the mail microservice
- `npm run start:weather-app` - Start the weather app service
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run all tests (both mail and weather-app)
- `npm run test:mail` - Run mail service tests
- `npm run test:weather-app` - Run weather app tests
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run end-to-end tests
- `npm test:arch` - Run architecture tests
- `npm run migration:generate` - Generate new database migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
- `npm run proto:generate` - Generate TypeScript types from protobuf

#### Test Environment Management

- `npm run test:integration:start` - Start test containers
- `npm run test:integration:start:git` - Start test containers for CI
- `npm run test:integration:stop` - Stop test containers
- `npm run test:e2e:start` - Start end-to-end test environment
- `npm run test:e2e:stop` - Stop end-to-end test environment

## API Documentation

The API documentation will be available at `http://localhost:3000/api` when the server is running.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is unlicensed.
