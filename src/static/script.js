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

// Warn about unsaved changes on edit/new document pages
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('doc-form');
    if (form) {
        let initialData = new FormData(form);
        let isDirty = false;

        // Mark as dirty if any field changes
        form.addEventListener('input', () => {
            isDirty = true;
        });

        // On submit, allow navigation
        form.addEventListener('submit', () => {
            isDirty = false;
        });

        // Warn if trying to leave with unsaved changes
        window.addEventListener('beforeunload', function (e) {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }
});

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
