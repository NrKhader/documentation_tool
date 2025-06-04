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
            hiddenTextarea.value = writingSpace.innerText.replace(/\r\n|\r|\n/g, '\n');
        });
        // On form submit, ensure sync
        form.addEventListener('submit', function () {
            hiddenTextarea.value = writingSpace.innerText.replace(/\r\n|\r|\n/g, '\n');
        });
    }
});
