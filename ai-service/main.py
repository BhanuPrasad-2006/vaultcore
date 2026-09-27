from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
import numpy as np
import uvicorn
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VaultCore AI Service", version="1.0.0")

# Initialize Isolation Forest model
model = IsolationForest(contamination=0.1, random_state=42, n_estimators=100)

# Training data for the model
training_data = np.array([
    [100, 1000, 5, 10],
    [500, 5000, 20, 14],
    [1000, 10000, 50, 18],
    [200, 2000, 10, 12],
    [300, 3000, 15, 16],
    [150, 1500, 8, 11],
    [2000, 20000, 100, 22],
    [50, 500, 2, 9],
    [750, 7500, 35, 20],
    [400, 4000, 25, 13]
])

model.fit(training_data)
logger.info("Isolation Forest model trained successfully")

class RiskRequest(BaseModel):
    amount: float
    velocity_1h: float
    distance_from_home_km: float
    time_of_day: int

class RiskResponse(BaseModel):
    risk_score: int
    recommended_action: str
    confidence: float

@app.post('/analyze-risk', response_model=RiskResponse)
async def analyze_risk(request: RiskRequest):
    try:
        logger.info(f"Analyzing risk for transaction: amount={request.amount}")
        
        features = np.array([[
            request.amount, 
            request.velocity_1h, 
            request.distance_from_home_km, 
            request.time_of_day
        ]])
        
        # Get anomaly score
        anomaly_score = model.decision_function(features)[0]
        
        # Convert anomaly score to risk score (0-100)
        # Anomaly score ranges from -1 to 1, where negative values indicate anomalies
        risk_score = int(np.clip((1 - (anomaly_score + 1) / 2) * 100, 0, 100))
        
        # Determine recommended action based on risk score
        if risk_score < 40:
            recommended_action = 'ALLOW'
            confidence = 0.95
        elif risk_score <= 70:
            recommended_action = 'REQUIRE_2FA'
            confidence = 0.85
        else:
            recommended_action = 'FREEZE_ACCOUNT'
            confidence = 0.90
        
        logger.info(f"Risk analysis completed: risk_score={risk_score}, action={recommended_action}")
        
        return RiskResponse(
            risk_score=risk_score,
            recommended_action=recommended_action,
            confidence=confidence
        )
    except Exception as e:
        logger.error(f"Error analyzing risk: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/health')
async def health():
    return {
        'status': 'healthy',
        'service': 'VaultCore AI Fraud Detection',
        'model': 'Isolation Forest',
        'timestamp': str(np.datetime64('now'))
    }

@app.get('/')
async def root():
    return {
        'service': 'VaultCore AI Microservice',
        'version': '1.0.0',
        'endpoints': {
            'analyze_risk': 'POST /analyze-risk',
            'health': 'GET /health'
        }
    }

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=5000)