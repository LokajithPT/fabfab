from app import db
from datetime import datetime

class Delivery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.String(50), nullable=False)
    driver_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending")
    estimated_delivery = db.Column(db.DateTime, nullable=True)
    actual_delivery = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "vehicleId": self.vehicle_id,
            "driverName": self.driver_name,
            "status": self.status,
            "estimatedDelivery": self.estimated_delivery.isoformat() if self.estimated_delivery else None,
            "actualDelivery": self.actual_delivery.isoformat() if self.actual_delivery else None,
        }

