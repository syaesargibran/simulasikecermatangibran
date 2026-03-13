// State global
let currentUser = null;
let testState = {
    type: 'angka', // 'angka', 'huruf', 'simbol', 'simulasi'
    kolom: 0,
    totalKolom: 5, // untuk demo, bisa diubah ke 50 nanti
    soalPerKolom: 5, // untuk demo, aslinya 50
    jawaban: [], // array 2D [kolom][soal]
    kunciJawaban: [],
    timer: null,
    waktuTersisa: 60,
    selesai: false,
    statistik: null
};

// Inisialisasi chart
let chartInstance = null;

// Elemen DOM
const pages = document.querySelectorAll('.page');
const homePage = document.getElementById('home-page');
const latihanPage = document.getElementById('latihan-page');
const statistikPage = document.getElementById('statistik-page');
const petunjukPage = document.getElementById('petunjuk-page');
const pengaturanPage = document.getElementById('pengaturan-page');
const akunPage = document.getElementById('akun-page');

// Fungsi navigasi
function showPage(pageId) {
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// Event listener menu home
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const page = item.dataset.page;
        if (page === 'angka' || page === 'huruf' || page === 'simbol' || page === 'simulasi') {
            mulaiLatihan(page);
        } else if (page === 'statistik') {
            tampilStatistikGlobal();
            showPage('statistik-page');
        } else if (page === 'petunjuk') {
            showPage('petunjuk-page');
        } else if (page === 'pengaturan') {
            showPage('pengaturan-page');
        } else if (page === 'akun') {
            showPage('akun-page');
        }
    });
});

// Tombol mulai cepat
document.getElementById('start-quick').addEventListener('click', () => {
    mulaiLatihan('angka');
});

// Kembali ke home
document.querySelectorAll('#back-home, #back-home-stats, #back-home-petunjuk, #back-home-pengaturan, #back-home-akun').forEach(btn => {
    btn.addEventListener('click', () => {
        if (testState.timer) clearInterval(testState.timer);
        showPage('home-page');
    });
});

// Fungsi mulai latihan
function mulaiLatihan(type) {
    testState.type = type;
    testState.kolom = 0;
    testState.jawaban = [];
    testState.selesai = false;
    testState.totalKolom = 5; // demo
    testState.soalPerKolom = 5; // demo

    // Generate kunci jawaban (contoh sederhana)
    testState.kunciJawaban = generateKunci(type, testState.totalKolom, testState.soalPerKolom);

    // Siapkan array jawaban kosong
    for (let k = 0; k < testState.totalKolom; k++) {
        testState.jawaban[k] = new Array(testState.soalPerKolom).fill('');
    }

    document.getElementById('test-title').innerText = `TES KECERMATAN POLRI - ${tipeToNama(type)}`;
    showPage('latihan-page');
    renderKolom(0);
    startTimer(60);
}

// Ubah tipe ke nama
function tipeToNama(t) {
    if (t === 'angka') return 'Angka Hilang';
    if (t === 'huruf') return 'Huruf Hilang';
    if (t === 'simbol') return 'Simbol Hilang';
    if (t === 'simulasi') return 'Simulasi Tes Asli';
    return '';
}

// Generate kunci jawaban (dummy)
function generateKunci(type, totalKolom, soalPerKolom) {
    let kunci = [];
    for (let k = 0; k < totalKolom; k++) {
        let kolom = [];
        for (let s = 0; s < soalPerKolom; s++) {
            if (type === 'angka') {
                // deret angka sederhana: 2,4,6,8,10 -> angka hilang di posisi tengah
                kolom.push((s * 2 + 2).toString());
            } else if (type === 'huruf') {
                // huruf berurutan A,B,C,D,E...
                kolom.push(String.fromCharCode(65 + s));
            } else if (type === 'simbol') {
                const simbol = ['★','●','▲','◆','■','✦','✧','✪','✩'];
                kolom.push(simbol[s % simbol.length]);
            }
        }
        kunci.push(kolom);
    }
    return kunci;
}

