import os
from flask import Flask, render_template, request, redirect, url_for, flash
import markdown
import json

app = Flask(__name__)
app.secret_key = "your_secret_key"


def get_documents_dir():
    env_dir = os.environ.get("DOCUMENTS_DIR")
    if env_dir:
        return env_dir
    # Prompt user for a path if not running in Docker
    print("Please provide a path to save your documents (default: ./src/documents): ", end="")
    try:
        user_input = input().strip()
    except EOFError:
        user_input = ""
    return user_input if user_input else os.path.join(os.path.dirname(__file__), "documents")


# Only call once and use the result everywhere
DOCUMENTS_DIR = get_documents_dir()
os.makedirs(DOCUMENTS_DIR, exist_ok=True)

DEFAULT_SECTION = "home"


def get_meta_path(section, filename):
    section = section if section else DEFAULT_SECTION
    dir_path = os.path.join(DOCUMENTS_DIR, section)
    meta_filename = f"{filename}.meta.json"
    return os.path.join(dir_path, meta_filename)


def list_documents():
    docs = []
    for root, dirs, files in os.walk(DOCUMENTS_DIR):
        rel_root = os.path.relpath(root, DOCUMENTS_DIR)
        for f in files:
            if f.endswith(".md"):
                if rel_root == ".":
                    section = DEFAULT_SECTION
                    path = f
                else:
                    section = rel_root
                    path = os.path.join(section, f)
                # Load tags if meta file exists
                meta_path = get_meta_path(section, f)
                tags = []
                if os.path.exists(meta_path):
                    try:
                        with open(meta_path, "r", encoding="utf-8") as meta_file:
                            meta = json.load(meta_file)
                            tags = meta.get("tags", [])
                    except Exception:
                        tags = []
                docs.append(
                    {"section": section, "filename": f, "path": path, "tags": tags}
                )
    return docs


def load_document(path):
    full_path = os.path.join(DOCUMENTS_DIR, path)
    if not os.path.exists(full_path):
        return None
    with open(full_path, "r", encoding="utf-8") as f:
        return f.read()


def save_document(section, filename, content, tags=None):
    section = section if section else DEFAULT_SECTION
    dir_path = os.path.join(DOCUMENTS_DIR, section)
    os.makedirs(dir_path, exist_ok=True)
    full_path = os.path.join(dir_path, filename)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    # Save tags as meta
    if tags is not None:
        meta_path = get_meta_path(section, filename)
        with open(meta_path, "w", encoding="utf-8") as meta_file:
            json.dump({"tags": tags}, meta_file)


@app.route("/")
def index():
    docs = list_documents()
    grouped = {}
    for doc in docs:
        grouped.setdefault(doc["section"], []).append(doc)
    return render_template("index.html", grouped_documents=grouped)


@app.route("/page/<path:doc_path>")
def page(doc_path):
    content = load_document(doc_path)
    if content is None:
        flash("Document not found.", "error")
        return redirect(url_for("index"))
    section, filename = os.path.split(doc_path)
    meta_path = get_meta_path(section, filename)
    tags = []
    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r", encoding="utf-8") as meta_file:
                meta = json.load(meta_file)
                tags = meta.get("tags", [])
        except Exception:
            tags = []
    # Get all docs in the current section
    docs = list_documents()
    section_name = section if section else DEFAULT_SECTION
    section_docs = [doc for doc in docs if doc["section"] == section_name]
    # Render markdown to HTML
    html_content = markdown.markdown(content, extensions=["fenced_code", "codehilite"])
    return render_template(
        "page.html",
        title=doc_path,
        content=html_content,  # <-- Pass rendered HTML
        tags=tags,
        current_section=section_name,
        current_doc=filename,
        section_docs=section_docs,
    )


@app.route("/new", methods=["GET", "POST"])
def new_document():
    if request.method == "POST":
        section = request.form["section"].strip()
        title = request.form["title"].strip()
        tags_raw = request.form.get("tags", "")
        tags = [
            t.strip().lstrip("#")
            for t in tags_raw.replace(",", " ").split()
            if t.strip()
        ]
        content = request.form["content"]
        filename = f"{title.replace(' ', '_')}.md"
        if not title:
            flash("Title is required.", "error")
            return redirect(url_for("new_document"))
        save_document(section, filename, content, tags)
        doc_path = os.path.join(section if section else DEFAULT_SECTION, filename)
        flash("Document created successfully.", "success")
        return redirect(url_for("page", doc_path=doc_path))
    return render_template("new.html")


@app.route("/edit/<path:doc_path>", methods=["GET", "POST"])
def edit_document(doc_path):
    section, filename = os.path.split(doc_path)
    meta_path = get_meta_path(section, filename)
    tags = []
    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r", encoding="utf-8") as meta_file:
                meta = json.load(meta_file)
                tags = meta.get("tags", [])
        except Exception:
            tags = []
    docs = list_documents()
    section_name = section if section else DEFAULT_SECTION
    section_docs = [doc for doc in docs if doc["section"] == section_name]
    if request.method == "POST":
        content = request.form["content"]
        tags_raw = request.form.get("tags", "")
        tags = [
            t.strip().lstrip("#")
            for t in tags_raw.replace(",", " ").split()
            if t.strip()
        ]
        save_document(section, filename, content, tags)
        flash("Document updated.", "success")
        return redirect(url_for("page", doc_path=doc_path))
    content = load_document(doc_path)
    if content is None:
        flash("Document not found.", "error")
        return redirect(url_for("index"))
    return render_template(
        "edit.html",
        title=doc_path,
        content=content,
        tags=", ".join(f"#{t}" for t in tags),
        current_section=section_name,
        current_doc=filename,
        section_docs=section_docs,
    )


@app.route("/search")
def search():
    query = request.args.get("q", "").strip().lower()
    if not query:
        return redirect(url_for("index"))
    docs = list_documents()
    results = []
    for doc in docs:
        # Search in filename
        if query in doc["filename"].lower():
            results.append(doc)
            continue
        # Search in tags
        if any(query in tag.lower() for tag in doc.get("tags", [])):
            results.append(doc)
            continue
        # Search in content
        content = load_document(doc["path"])
        if content and query in content.lower():
            results.append(doc)
    return render_template("search_results.html", query=query, results=results)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
