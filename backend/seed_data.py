from datetime import datetime, date
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import User, Company
from app.tasks.crawl_tasks import execute_crawl

import sys

def seed():
    if "--reset" in sys.argv:
        print("⚠️ Reset flag detected: Deleting all existing data & dropping database tables...")
        Base.metadata.drop_all(bind=engine)
    
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
     
        users_data = [
            {"name": "Admin User", "email": "admin@nepse.com", "password": "admin123", "role": "Admin"},
            {"name": "Senior Analyst", "email": "analyst@nepse.com", "password": "analyst123", "role": "Analyst"},
            {"name": "Market Viewer", "email": "viewer@nepse.com", "password": "viewer123", "role": "Viewer"},
        ]

        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    name=u["name"],
                    email=u["email"],
                    password_hash=get_password_hash(u["password"]),
                    role=u["role"],
                    is_active=True
                )
                db.add(user)
        db.commit()
        print("✓ Users seeded (admin@nepse.com, analyst@nepse.com, viewer@nepse.com)")

      
        companies_data = [
            {"symbol": "NABIL", "name": "Nabil Bank Limited", "sector": "Commercial Bank"},
            {"symbol": "GBIME", "name": "Global IME Bank Limited", "sector": "Commercial Bank"},
            {"symbol": "NTC", "name": "Nepal Doorsanchar Company Limited", "sector": "Telecom"},
            {"symbol": "HDL", "name": "Himalayan Distillery Limited", "sector": "Manufacturing"},
            {"symbol": "EBL", "name": "Everest Bank Limited", "sector": "Commercial Bank"},
            {"symbol": "CIT", "name": "Citizen Investment Trust", "sector": "Financial Services"},
            {"symbol": "CHCL", "name": "Chilime Hydropower Company Limited", "sector": "Hydropower"},
            {"symbol": "SHIVM", "name": "Shivam Cements Limited", "sector": "Manufacturing"},
            {"symbol": "STC", "name": "Salt Trading Corporation", "sector": "Trading"},
            {"symbol": "NICA", "name": "NIC Asia Bank Limited", "sector": "Commercial Bank"},
        ]

        for c in companies_data:
            comp = db.query(Company).filter(Company.symbol == c["symbol"]).first()
            if not comp:
                comp = Company(symbol=c["symbol"], name=c["name"], sector=c["sector"], is_active=True)
                db.add(comp)
        db.commit()
        print("✓ 10 Core Nepalese Companies master records seeded")

    finally:
        db.close()

    print("🚀 Triggering live web crawlers for news & market data...")
    portals = ["nepsealpha_metrics", "merolagani", "sharesansar", "nepsealpha", "bizmandu", "market_data"]
    for portal in portals:
        print(f"  -> Crawling {portal}...")
        res = execute_crawl(portal, triggered_by="initial_seed_crawl")
        print(f"  ✓ {portal} finished: status={res.get('status')}, found={res.get('items_found')}, inserted={res.get('items_inserted')}")

    print("🎉 Database setup & live data ingestion completed successfully!")


if __name__ == "__main__":
    seed()
