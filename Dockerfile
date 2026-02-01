FROM python:3.11-slim 
WORKDIR /app 
COPY requirements.txt . 
RUN pip install --no-cache-dir -r requirements.txt 
RUN pip install jinja2==3.1.2 fastapi==0.104.1 uvicorn[standard]==0.24.0 
COPY . . 
RUN mkdir -p database logs templates static uploads 
EXPOSE 8080 
CMD ["uvicorn", "src.agentic_ai.__main__:app", "--host", "0.0.0.0", "--port", "8080"] 
