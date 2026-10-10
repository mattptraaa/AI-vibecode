import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { CLASS_MATERIALS } from '../src/data/classMaterials';

async function seed() {
  console.log('🚀 Memulai seeding materi kelas UT Family ke Firestore...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

  const classesList = Object.values(CLASS_MATERIALS);

  for (const classDef of classesList) {
    console.log(`\n📚 Memproses kelas: ${classDef.title} (${classDef.id})`);

    // 1. Metadata kelas
    await setDoc(doc(db, 'kelas', classDef.id), {
      id: classDef.id,
      name: classDef.title,
      description: classDef.description,
      license: classDef.license,
      meetingsCount: classDef.meetings.length,
      updatedAt: Date.now()
    }, { merge: true });

    // 2. Pertemuan
    for (const meeting of classDef.meetings) {
      const meetingId = meeting.preview.id;
      console.log(`  -> Menyimpan Pertemuan ${meeting.preview.meetingNumber}: ${meeting.preview.title}`);

      // Preview (default locked)
      await setDoc(doc(db, 'kelas', classDef.id, 'meetings', meetingId), {
        id: meeting.preview.id,
        classId: meeting.preview.classId,
        meetingNumber: meeting.preview.meetingNumber,
        title: meeting.preview.title,
        isLocked: true, // Default terkunci per ketentuan
        notice: 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.',
        tujuan: meeting.preview.tujuan,
        updatedAt: Date.now()
      }, { merge: true });

      // Content (referensi, materi, kuis)
      await setDoc(doc(db, 'kelas', classDef.id, 'meetings', meetingId, 'contents', 'data'), {
        referensi: meeting.content.referensi,
        materi: meeting.content.materi,
        kuis: meeting.content.kuis,
        updatedAt: Date.now()
      }, { merge: true });

      // Answers (kunci jawaban & pembahasan)
      await setDoc(doc(db, 'kelas', classDef.id, 'meetings', meetingId, 'answers', 'data'), {
        answers: meeting.answers.answers,
        updatedAt: Date.now()
      }, { merge: true });
    }
  }

  console.log('\n✨ Seeding selesai dengan sukses! 3 Kelas dan 9 Pertemuan telah terdaftar.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Gagal seeding:', err);
  process.exit(1);
});
