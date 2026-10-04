"""
AgriVision AI - Plant Disease Detection Model Training Pipeline

This script implements a complete training pipeline for plant disease classification
using transfer learning with MobileNetV2 or EfficientNetB0.

Dataset: PlantVillage or compatible plant disease image dataset
Expected structure:
    datasets/
        train/
            Tomato___Early_blight/
                image1.jpg
                image2.jpg
            Tomato___Late_blight/
                ...
            Tomato___healthy/
                ...
        val/
            (same structure)
        test/
            (same structure)

Usage:
    python ml/training/train.py --dataset_path ml/datasets --model_name mobilenetv2
    python ml/training/train.py --dataset_path ml/datasets --model_name efficientnetb0
"""

import os
import sys
import json
import argparse
import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Suppress TF info messages
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'


def parse_args():
    parser = argparse.ArgumentParser(description="Train plant disease detection model")
    parser.add_argument("--dataset_path", type=str, default="ml/datasets",
                        help="Path to dataset directory")
    parser.add_argument("--model_name", type=str, default="mobilenetv2",
                        choices=["mobilenetv2", "efficientnetb0"],
                        help="Base model architecture")
    parser.add_argument("--image_size", type=int, default=224,
                        help="Input image size")
    parser.add_argument("--batch_size", type=int, default=32,
                        help="Training batch size")
    parser.add_argument("--epochs", type=int, default=30,
                        help="Maximum training epochs")
    parser.add_argument("--fine_tune_epochs", type=int, default=15,
                        help="Fine-tuning epochs")
    parser.add_argument("--learning_rate", type=float, default=1e-3,
                        help="Initial learning rate")
    parser.add_argument("--fine_tune_lr", type=float, default=1e-5,
                        help="Fine-tuning learning rate")
    parser.add_argument("--output_dir", type=str, default="ml/models",
                        help="Output directory for saved model")
    parser.add_argument("--version", type=str, default="v1.0",
                        help="Model version identifier")
    return parser.parse_args()


def build_augmentation():
    """Build data augmentation pipeline for training."""
    return keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomFlip("vertical"),
        layers.RandomRotation(0.3),
        layers.RandomZoom(0.2),
        layers.RandomContrast(0.2),
        layers.RandomBrightness(0.2),
        layers.RandomTranslation(0.1, 0.1),
    ], name="augmentation")


def build_model(num_classes, image_size, model_name, learning_rate):
    """Build transfer learning model."""
    input_shape = (image_size, image_size, 3)
    inputs = keras.Input(shape=input_shape)

    # Augmentation
    augmentation = build_augmentation()
    x = augmentation(inputs)

    # Preprocessing
    if model_name == "mobilenetv2":
        base_model = keras.applications.MobileNetV2(
            input_shape=input_shape,
            include_top=False,
            weights="imagenet",
        )
        x = keras.applications.mobilenet_v2.preprocess_input(x)
    elif model_name == "efficientnetb0":
        base_model = keras.applications.EfficientNetB0(
            input_shape=input_shape,
            include_top=False,
            weights="imagenet",
        )
        x = keras.applications.efficientnet.preprocess_input(x)
    else:
        raise ValueError(f"Unsupported model: {model_name}")

    # Freeze base model
    base_model.trainable = False
    x = base_model(x, training=False)

    # Classification head
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = keras.Model(inputs, outputs, name=f"disease_detector_{model_name}")

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model, base_model


def load_dataset(dataset_path, image_size, batch_size):
    """Load train, validation, and test datasets."""
    train_dir = os.path.join(dataset_path, "train")
    val_dir = os.path.join(dataset_path, "val")
    test_dir = os.path.join(dataset_path, "test")

    if not os.path.exists(train_dir):
        raise FileNotFoundError(
            f"Training data not found at {train_dir}. "
            "Please prepare the PlantVillage dataset with the following structure:\n"
            "  datasets/train/ClassName/image.jpg\n"
            "  datasets/val/ClassName/image.jpg\n"
            "  datasets/test/ClassName/image.jpg"
        )

    train_ds = keras.utils.image_dataset_from_directory(
        train_dir,
        image_size=(image_size, image_size),
        batch_size=batch_size,
        shuffle=True,
        label_mode="int",
        seed=42,
    )

    class_names = train_ds.class_names

    val_ds = None
    if os.path.exists(val_dir):
        val_ds = keras.utils.image_dataset_from_directory(
            val_dir,
            image_size=(image_size, image_size),
            batch_size=batch_size,
            shuffle=False,
            label_mode="int",
        )

    test_ds = None
    if os.path.exists(test_dir):
        test_ds = keras.utils.image_dataset_from_directory(
            test_dir,
            image_size=(image_size, image_size),
            batch_size=batch_size,
            shuffle=False,
            label_mode="int",
        )

    # Performance optimization
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(AUTOTUNE)
    if val_ds:
        val_ds = val_ds.prefetch(AUTOTUNE)
    if test_ds:
        test_ds = test_ds.prefetch(AUTOTUNE)

    return train_ds, val_ds, test_ds, class_names


