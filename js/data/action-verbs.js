/**
 * ACTION VERBS DATABASE
 * CV Assessment Pro - Scoring Engine
 * 
 * Contains categorized strong action verbs for CV assessment
 * and weak/passive verbs that should be penalized.
 */

(function () {
    'use strict';

    window.ACTION_VERBS = {
        leadership: [
            'spearheaded', 'orchestrated', 'championed', 'directed', 'oversaw',
            'supervised', 'mentored', 'delegated', 'mobilized', 'pioneered',
            'established', 'founded', 'instituted', 'launched', 'led',
            'managed', 'headed', 'governed', 'steered', 'guided',
            'coordinated', 'administered', 'chaired', 'commanded', 'cultivated',
            'empowered', 'enabled', 'fostered', 'inspired', 'motivated',
            'navigated', 'shaped', 'transformed', 'unified', 'galvanized'
        ],

        achievement: [
            'achieved', 'surpassed', 'exceeded', 'outperformed', 'accomplished',
            'attained', 'delivered', 'earned', 'completed', 'realized',
            'maximized', 'optimized', 'improved', 'enhanced', 'elevated',
            'amplified', 'boosted', 'accelerated', 'advanced', 'doubled',
            'tripled', 'quadrupled', 'generated', 'produced', 'yielded',
            'gained', 'secured', 'won', 'captured', 'clinched',
            'succeeded', 'mastered', 'perfected', 'excelled', 'topped'
        ],

        communication: [
            'presented', 'articulated', 'communicated', 'conveyed', 'persuaded',
            'negotiated', 'advocated', 'authored', 'briefed', 'collaborated',
            'corresponded', 'counseled', 'demonstrated', 'educated', 'facilitated',
            'influenced', 'interpreted', 'lectured', 'mediated', 'moderated',
            'promoted', 'publicized', 'reconciled', 'reported', 'translated',
            'documented', 'drafted', 'edited', 'published', 'addressed',
            'clarified', 'composed', 'consulted', 'engaged', 'liaised'
        ],

        technical: [
            'engineered', 'developed', 'programmed', 'coded', 'architected',
            'automated', 'built', 'configured', 'customized', 'debugged',
            'deployed', 'designed', 'digitized', 'implemented', 'integrated',
            'maintained', 'migrated', 'modernized', 'overhauled', 'refactored',
            'reengineered', 'resolved', 'standardized', 'streamlined', 'troubleshot',
            'upgraded', 'validated', 'tested', 'prototyped', 'assembled',
            'calibrated', 'computed', 'fabricated', 'installed', 'operated'
        ],

        research: [
            'analyzed', 'assessed', 'audited', 'benchmarked', 'calculated',
            'charted', 'classified', 'compared', 'compiled', 'critiqued',
            'diagnosed', 'discovered', 'evaluated', 'examined', 'experimented',
            'explored', 'extracted', 'forecasted', 'formulated', 'identified',
            'inspected', 'interpreted', 'investigated', 'mapped', 'measured',
            'modeled', 'monitored', 'observed', 'projected', 'quantified',
            'researched', 'reviewed', 'sampled', 'studied', 'surveyed',
            'synthesized', 'tabulated', 'tracked', 'verified', 'tested'
        ],

        creative: [
            'conceptualized', 'created', 'crafted', 'curated', 'customized',
            'designed', 'devised', 'envisioned', 'fashioned', 'illustrated',
            'imagined', 'initiated', 'innovated', 'introduced', 'invented',
            'originated', 'revamped', 'revitalized', 'shaped', 'visualized',
            'brainstormed', 'composed', 'constructed', 'generated', 'ideated',
            'reimagined', 'renovated', 'restyled', 'sketched', 'styled'
        ],

        financial: [
            'allocated', 'appraised', 'balanced', 'budgeted', 'calculated',
            'conserved', 'decreased', 'eliminated', 'estimated', 'financed',
            'forecasted', 'funded', 'invested', 'marketed', 'minimized',
            'netted', 'offset', 'projected', 'profited', 'reduced',
            'restructured', 'returned', 'saved', 'secured', 'slashed',
            'consolidated', 'divested', 'leveraged', 'liquidated', 'monetized'
        ],

        organizational: [
            'arranged', 'cataloged', 'categorized', 'centralized', 'collected',
            'consolidated', 'distributed', 'executed', 'expedited', 'facilitated',
            'filed', 'formalized', 'incorporated', 'logged', 'mapped',
            'merged', 'organized', 'planned', 'prepared', 'prioritized',
            'processed', 'recorded', 'reorganized', 'scheduled', 'simplified',
            'sorted', 'structured', 'systematized', 'unified', 'updated',
            'coordinated', 'dispatched', 'routed', 'tabulated', 'verified'
        ]
    };

    // Flat set of all strong verbs for quick lookup
    window.ALL_ACTION_VERBS_SET = new Set();
    Object.values(window.ACTION_VERBS).forEach(function (verbs) {
        verbs.forEach(function (verb) {
            window.ALL_ACTION_VERBS_SET.add(verb.toLowerCase());
        });
    });

    window.WEAK_VERBS = [
        'helped', 'assisted', 'did', 'worked', 'was responsible for',
        'responsible for', 'was in charge of', 'in charge of', 'handled',
        'dealt with', 'involved in', 'was involved in', 'participated in',
        'was part of', 'tried', 'attempted', 'sought to', 'endeavored',
        'utilized', 'used', 'made', 'got', 'went',
        'had', 'took', 'put', 'ran', 'saw',
        'knew', 'felt', 'thought', 'said', 'told',
        'showed', 'gave', 'kept', 'began', 'started',
        'performed duties', 'tasked with', 'duties included',
        'contributed to', 'played a role in', 'was exposed to'
    ];

    window.WEAK_VERBS_SET = new Set(window.WEAK_VERBS.map(function (v) { return v.toLowerCase(); }));

})();
