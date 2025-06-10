<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Typing Accuracy Checker</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .input-section {
            padding: 30px;
            background: #f8f9fa;
        }
        
        .input-group {
            margin-bottom: 25px;
        }
        
        .input-group label {
            display: block;
            margin-bottom: 10px;
            font-weight: 600;
            color: #333;
            font-size: 1.1em;
        }
        
        .input-group textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 16px;
            resize: vertical;
            transition: border-color 0.3s;
        }
        
        .input-group textarea:focus {
            outline: none;
            border-color: #4facfe;
        }
        
        .check-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 40px;
            border: none;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s;
            display: block;
            margin: 0 auto;
        }
        
        .check-btn:hover {
            transform: translateY(-2px);
        }
        
        .results {
            padding: 30px;
            display: none;
        }
        
        .results.show {
            display: block;
        }
        
        .accuracy-circle {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: conic-gradient(#4facfe 0deg, #00f2fe 0deg, #e0e0e0 0deg);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            position: relative;
        }
        
        .accuracy-circle::before {
            content: '';
            width: 120px;
            height: 120px;
            background: white;
            border-radius: 50%;
            position: absolute;
        }
        
        .accuracy-text {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            z-index: 1;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            border-left: 5px solid;
        }
        
        .stat-card.correct { border-left-color: #28a745; }
        .stat-card.half { border-left-color: #ffc107; }
        .stat-card.full { border-left-color: #dc3545; }
        .stat-card.info { border-left-color: #17a2b8; }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        
        .detailed-breakdown {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            margin-top: 20px;
        }
        
        .breakdown-title {
            font-size: 1.3em;
            font-weight: 600;
            margin-bottom: 20px;
            color: #333;
        }
        
        .breakdown-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .breakdown-item:last-child {
            border-bottom: none;
        }
        
        .breakdown-label {
            font-weight: 500;
            color: #555;
        }
        
        .breakdown-value {
            font-weight: bold;
            padding: 5px 15px;
            border-radius: 20px;
            color: white;
        }
        
        .value-correct { background: #28a745; }
        .value-warning { background: #ffc107; }
        .value-danger { background: #dc3545; }
        .value-info { background: #17a2b8; }
        
        .text-comparison {
            margin-top: 30px;
        }
        
        .comparison-box {
            background: #f8f9fa;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
        }
        
        .comparison-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: #333;
        }
        
        .comparison-text {
            font-family: monospace;
            font-size: 16px;
            line-height: 1.5;
            word-break: break-all;
        }

        .debug-info {
            background: #e8f4fd;
            border: 1px solid #bee5eb;
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
            font-family: monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Typing Accuracy Checker</h1>
            <p>Advanced typing accuracy analysis with proper mistake categorization</p>
        </div>
        
        <div class="input-section">
            <div class="input-group">
                <label for="original">📝 Original Text:</label>
                <textarea id="original" rows="4" placeholder="Enter the original text here...">a long established fact</textarea>
            </div>
            
            <div class="input-group">
                <label for="typed">⌨️ Typed Text:</label>
                <textarea id="typed" rows="4" placeholder="Enter what you typed here...">long a established hello fact</textarea>
            </div>
            
            <button class="check-btn" onclick="checkTyping()">🔍 Check Accuracy</button>
        </div>
        
        <div class="results" id="results">
            <div class="accuracy-circle" id="accuracyCircle">
                <div class="accuracy-text" id="accuracyText">0%</div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card correct">
                    <div class="stat-number" id="correctWords">0</div>
                    <div class="stat-label">Correct Words</div>
                </div>
                <div class="stat-card half">
                    <div class="stat-number" id="halfMistakes">0</div>
                    <div class="stat-label">Half Mistakes</div>
                </div>
                <div class="stat-card full">
                    <div class="stat-number" id="fullMistakes">0</div>
                    <div class="stat-label">Full Mistakes</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-number" id="totalWords">0</div>
                    <div class="stat-label">Total Words</div>
                </div>
            </div>
            
            <div class="detailed-breakdown">
                <div class="breakdown-title">📊 Detailed Breakdown</div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Reversed Word Pairs (Full)</span>
                    <span class="breakdown-value value-danger" id="reversed">0</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Extra Words (Full)</span>
                    <span class="breakdown-value value-danger" id="extra">0</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Extra Spaces (Full)</span>
                    <span class="breakdown-value value-danger" id="extraSpaces">0</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Case Mistakes (Half)</span>
                    <span class="breakdown-value value-warning" id="caseMistakes">0</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Missing Words (Half)</span>
                    <span class="breakdown-value value-warning" id="missing">0</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">Character Accuracy</span>
                    <span class="breakdown-value value-info" id="charAccuracy">0%</span>
                </div>
            </div>
            
            <div class="text-comparison">
                <div class="comparison-box">
                    <div class="comparison-title">📄 Original Text:</div>
                    <div class="comparison-text" id="originalDisplay"></div>
                </div>
                <div class="comparison-box">
                    <div class="comparison-title">⌨️ Your Typed Text:</div>
                    <div class="comparison-text" id="typedDisplay"></div>
                </div>
            </div>

            <div class="debug-info" id="debugInfo"></div>
        </div>
    </div>

    <script>
        class ImprovedTypingChecker {
            constructor(original, typed) {
                this.original = original.trim();
                this.typed = typed.trim();
                this.originalWords = this.getWords(this.original);
                this.typedWords = this.getWords(this.typed);
                this.debugLog = [];
            }
            
            getWords(text) {
                return text.split(/\s+/).filter(word => word.trim() !== '');
            }
            
            log(message) {
                this.debugLog.push(message);
                console.log(message);
            }
            
            analyze() {
                if (!this.typed) {
                    return this.getEmptyResults();
                }
                
                this.log("=== Analysis Start ===");
                this.log(`Original: "${this.original}"`);
                this.log(`Typed: "${this.typed}"`);
                this.log(`Original words: [${this.originalWords.join(', ')}]`);
                this.log(`Typed words: [${this.typedWords.join(', ')}]`);
                
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
                    totalOriginalWords: this.originalWords.length
                };
                
                // Step 1: Check for extra spaces (multiple consecutive spaces)
                results.extraSpaces = this.countExtraSpaces();
                
                // Step 2: Process words sequentially
                this.processWords(results);
                
                // Step 3: Calculate character accuracy
                results.characterAccuracy = this.calculateCharacterAccuracy();
                
                // Calculate total mistakes
                results.fullMistakes = results.reversedPairs + results.extraWords + results.extraSpaces;
                results.halfMistakes = results.caseMistakes + results.missingWords;
                
                // Calculate accuracy
                const totalWords = this.originalWords.length;
                const accuracy = totalWords > 0 ? Math.round((results.correctWords / totalWords) * 100) : 0;
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
            
            processWords(results) {
                let originalIndex = 0;
                let typedIndex = 0;
                
                while (originalIndex < this.originalWords.length && typedIndex < this.typedWords.length) {
                    const originalWord = this.originalWords[originalIndex];
                    const typedWord = this.typedWords[typedIndex];
                    
                    this.log(`\nComparing: "${originalWord}" vs "${typedWord}"`);
                    
                    // Check if words match exactly
                    if (originalWord === typedWord) {
                        this.log("✓ Exact match");
                        results.correctWords++;
                        originalIndex++;
                        typedIndex++;
                        continue;
                    }
                    
                    // Check if words match but with case difference
                    if (originalWord.toLowerCase() === typedWord.toLowerCase()) {
                        this.log("✓ Match with case difference");
                        results.correctWords++;
                        results.caseMistakes++;
                        originalIndex++;
                        typedIndex++;
                        continue;
                    }
                    
                    // Check for reversed word pair
                    if (originalIndex + 1 < this.originalWords.length && 
                        typedIndex + 1 < this.typedWords.length) {
                        
                        const nextOriginal = this.originalWords[originalIndex + 1];
                        const nextTyped = this.typedWords[typedIndex + 1];
                        
                        // Check if current and next words are reversed
                        if (this.wordsMatch(originalWord, nextTyped) && 
                            this.wordsMatch(nextOriginal, typedWord)) {
                            
                            this.log(`✓ Reversed pair found: "${originalWord} ${nextOriginal}" vs "${typedWord} ${nextTyped}"`);
                            results.fullMistakes++; // Only 1 full mistake for the pair
                            results.reversedPairs++;
                            
                            // Handle case differences in reversed words
                            if (originalWord !== nextTyped || nextOriginal !== typedWord) {
                                if (originalWord.toLowerCase() === nextTyped.toLowerCase() && 
                                    originalWord !== nextTyped) {
                                    results.caseMistakes++;
                                }
                                if (nextOriginal.toLowerCase() === typedWord.toLowerCase() && 
                                    nextOriginal !== typedWord) {
                                    results.caseMistakes++;
                                }
                            }
                            
                            results.correctWords += 2; // Both words are considered correct (just reversed)
                            originalIndex += 2;
                            typedIndex += 2;
                            continue;
                        }
                    }
                    
                    // Check if typed word is an extra word
                    if (!this.wordExistsInOriginal(typedWord, originalIndex)) {
                        this.log(`✗ Extra word: "${typedWord}"`);
                        results.extraWords++;
                        results.fullMistakes++;
                        typedIndex++;
                        continue;
                    }
                    
                    // If we reach here, there's a mismatch or missing word
                    this.log(`✗ Word mismatch or missing: "${originalWord}"`);
                    results.missingWords++;
                    originalIndex++;
                }
                
                // Handle remaining words
                while (originalIndex < this.originalWords.length) {
                    this.log(`✗ Missing word: "${this.originalWords[originalIndex]}"`);
                    results.missingWords++;
                    originalIndex++;
                }
                
                while (typedIndex < this.typedWords.length) {
                    this.log(`✗ Extra word: "${this.typedWords[typedIndex]}"`);
                    results.extraWords++;
                    results.fullMistakes++;
                    typedIndex++;
                }
            }
            
            wordsMatch(word1, word2) {
                return word1.toLowerCase() === word2.toLowerCase();
            }
            
            wordExistsInOriginal(word, fromIndex) {
                for (let i = fromIndex; i < this.originalWords.length; i++) {
                    if (this.wordsMatch(word, this.originalWords[i])) {
                        return true;
                    }
                }
                return false;
            }
            
            calculateCharacterAccuracy() {
                if (!this.original) return 0;
                
                const origChars = this.original.toLowerCase().split('');
                const typedChars = this.typed.toLowerCase().split('');
                
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
                    accuracy: 0
                };
            }
            
            getDebugLog() {
                return this.debugLog.join('\n');
            }
        }
        
        function checkTyping() {
            const original = document.getElementById('original').value;
            const typed = document.getElementById('typed').value;
            
            if (!original.trim()) {
                alert('Please enter the original text!');
                return;
            }
            
            const checker = new ImprovedTypingChecker(original, typed);
            const results = checker.analyze();
            
            // Update accuracy circle
            updateAccuracyCircle(results.accuracy);
            
            // Update stats
            document.getElementById('correctWords').textContent = results.correctWords;
            document.getElementById('halfMistakes').textContent = results.halfMistakes;
            document.getElementById('fullMistakes').textContent = results.fullMistakes;
            document.getElementById('totalWords').textContent = results.totalOriginalWords;
            
            // Update detailed breakdown
            document.getElementById('reversed').textContent = results.reversedPairs;
            document.getElementById('extra').textContent = results.extraWords;
            document.getElementById('extraSpaces').textContent = results.extraSpaces;
            document.getElementById('caseMistakes').textContent = results.caseMistakes;
            document.getElementById('missing').textContent = results.missingWords;
            document.getElementById('charAccuracy').textContent = results.characterAccuracy + '%';
            
            // Update text comparison
            document.getElementById('originalDisplay').textContent = original;
            document.getElementById('typedDisplay').textContent = typed || '(No text entered)';
            
            // Update debug info
            document.getElementById('debugInfo').textContent = checker.getDebugLog();
            
            // Show results
            document.getElementById('results').classList.add('show');
            document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
        }
        
        function updateAccuracyCircle(accuracy) {
            const circle = document.getElementById('accuracyCircle');
            const text = document.getElementById('accuracyText');
            
            text.textContent = accuracy + '%';
            
            const degree = (accuracy / 100) * 360;
            const color1 = accuracy >= 80 ? '#28a745' : accuracy >= 60 ? '#ffc107' : '#dc3545';
            const color2 = accuracy >= 80 ? '#20c997' : accuracy >= 60 ? '#fd7e14' : '#e74c3c';
            
            circle.style.background = `conic-gradient(${color1} 0deg, ${color2} ${degree}deg, #e0e0e0 ${degree}deg)`;
        }
        
        // Auto-check on page load with sample data
        window.addEventListener('load', function() {
            checkTyping();
        });
    </script>
</body>
</html>