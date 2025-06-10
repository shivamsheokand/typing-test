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
    // Split by whitespace but preserve punctuation with words
    return text.split(/\s+/).filter((word) => word.trim() !== "");
  }

  normalizeWord(word) {
    // Remove leading/trailing punctuation for comparison but keep internal punctuation
    return word.replace(/^[^\w]+|[^\w]+$/g, "").toLowerCase();
  }

  wordsMatch(word1, word2) {
    // Compare normalized versions
    const norm1 = this.normalizeWord(word1);
    const norm2 = this.normalizeWord(word2);
    return norm1 === norm2;
  }

  // New method to check if a word is a single character repetition
  isSingleCharacterRepetition(word) {
    const normalized = this.normalizeWord(word);
    return normalized.length === 1;
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

    // Step 2: Improved word matching with single character repetition handling
    this.performSmartMatching(results);

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

  performSmartMatching(results) {
    // Create frequency maps for better matching
    const originalWordFreq = new Map();
    const typedWordFreq = new Map();

    // Count word frequencies in normalized form
    this.originalWords.forEach((word, index) => {
      const normalized = this.normalizeWord(word);
      if (!originalWordFreq.has(normalized)) {
        originalWordFreq.set(normalized, []);
      }
      originalWordFreq.get(normalized).push(index);
    });

    this.typedWords.forEach((word, index) => {
      const normalized = this.normalizeWord(word);
      if (!typedWordFreq.has(normalized)) {
        typedWordFreq.set(normalized, []);
      }
      typedWordFreq.get(normalized).push(index);
    });

    // Track matched words
    const originalMatched = new Array(this.originalWords.length).fill(false);
    const typedMatched = new Array(this.typedWords.length).fill(false);

    // Phase 1: Sequential matching with single character repetition detection
    let originalIndex = 0;
    let typedIndex = 0;

    while (
      originalIndex < this.originalWords.length &&
      typedIndex < this.typedWords.length
    ) {
      const originalWord = this.originalWords[originalIndex];
      const typedWord = this.typedWords[typedIndex];

      this.log(
        `\nComparing O[${originalIndex}]:"${originalWord}" with T[${typedIndex}]:"${typedWord}"`
      );

      // Check for exact sequential match
      if (this.wordsMatch(originalWord, typedWord)) {
        this.log(`✓ Sequential match found`);
        this.handleWordMatch(originalIndex, typedIndex, results);
        originalMatched[originalIndex] = true;
        typedMatched[typedIndex] = true;
        originalIndex++;
        typedIndex++;
        continue;
      }

      // Check for single character repetition (special case)
      if (this.isSingleCharacterRepetition(typedWord)) {
        this.log(`! Single character detected: "${typedWord}"`);

        // Look ahead to see if this character matches any upcoming original word
        let foundLaterMatch = false;
        for (
          let lookAhead = originalIndex;
          lookAhead < Math.min(originalIndex + 5, this.originalWords.length);
          lookAhead++
        ) {
          if (this.wordsMatch(this.originalWords[lookAhead], typedWord)) {
            this.log(
              `! Single character "${typedWord}" matches original word at position ${lookAhead}`
            );
            foundLaterMatch = true;
            break;
          }
        }

        // If single character doesn't match any nearby original word, mark as extra
        if (!foundLaterMatch) {
          this.log(`✗ Single character "${typedWord}" marked as extra`);
          this.typedAnalysis[typedIndex].status = "extra";
          results.extraWords++;
          typedMatched[typedIndex] = true;
          typedIndex++;
          continue;
        }
      }

      // Check for word reversal (swap) with next word
      if (
        originalIndex + 1 < this.originalWords.length &&
        typedIndex + 1 < this.typedWords.length &&
        !originalMatched[originalIndex] &&
        !originalMatched[originalIndex + 1] &&
        !typedMatched[typedIndex] &&
        !typedMatched[typedIndex + 1]
      ) {
        const nextOriginalWord = this.originalWords[originalIndex + 1];
        const nextTypedWord = this.typedWords[typedIndex + 1];

        if (
          this.wordsMatch(originalWord, nextTypedWord) &&
          this.wordsMatch(nextOriginalWord, typedWord)
        ) {
          this.log(
            `✓ Reversed pair found: "${originalWord} ${nextOriginalWord}" ↔ "${typedWord} ${nextTypedWord}"`
          );

          this.handleReversal(
            originalIndex,
            originalIndex + 1,
            typedIndex,
            typedIndex + 1,
            results
          );

          originalMatched[originalIndex] = true;
          originalMatched[originalIndex + 1] = true;
          typedMatched[typedIndex] = true;
          typedMatched[typedIndex + 1] = true;

          originalIndex += 2;
          typedIndex += 2;
          continue;
        }
      }

      // Look for this typed word in nearby original positions (limited window)
      let foundMatch = false;
      const searchWindow = Math.min(
        originalIndex + 10,
        this.originalWords.length
      );

      for (
        let searchIndex = originalIndex;
        searchIndex < searchWindow;
        searchIndex++
      ) {
        if (
          !originalMatched[searchIndex] &&
          this.wordsMatch(typedWord, this.originalWords[searchIndex])
        ) {
          this.log(
            `✓ Out-of-order match: "${typedWord}" found at original position ${searchIndex}`
          );

          // Mark skipped words as missing (but be more conservative)
          for (
            let missedIndex = originalIndex;
            missedIndex < searchIndex;
            missedIndex++
          ) {
            if (!originalMatched[missedIndex]) {
              this.log(`✗ Missing word: "${this.originalWords[missedIndex]}"`);
              this.originalAnalysis[missedIndex].status = "missing";
              results.missingWords++;
              originalMatched[missedIndex] = true;
            }
          }

          this.handleWordMatch(searchIndex, typedIndex, results);
          originalMatched[searchIndex] = true;
          typedMatched[typedIndex] = true;
          originalIndex = searchIndex + 1;
          foundMatch = true;
          break;
        }
      }

      if (foundMatch) {
        typedIndex++;
        continue;
      }

      // If no match found, mark as extra and continue
      this.log(`✗ Extra word: "${typedWord}"`);
      this.typedAnalysis[typedIndex].status = "extra";
      results.extraWords++;
      typedMatched[typedIndex] = true;
      typedIndex++;
    }

    // Phase 2: Handle remaining unmatched words with frequency-based matching
    this.handleRemainingWords(originalMatched, typedMatched, results);

    // Phase 3: Mark final unmatched words
    for (let i = 0; i < this.originalWords.length; i++) {
      if (!originalMatched[i]) {
        this.log(`✗ Missing word at end: "${this.originalWords[i]}"`);
        this.originalAnalysis[i].status = "missing";
        results.missingWords++;
      }
    }

    for (let i = 0; i < this.typedWords.length; i++) {
      if (!typedMatched[i]) {
        this.log(`✗ Extra word at end: "${this.typedWords[i]}"`);
        this.typedAnalysis[i].status = "extra";
        results.extraWords++;
      }
    }
  }

  handleRemainingWords(originalMatched, typedMatched, results) {
    // Try to match remaining words based on content similarity
    for (let tIndex = 0; tIndex < this.typedWords.length; tIndex++) {
      if (typedMatched[tIndex]) continue;

      const typedWord = this.typedWords[tIndex];
      let bestMatch = -1;

      // Find best matching unmatched original word
      for (let oIndex = 0; oIndex < this.originalWords.length; oIndex++) {
        if (originalMatched[oIndex]) continue;

        if (this.wordsMatch(typedWord, this.originalWords[oIndex])) {
          bestMatch = oIndex;
          break;
        }
      }

      if (bestMatch !== -1) {
        this.log(
          `✓ Late match: "${typedWord}" with "${this.originalWords[bestMatch]}"`
        );
        this.handleWordMatch(bestMatch, tIndex, results);
        originalMatched[bestMatch] = true;
        typedMatched[tIndex] = true;
      }
    }
  }

  handleWordMatch(originalIndex, typedIndex, results) {
    const originalWord = this.originalWords[originalIndex];
    const typedWord = this.typedWords[typedIndex];

    if (originalWord === typedWord) {
      // Exact match
      this.log(`✓ Exact match: "${originalWord}"`);
      this.markAsCorrect(originalIndex, typedIndex, results);
    } else if (this.wordsMatch(originalWord, typedWord)) {
      // Case or punctuation difference
      this.log(`✓ Match with differences: "${originalWord}" vs "${typedWord}"`);
      this.markAsCaseError(originalIndex, typedIndex, results);
    }
  }

  handleReversal(orig1Index, orig2Index, typed1Index, typed2Index, results) {
    const orig1 = this.originalWords[orig1Index];
    const orig2 = this.originalWords[orig2Index];
    const typed1 = this.typedWords[typed1Index];
    const typed2 = this.typedWords[typed2Index];

    // Mark both as reversed
    this.originalAnalysis[orig1Index].status = "reversed";
    this.originalAnalysis[orig2Index].status = "reversed";
    this.typedAnalysis[typed1Index].status = "reversed";
    this.typedAnalysis[typed2Index].status = "reversed";

    // Link them
    this.originalAnalysis[orig1Index].matchedWith = typed2Index;
    this.originalAnalysis[orig2Index].matchedWith = typed1Index;
    this.typedAnalysis[typed1Index].matchedWith = orig2Index;
    this.typedAnalysis[typed2Index].matchedWith = orig1Index;

    results.reversedPairs++;
    results.correctWords += 2; // Words are correct, just in wrong order

    // Check for case differences in reversed words
    if (orig1 !== typed2 && this.wordsMatch(orig1, typed2)) {
      results.caseMistakes++;
      this.originalAnalysis[orig1Index].status = "reversed-case";
    }
    if (orig2 !== typed1 && this.wordsMatch(orig2, typed1)) {
      results.caseMistakes++;
      this.originalAnalysis[orig2Index].status = "reversed-case";
    }
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

// Display Functions (unchanged)
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
      let cssClass = status;

      // Add specific styling for different types
      if (status === "reversed-case") {
        cssClass = "reversed case-error";
      }

      html += `<span class="word ${cssClass}" data-index="${index}" title="Status: ${status}">${word}</span>`;
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
      } else {
        element.textContent = results[key] || 0;
      }
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

// Event Listeners and Initialization (unchanged)
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
