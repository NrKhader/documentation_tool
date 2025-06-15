// This file contains JavaScript code for any interactive features on the webpage, such as handling user input or enhancing the user interface.

// Theme toggle logic
document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        if (toggle) toggle.textContent = '☀️';
    }
    if (toggle) {
        toggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                toggle.textContent = '☀️';
            } else {
                localStorage.setItem('theme', 'light');
                toggle.textContent = '🌙';
            }
        });
    }
});

// REMOVE: Unsaved changes warning logic (no longer needed with auto-save)

// Document section toggle
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.section-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const docList = btn.nextElementSibling;
            const isOpen = btn.classList.toggle('open');
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (docList) {
                docList.style.display = isOpen ? 'block' : 'none';
            }
        });
    });
});

// Writing space and hidden textarea sync
document.addEventListener('DOMContentLoaded', function () {
    const writingSpace = document.getElementById('writing-space');
    const hiddenTextarea = document.getElementById('content');
    const form = document.getElementById('doc-form');
    if (writingSpace && hiddenTextarea && form) {
        // Sync on input
        writingSpace.addEventListener('input', function () {
            hiddenTextarea.value = writingSpace.innerHTML; // <-- Use innerHTML
        });
        // On form submit, ensure sync
        form.addEventListener('submit', function () {
            hiddenTextarea.value = writingSpace.innerHTML; // <-- Use innerHTML
        });

        // Fix: Allow breaking out of code block with Enter on empty line or Escape
        writingSpace.addEventListener('keydown', function (e) {
            // If inside a code block and Enter is pressed on an empty line, break out
            if (e.key === 'Enter') {
                const selection = window.getSelection();
                if (selection && selection.anchorNode) {
                    // Get the current line text
                    let node = selection.anchorNode;
                    // If inside a <div> or <pre>, get the text content
                    let lineText = node.textContent || '';
                    // If the line is empty and inside a code block, break out
                    if (
                        lineText.trim() === '' &&
                        node.parentElement &&
                        (node.parentElement.nodeName === 'PRE' || node.parentElement.nodeName === 'CODE')
                    ) {
                        // Prevent default Enter
                        e.preventDefault();
                        // Move caret after the code block
                        let after = document.createElement('div');
                        after.innerHTML = '<br>';
                        node.parentElement.parentElement.insertBefore(after, node.parentElement.nextSibling);
                        // Move caret to new line
                        let range = document.createRange();
                        range.setStart(after, 0);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
            // Or allow Escape to break out of code block
            if (e.key === 'Escape') {
                const selection = window.getSelection();
                if (selection && selection.anchorNode) {
                    let node = selection.anchorNode;
                    if (
                        node.parentElement &&
                        (node.parentElement.nodeName === 'PRE' || node.parentElement.nodeName === 'CODE')
                    ) {
                        e.preventDefault();
                        let after = document.createElement('div');
                        after.innerHTML = '<br>';
                        node.parentElement.parentElement.insertBefore(after, node.parentElement.nextSibling);
                        let range = document.createRange();
                        range.setStart(after, 0);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
        });
    }
});

// Toolbar formatting
document.addEventListener('DOMContentLoaded', function () {
    const toolbar = document.querySelector('.editor-toolbar');
    const writingSpace = document.getElementById('writing-space');
    if (toolbar && writingSpace) {
        toolbar.addEventListener('click', function (e) {
            const btn = e.target.closest('.toolbar-btn');
            if (!btn) return;
            const cmd = btn.dataset.command;
            writingSpace.focus();
            if (cmd === 'bold' || cmd === 'italic' || cmd === 'insertUnorderedList' || cmd === 'insertOrderedList' || cmd === 'undo' || cmd === 'redo' || cmd === 'insertHorizontalRule') {
                document.execCommand(cmd, false, null);
            } else if (cmd === 'h2') {
                document.execCommand('formatBlock', false, 'h2');
            } else if (cmd === 'code') {
                document.execCommand('formatBlock', false, 'pre');
            } else if (cmd === 'createLink') {
                const url = prompt('Enter the URL');
                if (url) document.execCommand('createLink', false, url);
            } else if (cmd === 'insertImage') {
                const url = prompt('Enter the image URL');
                if (url) document.execCommand('insertImage', false, url);
            } else if (cmd === 'formatBlock' && btn.dataset.value === 'blockquote') {
                document.execCommand('formatBlock', false, 'blockquote');
            }
        });
    }
    // Word count
    if (writingSpace) {
        const wordCount = document.getElementById('word-count');
        const updateCount = () => {
            const text = writingSpace.innerText || '';
            const count = text.trim().split(/\s+/).filter(Boolean).length;
            if (wordCount) wordCount.textContent = `${count} word${count !== 1 ? 's' : ''}`;
        };
        writingSpace.addEventListener('input', updateCount);
        updateCount();
    }
});

// Optional: Add a "Saved" indicator to the editor header in your HTML:
// <span id="autosave-status" style="margin-left:1em; color:#47d5d0; font-size:0.95em; display:none;">Saved</span>

// Enhance auto-save to show/hide the "Saved" indicator
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('doc-form');
    const writingSpace = document.getElementById('writing-space');
    const autosaveStatus = document.getElementById('autosave-status');
    let autosaveTimeout = null;
    let lastSavedData = "";

    function getFormData() {
        return {
            title: form.querySelector('[name="title"]').value,
            section: form.querySelector('[name="section"]').value,
            tags: form.querySelector('[name="tags"]').value,
            content: writingSpace ? writingSpace.innerHTML : ""
        };
    }

    async function autoSave() {
        const data = getFormData();
        const dataString = JSON.stringify(data);
        if (dataString === lastSavedData || !data.title) return;
        lastSavedData = dataString;
        try {
            await fetch("/autosave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: dataString
            });
            if (autosaveStatus) {
                autosaveStatus.style.display = "inline";
                autosaveStatus.textContent = "Saved";
                setTimeout(() => { autosaveStatus.style.display = "none"; }, 1200);
            }
        } catch (e) {
            if (autosaveStatus) {
                autosaveStatus.style.display = "inline";
                autosaveStatus.textContent = "Auto-save failed";
                autosaveStatus.style.color = "#e74c3c";
                setTimeout(() => { autosaveStatus.style.display = "none"; autosaveStatus.style.color = "#47d5d0"; }, 2000);
            }
        }
    }

    if (form && writingSpace) {
        form.addEventListener('input', function () {
            clearTimeout(autosaveTimeout);
            autosaveTimeout = setTimeout(autoSave, 1200);
        });
        writingSpace.addEventListener('input', function () {
            clearTimeout(autosaveTimeout);
            autosaveTimeout = setTimeout(autoSave, 1200);
        });
    }
});

// Folder label click logic
document.addEventListener('DOMContentLoaded', function () {
    function getOpenFolders() {
        return JSON.parse(localStorage.getItem('openFolders') || '[]');
    }

    function setOpenFolders(openFolders) {
        localStorage.setItem('openFolders', JSON.stringify(openFolders));
    }

    function toggleFolder(folderEl, folderPath) {
        const ul = folderEl.querySelector('.file-list');
        if (!ul) return;
        const openFolders = getOpenFolders();
        const label = folderEl.querySelector('.folder-label');
        if (ul.style.display === 'none') {
            ul.style.display = 'block';
            if (label) label.textContent = label.textContent.trim();
            if (!openFolders.includes(folderPath)) openFolders.push(folderPath);
        } else {
            ul.style.display = 'none';
            if (label) label.textContent = label.textContent.trim();
            const idx = openFolders.indexOf(folderPath);
            if (idx !== -1) openFolders.splice(idx, 1);
        }
        setOpenFolders(openFolders);
    }

    function restoreOpenFolders() {
        const openFolders = getOpenFolders();
        document.querySelectorAll('.folder').forEach(folderEl => {
            const folderPath = folderEl.dataset.path;
            const ul = folderEl.querySelector('.file-list');
            const label = folderEl.querySelector('.folder-label');
            if (openFolders.includes(folderPath) && ul) {
                ul.style.display = 'block';
                if (label) label.textContent = label.textContent.trim();
            }
        });
    }

    // Folder expand/collapse with state
    document.querySelectorAll('.folder-label').forEach(label => {
        label.addEventListener('click', function () {
            const folderEl = label.closest('.folder');
            const folderPath = folderEl.dataset.path;
            toggleFolder(folderEl, folderPath);
        });
    });
    restoreOpenFolders();

    // In-place file editing
    document.querySelectorAll('.file-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove 'active' from all file links
            document.querySelectorAll('.file-link.active').forEach(el => el.classList.remove('active'));
            // Add 'active' to the clicked link
            link.classList.add('active');

            const docPath = link.dataset.docPath;
            if (!docPath) {
                alert("Error: docPath is undefined!");
                return;
            }
            fetch(`/page/${docPath}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                        return;
                    }
                    document.getElementById('editor-panel').style.display = 'block';
                    // Hide welcome panel if present
                    var welcomePanel = document.getElementById('welcome-panel');
                    if (welcomePanel) welcomePanel.style.display = 'none';
                    document.getElementById('title').value = data.title || '';
                    document.getElementById('section').value = data.section || '';
                    document.getElementById('tags').value = data.tags ? data.tags.map(t => `#${t}`).join(', ') : '';
                    document.getElementById('writing-space').innerHTML = data.content || '';
                    document.getElementById('content').value = data.content || '';
                });
        });
    });

    // Optionally, if you have a way to "deselect" a document, show the welcome panel again:
    // Example: Add a "Home" button click handler
    const homeBtn = document.querySelector('a[href="' + window.location.pathname + '"]');
    if (homeBtn) {
        homeBtn.addEventListener('click', function (e) {
            // Only handle if not a full reload
            if (document.getElementById('welcome-panel')) {
                e.preventDefault();
                document.getElementById('editor-panel').style.display = 'none';
                document.getElementById('welcome-panel').style.display = 'block';
                // Optionally clear the editor fields
                document.getElementById('title').value = '';
                document.getElementById('section').value = '';
                document.getElementById('tags').value = '';
                document.getElementById('writing-space').innerHTML = '';
                document.getElementById('content').value = '';
                // Remove active class from file links
                document.querySelectorAll('.file-link.active').forEach(el => el.classList.remove('active'));
            }
        });
    }
});

