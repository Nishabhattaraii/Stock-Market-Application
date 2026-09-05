from app.core.security import verify_password, get_password_hash, create_access_token
from jose import jwt
from app.config import settings

def test_password_hashing():
    raw = "secret123"
    hashed = get_password_hash(raw)
    assert verify_password(raw, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_jwt_token_generation():
    token = create_access_token(subject=1, role="Admin")
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload.get("sub") == "1"
    assert payload.get("role") == "Admin"
