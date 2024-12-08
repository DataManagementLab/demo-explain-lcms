FROM python:3.11 AS pytorch-base
RUN pip install --upgrade setuptools
RUN pip install --upgrade pip
RUN pip install --no-cache-dir torch==2.1.2 torchvision==0.16.2 torchaudio==2.1.2 --index-url https://download.pytorch.org/whl/rocm5.6
RUN pip install --no-cache-dir dgl -f https://data.dgl.ai/wheels/torch-2.1/repo.html
RUN apt-get update
RUN apt-get install -y graphviz graphviz-dev

FROM pytorch-base AS install
COPY requirements /tmp/requirements
RUN pip install --no-cache-dir -r /tmp/requirements/base.txt


FROM install AS run-app

COPY ./zero-shot-data /zero-shot-data

ENV ml__base_data_dir=/zero-shot-data
ENV cors_origins='["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5241", "http://127.0.0.1:5241"]'
ENV db_host=expl-zs-postgres


COPY ./src /app
WORKDIR /app
CMD ["fastapi", "run", "main.py", "--port", "80"]