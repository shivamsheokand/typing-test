class AdvancedTypingChecker {
  constructor(original, typed) {
    this.original = original.trim();
    this.typed = typed.trim();
    this.originalWords = this.getWords(this.original);
    this.typedWords = this.getWords(this.typed);
    this.debugLog = [];
    this.wordAnalysis = [];
  }

  getWords(text) {
    return text.split(/\s+/).filter((word) => word.trim() !== "");
  }

  log(message) {
    this.debugLog.push(message);
    console.log(message);
  }

  analyze() {
    if (!this.typed) {
      return this.getEmptyResults();
    }

    this.log("=== Advanced Analysis Start ===");
    this.log(`Original: "${this.original}"`);
    this.log(`Typed: "${this.typed}"`);
    this.log(`Original words: [${this.originalWords.join(", ")}]`);
    this.log(`Typed words: [${this.typedWords.join(", ")}]`);

    let results = {
      correctWords: 0,
      halfMistakes: 0,
      fullMistakes: 0,
      reversedPairs: 0,
      extraWords: 0,
      extraSpaces: 0,
      caseMistakes: 0,
      missingWords: 0,
      characterAccuracy: 0,
      totalOriginalWords: this.originalWords.length,
    };

    // Initialize word analysis arrays
    this.originalAnalysis = new Array(this.originalWords.length)
      .fill(null)
      .map((_, i) => ({
        word: this.originalWords[i],
        status: "missing",
        index: i,
        matchedWith: -1,
      }));

    this.typedAnalysis = new Array(this.typedWords.length)
      .fill(null)
      .map((_, i) => ({
        word: this.typedWords[i],
        status: "extra",
        index: i,
        matchedWith: -1,
      }));

    // Step 1: Check for extra spaces
    results.extraSpaces = this.countExtraSpaces();

    // Step 2: Advanced word matching
    this.performAdvancedMatching(results);

    // Step 3: Calculate character accuracy
    results.characterAccuracy = this.calculateCharacterAccuracy();

    // Calculate totals
    results.fullMistakes =
      results.reversedPairs + results.extraWords + results.extraSpaces;
    results.halfMistakes = results.caseMistakes + results.missingWords;

    // Calculate accuracy
    const totalWords = this.originalWords.length;
    const accuracy =
      totalWords > 0
        ? Math.round((results.correctWords / totalWords) * 100)
        : 0;
    results.accuracy = accuracy;

    this.log("=== Final Results ===");
    this.log(JSON.stringify(results, null, 2));

    return results;
  }

  countExtraSpaces() {
    const extraSpaces = (this.typed.match(/\s{2,}/g) || []).length;
    this.log(`Extra spaces found: ${extraSpaces}`);
    return extraSpaces;
  }

  performAdvancedMatching(results) {
    let originalIndex = 0;
    let typedIndex = 0;

    while (
      originalIndex < this.originalWords.length &&
      typedIndex < this.typedWords.length
    ) {
      const originalWord = this.originalWords[originalIndex];
      const typedWord = this.typedWords[typedIndex];

      this.log(`\nComparing: "${originalWord}" vs "${typedWord}"`);

      // Exact match
      if (originalWord === typedWord) {
        this.log("✓ Exact match");
        this.markAsCorrect(originalIndex, typedIndex, results);
        originalIndex++;
        typedIndex++;
        continue;
      }

      // Case difference match
      if (originalWord.toLowerCase() === typedWord.toLowerCase()) {
        this.log("✓ Case difference match");
        this.markAsCaseError(originalIndex, typedIndex, results);
        originalIndex++;
        typedIndex++;
        continue;
      }

      // Check for word reversal (swap)
      if (this.checkForReversal(originalIndex, typedIndex, results)) {
        originalIndex += 2;
        typedIndex += 2;
        continue;
      }

      // Check if typed word appears later in original (skip/missing word scenario)
      const futureMatch = this.findWordInOriginal(typedWord, originalIndex + 1);
      if (futureMatch !== -1) {
        // Mark current original word as missing
        this.log(`✗ Missing word: "${originalWord}"`);
        this.originalAnalysis[originalIndex].status = "missing";
        results.missingWords++;
        originalIndex++;
        continue;
      }

      // Check if original word appears later in typed (extra word scenario)
      const futureTypedMatch = this.findWordInTyped(
        originalWord,
        typedIndex + 1
      );
      if (futureTypedMatch !== -1) {
        // Mark current typed word as extra
        this.log(`✗ Extra word: "${typedWord}"`);
        this.typedAnalysis[typedIndex].status = "extra";
        results.extraWords++;
        typedIndex++;
        continue;
      }

      // If no future matches, treat as substitution (extra typed, missing original)
      this.log(`✗ Word substitution: "${originalWord}" → "${typedWord}"`);
      this.originalAnalysis[originalIndex].status = "missing";
      this.typedAnalysis[typedIndex].status = "extra";
      results.missingWords++;
      results.extraWords++;
      originalIndex++;
      typedIndex++;
    }

    // Handle remaining words
    while (originalIndex < this.originalWords.length) {
      this.log(`✗ Missing word at end: "${this.originalWords[originalIndex]}"`);
      this.originalAnalysis[originalIndex].status = "missing";
      results.missingWords++;
      originalIndex++;
    }

    while (typedIndex < this.typedWords.length) {
      this.log(`✗ Extra word at end: "${this.typedWords[typedIndex]}"`);
      this.typedAnalysis[typedIndex].status = "extra";
      results.extraWords++;
      typedIndex++;
    }
  }

  checkForReversal(originalIndex, typedIndex, results) {
    if (
      originalIndex + 1 >= this.originalWords.length ||
      typedIndex + 1 >= this.typedWords.length
    ) {
      return false;
    }

    const orig1 = this.originalWords[originalIndex];
    const orig2 = this.originalWords[originalIndex + 1];
    const typed1 = this.typedWords[typedIndex];
    const typed2 = this.typedWords[typedIndex + 1];

    // Check if words are swapped
    if (this.wordsMatch(orig1, typed2) && this.wordsMatch(orig2, typed1)) {
      this.log(`✓ Reversed pair: "${orig1} ${orig2}" ↔ "${typed1} ${typed2}"`);

      // Mark both as reversed
      this.originalAnalysis[originalIndex].status = "reversed";
      this.originalAnalysis[originalIndex + 1].status = "reversed";
      this.typedAnalysis[typedIndex].status = "reversed";
      this.typedAnalysis[typedIndex + 1].status = "reversed";

      // Link them
      this.originalAnalysis[originalIndex].matchedWith = typedIndex + 1;
      this.originalAnalysis[originalIndex + 1].matchedWith = typedIndex;
      this.typedAnalysis[typedIndex].matchedWith = originalIndex + 1;
      this.typedAnalysis[typedIndex + 1].matchedWith = originalIndex;

      results.reversedPairs++;
      results.correctWords += 2; // Words are correct, just in wrong order

      // Check for case differences in reversed words
      if (orig1 !== typed2 && orig1.toLowerCase() === typed2.toLowerCase()) {
        results.caseMistakes++;
      }
      if (orig2 !== typed1 && orig2.toLowerCase() === typed1.toLowerCase()) {
        results.caseMistakes++;
      }

      return true;
    }

    return false;
  }

  markAsCorrect(originalIndex, typedIndex, results) {
    this.originalAnalysis[originalIndex].status = "correct";
    this.typedAnalysis[typedIndex].status = "correct";
    this.originalAnalysis[originalIndex].matchedWith = typedIndex;
    this.typedAnalysis[typedIndex].matchedWith = originalIndex;
    results.correctWords++;
  }

  markAsCaseError(originalIndex, typedIndex, results) {
    this.originalAnalysis[originalIndex].status = "case-error";
    this.typedAnalysis[typedIndex].status = "case-error";
    this.originalAnalysis[originalIndex].matchedWith = typedIndex;
    this.typedAnalysis[typedIndex].matchedWith = originalIndex;
    results.correctWords++;
    results.caseMistakes++;
  }

  findWordInOriginal(word, startIndex) {
    for (let i = startIndex; i < this.originalWords.length; i++) {
      if (this.wordsMatch(word, this.originalWords[i])) {
        return i;
      }
    }
    return -1;
  }

  findWordInTyped(word, startIndex) {
    for (let i = startIndex; i < this.typedWords.length; i++) {
      if (this.wordsMatch(word, this.typedWords[i])) {
        return i;
      }
    }
    return -1;
  }

  wordsMatch(word1, word2) {
    return word1.toLowerCase() === word2.toLowerCase();
  }

  calculateCharacterAccuracy() {
    if (!this.original) return 0;

    const origChars = this.original.toLowerCase().split("");
    const typedChars = this.typed.toLowerCase().split("");

    let correct = 0;
    const minLength = Math.min(origChars.length, typedChars.length);

    for (let i = 0; i < minLength; i++) {
      if (origChars[i] === typedChars[i]) {
        correct++;
      }
    }

    return Math.round((correct / origChars.length) * 100);
  }

  getEmptyResults() {
    // Initialize analysis for empty input
    this.originalAnalysis = this.originalWords.map((word, i) => ({
      word: word,
      status: "missing",
      index: i,
      matchedWith: -1,
    }));
    this.typedAnalysis = [];

    return {
      correctWords: 0,
      halfMistakes: this.originalWords.length,
      fullMistakes: 0,
      reversedPairs: 0,
      extraWords: 0,
      extraSpaces: 0,
      caseMistakes: 0,
      missingWords: this.originalWords.length,
      characterAccuracy: 0,
      totalOriginalWords: this.originalWords.length,
      accuracy: 0,
    };
  }

  getOriginalAnalysis() {
    return this.originalAnalysis || [];
  }

  getTypedAnalysis() {
    return this.typedAnalysis || [];
  }

  getDebugLog() {
    return this.debugLog.join("\n");
  }
}

