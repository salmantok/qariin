const surahSelect = document.getElementById('surah-select');
const ayahContainer = document.getElementById('ayah-container');
const body = document.getElementById('main-body');
const playSurahBtn = document.getElementById('play-surah');
const repeatToggle = document.getElementById('repeat-toggle');

let currentAudio = null;
let repeatMode = false;
let autoPlay = true;
let currentAyahIndex = 0;
let ayahElements = [];
let currentSurah = 1;

// Ambil daftar surah
fetch('https://api.alquran.cloud/v1/surah')
    .then((res) => res.json())
    .then((data) => {
        data.data.forEach((surah) => {
            const option = document.createElement('option');
            option.value = surah.number;
            option.textContent = `${surah.number}. ${surah.englishName} (${surah.name})`;
            surahSelect.appendChild(option);
        });

        loadSurah(1); // default Al-Fatihah
    });

// Event listener
surahSelect.onchange = () => {
    const surahNumber = parseInt(surahSelect.value);
    loadSurah(surahNumber);
};

repeatToggle.onchange = (e) => {
    repeatMode = e.target.checked;
};

playSurahBtn.onclick = () => {
    currentAyahIndex = 0;
    playAyahAuto(currentSurah);
};

// Fungsi konversi angka ke angka Arab
function toArabicNumber(num) {
    return String(num).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
}

// Fungsi untuk load surah dan ayah
function loadSurah(surahNumber) {
    // Stop audio jika ada yang sedang diputar
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    currentSurah = surahNumber;
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`)
        .then((res) => res.json())
        .then((data) => {
            ayahContainer.innerHTML = '';
            ayahElements = [];
            currentAyahIndex = 0;

            data.data.ayahs.forEach((ayah) => {
                const div = document.createElement('div');
                div.className =
                    'ayah p-3 rounded cursor-pointer transition border-b';
                div.innerHTML = `
          <div class="text-4xl font-semibold whitespace-pre-line">
            ${ayah.text}
            <span class="text-sm text-gray-500">(${toArabicNumber(ayah.numberInSurah)})</span>
          </div>
        `;

                div.onclick = () => {
                    const isPlaying = div.classList.contains('text-blue-700');

                    // Jika sedang diputar, hentikan dan beri warna merah
                    if (isPlaying && currentAudio) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0;
                        currentAudio = null;

                        div.classList.remove('text-blue-700');
                        div.classList.add('text-red-500');
                        return;
                    }

                    // Jika klik ayat lain, reset semua warna
                    document
                        .querySelectorAll('.ayah')
                        .forEach((el) =>
                            el.classList.remove('text-blue-700', 'text-red-500')
                        );

                    currentAyahIndex = ayah.numberInSurah - 1;
                    playAyahAuto(surahNumber);
                };

                ayahElements.push(div);
                ayahContainer.appendChild(div);
            });
        });
}

// Fungsi pemutar otomatis ayat satu per satu
function playAyahAuto(surahNum) {
    if (currentAyahIndex >= ayahElements.length) return;

    const element = ayahElements[currentAyahIndex];
    const ayahNum = currentAyahIndex + 1;
    const surahStr = String(surahNum).padStart(3, '0');
    const ayahStr = String(ayahNum).padStart(3, '0');
    const url = `https://everyayah.com/data/Abdul_Basit_Mujawwad_128kbps/${surahStr}${ayahStr}.mp3`;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(url);
    currentAudio.play();

    // Highlight & scroll
    document
        .querySelectorAll('.ayah')
        .forEach((el) => el.classList.remove('text-blue-700', 'text-red-500'));

    element.classList.remove('text-red-500'); // bersihkan merah jika ada
    element.classList.add('text-blue-700');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    currentAudio.onended = () => {
        element.classList.remove('text-blue-700');

        if (repeatMode) {
            currentAudio.currentTime = 0;
            currentAudio.play();
            element.classList.add('text-blue-700');
        } else if (autoPlay) {
            currentAyahIndex++;
            playAyahAuto(surahNum);
        }
    };
}

// Footer
const currentYear = new Date().getFullYear();
const startYear = 2025;

if (currentYear > startYear) {
    document.getElementById('year').textContent =
        `${startYear} - ${currentYear}`;
} else {
    document.getElementById('year').textContent = startYear;
}
