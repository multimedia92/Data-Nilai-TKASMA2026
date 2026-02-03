// ===== CONFIGURATION =====
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyW7Co7ZWJrXYheJa3nfKviEtJwr_BkEqOFZtZgZRPta32T2VX8Q0lD8WHnqtR7is9U0A/exec';
const DRAFT_KEY = 'tka_semarang2_draft';

// ===== FIELD DEFINITIONS =====
const ALL_FIELDS = [
    'namaSiswa', 'asalSekolah',
    'matematika', 'bahasaIndonesia', 'bahasaInggris',
    'matematikaTL', 'bahasaIndonesiaTL', 'bahasaInggrisTL',
    'fisika', 'kimia', 'biologi',
    'ekonomi', 'geografi', 'sosiologi', 'antropologi', 'sejarah',
    'ppkn', 'pkk',
    'bahasaPrancis', 'bahasaJepang', 'bahasaMandarin', 'bahasaKorea', 'bahasaArab'
];

const WAJIB_FIELDS = ['matematika', 'bahasaIndonesia', 'bahasaInggris'];
const PILIHAN_FIELDS = ALL_FIELDS.filter(f => !['namaSiswa', 'asalSekolah', ...WAJIB_FIELDS].includes(f));

const GROUP_FIELDS = {
    tingkatLanjut: ['matematikaTL', 'bahasaIndonesiaTL', 'bahasaInggrisTL'],
    ipa: ['fisika', 'kimia', 'biologi'],
    ips: ['ekonomi', 'geografi', 'sosiologi', 'antropologi', 'sejarah'],
    lainnya: ['ppkn', 'pkk'],
    bahasaAsing: ['bahasaPrancis', 'bahasaJepang', 'bahasaMandarin', 'bahasaKorea', 'bahasaArab']
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initAccordion();
    initInputListeners();
    initRangeSliders();
    initButtons();
    initScrollListener();
    initKeyboardShortcuts();
    checkDraft();
    updateProgress();
});

// ===== THEME =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
    
    document.getElementById('themeToggle').addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
    });
}

function updateThemeIcons(theme) {
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    if (theme === 'dark') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }
}

// ===== ACCORDION =====
function initAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const item = this.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
            });
            
            // Open if wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
    // Open first accordion by default
    document.querySelector('.accordion-item')?.classList.add('active');
}

// ===== INPUT LISTENERS =====
function initInputListeners() {
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            // Validate number range
            if (this.type === 'number') {
                let val = parseFloat(this.value);
                if (val < 0) this.value = 0;
                if (val > 100) this.value = 100;
                updateScoreBadge(this.id, this.value);
                syncRangeSlider(this.id, this.value);
            }
            
            updateProgress();
            updateSummary();
            updateAccordionCounts();
            autoSaveDraft();
        });
    });
}

// ===== RANGE SLIDERS =====
function initRangeSliders() {
    document.querySelectorAll('.range-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const targetId = this.id.replace('range-', '');
            const targetInput = document.getElementById(targetId);
            if (targetInput) {
                targetInput.value = this.value;
                targetInput.dispatchEvent(new Event('input'));
            }
        });
    });
}

function syncRangeSlider(inputId, value) {
    const slider = document.getElementById('range-' + inputId);
    if (slider) {
        slider.value = value || 0;
    }
}

// ===== SCORE BADGE =====
function updateScoreBadge(inputId, value) {
    const badge = document.getElementById('badge-' + inputId);
    if (!badge) return;
    
    const val = parseFloat(value) || 0;
    badge.className = 'score-badge';
    
    if (val === 0 || value === '') {
        badge.textContent = '-';
    } else if (val >= 85) {
        badge.textContent = 'A';
        badge.classList.add('excellent');
    } else if (val >= 70) {
        badge.textContent = 'B';
        badge.classList.add('good');
    } else if (val >= 55) {
        badge.textContent = 'C';
        badge.classList.add('average');
    } else {
        badge.textContent = 'D';
        badge.classList.add('poor');
    }
}

