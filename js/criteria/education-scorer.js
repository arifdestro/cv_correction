/**
 * EDUCATION SCORER
 * CV Assessment Pro - Scoring Engine
 * 
 * Evaluates education section completeness and formatting.
 * Maximum Score: 10 points
 */

(function () {
    'use strict';

    window.EducationScorer = class EducationScorer {
        constructor() {
            this.maxScore = 10;
            this.name = 'Education';
            this.icon = '🎓';
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
            const education = cvData.education || [];
            const region = (options && options.region) || 'US';

            const eduText = this._findEducationText(sections, rawText);

            // 1. Education Section Exists (2 pts)
            details.push(this._assessExistence(eduText, education));

            // 2. Degree Name Present (2 pts)
            details.push(this._assessDegreeName(eduText, education));

            // 3. Institution Name (2 pts)
            details.push(this._assessInstitution(eduText, education));

            // 4. Graduation Year (1 pt)
            details.push(this._assessGraduationYear(eduText, education));

            // 5. GPA (1 pt - only for recent grads)
            details.push(this._assessGPA(eduText, education, rawText));

            // 6. Certifications/Courses (1 pt)
            details.push(this._assessCertifications(sections, rawText));

            // 7. Proper Ordering (1 pt)
            details.push(this._assessOrdering(eduText, education));

            const totalScore = details.reduce(function (sum, d) { return sum + d.points; }, 0);

            return {
                score: Math.max(0, totalScore),
                maxScore: this.maxScore,
                details: details
            };
        }

        _findEducationText(sections, rawText) {
            const eduKeys = ['education', 'academic', 'academic background',
                'qualifications', 'academic qualifications', 'educational background',
                'degrees', 'studies'];

            for (var key in sections) {
                var keyLower = key.toLowerCase().trim();
                for (var i = 0; i < eduKeys.length; i++) {
                    if (keyLower.indexOf(eduKeys[i]) !== -1 || eduKeys[i].indexOf(keyLower) !== -1) {
                        var content = sections[key];
                        if (typeof content === 'string') return content.trim();
                        if (Array.isArray(content)) return content.join('\n').trim();
                        if (typeof content === 'object' && content.text) return content.text.trim();
                        return '';
                    }
                }
            }

            var eduMatch = rawText.match(/(?:education|academic|qualification)[:\s]*\n([\s\S]*?)(?:\n\s*(?:experience|skills|certif|project|work|employment|language|interest|reference|awards?)\s*[:\n]|$)/i);
            if (eduMatch && eduMatch[1]) return eduMatch[1].trim();
            return '';
        }

        _assessExistence(eduText, education) {
            const maxPoints = 2;

            if ((!eduText || eduText.length < 10) && education.length === 0) {
                return {
                    criterion: 'Education Section Exists',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'No education section detected. Even experienced professionals should list their highest degree and institution.'
                };
            }

            if (eduText && eduText.length < 30 && education.length === 0) {
                return {
                    criterion: 'Education Section Exists',
                    passed: true,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Education section found but appears very brief. Include degree, institution, and graduation year at minimum.'
                };
            }

            return {
                criterion: 'Education Section Exists',
                passed: true,
                points: maxPoints,
                maxPoints: maxPoints,
                explanation: 'Education section detected with content.'
            };
        }

        _assessDegreeName(eduText, education) {
            const maxPoints = 2;

            if (!eduText || eduText.length < 10) {
                return {
                    criterion: 'Degree Name',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no education content found.'
                };
            }

            const degreePatterns = [
                /\b(?:B\.?A\.?|B\.?S\.?|B\.?Sc\.?|B\.?Eng\.?|B\.?Tech\.?|Bachelor(?:'s)?)\b/i,
                /\b(?:M\.?A\.?|M\.?S\.?|M\.?Sc\.?|M\.?Eng\.?|M\.?Tech\.?|M\.?B\.?A\.?|Master(?:'s)?)\b/i,
                /\b(?:Ph\.?D\.?|Doctorate|Doctor(?:al)?)\b/i,
                /\b(?:Associate(?:'s)?|A\.?A\.?|A\.?S\.?)\b/i,
                /\b(?:Diploma|Certificate|Certification)\b/i,
                /\b(?:B\.?Com\.?|LL\.?B\.?|LL\.?M\.?|M\.?D\.?|J\.?D\.?|D\.?D\.?S\.?)\b/i,
                /\b(?:Bachelor|Master|Degree)\s+(?:of|in)\s+\w+/i,
                /\b(?:Honours?|Honors?|Hons?\.?)\b/i
            ];

            let degreeFound = false;
            for (var i = 0; i < degreePatterns.length; i++) {
                if (degreePatterns[i].test(eduText)) {
                    degreeFound = true;
                    break;
                }
            }

            // Also check structured data
            if (!degreeFound && education.length > 0) {
                education.forEach(function (edu) {
                    if (edu.degree || edu.qualification || edu.title) {
                        degreeFound = true;
                    }
                });
            }

            if (degreeFound) {
                return {
                    criterion: 'Degree Name',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Degree/qualification name detected in education section.'
                };
            }

            // Check for field of study without explicit degree
            const fieldOfStudy = /\b(?:Computer Science|Engineering|Business|Marketing|Finance|Accounting|Economics|Psychology|Biology|Chemistry|Physics|Mathematics|Law|Medicine|Nursing|Design|Architecture|Communications?)\b/i.test(eduText);

            if (fieldOfStudy) {
                return {
                    criterion: 'Degree Name',
                    passed: true,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Field of study detected but no explicit degree type (B.S., M.A., etc.). Specify the full degree name for clarity.'
                };
            }

            return {
                criterion: 'Degree Name',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'No degree or qualification name detected. Clearly state your degree (e.g., "Bachelor of Science in Computer Science").'
            };
        }

        _assessInstitution(eduText, education) {
            const maxPoints = 2;

            if (!eduText || eduText.length < 10) {
                return {
                    criterion: 'Institution Name',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no education content found.'
                };
            }

            // Look for university/college/institute patterns
            const institutionPatterns = [
                /\b(?:University|College|Institute|School|Academy|Polytechnic|Universit[éa])\b/i,
                /\bU(?:niv)?\.?\s+of\s+\w+/i,
                /\b[A-Z][a-z]+\s+(?:State|Tech|Technical)\b/,
                /\b(?:MIT|UCLA|NYU|USC|UCSB|UCSD|UCB|CMU|GaTech|CalTech|ETH|NUS|NTU|IIT|BITS)\b/,
                /\b(?:Harvard|Stanford|Oxford|Cambridge|Yale|Princeton|Columbia)\b/i
            ];

            let institutionFound = false;
            for (var i = 0; i < institutionPatterns.length; i++) {
                if (institutionPatterns[i].test(eduText)) {
                    institutionFound = true;
                    break;
                }
            }

            if (!institutionFound && education.length > 0) {
                education.forEach(function (edu) {
                    if (edu.institution || edu.university || edu.school || edu.college) {
                        institutionFound = true;
                    }
                });
            }

            if (institutionFound) {
                return {
                    criterion: 'Institution Name',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Educational institution name detected.'
                };
            }

            return {
                criterion: 'Institution Name',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'No educational institution name detected. Always include the full name of your university, college, or school.'
            };
        }

        _assessGraduationYear(eduText, education) {
            const maxPoints = 1;

            if (!eduText || eduText.length < 10) {
                return {
                    criterion: 'Graduation Year',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no education content found.'
                };
            }

            const hasYear = /\b(19|20)\d{2}\b/.test(eduText);
            const hasExpectedGrad = /\b(?:expected|anticipated|graduating)\b/i.test(eduText);

            if (hasYear || hasExpectedGrad) {
                return {
                    criterion: 'Graduation Year',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: hasExpectedGrad
                        ? 'Expected graduation year noted. Good practice for current students.'
                        : 'Graduation year detected in education section.'
                };
            }

            // Check structured data
            const hasStructuredYear = education.some(function (edu) {
                return edu.year || edu.graduationYear || edu.endDate;
            });

            if (hasStructuredYear) {
                return {
                    criterion: 'Graduation Year',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Graduation year found in education data.'
                };
            }

            return {
                criterion: 'Graduation Year',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'No graduation year detected. Include the year of graduation (or expected graduation date for current students).'
            };
        }

        _assessGPA(eduText, education, rawText) {
            const maxPoints = 1;

            if (!eduText || eduText.length < 10) {
                return {
                    criterion: 'GPA / Academic Honors',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no education content found.'
                };
            }

            // Check if this appears to be a recent graduate (graduated within last 3 years)
            const currentYear = new Date().getFullYear();
            const years = (eduText.match(/\b(20\d{2})\b/g) || []).map(function (y) { return parseInt(y, 10); });
            const latestYear = years.length > 0 ? Math.max.apply(null, years) : 0;
            const isRecentGrad = latestYear >= (currentYear - 3);

            // Check for experience section to determine seniority
            const experienceLength = (rawText.match(/(?:experience|employment|work\s*history)[:\s]*\n([\s\S]*?)(?:\n\s*(?:education|skills|certif)\s*[:\n]|$)/i) || ['', ''])[1].length;
            const isSenior = experienceLength > 500;

            // Look for GPA
            const gpaMatch = eduText.match(/\b(?:GPA|CGPA|Grade|Average)[:\s]*(\d[.,]\d{1,2})\s*(?:\/\s*(\d[.,]?\d?))?\b/i);
            const hasGPA = gpaMatch !== null;

            // Look for honors
            const hasHonors = /\b(?:cum laude|magna cum laude|summa cum laude|with honors|with distinction|first class|upper second|dean's list|honor roll|valedictorian|salutatorian)\b/i.test(eduText);

            if (hasGPA) {
                const gpa = parseFloat(gpaMatch[1].replace(',', '.'));
                const scale = gpaMatch[2] ? parseFloat(gpaMatch[2].replace(',', '.')) : 4.0;

                if (gpa / scale >= 0.875) { // 3.5/4.0 or equivalent
                    return {
                        criterion: 'GPA / Academic Honors',
                        passed: true,
                        points: maxPoints,
                        maxPoints: maxPoints,
                        explanation: 'Strong GPA listed (' + gpa + '/' + scale + '). This strengthens your candidacy' + (isRecentGrad ? ', especially as a recent graduate.' : '.')
                    };
                }

                if (!isRecentGrad && isSenior) {
                    return {
                        criterion: 'GPA / Academic Honors',
                        passed: true,
                        points: maxPoints,
                        maxPoints: maxPoints,
                        explanation: 'GPA listed. Note: For experienced professionals, GPA becomes less relevant—your work experience speaks louder.'
                    };
                }

                return {
                    criterion: 'GPA / Academic Honors',
                    passed: true,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'GPA listed (' + gpa + '/' + scale + '). If below 3.5/4.0, consider omitting unless specifically requested. A low GPA can hurt more than help.'
                };
            }

            if (hasHonors) {
                return {
                    criterion: 'GPA / Academic Honors',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Academic honors detected. Latin honors and distinctions add credibility to your education.'
                };
            }

            if (isRecentGrad && !isSenior) {
                return {
                    criterion: 'GPA / Academic Honors',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'No GPA or academic honors listed. As a recent graduate, include GPA if 3.5+ or list relevant academic awards/honors to strengthen your education section.'
                };
            }

            // For experienced professionals, this is fine
            return {
                criterion: 'GPA / Academic Honors',
                passed: true,
                points: maxPoints,
                maxPoints: maxPoints,
                explanation: 'GPA not listed—appropriate for experienced professionals where work experience takes precedence.'
            };
        }

        _assessCertifications(sections, rawText) {
            const maxPoints = 1;

            // Check for certifications section or mentions
            const certKeys = ['certifications', 'certificates', 'professional development',
                'training', 'courses', 'licenses', 'credentials', 'accreditations'];

            let hasCertSection = false;
            for (var key in sections) {
                var keyLower = key.toLowerCase().trim();
                for (var i = 0; i < certKeys.length; i++) {
                    if (keyLower.indexOf(certKeys[i]) !== -1) {
                        hasCertSection = true;
                        break;
                    }
                }
            }

            const certPatterns = /\b(?:AWS|Azure|GCP|PMP|PRINCE2|Scrum|CISSP|CISA|CPA|CFA|Six Sigma|ITIL|CompTIA|Cisco|CCNA|CCNP|Oracle|SAP|Salesforce|HubSpot|Google Analytics|Google Ads|Meta Blueprint|Coursera|Udemy|edX|Certified|Certificate|Certification|Licensed|Accredited)\b/i;
            const hasCertMentions = certPatterns.test(rawText);

            if (hasCertSection || hasCertMentions) {
                return {
                    criterion: 'Certifications / Courses',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Certifications or professional development courses detected. Continuous learning demonstrates professional growth.'
                };
            }

            return {
                criterion: 'Certifications / Courses',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'No certifications or professional courses detected. Adding industry-relevant certifications (AWS, PMP, Google, etc.) can significantly boost your CV.'
            };
        }

        _assessOrdering(eduText, education) {
            const maxPoints = 1;

            if (!eduText || eduText.length < 10) {
                return {
                    criterion: 'Education Ordering',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no education content found.'
                };
            }

            // Check if highest degree is listed first
            const degreeHierarchy = {
                'phd': 5, 'doctorate': 5, 'doctoral': 5,
                'master': 4, 'mba': 4, 'msc': 4, 'ma': 4,
                'bachelor': 3, 'bsc': 3, 'ba': 3, 'beng': 3,
                'associate': 2, 'diploma': 1, 'certificate': 0
            };

            const lines = eduText.split(/\n/).filter(function (l) { return l.trim().length > 5; });
            const degreesFound = [];

            lines.forEach(function (line, idx) {
                const lineLower = line.toLowerCase();
                for (var degree in degreeHierarchy) {
                    if (lineLower.indexOf(degree) !== -1) {
                        degreesFound.push({ level: degreeHierarchy[degree], lineIndex: idx, degree: degree });
                        break;
                    }
                }
            });

            if (degreesFound.length < 2) {
                return {
                    criterion: 'Education Ordering',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: degreesFound.length === 1
                        ? 'Single degree listed—ordering is not applicable.'
                        : 'Education ordering appears acceptable.'
                };
            }

            // Check if highest degree is first
            let isCorrectOrder = true;
            for (var i = 1; i < degreesFound.length; i++) {
                if (degreesFound[i].level > degreesFound[i - 1].level) {
                    isCorrectOrder = false;
                    break;
                }
            }

            if (isCorrectOrder) {
                return {
                    criterion: 'Education Ordering',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Education entries correctly ordered with highest degree first.'
                };
            }

            return {
                criterion: 'Education Ordering',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'Education entries appear to be in wrong order. List your highest/most recent degree first, followed by lower degrees.'
            };
        }
    };

})();
