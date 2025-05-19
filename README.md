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

Create a `.env` file in the root directory with the following variables:

```env
BASE_URL=http://localhost:3000/api
WEATHER_API_KEY=your_api_key (API key from https://weatherapi.com)
DB_HOST=db
DB_PORT=5432
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
MAIL_USER=email_address (Email address used to send updates)
MAIL_PASS=email_app_pass (Password or app-specific password)
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

The application will be available at `http://localhost:3000`

### Running Locally

1. Install dependencies:

```bash
npm install
```

2. Run database migrations:

```bash
npm run migration:run
```

3. Start the development server:

```bash
npm run start:dev
```

For production:

```bash
npm run build
npm run start:prod
```

## Development

### Available Scripts

- `npm run build` - Build the application
- `npm run start:dev` - Start development server with hot-reload
- `npm run start:prod` - Start production server
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Documentation

The API documentation will be available at `http://localhost:3000/api` when the server is running.

## Testing

Run the test suite:

```bash
npm run test
```

For test coverage:

```bash
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is unlicensed.