// Render kolom tertentu
function renderKolom(kolomIndex) {
    const container = document.getElementById('soal-container');
    container.innerHTML = '';
    document.getElementById('kolom-info').innerText = `Kolom: ${kolomIndex+1} / ${testState.totalKolom}`;

    const kunciKolom = testState.kunciJawaban[kolomIndex];
    for (let i = 0; i < testState.soalPerKolom; i++) {
        const soalDiv = document.createElement('div');
        soalDiv.className = 'soal-item';
        if (i === 0) soalDiv.classList.add('active'); // highlight pertama

        // Tampilan soal berbeda tiap tipe
        let teksSoal = '';
        if (testState.type === 'angka') {
            // Contoh: "2, 4, _, 8, 10"
            const deret = kunciKolom.map((val, idx) => {
                if (idx === 2) return '_'; // hilangkan angka ke-3
                return val;
            }).join(' ');
            teksSoal = deret;
        } else if (testState.type === 'huruf') {
            const deret = kunciKolom.map((val, idx) => {
                if (idx === 2) return '_';
                return val;
            }).join(' ');
            teksSoal = deret;
        } else if (testState.type === 'simbol') {
            const deret = kunciKolom.map((val, idx) => {
                if (idx === 2) return '_';
                return val;
            }).join(' ');
            teksSoal = deret;
        }

        soalDiv.innerHTML = `
            <span>${teksSoal} =</span>
            <input type="text" data-kolom="${kolomIndex}" data-soal="${i}" value="${testState.jawaban[kolomIndex][i] || ''}" ${testState.selesai ? 'disabled' : ''}>
        `;
        container.appendChild(soalDiv);
    }

    // Fokus ke input pertama
    const firstInput = container.querySelector('input');
    if (firstInput) firstInput.focus();

    // Event listener untuk menyimpan jawaban
    container.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', (e) => {
            const kol = e.target.dataset.kolom;
            const soal = e.target.dataset.soal;
            testState.jawaban[kol][soal] = e.target.value;
        });
        inp.addEventListener('focus', (e) => {
            // highlight soal aktif
            document.querySelectorAll('.soal-item').forEach(item => item.classList.remove('active'));
            e.target.closest('.soal-item').classList.add('active');
        });
    });
}

// Timer
function startTimer(duration) {
    if (testState.timer) clearInterval(testState.timer);
    testState.waktuTersisa = duration;
    updateTimerDisplay();

    testState.timer = setInterval(() => {
        testState.waktuTersisa--;
        updateTimerDisplay();

        // peringatan merah
        if (testState.waktuTersisa <= 10) {
            document.getElementById('timer').classList.add('warning');
        } else {
            document.getElementById('timer').classList.remove('warning');
        }

        if (testState.waktuTersisa <= 0) {
            clearInterval(testState.timer);
            beep();
            pindahKolom('next');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const menit = Math.floor(testState.waktuTersisa / 60);
    const detik = testState.waktuTersisa % 60;
    document.getElementById('timer').innerText = `${menit.toString().padStart(2,'0')}:${detik.toString().padStart(2,'0')}`;
}

// Suara beep sederhana dengan Web Audio API
function beep() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

// Pindah kolom
function pindahKolom(arah) {
    if (arah === 'next') {
        if (testState.kolom < testState.totalKolom - 1) {
            testState.kolom++;
            renderKolom(testState.kolom);
            startTimer(60);
        } else {
            // Selesai semua kolom
            selesaiTes();
        }
    } else if (arah === 'prev') {
        if (testState.kolom > 0) {
            testState.kolom--;
            renderKolom(testState.kolom);
            startTimer(60);
        }
    }
}

document.getElementById('next-kolom').addEventListener('click', () => pindahKolom('next'));
document.getElementById('prev-kolom').addEventListener('click', () => pindahKolom('prev'));

// Selesai tes, hitung statistik
function selesaiTes() {
    clearInterval(testState.timer);
    testState.selesai = true;

    // Hitung jawaban benar
    let benar = 0, salah = 0;
    for (let k = 0; k < testState.totalKolom; k++) {
        for (let s = 0; s < testState.soalPerKolom; s++) {
            if (testState.jawaban[k][s] === testState.kunciJawaban[k][s]) {
                benar++;
            } else {
                salah++;
            }
        }
    }
    const total = testState.totalKolom * testState.soalPerKolom;
    const akurasi = (benar / total * 100).toFixed(2);
    const kecepatan = (total * 60 / total).toFixed(2); // dummy

    // Simpan ke localStorage riwayat
    simpanRiwayat({
        tanggal: new Date().toLocaleString(),
        tipe: testState.type,
        benar,
        salah,
        total,
        akurasi
    });

    // Tampilkan statistik
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-benar').innerText = benar;
    document.getElementById('stat-salah').innerText = salah;
    document.getElementById('stat-akurasi').innerText = akurasi + '%';
    document.getElementById('stat-kecepatan').innerText = kecepatan;

    // Grafik per kolom (dummy)
    tampilGrafik(testState.kunciJawaban, testState.jawaban);

    showPage('statistik-page');
}

// Tampilkan grafik performa
function tampilGrafik(kunci, jawaban) {
    const ctx = document.getElementById('chart-performa').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    const labels = [];
    const dataBenar = [];
    for (let k = 0; k < testState.totalKolom; k++) {
        labels.push(`Kolom ${k+1}`);
        let b = 0;
        for (let s = 0; s < testState.soalPerKolom; s++) {
            if (jawaban[k][s] === kunci[k][s]) b++;
        }
        dataBenar.push(b);
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jawaban Benar per Kolom',
                data: dataBenar,
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255,215,0,0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#fff' } }
            },
            scales: {
                y: { beginZero: true, grid: { color: '#333' }, ticks: { color: '#fff' } },
                x: { grid: { color: '#333' }, ticks: { color: '#fff' } }
            }
        }
    });
}

