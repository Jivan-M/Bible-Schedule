/*
 * Custom Reading Plan
 * Lets users generate a personal daily reading schedule spanning a range
 * of books/chapters, distributed across chosen days of the week between
 * a start and end date. Stored in localStorage.
 */

var BIBLE_BOOKS = [
    { name: "Genesis", chapters: 50 },
    { name: "Exodus", chapters: 40 },
    { name: "Leviticus", chapters: 27 },
    { name: "Numbers", chapters: 36 },
    { name: "Deuteronomy", chapters: 34 },
    { name: "Joshua", chapters: 24 },
    { name: "Judges", chapters: 21 },
    { name: "Ruth", chapters: 4 },
    { name: "1 Samuel", chapters: 31 },
    { name: "2 Samuel", chapters: 24 },
    { name: "1 Kings", chapters: 22 },
    { name: "2 Kings", chapters: 25 },
    { name: "1 Chronicles", chapters: 29 },
    { name: "2 Chronicles", chapters: 36 },
    { name: "Ezra", chapters: 10 },
    { name: "Nehemiah", chapters: 13 },
    { name: "Esther", chapters: 10 },
    { name: "Job", chapters: 42 },
    { name: "Psalms", chapters: 150 },
    { name: "Proverbs", chapters: 31 },
    { name: "Ecclesiastes", chapters: 12 },
    { name: "Song of Songs", chapters: 8 },
    { name: "Isaiah", chapters: 66 },
    { name: "Jeremiah", chapters: 52 },
    { name: "Lamentations", chapters: 5 },
    { name: "Ezekiel", chapters: 48 },
    { name: "Daniel", chapters: 12 },
    { name: "Hosea", chapters: 14 },
    { name: "Joel", chapters: 3 },
    { name: "Amos", chapters: 9 },
    { name: "Obadiah", chapters: 1 },
    { name: "Jonah", chapters: 4 },
    { name: "Micah", chapters: 7 },
    { name: "Nahum", chapters: 3 },
    { name: "Habakkuk", chapters: 3 },
    { name: "Zephaniah", chapters: 3 },
    { name: "Haggai", chapters: 2 },
    { name: "Zechariah", chapters: 14 },
    { name: "Malachi", chapters: 4 },
    { name: "Matthew", chapters: 28 },
    { name: "Mark", chapters: 16 },
    { name: "Luke", chapters: 24 },
    { name: "John", chapters: 21 },
    { name: "Acts", chapters: 28 },
    { name: "Romans", chapters: 16 },
    { name: "1 Corinthians", chapters: 16 },
    { name: "2 Corinthians", chapters: 13 },
    { name: "Galatians", chapters: 6 },
    { name: "Ephesians", chapters: 6 },
    { name: "Philippians", chapters: 4 },
    { name: "Colossians", chapters: 4 },
    { name: "1 Thessalonians", chapters: 5 },
    { name: "2 Thessalonians", chapters: 3 },
    { name: "1 Timothy", chapters: 6 },
    { name: "2 Timothy", chapters: 4 },
    { name: "Titus", chapters: 3 },
    { name: "Philemon", chapters: 1 },
    { name: "Hebrews", chapters: 13 },
    { name: "James", chapters: 5 },
    { name: "1 Peter", chapters: 5 },
    { name: "2 Peter", chapters: 3 },
    { name: "1 John", chapters: 5 },
    { name: "2 John", chapters: 1 },
    { name: "3 John", chapters: 1 },
    { name: "Jude", chapters: 1 },
    { name: "Revelation", chapters: 22 }
];

var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

var CUSTOM_PLAN_KEY = 'custom_reading_plan';

function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
}

function getCustomPlan() {
    var stored = localStorage.getItem(CUSTOM_PLAN_KEY);
    if (stored) {
        try {
            var plan = JSON.parse(stored);
            if (Array.isArray(plan) && plan.length > 0) return plan;
        } catch (e) {}
    }
    return null;
}

