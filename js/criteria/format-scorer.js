/**
 * FORMAT SCORER
 * CV Assessment Pro - Scoring Engine
 * 
 * Evaluates CV formatting, structure, length, and visual organization.
 * Maximum Score: 15 points
 */

(function () {
    'use strict';

    window.FormatScorer = class FormatScorer {
        constructor() {
            this.maxScore = 15;
            this.name = 'Format & Structure';
            this.icon = '📄';
        }

        /**
         * @param {Object} cvData - Parsed CV data
         * @param {Object} options - Assessment options (region, strict, etc.)
         * @returns {{ score: number, maxScore: number, details: Array }}
         */
        score(cvData, options) {
            const details = [];
            const rawText = (cvData.rawText || '').trim();
            const sections = cvData.sections || {};
            const region = (options && options.region) || 'US';

            // 1. Document Length Assessment (3 pts)
            details.push(this._assessDocumentLength(rawText, region));

            // 2. Line Count & Density (2 pts)
            details.push(this._assessLineCount(rawText, region));

            // 3. Section Ordering (3 pts)
            details.push(this._assessSectionOrdering(sections, cvData));

            // 4. Consistent Formatting Patterns (3 pts)
            details.push(this._assessConsistentFormatting(rawText, sections));

            // 5. Proper Spacing & Structure (2 pts)
            details.push(this._assessSpacing(rawText));

            // 6. Bullet Point Usage (2 pts)
            details.push(this._assessBulletPoints(rawText, sections));

            const totalScore = details.reduce(function (sum, d) { return sum + d.points; }, 0);

            return {
                score: Math.max(0, totalScore),
                maxScore: this.maxScore,
                details: details
            };
        }

        _assessDocumentLength(rawText, region) {
            const wordCount = rawText.split(/\s+/).filter(function (w) { return w.length > 0; }).length;
            const maxPoints = 3;
            let points = maxPoints;
            let explanation = '';

            // EU and ASIA allow longer CVs
            const isLongFormRegion = (region === 'EU' || region === 'ASIA');
            const maxIdeal = isLongFormRegion ? 1200 : 800;
            const maxAcceptable = isLongFormRegion ? 1800 : 1200;

            if (wordCount < 100) {
                points = 0;
                explanation = 'CV is critically short at ' + wordCount + ' words. Minimum 200 words expected for any credible CV.';
            } else if (wordCount < 200) {
                points = 0;
                explanation = 'CV is too short (' + wordCount + ' words). This suggests missing sections or insufficient detail.';
            } else if (wordCount < 300) {
                points = 1;
                explanation = 'CV is short at ' + wordCount + ' words. Consider adding more detail to experience and skills.';
            } else if (wordCount >= 300 && wordCount <= maxIdeal) {
                points = maxPoints;
                explanation = 'Good length at ' + wordCount + ' words. Well within the optimal range.';
            } else if (wordCount <= maxAcceptable) {
                points = 2;
                explanation = 'CV is slightly long at ' + wordCount + ' words. Consider trimming less relevant content.';
            } else {
                points = 0;
                explanation = 'CV is excessively long at ' + wordCount + ' words. Recruiters spend 6-7 seconds on initial scan. Drastically reduce length.';
            }

            return {
                criterion: 'Document Length',
                passed: points >= 2,
                points: points,
                maxPoints: maxPoints,
                explanation: explanation
            };
        }

        _assessLineCount(rawText, region) {
            const lines = rawText.split(/\n/);
            const lineCount = lines.length;
            const nonEmptyLines = lines.filter(function (l) { return l.trim().length > 0; }).length;
            const emptyLineRatio = (lineCount - nonEmptyLines) / Math.max(lineCount, 1);
            const maxPoints = 2;
            let points = maxPoints;
            let explanation = '';

            if (lineCount < 15) {
                points = 0;
                explanation = 'Only ' + lineCount + ' lines detected. CV appears severely truncated or poorly structured.';
            } else if (lineCount < 30) {
                points = 1;
                explanation = lineCount + ' lines detected. Content may be too condensed—ensure all sections have adequate detail.';
            } else if (emptyLineRatio > 0.5) {
                points = 0;
                explanation = 'Excessive blank lines (' + Math.round(emptyLineRatio * 100) + '% empty). This wastes valuable space and suggests poor formatting.';
            } else if (emptyLineRatio > 0.35) {
                points = 1;
                explanation = 'Too many blank lines (' + Math.round(emptyLineRatio * 100) + '% empty). Tighten spacing for a more professional appearance.';
            } else {
                points = maxPoints;
                explanation = 'Good content density with ' + nonEmptyLines + ' content lines across ' + lineCount + ' total lines.';
            }

            return {
                criterion: 'Content Density',
                passed: points >= 1,
                points: points,
                maxPoints: maxPoints,
                explanation: explanation
            };
        }

        _assessSectionOrdering(sections, cvData) {
            const maxPoints = 3;
            let points = maxPoints;
            let explanation = '';
            const issues = [];

            // Expected order (flexible but these are best practices)
            const sectionKeys = Object.keys(sections);
            const sectionPositions = {};
            sectionKeys.forEach(function (key, idx) {
                sectionPositions[key.toLowerCase()] = idx;
            });

            // Check if key sections exist
            const hasContact = this._findSection(sectionPositions, ['contact', 'personal', 'info', 'name']);
            const hasSummary = this._findSection(sectionPositions, ['summary', 'objective', 'profile', 'about']);
            const hasExperience = this._findSection(sectionPositions, ['experience', 'work', 'employment', 'career', 'professional']);
            const hasEducation = this._findSection(sectionPositions, ['education', 'academic', 'qualification']);
            const hasSkills = this._findSection(sectionPositions, ['skills', 'competencies', 'technical', 'technologies']);

            // Minimum sections check
            const foundSections = [hasContact, hasSummary, hasExperience, hasEducation, hasSkills].filter(function (s) { return s !== null; });

            if (foundSections.length < 2) {
                points = 0;
                explanation = 'Only ' + foundSections.length + ' standard sections detected. A well-structured CV needs at least contact, experience, education, and skills sections.';
            } else {
                // Check ordering rules
                if (hasSummary !== null && hasExperience !== null && hasSummary > hasExperience) {
                    issues.push('Summary/Profile should appear before Experience');
                    points -= 1;
                }
                if (hasExperience !== null && hasEducation !== null && hasExperience > hasEducation) {
                    // This is fine for fresh graduates, but for experienced professionals, experience first
                    // We'll be lenient here
                }
                if (foundSections.length < 4) {
                    issues.push('Missing key sections. Expected: Contact, Summary, Experience, Education, Skills');
                    points -= 1;
                }

                if (issues.length === 0) {
                    explanation = 'Sections are well-ordered and all key sections detected (' + foundSections.length + '/5 standard sections found).';
                } else {
                    explanation = 'Section ordering issues: ' + issues.join('; ') + '.';
                }
            }

            return {
                criterion: 'Section Organization',
                passed: points >= 2,
                points: Math.max(0, points),
                maxPoints: maxPoints,
                explanation: explanation
            };
        }

        _findSection(positions, keywords) {
            for (var key in positions) {
                for (var i = 0; i < keywords.length; i++) {
                    if (key.indexOf(keywords[i]) !== -1) {
                        return positions[key];
                    }
                }
            }
            return null;
        }

        _assessConsistentFormatting(rawText, sections) {
            const maxPoints = 3;
            let points = maxPoints;
            const issues = [];
            const lines = rawText.split(/\n/).filter(function (l) { return l.trim().length > 0; });

            // Check for mixed bullet styles
            const bulletStyles = {
                dash: 0,
                asterisk: 0,
                dot: 0,
                arrow: 0,
                number: 0
            };

            lines.forEach(function (line) {
                const trimmed = line.trim();
                if (/^[-–—]\s/.test(trimmed)) bulletStyles.dash++;
                if (/^\*\s/.test(trimmed)) bulletStyles.asterisk++;
                if (/^[•●◦▪]\s?/.test(trimmed)) bulletStyles.dot++;
                if (/^[►▸→➤>]\s?/.test(trimmed)) bulletStyles.arrow++;
                if (/^\d+[.)]\s/.test(trimmed)) bulletStyles.number++;
            });

            const usedStyles = Object.values(bulletStyles).filter(function (v) { return v > 0; });
            if (usedStyles.length > 2) {
                issues.push('Inconsistent bullet point styles detected (' + usedStyles.length + ' different styles). Use one consistent style throughout.');
                points -= 1;
            }

            // Check for inconsistent capitalization in section headers
            const sectionNames = Object.keys(sections);
            if (sectionNames.length >= 2) {
                const allUpper = sectionNames.filter(function (s) { return s === s.toUpperCase(); }).length;
                const allTitle = sectionNames.filter(function (s) { 
                    return s.charAt(0) === s.charAt(0).toUpperCase() && s.slice(1) !== s.slice(1).toUpperCase(); 
                }).length;
                
                if (allUpper > 0 && allTitle > 0 && Math.abs(allUpper - allTitle) < sectionNames.length) {
                    issues.push('Inconsistent section header capitalization. Use either all caps or title case consistently.');
                    points -= 1;
                }
            }

            // Check for inconsistent date formats
            const datePatterns = {
                mmyyyy: (rawText.match(/\b\d{2}\/\d{4}\b/g) || []).length,
                monthYear: (rawText.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b/gi) || []).length,
                yyyymm: (rawText.match(/\b\d{4}[-/]\d{2}\b/g) || []).length,
                yearOnly: (rawText.match(/\b(?:19|20)\d{2}\b/g) || []).length
            };

            const usedDateFormats = Object.entries(datePatterns).filter(function (e) { return e[1] > 0; });
            if (usedDateFormats.length > 2) {
                issues.push('Multiple date formats detected. Standardize to one format (e.g., "Jan 2023" or "01/2023").');
                points -= 1;
            }

            if (issues.length === 0) {
                return {
                    criterion: 'Formatting Consistency',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Formatting appears consistent across sections—bullet styles, headers, and date formats are uniform.'
                };
            }

            return {
                criterion: 'Formatting Consistency',
                passed: points >= 2,
                points: Math.max(0, points),
                maxPoints: maxPoints,
                explanation: issues.join(' ')
            };
        }

        _assessSpacing(rawText) {
            const maxPoints = 2;
            let points = maxPoints;
            const issues = [];
            const lines = rawText.split(/\n/);

            // Check for multiple consecutive blank lines
            let consecutiveBlanks = 0;
            let maxConsecutiveBlanks = 0;
            lines.forEach(function (line) {
                if (line.trim() === '') {
                    consecutiveBlanks++;
                    if (consecutiveBlanks > maxConsecutiveBlanks) {
                        maxConsecutiveBlanks = consecutiveBlanks;
                    }
                } else {
                    consecutiveBlanks = 0;
                }
            });

            if (maxConsecutiveBlanks >= 4) {
                issues.push('Large gaps detected (' + maxConsecutiveBlanks + ' consecutive blank lines). Remove excessive spacing.');
                points -= 1;
            }

            // Check for very long lines (potential wall of text)
            const longLines = lines.filter(function (l) { return l.trim().length > 200; });
            if (longLines.length > 2) {
                issues.push(longLines.length + ' lines exceed 200 characters. Break long paragraphs into bullet points.');
                points -= 1;
            }

            if (issues.length === 0) {
                return {
                    criterion: 'Spacing & Structure',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Spacing and structure appear clean with no excessive gaps or walls of text.'
                };
            }

            return {
                criterion: 'Spacing & Structure',
                passed: points >= 1,
                points: Math.max(0, points),
                maxPoints: maxPoints,
                explanation: issues.join(' ')
            };
        }

        _assessBulletPoints(rawText, sections) {
            const maxPoints = 2;
            let points = 0;
            const lines = rawText.split(/\n/).filter(function (l) { return l.trim().length > 0; });

            // Count bullet-style lines
            const bulletLines = lines.filter(function (line) {
                const trimmed = line.trim();
                // Match common bullet symbols, Wingdings mappings, and middle dots, optionally followed by space
                const isSymbolBullet = /^[-–—•●◦▪►▸→➤>*·✓✔❖➢]\s?/.test(trimmed);
                // Match number bullets e.g. 1. or 1) followed by space
                const isNumberBullet = /^\d+[.)]\s/.test(trimmed);
                return isSymbolBullet || isNumberBullet;
            });

            const bulletRatio = bulletLines.length / Math.max(lines.length, 1);

            if (bulletLines.length === 0) {
                points = 0;
                return {
                    criterion: 'Bullet Point Usage',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'No bullet points detected. CVs should use bullet points for experience and skills sections for scannability.'
                };
            }

            if (bulletRatio >= 0.15 && bulletRatio <= 0.7) {
                points = maxPoints;
                return {
                    criterion: 'Bullet Point Usage',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Good bullet point usage detected (' + bulletLines.length + ' bullet points, ' + Math.round(bulletRatio * 100) + '% of content lines).'
                };
            }

            if (bulletRatio > 0.7) {
                points = 1;
                return {
                    criterion: 'Bullet Point Usage',
                    passed: true,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Excessive bullet points (' + Math.round(bulletRatio * 100) + '% of lines). Not everything should be a bullet—section headers and descriptions need prose too.'
                };
            }

            points = 1;
            return {
                criterion: 'Bullet Point Usage',
                passed: true,
                points: 1,
                maxPoints: maxPoints,
                explanation: 'Few bullet points detected (' + bulletLines.length + '). Add more bullets to experience entries for better readability.'
            };
        }
    };

})();