// Simpan riwayat ke localStorage
function simpanRiwayat(data) {
    let riwayat = JSON.parse(localStorage.getItem('riwayat')) || [];
    riwayat.push(data);
    localStorage.setItem('riwayat', JSON.stringify(riwayat));
}

// Tampilkan statistik global (dari semua riwayat)
function tampilStatistikGlobal() {
    const riwayat = JSON.parse(localStorage.getItem('riwayat')) || [];
    if (riwayat.length === 0) {
        document.getElementById('stat-total').innerText = '0';
        document.getElementById('stat-benar').innerText = '0';
        document.getElementById('stat-salah').innerText = '0';
        document.getElementById('stat-akurasi').innerText = '0%';
        document.getElementById('stat-kecepatan').innerText = '0';
        if (chartInstance) chartInstance.destroy();
        return;
    }

    // Hitung total akumulasi
    let totalBenar = 0, totalSalah = 0, totalSoal = 0;
    riwayat.forEach(r => {
        totalBenar += r.benar;
        totalSalah += r.salah;
        totalSoal += r.total;
    });
    const akurasi = (totalBenar / totalSoal * 100).toFixed(2);
    document.getElementById('stat-total').innerText = totalSoal;
    document.getElementById('stat-benar').innerText = totalBenar;
    document.getElementById('stat-salah').innerText = totalSalah;
    document.getElementById('stat-akurasi').innerText = akurasi + '%';
    document.getElementById('stat-kecepatan').innerText = 'N/A';

    // Grafik bisa menampilkan riwayat per sesi, sederhananya kita tampilkan data dummy
    if (chartInstance) chartInstance.destroy();
    const ctx = document.getElementById('chart-performa').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: riwayat.map((_, i) => `Sesi ${i+1}`),
            datasets: [{
                label: 'Benar',
                data: riwayat.map(r => r.benar),
                backgroundColor: '#FFD700'
            }]
        },
        options: { responsive: true, plugins: { legend: { labels: { color: '#fff' } } } }
    });
}

// Fitur akun sederhana
document.getElementById('btn-login').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('display-username').innerText = username;
        tampilRiwayatPribadi();
    } else {
        alert('Login gagal');
    }
});

document.getElementById('btn-register').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!username || !password) return alert('Isi username dan password');
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.username === username)) {
        alert('Username sudah ada');
        return;
    }
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registrasi berhasil, silakan login');
});

document.getElementById('btn-logout').addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
});

function tampilRiwayatPribadi() {
    const riwayat = JSON.parse(localStorage.getItem('riwayat')) || [];
    const list = document.getElementById('riwayat-list');
    list.innerHTML = '';
    riwayat.forEach(r => {
        const li = document.createElement('li');
        li.textContent = `${r.tanggal} - ${r.tipe}: ${r.benar} benar, ${r.salah} salah (${r.akurasi}%)`;
        list.appendChild(li);
    });
}

// Cek session saat load
window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('display-username').innerText = savedUser;
        tampilRiwayatPribadi();
    }
});

// Fitur fullscreen
document.getElementById('setting-fullscreen').addEventListener('change', (e) => {
    if (e.target.checked) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.fullscreenElement) document.exitFullscreen();
    }
});

// Inisialisasi home
showPage('home-page');