from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Liberty OS"
    version: str = "0.1.0"
    debug: bool = True
    pod_id: str = "default-pod"

    class Config:
        env_file = ".env"

settings = Settings()