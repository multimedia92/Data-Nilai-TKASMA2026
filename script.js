// ===== CONFIGURATION =====
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyW7Co7ZWJrXYheJa3nfKviEtJwr_BkEqOFZtZgZRPta32T2VX8Q0lD8WHnqtR7is9U0A/exec';
const DRAFT_KEY = 'tka_semarang2_draft';

// ===== DOM ELEMENTS =====
const form = document.getElementById('formTKA');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const loadingOverlay = document.getElementById('loadingOverlay');
const successModal = document.getElementById('successModal');
const errorModal = document.getElementById('errorModal');
const previewModal = document.getElementById('previewModal');
const themeToggle = document.getElementById('themeToggle');
const backToTop = document.getElementById('backToTop');

// ===== ALL INPUT FIELDS =====
const allFields = [
    'namaSiswa', 'asalSekolah',
    'matematika', 'bahasaIndonesia', 'bahasaInggris',
    'matematikaTL', 'bahasaIndonesiaTL', 'bahasaInggrisTL',
    'fisika', 'kimia', 'biologi',
    'ekonomi', 'geografi', 'sosiologi', 'antropologi', 'sejarah',
    'ppkn', 'pkk',
    'bahasaPrancis', 'bahasaJepang', 'bahasaMandarin', 'bahasaKorea', 'bahasaArab'
];

const requiredFields = ['namaSiswa', 'asalSekolah', 'matematika', 'bahasaIndonesia', 'bahasaInggris'];
const wajibScoreFields = ['matematika', 'bahasaIndonesia', 'bahasaInggris'];
const pilihanScoreFields = [
    'matematikaTL', 'bahasaIndonesiaTL', 'bahasaInggrisTL',
    'fisika', 'kimia', 'biologi',
    'ekonomi', 'geografi', 'sosiologi', 'antropologi', 'sejarah',
    'ppkn', 'pkk',
    'bahasaPrancis', 'bahasaJepang', 'bahasaMandarin', 'bahasaKorea', 'bahasaArab'
];

// ===== THEME TOGGLE =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// ===== BACK TO TOP =====
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== ACCORDION =====
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const wasActive = item.classList.contains('active');
        
        // Close all accordions
        document.querySelectorAll('.accordion-item').forEach(i => {
            i.classList.remove('active');
        });
        
        // Open clicked one if it wasn't active
        if (!wasActive) {
            item.classList.add('active');
        }
    });
});

// ===== PROGRESS BAR =====
function updateProgress() {
    let filled = 0;
    let total = allFields.length;
    
    allFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && field.value.trim() !== '') {
            filled++;
        }
    });
    
    const percentage = Math.round((filled / total) * 100);
    progressBar.style.setProperty('--progress', percentage + '%');
    progressBar.querySelector('::after')?.style?.width = percentage + '%';
    document.querySelector('.progress-bar').style.cssText = `--progress: ${percentage}%`;
    
    // Update CSS variable for progress bar
    const progressAfter = document.querySelector('.progress-bar');
    progressAfter.style.setProperty('width', percentage + '%', 'important');
    
    // Actually set the width using a different approach
    progressBar.innerHTML = `<div style="width: ${percentage}%; height: 100%; background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); border-radius: 9999px; transition: width 0.5s ease;"></div>`;
    
    progressText.textContent = percentage + '%';
    
    updateSummary();
    updateAccordionCounts();
}

// ===== SCORE BADGE UPDATE =====
function updateScoreBadge(input) {
    const badge = input.parentElement.querySelector('.score-badge');
    if (!badge) return;
    
    const value = parseFloat(input.value) || 0;
    
    badge.className = 'score-badge';
    
    if (value === 0 || input.value === '') {
        badge.textContent = '-';
    } else if (value >= 85) {
        badge.textContent = 'A';
        badge.classList.add('excellent');
    } else if (value >= 70) {
        badge.textContent = 'B';
        badge.classList.add('good');
    } else if (value >= 55) {
        badge.textContent = 'C';
        badge.classList.add('average');
    } else {
        badge.textContent = 'D';
        badge.classList.add('poor');
    }
}