// ===== PROGRESS BAR =====
function updateProgress() {
    let filled = 0;
    ALL_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.value.trim() !== '') filled++;
    });
    
    const percentage = Math.round((filled / ALL_FIELDS.length) * 100);
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = percentage + '%';
}

// ===== SUMMARY =====
function updateSummary() {
    // Wajib average
    let wajibSum = 0, wajibCount = 0;
    WAJIB_FIELDS.forEach(id => {
        const val = parseFloat(document.getElementById(id)?.value) || 0;
        if (val > 0) { wajibSum += val; wajibCount++; }
    });
    const avgWajib = wajibCount > 0 ? (wajibSum / wajibCount).toFixed(2) : '0.00';
    
    // Pilihan average
    let pilihanSum = 0, pilihanCount = 0;
    PILIHAN_FIELDS.forEach(id => {
        const val = parseFloat(document.getElementById(id)?.value) || 0;
        if (val > 0) { pilihanSum += val; pilihanCount++; }
    });
    const avgPilihan = pilihanCount > 0 ? (pilihanSum / pilihanCount).toFixed(2) : '0.00';
    
    // Total
    const totalSum = wajibSum + pilihanSum;
    const totalCount = wajibCount + pilihanCount;
    const avgTotal = totalCount > 0 ? (totalSum / totalCount).toFixed(2) : '0.00';
    
    document.getElementById('avgWajib').textContent = avgWajib;
    document.getElementById('avgPilihan').textContent = avgPilihan;
    document.getElementById('avgTotal').textContent = avgTotal;
    document.getElementById('filledCount').textContent = totalCount + '/21';
}

// ===== ACCORDION COUNTS =====
function updateAccordionCounts() {
    Object.keys(GROUP_FIELDS).forEach(group => {
        let count = 0;
        GROUP_FIELDS[group].forEach(id => {
            const val = document.getElementById(id)?.value;
            if (val && val.trim() !== '') count++;
        });
        const el = document.getElementById('count-' + group);
        if (el) el.textContent = count;
    });
}

// ===== BUTTONS =====
function initButtons() {
    // Reset
    document.getElementById('resetBtn').addEventListener('click', resetForm);
    
    // Submit
    document.getElementById('formTKA').addEventListener('submit', function(e) {
        e.preventDefault();
        submitForm();
    });
    
    // Draft buttons
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
    document.getElementById('loadDraftBtn').addEventListener('click', loadDraft);
    document.getElementById('clearDraftBtn').addEventListener('click', clearDraft);
    
    // Preview
    document.getElementById('previewBtn').addEventListener('click', showPreview);
    document.getElementById('previewCloseBtn').addEventListener('click', closePreview);
    document.getElementById('previewEditBtn').addEventListener('click', closePreview);
    document.getElementById('previewSubmitBtn').addEventListener('click', function() {
        closePreview();
        submitForm();
    });
    
    // Modal close buttons
    document.getElementById('successCloseBtn').addEventListener('click', closeSuccessModal);
    document.getElementById('errorCloseBtn').addEventListener('click', closeErrorModal);
    document.getElementById('retryBtn').addEventListener('click', function() {
        closeErrorModal();
        submitForm();
    });
    
    // Back to top
    document.getElementById('backToTop').addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== SCROLL LISTENER =====
function initScrollListener() {
    window.addEventListener('scroll', function() {
        const btn = document.getElementById('backToTop');
        if (window.scrollY > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });
}

// ===== KEYBOARD SHORTCUTS =====
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            submitForm();
        }
    });
}

// ===== DRAFT FUNCTIONS =====
function autoSaveDraft() {
    const data = {};
    ALL_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) data[id] = el.value;
    });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

function saveDraft() {
    autoSaveDraft();
    showToast('Draft berhasil disimpan!', 'success');
}

