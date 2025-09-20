from app import db, Service, Customer, Order, Worker, Track, app
from datetime import datetime
import uuid

with app.app_context():
    # Create tables if not exists
    db.create_all()

    # ----------------- SERVICES ----------------- #
    if not Service.query.first():
        services = [
            Service(id="s1", name="Laundry", price=200, duration="24h"),
            Service(id="s2", name="Dry Cleaning", price=300, duration="48h"),
            Service(id="s3", name="Ironing", price=100, duration="12h"),
            Service(id="s4", name="Premium Laundry", price=500, duration="24h"),
        ]
        db.session.add_all(services)
        print("Seeded services!")

    # ----------------- CUSTOMERS ---------------- #
    if not Customer.query.first():
        customers = [
            Customer(name="Loki Stark", email="loki@example.com", phone="9999999999"),
            Customer(name="Natasha Romanoff", email="natasha@example.com", phone="8888888888"),
            Customer(name="Steve Rogers", email="steve@example.com", phone="7777777777"),
        ]
        # Set default passwords
        for c in customers:
            c.set_password("password123")
        db.session.add_all(customers)
        print("Seeded customers!")

    # ----------------- WORKERS ---------------- #
    if not Worker.query.first():
        workers = [
            Worker(name="Bruce Banner", email="bruce@workers.com"),
            Worker(name="Clint Barton", email="clint@workers.com"),
        ]
        db.session.add_all(workers)
        print("Seeded workers!")

    # ----------------- ORDERS ---------------- #
    if not Order.query.first():
        first_customer = Customer.query.first()
        first_service = Service.query.first()
        orders = [
            Order(
                customer_name=first_customer.name,
                customer_email=first_customer.email,
                customer_phone=first_customer.phone,
                service_id=first_service.id,
                service_name=first_service.name,
                pickup_date="2025-09-25",
                special_instructions="Handle with care",
                total=first_service.price,
            ),
        ]
        db.session.add_all(orders)
        print("Seeded orders!")

    # ----------------- TRACKS ---------------- #
    if not Track.query.first():
        first_worker = Worker.query.first()
        first_order = Order.query.first()
        tracks = [
            Track(
                worker_id=first_worker.id,
                order_email=first_order.customer_email,
                order_status="Picked Up",
                location="Mumbai Warehouse",
            )
        ]
        db.session.add_all(tracks)
        print("Seeded tracks!")

    db.session.commit()
    print("All tables seeded successfully!")

