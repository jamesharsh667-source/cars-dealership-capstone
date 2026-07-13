# Cars Dealership — Full-Stack Capstone

A responsive web app for **Cars Dealership**, a national car retailer, that
lets customers find dealership branches and read/write reviews (with
automatic sentiment analysis on each review).

## Architecture

```
                     ┌──────────────────┐
                     │   React frontend  │  (nginx, port 80/3000)
                     └────────┬──────────┘
                              │ REST (fetch)
                     ┌────────▼──────────┐
                     │   Django backend   │  (gunicorn, port 8000)
                     │  - auth (SQLite)   │
                     │  - CarMake/Model   │
                     └───┬───────────┬────┘
                         │           │
             ┌───────────▼──┐   ┌────▼─────────────┐
             │  Node.js/     │   │  Flask sentiment  │
             │  Express      │   │  analyzer          │
             │  (dealers +   │◄──┤  (VADER, NLTK)     │
             │   reviews)    │   └────────────────────┘
             └───────┬───────┘
                     │
              ┌──────▼──────┐
              │  MongoDB     │
              └──────────────┘
```

- **Frontend (React)** — `frontend/`. Pages: Home, Dealers (with state
  filter), Dealer detail + reviews, Post Review, Login, Register, About,
  Contact.
- **Django backend** — `server/`. Owns user auth and a small SQLite-backed
  `CarMake`/`CarModel` catalog. Proxies dealer/review requests to the Node
  service and calls the Flask service to score review sentiment.
- **Node.js + MongoDB microservice** — `database/`. Stores dealership and
  review documents; exposes `/fetchDealers`, `/fetchDealer/:id`,
  `/fetchReviews/dealer/:id`, `/insert_review`.
- **Flask sentiment-analysis microservice** — `sentiment_analyzer/`. Scores
  free-text reviews as positive / neutral / negative using NLTK's VADER.

## Same-origin API proxy (important)

The frontend never calls Django on a different port directly. Both in
Docker (`frontend/nginx-templates/default.conf.template`) and in local dev
(the `"proxy"` field in `frontend/package.json`), requests to
`/djangoapp/...` are proxied to the Django service. This keeps the
browser's view of frontend + API as **one origin**, which is what lets the
session cookie used for login/register/add-review work reliably without
CORS or SameSite-cookie issues. Kubernetes achieves the same thing via the
Ingress routing rules in `kubernetes/frontend-deployment.yaml`.

## Running locally with Docker Compose

```bash
docker compose up --build
```

This starts MongoDB, the sentiment analyzer, the Node service, the Django
backend, and the React frontend (nginx), all wired together. Then seed the
database once the containers are up:

```bash
docker compose exec node_app node seed.js
docker compose exec django_app python manage.py migrate
docker compose exec django_app python manage.py shell -c "from djangoapp.populate import initiate; initiate()"
```

Visit the app at **http://localhost:3000**. The Django API lives at
**http://localhost:8000/djangoapp**.

## Running services individually (dev mode)

```bash
# MongoDB (or point MONGO_URI at Atlas / a local instance)
docker run -d -p 27017:27017 --name mongo_db mongo:7

# Sentiment analyzer
cd sentiment_analyzer && pip install -r requirements.txt && python app.py

# Node dealer/review service
cd database && npm install && npm start

# Django backend
cd server && pip install -r requirements.txt
python manage.py migrate
python manage.py shell -c "from djangoapp.populate import initiate; initiate()"
python manage.py runserver

# React frontend
cd frontend && npm install && npm start
```

## Testing

Each service has a real, runnable test suite (these are what CI runs):

```bash
# Django — model tests, health check, register/login flow
cd server && python manage.py test djangoapp

# Node/Express — health check + (if MONGO_URI is reachable) dealer/review CRUD
cd database && MONGO_URI=mongodb://localhost:27017/dealershipsDB_test npm test

# Flask sentiment analyzer — classification + endpoint tests
cd sentiment_analyzer && pytest -v

# React — smoke test that the app shell renders
cd frontend && npm test -- --watchAll=false
```

## Deployment

- **Docker** — every service has its own `Dockerfile`.
- **Kubernetes** — manifests in `kubernetes/` (Deployment + Service per
  service, a PVC for MongoDB, a Secret for the Django key, and an Ingress
  routing `/` to the frontend and `/djangoapp` to the Django backend).
  Replace `<YOUR_REGISTRY>` with your registry path before applying:
  `kubectl apply -f kubernetes/`.
- **IBM Cloud Code Engine** — each container image can be pushed to IBM
  Cloud Container Registry and deployed as a Code Engine application; see
  `.github/workflows/ci-cd.yml` for a scripted example (`ibmcloud ce app
  update`).
- **CI/CD** — `.github/workflows/ci-cd.yml` lints/tests all four services,
  builds and pushes Docker images on `main`, and deploys them to IBM Cloud
  Code Engine. Requires these repo secrets: `IBM_CLOUD_API_KEY`,
  `IBM_CLOUD_REGION`, `ICR_REGISTRY`, `ICR_NAMESPACE`, `CODE_ENGINE_PROJECT`.

## Skills demonstrated

Version control (Git/GitHub) · CI/CD (GitHub Actions) · responsive UI
design (React) · microservices architecture (Django + Node + Flask) ·
sentiment analysis (NLTK VADER) · containerization (Docker) · orchestration
(Kubernetes) · cloud deployment (IBM Cloud Code Engine).
