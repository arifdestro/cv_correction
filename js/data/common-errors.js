/**
 * COMMON ERRORS DATABASE
 * CV Assessment Pro - Scoring Engine
 * 
 * Contains common spelling errors, unprofessional phrases,
 * filler words, and overused buzzwords for CV assessment.
 */

(function () {
    'use strict';

    window.COMMON_SPELLING_ERRORS = {
        // Professional terms frequently misspelled
        'accomodate': 'accommodate',
        'acheive': 'achieve',
        'achievment': 'achievement',
        'acknowledgement': 'acknowledgment',
        'adress': 'address',
        'agressive': 'aggressive',
        'analisis': 'analysis',
        'analize': 'analyze',
        'apparantly': 'apparently',
        'assesment': 'assessment',
        'assistence': 'assistance',
        'begining': 'beginning',
        'beleive': 'believe',
        'buisness': 'business',
        'calender': 'calendar',
        'catagory': 'category',
        'collabarate': 'collaborate',
        'comittee': 'committee',
        'commited': 'committed',
        'competative': 'competitive',
        'concensus': 'consensus',
        'consistant': 'consistent',
        'corparate': 'corporate',
        'correspondance': 'correspondence',
        'curiculum': 'curriculum',
        'curriculem': 'curriculum',
        'definately': 'definitely',
        'dependant': 'dependent',
        'develope': 'develop',
        'developement': 'development',
        'diffrent': 'different',
        'effeciency': 'efficiency',
        'enviroment': 'environment',
        'excellant': 'excellent',
        'excercise': 'exercise',
        'exerience': 'experience',
        'experiance': 'experience',
        'foriegn': 'foreign',
        'goverment': 'government',
        'guage': 'gauge',
        'harrass': 'harass',
        'immediatly': 'immediately',
        'independant': 'independent',
        'judgement': 'judgment',
        'knowlege': 'knowledge',
        'liason': 'liaison',
        'maintenence': 'maintenance',
        'managment': 'management',
        'millenial': 'millennial',
        'mispell': 'misspell',
        'neccessary': 'necessary',
        'occassion': 'occasion',
        'occurence': 'occurrence',
        'oppurtunity': 'opportunity',
        'paralel': 'parallel',
        'performace': 'performance',
        'persue': 'pursue',
        'posession': 'possession',
        'prescence': 'presence',
        'privledge': 'privilege',
        'proccess': 'process',
        'proffesional': 'professional',
        'profesional': 'professional',
        'proficiant': 'proficient',
        'programing': 'programming',
        'recomend': 'recommend',
        'recieve': 'receive',
        'refered': 'referred',
        'relevent': 'relevant',
        'reponsible': 'responsible',
        'responsibilty': 'responsibility',
        'resposible': 'responsible',
        'restaraunt': 'restaurant',
        'resumee': 'resume',
        'seperate': 'separate',
        'strenght': 'strength',
        'succesful': 'successful',
        'successfull': 'successful',
        'sufficent': 'sufficient',
        'sumary': 'summary',
        'superseede': 'supersede',
        'techincal': 'technical',
        'thier': 'their',
        'transfered': 'transferred',
        'untill': 'until',
        'withing': 'within',
        'writting': 'writing'
    };

    window.UNPROFESSIONAL_PHRASES = [
        // Casual / informal
        'a lot of', 'lots of', 'tons of', 'bunch of', 'kind of', 'sort of',
        'pretty much', 'more or less', 'stuff like that', 'things like that',
        'and so on', 'etc etc', 'blah blah', 'yada yada',
        'no brainer', 'piece of cake', 'walk in the park',
        'hit the ground running', 'think outside the box',
        'gave 110%', 'gave 100%', 'work hard play hard',
        'people person', 'go-getter', 'self-starter',
        'team player', 'hard worker', 'fast learner',
        'detail oriented', 'detail-oriented',
        'results driven', 'results-driven',
        // References to personal matters
        'references available upon request',
        'references available on request',
        'references upon request',
        'salary negotiable', 'salary expected',
        'willing to relocate', 'open to relocation',
        // Outdated phrases
        'to whom it may concern',
        'dear sir or madam', 'dear sir/madam',
        'hereby', 'herewith', 'aforementioned',
        'please do not hesitate',
        'thanking you in advance',
        'looking forward to hearing from you',
        // Vague/filler
        'various responsibilities', 'various tasks',
        'multiple duties', 'day-to-day operations',
        'as needed', 'as required', 'when necessary'
    ];

    window.FILLER_WORDS = [
        'very', 'really', 'actually', 'basically', 'essentially',
        'literally', 'virtually', 'simply', 'just', 'quite',
        'rather', 'somewhat', 'fairly', 'pretty', 'truly',
        'extremely', 'incredibly', 'remarkably', 'absolutely',
        'obviously', 'clearly', 'certainly', 'definitely',
        'perhaps', 'maybe', 'possibly', 'probably',
        // Indonesian fillers
        'sangat', 'sekali', 'benar-benar', 'pada dasarnya',
        'cukup', 'lumayan', 'sepertinya', 'mungkin',
        'also', 'furthermore', 'moreover', 'additionally',
        'honestly', 'frankly', 'in fact', 'as a matter of fact',
        'needless to say', 'it goes without saying'
    ];

    window.BUZZWORDS = [
        'synergy', 'synergize', 'leverage', 'paradigm', 'paradigm shift',
        'disrupt', 'disruptive', 'innovative', 'cutting-edge', 'bleeding-edge',
        'best-in-class', 'world-class', 'next-generation', 'state-of-the-art',
        'guru', 'ninja', 'rockstar', 'wizard', 'evangelist',
        'thought leader', 'visionary', 'game-changer', 'trailblazer',
        'deep dive', 'move the needle', 'circle back', 'pivot',
        'scalable', 'holistic', 'robust', 'agile', 'dynamic',
        'proactive', 'strategic', 'passionate', 'driven',
        'value-added', 'value-add', 'stakeholder', 'ecosystem',
        'bandwidth', 'touch base', 'low-hanging fruit', 'drill down',
        'boil the ocean', 'blue-sky thinking', 'growth hacking',
        // Indonesian buzzwords
        'pekerja keras', 'cepat belajar', 'pemain tim',
        'berorientasi pada detail', 'berorientasi pada hasil',
        'siap bekerja di bawah tekanan', 'bertanggung jawab'
    ];

    // Build lookup sets for fast detection
    window.COMMON_SPELLING_ERRORS_SET = new Set(Object.keys(window.COMMON_SPELLING_ERRORS));

    window.UNPROFESSIONAL_PHRASES_LOWER = window.UNPROFESSIONAL_PHRASES.map(function (p) {
        return p.toLowerCase();
    });

    window.FILLER_WORDS_LOWER = window.FILLER_WORDS.map(function (w) {
        return w.toLowerCase();
    });

    window.BUZZWORDS_LOWER = window.BUZZWORDS.map(function (b) {
        return b.toLowerCase();
    });

})();
