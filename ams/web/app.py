from functools import wraps

from flask import Flask, redirect, render_template, request, url_for

from ams import config
from ams.web import catalog


def _check_auth(username: str, password: str) -> bool:
    return username == config.ADMIN_USERNAME and password == config.ADMIN_PASSWORD


def requires_admin(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        auth = request.authorization
        if not auth or not _check_auth(auth.username, auth.password):
            return (
                "Admin login required",
                401,
                {"WWW-Authenticate": 'Basic realm="AMS Admin"'},
            )
        return view(*args, **kwargs)

    return wrapped


def create_app() -> Flask:
    app = Flask(__name__)

    @app.route("/")
    def storefront():
        products = catalog.all_products()
        types = sorted({p["type"] for p in products}, key=lambda t: catalog.TYPE_LABELS.get(t, t))
        return render_template(
            "storefront.html",
            products=products,
            types=types,
            type_labels=catalog.TYPE_LABELS,
            brand_name=config.BRAND_NAME,
            brand_tagline=config.BRAND_TAGLINE,
        )

    @app.route("/admin/dashboard")
    @requires_admin
    def dashboard():
        products = catalog.all_products()
        ebooks = [p for p in products if p["type"] == "ebook"]
        etsy_drafts = [p for p in ebooks if p.get("etsy_status") == "draft"]
        return render_template(
            "dashboard.html",
            products=products,
            ebooks=ebooks,
            product_types=catalog.TYPE_LABELS,
            etsy_drafts_count=len(etsy_drafts),
            catalog_value=sum(p["price"] for p in products),
            brand_name=config.BRAND_NAME,
        )

    @app.route("/admin/products/add", methods=["POST"])
    @requires_admin
    def add_product():
        catalog.add_curated_product(
            {
                "type": request.form["type"],
                "title": request.form["title"],
                "description": request.form["description"],
                "price": float(request.form["price"]),
                "format": request.form["format"],
                "featured": request.form.get("featured") == "on",
            }
        )
        return redirect(url_for("dashboard"))

    @app.route("/admin/products/<product_id>/delete", methods=["POST"])
    @requires_admin
    def delete_product(product_id):
        catalog.delete_curated_product(product_id)
        return redirect(url_for("dashboard"))

    return app


app = create_app()

if __name__ == "__main__":
    if config.ADMIN_PASSWORD == "change-me":
        print("WARNING: AMS_ADMIN_PASSWORD is not set — using the insecure default. Set it in .env.")
    app.run(debug=True, port=5000)
