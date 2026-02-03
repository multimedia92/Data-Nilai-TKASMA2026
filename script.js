// ===== CONFIGURATION =====
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyW7Co7ZWJrXYheJa3nfKviEtJwr_BkEqOFZtZgZRPta32T2VX8Q0lD8WHnqtR7is9U0A/exec';

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

// Store data
let spreadsheetData = [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initAccordion();
    initInputListeners();
    initRangeSliders();
    initButtons();
    initScrollListener();
    initKeyboardShortcuts();
    updateProgress();
    fetchDataCount();
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
            
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
    document.querySelector('.accordion-item')?.classList.add('active');
}

// ===== INPUT LISTENERS =====
function initInputListeners() {
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
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
    let wajibSum = 0, wajibCount = 0;
    WAJIB_FIELDS.forEach(id => {
        const val = parseFloat(document.getElementById(id)?.value) || 0;
        if (val > 0) { wajibSum += val; wajibCount++; }
    });
    const avgWajib = wajibCount > 0 ? (wajibSum / wajibCount).toFixed(2) : '0.00';
    
    let pilihanSum = 0, pilihanCount = 0;
    PILIHAN_FIELDS.forEach(id => {
        const val = parseFloat(document.getElementById(id)?.value) || 0;
        if (val > 0) { pilihanSum += val; pilihanCount++; }
    });
    const avgPilihan = pilihanCount > 0 ? (pilihanSum / pilihanCount).toFixed(2) : '0.00';
    
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
    
    // Preview Data
    document.getElementById('previewBtn').addEventListener('click', showPreviewData);
    document.getElementById('previewCloseBtn').addEventListener('click', closePreview);
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    
    // Search
    document.getElementById('searchInput').addEventListener('input', filterData);
    
    // Detail Modal
    document.getElementById('detailCloseBtn').addEventListener('click', closeDetail);
    
    // Success & Error Modals
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
        if (e.key === 'Escape') {
            closePreview();
            closeDetail();
            closeSuccessModal();
            closeErrorModal();
        }
    });
}

// ===== FETCH DATA COUNT =====
async function fetchDataCount() {
    try {
        const response = await fetch(SCRIPT_URL);
        const result = await response.json();
        if (result.status === 'success') {
            document.getElementById('dataCount').textContent = result.total || 0;
        }
    } catch (error) {
        console.log('Could not fetch data count');
    }
}

// ===== PREVIEW DATA FROM SPREADSHEET =====
async function showPreviewData() {
    document.getElementById('previewModal').classList.add('show');
    document.getElementById('previewBody').innerHTML = `
        <div class="empty-state">
            <div class="loading-spinner"></div>
            <p>Memuat data...</p>
        </div>
    `;
    
    await loadSpreadsheetData();
}