// ===== SUMMARY UPDATE =====
function updateSummary() {
    // Calculate wajib average
    let wajibSum = 0, wajibCount = 0;
    wajibScoreFields.forEach(fieldId => {
        const val = parseFloat(document.getElementById(fieldId)?.value) || 0;
        if (val > 0) {
            wajibSum += val;
            wajibCount++;
        }
    });
    const avgWajib = wajibCount > 0 ? (wajibSum / wajibCount).toFixed(2) : '0.00';
    
    // Calculate pilihan average
    let pilihanSum = 0, pilihanCount = 0;
    pilihanScoreFields.forEach(fieldId => {
        const val = parseFloat(document.getElementById(fieldId)?.value) || 0;
        if (val > 0) {
            pilihanSum += val;
            pilihanCount++;
        }
    });
    const avgPilihan = pilihanCount > 0 ? (pilihanSum / pilihanCount).toFixed(2) : '0.00';
    
    // Calculate total average
    const totalSum = wajibSum + pilihanSum;
    const totalCount = wajibCount + pilihanCount;
    const avgTotal = totalCount > 0 ? (totalSum / totalCount).toFixed(2) : '0.00';
    
    // Update display
    document.getElementById('avgWajib').textContent = avgWajib;
    document.getElementById('avgPilihan').textContent = avgPilihan;
    document.getElementById('avgTotal').textContent = avgTotal;
    document.getElementById('filledCount').textContent = `${totalCount}/21`;
}

// ===== ACCORDION COUNTS =====
function updateAccordionCounts() {
    const groups = {
        tingkatLanjut: ['matematikaTL', 'bahasaIndonesiaTL', 'bahasaInggrisTL'],
        ipa: ['fisika', 'kimia', 'biologi'],
        ips: ['ekonomi', 'geografi', 'sosiologi', 'antropologi', 'sejarah'],
        lainnya: ['ppkn', 'pkk'],
        bahasaAsing: ['bahasaPrancis', 'bahasaJepang', 'bahasaMandarin', 'bahasaKorea', 'bahasaArab']
    };
    
    Object.keys(groups).forEach(groupName => {
        let filled = 0;
        groups[groupName].forEach(fieldId => {
            const val = document.getElementById(fieldId)?.value;
            if (val && val.trim() !== '') filled++;
        });
        
        const countElement = document.getElementById(`count${groupName.charAt(0).toUpperCase() + groupName.slice(1)}`);
        if (countElement) {
            countElement.textContent = `${filled}/${groups[groupName].length}`;
        }
    });
}

// ===== INPUT EVENT LISTENERS =====
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        updateProgress();
        
        if (input.type === 'number') {
            // Validate range
            let value = parseFloat(input.value);
            if (value < 0) input.value = 0;
            if (value > 100) input.value = 100;
            
            updateScoreBadge(input);
        }
        
        // Auto save draft
        autoSaveDraft();
    });
});

// ===== RANGE SLIDER SYNC =====
document.querySelectorAll('.range-slider').forEach(slider => {
    slider.addEventListener('input', () => {
        const targetId = slider.dataset.target;
        const targetInput = document.getElementById(targetId);
        if (targetInput) {
            targetInput.value = slider.value;
            targetInput.dispatchEvent(new Event('input'));
        }
    });
});

// Sync range sliders with number inputs
document.querySelectorAll('.score-input input[type="number"]').forEach(input => {
    input.addEventListener('input', () => {
        const slider = document.querySelector(`.range-slider[data-target="${input.id}"]`);
        if (slider) {
            slider.value = input.value || 0;
        }
    });
});

// ===== FORM SUBMISSION =====
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitForm();
});

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        submitForm();
    }
});

async function submitForm() {
    // Validate required fields
    let isValid = true;
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.focus();
            field.parentElement.classList.add('error');
            isValid = false;
        } else {
            field.parentElement.classList.remove('error');
        }
    });
    
    if (!isValid) {
        showToast('Mohon lengkapi semua field yang wajib diisi!', 'error');
        return;
    }
    
    // Show loading
    showLoading();
    document.getElementById('submitBtn').classList.add('loading');
    
    // Collect form data
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
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        hideLoading();
        document.getElementById('submitBtn').classList.remove('loading');
        
        // Show success
        showSuccessModal();
        launchConfetti();
        
        // Clear draft
        localStorage.removeItem(DRAFT_KEY);
        
        // Reset form
        form.reset();
        updateProgress();
        
    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        document.getElementById('submitBtn').classList.remove('loading');
        showErrorModal('Gagal menyimpan data. Silakan coba lagi.');
    }
}

// ===== DRAFT FUNCTIONS =====
function autoSaveDraft() {
    const data = {};
    allFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) data[fieldId] = field.value;
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
        allFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && data[fieldId]) {
                field.value = data[fieldId];
            }
        });
        updateProgress();
        showToast('Draft berhasil dimuat!', 'success');
    } else {
        showToast('Tidak ada draft tersimpan.', 'info');
    }
}

