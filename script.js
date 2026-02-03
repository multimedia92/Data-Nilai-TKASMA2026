// URL Google Apps Script Web App - SUDAH DIUPDATE
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyW7Co7ZWJrXYheJa3nfKviEtJwr_BkEqOFZtZgZRPta32T2VX8Q0lD8WHnqtR7is9U0A/exec';

// Form submit handler
document.getElementById('formTKA').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading
    showLoading();
    
    // Collect form data
    const formData = {
        timestamp: new Date().toLocaleString('id-ID'),
        namaSiswa: document.getElementById('namaSiswa').value,
        asalSekolah: document.getElementById('asalSekolah').value,
        // TKA Wajib
        matematika: document.getElementById('matematika').value || '',
        bahasaIndonesia: document.getElementById('bahasaIndonesia').value || '',
        bahasaInggris: document.getElementById('bahasaInggris').value || '',
        // TKA Pilihan - Tingkat Lanjut
        matematikaTL: document.getElementById('matematikaTL').value || '',
        bahasaIndonesiaTL: document.getElementById('bahasaIndonesiaTL').value || '',
        bahasaInggrisTL: document.getElementById('bahasaInggrisTL').value || '',
        // TKA Pilihan - IPA
        fisika: document.getElementById('fisika').value || '',
        kimia: document.getElementById('kimia').value || '',
        biologi: document.getElementById('biologi').value || '',
        // TKA Pilihan - IPS
        ekonomi: document.getElementById('ekonomi').value || '',
        geografi: document.getElementById('geografi').value || '',
        sosiologi: document.getElementById('sosiologi').value || '',
        antropologi: document.getElementById('antropologi').value || '',
        sejarah: document.getElementById('sejarah').value || '',
        // TKA Pilihan - Lainnya
        ppkn: document.getElementById('ppkn').value || '',
        pkk: document.getElementById('pkk').value || '',
        // TKA Pilihan - Bahasa Asing
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
        
        // Hide loading
        hideLoading();
        
        // Show success modal
        showSuccessModal();
        
        // Reset form
        document.getElementById('formTKA').reset();
        
    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        showErrorModal('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
    }
});

// Show loading overlay
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// Show success modal
function showSuccessModal() {
    document.getElementById('successModal').classList.add('active');
}

// Close success modal
function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Show error modal
function showErrorModal(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').classList.add('active');
}

// Close error modal
function closeErrorModal() {
    document.getElementById('errorModal').classList.remove('active');
}

// Reset form
function resetForm() {
    if (confirm('Apakah Anda yakin ingin mengosongkan semua data?')) {
        document.getElementById('formTKA').reset();
    }
}

// Input validation - only allow numbers 0-100
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        let value = parseFloat(this.value);
        if (value < 0) this.value = 0;
        if (value > 100) this.value = 100;
    });
});
