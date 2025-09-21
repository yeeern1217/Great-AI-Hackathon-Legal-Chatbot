# auth.py
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import requests

# Replace with your Cognito details
COGNITO_REGION = "ap-southeast-1"
USERPOOL_ID = "aus-east-1_pE26qmN2e"
APP_CLIENT_ID = "3kf9v98lsnrv4m874lkct4qep7"

# Cognito JWKs URL
JWKS_URL = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{USERPOOL_ID}/.well-known/jwks.json"

# Cache JWKs
jwks = requests.get(JWKS_URL).json()
bearer_scheme = HTTPBearer()

def get_public_key(kid: str):
    for key in jwks["keys"]:
        if key["kid"] == kid:
            return key
    return None

def verify_token(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)):
    token = credentials.credentials
    try:
        headers = jwt.get_unverified_header(token)
        public_key = get_public_key(headers["kid"])
        if not public_key:
            raise HTTPException(status_code=401, detail="Invalid token header")

        # Verify JWT
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=APP_CLIENT_ID
        )
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