def compute_class_weights(train_ds):
    """Compute class weights for imbalanced datasets."""
    labels = []
    for _, batch_labels in train_ds:
        labels.extend(batch_labels.numpy())
    labels = np.array(labels)

    unique_classes = np.unique(labels)
    class_counts = np.bincount(labels)

    # Balanced class weights
    total = len(labels)
    n_classes = len(unique_classes)
    class_weights = {}
    for cls in unique_classes:
        class_weights[int(cls)] = total / (n_classes * class_counts[cls])

    return class_weights


def train_model(model, train_ds, val_ds, epochs, class_weights, output_dir):
    """Train the model with callbacks."""
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_accuracy" if val_ds else "accuracy",
            patience=8,
            restore_best_weights=True,
            verbose=1,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss" if val_ds else "loss",
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1,
        ),
        keras.callbacks.ModelCheckpoint(
            filepath=os.path.join(output_dir, "best_model.keras"),
            monitor="val_accuracy" if val_ds else "accuracy",
            save_best_only=True,
            verbose=1,
        ),
    ]

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        class_weight=class_weights,
        callbacks=callbacks,
        verbose=1,
    )

    return history


def fine_tune_model(model, base_model, train_ds, val_ds, fine_tune_epochs, fine_tune_lr):
    """Fine-tune the base model layers."""
    # Unfreeze top layers of base model
    base_model.trainable = True
    fine_tune_at = len(base_model.layers) - 30
    for layer in base_model.layers[:fine_tune_at]:
        layer.trainable = False

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=fine_tune_lr),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    total_epochs = len(model.history.history.get("accuracy", [])) if hasattr(model, "history") else 0

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_accuracy" if val_ds else "accuracy",
            patience=5,
            restore_best_weights=True,
            verbose=1,
        ),
    ]

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=total_epochs + fine_tune_epochs,
        initial_epoch=total_epochs,
        callbacks=callbacks,
        verbose=1,
    )

    return history


