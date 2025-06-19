SETGuru: Socratic Emphatic Tutor Guru
Overview
SETGuru is an innovative AI-powered learning companion designed to enhance a student's learning journey through personalized, Socratic questioning and emotional intelligence. It guides students to discover solutions independently, adapting its approach based on their emotional state and preferred learning style.

This project is built with a hybrid microservices architecture using:

Frontend: Next.js (React)

Backend (API Gateway & User Data): Node.js with Express.js

AI Service: Python with FastAPI (powered by LangChain and Google/OpenAI LLMs)

Database: PostgreSQL

The entire application stack is containerized using Docker and orchestrated with Docker Compose, providing a seamless development and deployment experience.

Core Features
Socratic Questioning: The AI tutor never gives direct answers but asks guiding questions to lead students to independent problem-solving, fostering deeper understanding.

Emotional Intelligence: The AI detects student emotions (e.g., frustration, confusion, confidence) from text input and adapts its tone and questioning style to provide encouragement, suggest breaks, or simplify concepts.

Interactive Chat Interface: A modern, responsive messaging UI for natural conversation flow between the student and the AI.

Learning Progress Tracking: Visualizations to track concept mastery, time spent learning, and questions explored. (Requires user login functionality to be fully implemented)

Subject & Grade Selection: Students can select their subject and grade level to tailor learning sessions.

Achievement System: Badges and streak counters to motivate consistent learning. (Requires user login functionality to be fully implemented)

Pluggable AI Models: The Python AI service is designed with LangChain to easily switch between different Large Language Model (LLM) providers (e.g., Google Gemini, OpenAI GPT) based on configuration.

Architecture
graph TD
    User --- Frontend (Next.js)
    Frontend -->|HTTP Requests| Node.js Backend (API Gateway)
    Node.js Backend -->|HTTP Requests| Python AI Service
    Node.js Backend -->|Database Connection| PostgreSQL DB
    Python AI Service -->|LLM API Calls| Google/OpenAI LLM
    PostgreSQL DB -- Persistent Data --> Docker Volume

Getting Started
Follow these steps to get the SETGuru application up and running on your local machine using Docker Compose.

Prerequisites
Git: For cloning the repository.

Docker Desktop: Includes Docker Engine and Docker Compose. Ensure it's running before proceeding.

1. Clone the Repository
git clone <your-repository-url>
cd setguru-chatbot-dev # Or whatever your project root directory is named

2. Set Up Environment Variables
Create a file named .env in the root directory of your project (the same directory as docker-compose.yml). Populate it with the following required environment variables:

# .env (in your project root directory)

# --- Node.js Backend Configuration ---
NODEJS_BACKEND_PORT=3001 # Port for the Node.js backend to run on your host machine
TEMP_USER_ID= # REQUIRED: Temporary User ID for initial testing (see step 3)

# --- PostgreSQL Database Configuration ---
DB_USER=setguru_user     # Database username
DB_PASSWORD=your_strong_db_password # REQUIRED: Choose a strong password for your database user
DB_NAME=setguru_db       # Database name
DB_PORT=5432             # Internal PostgreSQL port (default)

# --- Python AI Service Configuration ---
PYTHON_AI_SERVICE_PORT=8000 # Port for the Python AI service to run on your host machine
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY # REQUIRED: Get this from Google Cloud Console (Generative AI API)
OPENAI_API_KEY= # OPTIONAL: Your OpenAI API key (if using OpenAI models)

# --- LLM Provider (can be 'google' or 'openai') ---
LLM_PROVIDER=google # Set 'google' for Gemini or 'openai' for GPT models

Important: Never commit this .env file to your Git repository! It's already included in .gitignore.

3. Initialize PostgreSQL Database
The Docker Compose setup will automatically create the database and tables for you using initialization scripts.

After running docker compose up for the first time (next step), you'll need to get the id of this testuser@example.com to set your TEMP_USER_ID in the root .env file.

To get the id:

Run docker compose exec db psql -U setguru_user -d setguru_db -c "SELECT id FROM users WHERE email = 'testuser@example.com';"

Copy the UUID displayed and paste it into your root .env as TEMP_USER_ID.

4. Build and Run the Application with Docker Compose
From your project's root directory (where docker-compose.yml and .env are), run the following command:

docker compose up --build

This command will:

Build Docker images for your Node.js backend, Python AI service, and Next.js frontend.

Pull the official PostgreSQL image.

Create and initialize the PostgreSQL database, running your SQL scripts.

Start all services and set up their internal networking.

The first build might take some time. Subsequent runs will be faster due to Docker's caching.

5. Access the Application
Once all services are running (you can check with docker compose ps):

Frontend: Open your web browser and navigate to http://localhost:3000

Node.js Backend API: http://localhost:3001/api (You can test this with Postman, e.g., GET http://localhost:3001/api/user-data)

Python AI Service API (internal to Node.js): http://localhost:8000 (You can test this with Postman, e.g., POST http://localhost:8000/ai/analyze-emotion)

PostgreSQL: Accessible on localhost:5432 from your host machine if you exposed the port.

Key Configuration & Customization
Environment Variables
All critical environment variables are managed in the root .env file and injected into the respective Docker containers.

NODEJS_BACKEND_PORT: Changes the port the Node.js backend listens on the host machine.

PYTHON_AI_SERVICE_PORT: Changes the port the Python AI service listens on the host machine.

DB_USER, DB_PASSWORD, DB_NAME: PostgreSQL credentials.

TEMP_USER_ID: Used by the Node.js backend and frontend for data operations before full authentication is implemented. Crucial for initial testing.

GOOGLE_API_KEY: Required for Google Gemini models.

OPENAI_API_KEY: Required if LLM_PROVIDER is set to openai.

LLM_PROVIDER: Specifies which LLM provider to use (google or openai).

Internal Docker Networking
Within the Docker Compose network, services communicate using their service names defined in docker-compose.yml:

Node.js backend connects to PostgreSQL as db.

Node.js backend connects to Python AI service as python-ai-service.

These internal URLs are automatically handled by the Docker Compose setup.

Development
Stopping the Application
To stop all running Docker containers:

docker compose down

To stop and remove containers, networks, and volumes (useful for a clean start, especially after changing DB initialization scripts):

docker compose down -v

Rebuilding Services
If you make changes to:

Code within studio/, new-nodejs-backend/, or new-python-ai-service/.

Any Dockerfile.

requirements.txt or package.json in any service.

You should rebuild the images when bringing up the services:

docker compose up --build

Viewing Logs
To view logs for all services:

docker compose logs

To view logs for a specific service (e.g., Node.js backend):

docker compose logs nodejs-backend

Next Steps & Future Enhancements
Implement User Authentication: Replace the TEMP_USER_ID with a full authentication system (e.g., JWT-based auth via your Node.js backend).

Enhance AI Logic: Further refine the Socratic questioning and emotional intelligence flows.

Add Real-time Features: Implement WebSockets for real-time chat updates rather than polling.

Error Handling: Strengthen error handling across all services.

Testing: Implement comprehensive unit and integration tests.

Deployment: Configure for a production environment (e.g., Kubernetes, AWS ECS, Google Cloud Run).

User Progress & Achievements: Implement logic within the chat interface to update user_progress and user_achievements in real-time as students interact.

Feel free to contribute and improve SETGuru!