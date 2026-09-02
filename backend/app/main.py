from fastapi import FastAPI

app = FastAPI(title="MiniPhotobooth API")


@app.get("/")
def root():
    return {"message": "MiniPhotobooth API is running"}