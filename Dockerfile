# Use official Python image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files (excluding src/documents via .dockerignore)
COPY . .

# Expose port
EXPOSE 5000

# Run the Flask app
CMD ["python", "src/app.py"]
