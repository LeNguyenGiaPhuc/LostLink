FROM python:3.13.15-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN addgroup --system appgroup \
  && adduser --system --ingroup appgroup appuser

COPY services/ai-inference-service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY services/ai-inference-service/app ./app

USER appuser
EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD python -c "import urllib.request; response = urllib.request.urlopen('http://127.0.0.1:8000/health/live', timeout=2); raise SystemExit(0 if response.status == 200 else 1)"

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