// Drag and drop logic for files and folders
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.file[draggable="true"]').forEach(file => {
        file.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', file.dataset.path);
        });
    });
    document.querySelectorAll('.folder').forEach(folder => {
        folder.addEventListener('dragover', function (e) {
            e.preventDefault();
            folder.classList.add('drag-over');
        });
        folder.addEventListener('dragleave', function (e) {
            folder.classList.remove('drag-over');
        });
        folder.addEventListener('drop', function (e) {
            e.preventDefault();
            folder.classList.remove('drag-over');
            const filePath = e.dataTransfer.getData('text/plain');
            const targetFolder = folder.dataset.path;
            fetch('/move_document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_path: filePath, target_folder: targetFolder })
            }).then(() => {
                // After reload, restore open folders
                window.location.reload();
            });
        });
    });
});

// Responsive sidebar toggle for mobile
// Show/hide sidebar on small screens
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const sidebar = document.querySelector('.sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (!sidebar || !sidebarToggle) return;
        function updateSidebarVisibility() {
            if (window.innerWidth <= 900) {
                sidebarToggle.style.display = 'block';
                sidebar.classList.remove('open');
            } else {
                sidebarToggle.style.display = 'none';
                sidebar.classList.remove('open');
            }
        }
        sidebarToggle.addEventListener('click', function () {
            sidebar.classList.toggle('open');
        });
        window.addEventListener('resize', updateSidebarVisibility);
        updateSidebarVisibility();
    });
})();

// Code block copy-to-clipboard button
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('pre, .writing-space pre').forEach(function (pre) {
            if (pre.querySelector('.code-copy-btn')) return;
            const btn = document.createElement('button');
            btn.className = 'code-copy-btn';
            btn.type = 'button';
            btn.title = 'Copy code';
            btn.setAttribute('aria-label', 'Copy code');
            btn.innerHTML = '📋';
            btn.addEventListener('click', function () {
                let code = pre.querySelector('code') ? pre.querySelector('code').innerText : pre.innerText;
                navigator.clipboard.writeText(code).then(() => {
                    btn.innerHTML = '✔️';
                    setTimeout(() => { btn.innerHTML = '📋'; }, 1200);
                });
            });
            pre.style.position = 'relative';
            pre.appendChild(btn);
        });
    });
})();
