/**
 * CONTACT SCORER
 * CV Assessment Pro - Scoring Engine
 * 
 * Evaluates contact information completeness and professionalism.
 * Maximum Score: 10 points
 */

(function () {
    'use strict';

    window.ContactScorer = class ContactScorer {
        constructor() {
            this.maxScore = 10;
            this.name = 'Contact Information';
            this.icon = '📇';
        }

        /**
         * @param {Object} cvData - Parsed CV data
         * @param {Object} options - Assessment options
         * @returns {{ score: number, maxScore: number, details: Array }}
         */
        score(cvData, options) {
            const details = [];
            const rawText = (cvData.rawText || '').trim();
            const contact = cvData.contact || {};
            const region = (options && options.region) || 'US';

            // 1. Professional Email (3 pts)
            details.push(this._assessEmail(contact, rawText));

            // 2. Phone Number (2 pts)
            details.push(this._assessPhone(contact, rawText, region));

            // 3. LinkedIn URL (2 pts)
            details.push(this._assessLinkedIn(contact, rawText));

            // 4. Location (1 pt)
            details.push(this._assessLocation(contact, rawText, region));

            // 5. Portfolio/Website (1 pt)
            details.push(this._assessPortfolio(contact, rawText));

            // 6. Name Detection (1 pt)
            details.push(this._assessName(contact, cvData));

            const totalScore = details.reduce(function (sum, d) { return sum + d.points; }, 0);

            return {
                score: Math.max(0, totalScore),
                maxScore: this.maxScore,
                details: details
            };
        }

        _assessEmail(contact, rawText) {
            const maxPoints = 3;
            const emailField = (contact.email || '').trim().toLowerCase();
            const textLower = rawText.toLowerCase();

            // Try to find email in raw text if not in structured data
            const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
            const emails = emailField ? [emailField] : (rawText.match(emailRegex) || []);

            if (emails.length === 0) {
                return {
                    criterion: 'Professional Email',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'No email address detected. An email is the most critical contact method on a CV.'
                };
            }

            const email = emails[0].toLowerCase();
            let points = maxPoints;
            const issues = [];

            // Check for unprofessional email providers
            const unprofessionalDomains = ['yahoo.com', 'aol.com', 'hotmail.com', 'live.com', 'ymail.com', 'rocketmail.com', 'mail.ru'];
            const domain = email.split('@')[1] || '';
            if (unprofessionalDomains.indexOf(domain) !== -1) {
                issues.push('Using ' + domain + ' appears dated. Consider a Gmail or custom domain email.');
                points -= 1;
            }

            // Check for numbers in email (often childish)
            const localPart = email.split('@')[0] || '';
            const numberCount = (localPart.match(/\d/g) || []).length;
            if (numberCount > 3) {
                issues.push('Excessive numbers in email local part. Use a name-based email (firstname.lastname@...).');
                points -= 1;
            }

            // Check for unprofessional name patterns
            const unprofessionalPatterns = [
                /sexy/i, /hot/i, /babe/i, /cool/i, /xxx/i, /420/i, /69\b/,
                /princess/i, /angel/i, /devil/i, /killer/i, /ninja/i,
                /gamer/i, /swag/i, /yolo/i, /lol/i, /omg/i,
                /cutie/i, /sweetie/i, /baby/i, /love/i, /queen/i, /king\d/i
            ];

            for (let i = 0; i < unprofessionalPatterns.length; i++) {
                if (unprofessionalPatterns[i].test(localPart)) {
                    issues.push('Email address contains unprofessional terms. Use a formal firstname.lastname format.');
                    points -= 2;
                    break;
                }
            }

            // Check for firstname.lastname format (good practice)
            if (/^[a-z]+[._][a-z]+@/.test(email)) {
                // Good format, no deduction
            } else if (points === maxPoints) {
                // Only note if no other issues
                issues.push('Consider using firstname.lastname format for a more professional appearance.');
            }

            points = Math.max(0, points);

            return {
                criterion: 'Professional Email',
                passed: points >= 2,
                points: points,
                maxPoints: maxPoints,
                explanation: issues.length > 0 ? issues.join(' ') : 'Professional email address detected with appropriate format.'
            };
        }

        _assessPhone(contact, rawText, region) {
            const maxPoints = 2;
            const phone = (contact.phone || '').trim();

            // Try finding phone in raw text
            const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
            const phones = phone ? [phone] : (rawText.match(phoneRegex) || []);

            if (phones.length === 0) {
                return {
                    criterion: 'Phone Number',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'No phone number detected. Include a phone number for direct recruiter contact.'
                };
            }

            const detectedPhone = phones[0];
            let points = maxPoints;
            const issues = [];

            // Check for country code
            const hasCountryCode = /^\+\d{1,3}/.test(detectedPhone.trim());
            if (!hasCountryCode) {
                issues.push('No country code detected. Include country code (e.g., +1, +44) for international readability.');
                points -= 1;
            }

            if (issues.length === 0) {
                return {
                    criterion: 'Phone Number',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Phone number detected with proper country code formatting.'
                };
            }

            return {
                criterion: 'Phone Number',
                passed: points >= 1,
                points: Math.max(0, points),
                maxPoints: maxPoints,
                explanation: issues.join(' ')
            };
        }

        _assessLinkedIn(contact, rawText) {
            const maxPoints = 2;
            const linkedin = (contact.linkedin || '').trim();
            const textLower = rawText.toLowerCase();

            const hasLinkedIn = linkedin.length > 0 ||
                textLower.indexOf('linkedin.com/in/') !== -1 ||
                textLower.indexOf('linkedin.com/pub/') !== -1 ||
                /linkedin\s*:\s*\S+/i.test(rawText);

            if (!hasLinkedIn) {
                return {
                    criterion: 'LinkedIn Profile',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'No LinkedIn profile URL detected. LinkedIn is expected on modern professional CVs and is heavily used by recruiters.'
                };
            }

            let points = maxPoints;

            // Check if it's a custom URL (not default numbers)
            const linkedinUrl = linkedin || (rawText.match(/linkedin\.com\/in\/[\w\-]+/i) || [''])[0];
            if (linkedinUrl && /linkedin\.com\/in\/[\w\-]{3,}$/i.test(linkedinUrl)) {
                return {
                    criterion: 'LinkedIn Profile',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'LinkedIn profile URL detected with a customized profile slug.'
                };
            }

            return {
                criterion: 'LinkedIn Profile',
                passed: true,
                points: 1,
                maxPoints: maxPoints,
                explanation: 'LinkedIn presence detected. Consider using a customized LinkedIn URL (linkedin.com/in/yourname) for a professional look.'
            };
        }

        _assessLocation(contact, rawText, region) {
            const maxPoints = 1;
            const location = (contact.location || contact.city || contact.address || '').trim();

            // Look for city/state patterns in text
            const hasLocation = location.length > 0 ||
                /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(rawText) || // City, ST (US)
                /\b[A-Z][a-z]+,\s*[A-Z][a-z]+\b/.test(rawText) || // City, Country
                /\b\d{5}(?:-\d{4})?\b/.test(rawText) || // ZIP code
                /\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}\b/.test(rawText); // UK postcode

            if (!hasLocation) {
                let explanation = 'No location detected. ';
                if (region === 'US') {
                    explanation += 'Include city and state. Full address is not needed in the US.';
                } else if (region === 'ASIA') {
                    explanation += 'Include full location. Some Asian employers expect detailed address information.';
                } else {
                    explanation += 'Include at least your city and country for recruiter context.';
                }

                return {
                    criterion: 'Location',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: explanation
                };
            }

            return {
                criterion: 'Location',
                passed: true,
                points: maxPoints,
                maxPoints: maxPoints,
                explanation: 'Location information detected. Recruiters can assess geographical fit.'
            };
        }

        _assessPortfolio(contact, rawText) {
            const maxPoints = 1;
            const portfolio = (contact.website || contact.portfolio || contact.github || '').trim();
            const textLower = rawText.toLowerCase();

            const hasPortfolio = portfolio.length > 0 ||
                /github\.com\/\w+/i.test(rawText) ||
                /gitlab\.com\/\w+/i.test(rawText) ||
                /bitbucket\.org\/\w+/i.test(rawText) ||
                /portfolio/i.test(rawText) ||
                /(?:https?:\/\/)?(?:www\.)?[\w\-]+\.(?:com|io|dev|me|net|org)(?:\/\S*)?/i.test(rawText) && textLower.indexOf('linkedin.com') === -1;

            if (!hasPortfolio) {
                return {
                    criterion: 'Portfolio / Website',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'No portfolio, website, or GitHub link detected. Adding one can differentiate you from other candidates.'
                };
            }

            return {
                criterion: 'Portfolio / Website',
                passed: true,
                points: maxPoints,
                maxPoints: maxPoints,
                explanation: 'Portfolio or professional website link detected.'
            };
        }

        _assessName(contact, cvData) {
            const maxPoints = 1;
            const name = (contact.name || contact.fullName || cvData.name || '').trim();
            const rawText = (cvData.rawText || '').trim();

            if (name.length > 0 && name.split(/\s+/).length >= 2) {
                return {
                    criterion: 'Full Name',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Full name detected with first and last name.'
                };
            }

            if (name.length > 0) {
                return {
                    criterion: 'Full Name',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Name detected, but only one name part found. Ensure both first and last name are prominent.'
                };
            }

            // Try to detect a name from the first few lines
            const firstLines = rawText.split(/\n/).slice(0, 5).join(' ');
            const possibleName = /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(firstLines.trim());

            if (possibleName) {
                return {
                    criterion: 'Full Name',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'A name pattern detected in the document header area.'
                };
            }

            return {
                criterion: 'Full Name',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'No clear name detected at the top of the CV. Your full name should be the most prominent element.'
            };
        }
    };

})();
