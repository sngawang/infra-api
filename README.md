# 🐍 Snake Game – Flask Web App

This is a simple web-based version of the classic Snake game built with:

- ✅ Python + Flask (backend)
- 🎨 HTML + JavaScript (frontend, canvas rendering)
- 🐳 Docker (containerization)
- ☁️ AWS + Terraform (infrastructure)
- 🔁 GitHub Actions (CI/CD)

---

## 🎮 Features

- Snake game rendered in browser using `<canvas>`
- Arrow key controls (desktop)
- Dynamic score and high score tracking
- Backend API (`/api/high-score`) saves highest score (stored in `high_scores.json`)
- Game Over screen with Restart / End options
- CI/CD with GitHub Actions (auto deploy on push)
- Deployable via:
  - 🔹 EC2 + Docker
  - 🔹 ECS + ECR (container orchestration)

---

## 📦 Tech Stack

| Layer        | Tool                        |
|--------------|-----------------------------|
| Backend      | Flask (Python)              |
| Frontend     | HTML + CSS + JavaScript     |
| Infra (IaC)  | Terraform                   |
| Container    | Docker                      |
| CI/CD        | GitHub Actions              |
| Cloud        | AWS (EC2, ECS, ECR)         |

---

## 🚀 How to Run Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py

# Or run via Docker
docker build -t snake-game .
docker run -p 5000:5000 snake-game


## 🌐 Infrastructure Deployment

The infrastructure for this app is built using Terraform on AWS.

👉 [See detailed Terraform setup and deployment guide](aws-infra/README.md)
