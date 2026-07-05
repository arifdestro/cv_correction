/**
 * EXPERIENCE SCORER
 * CV Assessment Pro - Scoring Engine
 * 
 * Evaluates work experience section — the most heavily weighted category.
 * Maximum Score: 25 points
 */

(function () {
    'use strict';

    window.ExperienceScorer = class ExperienceScorer {
        constructor() {
            this.maxScore = 25;
            this.name = 'Work Experience';
            this.icon = '💼';
        }

        /**
         * @param {Object} cvData - Parsed CV data
         * @param {Object} options - Assessment options
         * @returns {{ score: number, maxScore: number, details: Array }}
         */
        score(cvData, options) {
            const details = [];
            const sections = cvData.sections || {};
            const rawText = (cvData.rawText || '').trim();
            const experience = cvData.experience || cvData.workExperience || [];
            const region = (options && options.region) || 'US';

            // Find experience text from sections
            const expText = this._findExperienceText(sections, rawText);

            // 1. Experience Section Exists (3 pts)
            details.push(this._assessExistence(expText, experience));

            // 2. Reverse Chronological Order (3 pts)
            details.push(this._assessChronologicalOrder(expText, experience));

            // 3. Action Verbs Usage (4 pts)
            details.push(this._assessActionVerbs(expText));

            // 4. Quantified Results (5 pts)
            details.push(this._assessQuantifiedResults(expText));

            // 5. Consistent Date Formatting (2 pts)
            details.push(this._assessDateFormatting(expText));

            // 6. Job Title + Company + Duration (3 pts)
            details.push(this._assessRoleCompleteness(expText, experience));

            // 7. Employment Gaps (2 pts)
            details.push(this._assessEmploymentGaps(expText, experience));

            // 8. Bullet Points Per Role (2 pts)
            details.push(this._assessBulletsPerRole(expText, experience));

            // 9. Relevance & Specificity (1 pt)
            details.push(this._assessRelevanceSpecificity(expText));

            const totalScore = details.reduce(function (sum, d) { return sum + d.points; }, 0);

            return {
                score: Math.max(0, totalScore),
                maxScore: this.maxScore,
                details: details
            };
        }

        _findExperienceText(sections, rawText) {
            const expKeys = ['experience', 'work experience', 'professional experience',
                'employment', 'employment history', 'work history', 'career history',
                'professional background', 'relevant experience'];

            for (var key in sections) {
                var keyLower = key.toLowerCase().trim();
                for (var i = 0; i < expKeys.length; i++) {
                    if (keyLower.indexOf(expKeys[i]) !== -1 || expKeys[i].indexOf(keyLower) !== -1) {
                        var content = sections[key];
                        if (typeof content === 'string') return content.trim();
                        if (Array.isArray(content)) return content.join('\n').trim();
                        if (typeof content === 'object' && content.text) return content.text.trim();
                        return '';
                    }
                }
            }

            // Fallback: extract from raw text
            var expMatch = rawText.match(/(?:experience|employment|work\s*history)[:\s]*\n([\s\S]*?)(?:\n\s*(?:education|skills|certif|project|volunteer|language|interest|reference|awards?)\s*[:\n]|$)/i);
            if (expMatch && expMatch[1]) {
                return expMatch[1].trim();
            }

            return '';
        }

        _assessExistence(expText, experience) {
            const maxPoints = 3;

            if ((!expText || expText.length < 20) && (!experience || experience.length === 0)) {
                return {
                    criterion: 'Experience Section Exists',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'No work experience section detected. This is the most critical section of a CV—without it, most applications will be immediately rejected.'
                };
            }

            if ((expText && expText.length < 100) && (!experience || experience.length === 0)) {
                return {
                    criterion: 'Experience Section Exists',
                    passed: true,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Experience section found but appears very thin (' + expText.length + ' characters). Expand with detailed bullet points showing your impact at each role.'
                };
            }

            return {
                criterion: 'Experience Section Exists',
                passed: true,
                points: maxPoints,
                maxPoints: maxPoints,
                explanation: 'Work experience section detected with substantive content.'
            };
        }

        _assessChronologicalOrder(expText, experience) {
            const maxPoints = 3;

            if (!expText || expText.length < 20) {
                return {
                    criterion: 'Chronological Order',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess ordering—insufficient experience content.'
                };
            }

            // Extract years from the experience text
            const yearMatches = expText.match(/\b(19|20)\d{2}\b/g) || [];
            const years = yearMatches.map(function (y) { return parseInt(y, 10); });

            if (years.length < 2) {
                return {
                    criterion: 'Chronological Order',
                    passed: false,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Only ' + years.length + ' date(s) found in experience section. Include clear dates for each role to establish career timeline.'
                };
            }

            // Check if dates are in reverse chronological order (most recent first)
            let isReverseChronological = true;
            let isChronological = true;
            for (var i = 1; i < years.length; i++) {
                if (years[i] > years[i - 1]) isReverseChronological = false;
                if (years[i] < years[i - 1]) isChronological = false;
            }

            // Check for "Present" or "Current" at the beginning
            const hasPresent = /\b(?:present|current|now|ongoing)\b/i.test(expText.substring(0, Math.min(expText.length, 500)));

            if (isReverseChronological || (hasPresent && years.length >= 2)) {
                return {
                    criterion: 'Chronological Order',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Experience entries appear in correct reverse chronological order (most recent first).'
                };
            }

            if (isChronological) {
                return {
                    criterion: 'Chronological Order',
                    passed: false,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Experience appears in chronological order (oldest first). Reverse the order—recruiters want to see your most recent and relevant experience first.'
                };
            }

            return {
                criterion: 'Chronological Order',
                passed: false,
                points: 1,
                maxPoints: maxPoints,
                explanation: 'Date ordering is inconsistent or unclear. Ensure experiences are listed in strict reverse chronological order.'
            };
        }

        _assessActionVerbs(expText) {
            const maxPoints = 4;

            if (!expText || expText.length < 20) {
                return {
                    criterion: 'Action Verbs Usage',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—insufficient experience content.'
                };
            }

            // Split into lines and check bullet points
            const lines = expText.split(/\n/).filter(function (l) {
                return l.trim().length > 10;
            });

            const actionVerbSet = window.ALL_ACTION_VERBS_SET || new Set();
            const weakVerbSet = window.WEAK_VERBS_SET || new Set();

            let actionVerbCount = 0;
            let weakVerbCount = 0;
            let totalBulletLines = 0;
            const foundActionVerbs = [];
            const foundWeakVerbs = [];

            lines.forEach(function (line) {
                const trimmed = line.trim();
                // Check lines that look like bullet points or experience descriptions
                if (trimmed.length > 15) {
                    totalBulletLines++;

                    // Get first few words
                    const words = trimmed.replace(/^[-–—•●◦▪►▸→➤>*]\s*/, '').split(/\s+/);
                    const firstWord = (words[0] || '').toLowerCase().replace(/[^a-z]/g, '');
                    const firstTwoWords = words.slice(0, 2).join(' ').toLowerCase();
                    const firstThreeWords = words.slice(0, 3).join(' ').toLowerCase();

                    // Check for action verbs
                    if (actionVerbSet.has(firstWord)) {
                        actionVerbCount++;
                        if (foundActionVerbs.indexOf(firstWord) === -1 && foundActionVerbs.length < 8) {
                            foundActionVerbs.push(firstWord);
                        }
                    }

                    // Check for weak verbs/phrases
                    let isWeak = false;
                    weakVerbSet.forEach(function (wv) {
                        if (firstThreeWords.indexOf(wv) !== -1 || firstTwoWords.indexOf(wv) !== -1) {
                            isWeak = true;
                            if (foundWeakVerbs.indexOf(wv) === -1 && foundWeakVerbs.length < 5) {
                                foundWeakVerbs.push(wv);
                            }
                        }
                    });
                    if (isWeak) weakVerbCount++;
                }
            });

            const actionVerbRatio = totalBulletLines > 0 ? actionVerbCount / totalBulletLines : 0;
            const weakVerbRatio = totalBulletLines > 0 ? weakVerbCount / totalBulletLines : 0;

            let points = 0;
            let explanation = '';

            if (actionVerbRatio >= 0.6 && weakVerbCount === 0) {
                points = maxPoints;
                explanation = 'Excellent action verb usage! ' + actionVerbCount + '/' + totalBulletLines + ' lines start with strong verbs (' + foundActionVerbs.join(', ') + '). No weak verbs detected.';
            } else if (actionVerbRatio >= 0.4 && weakVerbRatio < 0.2) {
                points = 3;
                explanation = 'Good action verb usage (' + actionVerbCount + '/' + totalBulletLines + ' lines). Verbs used: ' + foundActionVerbs.join(', ') + '. Aim for every bullet to start with a strong action verb.';
            } else if (actionVerbRatio >= 0.2) {
                points = 2;
                explanation = 'Moderate action verb usage (' + actionVerbCount + '/' + totalBulletLines + ' lines). ' + (weakVerbCount > 0 ? 'Found weak verbs: "' + foundWeakVerbs.join('", "') + '". Replace these with impactful action verbs.' : 'Start each bullet point with a strong action verb.');
            } else if (actionVerbCount > 0) {
                points = 1;
                explanation = 'Weak action verb usage—only ' + actionVerbCount + '/' + totalBulletLines + ' lines use strong verbs. ' + (weakVerbCount > 0 ? 'Detected ' + weakVerbCount + ' weak verb(s): "' + foundWeakVerbs.join('", "') + '".' : '') + ' Every bullet should begin with a powerful action verb (e.g., "Spearheaded", "Engineered", "Orchestrated").';
            } else {
                points = 0;
                explanation = 'No strong action verbs detected in experience bullets. ' + (weakVerbCount > 0 ? 'Found ' + weakVerbCount + ' weak verb(s): "' + foundWeakVerbs.join('", "') + '". ' : '') + 'Start each bullet with powerful verbs like "Spearheaded", "Engineered", "Delivered", "Optimized".';
            }

            return {
                criterion: 'Action Verbs Usage',
                passed: points >= 2,
                points: points,
                maxPoints: maxPoints,
                explanation: explanation
            };
        }

        _assessQuantifiedResults(expText) {
            const maxPoints = 5;

            if (!expText || expText.length < 20) {
                return {
                    criterion: 'Quantified Results (PAR)',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—insufficient experience content.'
                };
            }

            const metrics = {
                percentages: (expText.match(/\d+\s*%/g) || []).length,
                currency: (expText.match(/[$€£¥]\s*[\d,.]+|\d+\s*(?:million|billion|thousand|M|B|K)\b/gi) || []).length,
                numbers: (expText.match(/\b\d{2,}\b/g) || []).length, // Numbers with 2+ digits (meaningful quantities)
                comparatives: (expText.match(/\b(?:increased|decreased|reduced|improved|grew|saved|cut|boosted|raised|lowered)\s+(?:by\s+)?\d/gi) || []).length,
                timeframes: (expText.match(/\b(?:within|over|under|in)\s+\d+\s+(?:months?|weeks?|days?|quarters?|years?)\b/gi) || []).length,
                scales: (expText.match(/\d+\s*(?:\+\s*)?(?:users?|customers?|clients?|employees?|members?|teams?|people|projects?|stores?|locations?|accounts?)\b/gi) || []).length
            };

            const totalMetrics = metrics.percentages + metrics.currency + metrics.comparatives + metrics.timeframes + metrics.scales;

            let points = 0;
            let explanation = '';
            const foundTypes = [];

            if (metrics.percentages > 0) foundTypes.push(metrics.percentages + ' percentage(s)');
            if (metrics.currency > 0) foundTypes.push(metrics.currency + ' monetary value(s)');
            if (metrics.comparatives > 0) foundTypes.push(metrics.comparatives + ' improvement metric(s)');
            if (metrics.timeframes > 0) foundTypes.push(metrics.timeframes + ' timeframe(s)');
            if (metrics.scales > 0) foundTypes.push(metrics.scales + ' scale indicator(s)');

            if (totalMetrics >= 8) {
                points = maxPoints;
                explanation = 'Outstanding quantification! Found ' + totalMetrics + ' measurable results: ' + foundTypes.join(', ') + '. This is the gold standard for demonstrating impact using the PAR (Problem-Action-Result) method.';
            } else if (totalMetrics >= 5) {
                points = 4;
                explanation = 'Strong quantification with ' + totalMetrics + ' measurable results: ' + foundTypes.join(', ') + '. Consider adding more metrics to remaining bullet points.';
            } else if (totalMetrics >= 3) {
                points = 3;
                explanation = 'Moderate quantification (' + totalMetrics + ' metrics found: ' + foundTypes.join(', ') + '). Aim to quantify at least 60% of your bullet points with %, $, or specific numbers.';
            } else if (totalMetrics >= 1) {
                points = 1;
                explanation = 'Minimal quantification (' + totalMetrics + ' metric(s) found). Most bullet points lack measurable results. Use the PAR method: Problem → Action → Result (with numbers).';
            } else {
                points = 0;
                explanation = 'No quantified results detected. This is a critical weakness. Recruiters need to see measurable impact: revenue generated, costs saved (%), team sizes managed, projects delivered, etc.';
            }

            return {
                criterion: 'Quantified Results (PAR)',
                passed: points >= 3,
                points: points,
                maxPoints: maxPoints,
                explanation: explanation
            };
        }

        _assessDateFormatting(expText) {
            const maxPoints = 2;

            if (!expText || expText.length < 20) {
                return {
                    criterion: 'Date Formatting',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—insufficient experience content.'
                };
            }

            const dateFormats = {
                monthYear: (expText.match(/\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b/gi) || []).length,
                slashFormat: (expText.match(/\b\d{1,2}\/\d{4}\b/g) || []).length,
                dashFormat: (expText.match(/\b\d{4}[-]\d{2}\b/g) || []).length,
                yearOnly: (expText.match(/\b(19|20)\d{2}\b/g) || []).length,
                present: (expText.match(/\b(?:present|current|now|ongoing)\b/gi) || []).length
            };

            const formatsUsed = Object.entries(dateFormats).filter(function (e) { return e[1] > 0; });
            const totalDates = Object.values(dateFormats).reduce(function (a, b) { return a + b; }, 0);

            if (totalDates === 0) {
                return {
                    criterion: 'Date Formatting',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'No dates detected in experience section. Each role must include start and end dates for credibility.'
                };
            }

            // Check for date ranges (Start - End pattern)
            const dateRanges = (expText.match(/\d{4}\s*[-–—to]+\s*(?:\d{4}|present|current|now)/gi) || []).length +
                (expText.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{4}|present|current)/gi) || []).length;

            if (dateRanges >= 1 && formatsUsed.length <= 3) {
                return {
                    criterion: 'Date Formatting',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Consistent date formatting detected with ' + dateRanges + ' date range(s). Dates are formatted uniformly.'
                };
            }

            if (formatsUsed.length > 3) {
                return {
                    criterion: 'Date Formatting',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Inconsistent date formatting—' + formatsUsed.length + ' different formats detected. Standardize all dates to one format (e.g., "Jan 2020 – Mar 2023").'
                };
            }

            return {
                criterion: 'Date Formatting',
                passed: true,
                points: 1,
                maxPoints: maxPoints,
                explanation: 'Dates detected but formatting could be more consistent. Ensure all roles use the same date format with clear start–end ranges.'
            };
        }

        _assessRoleCompleteness(expText, experience) {
            const maxPoints = 3;

            if (!expText || expText.length < 20) {
                return {
                    criterion: 'Role Completeness',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—insufficient experience content.'
                };
            }

            let points = 0;
            const issues = [];

            // Check for job titles (typically capitalized phrases or known title patterns)
            const titlePatterns = /\b(?:senior|junior|lead|chief|head|principal|staff|associate|assistant|intern)\s+\w+|\b(?:manager|director|engineer|developer|analyst|designer|consultant|coordinator|specialist|architect|officer|administrator|executive|president|VP)\b/gi;
            const titles = expText.match(titlePatterns) || [];

            if (titles.length >= 1) {
                points += 1;
            } else {
                issues.push('No clear job titles detected. Each role needs a prominent job title.');
            }

            // Check for company names (look for "at", "–", "|" separators or known patterns)
            const companyPatterns = /(?:at|@|for|\|)\s+[A-Z][\w\s&.,]+|(?:Inc\.|LLC|Ltd\.?|Corp\.?|Company|Group|Solutions|Technologies|Services|Partners|Associates|Consulting)\b/gi;
            const companies = expText.match(companyPatterns) || [];

            // Also check for lines that look like company + title combos
            const companyLines = expText.split(/\n/).filter(function (l) {
                const t = l.trim();
                return /[A-Z][\w\s]+\s*[|–—-]\s*[A-Z]/.test(t) || /\bat\s+[A-Z]/.test(t);
            });

            if (companies.length >= 1 || companyLines.length >= 1) {
                points += 1;
            } else {
                issues.push('No company/organization names clearly identified. Include company name for each role.');
            }

            // Check for duration/dates per role
            const dateMatches = expText.match(/\b(?:19|20)\d{2}\b/g) || [];
            if (dateMatches.length >= 2) {
                points += 1;
            } else {
                issues.push('Insufficient date information. Each role needs start and end dates.');
            }

            return {
                criterion: 'Role Completeness',
                passed: points >= 2,
                points: points,
                maxPoints: maxPoints,
                explanation: points === maxPoints
                    ? 'All roles appear to include job title, company name, and employment dates.'
                    : 'Incomplete role information. ' + issues.join(' ') + ' Every entry needs: Job Title | Company Name | Start Date – End Date.'
            };
        }

        _assessEmploymentGaps(expText, experience) {
            const maxPoints = 2;

            if (!expText || expText.length < 20) {
                return {
                    criterion: 'Employment Gaps',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess gaps—insufficient experience content.'
                };
            }

            // Extract years and try to identify gaps
            const yearMatches = expText.match(/\b(19|20)\d{2}\b/g) || [];
            const years = yearMatches.map(function (y) { return parseInt(y, 10); }).sort(function (a, b) { return a - b; });

            if (years.length < 2) {
                return {
                    criterion: 'Employment Gaps',
                    passed: false,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Insufficient dates to assess employment continuity. Include clear start and end dates for all roles.'
                };
            }

            // Check for year gaps > 1
            let maxGap = 0;
            const gaps = [];
            for (var i = 1; i < years.length; i++) {
                const gap = Math.abs(years[i] - years[i - 1]);
                if (gap > maxGap) maxGap = gap;
                if (gap > 1) {
                    gaps.push({ from: years[i - 1], to: years[i], gap: gap });
                }
            }

            // Check for gap explanations (volunteer, freelance, education, sabbatical, etc.)
            const gapExplanations = /\b(?:freelance|consultant|self-employed|sabbatical|career break|parental leave|volunteer|study|education|travel|personal development)\b/i;
            const hasExplanation = gapExplanations.test(expText);

            if (gaps.length === 0 || maxGap <= 1) {
                return {
                    criterion: 'Employment Gaps',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'No significant employment gaps detected in the timeline.'
                };
            }

            if (gaps.length > 0 && hasExplanation) {
                return {
                    criterion: 'Employment Gaps',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Employment gaps detected but appear to be addressed (freelance, education, etc.).'
                };
            }

            if (gaps.length > 0) {
                const gapDescriptions = gaps.map(function (g) { return g.from + '–' + g.to + ' (' + g.gap + ' years)'; });
                return {
                    criterion: 'Employment Gaps',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Unexplained employment gap(s) detected: ' + gapDescriptions.join(', ') + '. Address gaps with freelance work, education, volunteer experience, or a brief explanation.'
                };
            }

            return {
                criterion: 'Employment Gaps',
                passed: true,
                points: 1,
                maxPoints: maxPoints,
                explanation: 'Employment timeline appears mostly continuous, though some gaps may exist between roles.'
            };
        }

        _assessBulletsPerRole(expText, experience) {
            const maxPoints = 2;

            if (!expText || expText.length < 20) {
                return {
                    criterion: 'Bullets Per Role',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—insufficient experience content.'
                };
            }

            // Count bullet-like lines
            const lines = expText.split(/\n/);
            const bulletLines = lines.filter(function (l) {
                const t = l.trim();
                return /^[-–—•●◦▪►▸→➤>*]\s/.test(t) || /^\d+[.)]\s/.test(t);
            });

            // Estimate number of roles (look for year patterns or title patterns as role separators)
            const roleIndicators = expText.match(/\b(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|present|current)/gi) || [];
            const estimatedRoles = Math.max(roleIndicators.length, 1);

            const bulletsPerRole = bulletLines.length / estimatedRoles;

            if (bulletLines.length === 0) {
                return {
                    criterion: 'Bullets Per Role',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'No bullet points detected in experience. Use 3-6 bullet points per role to highlight achievements and responsibilities.'
                };
            }

            if (bulletsPerRole >= 2 && bulletsPerRole <= 6) {
                return {
                    criterion: 'Bullets Per Role',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Good bullet density (~' + Math.round(bulletsPerRole) + ' bullets per role across ~' + estimatedRoles + ' role(s)). This allows recruiters to scan quickly.'
                };
            }

            if (bulletsPerRole > 8) {
                return {
                    criterion: 'Bullets Per Role',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Too many bullets per role (~' + Math.round(bulletsPerRole) + '). Limit to 3-6 per role, focusing on highest-impact achievements. Quality over quantity.'
                };
            }

            if (bulletsPerRole < 2) {
                return {
                    criterion: 'Bullets Per Role',
                    passed: false,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Only ~' + Math.round(bulletsPerRole) + ' bullet(s) per role on average. Add 3-6 bullet points per role describing specific achievements and measurable outcomes.'
                };
            }

            return {
                criterion: 'Bullets Per Role',
                passed: true,
                points: 1,
                maxPoints: maxPoints,
                explanation: '~' + Math.round(bulletsPerRole) + ' bullets per role. Acceptable, but aim for 3-6 focused bullets per position.'
            };
        }

        _assessRelevanceSpecificity(expText) {
            const maxPoints = 1;

            if (!expText || expText.length < 20) {
                return {
                    criterion: 'Relevance & Specificity',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—insufficient experience content.'
                };
            }

            const vaguePhrases = [
                'various tasks', 'various responsibilities', 'various duties',
                'general duties', 'day-to-day', 'day to day',
                'as needed', 'as required', 'when necessary',
                'other duties as assigned', 'etc.', 'and more',
                'stuff like', 'things like', 'miscellaneous',
                'duties included', 'responsibilities included',
                'was responsible for', 'in charge of'
            ];

            const expLower = expText.toLowerCase();
            const foundVague = vaguePhrases.filter(function (phrase) {
                return expLower.indexOf(phrase) !== -1;
            });

            if (foundVague.length === 0) {
                return {
                    criterion: 'Relevance & Specificity',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Experience content appears specific and avoids vague, generic language.'
                };
            }

            return {
                criterion: 'Relevance & Specificity',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'Vague language detected: "' + foundVague.slice(0, 3).join('", "') + '". Replace generic phrases with specific, measurable achievements. Every bullet should answer: What did you do? How? What was the result?'
            };
        }
    };

})();
