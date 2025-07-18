import os
from flask import Flask, render_template, request, redirect, url_for, flash
import markdown
import json
from flask import jsonify

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
            if f.endswith(".html"):
                section = rel_root if rel_root != "." else DEFAULT_SECTION
                path = os.path.join(section, f).replace(os.sep, "/")
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
    safe_path = path.replace("/", os.sep)
    full_path = os.path.join(DOCUMENTS_DIR, safe_path)
    print(f"Trying to load: {full_path}")  # DEBUG
    print(f"Loading document from: {full_path}")  # DEBUG
    if not os.path.exists(full_path):
        print("File does not exist!")      # DEBUG
        return None
    with open(full_path, "r", encoding="utf-8") as f:
        return f.read()


def save_document(section, filename, content, tags=None):
    section = section if section else DEFAULT_SECTION
    dir_path = os.path.join(DOCUMENTS_DIR, section)
    os.makedirs(dir_path, exist_ok=True)
    # Ensure .html extension
    if not filename.endswith('.html'):
        filename = filename.rsplit('.', 1)[0] + '.html'
    full_path = os.path.join(dir_path, filename)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    # Save tags as meta
    if tags is not None:
        meta_path = get_meta_path(section, filename)
        with open(meta_path, "w", encoding="utf-8") as meta_file:
            json.dump({"tags": tags}, meta_file)


def build_tree(root_dir, rel_path=""):
    tree = []
    for entry in sorted(os.listdir(os.path.join(root_dir, rel_path))):
        full_path = os.path.join(root_dir, rel_path, entry)
        entry_rel_path = os.path.join(rel_path, entry) if rel_path else entry
        entry_rel_path_url = entry_rel_path.replace(os.sep, "/")
        if os.path.isdir(full_path):
            tree.append({
                "type": "folder",
                "name": entry,
                "path": entry_rel_path_url,
                "children": build_tree(root_dir, entry_rel_path)
            })
        elif entry.endswith(".html"):
            tree.append({
                "type": "file",
                "filename": entry,
                "name": entry,
                "path": entry_rel_path_url
            })
    return tree


@app.route("/")
def index():
    doc_tree = build_tree(DOCUMENTS_DIR)
    return render_template("index.html", doc_tree=doc_tree)


@app.route("/page/<path:doc_path>")
def page(doc_path):
    print(f"Requested doc_path: {doc_path}")  # DEBUG
    content = load_document(doc_path)
    if content is None:
        if request.is_json or request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return jsonify({"error": "Document not found."}), 404
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
    # If AJAX, return JSON for in-place editing
    if request.is_json or request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return jsonify({
            "title": filename.rsplit('.', 1)[0].replace('_', ' '),
            "section": section,
            "tags": tags,
            "content": content
        })
    # Otherwise, render the page as before
    docs = list_documents()
    section_name = section if section else DEFAULT_SECTION
    section_docs = [doc for doc in docs if doc["section"] == section_name]
    html_content = content
    return render_template(
        "page.html",
        title=doc_path,
        content=html_content,
        tags=tags,
        current_section=section_name,
        current_doc=filename,
        current_doc_path=doc_path,
        doc_tree=build_tree(DOCUMENTS_DIR),
        section_docs=section_docs,
    )


@app.route("/new", methods=["GET", "POST"])
def new_document():
    if request.method == "POST":
        section = request.form.get("section", "").strip()
        title = request.form.get("title", "").strip()
        tags_raw = request.form.get("tags", "")
        tags = [
            t.strip().lstrip("#")
            for t in tags_raw.replace(",", " ").split()
            if t.strip()
        ]
        content = request.form.get("content", "")
        filename = f"{title.replace(' ', '_')}.html"
        if not title:
            flash("Title is required.", "error")
            return redirect(url_for("new_document"))
        save_document(section, filename, content, tags)
        doc_path = os.path.join(section if section else DEFAULT_SECTION, filename).replace(os.sep, "/")
        flash("Document created successfully.", "success")
        # Redirect to home with anchor to the created document
        return redirect(url_for("index", _anchor=doc_path))
    return render_template("new.html")


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


@app.route("/autosave", methods=["POST"])
def autosave_document():
    data = request.get_json()
    section = data.get("section", "").strip()
    title = data.get("title", "").strip()
    tags_raw = data.get("tags", "")
    tags = [
        t.strip().lstrip("#")
        for t in tags_raw.replace(",", " ").split()
        if t.strip()
    ]
    content = data.get("content", "")
    filename = f"{title.replace(' ', '_')}.html"
    if not title:
        return jsonify({"success": False, "error": "Title is required."}), 400
    save_document(section, filename, content, tags)
    doc_path = os.path.join(section if section else DEFAULT_SECTION, filename)
    return jsonify({"success": True, "doc_path": doc_path})

@app.route("/move_document", methods=["POST"])
def move_document():
    data = request.get_json()
    file_path = data["file_path"]
    target_folder = data["target_folder"]
    src = os.path.join(DOCUMENTS_DIR, file_path)
    dst_dir = os.path.join(DOCUMENTS_DIR, target_folder)
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, os.path.basename(file_path))
    os.rename(src, dst)
    # Move meta file if exists
    meta_src = src + ".meta.json"
    meta_dst = dst + ".meta.json"
    if os.path.exists(meta_src):
        os.rename(meta_src, meta_dst)
    return jsonify(success=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
