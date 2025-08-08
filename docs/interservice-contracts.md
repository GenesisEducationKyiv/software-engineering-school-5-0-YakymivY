# Interservice Interface Contracts

This document outlines the boundaries and communication contracts between modules and microservices in the system.

## Table of Contents

1. Service Descriptions
2. Service Communication
3. Interface Contracts

### Service Descriptions

The system is composed of the following services:

- **Subscription Service**: managing user subscriptions (monolith module)
- **Weather Service**: providing weather data from external source (monolith module)
- **Mail Service**: sending emails (microservice)

### Service Communication

| Source Service       | Destination Service  | Protocol      | Description                                |
| -------------------- | -------------------- | ------------- | ------------------------------------------ |
| Subscription Service | Weather Service      | HTTP          | Request weather data                       |
| Weather Service      | Subscription Service | HTTP          | Send weather data                          |
| Subscription Service | Mail Service         | gRPC/RabbitMQ | Send confirmation and weather update email |

### Interface Contracts

#### RabbitMQ

Protocol: RabbitMQ   
Queue: email_queue   
Event: UserSubscribedEvent   
Payload:
  - email: string   
  - token: string

Direction: One-Way   
Durability: Persistent   

Protocol: RabbitMQ   
Queue: email_queue   
Event: WeatherUpdateEvent   
Payload:
  - weather: WeatherResponse   
  - subscription: SubscriptionPayload

Direction: One-Way   
Durability: Persistent   

#### gRPC

Protocol: gRPC   
Service: MailService   
Method: SendConfirmationEmail   
Request: SendConfirmationEmailRequest   
Response: SendConfirmationEmailResponse   

Protocol: gRPC   
Service: MailService   
Method: SendWeatherUpdateEmail   
Request: SendWeatherUpdateEmailRequest   
Response: SendWeatherUpdateEmailResponse
