FROM python:3.11.1-alpine3.16
LABEL maintainer="monitoring"

ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt /tmp/requirements.txt
COPY ./scripts /scripts
COPY . /app
WORKDIR /app

RUN python -m venv /py && \
  apk add python3-dev build-base linux-headers pcre-dev && \
  /py/bin/pip install --upgrade pip && \
  /py/bin/pip install -r /tmp/requirements.txt && \
  rm -rf /tmp && \
  adduser \
  --disabled-password \
  --no-create-home \
  www && \
  chmod -R +x /scripts && \
  sed -i 's/\r$//' /scripts/run.sh

ENV PATH="/scripts:/py/bin:$PATH"

USER www

CMD ["run.sh"]