function loadDraft() {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
        const data = JSON.parse(draft);
        ALL_FIELDS.forEach(id => {
            const el = document.getElementById(id);
            if (el && data[id]) {
                el.value = data[id];
                if (el.type === 'number') {
                    updateScoreBadge(id, data[id]);
                    syncRangeSlider(id, data[id]);
                }
            }
        });
        updateProgress();
        updateSummary();
        updateAccordionCounts();
        showToast('Draft berhasil dimuat!', 'success');
    } else {
        showToast('Tidak ada draft tersimpan', 'warning');
    }
}

function clearDraft() {
    if (confirm('Hapus draft tersimpan?')) {
        localStorage.removeItem(DRAFT_KEY);
        showToast('Draft dihapus!', 'info');
    }
}

function checkDraft() {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
        const data = JSON.parse(draft);
        const hasData = Object.values(data).some(v => v);
        if (hasData) {
            showToast('Ada draft tersimpan. Klik "Muat Draft" untuk memuat.', 'info');
        }
    }
}

// ===== PREVIEW =====
function showPreview() {
    const sections = [
        { title: 'Data Siswa', fields: [
            { label: 'Nama Siswa', id: 'namaSiswa' },
            { label: 'Asal Sekolah', id: 'asalSekolah' }
        ]},
        { title: 'Nilai TKA Wajib', fields: [
            { label: 'Matematika', id: 'matematika' },
            { label: 'Bahasa Indonesia', id: 'bahasaIndonesia' },
            { label: 'Bahasa Inggris', id: 'bahasaInggris' }
        ]},
        { title: 'Nilai TKA Pilihan', fields: [
            { label: 'Matematika TL', id: 'matematikaTL' },
            { label: 'B. Indonesia TL', id: 'bahasaIndonesiaTL' },
            { label: 'B. Inggris TL', id: 'bahasaInggrisTL' },
            { label: 'Fisika', id: 'fisika' },
            { label: 'Kimia', id: 'kimia' },
            { label: 'Biologi', id: 'biologi' },
            { label: 'Ekonomi', id: 'ekonomi' },
            { label: 'Geografi', id: 'geografi' },
            { label: 'Sosiologi', id: 'sosiologi' },
            { label: 'Antropologi', id: 'antropologi' },
            { label: 'Sejarah', id: 'sejarah' },
            { label: 'PPKn', id: 'ppkn' },
            { label: 'PKK', id: 'pkk' },
            { label: 'B. Prancis', id: 'bahasaPrancis' },
            { label: 'B. Jepang', id: 'bahasaJepang' },
            { label: 'B. Mandarin', id: 'bahasaMandarin' },
            { label: 'B. Korea', id: 'bahasaKorea' },
            { label: 'B. Arab', id: 'bahasaArab' }
        ]}
    ];
    
    let html = '';
    sections.forEach(section => {
        html += `<div class="preview-section"><h4>${section.title}</h4><div class="preview-grid">`;
        section.fields.forEach(field => {
            const val = document.getElementById(field.id)?.value || '';
            html += `<div class="preview-item">
                <span class="label">${field.label}</span>
                <span class="value ${val ? '' : 'empty'}">${val || '-'}</span>
            </div>`;
        });
        html += '</div></div>';
    });
    
    document.getElementById('previewBody').innerHTML = html;
    document.getElementById('previewModal').classList.add('show');
}

function closePreview() {
    document.getElementById('previewModal').classList.remove('show');
}

