# AgriVision AI

**Intelligent Crop Health. Smarter Farming. Better Harvests.**

AI-powered agricultural disease detection and crop health monitoring platform built with Next.js, PostgreSQL, and deep learning.

## Features

- **AI Disease Detection** - Upload plant leaf images and get instant disease classification using deep learning models
- **Crop Management** - Track and manage your crops with detailed records
- **Plant Monitoring** - Continuous health monitoring with observation tracking and early warning alerts
- **Detection History** - Complete history of all detections with search, filters, and CSV export
- **Disease Library** - Searchable knowledge base of crop diseases with symptoms, causes, and management guidance
- **Dashboard Analytics** - Real-time KPIs, trend charts, and disease distribution visualizations
- **Notifications** - Alert system for disease detections and monitoring events
- **User Settings** - Profile management, notification preferences, and security settings

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion, Recharts |
| Backend | Next.js API Routes, Drizzle ORM |
| Database | PostgreSQL |
| Authentication | JWT (jose), bcryptjs |
| ML/AI | TensorFlow/Keras, MobileNetV2/EfficientNetB0, OpenCV, NumPy |
| Image Processing | Sharp |
| Icons | Lucide React |
| Forms | React Hook Form, Zod |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Python 3.9+ (for ML training)

### Quick Start

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd agrivision-ai
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

3. **Set up the database:**
   ```bash
   # Create PostgreSQL database
   createdb app_db

   # Push schema
   npx drizzle-kit push
   ```

4. **Seed disease library:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/seed
   ```

5. **Start the application:**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

### Docker Setup

```bash
docker-compose up -d
```

## AI/ML Pipeline

### Model Training

The ML training pipeline is located in `ml/training/train.py`.

#### Dataset Preparation

Download the [PlantVillage dataset](https://github.com/spMohanty/PlantVillage-Dataset) and organize it as:

```
ml/datasets/
    train/
        Tomato___Early_blight/
            image1.jpg
            ...
        Tomato___Late_blight/
            ...
        Tomato___healthy/
            ...
    val/
        (same class structure)
    test/
        (same class structure)
```

#### Training

```bash
# Install ML dependencies
pip install -r ml/requirements.txt

# Train with MobileNetV2
python ml/training/train.py \
    --dataset_path ml/datasets \
    --model_name mobilenetv2 \
    --epochs 30 \
    --version v1.0

# Train with EfficientNetB0
python ml/training/train.py \
    --dataset_path ml/datasets \
    --model_name efficientnetb0 \
    --epochs 30 \
    --version v1.1
```

#### Model Evaluation

Training generates:
- `confusion_matrix.png` - Visual confusion matrix
- `training_history.png` - Accuracy/loss curves
- `metrics.json` - Classification metrics
- `model_config.json` - Model configuration
- `class_labels.json` - Disease class labels

### Current AI Status

The application currently uses a **heuristic image analysis system** that examines actual image features (color distribution, texture patterns, brightness) to generate disease predictions. This provides realistic inference while a trained model is being prepared.

To enable full deep learning inference, train a model using the pipeline above and convert it for use in the application.

## Project Structure

```
agrivision-ai/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/v1/            # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/             # Auth pages
│   │   └── register/
│   ├── components/            # Reusable components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # UI primitives
│   ├── db/                    # Database (Drizzle ORM)
│   └── lib/                   # Utilities
├── ml/                        # ML training pipeline
│   ├── training/              # Training scripts
│   ├── datasets/              # Dataset storage
│   └── models/                # Trained models
├── public/                    # Static assets
├── docker-compose.yml
└── Dockerfile
```

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Sign in |
| GET | `/api/v1/auth/me` | Get current user |

### Detections
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/detections/predict` | Analyze leaf image |
| GET | `/api/v1/detections` | List detections |
| GET | `/api/v1/detections/[id]` | Get detection detail |
| DELETE | `/api/v1/detections?id=` | Delete detection |

### Crops
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/crops` | Create crop |
| GET | `/api/v1/crops` | List crops |
| GET | `/api/v1/crops/[id]` | Get crop detail |
| PATCH | `/api/v1/crops/[id]` | Update crop |
| DELETE | `/api/v1/crops/[id]` | Delete crop |

### Monitoring
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/monitoring` | Create monitor |
| GET | `/api/v1/monitoring` | List monitors |
| GET | `/api/v1/monitoring/[id]` | Get monitor detail |
| POST | `/api/v1/monitoring/[id]/observations` | Add observation |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/summary` | Dashboard stats |
| GET | `/api/v1/diseases` | Disease library |
| GET | `/api/v1/notifications` | Notifications |
| GET/PATCH | `/api/v1/settings` | User settings |

## License

MIT