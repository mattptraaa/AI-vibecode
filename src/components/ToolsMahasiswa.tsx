import React from 'react';
import { Calculator, FileText, GraduationCap } from 'lucide-react';

export const ToolsMahasiswa: React.FC = () => {
  return (
    <div className="body">
      <h2 className="t">Tools Mahasiswa</h2>
      <p className="lead">Bantu nugas lebih cepat, pantau progres akademik, dan persiapkan ujian akhir semester di UT.</p>

      {/* Main Panel Cards */}
      <div className="panel2" style={{ marginBottom: '20px' }}>
        {/* Tools UAS */}
        <a
          href="https://tools-uas.utfamily.my.id/"
          target="_blank"
          rel="noopener noreferrer"
          className="k"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={18} color="var(--sky-d)" />
              <b>Tools UAS (Ujian Akhir Semester)</b>
            </div>
            <small>
              Buat latihan soal uas dari gabungan materi modul, inisiasi tuton dan target modul di tools-uas.utfamily.my.id
            </small>
          </div>
          <em>Kunjungi Situs</em>
        </a>

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
          <em>Kunjungi Situs</em>
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
          <em>Kunjungi Situs</em>
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
          <em>Kunjungi Situs</em>
        </a>
      </div>
    </div>
  );
};