// Display Functions
function highlightWords(words, analysis, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = "";

  if (analysis.length === 0) {
    html = '<span class="word missing">(No text entered)</span>';
  } else {
    analysis.forEach((item, index) => {
      const word = escapeHtml(item.word);
      const status = item.status;
      html += `<span class="word ${status}" data-index="${index}" title="Status: ${status}">${word}</span>`;
    });
  }

  container.innerHTML = html;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function updateAccuracyCircle(accuracy) {
  const circle = document.getElementById("accuracyCircle");
  const text = document.getElementById("accuracyText");

  if (!circle || !text) return;

  text.textContent = accuracy + "%";

  const degree = (accuracy / 100) * 360;
  let color1, color2;

  if (accuracy >= 90) {
    color1 = "#10b981";
    color2 = "#059669";
  } else if (accuracy >= 80) {
    color1 = "#3b82f6";
    color2 = "#2563eb";
  } else if (accuracy >= 70) {
    color1 = "#f59e0b";
    color2 = "#d97706";
  } else if (accuracy >= 60) {
    color1 = "#f97316";
    color2 = "#ea580c";
  } else {
    color1 = "#ef4444";
    color2 = "#dc2626";
  }

  circle.style.background = `conic-gradient(${color1} 0deg, ${color2} ${degree}deg, #f3f4f6 ${degree}deg)`;
}

function updateStats(results) {
  const elements = {
    correctWords: "correctWords",
    halfMistakes: "halfMistakes",
    fullMistakes: "fullMistakes",
    totalWords: "totalWords",
    quickCorrect: "quickCorrect",
    quickHalf: "quickHalf",
    quickFull: "quickFull",
    reversed: "reversed",
    extra: "extraWords",
    extraSpaces: "extraSpaces",
    caseMistakes: "caseMistakes",
    missing: "missingWords",
    charAccuracy: "characterAccuracy",
  };

  Object.entries(elements).forEach(([key, id]) => {
    const element = document.getElementById(id);
    if (element) {
      if (key === "charAccuracy") {
        element.textContent = results[key] + "%";
      } else if (key.startsWith("quick")) {
        const statKey = key.replace("quick", "").toLowerCase();
        const mapping = {
          correct: "correctWords",
          half: "halfMistakes",
          full: "fullMistakes",
        };
        element.textContent = results[mapping[statKey]] || 0;
      } else {
        element.textContent = results[key] || 0;
      }
    }
  });

  // Update breakdown values
  const breakdownElements = {
    reversed: results.reversedPairs,
    extra: results.extraWords,
    extraSpaces: results.extraSpaces,
    caseMistakes: results.caseMistakes,
    missing: results.missingWords,
    charAccuracy: results.characterAccuracy + "%",
  };

  Object.entries(breakdownElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

function showResults() {
  const results = document.getElementById("results");
  if (results) {
    results.classList.add("show");
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function checkTyping() {
  const originalElement = document.getElementById("original");
  const typedElement = document.getElementById("typed");

  if (!originalElement || !typedElement) {
    console.error("Required input elements not found");
    return;
  }

  const original = originalElement.value;
  const typed = typedElement.value;

  if (!original.trim()) {
    alert("Please enter the original text!");
    originalElement.focus();
    return;
  }

  try {
    // Create checker instance
    const checker = new AdvancedTypingChecker(original, typed);

    // Perform analysis
    const results = checker.analyze();

    // Update UI
    updateAccuracyCircle(results.accuracy);
    updateStats(results);

    // Highlight words with their statuses
    highlightWords(
      checker.originalWords,
      checker.getOriginalAnalysis(),
      "originalDisplay"
    );
    highlightWords(
      checker.typedWords,
      checker.getTypedAnalysis(),
      "typedDisplay"
    );

    // Update debug info
    const debugElement = document.getElementById("debugInfo");
    if (debugElement) {
      debugElement.textContent = checker.getDebugLog();
    }

    // Show results section
    showResults();
  } catch (error) {
    console.error("Error during analysis:", error);
    alert(
      "An error occurred during analysis. Please check the console for details."
    );
  }
}

// Event Listeners and Initialization
document.addEventListener("DOMContentLoaded", function () {
  // Auto-check if sample data is present
  const originalInput = document.getElementById("original");
  const typedInput = document.getElementById("typed");

  if (
    originalInput &&
    typedInput &&
    originalInput.value.trim() &&
    typedInput.value.trim()
  ) {
    checkTyping();
  }

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      checkTyping();
    }

    // Escape to clear inputs
    if (e.key === "Escape") {
      if (originalInput) originalInput.value = "";
      if (typedInput) typedInput.value = "";
      const results = document.getElementById("results");
      if (results) results.classList.remove("show");
    }
  });

  // Add real-time character count
  function updateCharCount(textarea, counterId) {
    const counter = document.getElementById(counterId);
    if (counter) {
      counter.textContent = `${textarea.value.length} characters`;
    }
  }

  // Add input event listeners for real-time feedback
  if (originalInput) {
    originalInput.addEventListener("input", function () {
      updateCharCount(this, "originalCount");
    });
  }

  if (typedInput) {
    typedInput.addEventListener("input", function () {
      updateCharCount(this, "typedCount");
    });
  }

  [originalInput, typedInput].forEach((input) => {
    if (input) {
      input.addEventListener("paste", function (e) {
        setTimeout(() => {
          this.value = this.value.trim();
        }, 0);
      });
    }
  });
});

// Utility functions for external use
window.TypingChecker = {
  check: checkTyping,
  AdvancedTypingChecker: AdvancedTypingChecker,
};


let analysisStartTime;
function startAnalysis() {
  analysisStartTime = performance.now();
}

function endAnalysis() {
  if (analysisStartTime) {
    const duration = performance.now() - analysisStartTime;
    console.log(`Analysis completed in ${duration.toFixed(2)}ms`);
  }
}