// ===== FORM SUBMIT =====
async function submitForm() {
    // Validate
    const requiredIds = ['namaSiswa', 'asalSekolah', 'matematika', 'bahasaIndonesia', 'bahasaInggris'];
    let isValid = true;
    
    for (const id of requiredIds) {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
            el.focus();
            el.style.borderColor = 'var(--primary)';
            isValid = false;
            break;
        } else {
            el.style.borderColor = '';
        }
    }
    
    if (!isValid) {
        showToast('Lengkapi semua field wajib!', 'error');
        return;
    }
    
    // Show loading
    document.getElementById('loadingOverlay').classList.add('show');
    
    // Prepare data
    const formData = {
        timestamp: new Date().toLocaleString('id-ID'),
        namaSiswa: document.getElementById('namaSiswa').value,
        asalSekolah: document.getElementById('asalSekolah').value,
        matematika: document.getElementById('matematika').value || '',
        bahasaIndonesia: document.getElementById('bahasaIndonesia').value || '',
        bahasaInggris: document.getElementById('bahasaInggris').value || '',
        matematikaTL: document.getElementById('matematikaTL').value || '',
        bahasaIndonesiaTL: document.getElementById('bahasaIndonesiaTL').value || '',
        bahasaInggrisTL: document.getElementById('bahasaInggrisTL').value || '',
        fisika: document.getElementById('fisika').value || '',
        kimia: document.getElementById('kimia').value || '',
        biologi: document.getElementById('biologi').value || '',
        ekonomi: document.getElementById('ekonomi').value || '',
        geografi: document.getElementById('geografi').value || '',
        sosiologi: document.getElementById('sosiologi').value || '',
        antropologi: document.getElementById('antropologi').value || '',
        sejarah: document.getElementById('sejarah').value || '',
        ppkn: document.getElementById('ppkn').value || '',
        pkk: document.getElementById('pkk').value || '',
        bahasaPrancis: document.getElementById('bahasaPrancis').value || '',
        bahasaJepang: document.getElementById('bahasaJepang').value || '',
        bahasaMandarin: document.getElementById('bahasaMandarin').value || '',
        bahasaKorea: document.getElementById('bahasaKorea').value || '',
        bahasaArab: document.getElementById('bahasaArab').value || ''
    };
    
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        document.getElementById('loadingOverlay').classList.remove('show');
        document.getElementById('successModal').classList.add('show');
        launchConfetti();
        
        // Clear
        localStorage.removeItem(DRAFT_KEY);
        document.getElementById('formTKA').reset();
        
        // Reset all badges
        document.querySelectorAll('.score-badge').forEach(badge => {
            badge.textContent = '-';
            badge.className = 'score-badge';
        });
        
        // Reset range sliders
        document.querySelectorAll('.range-slider').forEach(slider => {
            slider.value = 0;
        });
        
        updateProgress();
        updateSummary();
        updateAccordionCounts();
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loadingOverlay').classList.remove('show');
        document.getElementById('errorModal').classList.add('show');
    }
}

// ===== RESET FORM =====
function resetForm() {
    if (confirm('Yakin ingin mengosongkan semua data?')) {
        document.getElementById('formTKA').reset();
        localStorage.removeItem(DRAFT_KEY);
        
        document.querySelectorAll('.score-badge').forEach(badge => {
            badge.textContent = '-';
            badge.className = 'score-badge';
        });
        
        document.querySelectorAll('.range-slider').forEach(slider => {
            slider.value = 0;
        });
        
        updateProgress();
        updateSummary();
        updateAccordionCounts();
        showToast('Form berhasil direset!', 'info');
    }
}

// ===== MODAL FUNCTIONS =====
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
}

function closeErrorModal() {
    document.getElementById('errorModal').classList.remove('show');
}

// ===== TOAST =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.className = 'toast ' + type;
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== CONFETTI =====
function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const pieces = [];
    const colors = ['#DC2626', '#EF4444', '#FCA5A5', '#FFFFFF', '#6B7280', '#F59E0B'];
    
    for (let i = 0; i < 150; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 5 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 360
        });
    }
    
    let frame;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        pieces.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            
            p.y += p.speed;
            p.x += Math.sin(p.angle) * 0.5;
            p.angle += 0.01;
            
            if (p.y > canvas.height) {
                pieces[i].y = -10;
                pieces[i].x = Math.random() * canvas.width;
            }
        });
        
        frame = requestAnimationFrame(animate);
    }
    
    animate();
    
    setTimeout(() => {
        cancelAnimationFrame(frame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 4000);
}
