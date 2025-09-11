import os
import uuid
from datetime import datetime
from functools import wraps

from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory,
    session,
    redirect,
    url_for,
    render_template,
)
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from werkzeug.security import generate_password_hash, check_password_hash


# ---------------- CONFIG ---------------- #
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DIST_FOLDER = os.path.join(BASE_DIR, "..", "dist")  # react admin build
TEMPLATE_FOLDER = os.path.join(BASE_DIR, "templates")  # login templates

app = Flask(
    __name__,
    static_folder=DIST_FOLDER,
    static_url_path="",
    template_folder=TEMPLATE_FOLDER,
)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///fabclean.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "super-secret-key-loki"
app.config["JWT_SECRET_KEY"] = "super-jwt-secret-loki"

db = SQLAlchemy(app)
jwt = JWTManager(app)

# ---------------- HELPERS ---------------- #
def admin_login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get("admin_logged_in"):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return wrapper

# ---------------- MODELS ---------------- #
class Service(db.Model):
    id = db.Column(db.String(20), primary_key=True, default=lambda: str(uuid.uuid4())[:8])
    name = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Float, nullable=False)
    duration = db.Column(db.String(50))
    status = db.Column(db.String(50), default="Active")
    usage_count = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "duration": self.duration,
            "status": self.status,
            "usage_count": self.usage_count,
        }

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, raw):
        self.password_hash = generate_password_hash(raw)

    def check_password(self, raw):
        return check_password_hash(self.password_hash, raw)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "createdAt": self.created_at.isoformat(),
        }

class Order(db.Model):
    id = db.Column(db.String(20), primary_key=True, default=lambda: str(uuid.uuid4())[:8])
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    service_id = db.Column(db.String(20), db.ForeignKey("service.id"))
    service_name = db.Column(db.String(100))
    pickup_date = db.Column(db.String(50))
    special_instructions = db.Column(db.Text)
    total = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "customerName": self.customer_name,
            "customerPhone": self.customer_phone,
            "serviceId": self.service_id,
            "service": self.service_name,
            "pickupDate": self.pickup_date,
            "specialInstructions": self.special_instructions,
            "total": self.total,
            "createdAt": self.created_at.isoformat(),
        }

# ---------------- ADMIN AUTH ---------------- #
ADMIN_USER = "hahaboi"
ADMIN_PASS = "somethingsomething"

@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        if request.is_json:
            data = request.get_json()
            if data.get("username") == ADMIN_USER and data.get("password") == ADMIN_PASS:
                session["admin_logged_in"] = True
                return jsonify({"message": "Admin login successful"}), 200
            return jsonify({"error": "Invalid credentials"}), 401
        else:
            username = request.form.get("username")
            password = request.form.get("password")
            if username == ADMIN_USER and password == ADMIN_PASS:
                session["admin_logged_in"] = True
                return redirect(url_for("serve_admin"))
            return render_template("lokesh.html", error="Invalid credentials")
    return render_template("lokesh.html")

@app.route("/admin/logout", methods=["POST"])
@admin_login_required
def admin_logout():
    session.pop("admin_logged_in", None)
    return jsonify({"message": "Admin logged out"}), 200

