# OAS Telemetry AI

This repository contains a modified version of the `oas-tools/oas-telemetry` package with an added AI module. The system provides a demonstration that simulates a normal architecture to enable telemetry queries. This demo is built using a microservice called "cascade runner" with multiple instances. These microservices receive JavaScript code and requests that they must make to other instances.

## Overview

The OAS Telemetry AI system is designed to collect, process, and analyze telemetry data from Express-based microservices using OpenTelemetry. It provides:

1. Middleware for Express applications to capture telemetry data
2. Tools for accessing and querying telemetry data
3. AI-powered analysis of telemetry data using OpenAI
4. A chat interface for natural language interaction with telemetry data

The system architecture consists of several key components:

- **OAS Telemetry Middleware**: Integrates with Express applications to collect telemetry data
- **Telemetry Data Collection**: Captures traces, logs, and metrics
- **AI Analysis Components**: Processes natural language queries using OpenAI
- **Cascade Runner**: Executes code and HTTP requests in sequence

## Repository Structure

The repository is organized into three main folders:

1. `oas-telemetry/`: The modified telemetry package with AI capabilities
2. `cascade-runner/`: The microservice that executes actions in sequence
3. `demo/`: A demonstration setup with multiple microservices

## Installation

To set up the project, follow these steps:

1. Install dependencies in each folder:

    ```bash
    # In oas-telemetry folder
    cd oas-telemetry
    npm install

    # In cascade-runner folder
    cd ../cascade-runner
    npm install

    # In demo folder
    cd ../demo
    npm install
    ```

2. Create a `.env` file in the `demo/` directory with your OpenAI API key:

    ```bash
    # In demo folder
    OPENAI_API_KEY=your_openai_api_key_here
    ```

## Usage

To run the demonstration:

1. Start the infrastructure (5 microservices) in one terminal:

```bash
cd demo
npm run start-infra
```

2. Start the demo in another terminal to send requests and generate data:

```bash
cd demo
npm run start-demo
```

3. Access the chat interface at `http://localhost:3000/telemetry/chat/ui` (or the appropriate URL for your setup)

To generate errors for testing, simply access a non-existent endpoint in your browser (e.g., `http://localhost:3000/endpoint-that-does-not-exist`). The chat interface will be able to provide information about these errors when queried.

## Chat Interface

The system provides a chat interface where you can ask questions about the telemetry data. Some example questions you can ask:

1. "Generate a report on metrics, logs and traces. Start with a summary."
2. "What is the telemetry status of the EmailService and Reporter microservices?"

The chat interface uses OpenAI to interpret your questions and execute the appropriate telemetry tools to retrieve and analyze data. It can communicate with external microservice agents to gather information across the system.

## Microservices

The demo includes several microservices that communicate with each other:

- Reporter (port 3000)
- AuthService (port 3001)
- RegistryService (port 3002)
- CollectorService (port 3003)
- EmailService (port 3004)

## Contributing

Feel free to contribute to this project by submitting issues or pull requests.

## License

This project is licensed under the MIT License.
