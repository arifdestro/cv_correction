/**
 * SKILLS SCORER
 * CV Assessment Pro - Scoring Engine
 * 
 * Evaluates skills section quality, categorization, and specificity.
 * Maximum Score: 10 points
 */

(function () {
    'use strict';

    window.SkillsScorer = class SkillsScorer {
        constructor() {
            this.maxScore = 10;
            this.name = 'Skills';
            this.icon = '🛠️';
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
            const skills = cvData.skills || [];

            const skillsText = this._findSkillsText(sections, rawText);

            // 1. Skills Section Exists (2 pts)
            details.push(this._assessExistence(skillsText, skills));

            // 2. Hard Skills Present (2 pts)
            details.push(this._assessHardSkills(skillsText, skills));

            // 3. Soft Skills Present (1 pt)
            details.push(this._assessSoftSkills(skillsText, skills));

            // 4. Skills Categorized/Grouped (2 pts)
            details.push(this._assessCategorization(skillsText, sections));

            // 5. Not Over-listing (1 pt)
            details.push(this._assessSkillCount(skillsText, skills));

            // 6. No Vague Skills (1 pt)
            details.push(this._assessVagueSkills(skillsText));

            // 7. Technical Specificity (1 pt)
            details.push(this._assessTechnicalSpecificity(skillsText));

            const totalScore = details.reduce(function (sum, d) { return sum + d.points; }, 0);

            return {
                score: Math.max(0, totalScore),
                maxScore: this.maxScore,
                details: details
            };
        }

        _findSkillsText(sections, rawText) {
            const skillKeys = ['skills', 'technical skills', 'core competencies',
                'competencies', 'key skills', 'areas of expertise',
                'technologies', 'tools', 'proficiencies', 'capabilities',
                'technical proficiencies', 'skill set'];

            for (var key in sections) {
                var keyLower = key.toLowerCase().trim();
                for (var i = 0; i < skillKeys.length; i++) {
                    if (keyLower.indexOf(skillKeys[i]) !== -1 || skillKeys[i].indexOf(keyLower) !== -1) {
                        var content = sections[key];
                        if (typeof content === 'string') return content.trim();
                        if (Array.isArray(content)) return content.join('\n').trim();
                        if (typeof content === 'object' && content.text) return content.text.trim();
                        return '';
                    }
                }
            }

            var skillMatch = rawText.match(/(?:skills|competencies|technologies|proficiencies)[:\s]*\n([\s\S]*?)(?:\n\s*(?:experience|education|certif|project|work|employment|language|interest|reference|awards?|summary|profile)\s*[:\n]|$)/i);
            if (skillMatch && skillMatch[1]) return skillMatch[1].trim();
            return '';
        }

        _assessExistence(skillsText, skills) {
            const maxPoints = 2;

            if ((!skillsText || skillsText.length < 10) && skills.length === 0) {
                return {
                    criterion: 'Skills Section Exists',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'No skills section detected. A dedicated skills section is essential for ATS matching and quick recruiter scanning.'
                };
            }

            if (skillsText && skillsText.length < 30 && skills.length === 0) {
                return {
                    criterion: 'Skills Section Exists',
                    passed: true,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Skills section found but appears very brief. Expand with both hard and soft skills relevant to your target role.'
                };
            }

            return {
                criterion: 'Skills Section Exists',
                passed: true,
                points: maxPoints,
                maxPoints: maxPoints,
                explanation: 'Skills section detected with content.'
            };
        }

        _assessHardSkills(skillsText, skills) {
            const maxPoints = 2;

            if (!skillsText || skillsText.length < 10) {
                return {
                    criterion: 'Hard Skills',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no skills content found.'
                };
            }

            const hardSkillPatterns = [
                // Programming & Tech
                /\b(?:Python|Java(?:Script)?|C\+\+|C#|Ruby|Go(?:lang)?|Rust|Swift|Kotlin|PHP|R\b|TypeScript|Scala|Perl|MATLAB)\b/i,
                /\b(?:React|Angular|Vue|Node\.?js|Express|Django|Flask|Spring|Laravel|Rails|\.NET|Next\.?js|Svelte)\b/i,
                /\b(?:SQL|MySQL|PostgreSQL|MongoDB|Oracle|Redis|Elasticsearch|DynamoDB|Cassandra|Firebase)\b/i,
                /\b(?:AWS|Azure|GCP|Docker|Kubernetes|Terraform|Jenkins|CircleCI|GitHub Actions|Ansible)\b/i,
                /\b(?:Git|Linux|Unix|Bash|PowerShell|REST|GraphQL|API|Microservices|CI\/CD)\b/i,
                // Design & Creative
                /\b(?:Photoshop|Illustrator|Figma|Sketch|InDesign|After Effects|Premiere|AutoCAD|SolidWorks|Blender)\b/i,
                /\b(?:HTML|CSS|SASS|LESS|Bootstrap|Tailwind|Webpack|Vite)\b/i,
                // Data & Analytics
                /\b(?:Tableau|Power BI|Looker|Excel|SPSS|SAS|Hadoop|Spark|Pandas|NumPy|TensorFlow|PyTorch|Scikit)\b/i,
                /\b(?:Machine Learning|Deep Learning|NLP|Computer Vision|Data Science|Data Analysis|Big Data|ETL|Data Pipeline)\b/i,
                // Business & Finance
                /\b(?:SAP|Salesforce|QuickBooks|Jira|Confluence|Asana|Trello|Monday\.com|HubSpot|Marketo)\b/i,
                /\b(?:Financial Modeling|Budgeting|Forecasting|Risk Assessment|Compliance|Audit|Accounting|GAAP|IFRS)\b/i,
                // Other professional
                /\b(?:Project Management|Agile|Scrum|Kanban|Waterfall|Six Sigma|Lean|PMP|PRINCE2)\b/i,
                /\b(?:SEO|SEM|Google Analytics|Content Marketing|Email Marketing|Social Media Marketing|CRM|A\/B Testing)\b/i
            ];

            const textLower = skillsText.toLowerCase();
            let hardSkillCount = 0;
            const foundSkills = [];

            hardSkillPatterns.forEach(function (pattern) {
                const matches = skillsText.match(pattern);
                if (matches) {
                    hardSkillCount += matches.length;
                    if (foundSkills.length < 8) {
                        foundSkills.push(matches[0]);
                    }
                }
            });

            if (hardSkillCount >= 5) {
                return {
                    criterion: 'Hard Skills',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Strong hard skills presence (' + hardSkillCount + ' technical/professional skills detected including ' + foundSkills.slice(0, 5).join(', ') + ').'
                };
            }

            if (hardSkillCount >= 2) {
                return {
                    criterion: 'Hard Skills',
                    passed: true,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Some hard skills detected (' + foundSkills.join(', ') + ') but consider listing more specific technical skills relevant to your field.'
                };
            }

            return {
                criterion: 'Hard Skills',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'Insufficient hard/technical skills detected. List specific tools, technologies, frameworks, and methodologies you are proficient in.'
            };
        }

        _assessSoftSkills(skillsText, skills) {
            const maxPoints = 1;

            if (!skillsText || skillsText.length < 10) {
                return {
                    criterion: 'Soft Skills',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no skills content found.'
                };
            }

            const softSkillPatterns = /\b(?:leadership|communication|collaboration|problem[- ]solving|critical thinking|time management|strategic planning|negotiation|conflict resolution|decision[- ]making|mentoring|coaching|presentation|stakeholder management|cross[- ]functional|team management|adaptability|creativity|analytical|organizational|interpersonal|kepemimpinan|komunikasi|kolaborasi|pemecahan\s*masalah|berpikir\s*kritis|manajemen\s*waktu|perencanaan\s*strategis|negosiasi|penyelesaian\s*konflik|pengambilan\s*keputusan|presentasi|kreativitas|analitis|organisasi|interpersonal|adaptasi|kerja\s*sama)\b/i;

            const matches = skillsText.match(new RegExp(softSkillPatterns.source, 'gi')) || [];

            if (matches.length >= 2) {
                return {
                    criterion: 'Soft Skills',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Soft skills detected (' + matches.slice(0, 4).join(', ') + '). Balance of hard and soft skills shows well-rounded candidacy.'
                };
            }

            if (matches.length === 1) {
                return {
                    criterion: 'Soft Skills',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Some soft skills detected (' + matches[0] + '). Consider adding 2-3 more relevant soft skills.'
                };
            }

            return {
                criterion: 'Soft Skills',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'No soft skills detected. Include professional soft skills like leadership, communication, problem-solving, or strategic planning—but demonstrate them, don\'t just list them.'
            };
        }

        _assessCategorization(skillsText, sections) {
            const maxPoints = 2;

            if (!skillsText || skillsText.length < 10) {
                return {
                    criterion: 'Skills Categorization',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no skills content found.'
                };
            }

            // Check for category headers or groupings
            const categoryPatterns = [
                /\b(?:Programming|Languages?|Frameworks?|Databases?|Tools?|Platforms?|Cloud|DevOps|Design|Testing|Analytics|Methodologies|Operating Systems?|Software|Hardware|Certifications?)\s*[:|-]/gi,
                /\b(?:Technical|Professional|Core|Key|Soft|Hard|Business|Domain|Industry)\s+(?:Skills?|Competencies?|Expertise)\s*[:|-]/gi
            ];

            let categoryCount = 0;
            categoryPatterns.forEach(function (pattern) {
                const matches = skillsText.match(pattern) || [];
                categoryCount += matches.length;
            });

            // Also check for line-based categorization (label: items, items, items)
            const categorizedLines = skillsText.split(/\n/).filter(function (line) {
                return /^[A-Za-z\s]+[:|-]\s*.{10,}/.test(line.trim());
            });

            categoryCount += categorizedLines.length;

            // Check for multiple skill sections in sections object
            const skillRelatedSections = Object.keys(sections).filter(function (key) {
                return /skill|competenc|technolog|tool|proficienc/i.test(key);
            });

            if (skillRelatedSections.length > 1) {
                categoryCount += skillRelatedSections.length;
            }

            if (categoryCount >= 3) {
                return {
                    criterion: 'Skills Categorization',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Skills are well-categorized into ' + categoryCount + ' groups. Organized skills sections help recruiters find relevant competencies quickly.'
                };
            }

            if (categoryCount >= 1) {
                return {
                    criterion: 'Skills Categorization',
                    passed: true,
                    points: 1,
                    maxPoints: maxPoints,
                    explanation: 'Some skill categorization detected (' + categoryCount + ' group(s)). Further categorize into groups like "Languages", "Frameworks", "Tools", "Methodologies" for better scannability.'
                };
            }

            return {
                criterion: 'Skills Categorization',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'Skills appear as an unorganized list without categories. Group skills into logical categories (e.g., "Programming Languages: Python, Java | Frameworks: React, Django | Tools: Docker, Git").'
            };
        }

        _assessSkillCount(skillsText, skills) {
            const maxPoints = 1;

            if (!skillsText || skillsText.length < 10) {
                return {
                    criterion: 'Skill Count',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no skills content found.'
                };
            }

            // Estimate skill count from text
            // Count comma-separated items, bullet items, and pipe-separated items
            const commaItems = skillsText.split(/[,;|•·]/).filter(function (item) {
                return item.trim().length > 1 && item.trim().length < 50;
            });

            const bulletItems = skillsText.split(/\n/).filter(function (line) {
                const t = line.trim();
                return t.length > 1 && (t.length < 50 || /^[-–—•●◦▪►▸→➤>*]\s/.test(t));
            });

            const estimatedCount = Math.max(commaItems.length, bulletItems.length, skills.length);

            if (estimatedCount > 40) {
                return {
                    criterion: 'Skill Count',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Way too many skills listed (~' + estimatedCount + '). This looks like keyword stuffing. Limit to 15-25 highly relevant skills. Quality signals expertise; quantity signals desperation.'
                };
            }

            if (estimatedCount > 25) {
                return {
                    criterion: 'Skill Count',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Too many skills listed (~' + estimatedCount + '). Trim to 15-25 most relevant and strongest skills. Listing everything dilutes your expertise.'
                };
            }

            if (estimatedCount < 3) {
                return {
                    criterion: 'Skill Count',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Very few skills listed (~' + estimatedCount + '). Add more relevant skills to fill out this section (8-20 is typical).'
                };
            }

            return {
                criterion: 'Skill Count',
                passed: true,
                points: maxPoints,
                maxPoints: maxPoints,
                explanation: 'Appropriate number of skills listed (~' + estimatedCount + '). Good balance between comprehensive and focused.'
            };
        }

        _assessVagueSkills(skillsText) {
            const maxPoints = 1;

            if (!skillsText || skillsText.length < 10) {
                return {
                    criterion: 'No Vague Skills',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no skills content found.'
                };
            }

            const vagueSkills = [
                'team player', 'hard worker', 'fast learner', 'quick learner',
                'self-motivated', 'self-starter', 'go-getter', 'people person',
                'multitasker', 'detail-oriented', 'detail oriented',
                'results-driven', 'results driven', 'highly motivated',
                'strong work ethic', 'good communicator', 'reliable',
                'responsible', 'dedicated', 'passionate', 'enthusiastic',
                'flexible', 'proactive', 'dynamic', 'synergistic',
                'microsoft office', 'ms office', 'email', 'internet',
                'typing', 'computer skills', 'basic computer',
                'social media', 'microsoft word', 'microsoft excel'
            ];

            const skillsLower = skillsText.toLowerCase();
            const foundVague = vagueSkills.filter(function (vs) {
                return skillsLower.indexOf(vs) !== -1;
            });

            if (foundVague.length === 0) {
                return {
                    criterion: 'No Vague Skills',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'No vague or generic skills detected. Skills appear specific and professional.'
                };
            }

            return {
                criterion: 'No Vague Skills',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'Vague/generic skills detected: "' + foundVague.slice(0, 4).join('", "') + '". These are either expected by default or too vague to be meaningful. Replace with specific, demonstrable skills.'
            };
        }

        _assessTechnicalSpecificity(skillsText) {
            const maxPoints = 1;

            if (!skillsText || skillsText.length < 10) {
                return {
                    criterion: 'Technical Specificity',
                    passed: false,
                    points: 0,
                    maxPoints: maxPoints,
                    explanation: 'Cannot assess—no skills content found.'
                };
            }

            // Look for version numbers, proficiency levels, or specifics
            const specificityIndicators = [
                /\b(?:v\d+|\d+\.\d+|ES\d+|Python\s*[23]|Java\s*\d+|\.NET\s*\d+|React\s*\d+|Angular\s*\d+|Node\s*\d+)\b/i,
                /\b(?:advanced|intermediate|beginner|proficient|expert|fluent|native|working knowledge|hands-on|mahir|menengah|pemula|berpengalaman|ahli)\b/i,
                /\b(?:\d+\+?\s*(?:years?|tahun))\b/i,
                /\b(?:AWS\s+(?:EC2|S3|Lambda|RDS|CloudFormation|ECS|EKS))\b/i,
                /\b(?:certified|licensed|accredited|tersertifikasi|bersertifikat|lisensi)\b/i
            ];

            let specificityCount = 0;
            specificityIndicators.forEach(function (pattern) {
                if (pattern.test(skillsText)) specificityCount++;
            });

            if (specificityCount >= 2) {
                return {
                    criterion: 'Technical Specificity',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Skills include specific details (versions, proficiency levels, or certifications). This demonstrates genuine expertise rather than surface-level familiarity.'
                };
            }

            if (specificityCount === 1) {
                return {
                    criterion: 'Technical Specificity',
                    passed: true,
                    points: maxPoints,
                    maxPoints: maxPoints,
                    explanation: 'Some skill specificity detected. Consider adding proficiency levels or specific versions/sub-tools for more skills.'
                };
            }

            return {
                criterion: 'Technical Specificity',
                passed: false,
                points: 0,
                maxPoints: maxPoints,
                explanation: 'Skills lack specificity. Instead of generic "Python", specify "Python 3 (Pandas, NumPy, Flask)". Instead of "Cloud", specify "AWS (EC2, S3, Lambda)". Specificity shows depth of knowledge.'
            };
        }
    };

})();
