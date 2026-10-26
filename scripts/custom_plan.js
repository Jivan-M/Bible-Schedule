/*
 * Custom Reading Plan
 * Lets users generate a personal daily reading schedule from a book,
 * chapter range, and start date. Stored in localStorage so it persists
 * across sessions. Falls back to the default plan when none is set.
 */

var BIBLE_BOOKS = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
    "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
    "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
    "Ecclesiastes", "Song of Songs", "Isaiah", "Jeremiah", "Lamentations",
    "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
    "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew",
    "Mark", "Luke", "John", "Acts", "Romans",
    "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians",
    "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy",
    "Titus", "Philemon", "Hebrews", "James", "1 Peter",
    "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

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

function generateCustomPlan(book, startChapter, endChapter, startDateStr) {
    var plan = [];
    var startDate = new Date(startDateStr + "T00:00:00");
    for (var ch = startChapter; ch <= endChapter; ch++) {
        var d = new Date(startDate);
        d.setDate(d.getDate() + (ch - startChapter));
        var dateStr = d.getFullYear() + "-" +
            pad2(d.getMonth() + 1) + "-" +
            pad2(d.getDate()) + "T00:00:00.000Z";
        plan.push({ reading: book + " " + ch, date: dateStr });
    }
    return plan;
}

function initCustomPlanModal() {
    var select = document.getElementById('custom-plan-book');
    if (!select || select.options.length > 0) return;

    for (var i = 0; i < BIBLE_BOOKS.length; i++) {
        var option = document.createElement('option');
        option.value = BIBLE_BOOKS[i];
        option.text = BIBLE_BOOKS[i];
        select.appendChild(option);
    }

    var today = new Date();
    document.getElementById('custom-plan-start-date').value =
        today.getFullYear() + "-" + pad2(today.getMonth() + 1) + "-" + pad2(today.getDate());

    updateCustomPlanStatus();
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
    var book = document.getElementById('custom-plan-book').value;
    var startChapter = parseInt(document.getElementById('custom-plan-start-chapter').value, 10);
    var endChapter = parseInt(document.getElementById('custom-plan-end-chapter').value, 10);
    var startDateStr = document.getElementById('custom-plan-start-date').value;

    if (!book || isNaN(startChapter) || isNaN(endChapter) || !startDateStr) {
        alert('Please fill in all fields.');
        return;
    }
    if (endChapter < startChapter) {
        alert('End chapter must be greater than or equal to start chapter.');
        return;
    }

    saveCustomPlan(generateCustomPlan(book, startChapter, endChapter, startDateStr));
    UIkit.modal('#custom-plan-modal').hide();
    window.location.reload();
}

function resetCustomPlan() {
    clearCustomPlan();
    UIkit.modal('#custom-plan-modal').hide();
    window.location.reload();
}