function saveCustomPlan(plan) {
    localStorage.setItem(CUSTOM_PLAN_KEY, JSON.stringify(plan));
}

function clearCustomPlan() {
    localStorage.removeItem(CUSTOM_PLAN_KEY);
}

/* Build the ordered list of {book, chapter} objects from a start point to an end point. */
function generateReadingList(startBookIdx, startChapter, endBookIdx, endChapter) {
    var readings = [];
    for (var i = startBookIdx; i <= endBookIdx; i++) {
        var book = BIBLE_BOOKS[i];
        var firstCh = (i === startBookIdx) ? startChapter : 1;
        var lastCh = (i === endBookIdx) ? endChapter : book.chapters;
        for (var ch = firstCh; ch <= lastCh; ch++) {
            readings.push({ book: book.name, chapter: ch });
        }
    }
    return readings;
}

/* Format a batch of chapter objects into a compact reading string.
 * Consecutive chapters in the same book become a range: "John 1-3".
 * Cross-book batches use "; ": "John 20-21; Acts 1-2". */
function formatReadingBatch(batch) {
    var groups = [];
    var curBook = null, curStart = null, curEnd = null;
    for (var i = 0; i < batch.length; i++) {
        if (batch[i].book === curBook && batch[i].chapter === curEnd + 1) {
            curEnd = batch[i].chapter;
        } else {
            if (curBook !== null) groups.push({ book: curBook, start: curStart, end: curEnd });
            curBook = batch[i].book;
            curStart = batch[i].chapter;
            curEnd = batch[i].chapter;
        }
    }
    if (curBook !== null) groups.push({ book: curBook, start: curStart, end: curEnd });
    var parts = [];
    for (var i = 0; i < groups.length; i++) {
        parts.push(groups[i].start === groups[i].end
            ? groups[i].book + " " + groups[i].start
            : groups[i].book + " " + groups[i].start + "-" + groups[i].end);
    }
    return parts.join("; ");
}

/* Build the list of dates (YYYY-MM-DDT00:00:00.000Z) that fall on selected weekdays. */
function generateReadingDays(startDateStr, endDateStr, selectedDays) {
    var days = [];
    var d = new Date(startDateStr + "T00:00:00");
    var end = new Date(endDateStr + "T00:00:00");
    while (d <= end) {
        if (selectedDays.indexOf(d.getDay()) !== -1) {
            days.push(d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + "T00:00:00.000Z");
        }
        d.setDate(d.getDate() + 1);
    }
    return days;
}

function generateCustomPlan(startBookIdx, startChapter, endBookIdx, endChapter, startDateStr, endDateStr, selectedDays) {
    var readings = generateReadingList(startBookIdx, startChapter, endBookIdx, endChapter);
    var readingDays = generateReadingDays(startDateStr, endDateStr, selectedDays);
    var plan = [];
    var chaptersPerDay = Math.ceil(readings.length / readingDays.length);
    var batchStart = 0;
    for (var i = 0; i < readingDays.length && batchStart < readings.length; i++) {
        var batchEnd = Math.min(batchStart + chaptersPerDay, readings.length);
        var batch = readings.slice(batchStart, batchEnd);
        plan.push({ reading: formatReadingBatch(batch), date: readingDays[i] });
        batchStart = batchEnd;
    }
    return plan;
}

