# server/seed.py
from app import app, db
from models import Delivery
from datetime import datetime, timedelta

with app.app_context():  # <--- this is key
    db.drop_all()
    db.create_all()

    deliveries = [
        Delivery(
            vehicle_id="TRK-101",
            driver_name="John Doe",
            status="pending",
            estimated_delivery=datetime.now() + timedelta(hours=2)
        ),
        Delivery(
            vehicle_id="TRK-102",
            driver_name="Jane Smith",
            status="in_transit",
            estimated_delivery=datetime.now() + timedelta(hours=1)
        ),
        Delivery(
            vehicle_id="TRK-103",
            driver_name="Mike Johnson",
            status="delivered",
            actual_delivery=datetime.now() - timedelta(hours=1)
        )
    ]

    db.session.add_all(deliveries)
    db.session.commit()
    print("Seeded deliveries!")