document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
document.getElementById('loadDraftBtn').addEventListener('click', loadDraft);

// ===== PREVIEW =====
document.getElementById('previewBtn').addEventListener('click', showPreview);

function showPreview() {
    const previewContent = document.getElementById('previewContent');
    
    const sections = [
        {
            title: 'Data Siswa',
            fields: [
                { label: 'Nama Siswa', id: 'namaSiswa' },
                { label: 'Asal Sekolah', id: 'asalSekolah' }
            ]
        },
        {
            title: 'Nilai TKA Wajib',
            fields: [
                { label: 'Matematika', id: 'matematika' },
                { label: 'Bahasa Indonesia', id: 'bahasaIndonesia' },
                { label: 'Bahasa Inggris', id: 'bahasaInggris' }
            ]
        },
        {
            title: 'Nilai TKA Pilihan',
            fields: [
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
            ]
        }
    ];
    
    let html = '';
    sections.forEach(section => {
        html += `<div class="preview-section">
            <h4>${section.title}</h4>
            <div class="preview-grid">`;
        
        section.fields.forEach(field => {
            const value = document.getElementById(field.id)?.value || '';
            const displayValue = value || '-';
            const emptyClass = value ? '' : 'empty';
            html += `<div class="preview-item">
                <span class="label">${field.label}</span>
                <span class="value ${emptyClass}">${displayValue}</span>
            </div>`;
        });
        
        html += `</div></div>`;
    });
    
    previewContent.innerHTML = html;
    previewModal.classList.add('active');
}

function closePreviewModal() {
    previewModal.classList.remove('active');
}

function submitFromPreview() {
    closePreviewModal();
    submitForm();
}

// ===== MODAL FUNCTIONS =====
function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

function showSuccessModal() {
    successModal.classList.add('active');
}

function closeModal() {
    successModal.classList.remove('active');
}

function showErrorModal(message) {
    document.getElementById('errorMessage').textContent = message;
    errorModal.classList.add('active');
}

function closeErrorModal() {
    errorModal.classList.remove('active');
}

function retrySubmit() {
    closeErrorModal();
    submitForm();
}

// ===== RESET FORM =====
function resetForm() {
    if (confirm('Apakah Anda yakin ingin mengosongkan semua data?')) {
        form.reset();
        localStorage.removeItem(DRAFT_KEY);
        updateProgress();
        showToast('Form berhasil direset!', 'info');
    }
}

// ===== TOAST =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.className = `toast ${type}`;
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
    
    const confetti = [];
    const colors = ['#DC2626', '#EF4444', '#FCA5A5', '#FECACA', '#FFFFFF', '#6B7280'];
    
    for (let i = 0; i < 150; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * 150,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngle: 0,
            tiltAngleIncrement: Math.random() * 0.07 + 0.05
        });
    }
    
    let animationFrame;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((c, i) => {
            ctx.beginPath();
            ctx.lineWidth = c.r / 2;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt + c.r / 4, c.y);
            ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 4);
            ctx.stroke();
            
            c.tiltAngle += c.tiltAngleIncrement;
            c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
            c.tilt = Math.sin(c.tiltAngle) * 15;
            
            if (c.y > canvas.height) {
                confetti[i] = {
                    x: Math.random() * canvas.width,
                    y: -20,
                    r: c.r,
                    d: c.d,
                    color: c.color,
                    tilt: c.tilt,
                    tiltAngle: c.tiltAngle,
                    tiltAngleIncrement: c.tiltAngleIncrement
                };
            }
        });
        
        animationFrame = requestAnimationFrame(draw);
    }
    
    draw();
    
    setTimeout(() => {
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 4000);
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateProgress();
    
    // Open first accordion by default
    document.querySelector('.accordion-item')?.classList.add('active');
    
    // Check for saved draft
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
        const data = JSON.parse(draft);
        if (Object.values(data).some(v => v)) {
            showToast('Draft tersimpan ditemukan. Klik "Muat Draft" untuk memuat.', 'info');
        }
    }
});

// Make functions globally available
window.closeModal = closeModal;
window.closeErrorModal = closeErrorModal;
window.retrySubmit = retrySubmit;
window.closePreviewModal = closePreviewModal;
window.submitFromPreview = submitFromPreview;
window.resetForm = resetForm;
