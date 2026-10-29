import os
from pathlib import Path
from functools import wraps

from dotenv import load_dotenv
from flask import (
    Flask, abort, flash, redirect, render_template, request,
    send_from_directory, url_for
)
from flask_login import (
    LoginManager, UserMixin, current_user, login_required,
    login_user, logout_user
)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "ppt", "pptx", "txt"}

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-only-change-this-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:"
    f"{os.getenv('DB_PASSWORD', '')}@{os.getenv('DB_HOST', 'localhost')}:"
    f"{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME', 'eduvault')}"
    "?charset=utf8mb4"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = str(UPLOAD_FOLDER)
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB per upload

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"
login_manager.login_message = "Please log in to access that page."


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(160), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")
    created_at = db.Column(db.DateTime, server_default=db.func.now())


class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    branch = db.Column(db.String(80), nullable=False, default="CSE")
    semester = db.Column(db.Integer, nullable=False, default=1)
    code = db.Column(db.String(30), nullable=True)


class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(180), nullable=False)
    category = db.Column(db.String(40), nullable=False)
    description = db.Column(db.Text, nullable=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subject.id"), nullable=True)
    uploaded_by = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    subject = db.relationship("Subject", backref="resources")
    uploader = db.relationship("User", backref="uploaded_resources")


class Announcement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(180), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    author = db.relationship("User", backref="announcements")


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


def teacher_required(view):
    @wraps(view)
    @login_required
    def wrapped(*args, **kwargs):
        if current_user.role not in {"teacher", "admin"}:
            abort(403)
        return view(*args, **kwargs)
    return wrapped


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/")
def index():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    return render_template("index.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        if not name or not email or len(password) < 8:
            flash("Enter your name/email and a password with at least 8 characters.", "error")
        elif User.query.filter_by(email=email).first():
            flash("An account with that email already exists.", "error")
        else:
            # Public registration always creates a student. Promote staff accounts
            # manually through a trusted admin workflow; never trust a form role.
            user = User(
                name=name,
                email=email,
                password_hash=generate_password_hash(password),
                role="student",
            )
            db.session.add(user)
            db.session.commit()
            login_user(user)
            flash("Account created successfully.", "success")
            return redirect(url_for("dashboard"))
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for("dashboard"))
        flash("Invalid email or password.", "error")
    return render_template("login.html")


@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "success")
    return redirect(url_for("index"))


@app.route("/dashboard")
@login_required
def dashboard():
    resource_count = Resource.query.count()
    subject_count = Subject.query.count()
    announcements = Announcement.query.order_by(Announcement.created_at.desc()).limit(5).all()
    recent_resources = Resource.query.order_by(Resource.created_at.desc()).limit(5).all()
    return render_template(
        "dashboard.html",
        resource_count=resource_count,
        subject_count=subject_count,
        announcements=announcements,
        recent_resources=recent_resources,
    )


@app.route("/resources")
@login_required
def resources():
    query = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    items = Resource.query
    if query:
        items = items.join(Subject, isouter=True).filter(
            or_(
                Resource.title.ilike(f"%{query}%"),
                Resource.description.ilike(f"%{query}%"),
                Subject.name.ilike(f"%{query}%"),
            )
        )
    if category:
        items = items.filter(Resource.category == category)
    items = items.order_by(Resource.created_at.desc()).all()
    return render_template("resources.html", resources=items, query=query, category=category)


@app.route("/resources/upload", methods=["GET", "POST"])
@teacher_required
def upload_resource():
    subjects = Subject.query.order_by(Subject.semester, Subject.name).all()
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        category = request.form.get("category", "").strip()
        description = request.form.get("description", "").strip()
        subject_id = request.form.get("subject_id") or None
        file = request.files.get("file")

        if not title or category not in {
            "Notes", "Previous Question Paper", "Model Paper",
            "Lab Program", "Assignment", "Other"
        }:
            flash("Enter a title and choose a valid category.", "error")
        elif not file or not file.filename:
            flash("Choose a file to upload.", "error")
        elif not allowed_file(file.filename):
            flash("Unsupported file type. Allowed: PDF, DOC/DOCX, PPT/PPTX, TXT.", "error")
        else:
            original = secure_filename(file.filename)
            # Prefixing with a random UUID avoids filename collisions.
            from uuid import uuid4
            stored = f"{uuid4().hex}_{original}"
            file.save(UPLOAD_FOLDER / stored)
            resource = Resource(
                title=title,
                category=category,
                description=description or None,
                filename=stored,
                original_filename=original,
                subject_id=int(subject_id) if subject_id else None,
                uploaded_by=current_user.id,
            )
            db.session.add(resource)
            db.session.commit()
            flash("Resource uploaded.", "success")
            return redirect(url_for("resources"))
    return render_template("upload_resource.html", subjects=subjects)


@app.route("/resources/<int:resource_id>/download")
@login_required
def download_resource(resource_id):
    resource = db.get_or_404(Resource, resource_id)
    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        resource.filename,
        as_attachment=True,
        download_name=resource.original_filename,
    )


@app.route("/announcements/create", methods=["GET", "POST"])
@teacher_required
def create_announcement():
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        body = request.form.get("body", "").strip()
        if not title or not body:
            flash("Enter both a title and announcement details.", "error")
        else:
            db.session.add(Announcement(title=title, body=body, created_by=current_user.id))
            db.session.commit()
            flash("Announcement published.", "success")
            return redirect(url_for("dashboard"))
    return render_template("create_announcement.html")


@app.errorhandler(403)
def forbidden(_error):
    return render_template("error.html", code=403, message="You do not have permission to access this page."), 403


@app.errorhandler(404)
def not_found(_error):
    return render_template("error.html", code=404, message="The page or resource was not found."), 404


@app.errorhandler(413)
def file_too_large(_error):
    return render_template("error.html", code=413, message="File too large. The maximum upload size is 20 MB."), 413


@app.cli.command("init-db")
def init_db():
    """Create tables. Run with: flask --app app init-db"""
    db.create_all()
    print("EduVault tables created.")


@app.cli.command("seed-demo")
def seed_demo():
    """Add sample subjects. Run after init-db."""
    db.create_all()
    defaults = [
        ("Engineering Mathematics I", "BMATS101", 1),
        ("Applied Physics", "BPHYS102", 1),
        ("Programming in C", "BPOPS103", 1),
        ("Computer-Aided Engineering Drawing", "BCED104", 1),
    ]
    for name, code, semester in defaults:
        if not Subject.query.filter_by(name=name).first():
            db.session.add(Subject(name=name, code=code, semester=semester, branch="CSE"))
    db.session.commit()
    print("Demo subjects added.")


if __name__ == "__main__":
    app.run(debug=True)