def evaluate_model(model, test_ds, class_names, output_dir):
    """Evaluate model and generate metrics."""
    if test_ds is None:
        print("No test dataset available. Skipping evaluation.")
        return {}

    y_true = []
    y_pred = []

    for images, labels in test_ds:
        predictions = model.predict(images, verbose=0)
        y_pred.extend(np.argmax(predictions, axis=1))
        y_true.extend(labels.numpy())

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # Classification report
    report = classification_report(y_true, y_pred, target_names=class_names, output_dict=True)
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=class_names))

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)

    # Plot confusion matrix
    fig, ax = plt.subplots(figsize=(max(12, len(class_names)), max(10, len(class_names) * 0.8)))
    im = ax.imshow(cm, interpolation='nearest', cmap='Blues')
    ax.set_title('Confusion Matrix')
    plt.colorbar(im)
    tick_marks = np.arange(len(class_names))
    ax.set_xticks(tick_marks)
    ax.set_xticklabels(class_names, rotation=45, ha='right', fontsize=8)
    ax.set_yticks(tick_marks)
    ax.set_yticklabels(class_names, fontsize=8)
    ax.set_ylabel('True Label')
    ax.set_xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "confusion_matrix.png"), dpi=150)
    plt.close()

    # Save metrics
    metrics = {
        "accuracy": float(report["accuracy"]),
        "weighted_precision": float(report["weighted avg"]["precision"]),
        "weighted_recall": float(report["weighted avg"]["recall"]),
        "weighted_f1": float(report["weighted avg"]["f1-score"]),
        "per_class": {},
    }

    for class_name in class_names:
        if class_name in report:
            metrics["per_class"][class_name] = {
                "precision": float(report[class_name]["precision"]),
                "recall": float(report[class_name]["recall"]),
                "f1": float(report[class_name]["f1-score"]),
                "support": int(report[class_name]["support"]),
            }

    with open(os.path.join(output_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    return metrics


def plot_training_history(history, output_dir):
    """Plot training history."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    ax1.plot(history.history["accuracy"], label="Train")
    if "val_accuracy" in history.history:
        ax1.plot(history.history["val_accuracy"], label="Validation")
    ax1.set_title("Model Accuracy")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Accuracy")
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    ax2.plot(history.history["loss"], label="Train")
    if "val_loss" in history.history:
        ax2.plot(history.history["val_loss"], label="Validation")
    ax2.set_title("Model Loss")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Loss")
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "training_history.png"), dpi=150)
    plt.close()


def save_model_for_inference(model, class_names, args, metrics, output_dir):
    """Save model and metadata for production use."""
    # Save Keras model
    model.save(os.path.join(output_dir, "model.keras"))

    # Save class labels
    with open(os.path.join(output_dir, "class_labels.json"), "w") as f:
        json.dump(class_names, f, indent=2)

    # Save model config
    config = {
        "version": args.version,
        "model_name": args.model_name,
        "image_size": args.image_size,
        "num_classes": len(class_names),
        "architecture": args.model_name,
        "accuracy": metrics.get("accuracy"),
        "precision": metrics.get("weighted_precision"),
        "recall": metrics.get("weighted_recall"),
        "f1_score": metrics.get("weighted_f1"),
        "class_labels": class_names,
        "trained_at": datetime.datetime.now().isoformat(),
        "tensorflow_version": tf.__version__,
    }

    with open(os.path.join(output_dir, "model_config.json"), "w") as f:
        json.dump(config, f, indent=2)

    print(f"\nModel saved to {output_dir}")
    print(f"Config: model_config.json")
    print(f"Labels: class_labels.json")
    print(f"Model: model.keras")


def main():
    args = parse_args()

    print("=" * 60)
    print("AgriVision AI - Plant Disease Detection Training")
    print("=" * 60)
    print(f"Dataset: {args.dataset_path}")
    print(f"Architecture: {args.model_name}")
    print(f"Image size: {args.image_size}")
    print(f"Batch size: {args.batch_size}")
    print(f"Max epochs: {args.epochs}")
    print(f"Output: {args.output_dir}")
    print(f"Version: {args.version}")
    print(f"TensorFlow: {tf.__version__}")
    print("=" * 60)

    # GPU check
    gpus = tf.config.list_physical_devices("GPU")
    print(f"GPUs available: {len(gpus)}")

    # Create output directory
    version_dir = os.path.join(args.output_dir, args.version)
    os.makedirs(version_dir, exist_ok=True)

    # Load dataset
    print("\nLoading dataset...")
    train_ds, val_ds, test_ds, class_names = load_dataset(
        args.dataset_path, args.image_size, args.batch_size
    )
    print(f"Classes ({len(class_names)}): {class_names}")

    # Compute class weights
    print("\nComputing class weights...")
    class_weights = compute_class_weights(train_ds)
    print(f"Class weights: {class_weights}")

    # Build model
    print(f"\nBuilding {args.model_name} model...")
    model, base_model = build_model(
        len(class_names), args.image_size, args.model_name, args.learning_rate
    )
    model.summary(print_fn=lambda x: print(x) if "param" in x.lower() else None)

    # Phase 1: Train classification head
    print("\n" + "=" * 40)
    print("Phase 1: Training classification head")
    print("=" * 40)
    history = train_model(model, train_ds, val_ds, args.epochs, class_weights, version_dir)

    # Phase 2: Fine-tuning
    print("\n" + "=" * 40)
    print("Phase 2: Fine-tuning base model")
    print("=" * 40)
    ft_history = fine_tune_model(
        model, base_model, train_ds, val_ds, args.fine_tune_epochs, args.fine_tune_lr
    )

    # Plot training history
    plot_training_history(history, version_dir)

    # Evaluate
    print("\n" + "=" * 40)
    print("Evaluation")
    print("=" * 40)
    metrics = evaluate_model(model, test_ds, class_names, version_dir)

    # Save
    save_model_for_inference(model, class_names, args, metrics, version_dir)

    print("\n" + "=" * 60)
    print("Training complete!")
    print(f"Accuracy: {metrics.get('accuracy', 'N/A')}")
    print(f"F1 Score: {metrics.get('weighted_f1', 'N/A')}")
    print("=" * 60)


if __name__ == "__main__":
    main()