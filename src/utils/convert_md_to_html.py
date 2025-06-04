import os
import markdown

DOCUMENTS_DIR = "src/documents"

for root, dirs, files in os.walk(DOCUMENTS_DIR):
    for f in files:
        if f.endswith(".md"):
            md_path = os.path.join(root, f)
            with open(md_path, "r", encoding="utf-8") as md_file:
                md_content = md_file.read()
            html_content = markdown.markdown(md_content, extensions=["fenced_code", "codehilite"])
            html_path = md_path.rsplit(".", 1)[0] + ".html"
            with open(html_path, "w", encoding="utf-8") as html_file:
                html_file.write(html_content)
