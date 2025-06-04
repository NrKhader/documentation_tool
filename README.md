# Documentation Tool

This project is a documentation tool designed to create and manage documentation pages, tutorials, and code snippets. It features a simplistic webpage with text formatting options for headings, normal text, and code blocks.

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

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd documentation_tool
   ```
3. Install the required dependencies:
   ```
   pip install -r requirements.txt
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

To run the application, execute the following command:
```
python src/app.py
```

Visit `http://localhost:5000` in your web browser to access the documentation tool.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## Copilot Assistance

> **Note:**
> Parts of this project, including code structure, feature implementation, and user interface enhancements, were created with the help of [GitHub Copilot](https://github.com/features/copilot). Copilot provided AI-powered code suggestions and assisted in accelerating the development process.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
