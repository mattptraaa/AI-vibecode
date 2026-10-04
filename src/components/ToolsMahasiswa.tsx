import React, { useState } from 'react';
import { Calculator, FileText } from 'lucide-react';

export const ToolsMahasiswa: React.FC = () => {
  // Tools Nugas
  const [taskTopic, setTaskTopic] = useState('');
  const [taskOutline, setTaskOutline] = useState<string | null>(null);

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
    </div>
  );
};
