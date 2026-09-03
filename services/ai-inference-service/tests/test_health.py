from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_live_and_ready_are_stateless() -> None:
    assert client.get("/health/live").json() == {"status": "live"}
    assert client.get("/health/ready").json() == {"status": "ready"}


def test_valid_correlation_id_is_preserved() -> None:
    response = client.get(
        "/health/live",
        headers={"X-Correlation-Id": "lostlink-ai-test"},
    )
    assert response.headers["X-Correlation-Id"] == "lostlink-ai-test"


def test_invalid_correlation_id_is_replaced() -> None:
    response = client.get(
        "/health/live",
        headers={"X-Correlation-Id": "contains spaces"},
    )
    assert len(response.headers["X-Correlation-Id"]) == 36
