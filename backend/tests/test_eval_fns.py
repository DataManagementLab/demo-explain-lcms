import pytest
from zero_shot_learned_db.explanations.evaluation import _get_fidelity_evaluation_internal
from zero_shot_learned_db.explanations.utils import harmonic_mean, relative_change


def test_relative_change():
    assert relative_change(1, 2) == 1
    assert relative_change(1, 1.5) == 0.5
    assert relative_change(2, 2.5) == 0.25
    assert relative_change(2, 6) == 2
    assert relative_change(2, 6, 5) == 2

    assert relative_change(20, 21) == 0.05
    assert relative_change(20, 25) == 0.25
    assert relative_change(20, 30) == 0.5

    assert relative_change(20, 21, 10) == 0.1
    assert relative_change(20, 25, 10) == 0.5
    assert relative_change(20, 30, 10) == 1


def test_fidelity():
    # Simple test
    assert _get_fidelity_evaluation_internal(1, 2, False) == 1
    assert _get_fidelity_evaluation_internal(1, 1.5, False) == 1
    assert _get_fidelity_evaluation_internal(2, 2.5, False) == 0.5
    assert _get_fidelity_evaluation_internal(2, 6, False) == 1

    # Another relative threshold test
    assert _get_fidelity_evaluation_internal(1, 2, False, rel_change_threshold=2) == 0.5
    assert _get_fidelity_evaluation_internal(1, 1.5, False, rel_change_threshold=2) == 0.25
    assert _get_fidelity_evaluation_internal(2, 2.5, False, rel_change_threshold=2) == 0.125
    assert _get_fidelity_evaluation_internal(2, 6, False, rel_change_threshold=2) == 1

    # Difference in another direction test
    assert _get_fidelity_evaluation_internal(1, 0, False, rel_change_threshold=2) == 0.5
    assert _get_fidelity_evaluation_internal(1, 0.5, False, rel_change_threshold=2) == 0.25
    assert _get_fidelity_evaluation_internal(2, 1.5, False, rel_change_threshold=2) == 0.125
    assert _get_fidelity_evaluation_internal(2, -2, False, rel_change_threshold=2) == 1

    # Big values test
    assert _get_fidelity_evaluation_internal(20, 21, False) == 0.2
    assert _get_fidelity_evaluation_internal(20, 25, False) == 1

    # Real change threshold test
    assert _get_fidelity_evaluation_internal(20, 21, False, rel_change_threshold=2, abs_change_threshold=2) == 0.5
    assert _get_fidelity_evaluation_internal(20, 25, False, rel_change_threshold=2, abs_change_threshold=2) == 1

    # Should be equal test
    assert _get_fidelity_evaluation_internal(1, 2, True, rel_change_threshold=2) == 0.5
    assert _get_fidelity_evaluation_internal(1, 1.5, True, rel_change_threshold=2) == 0.75
    assert _get_fidelity_evaluation_internal(2, 2.5, True, rel_change_threshold=2) == 0.875
    assert _get_fidelity_evaluation_internal(2, 6, True, rel_change_threshold=2) == 0


def test_harmonic_mean():
    assert harmonic_mean(1, 1) == 1
    assert harmonic_mean(0.5, 0.3) == pytest.approx(0.375)
    assert harmonic_mean(0.04, 0.6) == pytest.approx(0.075)
