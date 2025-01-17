from typing import Any, Dict
import numpy as np

def to_python_type(obj: Any) -> Any:
    """Convert numpy types to Python native types"""
    if isinstance(obj, np.generic):
        return obj.item()
    if isinstance(obj, dict):
        return {k: to_python_type(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [to_python_type(x) for x in obj]
    return obj