function initCustomPlanModal() {
    var startSelect = document.getElementById('custom-plan-start-book');
    var endSelect = document.getElementById('custom-plan-end-book');
    if (!startSelect || startSelect.options.length > 0) return;

    for (var i = 0; i < BIBLE_BOOKS.length; i++) {
        var opt1 = document.createElement('option');
        opt1.value = i;
        opt1.text = BIBLE_BOOKS[i].name;
        startSelect.appendChild(opt1);

        var opt2 = document.createElement('option');
        opt2.value = i;
        opt2.text = BIBLE_BOOKS[i].name;
        endSelect.appendChild(opt2);
    }

    // Default end book to the last book
    endSelect.value = String(BIBLE_BOOKS.length - 1);
    updateChapterLimits();

    // Default dates to today and 30 days from now
    var today = new Date();
    var todayStr = today.getFullYear() + "-" + pad2(today.getMonth() + 1) + "-" + pad2(today.getDate());
    var end = new Date(today);
    end.setDate(end.getDate() + 30);
    var endStr = end.getFullYear() + "-" + pad2(end.getMonth() + 1) + "-" + pad2(end.getDate());
    document.getElementById('custom-plan-start-date').value = todayStr;
    document.getElementById('custom-plan-end-date').value = endStr;

    // Default all weekdays checked
    var checks = document.querySelectorAll('.weekday-check');
    for (var j = 0; j < checks.length; j++) {
        checks[j].checked = true;
    }

    updateCustomPlanStatus();
}

function updateChapterLimits() {
    var startBookIdx = parseInt(document.getElementById('custom-plan-start-book').value, 10);
    var endBookIdx = parseInt(document.getElementById('custom-plan-end-book').value, 10);
    var startChInput = document.getElementById('custom-plan-start-chapter');
    var endChInput = document.getElementById('custom-plan-end-chapter');

    if (!isNaN(startBookIdx)) {
        startChInput.max = BIBLE_BOOKS[startBookIdx].chapters;
    }
    if (!isNaN(endBookIdx)) {
        endChInput.max = BIBLE_BOOKS[endBookIdx].chapters;
    }
}

function getSelectedDays() {
    var selected = [];
    var checks = document.querySelectorAll('.weekday-check');
    for (var i = 0; i < checks.length; i++) {
        if (checks[i].checked) {
            selected.push(parseInt(checks[i].value, 10));
        }
    }
    return selected;
}

function updateCustomPlanStatus() {
    var statusEl = document.getElementById('custom-plan-status');
    if (!statusEl) return;
    var plan = getCustomPlan();
    if (plan) {
        statusEl.textContent = 'Custom plan active: ' + plan.length + ' readings, ' +
            plan[0].reading + ' to ' + plan[plan.length - 1].reading + '.';
    } else {
        statusEl.textContent = 'Using the default reading plan.';
    }
}

function applyCustomPlan() {
    var startBookIdx = parseInt(document.getElementById('custom-plan-start-book').value, 10);
    var startChapter = parseInt(document.getElementById('custom-plan-start-chapter').value, 10);
    var endBookIdx = parseInt(document.getElementById('custom-plan-end-book').value, 10);
    var endChapter = parseInt(document.getElementById('custom-plan-end-chapter').value, 10);
    var startDateStr = document.getElementById('custom-plan-start-date').value;
    var endDateStr = document.getElementById('custom-plan-end-date').value;
    var selectedDays = getSelectedDays();

    if (isNaN(startBookIdx) || isNaN(startChapter) || isNaN(endBookIdx) || isNaN(endChapter) || !startDateStr || !endDateStr) {
        alert('Please fill in all fields.');
        return;
    }
    if (endBookIdx < startBookIdx) {
        alert('End book must come after or match the start book.');
        return;
    }
    if (startBookIdx === endBookIdx && endChapter < startChapter) {
        alert('End chapter must be greater than or equal to start chapter within the same book.');
        return;
    }
    if (selectedDays.length === 0) {
        alert('Please select at least one day of the week.');
        return;
    }

    var plan = generateCustomPlan(startBookIdx, startChapter, endBookIdx, endChapter, startDateStr, endDateStr, selectedDays);
    if (plan.length === 0) {
        alert('No reading days fall within the selected date range.');
        return;
    }
    saveCustomPlan(plan);
    UIkit.modal('#custom-plan-modal').hide();
    window.location.reload();
}

function resetCustomPlan() {
    clearCustomPlan();
    UIkit.modal('#custom-plan-modal').hide();
    window.location.reload();
}