# ---------------- CUSTOMER AUTH (JWT) ---------------- #
@app.route("/auth/signup", methods=["POST"])
def customer_signup():
    data = request.json or {}
    required = ["name", "email", "phone", "password"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
    if Customer.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email exists"}), 400
    customer = Customer(name=data["name"], email=data["email"], phone=data["phone"])
    customer.set_password(data["password"])
    db.session.add(customer)
    db.session.commit()
    token = create_access_token(identity=customer.id)
    return jsonify({"token": token, "customer": customer.to_dict()}), 201

@app.route("/auth/login", methods=["POST"])
def customer_login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Missing fields"}), 400
    customer = Customer.query.filter_by(email=email).first()
    if not customer or not customer.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401
    token = create_access_token(identity=customer.id)
    return jsonify({"token": token, "customer": customer.to_dict()}), 200

# ---------------- PUBLIC ROUTES ---------------- #
@app.route("/api/services", methods=["GET"])
def get_services():
    services = Service.query.all()
    return jsonify([s.to_dict() for s in services]), 200

# ---------------- ADMIN CRUD ---------------- #
@app.route("/admin/api/services", methods=["POST"])
@admin_login_required
def create_service():
    data = request.json or {}
    if not data.get("name") or data.get("price") is None:
        return jsonify({"error": "Missing fields"}), 400
    service = Service(name=data["name"], price=float(data["price"]), duration=data.get("duration"))
    db.session.add(service)
    db.session.commit()
    return jsonify(service.to_dict()), 201

@app.route("/admin/api/services/<service_id>", methods=["PUT"])
@admin_login_required
def update_service(service_id):
    service = Service.query.get_or_404(service_id)
    data = request.json or {}
    service.name = data.get("name", service.name)
    if "price" in data:
        service.price = float(data["price"])
    service.duration = data.get("duration", service.duration)
    service.status = data.get("status", service.status)
    db.session.commit()
    return jsonify(service.to_dict()), 200

@app.route("/admin/api/services/<service_id>", methods=["DELETE"])
@admin_login_required
def delete_service(service_id):
    service = Service.query.get_or_404(service_id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

@app.route("/admin/api/customers", methods=["GET"])
@admin_login_required
def get_customers():
    return jsonify([c.to_dict() for c in Customer.query.all()])

@app.route("/admin/api/customers", methods=["POST"])
@admin_login_required
def create_customer():
    data = request.json or {}
    required = ["name", "email", "phone"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
    if Customer.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email exists"}), 400
    customer = Customer(name=data["name"], email=data["email"], phone=data["phone"])
    customer.set_password("defaultpass")  # you can set a default password or generate one
    db.session.add(customer)
    db.session.commit()
    return jsonify(customer.to_dict()), 201


@app.route("/admin/api/orders", methods=["GET"])
@admin_login_required
def get_orders():
    return jsonify([o.to_dict() for o in Order.query.all()])

# ---------------- CUSTOMER ORDERS ---------------- #
# ---------------- CUSTOMER ORDERS (NO JWT) ---------------- #
@app.route("/api/orders", methods=["POST"])
def create_order_no_jwt():
    data = request.json or {}
    required_fields = ["customerName", "customerPhone", "serviceId", "total"]
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"error": "Missing fields"}), 400

    service = Service.query.get(data["serviceId"])
    if not service:
        return jsonify({"error": "Invalid service"}), 400

    service.usage_count += 1

    order = Order(
        customer_name=data["customerName"],
        customer_phone=data["customerPhone"],
        service_id=service.id,
        service_name=service.name,
        pickup_date=data.get("pickupDate", ""),
        special_instructions=data.get("specialInstructions", ""),
        total=float(data["total"]),
    )

    db.session.add(order)
    db.session.commit()
    return jsonify(order.to_dict()), 201

@app.route("/api/orders", methods=["GET"])
@jwt_required()
def get_my_orders():
    customer = Customer.query.get_or_404(get_jwt_identity())
    orders = Order.query.filter_by(customer_name=customer.name, customer_phone=customer.phone).all()
    return jsonify([o.to_dict() for o in orders])

@app.route("/api/orders/<order_id>", methods=["PUT"])
@jwt_required()
def update_order(order_id):
    customer = Customer.query.get_or_404(get_jwt_identity())
    order = Order.query.get_or_404(order_id)
    if order.customer_name != customer.name or order.customer_phone != customer.phone:
        return jsonify({"error": "Unauthorized"}), 403
    data = request.json or {}
    if "pickupDate" in data:
        order.pickup_date = data["pickupDate"]
    if "specialInstructions" in data:
        order.special_instructions = data["specialInstructions"]
    if "total" in data:
        order.total = float(data["total"])
    if "serviceId" in data:
        service = Service.query.get(data["serviceId"])
        if not service:
            return jsonify({"error": "Invalid service"}), 400
        order.service_id = service.id
        order.service_name = service.name
        service.usage_count += 1
    db.session.commit()
    return jsonify(order.to_dict())

@app.route("/api/orders/<order_id>", methods=["DELETE"])
@jwt_required()
def delete_order(order_id):
    customer = Customer.query.get_or_404(get_jwt_identity())
    order = Order.query.get_or_404(order_id)
    if order.customer_name != customer.name or order.customer_phone != customer.phone:
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(order)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

# ---------------- ADMIN REACT ROUTING ---------------- #
@app.route("/admin", defaults={"path": ""})
@app.route("/admin/<path:path>")
def serve_admin(path):
    if not session.get("admin_logged_in"):
        return redirect(url_for("admin_login"))
    file_path = os.path.join(app.static_folder, path)
    if path and os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

# ---------------- INIT DB ---------------- #
def ensure_db():
    with app.app_context():
        if os.path.exists("fabclean.db"):
            os.remove("fabclean.db")
        db.create_all()
        if not Service.query.first():
            db.session.add_all(
                [
                    Service(id="s1", name="Laundry", price=200, duration="24h"),
                    Service(id="s2", name="Dry Cleaning", price=300, duration="48h"),
                    Service(id="s3", name="Ironing", price=100, duration="12h"),
                ]
            )
            db.session.commit()

# ---------------- RUN ---------------- #
if __name__ == "__main__":
    ensure_db()
    app.run(port=5000, debug=True)

