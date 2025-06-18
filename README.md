# Documentation Tool

**Version:** 1.0.0

This project is a documentation tool designed to create and manage documentation pages, tutorials, and code snippets. It features a simplistic webpage with text formatting options for headings, normal text, and code blocks.

The idea stemmed from my need for a documentation tool that is always accessible and one that I can access and manage as I see fit. And instead of purchasing a subscription for one, I decided to make one.

Now, I'm no web designer, I only worked for a single in 2020. So I had to work with copilot to be able to build this.

The tool is still very basic and requires lots of enhancements and improvements and of course, features to consider and add.

Any feedback, collaboration or suggestions for new features are welcome. You can create a PR on a separate branch and I'd be happy to review and integrate to my tool. ^^

This is a fun idea to test the capabilities of current AI, and the potential of its capabilities in the future.
As a data scientist, I had to be knowledgable of this and what better way than to create a tool that I'll use daily.

That's a lot of rambling for a readme file, but it gives you an idea of where I'm headed with this and how this simple tool came to be and how I'm using AI to improve and add to it in my spare time. :D

## Features

- Create and manage documentation pages
- Write tutorials with formatted text and code snippets
- Display code blocks with syntax highlighting
- User-friendly interface for easy navigation
- **Create, access, and save documents as local Markdown files**
- Light/Dark theme toggle
- Tagging and search functionality
- Sidebar and dropdown navigation for sections and documents
- Unsaved changes warning for editing

## Project Structure

```
documentation_tool
├── src
│   ├── app.py               # Main entry point of the application
│   ├── templates            # HTML templates for the application
│   │   ├── base.html        # Base template with common structure
│   │   ├── index.html       # Homepage displaying an overview
│   │   ├── page.html        # Template for individual documentation pages
│   │   └── tutorial.html    # Template for tutorials
│   ├── static               # Static files (CSS, JS)
│   │   ├── style.css        # Styles for the application
│   │   └── script.js        # JavaScript for interactive features
│   ├── models               # Data models for managing documentation content
│   │   └── __init__.py
│   ├── utils                # Utility functions for various tasks
│   │   └── __init__.py
│   └── documents            # Markdown files for all documentation pages and tutorials
│       └── example.md       # Example document
├── requirements.txt         # Project dependencies
├── README.md                # Project documentation
└── .gitignore               # Files to ignore in version control
```

## Quick Start

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd documentation_tool
   ```

2. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```sh
   python src/app.py
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:5000
   ```

5. **Start creating and managing your documentation!**

## Docker Quick Start

1. **Build the Docker image:**
   ```sh
   docker build -t documentation_tool .

2. **Run the container:**
   ```sh
   docker run -p 5000:5000 \
   -e DOCUMENTS_DIR=/data \
   -v /path/on/host:/data \
   documentation_tool

Replace /path/on/host with a folder on your computer where you want documents to be stored.

**Result:**  
- When running locally, the user will be prompted for a path if `DOCUMENTS_DIR` is not set.
- When running in Docker, use `-e DOCUMENTS_DIR` and `-v` to persist documents outside the container.

This ensures documents are never lost when the container stops and gives users full control over where their files are stored.**Result:**  
- When running locally, the user will be prompted for a path if `DOCUMENTS_DIR` is not set.
- When running in Docker, use `-e DOCUMENTS_DIR` and `-v` to persist documents outside the container.

This ensures documents are never lost when the container stops and gives users full control over where their files are stored.

3. Open your browser and visit:
`http://localhost:5000`

---

# Development Setup: Creating a Virtual Environment

To set up a development environment for this project, it is recommended to use a Python virtual environment. This keeps dependencies isolated and your system Python clean.

## 1. Create and Activate a Virtual Environment

**On macOS/Linux:**
```sh
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```sh
python -m venv venv
venv\Scripts\activate
```

## 2. Install Dependencies

After activating your virtual environment, install the required packages:
```sh
pip install -r requirements.txt
```

## 3. Run the Application

```sh
python src/app.py
```

You can now develop and test your changes in an isolated environment.  
To deactivate the virtual environment when done, simply run:
```sh
deactivate
```

## Usage

- **Create a new document:** Use the web interface to add a new page or tutorial. The document will be saved as a Markdown file in the `src/documents/` directory.
- **Access existing documents:** Browse and open Markdown files from the homepage or navigation menu.
- **Save documents:** All changes are saved automatically to local Markdown files for future access.
- **Search:** Use the search bar to find documents by title, tags, or content.
- **Tags:** Add tags to documents for better organization and filtering.
- **Navigation:** Use the sidebar and dropdowns to quickly navigate between sections and documents.
- **Theme:** Toggle between light and dark mode for comfortable reading.
- **Unsaved Changes Warning:** Get a warning if you try to leave an edit page with unsaved changes.

## Versioning

This project uses [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH).  
- **MAJOR** version when you make incompatible API changes,
- **MINOR** version when you add functionality in a backwards compatible manner, and
- **PATCH** version when you make backwards compatible bug fixes.

The current version is maintained in the `VERSION` file and documented in this README.

## Changelog

### [1.0.0] - 2024-06-09
- Initial public release.
- Core features: create, edit, organize, and search documentation.
- Sidebar navigation, tags, dark mode, and auto-save.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## Copilot Assistance

> **Note:**
> Parts of this project, including code structure, feature implementation, and user interface enhancements, were created with the help of [GitHub Copilot](https://github.com/features/copilot). Copilot provided AI-powered code suggestions and assisted in accelerating the development process.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
