FROM python:3.11-slim

# Set the working directory
WORKDIR /app    

# Copy the requirements file into the container
COPY requirements.txt requirements.txt

# Install the required packages
RUN pip install --no-cache-dir -r requirements.txt  

# Copy the rest of the application code into the container
COPY . .    

# Expose the port the app runs on
EXPOSE 5000

# Run the app
CMD ["python", "app.py"]