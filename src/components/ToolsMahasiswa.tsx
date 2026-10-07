import React, { useState } from 'react';
import { Calculator, FileText, GraduationCap, CheckCircle2, AlertCircle, Clock, BookOpen, X } from 'lucide-react';

export const ToolsMahasiswa: React.FC = () => {
  const [uasModalOpen, setUasModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'kalkulator' | 'skema' | 'checklist'>('kalkulator');

  // State kalkulator logika nilai UAS
  const [tutonScore, setTutonScore] = useState<number>(85);
  const [targetGrade, setTargetGrade] = useState<'A' | 'B' | 'C'>('B');
  const [schemeType, setSchemeType] = useState<'tuton' | 'tmk'>('tuton');

  // Ambang batas nilai akhir UT: A >= 80, B >= 70, C >= 60, D >= 50
  const targetMinScore = targetGrade === 'A' ? 80 : targetGrade === 'B' ? 70 : 60;
  
  // Hitung kebutuhan nilai UAS:
  // Jika Tuton: NA = 0.3 * Tuton + 0.7 * UAS => UAS = (NA - 0.3 * Tuton) / 0.7
  // Jika TMK: NA = 0.2 * TMK + 0.8 * UAS => UAS = (NA - 0.2 * TMK) / 0.8
  // Syarat mutlak UT: UAS harus minimal 30 agar Tuton/TMK dihitung!
  const tutonWeight = schemeType === 'tuton' ? 0.3 : 0.2;
  const uasWeight = schemeType === 'tuton' ? 0.7 : 0.8;
  const requiredUasRaw = (targetMinScore - (tutonWeight * tutonScore)) / uasWeight;
  const requiredUas = Math.max(30, Math.min(100, Math.ceil(requiredUasRaw)));

  return (
    <div className="body">
      <h2 className="t">Tools Mahasiswa</h2>
      <p className="lead">Bantu nugas lebih cepat, pantau progres akademik, dan persiapkan ujian akhir semester di UT.</p>

      {/* Main Panel Cards */}
      <div className="panel2" style={{ marginBottom: '20px' }}>
        {/* Tool Baru: UAS */}
        <div
          role="button"
          tabIndex={0}
          className="k"
          onClick={() => setUasModalOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setUasModalOpen(true);
            }
          }}
          style={{ cursor: 'pointer', textAlign: 'left', border: '2px solid var(--sky-d)' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <GraduationCap size={20} color="var(--sky-d)" />
              <b>Tools UAS (Ujian Akhir Semester)</b>
              <span
                style={{
                  fontSize: '11px',
                  background: 'var(--sky-l)',
                  color: 'var(--ink)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 700
                }}
              >
                Struktur & Logika
              </span>
            </div>
            <small>
              Simulasi target nilai kelulusan UAS, aturan syarat skor minimum 30%, struktur pengerjaan (THE, UO, UTM), dan panduan ujian.
            </small>
          </div>
          <em>Buka Tools &#8599;</em>
        </div>

        <a
          href="https://kalkulator-nilai.utfamily.my.id"
          target="_blank"
          rel="noopener noreferrer"
          className="k"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={18} color="var(--sky-d)" />
              <b>Kalkulator Perkiraan Nilai Akhir</b>
            </div>
            <small>Hitung perkiraan nilai akhir dari jumlah soal yang benar dan nilai tuton di kalkulator-nilai.utfamily.my.id</small>
          </div>
          <em>Kunjungi Situs &#8599;</em>
        </a>

        <a
          href="https://cek-sitasi.utfamily.my.id"
          target="_blank"
          rel="noopener noreferrer"
          className="k"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--sky-d)" />
              <b>Cek Sitasi dan Skor AI</b>
            </div>
            <small>Periksa kecocokan sitasi dengan daftar pustaka dan lihat skor gaya tulisan di cek-sitasi.utfamily.my.id</small>
          </div>
          <em>Kunjungi Situs &#8599;</em>
        </a>

        <a
          href="https://tools-tugas.utfamily.my.id"
          target="_blank"
          rel="noopener noreferrer"
          className="k"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--sky-d)" />
              <b>Tools Nugas & Kerangka Tugas Kuliah</b>
            </div>
            <small>Kunjungi tools nugas di subdomain tools-tugas.utfamily.my.id untuk membuat kerangka tugas kuliah otomatis</small>
          </div>
          <em>Kunjungi Situs &#8599;</em>
        </a>
      </div>

      {/* Modal Dialog Interaktif Tools UAS */}
      {uasModalOpen && (
        <div
          className="mdl on"
          onClick={() => setUasModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="uas-tool-title"
        >
          <div
            className="mc"
            style={{ maxWidth: '640px', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="x"
              onClick={() => setUasModalOpen(false)}
              aria-label="Tutup"
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--sky-l)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <GraduationCap size={22} color="var(--sky-d)" />
              </div>
              <div>
                <h3 id="uas-tool-title" style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
                  Tools UAS (Ujian Akhir Semester)
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--ink2)' }}>
                  Penyusunan Struktur & Logika Kelulusan Mahasiswa UT
                </span>
              </div>
            </div>

            {/* Banner status dalam pengembangan */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                padding: '10px 14px',
                background: 'var(--bg2)',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                margin: '12px 0 16px',
                fontSize: '13px'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--sky-d)' }} />
              <div>
                <b>Tahap Penyusunan Struktur & Logika:</b> Modul ini sedang aktif dirancang. Anda sudah bisa menggunakan simulasi logika batas nilai minimum, struktur skema THE/UO/UTM, dan checklist kelengkapan ujian.
              </div>
            </div>

            {/* Navigasi Tab */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                className={`pill ${activeTab === 'kalkulator' ? '' : 'o'}`}
                style={{ fontSize: '13px', padding: '6px 14px' }}
                onClick={() => setActiveTab('kalkulator')}
              >
                Simulasi Logika Nilai
              </button>
              <button
                type="button"
                className={`pill ${activeTab === 'skema' ? '' : 'o'}`}
                style={{ fontSize: '13px', padding: '6px 14px' }}
                onClick={() => setActiveTab('skema')}
              >
                Struktur Skema UAS
              </button>
              <button
                type="button"
                className={`pill ${activeTab === 'checklist' ? '' : 'o'}`}
                style={{ fontSize: '13px', padding: '6px 14px' }}
                onClick={() => setActiveTab('checklist')}
              >
                Checklist Ujian
              </button>
            </div>

            {/* TAB 1: Logika Bobot Nilai UAS */}
            {activeTab === 'kalkulator' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'var(--card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 700 }}>
                    Logika Syarat Mutlak Nilai UAS UT
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--ink2)', margin: '0 0 10px', lineHeight: 1.5 }}>
                    Berdasarkan ketentuan Universitas Terbuka, nilai tugas <b>Tuton (bobot 30%)</b> atau <b>TMK (bobot 20%)</b> baru akan berkontribusi ke Nilai Akhir jika nilai UAS mencapai minimal <b>30 poin (skor 30)</b>. Jika UAS di bawah 30, nilai akhir 100% diambil dari UAS saja (gagal).
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Jenis Bantuan Belajar:
                      </label>
                      <select
                        value={schemeType}
                        onChange={(e) => setSchemeType(e.target.value as any)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)' }}
                      >
                        <option value="tuton">Tuton (Bobot 30%)</option>
                        <option value="tmk">TMK (Bobot 20%)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Estimasi Nilai {schemeType === 'tuton' ? 'Tuton' : 'TMK'}:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={tutonScore}
                        onChange={(e) => setTutonScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Target Indeks Nilai:
                      </label>
                      <select
                        value={targetGrade}
                        onChange={(e) => setTargetGrade(e.target.value as any)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)' }}
                      >
                        <option value="A">Grade A (≥ 80)</option>
                        <option value="B">Grade B (≥ 70)</option>
                        <option value="C">Grade C (≥ 60)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Hasil Perhitungan */}
                <div
                  style={{
                    background: 'var(--sky-l)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--sky-d)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '13px', color: 'var(--ink2)', marginBottom: '4px' }}>
                    Kebutuhan Skor UAS Minimum untuk Meraih <b>Grade {targetGrade}</b>:
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: '#0E2A47' }}>
                    {requiredUas} <span style={{ fontSize: '18px', fontWeight: 500 }}>/ 100</span>
                  </div>
                  <div style={{ fontSize: '12.5px', marginTop: '6px', color: 'var(--ink)' }}>
                    {requiredUas <= 30 ? (
                      <span>Nilai {schemeType.toUpperCase()} kamu sudah tinggi. Cukup raih batas minimal UAS <b>30</b> agar nilai {schemeType.toUpperCase()} berkontribusi penuh.</span>
                    ) : requiredUas > 100 ? (
                      <span style={{ color: '#E0245E' }}>Target Grade {targetGrade} terlalu tinggi untuk nilai {schemeType.toUpperCase()} saat ini. Coba targetkan Grade di bawahnya.</span>
                    ) : (
                      <span>Kamu perlu menjawab benar sekitar <b>{Math.ceil((requiredUas / 100) * 45)}</b> dari 45 soal pilihan ganda (atau skor esai setara).</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Struktur Skema UAS */}
            {activeTab === 'skema' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'var(--card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <BookOpen size={18} color="var(--sky-d)" />
                    <b style={{ fontSize: '15px' }}>1. THE (Take Home Exam)</b>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--ink2)', margin: 0, lineHeight: 1.5 }}>
                    Ujian esai terbuka berbasis daring via laman the.ut.ac.id. Mahasiswa mengunduh soal, menyusun lembar BJU (Buku Jawaban Ujian), dan mengunggah kembali dalam rentang waktu yang tertera pada KTPU (biasanya 6 atau 12 jam). Wajib menyertakan Surat Pernyataan Kejujuran Akademik.
                  </p>
                </div>

                <div style={{ background: 'var(--card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Clock size={18} color="var(--sky-d)" />
                    <b style={{ fontSize: '15px' }}>2. UO (Ujian Online / Web-based)</b>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--ink2)', margin: 0, lineHeight: 1.5 }}>
                    Ujian berbasis komputer di lokasi sentra layanan atau laboratorium UT Daerah yang ditunjuk. Soal berbentuk pilihan ganda dengan durasi berkisar 90 menit per mata kuliah. Hasil nilai akan langsung tercatat di sistem ujian.
                  </p>
                </div>

                <div style={{ background: 'var(--card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <CheckCircle2 size={18} color="var(--sky-d)" />
                    <b style={{ fontSize: '15px' }}>3. UTM (Ujian Tatap Muka)</b>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--ink2)', margin: 0, lineHeight: 1.5 }}>
                    Ujian tulis konvensional menggunakan Lembar Jawaban Ujian (LJU) berbasis pensil 2B di sekolah/kampus lokasi yang ditentukan dalam KTPU. Wajib hadir tepat waktu sebelum bel ujian berbunyi.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: Checklist Persiapan Ujian */}
            {activeTab === 'checklist' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Cetak KTPU (Kartu Tanda Peserta Ujian) terbaru dari portal myut.ut.ac.id',
                  'Siapkan KTP asli dan KTM / Kartu Tanda Mahasiswa Sementara (KTMS)',
                  'Pastikan akun the.ut.ac.id atau akses UO sudah teruji bisa login sebelum hari H',
                  'Format file PDF BJU maksimal 5MB dengan Surat Pernyataan Kejujuran bertanda tangan',
                  'Kuasai ringkasan Modul BMP (Buku Materi Pokok) dan latihan tes formatif tiap modul',
                  'Cek lokasi ujian 1 hari sebelum jadwal jika mengikuti UTM atau UO'
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: 'var(--card)',
                      borderRadius: '10px',
                      border: '1px solid var(--line)',
                      fontSize: '13.5px'
                    }}
                  >
                    <CheckCircle2 size={18} color="var(--sky-d)" style={{ flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button
                type="button"
                className="pill"
                onClick={() => setUasModalOpen(false)}
                style={{ padding: '8px 20px', fontSize: '13.5px' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
