from zero_shot_learned_db.explanations.data_models.explanation import Explanation


def round_explanation_values(explanation: Explanation, min=0.01, round_digits=2):
    for grads in explanation.feature_importance.values():
        for feature in grads:
            grads[feature] = round(grads[feature], round_digits) if grads[feature] > min else 0

    for node in explanation.node_importance:
        explanation.node_importance[node] = round(explanation.node_importance[node], round_digits) if explanation.node_importance[node] > min else 0
