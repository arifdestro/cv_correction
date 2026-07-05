/**
 * SUMMARY SCORER
 * CV Assessment Pro - Scoring Engine
 * 
 * Evaluates the professional summary/objective section quality.
 * Maximum Score: 10 points
 */

(function () {
    'use strict';

    window.SummaryScorer = class SummaryScorer {
        constructor() {
            this.maxScore = 10;
            this.name = 'Professional Summary';
            this.icon = '📝';
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
            const region = (options && options.region) || 'US';

            // Find summary section
            const summaryText = this._findSummaryText(sections, rawText);

            // 1. Summary Exists (3 pts)
            details.push(this._assessExistence(summaryText));

            // 2. Optimal Length (2 pts)
            details.push(this._assessLength(summaryText));

            // 3. Quantified Elements (2 pts)
            details.push(this._assessQuantification(summaryText));

            // 4. Industry Keywords (1 pt)
            details.push(this._assessKeywords(summaryText, rawText));

            // 5. Specificity / Not Generic (1 pt)
            details.push(this._assessSpecificity(summaryText));

            // 6. No Personal Pronouns (1 pt)
            details.push(this._assessPronouns(summaryText));

            const totalScore = details.reduce(function (sum, d) { return sum + d.points; }, 0);

            return {
                score: Math.max(0, totalScore),
                maxScore: this.maxScore,
                details: details
            };
        }

        _findSummaryText(sections, rawText) {
            const summaryKeys = ['summary', 'professional summary', 'executive summary',
                'profile', 'professional profile', 'career profile',
                'objective', 'career objective', 'about', 'about me',
                'overview', 'career overview', 'introduction'];

            for (var key in sections) {
                var keyLower = key.toLowerCase().trim();
                for (var i = 0; i < summaryKeys.length; i++) {
                    if (keyLower.indexOf(summaryKeys[i]) !== -1 || summaryKeys[i].indexOf(keyLower) !== -1) {
                        var content = sections[key];
                        if (typeof content === 'string') return content.trim();
                        if (Array.isArray(content)) return content.join(' ').trim();
                        if (typeof content === 'object' && content.text) return content.text.trim();
                        return '';
                    }
                }
            }

            // Fallback: try to find summary from raw text between header and first major section
            var summaryMatch = rawText.match(/(?:summary|profile|objective|overview)[:\s]*\n([\s\S]*?)(?:\n\s*(?:experience|education|skills|work|employment|technical)\s*\n|\n\n\n)/i);
            if (summaryMatch && summaryMatch[1]) {
                return summaryMatch[1].trim();
            }

            return '';
        }

        _assessExistence(summaryText) {
            const maxPoints = 3;

            if (!summaryText || summaryText.length < 10) {
                return {
                    criterion: 'Summary Section Exists',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'No professional summary or profile section detected. A strong summary is one of the first things recruiters read and sets the tone for your entire CV.'
                };
            }

            if (summaryText.length < 50) {
                return {
                    criterion: 'Summary Section Exists',
                    passed: true,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Summary section found but appears very brief (' + summaryText.length + ' characters). A compelling summary needs 2-4 sentences highlighting your value proposition.'
                };
            }

            return {
                criterion: 'Summary Section Exists',
                passed: true,
                points: maxPoints,
                maxPoints: maxPoints,
                explanation: 'Professional summary section detected with substantive content.'
            };
        }

        _assessLength(summaryText) {
            const maxPoints = 2;

            if (!summaryText || summaryText.length < 10) {
                return {
                    criterion: 'Summary Length',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess length—no summary content found.'
                };
            }

            // Count sentences (rough)
            const sentences = summaryText.split(/[.!?]+/).filter(function (s) {
                return s.trim().length > 10;
            });
            const wordCount = summaryText.split(/\s+/).filter(function (w) { return w.length > 0; }).length;

            if (sentences.length < 2 || wordCount < 20) {
                return {
                    criterion: 'Summary Length',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Summary is too short (' + sentences.length + ' sentence(s), ' + wordCount + ' words). Aim for 2-4 impactful sentences (30-75 words).'
                };
            }

            if (sentences.length >= 2 && sentences.length <= 4 && wordCount >= 25 && wordCount <= 80) {
                return {
                    criterion: 'Summary Length',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Optimal summary length (' + sentences.length + ' sentences, ' + wordCount + ' words). Concise yet comprehensive.'
                };
            }

            if (sentences.length > 6 || wordCount > 120) {
                return {
                    criterion: 'Summary Length',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Summary is too long (' + sentences.length + ' sentences, ' + wordCount + ' words). Trim to 2-4 focused sentences. A summary is not a biography.'
                };
            }

            return {
                criterion: 'Summary Length',
                passed: true,
                points: 1,
                maxPoints: maxPoints,
                explanation: 'Summary length is acceptable (' + sentences.length + ' sentences, ' + wordCount + ' words) but could be tighter. Aim for 2-4 sentences.'
            };
        }

        _assessQuantification(summaryText) {
            const maxPoints = 2;

            if (!summaryText || summaryText.length < 10) {
                return {
                    criterion: 'Quantified Elements',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no summary content found.'
                };
            }

            const quantifiers = [];

            // Check for percentages
            if (/\d+%/.test(summaryText)) quantifiers.push('percentages');
            // Check for dollar/currency amounts
            if (/[$€£¥]\s?\d+|\d+\s?(?:million|billion|thousand|M|B|K)\b/i.test(summaryText)) quantifiers.push('monetary values');
            // Check for years of experience
            if (/\d+\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|expertise)/i.test(summaryText)) quantifiers.push('years of experience');
            // Check for other numbers with context
            if (/\d+\s*(?:projects?|clients?|teams?|people|members?|reports?|products?)/i.test(summaryText)) quantifiers.push('scale metrics');

            if (quantifiers.length >= 2) {
                return {
                    criterion: 'Quantified Elements',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Excellent! Summary contains quantified elements: ' + quantifiers.join(', ') + '. Numbers make your summary credible and memorable.'
                };
            }

            if (quantifiers.length === 1) {
                return {
                    criterion: 'Quantified Elements',
                    passed: true,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Summary includes some quantification (' + quantifiers[0] + '). Add more metrics (e.g., "managed $2M budget" or "led team of 15") for maximum impact.'
                };
            }

            return {
                criterion: 'Quantified Elements',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'No quantified achievements in summary. Add specific numbers (years of experience, team size, revenue impact, projects delivered) to establish credibility immediately.'
            };
        }

        _assessKeywords(summaryText, rawText) {
            const maxPoints = 1;

            if (!summaryText || summaryText.length < 10) {
                return {
                    criterion: 'Industry Keywords',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no summary content found.'
                };
            }

            // Check for industry/role-related keywords (not just buzzwords)
            const industryKeywords = [
                'engineer', 'developer', 'analyst', 'manager', 'designer',
                'architect', 'consultant', 'specialist', 'coordinator', 'director',
                'administrator', 'scientist', 'strategist', 'lead', 'senior',
                'executive', 'officer', 'professional', 'expert', 'associate',
                'full-stack', 'front-end', 'back-end', 'data', 'cloud',
                'machine learning', 'artificial intelligence', 'devops', 'agile',
                'scrum', 'product', 'marketing', 'sales', 'finance',
                'operations', 'human resources', 'healthcare', 'legal',
                'education', 'technology', 'software', 'hardware', 'security',
                'network', 'database', 'infrastructure', 'automation',
                'compliance', 'audit', 'risk', 'supply chain', 'logistics'
            ];

            const summaryLower = summaryText.toLowerCase();
            const foundKeywords = industryKeywords.filter(function (kw) {
                return summaryLower.indexOf(kw) !== -1;
            });

            if (foundKeywords.length >= 2) {
                return {
                    criterion: 'Industry Keywords',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Summary contains relevant industry keywords (' + foundKeywords.slice(0, 5).join(', ') + '). This helps with ATS matching and recruiter scanning.'
                };
            }

            return {
                criterion: 'Industry Keywords',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'Summary lacks clear industry or role-specific keywords. Include your job title, field, and key technical domains to aid ATS and recruiter matching.'
            };
        }

        _assessSpecificity(summaryText) {
            const maxPoints = 1;

            if (!summaryText || summaryText.length < 10) {
                return {
                    criterion: 'Specificity',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no summary content found.'
                };
            }

            const genericPhrases = [
                'hard worker', 'team player', 'fast learner', 'self-motivated',
                'results-oriented', 'detail-oriented', 'highly motivated',
                'excellent communication skills', 'strong work ethic',
                'passionate about', 'seeking a challenging position',
                'looking for an opportunity', 'eager to learn',
                'quick learner', 'go-getter', 'dedicated professional',
                'proven track record of success', 'dynamic individual',
                'well-rounded professional', 'enthusiastic individual',
                'seeking to leverage', 'seeking to utilize',
                'responsible for', 'duties included',
                'looking to contribute', 'seeking growth'
            ];

            const summaryLower = summaryText.toLowerCase();
            const foundGeneric = genericPhrases.filter(function (phrase) {
                return summaryLower.indexOf(phrase) !== -1;
            });

            if (foundGeneric.length >= 3) {
                return {
                    criterion: 'Specificity',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Summary is highly generic. Found ' + foundGeneric.length + ' cliché phrases: "' + foundGeneric.slice(0, 3).join('", "') + '". Replace with specific, measurable accomplishments.'
                };
            }

            if (foundGeneric.length >= 1) {
                return {
                    criterion: 'Specificity',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Summary contains generic phrases: "' + foundGeneric.join('", "') + '". These are overused and tell recruiters nothing unique about you.'
                };
            }

            return {
                criterion: 'Specificity',
                passed: true,
                points: maxPoints,
                maxPoints: maxPoints,
                explanation: 'Summary avoids common generic phrases. Content appears specific and tailored.'
            };
        }

        _assessPronouns(summaryText) {
            const maxPoints = 1;

            if (!summaryText || summaryText.length < 10) {
                return {
                    criterion: 'No Personal Pronouns',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no summary content found.'
                };
            }

            // Check for first-person pronouns (should be avoided in professional summaries)
            const pronounMatches = summaryText.match(/\b(?:I|me|my|mine|myself|I'm|I've|I'll|I'd)\b/gi) || [];

            if (pronounMatches.length === 0) {
                return {
                    criterion: 'No Personal Pronouns',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Summary correctly avoids first-person pronouns. Professional summaries should use implied first person.'
                };
            }

            if (pronounMatches.length <= 2) {
                return {
                    criterion: 'No Personal Pronouns',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Found ' + pronounMatches.length + ' personal pronoun(s) in summary ("' + pronounMatches.slice(0, 3).join('", "') + '"). Professional CVs use implied first person (e.g., "Experienced developer..." not "I am an experienced developer...").'
                };
            }

            return {
                criterion: 'No Personal Pronouns',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'Excessive personal pronouns (' + pronounMatches.length + ' found). Rewrite in third person or implied first person for professional tone.'
            };
        }
    };

})();
