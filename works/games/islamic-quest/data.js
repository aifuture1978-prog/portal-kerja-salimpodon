/* =========================================================================
   Islamic Quest — KANDUNGAN
   Pendidikan Islam Tahun 3 · KSSR Semakan 2017 (DSKP)
   7 bidang → 12 unit → aktiviti interaktif

   CARA MENAMBAH KANDUNGAN BARU (lihat README.md untuk butiran penuh):
   1. Tambah unit baru ke dalam `units` pulau yang sesuai.
   2. Setiap unit ada: id, title, icon, color, steps[]
   3. Jenis step yang disokong: info, reveal, quiz, order, match, story, record
   ========================================================================= */

const ISLANDS = [

  /* ====================================================== 1. AL-QURAN */
  {
    id: 'quran',
    name: 'Pulau Al-Quran',
    short: 'Al-Quran',
    icon: '📖',
    color: '#2563eb',
    color2: '#7c3aed',
    desc: 'Baca dengan tajwid, hafaz dan fahami ayat-ayat Allah.',
    badge: { name: 'Juara Al-Quran', icon: '🏆' },
    units: [
      {
        id: 'q1', title: 'Tilawah — Surah Al-Kafirun', icon: '🕌',
        color: '#2563eb', soft: '#dbeafe',
        steps: [
          { type: 'info', icon: '📖', title: 'Mari kita baca Surah Al-Kafirun!',
            text: 'Surah Al-Kafirun ada 6 ayat. Surah ini diturunkan di Makkah. Kita membacanya dengan makhraj dan tajwid yang betul.',
            bullets: [
              { i: '👄', t: 'Keluarkan setiap huruf dari tempatnya (makhraj) dengan betul.' },
              { i: '⏱️', t: 'Mad asli dibaca panjang 2 harakat.' },
              { i: '🔔', t: 'Huruf qalqalah (ق ط ب ج د) yang mati dipantulkan bunyinya.' },
              { i: '🤲', t: 'Mulakan bacaan dengan ta‘awuz dan basmalah.' }
            ] },
          { type: 'reveal', title: 'Surah Al-Kafirun', subtitle: 'Sentuh setiap ayat untuk melihat maksudnya',
            lines: [
              { ar: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ', my: 'Katakanlah (wahai Muhammad): Wahai orang-orang kafir!' },
              { ar: 'لَا أَعْبُدُ مَا تَعْبُدُونَ', my: 'Aku tidak akan menyembah apa yang kamu sembah.' },
              { ar: 'وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ', my: 'Dan kamu tidak pernah menyembah apa yang aku sembah.' },
              { ar: 'وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ', my: 'Dan aku tidak akan beribadat secara kamu beribadat.' },
              { ar: 'وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ', my: 'Dan kamu pula tidak pernah beribadat secara aku beribadat.' },
              { ar: 'لَكُمْ دِينُكُمْ وَلِيَ دِينِ', my: 'Bagi kamu agama kamu, dan bagiku agamaku.' }
            ],
            done: 'Saya sudah membaca dengan betul' },
          { type: 'quiz', icon: '❓', q: 'Berapakah bilangan ayat Surah Al-Kafirun?',
            options: [
              { t: '6 ayat', ok: true },
              { t: '5 ayat', why: 'Cuba kira semula ayat dalam bacaan tadi.' },
              { t: '7 ayat', why: 'Cuba kira semula ayat dalam bacaan tadi.' },
              { t: '3 ayat', why: 'Surah Al-Asr yang ada 3 ayat.' }
            ],
            why: 'Betul! Surah Al-Kafirun ada 6 ayat.' },
          { type: 'quiz', icon: '❓', q: 'Apakah maksud perkataan "Al-Kafirun"?',
            options: [
              { t: 'Orang-orang yang kafir', ok: true },
              { t: 'Orang-orang yang beriman', why: 'Orang beriman disebut "mukminun".' },
              { t: 'Orang-orang yang sabar', why: 'Orang sabar disebut "sabirin".' }
            ],
            why: 'Betul! Al-Kafirun bermaksud orang-orang kafir.' },
          { type: 'quiz', icon: '🔔', q: 'Antara yang berikut, yang manakah huruf qalqalah?',
            options: [
              { t: 'ق  ط  ب  ج  د', ok: true },
              { t: 'ا  و  ي  م  ن', why: 'Huruf ini bukan huruf qalqalah.' },
              { t: 'س  ش  ص  ز', why: 'Huruf ini huruf siplin (huruf berdesis).' }
            ],
            why: 'Betul! Huruf qalqalah ialah ق، ط، ب، ج، د — dipantulkan apabila huruf itu mati.' },
          { type: 'quiz', icon: '⏱️', q: 'Bagaimanakah cara membaca mad asli?',
            options: [
              { t: 'Dipanjangkan 2 harakat', ok: true },
              { t: 'Dipanjangkan 6 harakat', why: '6 harakat itu mad lazim atau mad ‘arid, bukan mad asli.' },
              { t: 'Dipendekkan sahaja', why: 'Mad bermaksud panjang, jadi mesti dipanjangkan.' }
            ],
            why: 'Betul! Mad asli dipanjangkan 2 harakat.' }
        ]
      },
      {
        id: 'q2', title: 'Hafazan — Surah Al-Asr', icon: '🎵',
        color: '#7c3aed', soft: '#ede9fe',
        steps: [
          { type: 'info', icon: '🎵', title: 'Hafaz Surah Al-Asr',
            text: 'Surah Al-Asr ada 3 ayat. Nama "Al-Asr" bermaksud masa atau waktu. Surah ini mengingatkan kita supaya tidak rugikan masa.',
            bullets: [
              { i: '1️⃣', t: 'Baca ayat pertama 5 kali sehingga lancar.' },
              { i: '2️⃣', t: 'Tambah ayat kedua, ulang bersama ayat pertama.' },
              { i: '3️⃣', t: 'Tambah ayat ketiga, ulang kesemua 3 ayat.' },
              { i: '🔁', t: 'Ulang bacaan selepas setiap solat supaya kekal hafazan.' }
            ] },
          { type: 'reveal', title: 'Surah Al-Asr', subtitle: 'Baca, kemudian sentuh ayat untuk semak maksudnya',
            lines: [
              { ar: 'وَالْعَصْرِ', my: 'Demi masa!' },
              { ar: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ', my: 'Sesungguhnya manusia itu benar-benar dalam kerugian.' },
              { ar: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', my: 'Kecuali orang-orang yang beriman, beramal soleh, dan berpesan dengan kebenaran serta berpesan dengan kesabaran.' }
            ],
            done: 'Saya sudah menghafaz' },
          { type: 'order', title: 'Susun ayat Surah Al-Asr', prompt: 'Sentuh ayat mengikut susunan yang betul dari ayat 1 hingga ayat 3.',
            items: [
              { id: 'a', jawi: 'وَالْعَصْرِ', t: 'وَالْعَصْرِ' },
              { id: 'b', jawi: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ', t: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ' },
              { id: 'c', jawi: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', t: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ ...' }
            ],
            correct: ['a', 'b', 'c'],
            tip: 'Petua: ayat 1 paling pendek, ayat 3 paling panjang.' },
          { type: 'record', title: 'Rakam bacaan hafazan kamu',
            prompt: 'Tekan butang merah dan bacalah Surah Al-Asr dengan lancar. Dengar semula untuk membetulkan bacaan.',
            lines: ['وَالْعَصْرِ', 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ', 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ'] },
          { type: 'quiz', icon: '🌟', q: 'Menurut Surah Al-Asr, siapakah yang TIDAK rugi?',
            options: [
              { t: 'Orang yang beriman, beramal soleh, berpesan dengan kebenaran dan kesabaran', ok: true },
              { t: 'Orang yang banyak harta', why: 'Harta tidak disebut dalam Surah Al-Asr.' },
              { t: 'Orang yang tidur sepanjang hari', why: 'Itu membazirkan masa — rugi!' }
            ],
            why: 'Betul! Mereka beriman, beramal soleh, berpesan dengan kebenaran dan kesabaran.' }
        ]
      },
      {
        id: 'q3', title: 'Kefahaman — Surah Al-Fatihah', icon: '💛',
        color: '#0891b2', soft: '#cffafe',
        steps: [
          { type: 'info', icon: '💛', title: 'Surah Al-Fatihah',
            text: 'Surah Al-Fatihah ada 7 ayat. Ia surah pertama dalam Al-Quran dan dibaca dalam setiap rakaat solat. Ia juga digelar Ummul Kitab (induk Al-Quran).',
            bullets: [
              { i: '🕌', t: 'Dibaca dalam setiap rakaat solat.' },
              { i: '📖', t: 'Surah pertama dalam susunan Al-Quran.' },
              { i: '❤️', t: 'Mengajar kita bahawa hanya Allah yang kita sembah dan kepada-Nya kita memohon pertolongan.' }
            ] },
          { type: 'match', title: 'Padankan ayat dengan maksudnya', prompt: 'Sentuh satu ayat di kiri, kemudian sentuh maksud yang sepadan di kanan.',
            aLabel: 'Ayat', bLabel: 'Maksud',
            pairs: [
              { a: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', b: 'Segala puji bagi Allah, Tuhan semesta alam', ar: true },
              { a: 'مَالِكِ يَوْمِ الدِّينِ', b: 'Raja hari pembalasan', ar: true },
              { a: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', b: 'Hanya Engkaulah yang kami sembah dan hanya kepada Engkaulah kami memohon pertolongan', ar: true },
              { a: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', b: 'Tunjukilah kami jalan yang lurus', ar: true }
            ] },
          { type: 'quiz', icon: '❓', q: 'Bilakah kita membaca Surah Al-Fatihah?',
            options: [
              { t: 'Dalam setiap rakaat solat', ok: true },
              { t: 'Hanya pada hari Jumaat', why: 'Al-Fatihah dibaca setiap kali solat, bukan hanya Jumaat.' },
              { t: 'Hanya sebelum tidur', why: 'Ia boleh dibaca sebelum tidur, tetapi wajib dibaca dalam solat.' }
            ],
            why: 'Betul! Solat tidak sah tanpa membaca Al-Fatihah.' },
          { type: 'quiz', icon: '❤️', q: 'Apakah pengajaran utama Surah Al-Fatihah?',
            options: [
              { t: 'Kita hanya menyembah Allah dan hanya kepada-Nya memohon pertolongan', ok: true },
              { t: 'Kita mesti banyak tidur', why: 'Itu bukan pengajaran Al-Fatihah.' },
              { t: 'Kita mesti mengumpul harta', why: 'Al-Fatihah mengajar tentang tauhid, bukan harta.' }
            ],
            why: 'Betul! Inilah inti tauhid yang diajar oleh Surah Al-Fatihah.' }
        ]
      }
    ]
  },

  /* ====================================================== 2. HADIS */
  {
    id: 'hadis',
    name: 'Pulau Hadis',
    short: 'Hadis',
    icon: '📜',
    color: '#0891b2',
    color2: '#0d9488',
    desc: 'Sayangi yang muda, hormati yang tua.',
    badge: { name: 'Sahabat Rasul', icon: '🌸' },
    units: [
      {
        id: 'h1', title: 'Adab Mengasihi Orang Muda & Menghormati Orang Tua', icon: '🤝',
        color: '#0891b2', soft: '#cffafe',
        steps: [
          { type: 'info', icon: '📜', title: 'Hadis Pilihan',
            text: 'Nabi Muhammad SAW mengajar kita adab terhadap orang yang lebih muda dan orang yang lebih tua.',
            ar: { t: 'لَيْسَ مِنَّا مَنْ لَمْ يَرْحَمْ صَغِيرَنَا وَيُوَقِّرْ كَبِيرَنَا', r: 'Riwayat Abu Dawud dan at-Tirmizi' },
            meaning: 'Bukan daripada golongan kami orang yang tidak mengasihi orang yang lebih muda dan tidak menghormati orang yang lebih tua.',
            bullets: [
              { i: '💕', t: 'Mengasihi orang muda: memimpin, membantu dan tidak mengejek mereka.' },
              { i: '🙏', t: 'Menghormati orang tua: mendengar cakap mereka dan tidak memotong percakapan.' },
              { i: '😊', t: 'Bercakap dengan sopan dan lembut kepada kedua-dua golongan.' }
            ] },
          { type: 'story', title: 'Kisah Amir dan Neneknya',
            slides: [
              { icon: '🏠', title: 'Di rumah', text: 'Amir pulang dari sekolah. Neneknya sedang duduk di ruang tamu dan memanggilnya perlahan-lahan.' },
              { icon: '👂', title: 'Pilihan Amir', text: 'Amir meletakkan beg, duduk dekat neneknya dan mendengar dengan senyap. Dia tidak memotong cakap neneknya.' },
              { icon: '🧒', title: 'Adik kecil', text: 'Adik Amir, Danish, tersedar dan mula menangis. Amir memujuknya sambil membacakan cerita.' },
              { icon: '🌟', title: 'Pujian', text: 'Ibu tersenyum dan berkata: Amir mengamalkan hadis Nabi — mengasihi yang muda dan menghormati yang tua.' }
            ] },
          { type: 'quiz', icon: '❓', q: 'Adik kamu menangis kerana jatuh. Apakah tindakan yang betul?',
            options: [
              { t: 'Menolongnya bangun dan memujuknya', ok: true },
              { t: 'Ketawa dan mengejeknya', why: 'Itu menyakitkan hati — Nabi melarang kita mengejek orang lain.' },
              { t: 'Meninggalkannya begitu sahaja', why: 'Kita diajar mengasihi orang yang lebih muda.' }
            ],
            why: 'Betul! Mengasihi orang muda ialah amalan hadis ini.' },
          { type: 'quiz', icon: '🙏', q: 'Nenek sedang bercakap dengan kamu. Apakah adab yang betul?',
            options: [
              { t: 'Mendengar dengan sopan tanpa memotong cakapnya', ok: true },
              { t: 'Memotong cakapnya dan bercakap dulu', why: 'Itu tidak menghormati orang tua.' },
              { t: 'Menjawab dengan nada yang kuat dan kasar', why: 'Nabi mengajar kita bercakap dengan lembut.' }
            ],
            why: 'Betul! Menghormati orang tua dengan mendengar dan bercakap lembut.' },
          { type: 'quiz', icon: '📜', q: 'Apakah maksud hadis "Bukan daripada golongan kami..."?',
            options: [
              { t: 'Orang yang tidak mengasihi yang muda dan tidak menghormati yang tua tidak mengikut ajaran Nabi', ok: true },
              { t: 'Kita tidak boleh berkawan dengan sesiapa', why: 'Hadis ini tentang adab, bukan larangan berkawan.' },
              { t: 'Hanya orang tua yang masuk syurga', why: 'Itu bukan maksud hadis ini.' }
            ],
            why: 'Betul! Hadis ini menuntut kita beradab kepada kedua-dua golongan.' }
        ]
      }
    ]
  },

  /* ====================================================== 3. AKIDAH */
  {
    id: 'akidah',
    name: 'Pulau Akidah',
    short: 'Akidah',
    icon: '✨',
    color: '#7c3aed',
    color2: '#db2777',
    desc: 'Kenali Allah melalui nama-nama-Nya yang indah.',
    badge: { name: 'Pahlawan Akidah', icon: '🛡️' },
    units: [
      {
        id: 'a1', title: 'Al-Alim dan Al-Hakim', icon: '✨',
        color: '#7c3aed', soft: '#ede9fe',
        steps: [
          { type: 'info', icon: '✨', title: 'Dua nama Allah yang indah',
            text: 'Al-Asma’ul Husna ialah nama-nama Allah yang indah. Tahun ini kita mempelajari dua daripadanya.',
            bullets: [
              { i: '📘', t: 'Al-Alim: Allah Maha Mengetahui segala sesuatu — yang zahir mahupun yang tersembunyi di dalam hati.' },
              { i: '🧠', t: 'Al-Hakim: Allah Maha Bijaksana dalam setiap ciptaan dan ketentuan-Nya.' },
              { i: '🤲', t: 'Kita yakin bahawa setiap perkara yang berlaku ada hikmahnya.' }
            ] },
          { type: 'match', title: 'Padankan nama Allah dengan maksudnya', prompt: 'Sentuh nama di kiri, kemudian sentuh maksud yang betul di kanan.',
            aLabel: 'Nama Allah', bLabel: 'Maksud',
            pairs: [
              { a: 'Al-Alim', b: 'Maha Mengetahui' },
              { a: 'Al-Hakim', b: 'Maha Bijaksana' },
              { a: 'Ar-Rahman', b: 'Maha Pemurah' },
              { a: 'Ar-Rahim', b: 'Maha Mengasihani' }
            ] },
          { type: 'quiz', icon: '📘', q: 'Allah mengetahui apa yang tersembunyi di dalam hati kita. Sifat ini ialah...',
            options: [
              { t: 'Al-Alim', ok: true },
              { t: 'Al-Hakim', why: 'Al-Hakim bermaksud Maha Bijaksana.' },
              { t: 'Ar-Rahim', why: 'Ar-Rahim bermaksud Maha Mengasihani.' }
            ],
            why: 'Betul! Al-Alim — Allah Maha Mengetahui segala-galanya.' },
          { type: 'quiz', icon: '🌧️', q: 'Hujan turun pada hari sukan sekolah. Apakah sikap yang betul?',
            options: [
              { t: 'Redha dan bersabar kerana Allah Maha Bijaksana', ok: true },
              { t: 'Marah dan memungkirkan takdir Allah', why: 'Orang beriman redha dengan ketentuan Allah.' },
              { t: 'Tidak mahu ke sekolah lagi', why: 'Kita tetap berusaha dan bertawakal kepada Allah.' }
            ],
            why: 'Betul! Setiap ketentuan Allah ada hikmah — itulah Al-Hakim.' },
          { type: 'quiz', icon: '💪', q: 'Bagaimanakah kamu mengamalkan sifat Al-Alim dalam kehidupan?',
            options: [
              { t: 'Belajar bersungguh-sungguh dan sentiasa jujur, kerana Allah tahu usaha kita', ok: true },
              { t: 'Meniru jawapan kawan ketika ujian', why: 'Allah Maha Mengetahui — Dia melihat segala-galanya.' },
              { t: 'Menyembunyikan kesalahan daripada guru', why: 'Orang beriman takut kepada Allah yang Maha Mengetahui.' }
            ],
            why: 'Betul! Keyakinan bahawa Allah Maha Mengetahui menjadikan kita jujur dan rajin.' }
        ]
      },
      {
        id: 'a2', title: 'Beriman dengan Kitab', icon: '📚',
        color: '#db2777', soft: '#fce7f3',
        steps: [
          { type: 'info', icon: '📚', title: 'Empat kitab suci',
            text: 'Beriman dengan kitab-kitab Allah bermaksud kita yakin Allah menurunkan kitab kepada rasul-Nya sebagai panduan hidup.',
            bullets: [
              { i: '📕', t: 'Taurat — diturunkan kepada Nabi Musa AS.' },
              { i: '📗', t: 'Zabur — diturunkan kepada Nabi Daud AS.' },
              { i: '📘', t: 'Injil — diturunkan kepada Nabi Isa AS.' },
              { i: '📙', t: 'Al-Quran — diturunkan kepada Nabi Muhammad SAW, kitab terakhir dan terpelihara sehingga hari kiamat.' }
            ] },
          { type: 'match', title: 'Padankan kitab dengan rasulnya', prompt: 'Sentuh nama kitab, kemudian sentuh nama rasul yang menerimanya.',
            aLabel: 'Kitab', bLabel: 'Rasul',
            pairs: [
              { a: 'Taurat', b: 'Nabi Musa AS' },
              { a: 'Zabur', b: 'Nabi Daud AS' },
              { a: 'Injil', b: 'Nabi Isa AS' },
              { a: 'Al-Quran', b: 'Nabi Muhammad SAW' }
            ] },
          { type: 'quiz', icon: '📙', q: 'Kitab suci yang terakhir dan terpelihara sehingga hari kiamat ialah...',
            options: [
              { t: 'Al-Quran', ok: true },
              { t: 'Taurat', why: 'Taurat diturunkan kepada Nabi Musa AS, lebih awal.' },
              { t: 'Zabur', why: 'Zabur diturunkan kepada Nabi Daud AS.' }
            ],
            why: 'Betul! Allah berjanji memelihara Al-Quran sehingga hari kiamat.' },
          { type: 'quiz', icon: '🤲', q: 'Bagaimanakah cara mengamalkan beriman dengan kitab?',
            options: [
              { t: 'Membaca Al-Quran, memahami dan mengamalkan ajarannya', ok: true },
              { t: 'Menyimpan Al-Quran di rak tanpa dibaca', why: 'Al-Quran diturunkan untuk dibaca dan diamalkan.' },
              { t: 'Hanya membaca ketika ujian', why: 'Kita membaca Al-Quran setiap hari.' }
            ],
            why: 'Betul! Beriman dengan kitab dibuktikan dengan membaca dan mengamalkannya.' }
        ]
      }
    ]
  },

  /* ====================================================== 4. IBADAH */
  {
    id: 'ibadah',
    name: 'Pulau Ibadah',
    short: 'Ibadah',
    icon: '🚿',
    color: '#0d9488',
    color2: '#16a34a',
    desc: 'Bersuci daripada hadas besar dengan betul.',
    badge: { name: 'Ceria Bersuci', icon: '🧼' },
    units: [
      {
        id: 'i1', title: 'Bersuci daripada Hadas Besar', icon: '🚿',
        color: '#0d9488', soft: '#ccfbf1',
        steps: [
          { type: 'info', icon: '🚿', title: 'Apakah hadas besar?',
            text: 'Hadas besar ialah keadaan tidak suci yang mewajibkan kita mandi wajib sebelum boleh solat.',
            bullets: [
              { i: '🩸', t: 'Haid (datang bulan) bagi perempuan.' },
              { i: '🤱', t: 'Nifas (darah selepas bersalin).' },
              { i: '💧', t: 'Keluar air mani.' },
              { i: '💑', t: 'Bersetubuh (jimak) antara suami isteri.' }
            ],
            ar: { t: 'نَوَيْتُ الْغُسْلَ لِرَفْعِ الْحَدَثِ الْأَكْبَرِ فَرْضًا لِلَّهِ تَعَالَى', r: 'Lafaz niat mandi wajib' },
            meaning: 'Sahaja aku mandi untuk mengangkat hadas besar, fardhu kerana Allah Ta‘ala.' },
          { type: 'order', title: 'Simulasi: Langkah mandi wajib', prompt: 'Sentuh langkah-langkah di bawah mengikut urutan yang betul.',
            items: [
              { id: 'n', t: 'Niat mandi wajib di dalam hati' },
              { id: 't', t: 'Membasuh kedua-dua tangan' },
              { id: 'k', t: 'Membersihkan kemaluan daripada najis' },
              { id: 'w', t: 'Mengambil wuduk dengan sempurna' },
              { id: 'h', t: 'Menuang air ke kepala dan seluruh badan sehingga rata' },
              { id: 'g', t: 'Menggosok seluruh badan dengan tertib' }
            ],
            correct: ['n', 't', 'k', 'w', 'h', 'g'],
            tip: 'Petua: Niat → Tangan → Kemaluan → Wuduk → Kepala → Gosok badan.' },
          { type: 'quiz', icon: '💧', q: 'Berapakah kali digalakkan menuang air ke atas kepala ketika mandi wajib?',
            options: [
              { t: 'Tiga kali', ok: true },
              { t: 'Satu kali sahaja', why: 'Disunatkan tiga kali supaya air rata ke seluruh badan.' },
              { t: 'Tujuh kali', why: 'Tujuh kali itu bilangan membasuh dalam mandi jenazah, bukan mandi wajib.' }
            ],
            why: 'Betul! Digalakkan menuang air ke kepala tiga kali.' },
          { type: 'quiz', icon: '🚫', q: 'Antara yang berikut, yang manakah MEMBATALKAN solat?',
            options: [
              { t: 'Makan atau minum dengan sengaja', ok: true },
              { t: 'Membaca doa dengan perlahan', why: 'Doa perlahan tidak membatalkan solat.' },
              { t: 'Berdiri dengan tenang', why: 'Itu sebahagian daripada solat.' }
            ],
            why: 'Betul! Makan, minum, bercakap dengan sengaja dan berhadas membatalkan solat.' },
          { type: 'quiz', icon: '🤲', q: 'Di manakah niat mandi wajib diletakkan?',
            options: [
              { t: 'Di dalam hati, bersama perbuatan mandi', ok: true },
              { t: 'Mesti dilaungkan kuat-kuat', why: 'Niat tempatnya di hati, tidak perlu dilafazkan kuat.' },
              { t: 'Ditulis pada dinding bilik air', why: 'Itu tidak ada kaitan dengan ibadah.' }
            ],
            why: 'Betul! Niat itu di hati; melafazkannya hanya membantu mengingatkan diri.' }
        ]
      }
    ]
  },

  /* ====================================================== 5. SIRAH */
  {
    id: 'sirah',
    name: 'Pulau Sirah',
    short: 'Sirah',
    icon: '🕋',
    color: '#f59e0b',
    color2: '#ea580c',
    desc: 'Teladani perjalanan hidup Nabi Muhammad SAW.',
    badge: { name: 'Pencinta Rasul', icon: '💚' },
    units: [
      {
        id: 's1', title: 'Iktibar Peristiwa Penerimaan Wahyu', icon: '🌙',
        color: '#f59e0b', soft: '#fef3c7',
        steps: [
          { type: 'story', title: 'Wahyu Teragung di Gua Hira’',
            slides: [
              { icon: '⛰️', title: 'Di Gua Hira’', text: 'Nabi Muhammad SAW suka menyendiri dan berfikir di Gua Hira’ di Jabal an-Nur, berhampiran Makkah. Baginda berusia 40 tahun ketika itu.' },
              { icon: '👼', title: 'Malaikat Jibril datang', text: 'Pada 17 Ramadan, Malaikat Jibril AS datang membawa wahyu pertama daripada Allah dan memeluk Baginda sambil berkata: Bacalah!' },
              { icon: '📖', title: 'Iqra’ — Bacalah!', text: 'Wahyu pertama ialah lima ayat pertama Surah Al-‘Alaq: Bacalah dengan nama Tuhanmu yang menciptakan.' },
              { icon: '🤗', title: 'Kembali kepada Khadijah', text: 'Baginda pulang dalam keadaan gemetar. Saidatina Khadijah menyelimuti dan menenangkan Baginda, lalu berkata: Allah tidak akan menghinakanmu.' },
              { icon: '💡', title: 'Iktibar', text: 'Kita wajib menuntut ilmu dan membaca Al-Quran, serta bersabar apabila menyampaikan kebenaran.' }
            ] },
          { type: 'quiz', icon: '❓', q: 'Berapakah usia Nabi Muhammad SAW ketika menerima wahyu pertama?',
            options: [
              { t: '40 tahun', ok: true },
              { t: '25 tahun', why: 'Baginda berkahwin dengan Khadijah pada usia 25 tahun.' },
              { t: '63 tahun', why: 'Itu usia Baginda ketika wafat.' }
            ],
            why: 'Betul! Baginda menerima wahyu pertama pada usia 40 tahun.' },
          { type: 'quiz', icon: '⛰️', q: 'Di manakah Nabi Muhammad SAW menerima wahyu pertama?',
            options: [
              { t: 'Gua Hira’ di Jabal an-Nur', ok: true },
              { t: 'Gua Tsur', why: 'Gua Tsur ialah tempat persembunyian semasa hijrah.' },
              { t: 'Bukit Uhud', why: 'Bukit Uhud tempat berlakunya peperangan Uhud.' }
            ],
            why: 'Betul! Wahyu pertama diterima di Gua Hira’.' },
          { type: 'quiz', icon: '👼', q: 'Siapakah yang menyampaikan wahyu pertama kepada Nabi?',
            options: [
              { t: 'Malaikat Jibril AS', ok: true },
              { t: 'Malaikat Mikail AS', why: 'Malaikat Mikail bertugas menurunkan rezeki dan hujan.' },
              { t: 'Malaikat Israfil AS', why: 'Malaikat Israfil bertugas meniup sangkakala.' }
            ],
            why: 'Betul! Malaikat Jibril AS menyampaikan wahyu kepada para rasul.' },
          { type: 'quiz', icon: '📖', q: 'Apakah perkataan pertama yang diturunkan dalam wahyu?',
            options: [
              { t: 'اقْرَأْ — Bacalah!', ok: true },
              { t: 'صَلِّ — Solatlah!', why: 'Perkataan pertama dalam wahyu ialah Iqra’ (Bacalah).' },
              { t: 'صُمْ — Puasalah!', why: 'Bukan itu perkataan pertama wahyu.' }
            ],
            why: 'Betul! "Iqra’" menunjukkan betapa pentingnya ilmu dan bacaan.' },
          { type: 'quiz', icon: '💡', q: 'Apakah iktibar daripada peristiwa penerimaan wahyu?',
            options: [
              { t: 'Rajin menuntut ilmu dan membaca Al-Quran', ok: true },
              { t: 'Takut keluar rumah', why: 'Wahyu mengajar kita untuk berdakwah, bukan bersembunyi.' },
              { t: 'Tidak perlu membaca buku', why: 'Perintah pertama wahyu ialah "Bacalah"!' }
            ],
            why: 'Betul! Islam memuliakan ilmu dan orang yang menuntutnya.' }
        ]
      },
      {
        id: 's2', title: 'Keagungan Sifat Tabligh Nabi Muhammad SAW', icon: '📣',
        color: '#ea580c', soft: '#ffedd5',
        steps: [
          { type: 'info', icon: '📣', title: 'Apakah sifat Tabligh?',
            text: 'Tabligh bermaksud menyampaikan. Nabi Muhammad SAW menyampaikan seluruh wahyu Allah kepada umat manusia dengan lengkap, jujur dan amanah.',
            bullets: [
              { i: '🗣️', t: 'Berani menyampaikan kebenaran walaupun dicaci dan diancam.' },
              { i: '🤝', t: 'Berdakwah dengan hikmah dan akhlak yang baik, bukan dengan kekerasan.' },
              { i: '⏳', t: 'Berterusan selama 23 tahun sehingga Islam sempurna.' },
              { i: '🔒', t: 'Tidak pernah menyembunyikan sedikit pun daripada wahyu.' }
            ] },
          { type: 'story', title: 'Di Bukit Safa',
            slides: [
              { icon: '⛰️', title: 'Panggilan kepada kaum', text: 'Allah memerintahkan Nabi memberi amaran kepada keluarga terdekat. Baginda naik ke Bukit Safa dan memanggil kaum Quraisy.' },
              { icon: '🙋', title: 'Pertanyaan Nabi', text: 'Baginda bertanya: Jika aku khabarkan ada musuh di sebalik bukit ini, percayakah kamu? Semua menjawab: Ya, kami tidak pernah mendustakanmu.' },
              { icon: '⚠️', title: 'Amaran yang jujur', text: 'Walaupun tahu mereka akan marah, Baginda tetap menyampaikan amaran tentang azab Allah. Itulah Tabligh.' },
              { icon: '🌟', title: 'Iktibar', text: 'Kita juga bertabligh dengan mengingatkan kawan kepada kebaikan dengan cara yang lembut dan sopan.' }
            ] },
          { type: 'quiz', icon: '❓', q: 'Apakah maksud sifat Tabligh?',
            options: [
              { t: 'Menyampaikan wahyu dan ajaran Allah', ok: true },
              { t: 'Berdiam diri daripada kebenaran', why: 'Itu lawan kepada sifat Tabligh.' },
              { t: 'Mengumpul harta dan kekayaan', why: 'Tabligh bukan tentang harta.' }
            ],
            why: 'Betul! Tabligh bermaksud menyampaikan ajaran Allah.' },
          { type: 'quiz', icon: '🏫', q: 'Bagaimanakah kamu mengamalkan sifat tabligh di sekolah?',
            options: [
              { t: 'Mengingatkan kawan yang meninggalkan solat dengan cara yang baik', ok: true },
              { t: 'Memarahi kawan di hadapan ramai orang', why: 'Dakwah Nabi dilakukan dengan hikmah dan kasih sayang.' },
              { t: 'Membiarkan sahaja kawan membuat kesalahan', why: 'Kita diajar menegur dengan lembut, bukan membiarkan.' }
            ],
            why: 'Betul! Menegur dengan cara yang baik itulah tabligh.' },
          { type: 'quiz', icon: '⏳', q: 'Berapa lamakah Nabi Muhammad SAW menyampaikan risalah Islam?',
            options: [
              { t: '23 tahun', ok: true },
              { t: '3 tahun', why: 'Dakwah secara terbuka bermula lebih awal, tetapi keseluruhan risalah mengambil 23 tahun.' },
              { t: '40 tahun', why: '40 tahun ialah usia Baginda ketika menjadi Rasul.' }
            ],
            why: 'Betul! 13 tahun di Makkah dan 10 tahun di Madinah.' }
        ]
      },
      {
        id: 's3', title: 'Meneladani Keperibadian Nabi dalam Masyarakat', icon: '💚',
        color: '#16a34a', soft: '#dcfce7',
        steps: [
          { type: 'info', icon: '💚', title: 'Akhlak Nabi dalam masyarakat',
            text: 'Nabi Muhammad SAW digelar Al-Amin (yang dipercayai) kerana akhlaknya yang mulia. Baginda contoh terbaik dalam kehidupan bermasyarakat.',
            bullets: [
              { i: '🤝', t: 'Jujur dan amanah dalam setiap urusan.' },
              { i: '😊', t: 'Penyayang kepada kanak-kanak dan mengasihi orang miskin.' },
              { i: '🤲', t: 'Suka menolong dan menjaga jiran tetangga.' },
              { i: '🕊️', t: 'Pemaaf walaupun pernah disakiti.' },
              { i: '🍽️', t: 'Tidak pernah memandang rendah kepada orang lain.' }
            ] },
          { type: 'match', title: 'Padankan sifat Nabi dengan amalannya', prompt: 'Sentuh sifat di kiri, kemudian sentuh amalan yang sepadan di kanan.',
            aLabel: 'Sifat', bLabel: 'Amalan',
            pairs: [
              { a: 'Al-Amin (jujur)', b: 'Menjaga barang amanah dengan baik' },
              { a: 'Penyayang', b: 'Mengusap kepala anak yatim' },
              { a: 'Pemaaf', b: 'Memohonkan keampunan untuk kaum yang menyakitinya' },
              { a: 'Suka menolong', b: 'Membantu jiran yang sakit' }
            ] },
          { type: 'quiz', icon: '🏘️', q: 'Jiran kamu sakit. Apakah teladan Nabi yang patut kamu contohi?',
            options: [
              { t: 'Menziarahinya dan membantu keperluannya', ok: true },
              { t: 'Tidak mengendahkannya', why: 'Nabi sangat menitikberatkan hak jiran.' },
              { t: 'Membuat bising di sebelah rumahnya', why: 'Itu menyakiti jiran, dilarang dalam Islam.' }
            ],
            why: 'Betul! Menjaga jiran ialah sebahagian akhlak Nabi.' },
          { type: 'quiz', icon: '💰', q: 'Kamu menjumpai dompet tertinggal di kantin. Apakah tindakan yang betul?',
            options: [
              { t: 'Menyerahkannya kepada guru untuk dikembalikan kepada pemiliknya', ok: true },
              { t: 'Mengambil wang di dalamnya', why: 'Mengambil harta orang lain tanpa izin itu haram.' },
              { t: 'Membuangnya semula', why: 'Barang orang lain mesti dijaga sebagai amanah.' }
            ],
            why: 'Betul! Itulah amanah yang diamalkan oleh Nabi SAW.' },
          { type: 'quiz', icon: '🕊️', q: 'Kawan kamu pernah menyakiti hati kamu. Apakah yang diajar oleh Nabi?',
            options: [
              { t: 'Bersedia memaafkannya', ok: true },
              { t: 'Membalas dendam', why: 'Nabi memaafkan walaupun disakiti.' },
              { t: 'Tidak berkawan dengan sesiapa lagi', why: 'Kita diajar memaafkan dan memperbaiki hubungan.' }
            ],
            why: 'Betul! Nabi SAW ialah insan yang paling pemaaf.' }
        ]
      }
    ]
  },

  /* ====================================================== 6. ADAB */
  {
    id: 'adab',
    name: 'Pulau Adab',
    short: 'Adab',
    icon: '🌛',
    color: '#6366f1',
    color2: '#8b5cf6',
    desc: 'Tidur mengikut sunnah yang mulia.',
    badge: { name: 'Budiman Sunnah', icon: '🌛' },
    units: [
      {
        id: 'd1', title: 'Adab Tidur', icon: '🛏️',
        color: '#6366f1', soft: '#e0e7ff',
        steps: [
          { type: 'info', icon: '🌛', title: 'Tidur mengikut sunnah',
            text: 'Tidur juga ibadah jika dilakukan dengan adab yang diajar oleh Nabi Muhammad SAW.',
            bullets: [
              { i: '💧', t: 'Berwuduk sebelum tidur.' },
              { i: '🛏️', t: 'Mengibas tempat tidur tiga kali sebelum baring.' },
              { i: '➡️', t: 'Tidur mengiring ke kanan.' },
              { i: '🤲', t: 'Membaca doa sebelum tidur.' },
              { i: '🌅', t: 'Bangun awal dan membaca doa bangun tidur.' }
            ],
            ar: { t: 'بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ', r: 'Doa sebelum tidur' },
            meaning: 'Dengan nama-Mu ya Allah, aku hidup dan aku mati.' },
          { type: 'order', title: 'Susun adab sebelum tidur', prompt: 'Sentuh langkah mengikut urutan sebelum kita baring tidur.',
            items: [
              { id: 'w', t: 'Berwuduk' },
              { id: 'b', t: 'Mengibas tempat tidur 3 kali' },
              { id: 'r', t: 'Berbaring mengiring ke kanan' },
              { id: 'd', t: 'Membaca doa sebelum tidur' },
              { id: 'z', t: 'Berzikir dan memejamkan mata' }
            ],
            correct: ['w', 'b', 'r', 'd', 'z'],
            tip: 'Petua: Wuduk → Bersihkan tempat tidur → Baring → Doa → Zikir.' },
          { type: 'match', title: 'Padankan doa dengan waktunya', prompt: 'Sentuh doa di kiri, kemudian sentuh waktu yang betul di kanan.',
            aLabel: 'Doa', bLabel: 'Waktu',
            pairs: [
              { a: 'بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ', b: 'Sebelum tidur', ar: true },
              { a: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', b: 'Bangun tidur', ar: true }
            ] },
          { type: 'quiz', icon: '➡️', q: 'Bagaimanakah cara tidur yang diteladankan oleh Nabi SAW?',
            options: [
              { t: 'Mengiring ke kanan', ok: true },
              { t: 'Meniarap', why: 'Nabi melarang tidur meniarap.' },
              { t: 'Terlentang dengan kedua kaki ke atas', why: 'Cara yang disunnahkan ialah mengiring ke kanan.' }
            ],
            why: 'Betul! Tidur mengiring ke kanan ialah sunnah Nabi.' },
          { type: 'quiz', icon: '💧', q: 'Mengapakah kita digalakkan berwuduk sebelum tidur?',
            options: [
              { t: 'Supaya kita tidur dalam keadaan suci dan memperoleh pahala', ok: true },
              { t: 'Supaya tidak perlu mandi esok', why: 'Wuduk sebelum tidur adalah amalan sunnah, bukan ganti mandi.' },
              { t: 'Supaya cepat lapar', why: 'Tiada kaitan dengan makan.' }
            ],
            why: 'Betul! Orang yang tidur dalam keadaan berwuduk memperoleh pahala.' }
        ]
      }
    ]
  },

  /* ====================================================== 7. JAWI */
  {
    id: 'jawi',
    name: 'Pulau Jawi',
    short: 'Jawi',
    icon: '✍️',
    color: '#b45309',
    color2: '#ca8a04',
    desc: 'Baca dan tulis perkataan berimbuhan awalan.',
    badge: { name: 'Pendekar Jawi', icon: '🖋️' },
    units: [
      {
        id: 'j1', title: 'Teks Mudah — Imbuhan Awalan', icon: '✍️',
        color: '#b45309', soft: '#fef3c7',
        steps: [
          { type: 'info', icon: '✍️', title: 'Imbuhan awalan dalam Jawi',
            text: 'Imbuhan awalan ditambah di hadapan kata dasar untuk membentuk perkataan baru. Dalam tulisan Jawi, kita menulisnya bersambung dengan kata dasar.',
            bullets: [
              { i: 'مـ', t: 'meN- : melakukan sesuatu — contoh: membaca (ممباچا)' },
              { i: 'بر', t: 'ber- : melakukan untuk diri — contoh: bersuci (برسوچي)' },
              { i: 'تر', t: 'ter- : sudah atau tidak sengaja — contoh: tersenyum (ترسڽوم)' },
              { i: 'د', t: 'di- : perbuatan yang dikenakan — contoh: dibaca (دباچا)' },
              { i: 'ک', t: 'ke- : arah atau tujuan — contoh: ke sekolah (کسکوله)' }
            ] },
          { type: 'match', title: 'Padankan perkataan Jawi dengan tulisan Rumi', prompt: 'Sentuh perkataan Jawi di kiri, kemudian sentuh ejaan Rumi yang betul di kanan.',
            aLabel: 'Jawi', bLabel: 'Rumi',
            pairs: [
              { a: 'ممباچا', b: 'membaca', jawi: true },
              { a: 'منوليس', b: 'menulis', jawi: true },
              { a: 'برسوچي', b: 'bersuci', jawi: true },
              { a: 'ترسڽوم', b: 'tersenyum', jawi: true },
              { a: 'دباچا', b: 'dibaca', jawi: true },
              { a: 'کسکوله', b: 'ke sekolah', jawi: true }
            ] },
          { type: 'order', title: 'Susun perkataan menjadi ayat', prompt: 'Sentuh perkataan Jawi mengikut susunan ayat yang betul.',
            items: [
              { id: 'k', jawi: 'کيت', t: 'کيت' },
              { id: 'm', jawi: 'ممباچا', t: 'ممباچا' },
              { id: 'b', jawi: 'بوکو', t: 'بوکو' }
            ],
            correct: ['k', 'm', 'b'],
            tip: 'Ayatnya bermaksud: Kita membaca buku.' },
          { type: 'quiz', icon: '✍️', q: 'Bagaimanakah imbuhan awalan "ber-" ditulis dalam Jawi?',
            options: [
              { t: 'بر', ok: true },
              { t: 'تر', why: 'تر ialah imbuhan awalan "ter-".' },
              { t: 'مم', why: 'مم ialah imbuhan awalan "meN-".' }
            ],
            why: 'Betul! "ber-" ditulis بر dalam Jawi.' },
          { type: 'quiz', icon: '📝', q: 'Perkataan "membaca" mengandungi imbuhan awalan...',
            options: [
              { t: 'meN-', ok: true },
              { t: 'ber-', why: '"ber-" menghasilkan "berbaca" yang tidak wujud.' },
              { t: 'ter-', why: '"terbaca" membawa maksud lain (tidak sengaja terbaca).' }
            ],
            why: 'Betul! Kata dasar "baca" + meN- menjadi "membaca".' }
        ]
      }
    ]
  }
];

/* ========================= LENCANA & KEDAI ========================= */

const SPECIAL_BADGES = [
  { id: 'all', name: 'Pengembara Ilmu', icon: '🌍', desc: 'Menyiapkan kesemua 7 pulau' },
  { id: 'stars50', name: 'Kutipan Bintang 50', icon: '💫', desc: 'Mengumpul 50 Bintang Ilmu' },
  { id: 'streak3', name: 'Istiqamah 3 Hari', icon: '🔥', desc: 'Belajar 3 hari berturut-turut' }
];

const SHOP_ITEMS = [
  { id: 'cap', name: 'Topi Pengembara', icon: '🧢', price: 20, acc: 'acc-cap', desc: 'Topi biru untuk Ilmu' },
  { id: 'glasses', name: 'Cermin Mata Ilmu', icon: '👓', price: 30, acc: 'acc-glasses', desc: 'Nampak lebih bijak!' },
  { id: 'scarf', name: 'Selendang Hijau', icon: '🧣', price: 45, acc: 'acc-scarf', desc: 'Selendang warna hijau' },
  { id: 'jubah', name: 'Jubah Ungu', icon: '🧥', price: 60, acc: 'acc-jubah', desc: 'Jubah ahli ilmu' },
  { id: 'crown', name: 'Mahkota Emas', icon: '👑', price: 90, acc: 'acc-crown', desc: 'Mahkota juara ilmu' }
];

const PRAISE = [
  'Bagus sekali!',
  'Hebat! Ilmu bertambah!',
  'Tahniah, kamu berjaya!',
  'Betul! Kamu memang bijak!',
  'Syabas! Teruskan usaha!',
  'Alhamdulillah, kamu faham!'
];
const ENCOURAGE = [
  'Jangan putus asa, cuba lagi!',
  'Hampir betul! Cuba baca soalan sekali lagi.',
  'Terus mencuba, kamu pasti boleh!',
  'Tidak mengapa, mari kita ulang.'
];