async function loadSpreadsheetData() {
    try {
        const response = await fetch(SCRIPT_URL);
        const result = await response.json();
        
        if (result.status === 'success') {
            spreadsheetData = result.data || [];
            document.getElementById('totalData').textContent = result.total || 0;
            document.getElementById('dataCount').textContent = result.total || 0;
            renderDataTable(spreadsheetData);
        } else {
            document.getElementById('previewBody').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h4>Gagal Memuat Data</h4>
                    <p>${result.message || 'Terjadi kesalahan'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('previewBody').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-wifi"></i>
                <h4>Koneksi Bermasalah</h4>
                <p>Tidak dapat terhubung ke server</p>
            </div>
        `;
    }
}

function renderDataTable(data) {
    if (!data || data.length === 0) {
        document.getElementById('previewBody').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h4>Belum Ada Data</h4>
                <p>Data yang diinput akan muncul di sini</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Nama Siswa</th>
                    <th>Asal Sekolah</th>
                    <th>Mat</th>
                    <th>B.Indo</th>
                    <th>B.Ing</th>
                    <th>Rata²</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach((row, index) => {
        const mat = parseFloat(row['Matematika']) || 0;
        const indo = parseFloat(row['Bahasa Indonesia']) || 0;
        const ing = parseFloat(row['Bahasa Inggris']) || 0;
        const avg = mat + indo + ing > 0 ? ((mat + indo + ing) / 3).toFixed(1) : '-';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div class="student-name">${row['Nama Siswa'] || '-'}</div>
                    <div class="student-school">${row['Timestamp'] || ''}</div>
                </td>
                <td>${row['Asal Sekolah'] || '-'}</td>
                <td class="score-cell">${mat || '-'}</td>
                <td class="score-cell">${indo || '-'}</td>
                <td class="score-cell">${ing || '-'}</td>
                <td class="score-cell"><strong>${avg}</strong></td>
                <td>
                    <button class="btn-detail" onclick="showDetail(${index})">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    document.getElementById('previewBody').innerHTML = html;
}

function filterData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        renderDataTable(spreadsheetData);
        return;
    }
    
    const filtered = spreadsheetData.filter(row => {
        const nama = (row['Nama Siswa'] || '').toLowerCase();
        const sekolah = (row['Asal Sekolah'] || '').toLowerCase();
        return nama.includes(searchTerm) || sekolah.includes(searchTerm);
    });
    
    renderDataTable(filtered);
    document.getElementById('totalData').textContent = filtered.length;
}

async function refreshData() {
    const btn = document.getElementById('refreshBtn');
    btn.classList.add('loading');
    await loadSpreadsheetData();
    btn.classList.remove('loading');
    showToast('Data berhasil diperbarui!', 'success');
}

function closePreview() {
    document.getElementById('previewModal').classList.remove('show');
    document.getElementById('searchInput').value = '';
}

// ===== DETAIL MODAL =====
function showDetail(index) {
    const row = spreadsheetData[index];
    if (!row) return;
    
    const sections = [
        {
            title: 'Data Siswa',
            items: [
                { label: 'Timestamp', value: row['Timestamp'], full: true },
                { label: 'Nama Siswa', value: row['Nama Siswa'] },
                { label: 'Asal Sekolah', value: row['Asal Sekolah'] }
            ]
        },
        {
            title: 'Nilai TKA Wajib',
            items: [
                { label: 'Matematika', value: row['Matematika'] },
                { label: 'Bahasa Indonesia', value: row['Bahasa Indonesia'] },
                { label: 'Bahasa Inggris', value: row['Bahasa Inggris'] }
            ]
        },
        {
            title: 'Nilai TKA Pilihan - Tingkat Lanjut',
            items: [
                { label: 'Matematika TL', value: row['Matematika TL'] },
                { label: 'B. Indonesia TL', value: row['B. Indonesia TL'] },
                { label: 'B. Inggris TL', value: row['B. Inggris TL'] }
            ]
        },
        {
            title: 'Nilai TKA Pilihan - IPA',
            items: [
                { label: 'Fisika', value: row['Fisika'] },
                { label: 'Kimia', value: row['Kimia'] },
                { label: 'Biologi', value: row['Biologi'] }
            ]
        },
        {
            title: 'Nilai TKA Pilihan - IPS',
            items: [
                { label: 'Ekonomi', value: row['Ekonomi'] },
                { label: 'Geografi', value: row['Geografi'] },
                { label: 'Sosiologi', value: row['Sosiologi'] },
                { label: 'Antropologi', value: row['Antropologi'] },
                { label: 'Sejarah', value: row['Sejarah'] }
            ]
        },
        {
            title: 'Nilai TKA Pilihan - Lainnya',
            items: [
                { label: 'PPKn', value: row['PPKn'] },
                { label: 'PKK', value: row['PKK'] }
            ]
        },
        {
            title: 'Nilai TKA Pilihan - Bahasa Asing',
            items: [
                { label: 'B. Prancis', value: row['B. Prancis'] },
                { label: 'B. Jepang', value: row['B. Jepang'] },
                { label: 'B. Mandarin', value: row['B. Mandarin'] },
                { label: 'B. Korea', value: row['B. Korea'] },
                { label: 'B. Arab', value: row['B. Arab'] }
            ]
        }
    ];
    
    let html = '';
    sections.forEach(section => {
        // Check if section has any values
        const hasValues = section.items.some(item => item.value);
        if (!hasValues && section.title !== 'Data Siswa' && section.title !== 'Nilai TKA Wajib') return;
        
        html += `<div class="detail-section"><h4>${section.title}</h4><div class="detail-grid">`;
        section.items.forEach(item => {
            const val = item.value || '';
            const fullClass = item.full ? 'full-width' : '';
            html += `
                <div class="detail-item ${fullClass}">
                    <span class="label">${item.label}</span>
                    <span class="value ${val ? '' : 'empty'}">${val || '-'}</span>
                </div>
            `;
        });
        html += '</div></div>';
    });
    
    document.getElementById('detailBody').innerHTML = html;
    document.getElementById('detailModal').classList.add('show');
}

function closeDetail() {
    document.getElementById('detailModal').classList.remove('show');
}

// ===== FORM SUBMIT =====
async function submitForm() {
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
    
    document.getElementById('loadingOverlay').classList.add('show');
    document.getElementById('loadingText').textContent = 'Menyimpan data...';
    
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
        
        // Reset form
        document.getElementById('formTKA').reset();
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
        fetchDataCount();
        
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

// Make functions globally available
window.showDetail = showDetail;
