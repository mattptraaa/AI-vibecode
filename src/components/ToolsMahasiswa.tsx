import React, { useState } from 'react';
import { Calculator, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const ToolsMahasiswa: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'calc' | 'citasi' | 'nugas' | null>(null);

  // Kalkulator Nilai UAS
  const [tutonScore, setTutonScore] = useState<number>(85);
  const [uasScore, setUasScore] = useState<number>(70);

  // Cek Sitasi
  const [citationText, setCitationText] = useState('');
  const [citationResult, setCitationResult] = useState<string | null>(null);

  // Tools Nugas
  const [taskTopic, setTaskTopic] = useState('');
  const [taskOutline, setTaskOutline] = useState<string | null>(null);

  // Hitung Nilai UT
  // Di UT: Syarat agar nilai Tuton/Praktik diperhitungkan adalah skor UAS >= 30.
  // Jika UAS < 30, nilai akhir murni dari UAS (atau nilai tuton hangus).
  // Jika UAS >= 30, Nilai Akhir = (30% * Tuton) + (70% * UAS).
  const isUasEligible = uasScore >= 30;
  const finalScore = isUasEligible ? Math.round((tutonScore * 0.3 + uasScore * 0.7) * 100) / 100 : uasScore;

  const getGrade = (score: number) => {
    if (score >= 80) return { grade: 'A', status: 'Sangat Baik (Lulus)', color: '#27ae60' };
    if (score >= 70) return { grade: 'B', status: 'Baik (Lulus)', color: '#2980b9' };
    if (score >= 56) return { grade: 'C', status: 'Cukup (Lulus)', color: '#f39c12' };
    if (score >= 40) return { grade: 'D', status: 'Kurang (Perlu Perbaikan)', color: '#e67e22' };
    return { grade: 'E', status: 'Tidak Lulus', color: '#c0392b' };
  };

  const currentGrade = getGrade(finalScore);

  const handleCheckCitation = () => {
    if (!citationText.trim()) return;
    const t = citationText.trim();
    // Basic heuristics for academic citation
    const hasYear = /\(\d{4}\)|\b\d{4}\b/.test(t);
    const hasAuthor = /^[A-Z][a-zA-Z\s,.]+/.test(t);
    const hasTitle = /["'“”]|\b(dalam|in|vol|edisi|jurnal|press|penerbit)\b/i.test(t);

    if (hasYear && hasAuthor && hasTitle) {
      setCitationResult('Format sitasi terlihat lengkap (memuat Penulis, Tahun, dan Judul/Penerbit). Gaya sitasi mendekati standar APA/Harvard.');
    } else if (hasYear && hasAuthor) {
      setCitationResult('Sitasi memuat Penulis dan Tahun. Pastikan menyertakan judul lengkap publikasi, kota terbit, atau nama jurnal.');
    } else {
      setCitationResult('Sitasi belum lengkap. Format umum APA: Nama Belakang, Inisial. (Tahun). Judul Buku/Artikel. Nama Penerbit/Jurnal.');
    }
  };

  const handleGenerateOutline = () => {
    if (!taskTopic.trim()) return;
    setTaskOutline(
      `Sistematika Tugas Kuliah UT untuk topik "${taskTopic}":\n\n` +
      `I. PENDAHULUAN\n` +
      `- Latar belakang pentingnya mempelajari ${taskTopic}\n` +
      `- Rumusan masalah & tujuan pembahasan tugas\n\n` +
      `II. KAJIAN PUSTAKA / TEORI (Merujuk Modul BMP UT)\n` +
      `- Konsep dasar dan definisi ahli menurut BMP Modul terkait\n` +
      `- Landasan teori pendukung\n\n` +
      `III. PEMBAHASAN / ANALISIS KASUS\n` +
      `- Analisis pertanyaan tugas sesuai instruksi tutor\n` +
      `- Contoh konkret penerapan di dunia nyata/lapangan\n\n` +
      `IV. PENUTUP & KESIMPULAN\n` +
      `- Kesimpulan inti jawaban tugas\n` +
      `- Saran atau refleksi pembelajaran\n\n` +
      `V. DAFTAR PUSTAKA\n` +
      `- Cantumkan Buku Materi Pokok (BMP) UT beserta sumber jurnal/referensi kredibel.`
    );
  };

  return (
    <div className="body">
      <h2 className="t">Tools Mahasiswa</h2>
      <p className="lead">Bantu nugas lebih cepat dan pantau progres akademik kuliah di UT.</p>

      {/* Main Panel Cards */}
      <div className="panel2" style={{ marginBottom: '20px' }}>
        <div
          className="k"
          style={{ cursor: 'pointer', border: activeTool === 'calc' ? '2px solid var(--sky-d)' : '1px solid var(--line)' }}
          onClick={() => setActiveTool(activeTool === 'calc' ? null : 'calc')}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={18} color="var(--sky-d)" />
              <b>Kalkulator Perkiraan Nilai UAS & Tuton</b>
            </div>
            <small>Simulasikan nilai akhir kuliah berdasarkan bobot 30% Tuton dan 70% UAS serta syarat minimal 30% skor UAS</small>
          </div>
          <em>{activeTool === 'calc' ? 'Tutup' : 'Buka Alat'}</em>
        </div>

        {/* Calc Expanded Form */}
        {activeTool === 'calc' && (
          <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '18px', marginTop: '12px', border: '1.5px solid var(--line)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Simulasi Nilai Akhir Mata Kuliah</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  Nilai Rata-rata Tuton (Bobot 30%): {tutonScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tutonScore}
                  onChange={(e) => setTutonScore(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  Perkiraan Nilai UAS (Bobot 70%): {uasScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={uasScore}
                  onChange={(e) => setUasScore(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', background: 'var(--sky-l)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--ink2)' }}>Perkiraan Skor Akhir</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: currentGrade.color }}>
                    {finalScore} <span style={{ fontSize: '20px' }}>({currentGrade.grade})</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: currentGrade.color }}>{currentGrade.status}</span>
                </div>
              </div>

              {!isUasEligible ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px', color: '#c0392b', fontSize: '13px' }}>
                  <AlertCircle size={18} />
                  <span>
                    <b>Peringatan:</b> Skor UAS di bawah 30 poin. Sesuai aturan katalog UT, nilai Tuton tidak diperhitungkan jika skor UAS kurang dari 30%.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px', color: '#27ae60', fontSize: '13px' }}>
                  <CheckCircle2 size={18} />
                  <span>
                    Skor UAS memenuhi batas minimal 30%. Nilai Tuton berkontribusi 30% ({Math.round(tutonScore * 0.3 * 10) / 10} poin) dan UAS 70% ({Math.round(uasScore * 0.7 * 10) / 10} poin).
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div
          className="k"
          style={{ cursor: 'pointer', border: activeTool === 'citasi' ? '2px solid var(--sky-d)' : '1px solid var(--line)' }}
          onClick={() => setActiveTool(activeTool === 'citasi' ? null : 'citasi')}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--sky-d)" />
              <b>Cek Sitasi dan Format Referensi</b>
            </div>
            <small>Periksa kelengkapan elemen daftar pustaka (penulis, tahun, judul modul/jurnal) agar tidak terkena revisi tugas</small>
          </div>
          <em>{activeTool === 'citasi' ? 'Tutup' : 'Buka Alat'}</em>
        </div>

        {/* Citasi Expanded Form */}
        {activeTool === 'citasi' && (
          <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '18px', marginTop: '12px', border: '1.5px solid var(--line)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Pemeriksa Format Sitasi & Referensi</h3>
            <textarea
              rows={3}
              value={citationText}
              onChange={(e) => setCitationText(e.target.value)}
              placeholder="Tempel contoh daftar pustakamu di sini (contoh: Sugiyono. (2019). Metode Penelitian Kuantitatif. Bandung: Alfabeta)..."
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: '14px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="pill" type="button" onClick={handleCheckCitation}>
                Periksa Sitasi
              </button>
            </div>
            {citationResult && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--sky-l)', borderRadius: '10px', fontSize: '14px' }}>
                <b>Hasil Analisis:</b> {citationResult}
              </div>
            )}
          </div>
        )}

        <div
          className="k"
          style={{ cursor: 'pointer', border: activeTool === 'nugas' ? '2px solid var(--sky-d)' : '1px solid var(--line)' }}
          onClick={() => setActiveTool(activeTool === 'nugas' ? null : 'nugas')}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--sky-d)" />
              <b>Tools Nugas & Kerangka Tugas Kuliah</b>
            </div>
            <small>Buat kerangka sistematika tugas kuliah terstruktur sesuai standar penulisan BMP Universitas Terbuka</small>
          </div>
          <em>{activeTool === 'nugas' ? 'Tutup' : 'Buka Alat'}</em>
        </div>

        {/* Nugas Expanded Form */}
        {activeTool === 'nugas' && (
          <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '18px', marginTop: '12px', border: '1.5px solid var(--line)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Generator Kerangka Tugas Kuliah</h3>
            <input
              type="text"
              value={taskTopic}
              onChange={(e) => setTaskTopic(e.target.value)}
              placeholder="Masukkan topik atau judul tugas (contoh: Analisis Manajemen Rantai Pasok)..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: '14px', marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="pill" type="button" onClick={handleGenerateOutline}>
                Susun Kerangka Tugas
              </button>
            </div>
            {taskOutline && (
              <div style={{ marginTop: '14px', padding: '14px', background: 'var(--paper)', border: '1.5px solid var(--line)', borderRadius: '12px', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {taskOutline}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
