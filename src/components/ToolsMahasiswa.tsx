import React, { useState } from 'react';
import { Calculator, FileText } from 'lucide-react';

export const ToolsMahasiswa: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'citasi' | 'nugas' | null>(null);

  // Cek Sitasi
  const [citationText, setCitationText] = useState('');
  const [citationResult, setCitationResult] = useState<string | null>(null);

  // Tools Nugas
  const [taskTopic, setTaskTopic] = useState('');
  const [taskOutline, setTaskOutline] = useState<string | null>(null);

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
    </div>
  );
};
