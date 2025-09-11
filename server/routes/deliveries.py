# server/routes/deliveries.py
from flask import Blueprint, jsonify
from datetime import datetime, timedelta

deliveries_bp = Blueprint('deliveries', __name__, url_prefix='/api/deliveries')

# Dummy delivery data
deliveries = [
    {
        "id": 1,
        "vehicleId": "TRK-101",
        "driverName": "John Doe",
        "status": "pending",
        "estimatedDelivery": (datetime.now() + timedelta(hours=2)).isoformat(),
        "actualDelivery": None
    },
    {
        "id": 2,
        "vehicleId": "TRK-102",
        "driverName": "Jane Smith",
        "status": "in_transit",
        "estimatedDelivery": (datetime.now() + timedelta(hours=1)).isoformat(),
        "actualDelivery": None
    },
    {
        "id": 3,
        "vehicleId": "TRK-103",
        "driverName": "Mike Johnson",
        "status": "delivered",
        "estimatedDelivery": None,
        "actualDelivery": (datetime.now() - timedelta(minutes=30)).isoformat()
    }
]

@deliveries_bp.route('', methods=['GET'])
def get_deliveries():
    return jsonify(deliveries)

