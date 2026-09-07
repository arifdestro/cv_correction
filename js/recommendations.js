/* ============================================
   CV Assessment Pro — Recommendations Engine
   Generates actionable, prioritized
   recommendations from scoring results
   ============================================ */

window.RecommendationsEngine = class RecommendationsEngine {

  // ── Generate Recommendations ──────────────────

  generate(results) {
    const isID = results.region === 'ID';
    const t = (en, id) => isID ? id : en;

    const recs = [];
    const cats = {};

    // Index categories by name for quick access
    if (results.categories) {
      results.categories.forEach(c => { cats[c.name] = c; });
    }

    const cvData = results.cvData || {};
    const rawText = cvData.rawText || '';
    const sections = cvData.sections || {};
    const wordCount = cvData.wordCount || 0;

    // ── Critical Recommendations ──────────────

    // Very short CV
    if (wordCount > 0 && wordCount < 150) {
      recs.push({
        priority: 'critical',
        category: 'Content',
        title: t('Your CV is critically short', 'CV Anda terlalu singkat'),
        body: `Your CV contains only ~${wordCount} words. Most successful resumes have 400–700 words. A very short CV signals to recruiters that you lack experience or haven't invested effort. Add more detail to your work experience, skills, and achievements.`,
        icon: '🚨'
      });
    }

    // Missing experience section
    if (!sections.experience || sections.experience.trim().length < 30) {
      recs.push({
        priority: 'critical',
        category: 'Work Experience',
        title: t('Add a Work Experience section', 'Tambahkan bagian Pengalaman Kerja'),
        body: t('Your CV appears to be missing a dedicated Work Experience section. This is the single most important section recruiters look for. Include your job titles, company names, dates, and bullet-pointed achievements for each role.', 'CV Anda tampaknya tidak memiliki bagian Pengalaman Kerja. Ini adalah bagian paling penting yang dicari oleh HRD. Cantumkan jabatan, nama perusahaan, tanggal, dan poin-poin pencapaian untuk setiap peran.'),
        icon: '💼'
      });
    }

    // No contact email
    if (!cvData.emails || cvData.emails.length === 0) {
      recs.push({
        priority: 'critical',
        category: 'Contact Information',
        title: t('Include an email address', 'Cantumkan alamat email'),
        body: t('No email address was detected. Without contact info, a recruiter literally cannot reach you. Place your professional email prominently at the top of your CV.', 'Tidak ada alamat email yang terdeteksi. Tanpa info kontak, HRD tidak akan bisa menghubungi Anda. Letakkan email profesional Anda di bagian atas CV.'),
        icon: '📧'
      });
    }

    // No phone number
    if (!cvData.phones || cvData.phones.length === 0) {
      recs.push({
        priority: 'critical',
        category: 'Contact Information',
        title: t('Add a phone number', 'Tambahkan nomor telepon'),
        body: t('No phone number was detected. Many recruiters prefer to call candidates directly. Include a mobile number with your country code.', 'Tidak ada nomor telepon yang terdeteksi. Banyak HRD lebih suka menelepon kandidat secara langsung. Cantumkan nomor HP Anda beserta kode negara.'),
        icon: '📱'
      });
    }

    // Missing education section
    if (!sections.education || sections.education.trim().length < 20) {
      recs.push({
        priority: 'critical',
        category: 'Education',
        title: t('Include your Education', 'Cantumkan Pendidikan Anda'),
        body: t('No education section was found. Even if you\'re self-taught, include relevant coursework, bootcamps, or certifications. For experienced professionals, a brief education section is still expected.', 'Tidak ada bagian pendidikan yang ditemukan. Walaupun Anda otodidak, cantumkan kursus, bootcamp, atau sertifikasi yang relevan. Untuk profesional yang sudah berpengalaman sekalipun, bagian pendidikan yang singkat tetap diharapkan.'),
        icon: '🎓'
      });
    }

    // ── Important Recommendations ─────────────

    // Missing skills section
    if (!sections.skills || sections.skills.trim().length < 15) {
      recs.push({
        priority: 'important',
        category: 'Skills',
        title: t('Add a dedicated Skills section', 'Tambahkan bagian Keahlian (Skills)'),
        body: t('A clear skills section helps both ATS systems and recruiters quickly assess your capabilities. List technical skills, tools, and methodologies. Group them into categories (e.g., "Programming: Python, JavaScript, SQL").', 'Bagian keahlian yang jelas membantu sistem ATS dan HRD menilai kemampuan Anda dengan cepat. Tuliskan keahlian teknis, alat, dan metodologi. Kelompokkan ke dalam kategori (misal: "Pemrograman: Python, JavaScript, SQL").'),
        icon: '🛠️'
      });
    }

    // No summary/objective
    if (!sections.summary || sections.summary.trim().length < 20) {
      recs.push({
        priority: 'important',
        category: 'Professional Summary',
        title: t('Write a Professional Summary', 'Tulis Profil Profesional (Summary)'),
        body: t('A 2–3 sentence summary at the top of your CV immediately tells the reader who you are and what value you bring. Example:\n\n✅ "Results-driven software engineer with 5+ years building scalable web applications. Expert in React and Node.js with a track record of reducing load times by 40%."\n\n❌ "Looking for a challenging position to utilize my skills."', 'Ringkasan 2–3 kalimat di bagian atas CV Anda akan langsung memberitahu pembaca siapa Anda dan nilai apa yang Anda bawa. Contoh:\n\n✅ "Software engineer berorientasi hasil dengan 5+ tahun pengalaman membangun aplikasi web skala besar. Ahli dalam React dan Node.js dengan rekam jejak mengurangi waktu muat sebesar 40%."\n\n❌ "Mencari posisi menantang untuk memanfaatkan keahlian saya."'),
        icon: '📝'
      });
    }

    // No action verbs
    const actionVerbs = ['led', 'managed', 'developed', 'created', 'designed', 'built', 'implemented', 'increased', 'decreased', 'reduced', 'improved', 'delivered', 'launched', 'spearheaded', 'orchestrated', 'achieved', 'generated', 'optimized', 'streamlined', 'established'];
    const textLower = rawText.toLowerCase();
    const foundVerbs = actionVerbs.filter(v => textLower.includes(v));
    if (foundVerbs.length < 3 && wordCount > 100) {
      recs.push({
        priority: 'important',
        category: 'Language',
        title: t('Use stronger action verbs', 'Gunakan kata kerja aktif yang kuat'),
        body: t('Your CV lacks impactful action verbs. Start each bullet point with a powerful verb:\n\n✅ "Spearheaded migration to cloud infrastructure, reducing costs by 35%"\n❌ "Was responsible for cloud migration"\n\nGreat verbs to use: Led, Developed, Implemented, Optimized, Delivered, Achieved, Generated, Streamlined.', 'CV Anda kekurangan kata kerja aktif yang berdampak. Awali setiap poin pengalaman dengan kata kerja yang kuat:\n\n✅ "Memimpin migrasi ke infrastruktur cloud, menghemat biaya hingga 35%"\n❌ "Bertanggung jawab atas migrasi cloud"\n\nKata kerja yang bagus digunakan: Memimpin, Mengembangkan, Mengimplementasikan, Mengoptimalkan, Menyelesaikan, Mencapai, Menghasilkan.'),
        icon: '💪'
      });
    }

    // No quantified results
    const hasNumbers = /\d+%|\$[\d,]+|\d+\+?\s*(users?|clients?|projects?|team|people|revenue|sales)/i.test(rawText);
    if (!hasNumbers && wordCount > 100) {
      recs.push({
        priority: 'important',
        category: 'Content Quality',
        title: t('Quantify your achievements', 'Kuantifikasi pencapaian Anda'),
        body: t('Your CV lacks measurable results. Numbers make your impact concrete and believable:\n\n✅ "Increased user engagement by 47% through A/B testing"\n✅ "Managed a team of 12 engineers across 3 time zones"\n✅ "Reduced customer support tickets by 30% with automated FAQ system"\n\n❌ "Improved user engagement"\n❌ "Managed a large team"', 'CV Anda kurang memiliki hasil yang terukur. Angka membuat dampak Anda menjadi konkret dan dapat dipercaya:\n\n✅ "Meningkatkan keterlibatan pengguna sebesar 47% melalui A/B testing"\n✅ "Memimpin tim berisi 12 engineer di 3 zona waktu"\n✅ "Mengurangi tiket keluhan pelanggan hingga 30% dengan sistem FAQ otomatis"\n\n❌ "Meningkatkan keterlibatan pengguna"\n❌ "Memimpin tim yang besar"'),
        icon: '📊'
      });
    }

    // No LinkedIn or URLs
    if (!cvData.urls || cvData.urls.length === 0) {
      recs.push({
        priority: 'important',
        category: 'Contact Information',
        title: t('Add your LinkedIn profile', 'Tambahkan profil LinkedIn Anda'),
        body: t('Over 87% of recruiters use LinkedIn to evaluate candidates. Include your LinkedIn URL (use a custom URL like linkedin.com/in/yourname). If relevant, also add a GitHub, portfolio, or personal website link.', 'Lebih dari 87% HRD menggunakan LinkedIn untuk mengevaluasi kandidat. Cantumkan URL LinkedIn Anda (gunakan URL kustom seperti linkedin.com/in/namaanda). Jika relevan, tambahkan juga link GitHub, portofolio, atau website pribadi.'),
        icon: '🔗'
      });
    }

    // Too many pages (by word count heuristic)
    if (wordCount > 1200) {
      recs.push({
        priority: 'important',
        category: 'Format',
        title: t('Consider shortening your CV', 'Pertimbangkan untuk mempersingkat CV Anda'),
        body: t(`Your CV is quite long (~${wordCount} words). For most professionals with under 10 years of experience, a 1-page resume (400–700 words) performs best. Focus on your most recent and relevant roles. Remove outdated skills and early-career positions.`, `CV Anda cukup panjang (~${wordCount} kata). Untuk profesional dengan pengalaman di bawah 10 tahun, CV 1 halaman (400–700 kata) adalah yang terbaik. Fokuslah pada pengalaman Anda yang paling baru dan relevan. Hapus keterampilan yang sudah usang dan posisi di awal karir.`),
        icon: '✂️'
      });
    }

    // ── Nice-to-Have Recommendations ──────────

    // No bullet points
    const bulletCount = cvData.bulletPoints ? cvData.bulletPoints.length : 0;
    if (bulletCount < 3 && wordCount > 200) {
      recs.push({
        priority: 'nice',
        category: 'Format',
        title: t('Use bullet points for readability', 'Gunakan poin (bullet points) agar mudah dibaca'),
        body: t('Bullet points make your CV scannable — recruiters spend an average of 7 seconds on initial review. Convert paragraph text into concise, impactful bullet points. Aim for 3–6 bullets per role.', 'Bullet points membuat CV Anda mudah dipindai — rata-rata HRD hanya menghabiskan 7 detik pada tinjauan awal. Ubah teks paragraf menjadi bullet points yang ringkas dan berdampak. Targetkan 3–6 poin untuk setiap peran/jabatan.'),
        icon: '📋'
      });
    }

    // No dates found
    if (!cvData.dates || cvData.dates.length === 0) {
      recs.push({
        priority: 'important',
        category: 'Content',
        title: t('Include dates for your roles', 'Cantumkan tanggal/tahun untuk pengalaman kerja Anda'),
        body: t('No employment dates were detected. Dates provide essential context about your career timeline. Use a consistent format like "Jan 2020 – Present" or "2018 – 2021". Gaps are less concerning than missing dates entirely.', 'Tidak ada tanggal bekerja yang terdeteksi. Tanggal memberikan konteks penting tentang lini masa karir Anda. Gunakan format yang konsisten seperti "Jan 2020 – Sekarang" atau "2018 – 2021". Celah/gap menganggur lebih tidak memusingkan dibandingkan tidak ada tanggal sama sekali.'),
        icon: '📅'
      });
    }

    // Suggest portfolio/GitHub
    const hasGithub = /github\.com/i.test(rawText);
    const hasPortfolio = /portfolio|personal\s*website/i.test(rawText);
    if (!hasGithub && !hasPortfolio) {
      recs.push({
        priority: 'nice',
        category: 'Online Presence',
        title: t('Add a portfolio or GitHub link', 'Tambahkan link portofolio atau GitHub'),
        body: t('For technical and creative roles, a portfolio or GitHub profile can set you apart. It shows real work, not just claims. Even 2–3 well-documented projects can make a strong impression.', 'Untuk peran teknis dan kreatif, profil portofolio atau GitHub dapat membuat Anda menonjol. Ini menunjukkan hasil kerja nyata, bukan sekadar klaim. Bahkan 2–3 proyek yang terdokumentasi dengan baik dapat memberikan kesan yang kuat.'),
        icon: '🌐'
      });
    }

    // Suggest skill categorization
    if (sections.skills && sections.skills.length > 100 && !/[:|\-–—]/.test(sections.skills.substring(0, 200))) {
      recs.push({
        priority: 'nice',
        category: 'Skills',
        title: t('Categorize your skills', 'Kategorikan keahlian (skills) Anda'),
        body: t('Grouping skills into categories improves readability and ATS matching:\n\n✅ "Languages: Python, JavaScript, TypeScript\nFrameworks: React, Django, Express\nTools: Docker, AWS, Git"\n\n❌ "Python JavaScript TypeScript React Django Express Docker AWS Git"', 'Mengelompokkan keterampilan ke dalam kategori akan meningkatkan keterbacaan dan kecocokan pada sistem ATS:\n\n✅ "Bahasa: Python, JavaScript, TypeScript\nFramework: React, Django, Express\nTools: Docker, AWS, Git"\n\n❌ "Python JavaScript TypeScript React Django Express Docker AWS Git"'),
        icon: '🗂️'
      });
    }

    // Keyword optimization
    recs.push({
      priority: 'nice',
      category: 'ATS Optimization',
      title: t('Tailor keywords to the job description', 'Sesuaikan kata kunci (keywords) dengan deskripsi pekerjaan'),
      body: t('ATS systems rank candidates by keyword match. Before applying, review the job posting and incorporate relevant keywords naturally into your experience and skills sections. Mirror the exact phrases used in the posting.', 'Sistem ATS memeringkat kandidat berdasarkan kecocokan kata kunci. Sebelum melamar, tinjau lowongan pekerjaan dan masukkan kata kunci yang relevan secara natural ke dalam bagian pengalaman dan keahlian Anda. Tiru frasa persis yang digunakan pada lowongan tersebut.'),
      icon: '🔑'
    });

    // Check category-level scores for additional recs
    if (cats['Format & Layout'] && cats['Format & Layout'].score < cats['Format & Layout'].maxScore * 0.5) {
      recs.push({
        priority: 'important',
        category: 'Format & Layout',
        title: t('Improve your CV formatting', 'Perbaiki format CV Anda'),
        body: t('Your format score is low. Use clear section headers, consistent spacing, a professional font (like Calibri, Arial, or Garamond), and adequate margins (0.5–1 inch). Avoid tables, images, and fancy templates that confuse ATS systems.', 'Skor format/layout Anda rendah. Gunakan judul bagian yang jelas, spasi yang konsisten, font profesional (seperti Calibri, Arial, atau Garamond), dan margin yang memadai (1.5–2.5 cm). Hindari tabel, gambar, dan desain templat yang rumit yang dapat membingungkan sistem ATS.'),
        icon: '📐'
      });
    }

    if (cats['Language & Writing'] && cats['Language & Writing'].score < cats['Language & Writing'].maxScore * 0.5) {
      recs.push({
        priority: 'important',
        category: 'Language & Writing',
        title: t('Fix grammar and language issues', 'Perbaiki tata bahasa dan penulisan'),
        body: t('Multiple language issues were detected. Spelling errors and grammar mistakes are among the top reasons recruiters reject CVs. Use a tool like Grammarly or have a friend proofread your document. Write in third person and use past tense for previous roles.', 'Beberapa masalah bahasa terdeteksi. Kesalahan ejaan dan tata bahasa adalah salah satu alasan utama HRD menolak CV. Gunakan alat seperti Grammarly (untuk bahasa Inggris) atau minta teman untuk membaca ulang dokumen Anda. Ingat untuk menulis tanpa kata ganti orang pertama (Saya/Aku).'),
        icon: '📖'
      });
    }

    // Sort: critical → important → nice
    const priorityOrder = { critical: 0, important: 1, nice: 2 };
    recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recs;
  }

  // ── Render Recommendations ────────────────────

  render(recommendations) {
    const container = document.getElementById('recommendations-list');
    if (!container) return;
    container.innerHTML = '';

    if (recommendations.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎉</div>
          <h3 class="empty-state-title">Excellent!</h3>
          <p class="empty-state-desc">No major issues detected. Your CV is in great shape.</p>
        </div>
      `;
      return;
    }

    recommendations.forEach((rec, index) => {
      const card = document.createElement('div');
      card.className = `rec-card rec-${rec.priority} animate-fade-in-up`;
      card.style.animationDelay = `${index * 0.06}s`;
      card.style.animationFillMode = 'both';

      const isID = (document.querySelector('.region-option.active') && document.querySelector('.region-option.active').dataset.region === 'ID');
      const priorityLabels = isID ? {
        critical: 'Kritis',
        important: 'Penting',
        nice: 'Saran Tambahan'
      } : {
        critical: 'Critical',
        important: 'Important',
        nice: 'Nice to have'
      };

      card.innerHTML = `
        <div class="rec-header">
          <span style="font-size: 1.4rem;">${rec.icon}</span>
          <span class="rec-priority">${priorityLabels[rec.priority]}</span>
          <span class="rec-category">• ${rec.category}</span>
        </div>
        <div class="rec-title">${rec.title}</div>
        <div class="rec-body">${this._formatBody(rec.body)}</div>
      `;

      container.appendChild(card);
    });
  }

  // ── Helpers ───────────────────────────────────

  _formatBody(text) {
    // Convert ✅ / ❌ lines into styled spans, and \n into <br>
    return text
      .replace(/\n/g, '<br>')
      .replace(/✅\s*"([^"]+)"/g, '<span style="color: var(--accent-400); font-family: var(--font-mono); font-size: 0.85em;">✅ "$1"</span>')
      .replace(/❌\s*"([^"]+)"/g, '<span style="color: var(--danger-400); font-family: var(--font-mono); font-size: 0.85em;">❌ "$1"</span>');
  }
};
