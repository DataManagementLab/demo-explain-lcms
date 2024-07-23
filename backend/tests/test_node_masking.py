import torch
from ml.dependencies import MLHelper
from ml.service import ExplainerType

masked_node = 34


def test_masked_prediction_different(ml: MLHelper):
    plan = ml.get_plan(0)
    base_explainer = ml.get_explainer(ExplainerType.BASE)
    prediction = base_explainer.predict(plan)
    plan.set_node_mask([masked_node])
    masked_prediction = base_explainer.predict(plan)
    plan.set_node_mask(None)
    prediction_reset = base_explainer.predict(plan)
    assert prediction.label == masked_prediction.label
    assert prediction.label == prediction_reset.label
    assert prediction.prediction != masked_prediction.prediction
    assert prediction.prediction == prediction_reset.prediction


def test_masked_prediction_equal_different_features(ml: MLHelper):
    plan = ml.get_plan(0)
    base_explainer = ml.get_explainer(ExplainerType.BASE)
    node = plan.get_node(masked_node)
    node_type = node.get_node_type_str()
    original_features = plan.features
    plan.features = dict(original_features)

    node_type_features = plan.features[node_type].detach().clone()
    print("NodeType Features:", node_type_features)
    mask = torch.full(node_type_features.shape, 1)
    mask[node.id_in_dgl_graph] = torch.full(mask[node.id_in_dgl_graph].shape, 42)
    assert mask[node.id_in_dgl_graph][0] != 1
    node_type_features *= mask
    print("Masked NodeType Features:", node_type_features)

    prediction = base_explainer.predict(plan)
    plan.set_node_mask([masked_node])
    masked_prediction = base_explainer.predict(plan)
    plan.features[node_type] = node_type_features
    masked_prediction_changed = base_explainer.predict(plan)
    plan.features = original_features
    masked_prediction_reset = base_explainer.predict(plan)
    plan.set_node_mask(None)
    prediction_reset = base_explainer.predict(plan)

    assert masked_prediction.prediction == masked_prediction_changed.prediction
    assert masked_prediction.prediction == masked_prediction_reset.prediction
    assert prediction.prediction != masked_prediction.prediction
    assert prediction.prediction == prediction_reset.prediction
