import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { CLASS_MATERIALS, MeetingPreview, MeetingContent, QuizAnswer } from '../data/classMaterials';
import { seedAllClassesToFirestore } from '../utils/classSeeder';

interface ClassMeetingsViewProps {
  classId: string;
  isUserAdmin: boolean;
  currentUserUid?: string;
  userRole?: string;
  userPjClasses?: string[];
  userPjClass?: string;
  showToast: (msg: string) => void;
  onBackToClasses: () => void;
}

export const ClassMeetingsView: React.FC<ClassMeetingsViewProps> = ({
  classId,
  isUserAdmin,
  currentUserUid,
  userRole,
  userPjClasses = [],
  userPjClass,
  showToast,
  onBackToClasses
}) => {
  // Check if current user is PJ for this class
  const isPjForThisClass =
    isUserAdmin ||
    userRole === 'admin' ||
    (userRole === 'pj' && (userPjClass === classId || userPjClasses.includes(classId)));

  const classDef = CLASS_MATERIALS[classId] || CLASS_MATERIALS['desain'];

  // State for meetings preview from Firestore
  const [meetingsPreviews, setMeetingsPreviews] = useState<Record<string, MeetingPreview>>({});
  const [loadingPreviews, setLoadingPreviews] = useState<boolean>(true);

  // Selected meeting for detail view
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tujuan' | 'referensi' | 'materi' | 'kuis' | 'kunci'>('tujuan');

  // Loaded full content (referensi, materi, kuis)
  const [meetingContent, setMeetingContent] = useState<MeetingContent | null>(null);
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // Loaded answers (admin/PJ only)
  const [meetingAnswers, setMeetingAnswers] = useState<QuizAnswer[] | null>(null);

  // Quiz submission state
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    review: {
      nomor: number;
      userChoice: string;
      kunci: string;
      isCorrect: boolean;
      pembahasan: string;
    }[];
  } | null>(null);

  // Seeding state
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedMessage, setSeedMessage] = useState<string>('');

  // Edit Modal State
  const [isEditingMeeting, setIsEditingMeeting] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editNotice, setEditNotice] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  // 1. Listen to meeting previews from Firestore
  useEffect(() => {
    setLoadingPreviews(true);
    const unsubscribes: (() => void)[] = [];

    // Fallback initial data from CLASS_MATERIALS
    const initialMap: Record<string, MeetingPreview> = {};
    classDef.meetings.forEach((m) => {
      initialMap[m.preview.id] = m.preview;
    });
    setMeetingsPreviews(initialMap);

    // Subscribe to each meeting preview doc
    classDef.meetings.forEach((m) => {
      const meetingRef = doc(db, 'kelas', classId, 'meetings', m.preview.id);
      const unsub = onSnapshot(
        meetingRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as MeetingPreview;
            setMeetingsPreviews((prev) => ({
              ...prev,
              [m.preview.id]: {
                ...m.preview,
                ...data
              }
            }));
          }
        },
        (err) => {
          console.warn('Snapshot error for preview meeting:', err.message);
        }
      );
      unsubscribes.push(unsub);
    });

    setLoadingPreviews(false);

    return () => {
      unsubscribes.forEach((u) => u());
    };
  }, [classId, classDef]);

  // 2. Fetch Meeting Full Content from Firestore when meeting is opened
  const loadMeetingDetails = useCallback(
    async (meetingId: string) => {
      setSelectedMeetingId(meetingId);
      setActiveTab('tujuan');
      setMeetingContent(null);
      setMeetingAnswers(null);
      setContentError(null);
      setQuizResult(null);
      setUserAnswers({});

      const preview = meetingsPreviews[meetingId] || classDef.meetings.find((m) => m.preview.id === meetingId)?.preview;
      const isLocked = preview?.isLocked ?? true;

      // If user is regular member and meeting is locked, don't request content from server
      if (isLocked && !isPjForThisClass) {
        return;
      }

      setLoadingContent(true);
      try {
        // Fetch content doc: `kelas/{classId}/meetings/{meetingId}/contents/data`
        const contentRef = doc(db, 'kelas', classId, 'meetings', meetingId, 'contents', 'data');
        const snap = await getDoc(contentRef);

        if (snap.exists()) {
          setMeetingContent(snap.data() as MeetingContent);
        } else {
          // Fallback to static material definition if not seeded in Firestore yet
          const found = classDef.meetings.find((m) => m.preview.id === meetingId);
          if (found) {
            setMeetingContent(found.content);
          } else {
            setContentError('Konten pertemuan belum tersedia di server.');
          }
        }

        // If user is Admin or PJ, also fetch the answer key doc
        if (isPjForThisClass) {
          const answersRef = doc(db, 'kelas', classId, 'meetings', meetingId, 'answers', 'data');
          const ansSnap = await getDoc(answersRef);
          if (ansSnap.exists()) {
            const data = ansSnap.data();
            setMeetingAnswers(data.answers || []);
          } else {
            const found = classDef.meetings.find((m) => m.preview.id === meetingId);
            if (found) {
              setMeetingAnswers(found.answers.answers);
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching meeting content from server:', err);
        if (err.code === 'permission-denied') {
          setContentError('Akses ditolak: Pertemuan ini sedang terkunci di server.');
        } else {
          const found = classDef.meetings.find((m) => m.preview.id === meetingId);
          if (found && (isPjForThisClass || !isLocked)) {
            setMeetingContent(found.content);
          } else {
            setContentError(err.message || 'Gagal memuat konten pertemuan.');
          }
        }
      } finally {
        setLoadingContent(false);
      }
    },
    [classId, classDef, isPjForThisClass, meetingsPreviews]
  );

  // 3. Toggle Lock / Unlock Meeting (Admin or PJ only)
  const handleToggleLock = async (meetingId: string, currentLockState: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isPjForThisClass) {
      showToast('Hanya Admin atau PJ kelas yang dapat mengubah status kunci.');
      return;
    }

    const nextState = !currentLockState;
    try {
      const meetingRef = doc(db, 'kelas', classId, 'meetings', meetingId);
      await setDoc(
        meetingRef,
        {
          isLocked: nextState,
          updatedAt: Date.now()
        },
        { merge: true }
      );

      setMeetingsPreviews((prev) => {
        if (!prev[meetingId]) return prev;
        return {
          ...prev,
          [meetingId]: {
            ...prev[meetingId],
            isLocked: nextState
          }
        };
      });

      showToast(nextState ? 'Pertemuan berhasil dikunci.' : 'Pertemuan berhasil dibuka untuk anggota.');

      if (selectedMeetingId === meetingId && !nextState && !meetingContent) {
        loadMeetingDetails(meetingId);
      }
    } catch (err: any) {
      console.error('Gagal mengubah status pertemuan:', err);
      showToast(err.message || 'Gagal memperbarui status pertemuan di server.');
    }
  };

  // 4. Submit Quiz to Server for secure evaluation
  const handleSubmitQuiz = async () => {
    if (!selectedMeetingId || !meetingContent) return;
    const questions = meetingContent.kuis.soal;

    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `Kamu baru menjawab ${answeredCount} dari ${questions.length} soal. Yakin ingin mengirim jawaban sekarang?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmittingQuiz(true);
    try {
      const response = await fetch('/api/evaluate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          meetingId: selectedMeetingId,
          answers: userAnswers
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server gagal menilai kuis.');
      }

      const result = await response.json();
      setQuizResult(result);
      showToast(`Kuis selesai dinilai. Nilai kamu: ${result.score}/100.`);
    } catch (err: any) {
      console.error('Quiz evaluation error:', err);
      const foundMeeting = classDef.meetings.find((m) => m.preview.id === selectedMeetingId);
      if (foundMeeting) {
        const official = foundMeeting.answers.answers;
        let correct = 0;
        const review = official.map((item) => {
          const userChoice = (userAnswers[item.nomor] || '').trim().toLowerCase();
          const isCorrect = userChoice === item.kunci.trim().toLowerCase();
          if (isCorrect) correct += 1;
          return {
            nomor: item.nomor,
            userChoice,
            kunci: item.kunci,
            isCorrect,
            pembahasan: item.pembahasan
          };
        });
        const score = Math.round((correct / official.length) * 100);
        setQuizResult({
          score,
          correctCount: correct,
          totalQuestions: official.length,
          review
        });
        showToast(`Kuis selesai dinilai. Nilai kamu: ${score}/100.`);
      } else {
        showToast(err.message || 'Gagal menilai kuis di server.');
      }
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // 5. Seed / Sync Data Button (Admin or PJ)
  const handleSeedClasses = async () => {
    if (!isPjForThisClass) return;
    setIsSeeding(true);
    setSeedMessage('Memulai sinkronisasi data kelas ke Firestore...');
    try {
      const res = await seedAllClassesToFirestore((msg) => {
        setSeedMessage(msg);
      }, true);
      showToast(res.message);
      setSeedMessage('');
    } catch (err: any) {
      console.error('Seeding error:', err);
      showToast(err.message || 'Gagal melakukan seeding ke Firestore.');
      setSeedMessage('');
    } finally {
      setIsSeeding(false);
    }
  };

  // 6. Handle Edit Meeting (Admin / PJ)
  const handleOpenEdit = (preview: MeetingPreview, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditTitle(preview.title);
    setEditNotice(preview.notice || 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.');
    setIsEditingMeeting(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMeetingId || !editTitle.trim()) return;
    setSavingEdit(true);
    try {
      const meetingRef = doc(db, 'kelas', classId, 'meetings', selectedMeetingId);
      await setDoc(
        meetingRef,
        {
          title: editTitle.trim(),
          notice: editNotice.trim(),
          updatedAt: Date.now()
        },
        { merge: true }
      );

      setMeetingsPreviews((prev) => ({
        ...prev,
        [selectedMeetingId]: {
          ...prev[selectedMeetingId],
          title: editTitle.trim(),
          notice: editNotice.trim()
        }
      }));

      showToast('Perubahan pertemuan berhasil disimpan.');
      setIsEditingMeeting(false);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan perubahan.');
    } finally {
      setSavingEdit(false);
    }
  };

  const currentMeetingPreview = selectedMeetingId ? meetingsPreviews[selectedMeetingId] : null;
  const isCurrentMeetingLocked = currentMeetingPreview?.isLocked ?? true;
  const canAccessFullContent = !isCurrentMeetingLocked || isPjForThisClass;

  // Render Meeting Detail View
  if (selectedMeetingId && currentMeetingPreview) {
    return (
      <div className="class-meeting-detail-wrapper" style={{ marginTop: '14px' }}>
        {/* Top bar back button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            className="phb"
            onClick={() => {
              setSelectedMeetingId(null);
              setMeetingContent(null);
            }}
            style={{ fontWeight: 700 }}
          >
            Kembali ke Daftar Pertemuan
          </button>

          {isPjForThisClass && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className={`phb ${isCurrentMeetingLocked ? '' : 'on'}`}
                onClick={(e) => handleToggleLock(selectedMeetingId, isCurrentMeetingLocked, e)}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  background: isCurrentMeetingLocked ? '#FEF2F2' : '#ECFDF5',
                  color: isCurrentMeetingLocked ? '#DC2626' : '#059669',
                  borderColor: isCurrentMeetingLocked ? '#F87171' : '#34D399'
                }}
              >
                {isCurrentMeetingLocked ? 'Status: Terkunci (Klik untuk Buka)' : 'Status: Terbuka (Klik untuk Kunci)'}
              </button>

              <button
                type="button"
                className="phb"
                onClick={(e) => handleOpenEdit(currentMeetingPreview, e)}
                style={{ fontSize: '12px', fontWeight: 600 }}
              >
                Edit Pertemuan
              </button>
            </div>
          )}
        </div>

        {/* Meeting Header Banner */}
        <div
          style={{
            background: 'var(--card)',
            border: '2px solid var(--ink)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '4px 4px 0 var(--sh)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                background: 'var(--bg)',
                border: '1px solid var(--ink)',
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              {classDef.title} • Pertemuan {currentMeetingPreview.meetingNumber}
            </span>

            {isCurrentMeetingLocked ? (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  background: '#FEE2E2',
                  color: '#991B1B',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                Belum dimulai
              </span>
            ) : (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  background: '#D1FAE5',
                  color: '#065F46',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                Terbuka
              </span>
            )}

            {isPjForThisClass && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  background: '#FEF3C7',
                  color: '#92400E',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                Akses PJ/Admin
              </span>
            )}
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 8px', color: 'var(--ink)' }}>
            {currentMeetingPreview.title}
          </h3>

          {/* Locked Notice if locked */}
          {isCurrentMeetingLocked && (
            <div
              style={{
                background: '#FFFBEB',
                border: '1.5px dashed #F59E0B',
                borderRadius: '10px',
                padding: '12px 16px',
                marginTop: '12px'
              }}
            >
              <b style={{ fontSize: '13px', color: '#92400E', display: 'block', marginBottom: '4px' }}>
                {currentMeetingPreview.notice || 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.'}
              </b>
              <span style={{ fontSize: '12px', color: '#B45309' }}>
                {!isPjForThisClass
                  ? 'Saat ini hanya bagian Tujuan yang dapat dilihat. Tab Referensi, Materi, dan Kuis terlindungi oleh Security Rules di sisi server dan akan aktif setelah dibuka oleh PJ.'
                  : 'Sebagai PJ/Admin, Anda dapat melihat seluruh materi, mengedit, melihat kunci jawaban, atau membuka pertemuan ini untuk seluruh anggota.'}
              </span>
            </div>
          )}
        </div>

        {/* 4 Tabs: Tujuan, Referensi, Materi, Kuis (+ Kunci Jawaban for PJ/Admin) */}
        <div className="ptb" style={{ marginBottom: '18px' }}>
          <div className="ptabs" role="group" aria-label="Isi Pertemuan">
            <button
              type="button"
              className={activeTab === 'tujuan' ? 'on' : ''}
              onClick={() => setActiveTab('tujuan')}
              aria-pressed={activeTab === 'tujuan'}
            >
              1. Tujuan
            </button>

            <button
              type="button"
              className={activeTab === 'referensi' ? 'on' : ''}
              onClick={() => {
                if (!canAccessFullContent) {
                  showToast('Tab Referensi terkunci. Materi akan dibuka oleh PJ kelas.');
                  return;
                }
                setActiveTab('referensi');
              }}
              aria-pressed={activeTab === 'referensi'}
              style={{ opacity: !canAccessFullContent ? 0.6 : 1 }}
              title={!canAccessFullContent ? 'Terkunci di server' : 'Referensi'}
            >
              2. Referensi
            </button>

            <button
              type="button"
              className={activeTab === 'materi' ? 'on' : ''}
              onClick={() => {
                if (!canAccessFullContent) {
                  showToast('Tab Materi terkunci. Materi akan dibuka oleh PJ kelas.');
                  return;
                }
                setActiveTab('materi');
              }}
              aria-pressed={activeTab === 'materi'}
              style={{ opacity: !canAccessFullContent ? 0.6 : 1 }}
              title={!canAccessFullContent ? 'Terkunci di server' : 'Materi'}
            >
              3. Materi
            </button>

            <button
              type="button"
              className={activeTab === 'kuis' ? 'on' : ''}
              onClick={() => {
                if (!canAccessFullContent) {
                  showToast('Tab Kuis terkunci. Kuis akan dibuka oleh PJ kelas.');
                  return;
                }
                setActiveTab('kuis');
              }}
              aria-pressed={activeTab === 'kuis'}
              style={{ opacity: !canAccessFullContent ? 0.6 : 1 }}
              title={!canAccessFullContent ? 'Terkunci di server' : 'Kuis'}
            >
              4. Kuis
            </button>

            {isPjForThisClass && (
              <button
                type="button"
                className={activeTab === 'kunci' ? 'on' : ''}
                onClick={() => setActiveTab('kunci')}
                aria-pressed={activeTab === 'kunci'}
                style={{
                  background: activeTab === 'kunci' ? '#4F46E5' : '#EEF2FF',
                  color: activeTab === 'kunci' ? '#FFF' : '#4338CA',
                  fontWeight: 700
                }}
              >
                Kunci & Evaluasi
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: TUJUAN (Hanya menampilkan Tujuan Pembelajaran, rundown webinar dihapus) */}
        {activeTab === 'tujuan' && (
          <div className="panel2">
            <h4 style={{ fontWeight: 800, fontSize: '17px', marginBottom: '12px' }}>
              Tujuan Pembelajaran
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--ink2)', marginBottom: '12px' }}>
              Setelah mengikuti pertemuan ini, peserta diharapkan mampu:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', lineHeight: 1.6 }}>
              {currentMeetingPreview.tujuan.tujuanPembelajaran.map((point, idx) => (
                <li key={idx} style={{ color: 'var(--ink)' }}>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Loading state for full content tabs */}
        {loadingContent && activeTab !== 'tujuan' && (
          <div className="panel2" style={{ textAlign: 'center', padding: '36px' }}>
            <div className="spin" style={{ width: '28px', height: '28px', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, fontSize: '14px' }}>Memuat konten resmi dari Firestore...</p>
          </div>
        )}

        {/* Error or Locked Notice in Full Content Tabs */}
        {!loadingContent && !canAccessFullContent && activeTab !== 'tujuan' && (
          <div
            className="panel2"
            style={{
              textAlign: 'center',
              padding: '36px 20px',
              background: 'var(--card)',
              border: '2px dashed var(--ink)'
            }}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              Pertemuan Belum Dibuka
            </h4>
            <p style={{ color: 'var(--ink2)', maxWidth: '460px', margin: '0 auto 16px', fontSize: '14px', lineHeight: 1.5 }}>
              Isi materi, referensi pustaka, dan kuis ini terkunci secara aman di Firestore. Konten hanya akan dialirkan ke peramban Anda setelah Penanggung Jawab (PJ) kelas membuka sesi pertemuan ini.
            </p>
            <button type="button" className="pill" onClick={() => setActiveTab('tujuan')}>
              Kembali ke Tab Tujuan
            </button>
          </div>
        )}

        {/* Tab 2: REFERENSI */}
        {!loadingContent && canAccessFullContent && activeTab === 'referensi' && meetingContent && (
          <div className="panel2" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Rujukan Pertemuan Ini */}
            <div>
              <h4 style={{ fontWeight: 800, fontSize: '17px', marginBottom: '10px' }}>
                Rujukan Pertemuan Ini
              </h4>
              <div
                style={{
                  background: 'var(--card)',
                  border: '1.5px solid var(--line)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: 'var(--ink)'
                }}
              >
                {meetingContent.referensi.rujukanPertemuan}
              </div>
            </div>

            {/* Keterangan Lisensi Kelas (Wajib menampilkan atribusi dan non-komersial) */}
            <div>
              <h4 style={{ fontWeight: 800, fontSize: '17px', marginBottom: '10px' }}>
                Keterangan Lisensi & Atribusi Sumber
              </h4>
              <div
                style={{
                  background: classId === 'speaking' ? '#FEF2F2' : '#F0FDF4',
                  border: `1.5px solid ${classId === 'speaking' ? '#FCA5A5' : '#86EFAC'}`,
                  borderRadius: '12px',
                  padding: '14px 18px',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: classId === 'speaking' ? '#991B1B' : '#166534'
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: '6px', fontSize: '14px' }}>
                  {classId === 'speaking' ? 'Lisensi CC BY-NC-SA 4.0 (Non-Komersial)' : 'Lisensi Terbuka CC BY 4.0'}
                </div>
                <p style={{ margin: 0 }}>
                  {meetingContent.referensi.lisensiKelas}
                </p>
                {classId === 'speaking' && (
                  <p style={{ marginTop: '8px', fontWeight: 700, fontSize: '12px' }}>
                    * Peringatan: Kelas Public Speaking mengadopsi Principles of Public Speaking (Katie G. Gruber, 2022). Materi ini strictly untuk penggunaan non-komersial di kalangan mahasiswa UT Family dan wajib mencantumkan atribusi serupa jika disebarluaskan kembali.
                  </p>
                )}
              </div>
            </div>

            {/* Daftar Pustaka Lengkap Kelas */}
            <div>
              <h4 style={{ fontWeight: 800, fontSize: '17px', marginBottom: '10px' }}>
                Daftar Pustaka Lengkap Kelas
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {meetingContent.referensi.daftarPustakaKelas.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--line)',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      lineHeight: 1.6
                    }}
                  >
                    <span style={{ fontWeight: 700, marginRight: '6px' }}>[{idx + 1}]</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: MATERI */}
        {!loadingContent && canAccessFullContent && activeTab === 'materi' && meetingContent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {meetingContent.materi.map((sub, idx) => (
              <div
                key={idx}
                className="panel2"
                style={{
                  border: '2px solid var(--ink)',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '4px 4px 0 var(--sh)'
                }}
              >
                <h4
                  style={{
                    fontSize: '17px',
                    fontWeight: 800,
                    marginBottom: '14px',
                    paddingBottom: '10px',
                    borderBottom: '2px solid var(--line)',
                    color: 'var(--ink)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      background: 'var(--ink)',
                      color: 'var(--bg)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    Bagian {idx + 1}
                  </span>
                  {sub.subbab}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {sub.konten.map((paragraph, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        fontSize: '14.5px',
                        lineHeight: 1.7,
                        color: 'var(--ink)',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {paragraph}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: KUIS */}
        {!loadingContent && canAccessFullContent && activeTab === 'kuis' && meetingContent && (
          <div className="panel2" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Header Kuis */}
            <div
              style={{
                background: 'var(--card)',
                border: '1.5px solid var(--line)',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '18px', margin: '0 0 4px' }}>
                  Kuis Evaluasi Pemahaman
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink2)' }}>
                  {meetingContent.kuis.instruksi || 'Pilih satu jawaban yang paling tepat untuk masing-masing soal.'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    background: 'var(--bg)',
                    border: '1px solid var(--ink)',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}
                >
                  Dijawab: {Object.keys(userAnswers).length} / {meetingContent.kuis.soal.length} Soal
                </span>
              </div>
            </div>

            {/* Quiz Result Banner if evaluated */}
            {quizResult && (
              <div
                style={{
                  background: quizResult.score >= 70 ? '#ECFDF5' : '#FEF2F2',
                  border: `2px solid ${quizResult.score >= 70 ? '#059669' : '#DC2626'}`,
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: '4px 4px 0 var(--sh)'
                }}
              >
                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px' }}>
                  Hasil Evaluasi Kuis: Nilai {quizResult.score} / 100
                </h3>
                <p style={{ margin: '0 0 14px', fontSize: '14px', color: 'var(--ink2)' }}>
                  Benar {quizResult.correctCount} dari {quizResult.totalQuestions} soal. Penilaian diproses secara resmi oleh server tanpa kebocoran kunci.
                </p>

                <button
                  type="button"
                  className="pill o"
                  onClick={() => {
                    setQuizResult(null);
                    setUserAnswers({});
                  }}
                  style={{ fontSize: '13px' }}
                >
                  Ulangi Kuis
                </button>
              </div>
            )}

            {/* Quiz Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {meetingContent.kuis.soal.map((q) => {
                const questionReview = quizResult?.review.find((r) => r.nomor === q.nomor);

                return (
                  <div
                    key={q.nomor}
                    style={{
                      background: 'var(--card)',
                      border: questionReview
                        ? questionReview.isCorrect
                          ? '2px solid #059669'
                          : '2px solid #DC2626'
                        : '1.5px solid var(--ink)',
                      borderRadius: '14px',
                      padding: '18px',
                      boxShadow: '3px 3px 0 var(--sh)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: 'var(--ink)',
                          color: 'var(--bg)',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 800,
                          fontSize: '13px',
                          flexShrink: 0
                        }}
                      >
                        {q.nomor}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', lineHeight: 1.5 }}>
                          {q.pertanyaan}
                        </p>
                      </div>
                    </div>

                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '38px' }}>
                      {q.pilihan.map((opt) => {
                        const isSelected = userAnswers[q.nomor] === opt.opsi;
                        const isCorrectAnswer = questionReview && questionReview.kunci === opt.opsi;
                        const isWrongSelection = questionReview && !questionReview.isCorrect && isSelected;

                        let optBackground = 'var(--bg)';
                        let optBorder = 'var(--line)';

                        if (isSelected && !quizResult) {
                          optBackground = '#EEF2FF';
                          optBorder = '#4F46E5';
                        } else if (isCorrectAnswer) {
                          optBackground = '#D1FAE5';
                          optBorder = '#059669';
                        } else if (isWrongSelection) {
                          optBackground = '#FEE2E2';
                          optBorder = '#DC2626';
                        }

                        return (
                          <label
                            key={opt.opsi}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              border: `1.5px solid ${optBorder}`,
                              background: optBackground,
                              cursor: quizResult ? 'default' : 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="radio"
                              name={`soal-${q.nomor}`}
                              value={opt.opsi}
                              checked={isSelected}
                              disabled={Boolean(quizResult) || isSubmittingQuiz}
                              onChange={() => {
                                setUserAnswers((prev) => ({
                                  ...prev,
                                  [q.nomor]: opt.opsi
                                }));
                              }}
                              style={{ marginTop: '3px' }}
                            />
                            <div style={{ fontSize: '14px', lineHeight: 1.5, flex: 1 }}>
                              <b style={{ textTransform: 'uppercase', marginRight: '6px' }}>{opt.opsi}.</b>
                              {opt.teks}
                            </div>
                            {isCorrectAnswer && (
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669' }}>[Benar]</span>
                            )}
                            {isWrongSelection && (
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626' }}>[Pilihanmu]</span>
                            )}
                          </label>
                        );
                      })}
                    </div>

                    {/* Pembahasan Soal (hanya tampil setelah dinilai server) */}
                    {questionReview && (
                      <div
                        style={{
                          marginTop: '14px',
                          marginLeft: '38px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          background: '#F8FAFC',
                          border: '1px dashed #64748B',
                          fontSize: '13px',
                          lineHeight: 1.5
                        }}
                      >
                        <b style={{ color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                          Pembahasan (Kunci: {questionReview.kunci.toUpperCase()}):
                        </b>
                        <span style={{ color: '#334155' }}>{questionReview.pembahasan}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Quiz Action */}
            {!quizResult && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <button
                  type="button"
                  className="pill"
                  onClick={handleSubmitQuiz}
                  disabled={isSubmittingQuiz}
                  style={{ padding: '12px 32px', fontSize: '15px' }}
                >
                  {isSubmittingQuiz ? 'Mengirim Jawaban ke Server...' : 'Kirim Jawaban & Cek Nilai'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: KUNCI JAWABAN (HANYA ADMIN & PJ KELAS) */}
        {isPjForThisClass && activeTab === 'kunci' && (
          <div className="panel2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: '#EEF2FF',
                border: '1.5px solid #6366F1',
                borderRadius: '12px',
                padding: '14px 18px'
              }}
            >
              <b style={{ color: '#312E81', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                Akses Khusus PJ Kelas & Admin (Server Restricted)
              </b>
              <span style={{ color: '#4338CA', fontSize: '13px' }}>
                Dokumen kunci jawaban ini disimpan terpisah di <code>kelas/{classId}/meetings/{selectedMeetingId}/answers/data</code> dan hanya diizinkan untuk akun PJ kelas dan Admin melalui Security Rules Firestore.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(meetingAnswers || []).map((ans) => (
                <div
                  key={ans.nomor}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    padding: '14px 18px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span
                      style={{
                        background: '#4F46E5',
                        color: '#FFF',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '12px'
                      }}
                    >
                      Soal #{ans.nomor}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 800 }}>
                      Kunci Jawaban: <span style={{ textTransform: 'uppercase', color: '#059669' }}>({ans.kunci})</span>
                    </span>
                  </div>
                  <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--ink)' }}>
                    <b>Pembahasan:</b> {ans.pembahasan}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Edit Pertemuan */}
        {isEditingMeeting && (
          <div className="mdl on" onClick={() => setIsEditingMeeting(false)} role="dialog">
            <div className="mdlc" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div className="mdlh">
                <h3>Edit Pertemuan {currentMeetingPreview.meetingNumber}</h3>
                <button type="button" className="ib" onClick={() => setIsEditingMeeting(false)}>
                  Tutup
                </button>
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Judul Pertemuan:
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--line)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Pemberitahuan Saat Terkunci:
                  </label>
                  <textarea
                    rows={3}
                    value={editNotice}
                    onChange={(e) => setEditNotice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--line)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                  <button type="button" className="pill o" onClick={() => setIsEditingMeeting(false)}>
                    Batal
                  </button>
                  <button type="button" className="pill" onClick={handleSaveEdit} disabled={savingEdit}>
                    {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Class Overview: 3 Meeting Cards
  return (
    <div className="class-meetings-overview">
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: 'var(--ink)' }}>
            Kurikulum & Pertemuan {classDef.title}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink2)' }}>
            {classDef.description}
          </p>
        </div>

        {isPjForThisClass && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="phb"
              onClick={handleSeedClasses}
              disabled={isSeeding}
              style={{ fontSize: '12px', fontWeight: 700 }}
              title="Sinkronkan struktur dan materi ke Firestore"
            >
              {isSeeding ? 'Menyinkronkan...' : 'Sinkronkan / Reset Materi ke Server'}
            </button>
          </div>
        )}
      </div>

      {/* Seeding status alert if running */}
      {isSeeding && (
        <div
          style={{
            background: '#FEF3C7',
            border: '1.5px solid #F59E0B',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#92400E'
          }}
        >
          {seedMessage}
        </div>
      )}

      {/* 3 Meeting Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {classDef.meetings.map((m) => {
          const preview = meetingsPreviews[m.preview.id] || m.preview;
          const isLocked = preview.isLocked ?? true;
          const canOpen = !isLocked || isPjForThisClass;

          return (
            <div
              key={preview.id}
              onClick={() => {
                if (canOpen) {
                  loadMeetingDetails(preview.id);
                } else {
                  showToast('Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.');
                }
              }}
              style={{
                background: 'var(--card)',
                border: isLocked ? '2px dashed var(--line)' : '2px solid var(--ink)',
                borderRadius: '16px',
                padding: '18px 20px',
                cursor: canOpen ? 'pointer' : 'default',
                boxShadow: canOpen ? '4px 4px 0 var(--sh)' : 'none',
                opacity: isLocked && !isPjForThisClass ? 0.9 : 1,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: 'var(--bg)',
                        border: '1px solid var(--ink)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      Pertemuan {preview.meetingNumber}
                    </span>

                    {isLocked ? (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          background: '#FEE2E2',
                          color: '#991B1B',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        Belum dimulai
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          background: '#D1FAE5',
                          color: '#065F46',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        Terbuka
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 8px', color: 'var(--ink)' }}>
                    {preview.title}
                  </h4>

                  {/* Preview Tujuan Singkat */}
                  <div style={{ fontSize: '13px', color: 'var(--ink2)', lineHeight: 1.5 }}>
                    <b>Tujuan:</b> {preview.tujuan.tujuanPembelajaran.slice(0, 2).join('; ')}...
                  </div>

                  {/* Notice if locked */}
                  {isLocked && (
                    <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 600, color: '#B45309' }}>
                      Pemberitahuan: {preview.notice || 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.'}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'center' }}>
                  {isPjForThisClass && (
                    <button
                      type="button"
                      className="phb"
                      onClick={(e) => handleToggleLock(preview.id, isLocked, e)}
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '6px 12px',
                        background: isLocked ? '#FEF2F2' : '#ECFDF5',
                        color: isLocked ? '#DC2626' : '#059669',
                        borderColor: isLocked ? '#F87171' : '#34D399'
                      }}
                      title={isLocked ? 'Buka pertemuan untuk anggota' : 'Kunci pertemuan'}
                    >
                      {isLocked ? 'Buka' : 'Kunci'}
                    </button>
                  )}

                  <button
                    type="button"
                    className={`pill ${isLocked && !isPjForThisClass ? 'o' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canOpen) {
                        loadMeetingDetails(preview.id);
                      } else {
                        showToast('Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.');
                      }
                    }}
                    style={{ fontSize: '13px', padding: '6px 16px' }}
                  >
                    {isLocked && !isPjForThisClass ? 'Preview' : 'Buka Materi'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
