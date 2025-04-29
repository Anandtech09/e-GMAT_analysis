# e-GMAT Review Analyzer

An AI-powered tool to automatically analyze e-GMAT reviews from GMAT Club and generate insights such as:

- Top requested features
- Most praised strengths
- Trend analysis over the past 4 years
- PDF export of results

This project uses:

- **Backend**: FastAPI server with OpenRouter API for AI-powered operations.
- **Frontend**: Vite + React for a clean and fast dashboard UI.

---

# 📁 Project Structure

```
e-GMAT_analysis/
├── backend/         # FastAPI backend
│   └── server.py    # Main backend server file
├── public/          # Vite public assets
├── src/             # React frontend source
│   ├── components/  # React UI components
│   ├── pages/       # Pages (home, dashboard etc.)
│   └── App.jsx      # Main App entry
├── package.json     # Frontend dependencies
├── vite.config.js   # Vite config
└── README.md        # (you are here)
```

---

# 🚀 How to Run Locally

## 1. Clone the Repository

```bash
git clone https://github.com/Anandtech09/e-GMAT_analysis.git
cd e-GMAT_analysis
```

---

## 2. Backend Setup (FastAPI)

### Step into the backend folder:

```bash
cd backend
```

### Create and activate a Python virtual environment:

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

### Install dependencies:

```bash
pip install -r requirements.txt
```


### Create a `.env` file inside the `backend/` folder:

```bash
touch .env
```

Inside `.env`:

```env
OPEN_ROUTER_API_KEY=your_openrouter_api_key_here
```

### Run the backend server:

```bash
uvicorn server:app --reload --port 8000
```

- Server will start at: `http://localhost:8000`

---

## 3. Frontend Setup (Vite + React)

### Come back to the project root:

```bash
cd ..
```

### Install frontend dependencies:

```bash
npm install
```

### Run the Vite development server:

```bash
npm run dev
```

- Frontend will run on: `http://localhost:5173` (default Vite port)

---

# ⚙️ API Overview (Backend)

| Method | Endpoint            | Description                                     |
| ------ | ------------------- | ----------------------------------------------- |
| `POST` | `/analyze-reviews/` | Send review text to analyze features/strengths. |
| `GET`  | `/health`           | Simple health check of the server.              |

*(More endpoints can be added as needed.)*

---

# 📋 Environment Variables

The backend requires the following environment variable:

| Key                  | Value                                              |
| -------------------- | -------------------------------------------------- |
| `OPEN_ROUTER_API_KEY` | Your OpenRouter API key (for accessing LLM models) |

---

# 📊 Features Planned

- Review scraper (automated)
- Summarization of most-demanded features
- Detection of most praised strengths
- Trend analysis year-wise
- Generate downloadable PDF reports
- Clean frontend dashboard (React)

---

# ⚒️ Tech Stack

| Area           | Tools                                         |
| -------------- | --------------------------------------------- |
| Backend        | FastAPI, Uvicorn, OpenAI API (via OpenRouter) |
| Frontend       | React.js (Vite), Axios                        |
| PDF Generation | (coming soon)                                 |

---

# 🙍 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [Vite.js](https://vitejs.dev/)
- [OpenRouter API](https://openrouter.ai/)
- [GMAT Club Reviews](https://gmatclub.com/reviews/e-gmat-6)

---