import json
from pathlib import Path
from io import BytesIO

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models" / "v1.0"

MODEL_PATH = MODEL_DIR / "best_model.keras"
CONFIG_PATH = MODEL_DIR / "model_config.json"
LABELS_PATH = MODEL_DIR / "class_labels.json"

IMAGE_SIZE = 224


def load_json(path: Path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

if not CONFIG_PATH.exists():
    raise FileNotFoundError(f"Model config not found: {CONFIG_PATH}")

if not LABELS_PATH.exists():
    raise FileNotFoundError(f"Class labels not found: {LABELS_PATH}")


model_config = load_json(CONFIG_PATH)
class_labels = load_json(LABELS_PATH)

if isinstance(class_labels, dict):
    class_labels = class_labels.get("class_labels", [])

if not class_labels:
    class_labels = model_config.get("class_labels", [])

if len(class_labels) != 25:
    raise RuntimeError(
        f"Expected 25 class labels, but found {len(class_labels)}"
    )


print("=" * 60)
print("AgriVision AI - ML Inference Service")
print("=" * 60)
print(f"Model: {MODEL_PATH}")
print(f"Architecture: {model_config.get('architecture', 'unknown')}")
print(f"Image size: {IMAGE_SIZE}x{IMAGE_SIZE}")
print(f"Classes: {len(class_labels)}")
print(f"TensorFlow: {tf.__version__}")
print("=" * 60)

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully.")


app = FastAPI(
    title="AgriVision AI ML Inference API",
    version=model_config.get("version", "v1.0"),
)


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file.",
        ) from exc

    image = image.resize((IMAGE_SIZE, IMAGE_SIZE))

    # IMPORTANT:
    # The trained MobileNetV2 model already contains its preprocessing
    # layers. Therefore, we only convert the image to float32 here.
    image_array = np.asarray(image, dtype=np.float32)

    return np.expand_dims(image_array, axis=0)


def format_label(label: str) -> str:
    return label.replace("___", " - ").replace("_", " ")


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True,
        "model_version": model_config.get("version", "v1.0"),
        "architecture": model_config.get("architecture", "mobilenetv2"),
        "classes": len(class_labels),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file.",
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty.",
        )

    try:
        image_tensor = preprocess_image(image_bytes)

        predictions = model.predict(image_tensor, verbose=0)[0]

        top_indices = np.argsort(predictions)[::-1][:3]

        top_predictions = []

        for index in top_indices:
            confidence = float(predictions[index])

            top_predictions.append(
                {
                    "class_index": int(index),
                    "label": class_labels[index],
                    "display_name": format_label(class_labels[index]),
                    "confidence": round(confidence, 4),
                    "confidence_percent": round(confidence * 100, 2),
                }
            )

        top_prediction = top_predictions[0]

        return {
            "success": True,
            "model_version": model_config.get("version", "v1.0"),
            "architecture": model_config.get(
                "architecture",
                "mobilenetv2",
            ),
            "prediction": top_prediction,
            "top_predictions": top_predictions,
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(exc)}",
        ) from exc
