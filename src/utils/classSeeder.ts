import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CLASS_MATERIALS, ClassDefinition } from '../data/classMaterials';

export interface SeedProgressCallback {
  (message: string, current: number, total: number): void;
}

/**
 * Mengimpor dan menyinkronkan seluruh 3 kelas dan 9 pertemuan ke Firestore.
 * Dokumen dipisahkan menjadi:
 * 1. `kelas/{classId}`: Informasi metadata kelas dan atribusi lisensi
 * 2. `kelas/{classId}/meetings/{meetingId}`: Dokumen preview (judul, tujuan, status isLocked=true, notice)
 * 3. `kelas/{classId}/meetings/{meetingId}/contents/data`: Dokumen isi lengkap (referensi, materi, kuis)
 * 4. `kelas/{classId}/meetings/{meetingId}/answers/data`: Dokumen kunci jawaban & pembahasan rahasia
 */
export async function seedAllClassesToFirestore(
  onProgress?: SeedProgressCallback,
  preserveLockState: boolean = true
): Promise<{ success: boolean; seededCount: number; message: string }> {
  const classesList = Object.values(CLASS_MATERIALS);
  let totalSteps = 0;
  classesList.forEach((c) => {
    totalSteps += 1 + c.meetings.length * 3; // class doc + 3 docs per meeting
  });

  let currentStep = 0;

  for (const classDef of classesList) {
    currentStep++;
    onProgress?.(`Memproses metadata kelas ${classDef.title}...`, currentStep, totalSteps);

    // 1. Simpan metadata kelas
    const classRef = doc(db, 'kelas', classDef.id);
    await setDoc(
      classRef,
      {
        id: classDef.id,
        name: classDef.title,
        description: classDef.description,
        license: classDef.license,
        meetingsCount: classDef.meetings.length,
        updatedAt: Date.now()
      },
      { merge: true }
    );

    // 2. Simpan setiap pertemuan
    for (const meeting of classDef.meetings) {
      const meetingId = meeting.preview.id;

      // Cek apakah pertemuan sudah ada untuk mempertahankan status kunci yang telah diatur oleh PJ
      let isLocked = true;
      if (preserveLockState) {
        try {
          const existingSnap = await getDoc(doc(db, 'kelas', classDef.id, 'meetings', meetingId));
          if (existingSnap.exists() && typeof existingSnap.data().isLocked === 'boolean') {
            isLocked = existingSnap.data().isLocked;
          }
        } catch {
          isLocked = true;
        }
      }

      // 2a. Dokumen Preview Pertemuan
      currentStep++;
      onProgress?.(
        `Menyimpan preview ${classDef.title} - ${meeting.preview.title}...`,
        currentStep,
        totalSteps
      );
      const meetingPreviewRef = doc(db, 'kelas', classDef.id, 'meetings', meetingId);
      await setDoc(
        meetingPreviewRef,
        {
          id: meeting.preview.id,
          classId: meeting.preview.classId,
          meetingNumber: meeting.preview.meetingNumber,
          title: meeting.preview.title,
          isLocked,
          notice: meeting.preview.notice || 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.',
          tujuan: meeting.preview.tujuan,
          updatedAt: Date.now()
        },
        { merge: true }
      );

      // 2b. Dokumen Isi Lengkap Pertemuan (Referensi, Materi, Kuis)
      currentStep++;
      onProgress?.(
        `Menyimpan isi materi ${classDef.title} - ${meeting.preview.title}...`,
        currentStep,
        totalSteps
      );
      const contentRef = doc(db, 'kelas', classDef.id, 'meetings', meetingId, 'contents', 'data');
      await setDoc(
        contentRef,
        {
          referensi: meeting.content.referensi,
          materi: meeting.content.materi,
          kuis: meeting.content.kuis,
          updatedAt: Date.now()
        },
        { merge: true }
      );

      // 2c. Dokumen Kunci Jawaban & Pembahasan Rahasia
      currentStep++;
      onProgress?.(
        `Menyimpan kunci jawaban rahasia ${classDef.title} - Pertemuan ${meeting.preview.meetingNumber}...`,
        currentStep,
        totalSteps
      );
      const answersRef = doc(db, 'kelas', classDef.id, 'meetings', meetingId, 'answers', 'data');
      await setDoc(
        answersRef,
        {
          answers: meeting.answers.answers,
          updatedAt: Date.now()
        },
        { merge: true }
      );
    }
  }

  return {
    success: true,
    seededCount: 9,
    message: 'Seluruh 3 kelas dan 9 pertemuan berhasil disinkronkan ke Firestore.'
  };
}
