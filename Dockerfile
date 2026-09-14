FROM python:3.11-slim

# Create non-root user for Hugging Face Spaces security
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PORT=7860

WORKDIR $HOME/app

# Install dependencies
COPY --chown=user requirements.txt $HOME/app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY --chown=user . $HOME/app

# Ensure instance folder exists and is writable
RUN mkdir -p $HOME/app/instance

EXPOSE 7860

# Run with Gunicorn on port 7860
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app", "--workers", "2", "--timeout", "120"]
