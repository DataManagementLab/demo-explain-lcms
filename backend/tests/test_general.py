from ml.dependencies import MLHelper
from ml.service import ExplainerType
from utils import get_test_value


def test_ml_loaded(ml: MLHelper):
    assert ml.model is not None
    assert ml.feature_statistics is not None
    assert ml.hyperparameters is not None
    assert len(ml.parsed_plans) == 50


def test_predict(ml: MLHelper):
    plan = ml.get_plan(0)
    assert len(plan.graph_nodes) == 37
    base_explainer = ml.get_explainer(ExplainerType.BASE)
    assert base_explainer is not None
    prediction = base_explainer.predict(plan)
    assert prediction.label == plan.label
    assert get_test_value(prediction.prediction) == 3.3780


def test_explain(ml: MLHelper):
    plan = ml.get_plan(0)
    base_explainer = ml.get_explainer(ExplainerType.GRADIENT)
    explanation = base_explainer.explain(plan)
    print([i for i in explanation.node_importance.items() if i[1] > 0.1])
    assert get_test_value(explanation.node_importance[34]) == 0.2411
    assert get_test_value(explanation.node_importance[26]) == 0.2330
    assert get_test_value(explanation.node_importance[27]) == 0.1047
    assert get_test_value(explanation.node_importance[36]) == 0.2022
