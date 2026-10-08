/* ============================================================
   data.js — Peta kurikulum Pendidikan Islam Tahun 4
   (DSKP KSSR Semakan 2017) — 7 bidang · 26 unit
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- ikon dunia (SVG stroke) ---------- */
  var ICON = {
    book: '<path d="M4 5.6C4 4.7 4.7 4 5.6 4H10a2 2 0 0 1 2 2v14a1.7 1.7 0 0 0-1.7-1.6H4V5.6Z"/><path d="M20 5.6c0-.9-.7-1.6-1.6-1.6H14a2 2 0 0 0-2 2v14a1.7 1.7 0 0 1 1.7-1.6H20V5.6Z"/>',
    scroll: '<path d="M7 4h10v16H7z"/><path d="M7 8h10M7 12h10M7 16h6"/>',
    crescent: '<path d="M15.6 3.4A8.4 8.4 0 1 0 20 15.2 6.6 6.6 0 0 1 15.6 3.4Z"/><path d="M18.6 4.6l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6Z"/>',
    mosque: '<path d="M3 20h18"/><path d="M6 20v-7h12v7"/><path d="M12 4s3.6 2.8 3.6 5.4H8.4C8.4 6.8 12 4 12 4Z"/><path d="M3.5 13.4 5 11.6l1.5 1.8M17.5 13.4 19 11.6l1.5 1.8"/><path d="M10.5 20v-3.4h3V20"/>',
    compass: '<circle cx="12" cy="12" r="8.6"/><path d="M15.4 8.6l-1.9 5.4-5.4 1.9 1.9-5.4 5.4-1.9Z"/>',
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6"/><path d="M16.4 11.6a2.6 2.6 0 1 0 0-5.2"/><path d="M17.6 20c0-2.6-1.1-4.7-2.8-5.8"/>',
    pen: '<path d="M4 20l1.2-4.4L15.6 5.2 18.8 8.4 7.6 19.6 4 20Z"/><path d="M14.4 6.4l3.2 3.2"/><path d="M4.6 15.6l3.8 3.8"/>'
  };

  /* ============================================================
     1. AL-QURAN
     ============================================================ */
  var TAKATHUR = [
    { a: "أَلْهَاكُمُ التَّكَاثُرُ", r: "Alhakumut takathur", m: "Bermegah-megah telah melalaikan kamu," },
    { a: "حَتَّىٰ زُرْتُمُ الْمَقَابِرَ", r: "Hatta zurtumul maqabir", m: "sehingga kamu masuk ke dalam kubur." },
    { a: "كَلَّا سَوْفَ تَعْلَمُونَ", r: "Kalla sawfa ta’lamun", m: "Jangan sekali-kali begitu! Kelak kamu akan mengetahui (akibatnya)," },
    { a: "ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ", r: "Thumma kalla sawfa ta’lamun", m: "sekali lagi, jangan sekali-kali begitu! Kelak kamu akan mengetahui." },
    { a: "كَلَّا لَوْ تَعْلَمُونَ عِلْمَ الْيَقِينِ", r: "Kalla law ta’lamuna ‘ilmal yaqin", m: "Jangan sekali-kali begitu! Sekiranya kamu mengetahui dengan penuh keyakinan," },
    { a: "لَتَرَوُنَّ الْجَحِيمَ", r: "Latarawunnal jahim", m: "nescaya kamu akan melihat neraka Jahim," },
    { a: "ثُمَّ لَتَرَوُنَّهَا عَيْنَ الْيَقِينِ", r: "Thumma latarawunnaha ‘aynal yaqin", m: "kemudian kamu pasti melihatnya dengan sebenar-benar keyakinan," },
    { a: "ثُمَّ لَتُسْأَلُنَّ يَوْمَئِذٍ عَنِ النَّعِيمِ", r: "Thumma latus’alunna yawma’idhin ‘anin na’im", m: "kemudian kamu pasti ditanya pada hari itu tentang segala nikmat." }
  ];

  var QARIAH = [
    { a: "الْقَارِعَةُ", r: "Al-qari’ah", m: "Hari Kiamat yang menggemparkan," },
    { a: "مَا الْقَارِعَةُ", r: "Mal qari’ah", m: "apakah hari Kiamat yang menggemparkan itu?" },
    { a: "وَمَا أَدْرَاكَ مَا الْقَارِعَةُ", r: "Wa ma adraka mal qari’ah", m: "Tahukah kamu apakah hari Kiamat itu?" },
    { a: "يَوْمَ يَكُونُ النَّاسُ كَالْفَرَاشِ الْمَبْثُوثِ", r: "Yawma yakunun nasu kal farashil mabthuth", m: "Pada hari itu manusia seperti kumbang yang bertebaran," },
    { a: "وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنْفُوشِ", r: "Wa takunul jibalu kal ‘ihnil manfush", m: "dan gunung-ganang seperti bulu yang dihambur-hamburkan." },
    { a: "فَأَمَّا مَنْ ثَقُلَتْ مَوَازِينُهُ", r: "Fa amma man thaqulat mawazinuh", m: "Sesiapa yang berat timbangan (amal baik)nya," },
    { a: "فَهُوَ فِي عِيشَةٍ رَاضِيَةٍ", r: "Fahuwa fi ‘ishatir radiyah", m: "maka dia berada dalam kehidupan yang memuaskan (syurga)." },
    { a: "وَأَمَّا مَنْ خَفَّتْ مَوَازِينُهُ", r: "Wa amma man khaffat mawazinuh", m: "Sesiapa yang ringan timbangan (amal baik)nya," },
    { a: "فَأُمُّهُ هَاوِيَةٌ", r: "Fa ummuhu hawiyah", m: "maka tempat kembalinya ialah neraka Hawiyah." },
    { a: "وَمَا أَدْرَاكَ مَا هِيَهْ", r: "Wa ma adraka ma hiyah", m: "Tahukah kamu apakah neraka itu?" },
    { a: "نَارٌ حَامِيَةٌ", r: "Narun hamiyah", m: "Api yang sangat panas." }
  ];

  var IKHLAS = [
    { a: "قُلْ هُوَ اللَّهُ أَحَدٌ", r: "Qul huwa Allahu ahad", m: "Katakanlah (wahai Muhammad): Dialah Allah, Yang Maha Esa." },
    { a: "اللَّهُ الصَّمَدُ", r: "Allahus samad", m: "Allah ialah Tuhan yang menjadi tumpuan segala makhluk." },
    { a: "لَمْ يَلِدْ وَلَمْ يُولَدْ", r: "Lam yalid wa lam yulad", m: "Dia tidak beranak dan tidak diperanakkan." },
    { a: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", r: "Wa lam yakun lahu kufuwan ahad", m: "Dan tidak ada sesuatu pun yang setara dengan-Nya." }
  ];

  var quran = {
    id: "quran", name: "Alam Al-Quran", jawi: "عالم القرءان", icon: ICON.book,
    tagline: "Cahaya Kalamullah", c1: "#13b981", c2: "#065f46", glow: "#34d399",
    desc: "Baca, hafaz dan fahami firman Allah SWT. Setiap ayat yang anda baca menjadi cahaya untuk hidup anda.",
    x: 13, y: 76,
    units: [
      {
        id: "takathur-tilawah", jawi: "تلاوة سورة التكاثر",
        title: "Tilawah — Surah At-Takathur",
        desc: "Baca Surah At-Takathur dengan betul dan bertajwid.",
        activities: [
          {
            type: "recite", title: "Baca & Dengar Surah At-Takathur", gem: 10,
            instr: "Tekan setiap ayat untuk mendengarnya. Ikuti bacaan dengan makhraj yang betul.",
            verses: TAKATHUR
          },
          {
            type: "quiz", title: "Kuiz Cahaya At-Takathur", gem: 15,
            instr: "Jawab semua soalan. Setiap jawapan betul memberi Permata Ilmu!",
            questions: [
              { q: "Berapakah bilangan ayat Surah At-Takathur?", o: ["6 ayat", "7 ayat", "8 ayat", "9 ayat"], a: 2, e: "Surah At-Takathur mengandungi 8 ayat." },
              { q: "Perkataan “At-Takathur” bermaksud…", o: ["Bermegah-megah dan berlumba menambah harta", "Bersedekah dengan ikhlas", "Menuntut ilmu", "Bermusafir"], a: 0, e: "At-Takathur bermaksud bermegah-megah sehingga melalaikan diri daripada mengingati Allah." },
              { q: "“حَتَّىٰ زُرْتُمُ الْمَقَابِرَ” bermaksud…", o: ["sehingga kamu masuk ke dalam kubur", "sehingga kamu menjadi kaya", "sehingga kamu berjaya", "sehingga kamu berhijrah"], a: 0, e: "Zurtumul maqabir = kamu menziarahi (masuk) kubur, iaitu sehingga mati." },
              { q: "Pada ayat terakhir, manusia akan ditanya tentang…", o: ["segala nikmat", "bilangan harta sahaja", "nama keluarga", "warna pakaian"], a: 0, e: "“Thumma latus’alunna yawma’idhin ‘anin na’im” — kamu akan ditanya tentang segala nikmat." },
              { q: "Pengajaran utama surah ini ialah…", o: ["Jangan biarkan harta dan kemegahan melalaikan kita daripada Allah", "Kita mesti mengumpul harta sebanyak mungkin", "Harta lebih penting daripada solat", "Kita tidak perlu bersyukur"], a: 0, e: "Harta ialah amanah, bukan untuk dibanggakan sehingga melalaikan ibadat." }
            ]
          }
        ]
      },
      {
        id: "qariah-tilawah", jawi: "تلاوة سورة القارعة",
        title: "Tilawah — Surah Al-Qariah",
        desc: "Baca Surah Al-Qariah dengan betul dan bertajwid.",
        activities: [
          {
            type: "recite", title: "Baca & Dengar Surah Al-Qariah", gem: 10,
            instr: "Tekan ayat untuk mendengarnya. Perhatikan panjang pendek bacaan (mad).",
            verses: QARIAH
          },
          {
            type: "quiz", title: "Kuiz Cahaya Al-Qariah", gem: 15,
            instr: "Jawab semua soalan tentang Surah Al-Qariah.",
            questions: [
              { q: "Berapakah bilangan ayat Surah Al-Qariah?", o: ["9 ayat", "10 ayat", "11 ayat", "12 ayat"], a: 2, e: "Surah Al-Qariah mengandungi 11 ayat." },
              { q: "Al-Qariah bermaksud…", o: ["Hari Kiamat yang menggemparkan", "Hari yang cerah", "Hujan lebat", "Gunung yang tinggi"], a: 0, e: "Al-Qariah ialah nama hari Kiamat yang menggemparkan hati manusia." },
              { q: "Manusia pada hari itu diibaratkan seperti…", o: ["kumbang yang bertebaran", "burung yang terbang tinggi", "pokok yang rendang", "ombak yang tenang"], a: 0, e: "Kal farashil mabthuth = seperti kumbang/rama-rama yang bertebaran." },
              { q: "Gunung-ganang pada hari itu diibaratkan seperti…", o: ["bulu yang dihambur-hamburkan", "batu yang keras", "besi yang teguh", "awan yang putih"], a: 0, e: "Kal ‘ihnil manfush = seperti bulu (warna-warni) yang dihambur-hamburkan." },
              { q: "Orang yang berat timbangan amalnya akan…", o: ["berada dalam kehidupan yang memuaskan (syurga)", "masuk neraka Hawiyah", "terbang di angkasa", "terus tidur"], a: 0, e: "“Fa huwa fi ‘ishatir radiyah” — kehidupan yang diredai, iaitu syurga." },
              { q: "Neraka yang disebut pada akhir surah ini ialah…", o: ["Hawiyah", "Jahim", "Sa’ir", "Saqar"], a: 0, e: "“Fa ummuhu hawiyah … narun hamiyah” — neraka Hawiyah, api yang amat panas." }
            ]
          }
        ]
      },
      {
        id: "takathur-hafazan", jawi: "حفظ سورة التكاثر",
        title: "Hafazan — Surah At-Takathur",
        desc: "Hafaz Surah At-Takathur untuk diamalkan dalam solat.",
        activities: [
          {
            type: "memorize", title: "Hafaz Surah At-Takathur", gem: 20,
            instr: "Baca berulang-ulang. Gunakan butang “Sorok” untuk menguji hafazan anda.",
            verses: TAKATHUR
          },
          {
            type: "sort", title: "Susun Ayat dengan Betul", gem: 15,
            instr: "Susun semula ayat-ayat Surah At-Takathur mengikut urutan yang betul.",
            items: [
              "أَلْهَاكُمُ التَّكَاثُرُ",
              "حَتَّىٰ زُرْتُمُ الْمَقَابِرَ",
              "كَلَّا سَوْفَ تَعْلَمُونَ",
              "ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ",
              "كَلَّا لَوْ تَعْلَمُونَ عِلْمَ الْيَقِينِ",
              "لَتَرَوُنَّ الْجَحِيمَ",
              "ثُمَّ لَتَرَوُنَّهَا عَيْنَ الْيَقِينِ",
              "ثُمَّ لَتُسْأَلُنَّ يَوْمَئِذٍ عَنِ النَّعِيمِ"
            ],
            ar: true
          }
        ]
      },
      {
        id: "qariah-hafazan", jawi: "حفظ سورة القارعة",
        title: "Hafazan — Surah Al-Qariah",
        desc: "Hafaz Surah Al-Qariah dengan lancar dan bertajwid.",
        activities: [
          {
            type: "memorize", title: "Hafaz Surah Al-Qariah", gem: 20,
            instr: "Baca berulang-ulang sehingga lancar. Uji diri dengan butang “Sorok”.",
            verses: QARIAH
          },
          {
            type: "sort", title: "Susun Ayat dengan Betul", gem: 15,
            instr: "Susun semula sebahagian ayat Surah Al-Qariah mengikut urutan yang betul.",
            items: [
              "الْقَارِعَةُ",
              "وَمَا أَدْرَاكَ مَا الْقَارِعَةُ",
              "يَوْمَ يَكُونُ النَّاسُ كَالْفَرَاشِ الْمَبْثُوثِ",
              "وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنْفُوشِ",
              "فَأَمَّا مَنْ ثَقُلَتْ مَوَازِينُهُ",
              "فَهُوَ فِي عِيشَةٍ رَاضِيَةٍ",
              "فَأُمُّهُ هَاوِيَةٌ",
              "نَارٌ حَامِيَةٌ"
            ],
            ar: true
          }
        ]
      },
      {
        id: "ikhlas-kefahaman", jawi: "فهم سورة الإخلاص",
        title: "Kefahaman — Surah Al-Ikhlas",
        desc: "Fahami maksud dan pengajaran Surah Al-Ikhlas.",
        activities: [
          {
            type: "match", title: "Padankan Ayat dengan Maksud", gem: 15,
            instr: "Sentuh ayat di sebelah kiri, kemudian sentuh maksud yang betul di sebelah kanan.",
            pairs: [
              { l: "قُلْ هُوَ اللَّهُ أَحَدٌ", r: "Dialah Allah, Yang Maha Esa" },
              { l: "اللَّهُ الصَّمَدُ", r: "Allah tempat bergantung segala makhluk" },
              { l: "لَمْ يَلِدْ وَلَمْ يُولَدْ", r: "Dia tidak beranak dan tidak diperanakkan" },
              { l: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", r: "Tiada sesuatu pun yang setara dengan-Nya" }
            ],
            ar: true
          },
          {
            type: "quiz", title: "Kuiz Kefahaman Al-Ikhlas", gem: 15,
            instr: "Jawab soalan tentang maksud dan pengajaran Surah Al-Ikhlas.",
            questions: [
              { q: "Surah Al-Ikhlas mengandungi…", o: ["3 ayat", "4 ayat", "5 ayat", "6 ayat"], a: 1, e: "Surah Al-Ikhlas mengandungi 4 ayat." },
              { q: "“Al-Ahad” bermaksud Allah itu…", o: ["Maha Esa (Satu)", "Maha Kaya", "Maha Pemurah", "Maha Adil"], a: 0, e: "Ahad = Esa, tiada sekutu bagi-Nya." },
              { q: "“Allahus Samad” bermaksud…", o: ["Allah tempat bergantung segala makhluk", "Allah suka bermain", "Allah sentiasa marah", "Allah tidur"], a: 0, e: "As-Samad = tempat bergantung segala sesuatu; Allah tidak berhajat kepada sesuatu pun." },
              { q: "Pengajaran utama Surah Al-Ikhlas ialah…", o: ["Mengesakan Allah dan tidak menyekutukan-Nya", "Mengumpul harta", "Membina rumah yang besar", "Menjadi kuat"], a: 0, e: "Surah ini ialah asas tauhid: mengEsakan Allah SWT." },
              { q: "Ganjaran membaca Surah Al-Ikhlas ialah…", o: ["pahala yang besar, seperti membaca sepertiga al-Quran", "tiada pahala", "pahala sedikit sahaja", "hanya untuk kanak-kanak"], a: 0, e: "Hadis menyebut bacaan Surah Al-Ikhlas menyamai sepertiga al-Quran dari segi keutamaannya." }
            ]
          }
        ]
      },
      {
        id: "tajwid", jawi: "التجويد",
        title: "Tajwid — Mim Sakinah, Qalqalah & Tanda Waqaf",
        desc: "Kenali hukum mim sakinah, qalqalah dan tanda waqaf dalam bacaan.",
        activities: [
          {
            type: "match", title: "Padankan Istilah dengan Maksud", gem: 15,
            instr: "Padankan istilah tajwid dengan maksudnya.",
            pairs: [
              { l: "Idgham Mithlain", r: "Mim sakinah bertemu mim — dibaca dengung" },
              { l: "Ikhfa’ Syafawi", r: "Mim sakinah bertemu ba — disamarkan & dengung" },
              { l: "Izhar Syafawi", r: "Mim sakinah bertemu huruf lain — dibaca jelas" },
              { l: "Qalqalah", r: "Lantunan suara pada huruf ق ط ب ج د" },
              { l: "Tanda Waqaf", r: "Petunjuk berhenti atau terus ketika membaca" }
            ]
          },
          {
            type: "quiz", title: "Kuiz Tajwid", gem: 15,
            instr: "Jawab soalan tentang mim sakinah, qalqalah dan tanda waqaf.",
            questions: [
              { q: "Huruf qalqalah ada berapa?", o: ["3", "4", "5", "6"], a: 2, e: "Huruf qalqalah ada 5: ق ط ب ج د — disingkat “قُطْبُ جَدٍ”." },
              { q: "Mim sakinah bertemu huruf mim dibaca secara…", o: ["Idgham Mithlain (dengung)", "Izhar Syafawi", "Ikhfa’ Syafawi", "Qalqalah"], a: 0, e: "Dua mim bertemu → idgham mithlain, dibaca dengung dua harakat." },
              { q: "Mim sakinah bertemu huruf ba (ب) dibaca secara…", o: ["Ikhfa’ Syafawi", "Idgham Mithlain", "Izhar Syafawi", "Mad"], a: 0, e: "Ikhfa’ syafawi: mim disamarkan dan didengungkan." },
              { q: "Tanda waqaf “م” bermaksud…", o: ["wajib berhenti", "jangan berhenti", "lebih baik berhenti", "boleh berhenti atau terus"], a: 0, e: "Tanda mim (م) = waqaf lazim, iaitu berhenti yang dituntut." },
              { q: "Tanda “لا” pada mushaf bermaksud…", o: ["tidak boleh berhenti", "wajib berhenti", "harus berhenti", "berhenti lebih utama"], a: 0, e: "Tanda laa (لا) menunjukkan tidak dibenarkan berhenti pada tempat itu tanpa sebab." },
              { q: "Qalqalah kubra berlaku apabila…", o: ["huruf qalqalah berada di akhir perkataan dan kita berhenti padanya", "huruf qalqalah berada di awal ayat", "huruf alif bertemu lam", "huruf mim bertemu mim"], a: 0, e: "Qalqalah kubra berlaku apabila huruf qalqalah disukunkan kerana waqaf di hujung perkataan." }
            ]
          }
        ]
      }
    ]
  };

  /* ============================================================
     2. HADIS
     ============================================================ */
  var hadis = {
    id: "hadis", name: "Kota Hadis", jawi: "مدينة الحديث", icon: ICON.scroll,
    tagline: "Jejak Sabda Nabi", c1: "#f0a437", c2: "#8a4b06", glow: "#fbbf24",
    desc: "Ikuti sabda Rasulullah SAW. Hadis ialah panduan hidup selepas al-Quran.",
    x: 28, y: 58,
    units: [
      {
        id: "muliakan-tetamu", jawi: "إكرام الضيف",
        title: "Memuliakan Tetamu",
        desc: "Hadis tentang menghormati dan memuliakan tetamu.",
        activities: [
          {
            type: "story", title: "Kisah: Tetamu yang Dimuliakan", gem: 10,
            instr: "Baca kisah ini satu persatu. Tekan anak panah untuk meneruskan bacaan.",
            scenes: [
              { art: "🌟", t: "Sabda Rasulullah SAW", x: "“Barangsiapa beriman kepada Allah dan hari akhirat, maka hendaklah dia memuliakan tetamunya.” (Riwayat al-Bukhari & Muslim)" },
              { art: "🏡", t: "Nabi Ibrahim dan Tetamunya", x: "Nabi Ibrahim a.s. sentiasa bersedia menerima tetamu. Baginda tidak pernah makan sendirian dan sentiasa mencari orang untuk makan bersama." },
              { art: "🍽", t: "Hidangan Disegerakan", x: "Apabila tetamu datang, Nabi Ibrahim a.s. segera menyembelih anak lembu yang gemuk dan memanggangnya untuk dihidangkan. Baginda melayan mereka sendiri dengan penuh hormat." },
              { art: "😊", t: "Layanan yang Baik", x: "Memuliakan tetamu bukan hanya dengan makanan, tetapi dengan wajah yang ceria, kata-kata yang lembut dan layanan yang ikhlas." },
              { art: "🤲", t: "Iktibar untuk Kita", x: "Kita diajar supaya: menyambut tetamu dengan salam dan senyuman, menyediakan juadah sekadar kemampuan, memberi tempat yang sesuai, dan mendoakan tetamu ketika dia pulang." }
            ]
          },
          {
            type: "sort", title: "Susun Adab Melayani Tetamu", gem: 15,
            instr: "Susun langkah melayani tetamu mengikut urutan yang betul.",
            items: [
              "Menyambut tetamu dengan salam dan senyuman",
              "Menyediakan tempat yang bersih dan sesuai",
              "Menghidangkan juadah dan minuman",
              "Berbual dengan sopan dan melayan dengan baik",
              "Menghantar tetamu pulang dengan doa"
            ]
          },
          {
            type: "quiz", title: "Kuiz Hadis", gem: 15,
            instr: "Jawab soalan tentang hadis memuliakan tetamu.",
            questions: [
              { q: "Lengkapkan hadis: “Barangsiapa beriman kepada Allah dan hari akhirat, maka hendaklah dia…”", o: ["memuliakan tetamunya", "membenci jirannya", "memutuskan silaturahim", "meninggalkan solat"], a: 0, e: "Lafaz hadis: maka hendaklah dia memuliakan tetamunya." },
              { q: "Hadis ini mengajar kita supaya…", o: ["menghormati dan memuliakan tetamu", "tidak mahu menerima sesiapa", "menghalau tetamu", "minta tetamu membawa hadiah"], a: 0, e: "Memuliakan tetamu ialah akhlak mulia yang dituntut Islam." },
              { q: "Antara adab melayani tetamu ialah…", o: ["menyediakan juadah dan tempat yang sesuai", "membiarkan tetamu berdiri", "menunjukkan muka yang masam", "tidak bercakap langsung"], a: 0, e: "Layanan baik termasuk juadah, tempat duduk yang selesa dan kata-kata yang sopan." },
              { q: "Tempoh jamuan (adh-dhiyafah) menurut hadis ialah…", o: ["3 hari, selepas itu sedekah", "1 jam", "1 bulan", "selama-lamanya"], a: 0, e: "Rasulullah SAW bersabda: “Jamuan itu tiga hari; selepas itu dikira sedekah.”" },
              { q: "Perbuatan yang betul ketika tetamu hendak pulang ialah…", o: ["mendoakan kebaikan dan mengucapkan terima kasih", "terus menutup pintu", "meminta bayaran", "tidak mempedulikannya"], a: 0, e: "Doa baik untuk tetamu antara adab yang diajar oleh Rasulullah SAW." }
            ]
          }
        ]
      }
    ]
  };

  /* ============================================================
     3. AKIDAH
     ============================================================ */
  var akidah = {
    id: "akidah", name: "Benteng Akidah", jawi: "حصن العقيدة", icon: ICON.crescent,
    tagline: "Teguh Keyakinan", c1: "#3f63e0", c2: "#15206f", glow: "#7c9cff",
    desc: "Yakin kepada Allah, rasul-Nya, dan pertahankan akidah daripada segala ancaman.",
    x: 44, y: 74,
    units: [
      {
        id: "azim-hamid", jawi: "العظيم dan الحميد",
        title: "Nama Allah: Al-Azim & Al-Hamid",
        desc: "Yakini Allah Maha Agung dan Maha Terpuji serta amalkannya.",
        activities: [
          {
            type: "match", title: "Padankan Nama dengan Maksud", gem: 10,
            instr: "Padankan nama Allah dengan maksudnya.",
            pairs: [
              { l: "Al-Azim (العظيم)", r: "Maha Agung" },
              { l: "Al-Hamid (الحميد)", r: "Maha Terpuji" },
              { l: "Al-Ahad (الأحد)", r: "Maha Esa" },
              { l: "Al-Khaliq (الخالق)", r: "Maha Pencipta" }
            ]
          },
          {
            type: "quiz", title: "Kuiz Asma’ul Husna", gem: 15,
            instr: "Jawab soalan tentang Al-Azim dan Al-Hamid.",
            questions: [
              { q: "Al-Azim bermaksud Allah…", o: ["Maha Agung", "Maha Kecil", "Maha Pemalas", "Maha Lemah"], a: 0, e: "Al-Azim = Maha Agung, tiada sesuatu pun yang menandingi kebesaran-Nya." },
              { q: "Al-Hamid bermaksud Allah…", o: ["Maha Terpuji", "Maha Marah", "Maha Pelupa", "Maha Jauh"], a: 0, e: "Al-Hamid = Maha Terpuji, segala puji hanya layak bagi-Nya." },
              { q: "Cara mengamalkan sifat Al-Azim ialah…", o: ["mengagungkan Allah dengan mentaati perintah-Nya", "menakutkan kawan", "bermegah dengan diri", "membesar-besarkan harta"], a: 0, e: "Mengagungkan Allah ialah dengan taat, takut kepada-Nya dan menjauhi larangan-Nya." },
              { q: "Cara mengamalkan sifat Al-Hamid ialah…", o: ["sentiasa memuji Allah dan bersyukur, antaranya dengan mengucap Alhamdulillah", "memuji diri sendiri", "mengumpat orang lain", "berdiam diri sahaja"], a: 0, e: "Bersyukur dengan hati, lisan dan perbuatan ialah tanda mengenal Al-Hamid." },
              { q: "Ayat Kursi (Surah Al-Baqarah: 255) menyebut dua nama Allah, iaitu…", o: ["Al-Aliyyu dan Al-Azim", "Al-Hamid dan Al-Wadud", "Ar-Rahman dan Ar-Rahim", "Al-Malik dan Al-Quddus"], a: 0, e: "“وَهُوَ الْعَلِيُّ الْعَظِيمُ” — Dialah Yang Maha Tinggi lagi Maha Agung." }
            ]
          }
        ]
      },
      {
        id: "iman-rasul", jawi: "الإيمان بالرسل",
        title: "Beriman kepada Rasul",
        desc: "Fahami konsep beriman kepada rasul: sifat wajib, mustahil dan harus.",
        activities: [
          {
            type: "match", title: "Padankan Sifat dengan Maksud", gem: 15,
            instr: "Padankan sifat rasul dengan maksudnya.",
            pairs: [
              { l: "Siddiq", r: "Benar" },
              { l: "Amanah", r: "Dipercayai / jujur" },
              { l: "Tabligh", r: "Menyampaikan wahyu" },
              { l: "Fatanah", r: "Bijaksana" },
              { l: "Kazib", r: "Berdusta (mustahil bagi rasul)" }
            ]
          },
          {
            type: "quiz", title: "Kuiz Beriman kepada Rasul", gem: 15,
            instr: "Jawab soalan tentang sifat-sifat rasul.",
            questions: [
              { q: "Beriman kepada rasul bermaksud meyakini bahawa…", o: ["Allah mengutus rasul untuk menyampaikan wahyu kepada manusia", "rasul itu pencipta alam", "rasul tidak perlu dipercayai", "rasul hanya untuk satu kaum"], a: 0, e: "Rasul ialah utusan Allah yang menyampaikan wahyu dan teladan." },
              { q: "Sifat wajib bagi rasul ada…", o: ["4", "3", "5", "6"], a: 0, e: "Empat sifat wajib: Siddiq, Amanah, Tabligh, Fatanah." },
              { q: "Lawan bagi sifat Amanah ialah…", o: ["Khianat", "Kazib", "Kitman", "Baladah"], a: 0, e: "Amanah (dipercayai) lawannya Khianat (mengkhianati)." },
              { q: "Sifat harus bagi rasul ialah…", o: ["sifat kemanusiaan seperti makan, minum dan tidur", "berdusta", "bodoh", "menyembunyikan wahyu"], a: 0, e: "Rasul juga manusia biasa yang makan, minum, tidur dan boleh sakit; ia tidak mengurangkan kedudukan mereka." },
              { q: "Rasul yang bergelar Ulul Azmi ada…", o: ["5 orang", "25 orang", "4 orang", "12 orang"], a: 0, e: "Ulul Azmi: Nuh, Ibrahim, Musa, Isa dan Muhammad ‘alaihimus salam." },
              { q: "Kitman ialah sifat mustahil yang bermaksud…", o: ["menyembunyikan wahyu", "berdusta", "bodoh", "khianat"], a: 0, e: "Kitman = menyembunyikan apa yang wajib disampaikan." }
            ]
          }
        ]
      },
      {
        id: "pelihara-akidah", jawi: "الدفاع عن العقيدة",
        title: "Mempertahankan Akidah daripada Kufur & Nifaq",
        desc: "Kenali kufur dan nifaq serta cara menjaga akidah.",
        activities: [
          {
            type: "story", title: "Kisah: Dua Ancaman Akidah", gem: 10,
            instr: "Baca kisah ringkas ini untuk memahami kufur dan nifaq.",
            scenes: [
              { art: "🛡", t: "Akidah ialah Benteng", x: "Akidah ialah keyakinan yang teguh di dalam hati. Benteng ini mesti dijaga supaya tidak runtuh." },
              { art: "🌑", t: "Kufur", x: "Kufur bermaksud mengingkari atau menolak kebenaran Allah dan ajaran-Nya, sama ada dengan hati, lisan atau perbuatan." },
              { art: "🎭", t: "Nifaq", x: "Nifaq (munafik) ialah mengaku beriman dengan lidah, tetapi hatinya mengingkari. Rasulullah SAW bersabda: tanda munafik ada tiga — apabila bercakap berdusta, apabila berjanji memungkiri, dan apabila diberi amanah dia berkhianat." },
              { art: "📚", t: "Cara Mempertahankan Akidah", x: "Belajar ilmu tauhid, membaca dan menghayati al-Quran, sentiasa berdoa memohon keteguhan iman, bergaul dengan orang yang soleh, dan menjauhi syirik serta khurafat." },
              { art: "🤲", t: "Doa Tetap Iman", x: "“Ya Muqallibal qulub, tsabbit qalbi ‘ala dinik” — Wahai Tuhan yang membolak-balikkan hati, teguhkanlah hatiku atas agama-Mu." }
            ]
          },
          {
            type: "quiz", title: "Kuiz Kufur & Nifaq", gem: 15,
            instr: "Jawab soalan tentang kufur dan nifaq.",
            questions: [
              { q: "Kufur bermaksud…", o: ["mengingkari atau menolak kebenaran Allah", "bersyukur kepada Allah", "rajin beribadat", "membaca al-Quran"], a: 0, e: "Kufur ialah menutup kebenaran — tidak beriman kepada Allah dan Rasul-Nya." },
              { q: "Nifaq bermaksud…", o: ["mengaku beriman dengan lidah tetapi hati mengingkari", "sentiasa jujur", "melakukan umrah", "bersedekah"], a: 0, e: "Nifaq ialah kepalsuan iman: luarannya Islam, batinnya ingkar." },
              { q: "Antara tanda munafik menurut hadis ialah…", o: ["bercakap berdusta, memungkiri janji, mengkhianati amanah", "solat berjemaah", "membaca al-Quran", "menolong ibu bapa"], a: 0, e: "Tiga tanda munafik yang disebut dalam hadis Rasulullah SAW." },
              { q: "Cara mempertahankan akidah yang betul ialah…", o: ["mempelajari ilmu tauhid dan mengamalkan suruhan Allah", "membiarkan diri tanpa ilmu", "meniru segala budaya tanpa tapisan", "menjauhi rakan yang baik"], a: 0, e: "Ilmu, amal, doa dan persekitaran yang baik menjaga akidah kita." },
              { q: "Syirik ialah…", o: ["menyekutukan Allah dengan sesuatu", "mengesakan Allah", "bersyukur kepada Allah", "berdoa kepada Allah"], a: 0, e: "Syirik ialah dosa besar yang merosakkan akidah." }
            ]
          }
        ]
      }
    ]
  };

  /* ============================================================
     4. IBADAH
     ============================================================ */
  var ibadah = {
    id: "ibadah", name: "Lembah Ibadah", jawi: "وادي العبادة", icon: ICON.mosque,
    tagline: "Amal yang Menyuci", c1: "#0fb6d8", c2: "#0b4f6b", glow: "#67e8f9",
    desc: "Suci itu separuh daripada iman. Pelajari bersuci, azan, iqamah dan puasa.",
    x: 60, y: 52,
    units: [
      {
        id: "bersuci-najis", jawi: "الطهارة من النجاسة",
        title: "Bersuci daripada Najis",
        desc: "Kenali najis mukhaffafah, mutawassitah dan mughallazah serta cara membersihkannya.",
        activities: [
          {
            type: "match", title: "Padankan Najis dengan Cara Bersuci", gem: 15,
            instr: "Padankan jenis najis dengan cara membersihkannya.",
            pairs: [
              { l: "Najis Mukhaffafah (ringan)", r: "Memercik (merenjis) air pada tempat yang terkena" },
              { l: "Najis Mutawassitah (sederhana)", r: "Buang zat najis, kemudian basuh hingga hilang warna, bau dan rasa" },
              { l: "Najis Mughallazah (berat)", r: "Basuh 7 kali, salah satunya dengan tanah (atau bahan pencuci)" }
            ]
          },
          {
            type: "sim", title: "Simulasi: Langkah Bersuci", gem: 10,
            instr: "Tekan “Langkah Seterusnya” untuk melihat cara membersihkan najis mutawassitah.",
            steps: [
              { t: "Buang zat najis", d: "Buang atau hilangkan dahulu benda najis itu sendiri (contoh: darah, tahi, muntah)." },
              { t: "Basuh dengan air mutlak", d: "Gunakan air mutlak, iaitu air yang suci dan menyucikan (air paip, air hujan, air sungai)." },
              { t: "Gosok sehingga bersih", d: "Gosok sehingga hilang warna, bau dan rasa najis itu." },
              { t: "Pastikan suci", d: "Periksa semula tempat itu. Jika masih ada bau atau warna, ulangi basuhan." },
              { t: "Selesai — kini suci", d: "Alhamdulillah. Tempat itu suci dan kita boleh beribadat dengan sah." }
            ]
          },
          {
            type: "quiz", title: "Kuiz Bersuci", gem: 15,
            instr: "Jawab soalan tentang jenis-jenis najis.",
            questions: [
              { q: "Najis mukhaffafah ialah…", o: ["air kencing bayi lelaki yang belum makan selain susu ibu (belum 2 tahun)", "air kencing orang dewasa", "darah haid", "air liur anjing"], a: 0, e: "Najis ringan hanya melibatkan air kencing bayi lelaki yang belum memakan makanan selain susu ibunya." },
              { q: "Cara membersihkan najis mukhaffafah ialah…", o: ["memercik (merenjis) air pada tempat yang terkena", "membasuh 7 kali", "menyapu dengan tisu sahaja", "tidak perlu dibersihkan"], a: 0, e: "Cukup dengan memercik air sehingga mengenai seluruh tempat yang terkena najis." },
              { q: "Najis mughallazah ialah najis yang melibatkan…", o: ["anjing dan babi serta yang lahir daripadanya", "darah", "nanah", "air kencing"], a: 0, e: "Najis berat: anjing, babi dan keturunannya." },
              { q: "Cara menyucikan najis mughallazah ialah…", o: ["basuh 7 kali, salah satunya dengan tanah (atau bahan pencuci)", "basuh sekali sahaja", "jemur di bawah matahari", "lap dengan kain"], a: 0, e: "Basuhan pertama dicampur tanah atau bahan pencuci yang setara mengikut pandangan yang diamalkan." },
              { q: "Najis mutawassitah dibersihkan dengan…", o: ["membuang zat najis lalu membasuhnya hingga hilang warna, bau dan rasa", "memercik air sahaja", "membasuh 7 kali dengan tanah", "menganginkan sahaja"], a: 0, e: "Syarat suci: hilang zat, warna, bau dan rasa najis itu." }
            ]
          }
        ]
      },
      {
        id: "azan-iqamah", jawi: "الأذان والإقامة",
        title: "Konsep Azan dan Iqamah",
        desc: "Fahami maksud, hukum dan perbezaan azan dengan iqamah.",
        activities: [
          {
            type: "sort", title: "Susun Lafaz Azan", gem: 15,
            instr: "Susun lafaz azan mengikut urutan yang betul (dari atas ke bawah).",
            items: [
              "الله أكبر — Allahu Akbar (2 kali)",
              "أشهد أن لا إله إلا الله — Ashhadu an la ilaha illa Allah (2 kali)",
              "أشهد أن محمدا رسول الله — Ashhadu anna Muhammadar Rasulullah (2 kali)",
              "حي على الصلاة — Hayya ‘ala as-salah (2 kali)",
              "حي على الفلاح — Hayya ‘ala al-falah (2 kali)",
              "الله أكبر — Allahu Akbar (2 kali)",
              "لا إله إلا الله — La ilaha illa Allah (1 kali)"
            ]
          },
          {
            type: "quiz", title: "Kuiz Azan & Iqamah", gem: 15,
            instr: "Jawab soalan tentang azan dan iqamah.",
            questions: [
              { q: "Azan ialah…", o: ["seruan bahawa telah masuk waktu solat fardu", "doa selepas solat", "bacaan dalam solat", "zikir pagi"], a: 0, e: "Azan menandakan masuknya waktu solat fardu." },
              { q: "Iqamah ialah…", o: ["seruan bahawa solat akan didirikan (dimulakan)", "azan pertama", "doa qunut", "bacaan al-Quran"], a: 0, e: "Iqamah dilaungkan apabila solat berjemaah hendak dimulakan." },
              { q: "Lafaz tambahan dalam iqamah ialah…", o: ["قد قامت الصلاة (Qad qamatih salah)", "حي على الفلاح", "لا إله إلا الله", "الله أكبر"], a: 0, e: "“Qad qamatih salah” diselang-selingkan selepas Hayya ‘ala al-falah dalam iqamah." },
              { q: "Hukum azan bagi lelaki (bagi solat fardu di sesuatu tempat) ialah…", o: ["fardu kifayah", "wajib ‘ain ke atas setiap individu", "haram", "makruh"], a: 0, e: "Azan hukumnya fardu kifayah: jika sebahagian melakukannya, gugur dosa yang lain." },
              { q: "Perbezaan lain antara iqamah dan azan ialah…", o: ["iqamah dibaca lebih cepat dan tidak diulang-ulang panjang seperti azan", "iqamah lebih panjang", "iqamah tidak ada takbir", "iqamah dibaca dalam bahasa lain"], a: 0, e: "Bacaan iqamah lebih ringkas dan laju." }
            ]
          }
        ]
      },
      {
        id: "puasa-ramadan", jawi: "صوم رمضان",
        title: "Konsep Puasa Ramadan",
        desc: "Fahami puasa: syarat, rukun, pembatal dan hikmahnya.",
        activities: [
          {
            type: "match", title: "Batal atau Tidak Batal?", gem: 15,
            instr: "Padankan perbuatan dengan hukumnya terhadap puasa.",
            pairs: [
              { l: "Makan dan minum dengan sengaja", r: "Membatalkan puasa" },
              { l: "Makan atau minum kerana terlupa", r: "Tidak membatalkan puasa" },
              { l: "Muntah dengan sengaja", r: "Membatalkan puasa" },
              { l: "Tidur pada siang hari", r: "Tidak membatalkan puasa" },
              { l: "Mandi wajib sebelum Subuh", r: "Tidak membatalkan puasa" },
              { l: "Bersetubuh pada siang hari", r: "Membatalkan puasa (dan wajib qada serta kaffarah)" }
            ]
          },
          {
            type: "quiz", title: "Kuiz Puasa", gem: 15,
            instr: "Jawab soalan tentang puasa Ramadan.",
            questions: [
              { q: "Hukum berpuasa pada bulan Ramadan ialah…", o: ["wajib", "sunat", "haram", "makruh"], a: 0, e: "Puasa Ramadan ialah rukun Islam yang keempat, hukumnya wajib bagi yang memenuhi syarat." },
              { q: "Puasa bermaksud…", o: ["menahan diri daripada perkara yang membatalkan puasa dari terbit fajar hingga terbenam matahari", "tidur sepanjang hari", "tidak bercakap", "makan sedikit sahaja"], a: 0, e: "Disertai niat pada malam hari bagi puasa wajib." },
              { q: "Rukun puasa ialah…", o: ["niat dan menahan diri daripada perkara yang membatalkan", "makan sahur", "berbuka dengan kurma", "solat tarawih"], a: 0, e: "Dua rukun puasa: niat dan menahan diri (imsak)." },
              { q: "Antara syarat wajib puasa ialah…", o: ["Islam, baligh, berakal, mampu dan mukim", "kaya dan terkenal", "berumur 60 tahun", "tinggal di bandar"], a: 0, e: "Orang yang sakit atau musafir diberi keringanan untuk tidak berpuasa dan menggantikannya." },
              { q: "Hikmah puasa antaranya…", o: ["melatih kesabaran dan meningkatkan ketakwaan", "menjadikan kita kaya", "menjadikan kita sombong", "mengurangkan kawan"], a: 0, e: "Puasa melatih kita mengawal nafsu, merasai penderitaan orang miskin dan mendekatkan diri kepada Allah." }
            ]
          }
        ]
      }
    ]
  };

  /* ============================================================
     5. SIRAH
     ============================================================ */
  var sirah = {
    id: "sirah", name: "Denai Sirah", jawi: "درب السيرة", icon: ICON.compass,
    tagline: "Jejak Perjuangan", c1: "#8b5cf6", c2: "#3b1173", glow: "#c4b5fd",
    desc: "Ikuti perjalanan dakwah Rasulullah SAW dan ambil iktibar daripadanya.",
    x: 75, y: 68,
    units: [
      {
        id: "aqabah", jawi: "بيعة العقبة",
        title: "Iktibar Perjanjian Aqabah Pertama & Kedua",
        desc: "Peristiwa penerimaan masyarakat Yathrib terhadap dakwah Nabi SAW.",
        activities: [
          {
            type: "story", title: "Kisah Dua Perjanjian Aqabah", gem: 10,
            instr: "Ikuti kisah ini. Perhatikan tahun dan bilangan orang yang terlibat.",
            scenes: [
              { art: "🕋", t: "Mencari Pembela", x: "Setelah pemboikotan kaum Quraisy dan kematian Abu Talib serta Khadijah, Rasulullah SAW terus berdakwah kepada kabilah-kabilah Arab yang datang menunaikan haji di Makkah." },
              { art: "🤝", t: "Aqabah Pertama (Tahun ke-12 Kenabian)", x: "Seramai 12 orang lelaki dari Yathrib (Madinah) berjumpa Nabi SAW di satu tempat bernama Aqabah, dekat Mina. Mereka berjanji: tidak menyekutukan Allah, tidak mencuri, tidak berzina, tidak membunuh anak, tidak membuat fitnah, dan taat kepada Nabi dalam perkara kebaikan." },
              { art: "📖", t: "Utusan ke Yathrib", x: "Nabi SAW menghantar Mus’ab bin Umair bersama mereka untuk mengajar al-Quran dan mengajak penduduk Yathrib memeluk Islam. Usaha ini membuahkan hasil yang besar." },
              { art: "🛡", t: "Aqabah Kedua (Tahun ke-13 Kenabian)", x: "Seramai 73 lelaki dan 2 wanita datang menemui Nabi SAW pada musim haji berikut. Mereka berjanji setia dan berikrar akan mempertahankan Nabi SAW sebagaimana mereka mempertahankan keluarga sendiri. Nabi SAW memilih 12 orang pemimpin (nuqaba’)." },
              { art: "💡", t: "Iktibar", x: "Iktibar: dakwah memerlukan perancangan rapi, kesabaran dan pengorbanan. Persaudaraan kerana iman lebih kuat daripada pertalian darah. Kita juga mesti berani menyebarkan kebaikan." }
            ]
          },
          {
            type: "quiz", title: "Kuiz Aqabah", gem: 15,
            instr: "Jawab soalan tentang Perjanjian Aqabah.",
            questions: [
              { q: "Perjanjian Aqabah Pertama berlaku pada tahun ke…", o: ["10", "11", "12", "13"], a: 2, e: "Aqabah Pertama berlaku pada tahun ke-12 kenabian." },
              { q: "Bilangan lelaki Yathrib dalam Aqabah Pertama ialah…", o: ["12 orang", "70 orang", "73 orang", "25 orang"], a: 0, e: "12 orang lelaki yang kemudiannya menjadi asas dakwah di Yathrib." },
              { q: "Perjanjian Aqabah Kedua berlaku pada tahun ke…", o: ["13 kenabian", "12 kenabian", "10 kenabian", "15 kenabian"], a: 0, e: "Aqabah Kedua berlaku pada tahun berikut, iaitu tahun ke-13 kenabian." },
              { q: "Bilangan peserta Aqabah Kedua ialah…", o: ["73 lelaki dan 2 wanita", "12 lelaki", "100 lelaki", "5 wanita"], a: 0, e: "73 lelaki dan 2 wanita; Nabi SAW melantik 12 pemimpin (nuqaba’)." },
              { q: "Siapakah utusan Nabi SAW yang mengajar al-Quran di Yathrib?", o: ["Mus’ab bin Umair", "Abu Bakar", "Umar al-Khattab", "Ali bin Abi Talib"], a: 0, e: "Mus’ab bin Umair ialah duta pertama yang diutus ke Yathrib." }
            ]
          }
        ]
      },
      {
        id: "fatanah", jawi: "صفة الفطانة",
        title: "Iktibar Keunggulan Sifat Fatanah Nabi SAW",
        desc: "Rumuskan iktibar kebijaksanaan Nabi Muhammad SAW.",
        activities: [
          {
            type: "story", title: "Kisah Kebijaksanaan Nabi SAW", gem: 10,
            instr: "Baca contoh-contoh kebijaksanaan (fatanah) Rasulullah SAW.",
            scenes: [
              { art: "🕋", t: "Hajarul Aswad", x: "Ketika Kaabah dibina semula, kaum Quraisy bertelingkah tentang siapa yang berhak meletakkan Hajarul Aswad. Nabi SAW membentangkan sehelai kain, meletakkan batu itu di atasnya, lalu meminta setiap ketua kabilah memegang tepi kain bersama-sama. Semua puas hati." },
              { art: "⛏", t: "Perang Khandaq", x: "Nabi SAW menerima cadangan Salman al-Farisi untuk menggali parit di sekeliling Madinah. Strategi ini menyebabkan pasukan berkuda Quraisy tidak dapat menembusi kota." },
              { art: "📜", t: "Perjanjian Hudaibiyah", x: "Nabi SAW menerima syarat yang kelihatan berat sebelah demi mengelakkan peperangan. Hasilnya, Islam berkembang pesat dan Makkah akhirnya dibuka tanpa pertumpahan darah yang besar." },
              { art: "🗺", t: "Perancangan Hijrah", x: "Setiap langkah hijrah dirancang dengan teliti: laluan yang berbeza, tempat persembunyian di Gua Thur, peranan setiap sahabat, dan pemandu yang dipercayai." },
              { art: "💡", t: "Iktibar untuk Kita", x: "Fatanah bermaksud bijaksana. Kita perlu berfikir sebelum bertindak, mendengar pandangan orang lain, merancang dengan teliti dan memilih jalan damai." }
            ]
          },
          {
            type: "match", title: "Padankan Peristiwa dengan Bukti Fatanah", gem: 15,
            instr: "Padankan peristiwa dengan bukti kebijaksanaan Nabi SAW.",
            pairs: [
              { l: "Hajarul Aswad", r: "Menyatukan semua kabilah dengan kain yang dipegang bersama" },
              { l: "Perang Khandaq", r: "Menerima cadangan menggali parit daripada Salman al-Farisi" },
              { l: "Perjanjian Hudaibiyah", r: "Memilih perdamaian walaupun syarat kelihatan berat" },
              { l: "Hijrah ke Madinah", r: "Perancangan laluan, peranan dan tempat persembunyian yang rapi" }
            ]
          }
        ]
      },
      {
        id: "dakwah-nabi", jawi: "دعوة النبي",
        title: "Dakwah Nabi SAW & Keperibadian Baginda",
        desc: "Teladani keperibadian Rasulullah SAW dalam berdakwah.",
        activities: [
          {
            type: "match", title: "Padankan Sifat dengan Contoh", gem: 15,
            instr: "Padankan sifat mulia Nabi SAW dengan contoh perbuatannya.",
            pairs: [
              { l: "Sabar", r: "Terus berdakwah walaupun dicaci di Taif" },
              { l: "Pemaaf", r: "Mengampunkan penduduk Makkah ketika Fathu Makkah" },
              { l: "Amanah", r: "Digelar Al-Amin (yang dipercayai) sejak muda" },
              { l: "Penyayang", r: "Memuliakan kanak-kanak dan orang lemah" }
            ]
          },
          {
            type: "quiz", title: "Kuiz Dakwah Nabi", gem: 15,
            instr: "Jawab soalan tentang perjalanan dakwah Rasulullah SAW.",
            questions: [
              { q: "Dakwah Nabi SAW secara rahsia berlangsung selama…", o: ["3 tahun", "10 bulan", "13 tahun", "1 tahun"], a: 0, e: "Dakwah secara rahsia selama kira-kira 3 tahun sebelum diperintahkan secara terang-terangan." },
              { q: "Nabi SAW berdakwah secara terang-terangan di…", o: ["Bukit Safa", "Bukit Uhud", "Gua Hira’", "Padang Arafah"], a: 0, e: "Baginda memulakan dakwah terang-terangan di Bukit Safa dengan memanggil kaum Quraisy." },
              { q: "Ketika pembukaan Makkah, Nabi SAW…", o: ["mengampunkan penduduk Quraisy", "menghukum semua mereka", "mengusir mereka", "tidak masuk ke Makkah"], a: 0, e: "Baginda bersabda: “Pergilah, kamu semua bebas.”" },
              { q: "Sifat utama yang membantu kejayaan dakwah Nabi SAW ialah…", o: ["akhlak yang mulia dan kesabaran", "kekayaan", "kekuatan tentera", "keturunan"], a: 0, e: "Akhlak Rasulullah SAW ialah al-Quran yang berjalan." },
              { q: "Kita boleh meneladani Nabi SAW dalam berdakwah dengan…", o: ["berkata lembut, sabar dan berhikmah", "memaksa orang lain", "marah-marah", "menjauhi masyarakat"], a: 0, e: "Dakwah dengan hikmah dan pengajaran yang baik." }
            ]
          }
        ]
      },
      {
        id: "hijrah", jawi: "الهجرة",
        title: "Peristiwa Hijrah & Iktibar Perjalanan Dakwah",
        desc: "Ikuti perjalanan hijrah Rasulullah SAW dari Makkah ke Madinah.",
        activities: [
          {
            type: "story", title: "Kisah Hijrah yang Bersejarah", gem: 10,
            instr: "Ikuti perjalanan hijrah langkah demi langkah.",
            scenes: [
              { art: "🗡", t: "Rancangan Jahat Quraisy", x: "Pemimpin Quraisy bersepakat di Dar an-Nadwah untuk membunuh Rasulullah SAW. Allah SWT memberitahu Nabi melalui wahyu." },
              { art: "🌙", t: "Malam Berlepas", x: "Nabi SAW meminta Ali bin Abi Talib tidur di tempat baginda. Nabi SAW keluar dengan membaca ayat-ayat Yasin, lalu Allah menjadikan mereka tidak melihat baginda." },
              { art: "🕸", t: "Di Gua Thur", x: "Nabi SAW bersama Abu Bakar as-Siddiq bersembunyi di Gua Thur selama 3 malam. Sarang labah-labah dan burung merpati menyebabkan pencari menyangka gua itu kosong." },
              { art: "🐎", t: "Dalam Perjalanan", x: "Suraqah bin Malik mengejar untuk mendapatkan hadiah, tetapi kudanya tersungkur. Nabi SAW mendoakannya dan Suraqah berjanji tidak membocorkan rahsia. Di khemah Ummu Ma’bad, seekor kambing kurus mengeluarkan susu yang banyak dengan izin Allah." },
              { art: "🕌", t: "Tiba di Quba’ dan Madinah", x: "Di Quba’, Nabi SAW membina Masjid Quba’ — masjid pertama dalam Islam. Penduduk Madinah menyambut baginda dengan nyanyian “Tala’al Badru ‘Alaina”. Baginda mempersaudarakan Muhajirin dan Ansar serta membina Masjid Nabawi." },
              { art: "💡", t: "Iktibar", x: "Hijrah mengajar kita tentang tawakal selepas berusaha bersungguh-sungguh, persaudaraan Islam, pengorbanan harta dan nyawa, serta perancangan yang rapi. Hijrah juga menjadi permulaan takwim Islam." }
            ]
          },
          {
            type: "sort", title: "Susun Peristiwa Hijrah", gem: 15,
            instr: "Susun peristiwa hijrah mengikut urutan yang betul.",
            items: [
              "Quraisy berkomplot di Dar an-Nadwah untuk membunuh Nabi SAW",
              "Ali bin Abi Talib tidur di tempat Nabi SAW",
              "Nabi SAW dan Abu Bakar bersembunyi di Gua Thur selama 3 malam",
              "Perjalanan ke Madinah melalui jalan pantai",
              "Tiba di Quba’ dan membina Masjid Quba’",
              "Masuk ke Madinah dan membina Masjid Nabawi"
            ]
          },
          {
            type: "quiz", title: "Kuiz Hijrah", gem: 15,
            instr: "Jawab soalan tentang peristiwa hijrah.",
            questions: [
              { q: "Berapa lamakah Nabi SAW bersembunyi di Gua Thur?", o: ["3 malam", "1 malam", "10 hari", "40 hari"], a: 0, e: "Nabi SAW dan Abu Bakar berada di Gua Thur selama 3 malam." },
              { q: "Siapakah yang menemani Nabi SAW berhijrah?", o: ["Abu Bakar as-Siddiq", "Umar al-Khattab", "Uthman bin Affan", "Bilal bin Rabah"], a: 0, e: "Abu Bakar as-Siddiq ialah sahabat yang menemani Rasulullah SAW berhijrah." },
              { q: "Siapakah yang tidur di tempat Nabi SAW pada malam hijrah?", o: ["Ali bin Abi Talib", "Hamzah", "Abu Bakar", "Zaid bin Harithah"], a: 0, e: "Ali bin Abi Talib menggantikan tempat tidur Nabi SAW bagi mengelirukan Quraisy." },
              { q: "Masjid pertama yang dibina dalam perjalanan hijrah ialah…", o: ["Masjid Quba’", "Masjid Nabawi", "Masjidil Haram", "Masjid al-Aqsa"], a: 0, e: "Masjid Quba’ dibina di Quba’ sebelum Nabi SAW memasuki Madinah." },
              { q: "Takwim Islam bermula pada peristiwa…", o: ["Hijrah Nabi SAW ke Madinah", "Kelahiran Nabi SAW", "Perang Badar", "Fathu Makkah"], a: 0, e: "Khalifah Umar al-Khattab menetapkan tahun hijrah sebagai permulaan takwim Islam." }
            ]
          }
        ]
      }
    ]
  };

  /* ============================================================
     6. ADAB
     ============================================================ */
  var adab = {
    id: "adab", name: "Taman Adab", jawi: "حديقة الأدب", icon: ICON.people,
    tagline: "Budinya Beradab", c1: "#f062a5", c2: "#7c1f4e", glow: "#f9a8d4",
    desc: "Berpakaian, beriadah, bersama guru dan bermasyarakat dengan penuh adab.",
    x: 86, y: 32,
    units: [
      {
        id: "adab-pakaian", jawi: "أدب اللباس",
        title: "Adab Berpakaian",
        desc: "Menutup aurat, ciri pakaian menepati syarak dan dalilnya.",
        activities: [
          {
            type: "match", title: "Menepati Syarak atau Tidak?", gem: 15,
            instr: "Padankan ciri pakaian dengan hukumnya.",
            pairs: [
              { l: "Menutup aurat sepenuhnya", r: "Menepati syarak" },
              { l: "Longgar dan tidak menampakkan bentuk tubuh", r: "Menepati syarak" },
              { l: "Kain yang nipis dan jarang", r: "Tidak menepati syarak" },
              { l: "Ketat sehingga menampakkan bentuk tubuh", r: "Tidak menepati syarak" },
              { l: "Bersih dan kemas", r: "Menepati syarak" },
              { l: "Menyerupai pakaian yang menjadi lambang maksiat", r: "Tidak menepati syarak" }
            ]
          },
          {
            type: "quiz", title: "Kuiz Adab Berpakaian", gem: 15,
            instr: "Jawab soalan tentang adab berpakaian.",
            questions: [
              { q: "Hukum menutup aurat bagi orang Islam ialah…", o: ["wajib", "sunat", "haram", "makruh"], a: 0, e: "Menutup aurat itu wajib dalam solat dan di hadapan orang yang bukan mahram." },
              { q: "Aurat lelaki ialah…", o: ["antara pusat dan lutut", "seluruh badan", "kepala sahaja", "tangan sahaja"], a: 0, e: "Aurat lelaki: dari pusat hingga lutut." },
              { q: "Aurat perempuan di hadapan lelaki ajnabi (bukan mahram) ialah…", o: ["seluruh tubuh kecuali muka dan dua tapak tangan", "tangan sahaja", "rambut sahaja", "tiada aurat"], a: 0, e: "Inilah pendapat jumhur ulama berdasarkan dalil al-Quran dan hadis." },
              { q: "Antara ciri pakaian yang menepati syarak ialah…", o: ["menutup aurat, longgar dan tidak jarang", "ketat dan bergaya", "nipis dan bergemerlapan", "pendek sahaja"], a: 0, e: "Pakaian mesti menutup aurat, tidak ketat, tidak jarang dan bersih." },
              { q: "Sunah Rasulullah SAW ketika memakai pakaian antaranya…", o: ["memulakan dengan anggota kanan dan membaca doa memakai pakaian", "memakai dari kiri dahulu", "tidur selepas memakai baju", "memakai baju hitam sahaja"], a: 0, e: "Doanya: “Alhamdulillahillazi kasani hadza wa razaqanihi min ghairi haulin minni wa la quwwah.”" }
            ]
          }
        ]
      },
      {
        id: "adab-riadah", jawi: "أدب الرياضة",
        title: "Adab Beriadah",
        desc: "Bersenam dan beriadah mengikut adab yang menepati syarak.",
        activities: [
          {
            type: "sort", title: "Susun Adab Beriadah", gem: 15,
            instr: "Susun adab beriadah mengikut urutan yang munasabah.",
            items: [
              "Berniat kerana Allah dan menjaga kesihatan",
              "Memakai pakaian yang menutup aurat",
              "Memilih kawasan yang sesuai dan selamat",
              "Menjaga kebersihan diri dan persekitaran",
              "Memelihara semangat kesukanan — tidak marah atau mencederakan lawan",
              "Berhenti seketika apabila masuk waktu solat"
            ]
          },
          {
            type: "quiz", title: "Kuiz Adab Beriadah", gem: 15,
            instr: "Jawab soalan tentang adab beriadah.",
            questions: [
              { q: "Hukum beriadah (bersenam) pada asasnya ialah…", o: ["harus, dengan syarat menepati syarak", "wajib", "haram", "makruh"], a: 0, e: "Islam menggalakkan umatnya sihat, asalkan aktiviti itu menepati syarak." },
              { q: "Antara adab beriadah ialah…", o: ["menutup aurat dan menjaga kebersihan", "bermain sehingga lupa solat", "mencederakan lawan", "bertaruh wang"], a: 0, e: "Aurat, kebersihan, keselamatan dan solat mesti dijaga." },
              { q: "Perkara yang dilarang ketika beriadah ialah…", o: ["berjudi dan mempertaruhkan wang", "bermain secara berpasukan", "memanaskan badan", "minum air"], a: 0, e: "Judi haram dan merosakkan semangat kesukanan." },
              { q: "Semangat kesukanan yang baik ialah…", o: ["menerima kekalahan dengan reda dan mengucap tahniah kepada pemenang", "marah apabila kalah", "menyalahkan rakan sepasukan", "meninggalkan padang"], a: 0, e: "Akhlak mulia lebih penting daripada kemenangan." },
              { q: "Jika waktu solat masuk ketika sedang beriadah, kita hendaklah…", o: ["berhenti dan menunaikan solat", "terus bermain", "menunggu sehingga selesai", "pulang tanpa solat"], a: 0, e: "Solat lebih utama daripada permainan." }
            ]
          }
        ]
      },
      {
        id: "adab-guru", jawi: "أدب المعلم",
        title: "Adab terhadap Guru",
        desc: "Hormati guru sebagai pewaris ilmu para nabi.",
        activities: [
          {
            type: "match", title: "Padankan Situasi dengan Adab", gem: 15,
            instr: "Padankan situasi dengan adab yang paling sesuai.",
            pairs: [
              { l: "Guru masuk ke kelas", r: "Memberi salam dan bangun menghormati dengan sopan" },
              { l: "Guru sedang mengajar", r: "Mendengar dengan khusyuk dan tidak mencelah" },
              { l: "Hendak bertanya sesuatu", r: "Mengangkat tangan dan menunggu giliran" },
              { l: "Mendapat teguran guru", r: "Menerima dengan hati terbuka dan memohon maaf" },
              { l: "Selepas belajar", r: "Mendoakan kebaikan guru dan mengucapkan terima kasih" }
            ]
          },
          {
            type: "quiz", title: "Kuiz Adab terhadap Guru", gem: 15,
            instr: "Jawab soalan tentang adab terhadap guru.",
            questions: [
              { q: "Guru diibaratkan sebagai…", o: ["pewaris ilmu para nabi", "penjaga sekolah sahaja", "kawan bermain", "penyelia kantin"], a: 0, e: "Ulama dan guru ialah pewaris para nabi." },
              { q: "Semasa guru mengajar, kita hendaklah…", o: ["mendengar dengan khusyuk dan tidak mencelah", "berbual dengan kawan", "bermain telefon", "keluar kelas"], a: 0, e: "Memberi perhatian penuh ialah tanda menghargai ilmu." },
              { q: "Adab bertanya kepada guru ialah…", o: ["mengangkat tangan dan menggunakan bahasa yang sopan", "memotong cakap guru", "bercakap kuat", "bertanya secara mengejek"], a: 0, e: "Bertanyalah dengan sopan pada masa yang sesuai." },
              { q: "Jika guru menegur kesalahan kita, kita hendaklah…", o: ["menerima teguran dan memperbaiki diri", "marah kepada guru", "membalas dengan kasar", "mengadu kepada kawan"], a: 0, e: "Teguran guru ialah tanda kasih sayang dan didikan." },
              { q: "Antara adab lain terhadap guru ialah…", o: ["tidak membuka aib guru dan mendoakan kebaikan mereka", "menceritakan keburukan guru", "menjauhi guru", "meniru tulisan tangan guru"], a: 0, e: "Menjaga maruah guru ialah sebahagian adab menuntut ilmu." }
            ]
          }
        ]
      },
      {
        id: "adab-gaul", jawi: "أدب المعاشرة",
        title: "Adab Bergaul dalam Keluarga & Masyarakat",
        desc: "Adab bersama keluarga, jiran, di masjid dan menaiki kenderaan.",
        activities: [
          {
            type: "match", title: "Padankan Tempat dengan Adab", gem: 15,
            instr: "Padankan tempat dengan adab yang betul.",
            pairs: [
              { l: "Di rumah bersama ibu bapa", r: "Berkata lemah lembut, tidak mengherdik, dan membantu mereka" },
              { l: "Bersama jiran", r: "Memberi salam, menziarahi bila sakit, dan tidak mengganggu" },
              { l: "Di masjid / surau", r: "Masuk dengan kaki kanan, solat tahiyyatul masjid dan tidak bising" },
              { l: "Menaiki kenderaan", r: "Membaca doa, duduk tertib dan memberi laluan kepada yang memerlukan" }
            ]
          },
          {
            type: "quiz", title: "Kuiz Adab Bergaul", gem: 15,
            instr: "Jawab soalan tentang adab dalam keluarga dan masyarakat.",
            questions: [
              { q: "Adab masuk ke masjid ialah…", o: ["mendahului kaki kanan dan membaca doa masuk masjid", "mendahului kaki kiri", "berlari-lari", "bercakap kuat"], a: 0, e: "Sunah mendahului kaki kanan ketika masuk dan kaki kiri ketika keluar." },
              { q: "Solat sunat yang dilakukan apabila masuk masjid ialah…", o: ["solat sunat tahiyyatul masjid", "solat duha", "solat witir", "solat istikharah"], a: 0, e: "Dua rakaat tahiyyatul masjid sebagai tanda memuliakan rumah Allah." },
              { q: "Doa menaiki kenderaan bermaksud…", o: ["Maha Suci Tuhan yang menundukkan kenderaan ini untuk kami", "Semoga cepat sampai", "Terima kasih pemandu", "Selamat jalan"], a: 0, e: "“Subhanallazi sakhkhara lana hadza wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun.”" },
              { q: "Adab terhadap ibu bapa menurut al-Quran ialah…", o: ["berkata dengan lemah lembut dan tidak mengherdik “uff”", "meninggikan suara", "tidak menghiraukan mereka", "menyuruh mereka bekerja"], a: 0, e: "Allah berfirman supaya berbuat baik kepada ibu bapa dan tidak mengucapkan kata-kata kesat kepada mereka." },
              { q: "Antara adab berjiran yang dituntut ialah…", o: ["menziarahi jiran yang sakit dan menutup aib mereka", "memasang radio kuat", "membuang sampah di halaman jiran", "tidak mahu bertegur sapa"], a: 0, e: "Malaikat Jibril sentiasa berpesan tentang jiran sehingga Nabi SAW menyangka jiran akan mewarisi harta." }
            ]
          }
        ]
      }
    ]
  };

  /* ============================================================
     7. JAWI
     ============================================================ */
  var jawi = {
    id: "jawi", name: "Istana Jawi", jawi: "قصر الجاوي", icon: ICON.pen,
    tagline: "Tulisan Warisan", c1: "#e2b23c", c2: "#7a4c05", glow: "#fde68a",
    desc: "Kuasai tulisan Jawi: hamzah, suku kata, hukum ejaan, imbuhan dan khat.",
    x: 62, y: 16,
    units: [
      {
        id: "huruf-hamzah", jawi: "همزة",
        title: "Kedudukan Huruf Hamzah",
        desc: "Kenal, baca dan tulis perkataan yang mengandungi huruf hamzah.",
        activities: [
          {
            type: "match", title: "Padankan Kedudukan Hamzah", gem: 15,
            instr: "Padankan kedudukan hamzah dengan contohnya.",
            pairs: [
              { l: "Hamzah di atas alif (أ)", r: "أ — contoh: مَسْأَلة (masalah)" },
              { l: "Hamzah di bawah alif (إ)", r: "إ — contoh: إيمان (iman)" },
              { l: "Hamzah sejajar (ء)", r: "ء — contoh: ماء (ma’)" }
            ],
            ar: true
          },
          {
            type: "quiz", title: "Kuiz Huruf Hamzah", gem: 15,
            instr: "Jawab soalan tentang kedudukan huruf hamzah.",
            questions: [
              { q: "Terdapat berapa kedudukan huruf hamzah yang dipelajari?", o: ["2", "3", "4", "5"], a: 1, e: "Tiga kedudukan: di atas alif, di bawah alif, dan sejajar (di atas garis)." },
              { q: "Hamzah di bawah alif ditulis sebagai…", o: ["إ", "أ", "ء", "ؤ"], a: 0, e: "Hamzah yang terletak di bawah huruf alif ialah إ (dengan baris kasrah di bawahnya)." },
              { q: "Perkataan “إيمان” (iman) menunjukkan hamzah berada…", o: ["di bawah alif", "di atas alif", "sejajar", "di atas wau"], a: 0, e: "Hamzah pada perkataan iman terletak di bawah alif." },
              { q: "Hamzah sejajar bermaksud hamzah yang…", o: ["terletak sama paras dengan huruf, iaitu di atas garis", "terletak di bawah huruf", "terletak di atas huruf sahaja", "tidak ditulis"], a: 0, e: "Hamzah sejajar ditulis sejajar dengan huruf yang mendahuluinya (di atas garis)." },
              { q: "Antara berikut, yang manakah menunjukkan hamzah di atas alif?", o: ["أ", "إ", "ؤ", "ئ"], a: 0, e: "أ = hamzah di atas alif (dengan baris fathah di atasnya)." }
            ]
          }
        ]
      },
      {
        id: "suku-kata", jawi: "المقطع المغلق",
        title: "Suku Kata Tertutup dengan Vokal A",
        desc: "Kenali suku kata tertutup yang berakhir dengan huruf konsonan.",
        activities: [
          {
            type: "quiz", title: "Kuiz Suku Kata Tertutup", gem: 15,
            instr: "Jawab soalan tentang suku kata tertutup dengan vokal A.",
            questions: [
              { q: "Suku kata tertutup ialah suku kata yang berakhir dengan…", o: ["huruf konsonan (huruf mati / bersukun)", "huruf vokal", "huruf alif sahaja", "dua huruf vokal"], a: 0, e: "Suku kata tertutup berakhir dengan konsonan, berbeza dengan suku kata terbuka yang berakhir dengan vokal." },
              { q: "Contoh suku kata tertutup dengan vokal A ialah…", o: ["كَن (kan)", "با (ba)", "كو (ku)", "بي (bi)"], a: 0, e: "كَن = “kan” berakhir dengan huruf nun yang bersukun." },
              { q: "Perkataan “كِتاب” (kitab) terdiri daripada suku kata…", o: ["ki — tab", "kit — ab", "k — i — t — a — b", "kita — b"], a: 0, e: "“ki” terbuka, “tab” tertutup dengan vokal A." },
              { q: "Dalam perkataan “إِسْلام” (Islam), suku kata tertutupnya ialah…", o: ["lam", "is", "s", "i"], a: 0, e: "“is” terbuka, “lam” tertutup (berakhir dengan mim bersukun) dan berbunyi a." },
              { q: "Suku kata terbuka pula berakhir dengan…", o: ["huruf vokal (a, i, u)", "huruf konsonan", "tanpa bunyi", "huruf hamzah"], a: 0, e: "Contoh: با (ba), بي (bi), كو (ku)." }
            ]
          },
          {
            type: "trace", title: "Latih Menulis: كَن", gem: 10,
            instr: "Surih perkataan di bawah dengan jari atau tetikus, kemudian tekan “Semak”.",
            word: "كَن · كِتاب"
          }
        ]
      },
      {
        id: "hukum-ewa", jawi: "حكم اي-وا",
        title: "Hukum E-Wa (E dan Wau)",
        desc: "Kenali penggunaan huruf wau dan ya untuk bunyi vokal dalam Jawi.",
        activities: [
          {
            type: "match", title: "Padankan Bunyi dengan Huruf", gem: 15,
            instr: "Padankan bunyi vokal dengan huruf Jawi yang mewakilinya.",
            pairs: [
              { l: "Bunyi “o” (roti)", r: "و (wau) — روتي" },
              { l: "Bunyi “e” taling (meja)", r: "ي (ya) — ميجا" },
              { l: "Bunyi “u” (buku)", r: "و (wau) — بوكو" },
              { l: "Bunyi “i” (lima)", r: "ي (ya) — ليما" }
            ],
            ar: true
          },
          {
            type: "quiz", title: "Kuiz Hukum E-Wa", gem: 15,
            instr: "Jawab soalan tentang ejaan bunyi ‘o’ dan ‘e’ taling dalam Jawi.",
            questions: [
              { q: "Perkataan “roti” ditulis dalam Jawi sebagai…", o: ["روتي", "ريتي", "راتي", "روتا"], a: 0, e: "Bunyi “o” ditulis dengan huruf و (wau): روتي." },
              { q: "Bunyi “e” taling seperti dalam perkataan “meja” ditulis dengan huruf…", o: ["ي (ya)", "و (wau)", "ا (alif)", "ن (nun)"], a: 0, e: "“meja” ditulis ميجا — bunyi e taling diwakili oleh huruf ya." },
              { q: "Perkataan “meja” ditulis dalam Jawi sebagai…", o: ["ميجا", "موجا", "مجى", "ميچا"], a: 0, e: "ميجا = me-ja." },
              { q: "Huruf و (wau) dalam perkataan “بوكو” (buku) mewakili bunyi…", o: ["u", "o", "e", "a"], a: 0, e: "بوكو = buku; wau itu berbunyi u." },
              { q: "Kebolehan memilih huruf yang tepat penting kerana…", o: ["ia menentukan sebutan dan makna perkataan Jawi yang betul", "supaya tulisan nampak cantik sahaja", "supaya cepat siap", "tidak ada sebab"], a: 0, e: "Ejaan yang tepat menjaga makna dan memudahkan pembaca." }
            ]
          }
        ]
      },
      {
        id: "imbuhan-ber", jawi: "سابقة «بر»",
        title: "Imbuhan Awalan “Ber”",
        desc: "Tulis perkataan berimbuhan awalan “ber” dengan ejaan Jawi yang betul.",
        activities: [
          {
            type: "match", title: "Padankan Rumi dengan Jawi", gem: 15,
            instr: "Padankan perkataan Rumi dengan ejaan Jawinya.",
            pairs: [
              { l: "bermain", r: "برمين" },
              { l: "berjalan", r: "برجالن" },
              { l: "bersama", r: "برسام" },
              { l: "berlari", r: "برلاري" },
              { l: "berdiri", r: "برديري" }
            ],
            ar: true
          },
          {
            type: "quiz", title: "Kuiz Imbuhan “Ber”", gem: 15,
            instr: "Jawab soalan tentang imbuhan awalan “ber”.",
            questions: [
              { q: "Imbuhan awalan “ber” ditulis dalam Jawi sebagai…", o: ["بر", "با", "بري", "برا"], a: 0, e: "Awalan “ber” ditulis بر dan dirapatkan pada perkataan asasnya." },
              { q: "Ejaan Jawi yang betul bagi “bermain” ialah…", o: ["برمين", "برماين", "برميان", "برمينو"], a: 0, e: "ber + main = برمين." },
              { q: "“برجالن” dibaca sebagai…", o: ["berjalan", "berjalin", "berjualan", "berjalanan"], a: 0, e: "بر + جالن = berjalan." },
              { q: "Antara berikut, yang manakah BUKAN perkataan berimbuhan awalan “ber”?", o: ["bersih", "bersama", "berlari", "berdiri"], a: 0, e: "“bersih” bukan kata terbitan — ia perkataan pokok, bukan ber + sih." },
              { q: "Ejaan Jawi bagi “bersekolah” ialah…", o: ["برسكوله", "برسيكوله", "برسكولاه", "برسكول"], a: 0, e: "بر + سكوله = برسكوله." }
            ]
          }
        ]
      },
      {
        id: "khat", jawi: "خط النسخ والرقعة",
        title: "Menulis Khat Nasakh & Rikaah",
        desc: "Kenali dua jenis khat dan latih kemahiran menulisnya.",
        activities: [
          {
            type: "quiz", title: "Kuiz Khat", gem: 15,
            instr: "Jawab soalan tentang Khat Nasakh dan Khat Rikaah.",
            questions: [
              { q: "Khat yang lazim digunakan untuk menulis mushaf al-Quran ialah…", o: ["Khat Nasakh", "Khat Rikaah", "Khat Kufi", "Khat Diwani"], a: 0, e: "Khat Nasakh mudah dibaca, kemas dan seimbang — sesuai untuk mushaf." },
              { q: "Ciri utama Khat Nasakh ialah…", o: ["kemas, seimbang, bertitik dan berbaris dengan lengkap", "sangat besar dan tebal", "tidak bertitik", "tiada baris"], a: 0, e: "Kebolehbacaan ialah ciri utama Khat Nasakh." },
              { q: "Khat Rikaah digunakan untuk…", o: ["penulisan dan urusan harian seperti surat-menyurat", "menulis mushaf sahaja", "hiasan dinding sahaja", "mengira wang"], a: 0, e: "Khat Rikaah ialah tulisan tangan yang pantas untuk kegunaan harian." },
              { q: "Antara adab menulis khat yang baik ialah…", o: ["mula dengan “Bismillah”, duduk dengan betul dan menulis dengan tenang", "menulis dengan tangan kiri secara paksa", "menulis sepantas mungkin tanpa hukum", "menconteng dahulu"], a: 0, e: "Khat ialah seni Islam yang menuntut adab dan kesabaran." },
              { q: "Alat asas untuk berlatih khat antaranya…", o: ["pena khat (qalam), dakwat dan kertas yang sesuai", "kapur tulis sahaja", "pensel warna sahaja", "cat minyak"], a: 0, e: "Qalam dan dakwat ialah alat tradisi seni khat Islam." }
            ]
          },
          {
            type: "trace", title: "Latih Khat: بسم الله", gem: 10,
            instr: "Surih tulisan di bawah dengan jari atau tetikus untuk melatih khat.",
            word: "بسم الله"
          }
        ]
      }
    ]
  };

  /* ---------- kedai ganjaran ---------- */
  var SHOP = [
    { id: "turban", name: "Serban Emas", desc: "Serban bercahaya tanda Pahlawan Ilmu", art: "🎗", cost: 60 },
    { id: "jubah", name: "Jubah Zamrud", desc: "Jubah hijau zamrud penuh keberkatan", art: "🧥", cost: 90 },
    { id: "qalam", name: "Qalam Cahaya", desc: "Pena emas penulis ilmu yang kekal", art: "🖋", cost: 110 },
    { id: "lentera", name: "Lentera Hikmah", desc: "Lampu penunjuk jalan yang lurus", art: "🏮", cost: 150 },
    { id: "sayap", name: "Sayap Cahaya", desc: "Sayap bercahaya untuk terbang tinggi", art: "🕊", cost: 190 },
    { id: "mahkota", name: "Mahkota Legenda", desc: "Tanda tertinggi seorang Legenda Ilmu", art: "👑", cost: 250 }
  ];

  /* ---------- misi harian ---------- */
  var DAILY = [
    { id: "a2", metric: "activities", target: 2, label: "Selesaikan 2 aktiviti", reward: 15 },
    { id: "g30", metric: "gems", target: 30, label: "Kumpul 30 Permata Ilmu", reward: 20 },
    { id: "c5", metric: "correct", target: 5, label: "Jawab 5 soalan dengan betul", reward: 20 },
    { id: "u1", metric: "units", target: 1, label: "Tamatkan 1 unit sepenuhnya", reward: 25 },
    { id: "s1", metric: "story", target: 1, label: "Baca 1 kisah Sirah", reward: 15 },
    { id: "m1", metric: "memorize", target: 1, label: "Hafaz 1 surah pendek", reward: 20 },
    { id: "j1", metric: "jawi", target: 1, label: "Selesaikan 1 aktiviti Jawi", reward: 15 }
  ];

  global.IL = {
    WORLDS: [quran, hadis, akidah, ibadah, sirah, adab, jawi],
    SHOP: SHOP,
    DAILY: DAILY
  };
})(window);
