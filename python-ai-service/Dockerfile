# new-python-ai-service/Dockerfile
# Use the official Python image as a base
FROM python:3.10-slim-buster

# Set the working directory
WORKDIR /app

# Copy requirements file and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the FastAPI app runs on
EXPOSE 8000

# Command to run the application using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]