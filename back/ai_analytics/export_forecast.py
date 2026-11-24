"""Export the fitted inventory pipelines for inference in the Node API."""
import json
from pathlib import Path
from tempfile import TemporaryDirectory

from regression_models import train_and_evaluate_regression
from classification_models import train_and_evaluate_logistic
from ml_algorithms import train_and_evaluate_ml_suite
from data_loader import load_tca_dataset


def linear_parameters(pipeline, estimator):
    scaler = pipeline.named_steps["scaler"]
    return {
        "features": pipeline.feature_names_in_.tolist(),
        "mean": scaler.mean_.tolist(), "scale": scaler.scale_.tolist(),
        "weights": estimator.coef_.ravel().tolist(),
        "intercept": float(estimator.intercept_.item()),
    }


def export():
    with TemporaryDirectory() as plots:
        regressions, _, test_targets = train_and_evaluate_regression(plots)
        risks = train_and_evaluate_logistic(plots)
        scores, priorities = train_and_evaluate_ml_suite(plots)
    regression = regressions["Regresion_Polinomial_Grado2"]
    demand = regression["model"]
    risk = risks["c_comparison"][risks["best_c"]]["model"]
    priority_name = "Árbol de Decisión (Max Depth=4)"
    priority = priorities[priority_name].named_steps["clf"]
    tree = priority.tree_
    dataset = load_tca_dataset()
    priority_features = priorities[priority_name].feature_names_in_.tolist()
    # Reference predictions also check the JS implementation after re-training.
    references = []
    classes = priorities[priority_name].predict(dataset[priority_features])
    for label in priority.classes_:
        row = dataset[classes == label].iloc[:1]
        references.append({
            "inputs": {key: float(row[key].iloc[0]) for key in priority_features},
            "demand": float(demand.predict(row[demand.feature_names_in_])[0]),
            "risk": float(risk.predict_proba(row[risk.feature_names_in_])[0, 1]),
            "priority": int(label),
        })
    artifact = {
        "demand": {**linear_parameters(demand, demand.named_steps["model"]),
                   "powers": demand.named_steps["poly"].powers_.tolist()},
        "risk": linear_parameters(risk, risk.named_steps["clf"]),
        "priority": {
            "features": priority_features, "feature": tree.feature.tolist(),
            "threshold": tree.threshold.tolist(), "left": tree.children_left.tolist(),
            "right": tree.children_right.tolist(),
            "label": priority.classes_[tree.value[:, 0, :].argmax(axis=1)].tolist(),
        },
        "ranges": {key: [float(dataset[key].min()), float(dataset[key].max())] for key in priority_features},
        "evaluation": {
            "productosEvaluados": len(test_targets), "errorDemanda": float(regression["mae"]),
            "aciertoRiesgo": float(risks["accuracy"]),
            "aciertoPrioridad": float(scores.loc[scores.Modelo == priority_name, "Test_Accuracy"].iloc[0]),
        },
        "references": references,
    }
    path = Path(__file__).resolve().parents[1] / "services" / "inventory-models.json"
    path.write_text(json.dumps(artifact, indent=2, allow_nan=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    export()
