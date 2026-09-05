from fastapi import APIRouter
from app.api.v1 import auth, companies, prices, news, analysis, crawls, users, exports

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(companies.router)
api_router.include_router(prices.router)
api_router.include_router(news.router)
api_router.include_router(analysis.router)
api_router.include_router(crawls.router)
api_router.include_router(users.router)
api_router.include_router(exports.router)
