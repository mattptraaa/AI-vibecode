/**
 * UT FAMILY - Aplikasi Komunitas Mahasiswa Universitas Terbuka
 * Powered by Firebase Authentication & Cloud Firestore (Spark Free Tier)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType
} from './firebase';
import {
  UserProfile,
  PostItem,
  CommentItem,
  ReplyItem,
  KelasItem,
  KelasMemberItem,
  MateriItem,
  ForumQuestionItem,
  AnnouncementItem,
  NotificationItem,
  ReportItem,
  UserRole,
  AboutItem
} from './types';
import { compressImage, compressAvatar } from './utils/imageCompressor';
import { Ico, SunIcon, MoonIcon, UserSvgIcon } from './components/MockupIcons';
import { Chatbot } from './components/Chatbot';
import { ToolsMahasiswa } from './components/ToolsMahasiswa';
import { ClassMeetingsView } from './components/ClassMeetingsView';

const ADMIN_EMAIL = 'rahmatadisaputra021@gmail.com';
const PAGE_SIZE = 20;

// Helper to format dates cleanly without bugs (supports Firestore Timestamp, numbers, ISO strings)
const formatCommentDate = (rawDate: any): string => {
  if (!rawDate) return '';
  let d: Date;
  try {
    if (typeof rawDate === 'object' && rawDate !== null && typeof rawDate.toDate === 'function') {
      d = rawDate.toDate();
    } else if (typeof rawDate === 'object' && rawDate !== null && typeof rawDate.seconds === 'number') {
      d = new Date(rawDate.seconds * 1000);
    } else if (typeof rawDate === 'number' || typeof rawDate === 'string') {
      d = new Date(rawDate);
    } else {
      d = new Date(rawDate);
    }
  } catch {
    return '';
  }

  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins}m yang lalu`;
  if (diffHours < 24) return `${diffHours}j yang lalu`;
  if (diffDays < 7) return `${diffDays}h yang lalu`;

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const autoResizeTextarea = (el: HTMLTextAreaElement | null) => {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.max(80, el.scrollHeight) + 'px';
};

interface UserReplyItem {
  id: string;
  postId: string;
  postSnippet: string;
  postTopic: string;
  content: string;
  createdAt: number;
  isReply?: boolean;
  replyToName?: string;
}

const readFileAsBase64 = (
  file: File
): Promise<{ base64: string; name: string; size: string; type: 'image' | 'pdf' }> => {
  return new Promise((resolve, reject) => {
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error('Ukuran file maksimal 8 MB'));
      return;
    }
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      reject(new Error('Format file harus berupa Gambar (JPG/PNG) atau Dokumen PDF'));
      return;
    }

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        base64: reader.result as string,
        name: file.name,
        size: sizeStr,
        type: isPdf ? 'pdf' : 'image'
      });
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
};

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('utf-theme') as 'light' | 'dark') || 'light';
  });

  // Auth & Profile state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Routing
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [routeParam, setRouteParam] = useState<string>('');

  // UI state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [activeNotifPreview, setActiveNotifPreview] = useState<{ notif: NotificationItem; post?: PostItem | null } | null>(null);
  const lastTargetParamRef = useRef<string>('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'fol'>('all');
  const [allUsersList, setAllUsersList] = useState<UserProfile[]>([]);

  // Feed & Posts state
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [lastVisibleDoc, setLastVisibleDoc] = useState<DocumentSnapshot | null>(null);
  const [feedTab, setFeedTab] = useState<'feed' | 'ann'>('feed');
  const [topicFilter, setTopicFilter] = useState<string>('Semua');
  const [topicMenuOpen, setTopicMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Composer state
  const [postText, setPostText] = useState('');
  const [postTopic, setPostTopic] = useState('Umum');
  const [postImageBase64, setPostImageBase64] = useState<string | null>(null);
  const [postLink, setPostLink] = useState<string | null>(null);
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState('');
  const [mediaMenuOpen, setMediaMenuOpen] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<UserProfile[]>([]);
  const composerInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Announcements
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [annText, setAnnText] = useState('');
  const [annCategory, setAnnCategory] = useState('Umum');
  const annInputRef = useRef<HTMLTextAreaElement>(null);

  // Kelas state
  const [currentClassId, setCurrentClassId] = useState<string>('desain');
  const [classTab, setClassTab] = useState<'pertemuan' | 'posts' | 'forum' | 'materi' | 'peserta' | 'kelola_pj'>('pertemuan');
  const [classMateri, setClassMateri] = useState<MateriItem[]>([]);
  const [materiTitle, setMateriTitle] = useState('');
  const [materiDesc, setMateriDesc] = useState('');
  const [materiLink, setMateriLink] = useState('');

  // Moderasi state
  const [moderasiTab, setModerasiTab] = useState<'rep' | 'usr'>('rep');
  const [selectedUserForPj, setSelectedUserForPj] = useState<string | null>(null);
  const [pjAssignUserId, setPjAssignUserId] = useState<string>('');
  const [pjAssignClasses, setPjAssignClasses] = useState<string[]>(['desain']);
  const [openHakUserId, setOpenHakUserId] = useState<string | null>(null);
  const [modMemberSearch, setModMemberSearch] = useState('');
  const [modRoleFilter, setModRoleFilter] = useState<'all' | 'admin' | 'moderator' | 'pj' | 'member'>('all');

  // Class Composer & Media state
  const [classPostText, setClassPostText] = useState('');
  const [classPostMedia, setClassPostMedia] = useState<{ name: string; type: 'image' | 'pdf'; base64: string } | null>(null);
  const classFileInputRef = useRef<HTMLInputElement>(null);
  const classPostInputRef = useRef<HTMLTextAreaElement>(null);

  // Class Materi Media state
  const [materiMedia, setMateriMedia] = useState<{ name: string; type: 'image' | 'pdf'; base64: string } | null>(null);
  const materiFileInputRef = useRef<HTMLInputElement>(null);

  // Profile tabs state (postingan & balasan)
  const [profileTab, setProfileTab] = useState<'posts' | 'replies'>('posts');
  const [viewedAccountTab, setViewedAccountTab] = useState<'posts' | 'replies'>('posts');
  const [userRepliesMap, setUserRepliesMap] = useState<Record<string, UserReplyItem[]>>({});
  const [loadingReplies, setLoadingReplies] = useState(false);

  // Edit Post & Announcement state (< 10 menit)
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostTopic, setEditPostTopic] = useState('Umum');
  const [editPostLink, setEditPostLink] = useState('');

  const [editingAnn, setEditingAnn] = useState<AnnouncementItem | null>(null);
  const [editAnnContent, setEditAnnContent] = useState('');
  const [editAnnCategory, setEditAnnCategory] = useState('Umum');

  // Kelas Members state
  const [classMembers, setClassMembers] = useState<KelasMemberItem[]>([]);
  const [isApplyingClass, setIsApplyingClass] = useState(false);

  // Profile view / Edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [userListModal, setUserListModal] = useState<{ open: boolean; title: string; users: UserProfile[] } | null>(null);

  // About items state (Admin editable and addable)
  const [aboutItems, setAboutItems] = useState<AboutItem[]>([]);
  const [editingAboutItem, setEditingAboutItem] = useState<AboutItem | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [aboutFormTitle, setAboutFormTitle] = useState('');
  const [aboutFormDesc, setAboutFormDesc] = useState('');
  const [aboutFormLink, setAboutFormLink] = useState('');
  const [aboutFormIcon, setAboutFormIcon] = useState('');
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [profileBioInput, setProfileBioInput] = useState('');
  const [profileAvatarNew, setProfileAvatarNew] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Viewed Account
  const [viewedAccount, setViewedAccount] = useState<UserProfile | null>(null);

  // Auth Form state
  const [loginEmailOrUsername, setLoginEmailOrUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2800);
  }, []);

  const handleLogout = useCallback(async (msg?: any) => {
    localStorage.removeItem('utf_session_start');
    localStorage.removeItem('utf_last_active');
    await signOut(auth);
    window.location.hash = '#/home';
    const message = typeof msg === 'string' ? msg : 'Kamu telah keluar.';
    showToast(message);
  }, [showToast]);

  // Aturan Sesi: Otomatis keluar setelah 3 jam atau 3 jam tanpa aktivitas, dan bebas login kembali kapan saja
  useEffect(() => {
    if (!firebaseUser) return;
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000; // 3 jam
    let timer: any;

    const now = Date.now();
    const existingStart = localStorage.getItem('utf_session_start');
    const existingActive = localStorage.getItem('utf_last_active');

    // Jika belum ada timestamp atau timestamp lama kadaluarsa, inisialisasi sesi baru
    if (!existingStart || now - parseInt(existingStart, 10) >= THREE_HOURS_MS) {
      localStorage.setItem('utf_session_start', now.toString());
    }
    if (!existingActive || now - parseInt(existingActive, 10) >= THREE_HOURS_MS) {
      localStorage.setItem('utf_last_active', now.toString());
    }

    const checkSessionAndInactivity = () => {
      const currentNow = Date.now();
      const sessionStart = parseInt(localStorage.getItem('utf_session_start') || currentNow.toString(), 10);
      const lastActive = parseInt(localStorage.getItem('utf_last_active') || currentNow.toString(), 10);

      // Cek apakah sudah lewat 3 jam sejak masuk atau 3 jam tanpa aktivitas
      if (currentNow - sessionStart >= THREE_HOURS_MS || currentNow - lastActive >= THREE_HOURS_MS) {
        handleLogout('Sesi telah berakhir setelah 3 jam. Silakan masuk kembali kapan saja untuk melanjutkan.');
        return false;
      }
      return true;
    };

    const scheduleNextCheck = () => {
      clearTimeout(timer);
      const currentNow = Date.now();
      const sessionStart = parseInt(localStorage.getItem('utf_session_start') || currentNow.toString(), 10);
      const lastActive = parseInt(localStorage.getItem('utf_last_active') || currentNow.toString(), 10);
      const remainingSession = Math.max(1000, THREE_HOURS_MS - (currentNow - sessionStart));
      const remainingInactivity = Math.max(1000, THREE_HOURS_MS - (currentNow - lastActive));
      const nextDelay = Math.min(remainingSession, remainingInactivity);

      timer = setTimeout(() => {
        if (!checkSessionAndInactivity()) return;
        scheduleNextCheck();
      }, nextDelay);
    };

    const recordActivity = () => {
      localStorage.setItem('utf_last_active', Date.now().toString());
      scheduleNextCheck();
    };

    const userEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove', 'click'];
    userEvents.forEach((evt) => window.addEventListener(evt, recordActivity, { passive: true }));
    scheduleNextCheck();

    return () => {
      clearTimeout(timer);
      userEvents.forEach((evt) => window.removeEventListener(evt, recordActivity));
    };
  }, [firebaseUser, handleLogout]);

  // Sync theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('utf-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Hash router
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '') || 'home';
      const [route, paramPart] = hash.split('?');
      setCurrentRoute(route || 'home');
      setRouteParam(paramPart || '');

      setUserMenuOpen(false);
      setNotifMenuOpen(false);
      setSearchModalOpen(false);

      if (route === 'akun' && paramPart) {
        const params = new URLSearchParams(paramPart);
        const u = params.get('u');
        if (u) {
          const match = allUsersList.find((usr) => usr.username.toLowerCase() === u.toLowerCase());
          if (match) setViewedAccount(match);
        }
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, [allUsersList]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      setFirebaseUser(currentFirebaseUser);
      if (currentFirebaseUser) {
        try {
          const userDocRef = doc(db, 'users', currentFirebaseUser.uid);
          const snap = await getDoc(userDocRef);

          const isBootstrap = currentFirebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            if (isBootstrap && data.role !== 'admin') {
              await updateDoc(userDocRef, { role: 'admin' });
              data.role = 'admin';
            }
            setUserProfile(data);
          } else {
            const defaultRole: UserRole = isBootstrap ? 'admin' : 'member';
            const newProfile: UserProfile = {
              uid: currentFirebaseUser.uid,
              email: currentFirebaseUser.email || '',
              username:
                currentFirebaseUser.displayName?.toLowerCase().replace(/[^a-z0-9_]/g, '') ||
                currentFirebaseUser.email?.split('@')[0].replace(/[^a-z0-9_]/g, '') ||
                'mhs_' + currentFirebaseUser.uid.slice(0, 5),
              displayName: currentFirebaseUser.displayName || currentFirebaseUser.email?.split('@')[0] || 'Mahasiswa UT',
              bio: '',
              photoURL: currentFirebaseUser.photoURL || '',
              role: defaultRole,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentFirebaseUser.uid}`);
        }
      } else {
        localStorage.removeItem('utf_session_start');
        localStorage.removeItem('utf_last_active');
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to personal notifications
  useEffect(() => {
    if (!firebaseUser) {
      setNotifications([]);
      return;
    }

    const notifCol = collection(db, 'notifications', firebaseUser.uid, 'items');
    const q = query(notifCol, orderBy('createdAt', 'desc'), limit(30));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
        setNotifications(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `notifications/${firebaseUser.uid}/items`);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  // Fetch / Listen to announcements
  useEffect(() => {
    const annCol = collection(db, 'announcements');
    const q = query(annCol, orderBy('createdAt', 'desc'), limit(20));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AnnouncementItem));
        setAnnouncements(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'announcements');
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch all users list for mentions, search & kelola anggota (semua anggota tanpa batasan 100)
  useEffect(() => {
    if (!firebaseUser) {
      setAllUsersList([]);
      return;
    }
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setAllUsersList(snapshot.docs.map((d) => d.data() as UserProfile));
      },
      () => {
        getDocs(collection(db, 'users'))
          .then((snap) => {
            setAllUsersList(snap.docs.map((d) => d.data() as UserProfile));
          })
          .catch(() => {});
      }
    );
    return () => unsubscribe();
  }, [firebaseUser]);

  // DEFAULT ABOUT ITEMS & Listener
  const DEFAULT_ABOUT_ITEMS: AboutItem[] = [
    {
      id: 'instagram',
      title: 'Instagram',
      description: 'Kabar dan dokumentasi kegiatan',
      link: 'https://www.instagram.com/ofc.utfamily?igsh=OGJraDRmcTgwbmh1',
      icon: '/assets/icons/instagram.png'
    },
    {
      id: 'whatsapp-channel',
      title: 'WhatsApp Channel',
      description: 'Pengumuman resmi komunitas',
      link: 'https://www.whatsapp.com/channel/0029VbBvzaKADTOCNeLa4X2S',
      icon: '/assets/icons/whatsapp.png'
    },
    {
      id: 'link-wa-grup',
      title: 'Link WA Grup',
      description: 'Kumpulan link grup WhatsApp',
      link: 'https://linktr.ee/utfamily',
      icon: '/assets/icons/whatsapp.png'
    },
    {
      id: 'tiktok',
      title: 'TikTok',
      description: 'Konten video komunitas',
      link: 'https://www.tiktok.com/@ut.familypku?is_from_webapp=1&sender_device=pc',
      icon: '/assets/icons/tiktok.png'
    }
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'about_items'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AboutItem));
          items.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          setAboutItems(items);
        } else {
          setAboutItems(DEFAULT_ABOUT_ITEMS);
        }
      },
      () => {
        setAboutItems(DEFAULT_ABOUT_ITEMS);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleOpenAddAbout = () => {
    setEditingAboutItem(null);
    setAboutFormTitle('');
    setAboutFormDesc('');
    setAboutFormLink('');
    setAboutFormIcon('/assets/icons/instagram.png');
    setIsAboutModalOpen(true);
  };

  const handleOpenEditAbout = (item: AboutItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingAboutItem(item);
    setAboutFormTitle(item.title);
    setAboutFormDesc(item.description);
    setAboutFormLink(item.link);
    setAboutFormIcon(item.icon || '/assets/icons/instagram.png');
    setIsAboutModalOpen(true);
  };

  const handleSaveAbout = async () => {
    if (!aboutFormTitle.trim() || !aboutFormLink.trim()) {
      showToast('Judul dan link wajib diisi.');
      return;
    }
    setIsSavingAbout(true);
    try {
      const existingDocs = await getDocs(collection(db, 'about_items'));
      if (existingDocs.empty) {
        for (const itm of DEFAULT_ABOUT_ITEMS) {
          if (!editingAboutItem || itm.id !== editingAboutItem.id) {
            await setDoc(doc(db, 'about_items', itm.id), itm);
          }
        }
      }

      if (editingAboutItem) {
        await setDoc(
          doc(db, 'about_items', editingAboutItem.id),
          {
            id: editingAboutItem.id,
            title: aboutFormTitle.trim(),
            description: aboutFormDesc.trim(),
            link: aboutFormLink.trim(),
            icon: aboutFormIcon.trim() || '/assets/icons/instagram.png',
            updatedAt: Date.now()
          },
          { merge: true }
        );
        showToast('Informasi About berhasil diperbarui.');
      } else {
        const newDocRef = doc(collection(db, 'about_items'));
        await setDoc(newDocRef, {
          id: newDocRef.id,
          title: aboutFormTitle.trim(),
          description: aboutFormDesc.trim(),
          link: aboutFormLink.trim(),
          icon: aboutFormIcon.trim() || '/assets/icons/instagram.png',
          createdAt: Date.now()
        });
        showToast('Informasi About berhasil ditambahkan.');
      }
      setIsAboutModalOpen(false);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'about_items');
    } finally {
      setIsSavingAbout(false);
    }
  };

  const handleDeleteAbout = async (item: AboutItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Hapus informasi "${item.title}"?`)) {
      try {
        const existingDocs = await getDocs(collection(db, 'about_items'));
        if (existingDocs.empty) {
          const remaining = DEFAULT_ABOUT_ITEMS.filter((i) => i.id !== item.id);
          for (const rem of remaining) {
            await setDoc(doc(db, 'about_items', rem.id), rem);
          }
          setAboutItems(remaining);
        } else {
          await deleteDoc(doc(db, 'about_items', item.id));
        }
        showToast('Informasi About dihapus.');
      } catch (err: any) {
        handleFirestoreError(err, OperationType.DELETE, `about_items/${item.id}`);
      }
    }
  };

  // Fetch / Query Posts (Pagination 20 per batch + always retain pinned posts)
  const fetchPosts = useCallback(
    async (isInitial = true) => {
      setPostsLoading(true);
      try {
        const postsRef = collection(db, 'posts');

        // Always query pinned posts on initial fetch so old pinned posts stay pinned
        let pinnedPosts: PostItem[] = [];
        if (isInitial) {
          try {
            const pinSnap = await getDocs(query(postsRef, where('isPinned', '==', true)));
            pinnedPosts = pinSnap.docs.map((d) => ({ id: d.id, ...d.data() } as PostItem));
          } catch (e) {
            console.error('Error fetching pinned posts:', e);
          }
        }

        let q = query(postsRef, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));

        if (!isInitial && lastVisibleDoc) {
          q = query(postsRef, orderBy('createdAt', 'desc'), startAfter(lastVisibleDoc), limit(PAGE_SIZE));
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs;
        const newPosts = docs.map((d) => ({ id: d.id, ...d.data() } as PostItem));

        if (isInitial) {
          const map = new Map<string, PostItem>();
          pinnedPosts.forEach((p) => map.set(p.id, p));
          newPosts.forEach((p) => map.set(p.id, p));
          setPosts(Array.from(map.values()));
        } else {
          setPosts((prev) => {
            const map = new Map<string, PostItem>();
            prev.forEach((p) => map.set(p.id, p));
            newPosts.forEach((p) => map.set(p.id, p));
            return Array.from(map.values());
          });
        }

        setLastVisibleDoc(docs[docs.length - 1] || null);
        setHasMorePosts(docs.length === PAGE_SIZE);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'posts');
      } finally {
        setPostsLoading(false);
        setIsRefreshing(false);
      }
    },
    [lastVisibleDoc]
  );

  useEffect(() => {
    fetchPosts(true);
  }, []);

  // Pull to refresh / Segarkan postingan
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts(true);
    showToast('Postingan diperbarui');
  };

  // Helper roles & rights check
  const isUserAdmin = userProfile?.role === 'admin' || firebaseUser?.email === ADMIN_EMAIL;

  const hasModRight = (right: keyof NonNullable<UserProfile['hm']>) => {
    if (isUserAdmin) return true;
    if (userProfile?.role !== 'moderator') return false;
    return userProfile.hm ? userProfile.hm[right] !== false : true;
  };

  const hasPjRight = (classId: string, right: keyof NonNullable<UserProfile['hk']>) => {
    if (isUserAdmin) return true;
    const isPj = userProfile?.pjClass === classId || (userProfile?.pjClasses && userProfile.pjClasses.includes(classId));
    if (!isPj) return false;
    return userProfile?.hk ? userProfile.hk[right] !== false : true;
  };

  const roleLabel = isUserAdmin
    ? 'Admin'
    : userProfile?.role === 'moderator'
    ? 'Moderator'
    : userProfile?.role === 'pj' || userProfile?.pjClass || (userProfile?.pjClasses && userProfile.pjClasses.length > 0)
    ? 'PJ Kelas'
    : 'Member';

  // Helper untuk tag role (Admin, Moderator, PJ Kelas)
  const getUserRoleBadge = (uid: string, fallbackRole?: string, fallbackPj?: string | null) => {
    const user = allUsersList.find((u) => u.uid === uid);
    const role = user?.role || fallbackRole;
    const pjClass = user?.pjClass || fallbackPj;

    if (role === 'admin' || user?.email === ADMIN_EMAIL) {
      return <span className="adm role-admin">Admin</span>;
    }
    if (role === 'moderator') {
      return <span className="adm role-mod">Moderator</span>;
    }
    if (role === 'PJ Kelas' || pjClass) {
      return <span className="adm role-pj">PJ {pjClass ? pjClass.toUpperCase() : 'Kelas'}</span>;
    }
    return null;
  };

  // Handle Mentions autocomplete in composer & auto-expand height
  const handleComposerInput = (text: string) => {
    setPostText(text);
    if (composerInputRef.current) {
      composerInputRef.current.style.height = 'auto';
      composerInputRef.current.style.height = Math.max(80, composerInputRef.current.scrollHeight) + 'px';
    }
    const cursor = composerInputRef.current?.selectionStart || text.length;
    const textBeforeCursor = text.slice(0, cursor);
    const match = textBeforeCursor.match(/(?:^|\s)@([a-z0-9_.]*)$/i);

    if (match) {
      const q = match[1].toLowerCase();
      const filtered = allUsersList
        .filter((u) => u.uid !== firebaseUser?.uid && (u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q)))
        .slice(0, 5);
      setMentionSuggestions(filtered);
    } else {
      setMentionSuggestions([]);
    }
  };

  const pickMention = (username: string) => {
    if (!composerInputRef.current) return;
    const t = composerInputRef.current;
    const cursor = t.selectionStart;
    const v = t.value;
    const before = v.slice(0, cursor).replace(/@[a-z0-9_.]*$/i, `@${username} `);
    const after = v.slice(cursor);
    setPostText(before + after);
    setMentionSuggestions([]);
    t.focus();
  };

  // Create Post (Beranda atau Postingan Kelas)
  const handleCreatePost = async (classIdTarget?: string) => {
    if (!firebaseUser) {
      window.location.hash = '#/login';
      return;
    }

    let profileToUse = userProfile;
    if (!profileToUse) {
      try {
        const uSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (uSnap.exists()) {
          profileToUse = uSnap.data() as UserProfile;
          setUserProfile(profileToUse);
        }
      } catch {
        // fallback
      }
    }

    const currentAuthorName = profileToUse?.displayName || firebaseUser.displayName || 'Mahasiswa UT';
    const currentAuthorUsername = profileToUse?.username || firebaseUser.displayName?.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user_' + firebaseUser.uid.slice(0, 5);
    const currentAuthorPhoto = profileToUse?.photoURL || firebaseUser.photoURL || '';

    const isClassPost = !!classIdTarget;
    const textToUse = isClassPost ? classPostText.trim() : postText.trim();
    const imageToUse = isClassPost
      ? (classPostMedia?.type === 'image' ? classPostMedia.base64 : '')
      : (postImageBase64 || '');
    const pdfBase64ToUse = isClassPost && classPostMedia?.type === 'pdf' ? classPostMedia.base64 : '';
    const pdfNameToUse = isClassPost && classPostMedia?.type === 'pdf' ? classPostMedia.name : '';
    const linkToUse = isClassPost ? '' : (postLink || '');

    if (!textToUse && !imageToUse && !pdfBase64ToUse && !linkToUse) {
      showToast('Tulis sesuatu atau lampirkan foto/file.');
      return;
    }

    try {
      const newPostDoc = doc(collection(db, 'posts'));
      const postData: Record<string, any> = {
        id: newPostDoc.id,
        uid: firebaseUser.uid,
        authorName: currentAuthorName,
        authorUsername: currentAuthorUsername,
        authorPhoto: currentAuthorPhoto,
        authorRole: roleLabel || 'Member',
        isPj: !!profileToUse?.pjClass && profileToUse.pjClass === classIdTarget,
        content: textToUse,
        imageBase64: imageToUse || '',
        link: linkToUse || '',
        topic: classIdTarget ? 'Kelas' : postTopic,
        classId: classIdTarget || '',
        isPinned: false,
        likesCount: 0,
        commentsCount: 0,
        likes: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      if (pdfBase64ToUse) {
        postData.pdfBase64 = pdfBase64ToUse;
        postData.pdfName = pdfNameToUse || 'dokumen.pdf';
      }

      await setDoc(newPostDoc, postData);
      setPosts((prev) => [postData as PostItem, ...prev]);

      // Fire notifications for mentions
      const mentionMatches = textToUse.match(/@[a-z0-9_.]{3,20}/gi) || [];
      for (const m of mentionMatches) {
        const uTarget = m.slice(1).toLowerCase();
        const targetUser = allUsersList.find((u) => u.username.toLowerCase() === uTarget);
        if (targetUser && targetUser.uid !== firebaseUser.uid) {
          const notifRef = doc(collection(db, 'notifications', targetUser.uid, 'items'));
          await setDoc(notifRef, {
            id: notifRef.id,
            toUid: targetUser.uid,
            fromUid: firebaseUser.uid,
            fromName: currentAuthorName,
            fromUsername: currentAuthorUsername,
            fromPhoto: currentAuthorPhoto,
            type: 'tag',
            postId: newPostDoc.id,
            classId: classIdTarget || '',
            snippet: textToUse.slice(0, 100),
            read: false,
            createdAt: Date.now()
          });
        }
      }

      if (isClassPost) {
        setClassPostText('');
        setClassPostMedia(null);
        if (classPostInputRef.current) classPostInputRef.current.style.height = 'auto';
      } else {
        setPostText('');
        setPostImageBase64(null);
        setPostLink(null);
        setLinkInputValue('');
        setLinkInputVisible(false);
        setMediaMenuOpen(false);
        if (composerInputRef.current) composerInputRef.current.style.height = 'auto';
      }
      showToast('Postingan berhasil diterbitkan.');
    } catch (error: any) {
      console.error('Error creating post:', error);
      showToast('Gagal membuat postingan: ' + (error?.message || 'Terjadi kesalahan sistem'));
    }
  };

  // Image Upload handler with client compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Mengompres foto di browser...');
      const base64 = await compressImage(file, 800, 150 * 1024);
      setPostImageBase64(base64);
      setMediaMenuOpen(false);
      showToast('Foto siap diunggah.');
    } catch (err: any) {
      showToast(err.message || 'Gagal memproses gambar');
    }
    e.target.value = '';
  };

  // Avatar Upload with client compression
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressAvatar(file);
      setProfileAvatarNew(base64);
    } catch (err: any) {
      showToast(err.message || 'Gagal memproses foto profil');
    }
    e.target.value = '';
  };

  // Like / Unlike Post
  const handleToggleLike = async (post: PostItem) => {
    if (!firebaseUser) {
      window.location.hash = '#/login';
      return;
    }

    const hasLiked = post.likes?.includes(firebaseUser.uid);
    const newLikes = hasLiked
      ? (post.likes || []).filter((id) => id !== firebaseUser.uid)
      : [...(post.likes || []), firebaseUser.uid];
    const newCount = newLikes.length;

    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, likes: newLikes, likesCount: newCount } : p))
    );

    try {
      await updateDoc(doc(db, 'posts', post.id), {
        likes: newLikes,
        likesCount: newCount
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${post.id}`);
    }
  };

  // Pin / Unpin Post (Maksimal 3 postingan disematkan)
  const handleTogglePin = async (post: PostItem) => {
    const canPin = post.classId
      ? (isUserAdmin || hasPjRight(post.classId, 'pin'))
      : (isUserAdmin || hasModRight('pin'));

    if (!canPin) {
      showToast('Kamu tidak punya wewenang menyematkan postingan ini.');
      return;
    }

    const newPinState = !post.isPinned;
    if (newPinState) {
      const currentPinnedCount = posts.filter((p) =>
        post.classId ? p.classId === post.classId && p.isPinned : !p.classId && p.isPinned
      ).length;

      if (currentPinnedCount >= 3) {
        showToast(
          post.classId
            ? 'Maksimal 3 postingan kelas yang dapat disematkan (pin).'
            : 'Maksimal 3 postingan yang dapat disematkan (pin).'
        );
        return;
      }
    }

    const pinTimestamp = newPinState ? Date.now() : undefined;
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, isPinned: newPinState, pinnedAt: pinTimestamp } : p))
    );

    try {
      await updateDoc(doc(db, 'posts', post.id), {
        isPinned: newPinState,
        pinnedAt: newPinState ? Date.now() : null
      });
      showToast(newPinState ? 'Postingan disematkan ke paling atas' : 'Sematan dilepas');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${post.id}`);
    }
  };

  // Delete Post
  const handleDeletePost = async (post: PostItem) => {
    const canDel =
      post.uid === firebaseUser?.uid ||
      (post.classId ? hasPjRight(post.classId, 'del') : hasModRight('del'));

    if (!canDel) {
      showToast('Kamu tidak punya hak menghapus postingan ini.');
      return;
    }

    if (!confirm('Hapus postingan ini?')) return;

    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      showToast('Postingan berhasil dihapus.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${post.id}`);
    }
  };

  // Report Post
  const handleReportPost = async (post: PostItem) => {
    if (!firebaseUser) {
      window.location.hash = '#/login';
      return;
    }

    try {
      const repRef = doc(collection(db, 'reports'));
      const report: ReportItem = {
        id: repRef.id,
        targetType: 'post',
        postId: post.id,
        classId: post.classId || '',
        reportedByUid: firebaseUser.uid,
        targetAuthorName: post.authorName,
        contentSnippet: post.content.slice(0, 100),
        status: 'pending',
        createdAt: Date.now()
      };
      await setDoc(repRef, report);
      await updateDoc(doc(db, 'posts', post.id), { isReported: true });
      showToast('Postingan dilaporkan ke moderator.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reports');
    }
  };

  // Load comments for a post
  const toggleComments = async (post: PostItem) => {
    const nextOpen = !post.commentsOpen;
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, commentsOpen: nextOpen } : p))
    );

    if (nextOpen && !post.commentsLoaded) {
      try {
        const commentsCol = collection(db, 'posts', post.id, 'comments');
        const q = query(commentsCol, orderBy('createdAt', 'asc'));
        const snap = await getDocs(q);
        const comments = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommentItem));
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, comments, commentsLoaded: true } : p))
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, `posts/${post.id}/comments`);
      }
    }
  };

  // Navigasi & sorot konten (postingan, komentar, atau balasan) dari notifikasi
  const openPostAndHighlight = useCallback(
    async (
      targetPostId: string,
      targetCommentId?: string,
      targetReplyId?: string,
      targetClassId?: string
    ) => {
      if (targetClassId) {
        setCurrentClassId(targetClassId);
        setClassTab('posts');
        setCurrentRoute('kelas');
      } else {
        setFeedTab('feed');
        setTopicFilter('Semua');
        setCurrentRoute('home');
      }

      // Pastikan postingan ada di state posts
      try {
        const snap = await getDoc(doc(db, 'posts', targetPostId));
        if (snap.exists()) {
          const fetchedPost = { id: snap.id, ...snap.data() } as PostItem;
          setPosts((prev) => {
            const alreadyInState = prev.some((p) => p.id === targetPostId);
            return alreadyInState
              ? prev.map((p) => (p.id === targetPostId ? { ...p, commentsOpen: true } : p))
              : [{ ...fetchedPost, commentsOpen: true }, ...prev];
          });
        }
      } catch {
        // Abaikan
      }

      // Jika ada komentar atau balasan yang dituju, buka & muat komentar
      if (targetCommentId || targetReplyId) {
        try {
          const commentsCol = collection(db, 'posts', targetPostId, 'comments');
          const qSnap = await getDocs(query(commentsCol, orderBy('createdAt', 'asc')));
          const loadedComments = qSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CommentItem));
          setPosts((prev) =>
            prev.map((p) =>
              p.id === targetPostId
                ? { ...p, commentsOpen: true, comments: loadedComments, commentsLoaded: true }
                : p
            )
          );
        } catch {
          // Abaikan
        }
      }

      const elementId = targetReplyId
        ? `reply-${targetReplyId}`
        : targetCommentId
        ? `comment-${targetCommentId}`
        : `post-${targetPostId}`;

      setHighlightedId(elementId);

      // Scroll sekali saja secara lembut ke kontainer scrolling (.body), tidak mengunci scroll window
      let scrolled = false;
      const attemptScroll = (retries: number) => {
        if (scrolled) return;
        const el = document.getElementById(elementId);
        if (el) {
          scrolled = true;
          const scrollContainer = el.closest('.body') as HTMLElement | null;
          if (scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const targetTop = scrollContainer.scrollTop + (elRect.top - containerRect.top) - (containerRect.height / 2) + (elRect.height / 2);
            scrollContainer.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
          } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
        if (retries > 0) {
          setTimeout(() => attemptScroll(retries - 1), 120);
        }
      };
      setTimeout(() => attemptScroll(6), 60);

      setTimeout(() => {
        setHighlightedId((cur) => (cur === elementId ? null : cur));
      }, 3500);
    },
    []
  );

  // Handler pratinjau isi notifikasi di layar (dialog modal cek isi)
  const handlePreviewNotification = async (n: NotificationItem) => {
    if (!n.read && firebaseUser) {
      try {
        await updateDoc(doc(db, 'notifications', firebaseUser.uid, 'items', n.id), { read: true });
        setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
      } catch {
        // Abaikan
      }
    }
    setNotifMenuOpen(false);

    if (n.type === 'follow') {
      const target = allUsersList.find(
        (u) => u.uid === n.fromUid || (n.fromUsername && u.username.toLowerCase() === n.fromUsername.toLowerCase())
      );
      if (target) {
        setViewedAccount(target);
        window.location.hash = `#/akun?u=${encodeURIComponent(target.username)}`;
      } else if (n.fromUsername) {
        window.location.hash = `#/akun?u=${encodeURIComponent(n.fromUsername)}`;
      }
      return;
    }

    if (n.postId) {
      let foundPost = posts.find((p) => p.id === n.postId);
      if (!foundPost) {
        try {
          const snap = await getDoc(doc(db, 'posts', n.postId));
          if (snap.exists()) {
            foundPost = { id: snap.id, ...snap.data() } as PostItem;
            setPosts((prev) => [foundPost!, ...prev.filter((p) => p.id !== n.postId)]);
          }
        } catch {
          // ignore
        }
      }
      setActiveNotifPreview({ notif: n, post: foundPost || null });
    }
  };

  // Handler klik notifikasi: bawa pengguna langsung cek isi & sorot tempat tag/komentar
  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.read && firebaseUser) {
      try {
        await updateDoc(doc(db, 'notifications', firebaseUser.uid, 'items', n.id), { read: true });
        setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
      } catch {
        // Abaikan
      }
    }
    setNotifMenuOpen(false);

    if (n.type === 'follow') {
      const target = allUsersList.find(
        (u) => u.uid === n.fromUid || (n.fromUsername && u.username.toLowerCase() === n.fromUsername.toLowerCase())
      );
      if (target) {
        setViewedAccount(target);
        window.location.hash = `#/akun?u=${encodeURIComponent(target.username)}`;
      } else if (n.fromUsername) {
        window.location.hash = `#/akun?u=${encodeURIComponent(n.fromUsername)}`;
      }
      return;
    }

    if (n.postId) {
      let foundPost = posts.find((p) => p.id === n.postId);
      if (!foundPost) {
        try {
          const snap = await getDoc(doc(db, 'posts', n.postId));
          if (snap.exists()) {
            foundPost = { id: snap.id, ...snap.data() } as PostItem;
            setPosts((prev) => [foundPost!, ...prev.filter((p) => p.id !== n.postId)]);
          }
        } catch {
          // ignore
        }
      }

      const params = new URLSearchParams();
      params.set('p', n.postId);
      if (n.commentId) params.set('cid', n.commentId);
      if (n.replyId) params.set('rid', n.replyId);
      if (n.classId) params.set('k', n.classId);

      const targetParamStr = params.toString();
      lastTargetParamRef.current = targetParamStr;
      const targetRoute = n.classId ? 'kelas' : 'home';
      window.location.hash = `#/${targetRoute}?${targetParamStr}`;

      await openPostAndHighlight(n.postId, n.commentId, n.replyId, n.classId);

      const actionText = n.type === 'tag'
        ? (n.commentId ? 'Membuka komentar yang menandai kamu...' : 'Membuka postingan yang menandai kamu...')
        : n.type === 'reply'
        ? 'Membuka balasan komentarmu...'
        : 'Membuka komentar di postinganmu...';
      showToast(actionText);
    }
  };

  // Listen to routeParam changes to open post and scroll to comment / reply / content
  useEffect(() => {
    if (!routeParam) return;
    if (lastTargetParamRef.current === routeParam) return;
    lastTargetParamRef.current = routeParam;
    const params = new URLSearchParams(routeParam);
    const pId = params.get('p');
    const cId = params.get('cid') || params.get('c');
    const rId = params.get('rid') || params.get('r');
    const kId = params.get('k') || params.get('classId');
    if (pId) {
      openPostAndHighlight(pId, cId || undefined, rId || undefined, kId || undefined);
    }
  }, [routeParam, openPostAndHighlight]);

  // Add Comment
  const handleAddComment = async (post: PostItem, commentText: string) => {
    if (!firebaseUser || !userProfile || !commentText.trim()) return;

    try {
      const commentsCol = collection(db, 'posts', post.id, 'comments');
      const newCommentDoc = doc(commentsCol);
      const newComment: CommentItem = {
        id: newCommentDoc.id,
        postId: post.id,
        uid: firebaseUser.uid,
        authorName: userProfile.displayName,
        authorUsername: userProfile.username,
        authorPhoto: userProfile.photoURL || '',
        content: commentText.trim(),
        createdAt: Date.now(),
        replies: []
      };

      await setDoc(newCommentDoc, newComment);
      await updateDoc(doc(db, 'posts', post.id), {
        commentsCount: (post.commentsCount || 0) + 1
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                commentsCount: (p.commentsCount || 0) + 1,
                comments: [...(p.comments || []), newComment]
              }
            : p
        )
      );

      // Realtime update in replies map
      setUserRepliesMap((prev) => {
        const cur = prev[firebaseUser.uid] || [];
        return {
          ...prev,
          [firebaseUser.uid]: [
            {
              id: newCommentDoc.id,
              postId: post.id,
              postSnippet: post.content.slice(0, 80),
              postTopic: post.topic,
              content: commentText.trim(),
              createdAt: Date.now(),
              isReply: false
            },
            ...cur
          ]
        };
      });

      // Notify post author if not self
      if (post.uid !== firebaseUser.uid) {
        const notifDoc = doc(collection(db, 'notifications', post.uid, 'items'));
        await setDoc(notifDoc, {
          id: notifDoc.id,
          toUid: post.uid,
          fromUid: firebaseUser.uid,
          fromName: userProfile.displayName,
          fromUsername: userProfile.username,
          fromPhoto: userProfile.photoURL || '',
          type: 'comment',
          postId: post.id,
          commentId: newCommentDoc.id,
          classId: post.classId || '',
          snippet: commentText.slice(0, 100),
          read: false,
          createdAt: Date.now()
        });
      }

      // Notify mentioned users in comment
      const commentMentions = commentText.match(/@[a-z0-9_.]{3,20}/gi) || [];
      for (const m of commentMentions) {
        const uTarget = m.slice(1).toLowerCase();
        const targetUser = allUsersList.find((u) => u.username.toLowerCase() === uTarget);
        if (targetUser && targetUser.uid !== firebaseUser.uid && targetUser.uid !== post.uid) {
          const notifRef = doc(collection(db, 'notifications', targetUser.uid, 'items'));
          await setDoc(notifRef, {
            id: notifRef.id,
            toUid: targetUser.uid,
            fromUid: firebaseUser.uid,
            fromName: userProfile.displayName,
            fromUsername: userProfile.username,
            fromPhoto: userProfile.photoURL || '',
            type: 'tag',
            postId: post.id,
            commentId: newCommentDoc.id,
            classId: post.classId || '',
            snippet: commentText.slice(0, 100),
            read: false,
            createdAt: Date.now()
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `posts/${post.id}/comments`);
    }
  };

  // Add Reply
  const handleAddReply = async (post: PostItem, comment: CommentItem, replyText: string) => {
    if (!firebaseUser || !userProfile || !replyText.trim()) return;

    const newReply: ReplyItem = {
      id: Date.now().toString(36),
      uid: firebaseUser.uid,
      authorName: userProfile.displayName,
      authorUsername: userProfile.username,
      authorPhoto: userProfile.photoURL || '',
      content: replyText.trim(),
      createdAt: Date.now()
    };

    const updatedReplies = [...(comment.replies || []), newReply];

    try {
      await updateDoc(doc(db, 'posts', post.id, 'comments', comment.id), {
        replies: updatedReplies
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                comments: (p.comments || []).map((c) =>
                  c.id === comment.id
                    ? { ...c, replies: updatedReplies, replyOpen: false, replyPrefix: '' }
                    : c
                )
              }
            : p
        )
      );

      // Realtime update in replies map
      setUserRepliesMap((prev) => {
        const cur = prev[firebaseUser.uid] || [];
        return {
          ...prev,
          [firebaseUser.uid]: [
            {
              id: newReply.id,
              postId: post.id,
              postSnippet: post.content.slice(0, 80),
              postTopic: post.topic,
              content: replyText.trim(),
              createdAt: Date.now(),
              isReply: true,
              replyToName: comment.authorName
            },
            ...cur
          ]
        };
      });

      // Notify comment author
      if (comment.uid !== firebaseUser.uid) {
        const notifDoc = doc(collection(db, 'notifications', comment.uid, 'items'));
        await setDoc(notifDoc, {
          id: notifDoc.id,
          toUid: comment.uid,
          fromUid: firebaseUser.uid,
          fromName: userProfile.displayName,
          fromUsername: userProfile.username,
          fromPhoto: userProfile.photoURL || '',
          type: 'reply',
          postId: post.id,
          commentId: comment.id,
          replyId: newReply.id,
          classId: post.classId || '',
          snippet: replyText.slice(0, 100),
          read: false,
          createdAt: Date.now()
        });
      }

      // Notify mentioned users in reply
      const replyMentions = replyText.match(/@[a-z0-9_.]{3,20}/gi) || [];
      for (const m of replyMentions) {
        const uTarget = m.slice(1).toLowerCase();
        const targetUser = allUsersList.find((u) => u.username.toLowerCase() === uTarget);
        if (targetUser && targetUser.uid !== firebaseUser.uid && targetUser.uid !== comment.uid) {
          const notifRef = doc(collection(db, 'notifications', targetUser.uid, 'items'));
          await setDoc(notifRef, {
            id: notifRef.id,
            toUid: targetUser.uid,
            fromUid: firebaseUser.uid,
            fromName: userProfile.displayName,
            fromUsername: userProfile.username,
            fromPhoto: userProfile.photoURL || '',
            type: 'tag',
            postId: post.id,
            commentId: comment.id,
            replyId: newReply.id,
            classId: post.classId || '',
            snippet: replyText.slice(0, 100),
            read: false,
            createdAt: Date.now()
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${post.id}/comments/${comment.id}`);
    }
  };

  // Muat komentar dan balasan yang pernah ditulis pengguna untuk halaman profil
  const loadUserReplies = async (targetUid: string) => {
    setLoadingReplies(true);
    try {
      const results: UserReplyItem[] = [];
      const postsToCheck = posts.filter((p) => (p.commentsCount || 0) > 0);

      await Promise.all(
        postsToCheck.map(async (p) => {
          let comments = p.comments;
          if (!comments || !p.commentsLoaded) {
            try {
              const snap = await getDocs(
                query(collection(db, 'posts', p.id, 'comments'), orderBy('createdAt', 'asc'))
              );
              comments = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommentItem));
            } catch {
              return;
            }
          }

          for (const c of comments || []) {
            if (c.uid === targetUid) {
              results.push({
                id: c.id,
                postId: p.id,
                postSnippet: p.content.slice(0, 80),
                postTopic: p.topic,
                content: c.content,
                createdAt: c.createdAt,
                isReply: false
              });
            }
            for (const r of c.replies || []) {
              if (r.uid === targetUid) {
                results.push({
                  id: r.id,
                  postId: p.id,
                  postSnippet: p.content.slice(0, 80),
                  postTopic: p.topic,
                  content: r.content,
                  createdAt: r.createdAt,
                  isReply: true,
                  replyToName: c.authorName
                });
              }
            }
          }
        })
      );

      results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setUserRepliesMap((prev) => ({ ...prev, [targetUid]: results }));
    } catch {
      // Soft fail
    } finally {
      setLoadingReplies(false);
    }
  };

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    const input = loginEmailOrUsername.trim();

    if (!input || !loginPassword) {
      setLoginError('Harap isi email/username dan password.');
      return;
    }

    try {
      let emailToUse = input;
      if (!input.includes('@')) {
        const userQ = query(collection(db, 'users'), where('username', '==', input.toLowerCase()), limit(1));
        const userSnap = await getDocs(userQ);
        if (userSnap.empty) {
          setLoginError('Akun tidak ditemukan.');
          return;
        }
        emailToUse = (userSnap.docs[0].data() as UserProfile).email;
      }

      await signInWithEmailAndPassword(auth, emailToUse, loginPassword);
      const now = Date.now().toString();
      localStorage.setItem('utf_session_start', now);
      localStorage.setItem('utf_last_active', now);
      window.location.hash = '#/home';
    } catch (err: any) {
      setLoginError('Username atau password salah.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const u = regUsername.trim().toLowerCase();
    const em = regEmail.trim().toLowerCase();

    if (!/^[a-z0-9_.]{3,20}$/.test(u)) {
      setRegError('Username 3-20 karakter: huruf, angka, titik, atau underscore.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setRegError('Format email belum benar.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password minimal 6 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi password tidak sama.');
      return;
    }

    try {
      const uSnap = await getDocs(query(collection(db, 'users'), where('username', '==', u), limit(1)));
      if (!uSnap.empty) {
        setRegError('Username sudah dipakai.');
        return;
      }

      const userCred = await createUserWithEmailAndPassword(auth, em, regPassword);
      const now = Date.now().toString();
      localStorage.setItem('utf_session_start', now);
      localStorage.setItem('utf_last_active', now);
      await updateProfile(userCred.user, { displayName: regUsername.trim() });

      // Real email verification
      await sendEmailVerification(userCred.user);

      const isBootstrap = em === ADMIN_EMAIL.toLowerCase();
      const newProfile: UserProfile = {
        uid: userCred.user.uid,
        email: em,
        username: u,
        displayName: regUsername.trim(),
        role: isBootstrap ? 'admin' : 'member',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', userCred.user.uid), newProfile);
      setUserProfile(newProfile);

      setRegSuccess(`Link konfirmasi dikirim ke ${em}. Cek inbox kamu untuk mengaktifkan akun.`);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setRegError('Email sudah terdaftar.');
      } else {
        setRegError(err.message || 'Gagal membuat akun.');
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const input = forgotEmail.trim();
    if (!input) {
      setForgotError('Isi username atau email dulu.');
      return;
    }

    try {
      let targetEmail = input;
      if (!input.includes('@')) {
        const uSnap = await getDocs(query(collection(db, 'users'), where('username', '==', input.toLowerCase()), limit(1)));
        if (uSnap.empty) {
          setForgotError('Akun tidak ditemukan.');
          return;
        }
        targetEmail = (uSnap.docs[0].data() as UserProfile).email;
      }

      await sendPasswordResetEmail(auth, targetEmail);
      setForgotSuccess(`Tautan reset password berhasil dikirim ke ${targetEmail}. Silakan periksa inbox kamu.`);
    } catch (err: any) {
      setForgotError(err.message || 'Gagal mengirim email reset password.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      const now = Date.now().toString();
      localStorage.setItem('utf_session_start', now);
      localStorage.setItem('utf_last_active', now);
      window.location.hash = '#/home';
    } catch (err: any) {
      showToast(err.message || 'Gagal login Google.');
    }
  };

  // Fitur Follow / Unfollow Pengguna
  const handleToggleFollow = async (targetUser: UserProfile) => {
    if (!firebaseUser || !userProfile || targetUser.uid === firebaseUser.uid) return;
    const isFollowing = (userProfile.following || []).includes(targetUser.uid);
    const updatedFollowing = isFollowing
      ? (userProfile.following || []).filter((id) => id !== targetUser.uid)
      : [...(userProfile.following || []), targetUser.uid];

    setUserProfile((prev) => (prev ? { ...prev, following: updatedFollowing } : null));
    setAllUsersList((prev) =>
      prev.map((u) => (u.uid === userProfile.uid ? { ...u, following: updatedFollowing } : u))
    );

    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        following: updatedFollowing
      });

      if (!isFollowing) {
        const notifDoc = doc(collection(db, 'notifications', targetUser.uid, 'items'));
        await setDoc(notifDoc, {
          id: notifDoc.id,
          toUid: targetUser.uid,
          fromUid: firebaseUser.uid,
          fromName: userProfile.displayName,
          fromUsername: userProfile.username,
          fromPhoto: userProfile.photoURL || '',
          type: 'follow',
          snippet: `${userProfile.displayName} mulai mengikuti profil kamu`,
          read: false,
          createdAt: Date.now()
        });
        showToast(`Mulai mengikuti ${targetUser.displayName}`);
      } else {
        showToast(`Batal mengikuti ${targetUser.displayName}`);
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  // Fitur Edit Postingan (< 10 menit)
  const startEditPost = (post: PostItem) => {
    const isExpired = Date.now() - post.createdAt > 10 * 60 * 1000;
    if (isExpired && !isUserAdmin) {
      showToast('Batas waktu edit postingan (10 menit) telah lewat.');
      return;
    }
    setEditingPost(post);
    setEditPostContent(post.content);
    setEditPostTopic(post.topic);
    setEditPostLink(post.link || '');
  };

  const handleSaveEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editPostContent.trim()) return;
    const isExpired = Date.now() - editingPost.createdAt > 10 * 60 * 1000;
    if (isExpired && !isUserAdmin) {
      showToast('Batas waktu edit postingan (10 menit) telah lewat.');
      setEditingPost(null);
      return;
    }

    try {
      const postRef = doc(db, 'posts', editingPost.id);
      await updateDoc(postRef, {
        content: editPostContent.trim(),
        topic: editPostTopic,
        link: editPostLink.trim() || null,
        editedAt: Date.now()
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                content: editPostContent.trim(),
                topic: editPostTopic,
                link: editPostLink.trim() || undefined,
                editedAt: Date.now()
              }
            : p
        )
      );

      showToast('Postingan berhasil diperbarui.');
      setEditingPost(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${editingPost.id}`);
    }
  };

  // Fitur Edit Pengumuman (< 10 menit)
  const startEditAnn = (ann: AnnouncementItem) => {
    const isExpired = Date.now() - ann.createdAt > 10 * 60 * 1000;
    if (isExpired && !isUserAdmin) {
      showToast('Batas waktu edit pengumuman (10 menit) telah lewat.');
      return;
    }
    setEditingAnn(ann);
    setEditAnnContent(ann.content);
    setEditAnnCategory(ann.category);
  };

  const handleSaveEditAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn || !editAnnContent.trim()) return;
    const isExpired = Date.now() - editingAnn.createdAt > 10 * 60 * 1000;
    if (isExpired && !isUserAdmin) {
      showToast('Batas waktu edit pengumuman (10 menit) telah lewat.');
      setEditingAnn(null);
      return;
    }

    try {
      const annRef = doc(db, 'announcements', editingAnn.id);
      await updateDoc(annRef, {
        content: editAnnContent.trim(),
        category: editAnnCategory,
        editedAt: Date.now()
      });

      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editingAnn.id
            ? {
                ...a,
                content: editAnnContent.trim(),
                category: editAnnCategory,
                editedAt: Date.now()
              }
            : a
        )
      );

      showToast('Pengumuman berhasil diperbarui.');
      setEditingAnn(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `announcements/${editingAnn.id}`);
    }
  };

  // Listen to members of currentClassId
  useEffect(() => {
    if (!firebaseUser || !currentClassId) return;
    const membersCol = collection(db, 'kelas', currentClassId, 'members');
    const unsub = onSnapshot(
      membersCol,
      (snap) => {
        const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as KelasMemberItem));
        setClassMembers(list);
      },
      () => {
        // Soft fail
      }
    );
    return () => unsub();
  }, [firebaseUser, currentClassId]);

  // Listen to materi of currentClassId
  useEffect(() => {
    if (!firebaseUser || !currentClassId) return;
    const materiCol = collection(db, 'kelas', currentClassId, 'materi');
    const unsub = onSnapshot(
      query(materiCol, orderBy('createdAt', 'desc')),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MateriItem));
        setClassMateri(list);
      },
      () => {
        // Soft fail
      }
    );
    return () => unsub();
  }, [firebaseUser, currentClassId]);

  // Hak & Status Kelas
  const isClassManager = isUserAdmin || userProfile?.pjClass === currentClassId || (userProfile?.pjClasses && userProfile.pjClasses.includes(currentClassId));
  const myClassMembership = classMembers.find((m) => m.uid === firebaseUser?.uid);
  const isClassApproved = isClassManager || myClassMembership?.status === 'ok';
  const isClassPending = !isClassManager && myClassMembership?.status === 'pending';

  // Handler Kelas: Ajukan bergabung
  const handleApplyJoinClass = async () => {
    if (!firebaseUser || !userProfile) return;
    setIsApplyingClass(true);
    try {
      const memRef = doc(db, 'kelas', currentClassId, 'members', firebaseUser.uid);
      await setDoc(memRef, {
        uid: firebaseUser.uid,
        displayName: userProfile.displayName,
        username: userProfile.username,
        photoURL: userProfile.photoURL || '',
        status: 'pending',
        appliedAt: Date.now()
      });
      showToast('Permintaan bergabung telah dikirim ke PJ Kelas.');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `kelas/${currentClassId}/members`);
    } finally {
      setIsApplyingClass(false);
    }
  };

  // Handler Kelas: Batalkan ajuan
  const handleCancelJoinClass = async () => {
    if (!firebaseUser) return;
    try {
      const memRef = doc(db, 'kelas', currentClassId, 'members', firebaseUser.uid);
      await deleteDoc(memRef);
      showToast('Permintaan bergabung dibatalkan.');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `kelas/${currentClassId}/members`);
    }
  };

  // Handler Kelas: Acc Anggota
  const handleApproveMember = async (memberUid: string) => {
    try {
      const memRef = doc(db, 'kelas', currentClassId, 'members', memberUid);
      await updateDoc(memRef, {
        status: 'ok',
        updatedAt: Date.now()
      });
      showToast('Anggota disetujui bergabung ke kelas.');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `kelas/${currentClassId}/members`);
    }
  };

  // Handler Kelas: Tolak Anggota
  const handleRejectMember = async (memberUid: string) => {
    try {
      const memRef = doc(db, 'kelas', currentClassId, 'members', memberUid);
      await deleteDoc(memRef);
      showToast('Permintaan bergabung ditolak.');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `kelas/${currentClassId}/members`);
    }
  };

  // Handler Kelas: Keluarkan/Hapus Anggota
  const handleKickMember = async (member: KelasMemberItem) => {
    if (!confirm(`Keluarkan ${member.displayName} dari kelas ini?`)) return;
    try {
      const memRef = doc(db, 'kelas', currentClassId, 'members', member.uid);
      await deleteDoc(memRef);
      showToast(`${member.displayName} telah dikeluarkan dari kelas.`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `kelas/${currentClassId}/members`);
    }
  };

  return (
    <div id="root">
      {/* HEADER: Exactly matches the mockup structure & classes */}
      <header className="bar hd">
        <div className="top">
          <a className="brand" href="#/home">
            <i className="mark"></i>
            <span>UT FAMILY</span>
          </a>

          <div className="act">
            <button
              className="ib"
              id="th"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
              title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            <div id="lw">
              {firebaseUser ? (
                <button className="pill o" id="lo" type="button" onClick={handleLogout}>
                  Keluar
                </button>
              ) : (
                <>
                  <a className={`ib ${currentRoute === 'about' ? 'cur' : ''}`} href="#/about" aria-label="About" title="About">
                    <Ico name="info" />
                  </a>
                  {currentRoute !== 'login' && (
                    <a className="pill" href="#/login">
                      Masuk
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* SUBHEADER: Hidden when logged out, visible when logged in */}
        {firebaseUser && (
          <div className="sub">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="side-toggle"
                onClick={() => setSideMenuOpen(true)}
                aria-label="Menu"
                title="Menu"
              >
                Menu
              </button>
              <small className="jargon">No one, we are family</small>
            </div>

            <nav className="nav" id="nav">
              <a href="#/home" className={currentRoute === 'home' ? 'cur' : ''}>
                Home
              </a>
              <a href="#/infoupdateut" className={currentRoute === 'infoupdateut' ? 'cur' : ''}>
                Info Update UT
              </a>
              <a href="#/toolsmahasiswa" className={currentRoute === 'toolsmahasiswa' ? 'cur' : ''}>
                Tools Mahasiswa
              </a>
              <a href="#/kegiatanmahasiswa" className={currentRoute === 'kegiatanmahasiswa' || currentRoute === 'kelas' ? 'cur' : ''}>
                Kegiatan Mahasiswa
              </a>
              <a href="#/portallinkut" className={currentRoute === 'portallinkut' ? 'cur' : ''}>
                Portal Link UT
              </a>
              {hasModRight('rep') && (
                <a href="#/moderasi" className={currentRoute === 'moderasi' ? 'cur' : ''}>
                  Moderasi
                </a>
              )}
              <a href="#/about" className={currentRoute === 'about' ? 'cur' : ''}>
                About
              </a>
            </nav>

            <div className="usr" id="usr">
              {/* Search User Button */}
              <button
                className="ib"
                id="sb"
                type="button"
                onClick={() => setSearchModalOpen(!searchModalOpen)}
                aria-label="Cari pengguna"
                title="Cari pengguna"
              >
                <Ico name="search" />
              </button>

              {/* Notification Bell */}
              <button
                className="ib bell"
                id="bell"
                type="button"
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                aria-label="Notifikasi"
                title="Notifikasi"
              >
                <Ico name="bell" />
                {unreadNotifsCount > 0 && <span className="bdg">{unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}</span>}
              </button>

              {/* User Avatar Menu Button */}
              <button
                className={`ib ${currentRoute === 'profil' ? 'cur' : ''}`}
                id="ub"
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Menu akun"
                title="Akun"
              >
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Foto profil" />
                ) : (
                  <UserSvgIcon />
                )}
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="dd on" id="dd">
                  <div className="who">
                    <b>{userProfile?.displayName || 'Mahasiswa UT'}</b>
                    <small style={{ display: 'block', color: 'var(--ink2)' }}>{roleLabel}</small>
                  </div>
                  <button
                    id="ep"
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      window.location.hash = '#/profil';
                    }}
                  >
                    Info akun
                  </button>
                  <button type="button" onClick={handleLogout} style={{ color: '#E0245E' }}>
                    Keluar akun
                  </button>
                </div>
              )}

              {/* Notifications Popover */}
              {notifMenuOpen && (
                <div className="np on" id="np" role="dialog" aria-label="Notifikasi">
                  <div className="nph">
                    <b>Notifikasi</b>
                    {unreadNotifsCount > 0 && (
                      <button
                        type="button"
                        onClick={async () => {
                          const batchPromises = notifications
                            .filter((n) => !n.read)
                            .map((n) =>
                              updateDoc(doc(db, 'notifications', firebaseUser.uid, 'items', n.id), {
                                read: true
                              })
                            );
                          await Promise.all(batchPromises);
                        }}
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="note">Belum ada notifikasi.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`ni ${n.read ? '' : 'un'}`}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          borderBottom: '1px solid var(--line)',
                          padding: '10px 8px',
                          transition: 'background-color 0.15s ease'
                        }}
                        onClick={() => handleNotificationClick(n)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleNotificationClick(n);
                          }
                        }}
                      >
                        <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'flex-start' }}>
                          <div className="av">
                            {n.fromPhoto ? <img src={n.fromPhoto} alt="" /> : n.fromName.charAt(0).toUpperCase()}
                          </div>
                          <div className="nt" style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <b>{n.fromName}</b>
                              <span style={{ fontSize: '11px', color: 'var(--ink2)' }}>@{n.fromUsername || 'user'}</span>
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: '999px',
                                  background: n.type === 'tag' ? '#FEF08A' : n.type === 'reply' ? '#E0E7FF' : 'var(--sky-l)',
                                  color: '#0E2A47'
                                }}
                              >
                                {n.type === 'tag'
                                  ? (n.commentId ? 'Tag di Komentar' : 'Tag di Postingan')
                                  : n.type === 'reply'
                                  ? 'Balasan Komentar'
                                  : n.type === 'follow'
                                  ? 'Pengikut Baru'
                                  : 'Komentar'}
                              </span>
                            </div>
                            <div style={{ fontSize: '12.5px', marginTop: '2px', color: 'var(--ink)' }}>
                              {n.type === 'tag'
                                ? (n.commentId ? 'menandai kamu dalam sebuah komentar:' : 'menandai kamu dalam postingan:')
                                : n.type === 'reply'
                                ? 'membalas komentarmu:'
                                : n.type === 'follow'
                                ? 'mulai mengikuti akunmu'
                                : 'berkomentar di postinganmu:'}
                            </div>
                            {n.snippet && (
                              <div
                                className="nx"
                                style={{
                                  marginTop: '4px',
                                  padding: '4px 8px',
                                  background: 'var(--bg2)',
                                  borderLeft: '2.5px solid var(--accent)',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  color: 'var(--ink)',
                                  fontStyle: 'italic',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                &ldquo;{n.snippet}&rdquo;
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                              <small style={{ color: 'var(--ink2)', fontSize: '11px' }}>{formatCommentDate(n.createdAt)}</small>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  className="phb"
                                  style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreviewNotification(n);
                                  }}
                                  title="Cek isi detail notifikasi"
                                >
                                  Cek Isi
                                </button>
                                <button
                                  type="button"
                                  className="phb"
                                  style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'var(--sky-d)', color: '#fff', border: 'none' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationClick(n);
                                  }}
                                  title="Buka postingan dan sorot posisinya"
                                >
                                  Buka
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Search User Popover */}
              {searchModalOpen && (
                <div className="np on sp" id="sp" role="dialog" aria-label="Cari pengguna">
                  <div className="sph">
                    <input
                      id="sq"
                      type="search"
                      placeholder="Cari pengguna..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="sft">
                    <button
                      type="button"
                      className={searchFilter === 'all' ? 'on' : ''}
                      onClick={() => setSearchFilter('all')}
                    >
                      Semua
                    </button>
                  </div>
                  <div id="sres">
                    {allUsersList
                      .filter(
                        (u) =>
                          u.uid !== firebaseUser.uid &&
                          (u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.username.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .slice(0, 10)
                      .map((u) => (
                        <div key={u.uid} className="sr">
                          <button
                            type="button"
                            className="go"
                            onClick={() => {
                              setSearchModalOpen(false);
                              setViewedAccount(u);
                              window.location.hash = `#/akun?u=${encodeURIComponent(u.username)}`;
                            }}
                          >
                            <div className="av">
                              {u.photoURL ? <img src={u.photoURL} alt="" /> : u.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <b>{u.displayName}</b>
                              <small>@{u.username}</small>
                            </div>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* VIEWS CONTAINER */}
      <div className="views">
        {/* VIEW: OUT / LANDING PAGE (Logged Out) */}
        {!firebaseUser && currentRoute === 'home' && (
          <section className="view on" id="out">
            <div className="hero">
              <div>
                <h1>Komunitas mahasiswa UT, satu rumah buat semua.</h1>
                <p>Berkembang bersama, tumbuh menjadi kesatuan. No one, we are family.</p>
              </div>

              <article className="post pubpost" aria-label="Postingan admin">
                <div className="pt">
                  <div className="av">A</div>
                  <div>
                    <b>admin</b>
                    <span className="adm">Admin</span>
                    <small>{new Date().toLocaleDateString('id-ID')}</small>
                  </div>
                </div>
                <p>Gausah takut gagal, yukk gabung biar belajar bareng</p>
                <div className="acts">
                  <a href="#/login" aria-label="Suka, 5 ribu">
                    <Ico name="heart" />
                    <span>5rb</span>
                  </a>
                  <a href="#/login" aria-label="Komentar, 2 ribu">
                    <Ico name="msg" />
                    <span>2rb</span>
                  </a>
                  <a href="#/login" aria-label="Bagikan, 1 ribu">
                    <Ico name="link" />
                    <span>1rb</span>
                  </a>
                </div>
              </article>
            </div>

            <div className="slide" aria-label="Menu yang tersedia setelah masuk">
              <div className="track" id="track">
                {[
                  ['infoupdateut', 'Info Update UT', 'Pengumuman dan kabar terbaru'],
                  ['toolsmahasiswa', 'Tools Mahasiswa', 'Bantu nugas lebih cepat'],
                  ['kegiatanmahasiswa', 'Kegiatan Mahasiswa', 'Webinar belajar bareng'],
                  ['portallinkut', 'Portal Link UT', 'Link resmi yang sering dipakai']
                ]
                  .concat([
                    ['infoupdateut', 'Info Update UT', 'Pengumuman dan kabar terbaru'],
                    ['toolsmahasiswa', 'Tools Mahasiswa', 'Bantu nugas lebih cepat'],
                    ['kegiatanmahasiswa', 'Kegiatan Mahasiswa', 'Webinar belajar bareng'],
                    ['portallinkut', 'Portal Link UT', 'Link resmi yang sering dipakai']
                  ])
                  .map((item, idx) => (
                    <a key={idx} className={`c c${idx % 4}`} href="#/login">
                      <div>
                        <h3>{item[1]}</h3>
                        <p>{item[2]}</p>
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* VIEW: LOGIN */}
        {currentRoute === 'login' && (
          <section className="view on" id="login">
            <div className="lg">
              <div className="box" id="lf">
                <div className="mark" role="img" aria-label="Logo"></div>
                <h2>Masuk</h2>
                <p className="s">No one, we are family</p>

                {loginError && <div className="err" id="err">{loginError}</div>}

                <button
                  type="button"
                  className="google-btn"
                  onClick={handleGoogleSignIn}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '14px 20px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '20px'
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.39 7.32 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.13z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.27 2.61 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                  </svg>
                  <span>Masuk via Google</span>
                </button>

                <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--ink2)', textAlign: 'center', lineHeight: 1.5 }}>
                  Gunakan akun Google aktif kamu untuk langsung masuk tanpa perlu verifikasi manual.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* VIEW: REGISTER */}
        {currentRoute === 'daftar' && (
          <section className="view on" id="daftar">
            <div className="lg">
              <form className="box" id="df" onSubmit={handleRegister} autoComplete="off">
                <div className="mark" role="img" aria-label="Logo"></div>
                <h2>Buat akun</h2>
                <p className="s">Gabung jadi keluarga UT FAMILY</p>

                <label htmlFor="du">Username</label>
                <input
                  id="du"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="username"
                  required
                />

                <label htmlFor="de">Email</label>
                <input
                  id="de"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="email"
                  required
                />

                <label htmlFor="dp">Password baru</label>
                <div className="pw">
                  <input
                    id="dp"
                    type={regShowPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="eye"
                    onClick={() => setRegShowPassword(!regShowPassword)}
                  >
                    {regShowPassword ? <Ico name="eyeoff" /> : <Ico name="eye" />}
                  </button>
                </div>

                <label htmlFor="dp2">Konfirmasi password baru</label>
                <div className="pw">
                  <input
                    id="dp2"
                    type={regShowPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>

                {regError && <div className="err" id="derr">{regError}</div>}
                {regSuccess && <div className="ok" id="dok">{regSuccess}</div>}

                <button className="pill" type="submit" id="dsub">
                  Daftar & Verifikasi Email
                </button>

                <div className="divider">atau</div>

                <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
                  Daftar dengan Google
                </button>

                <div className="alt">
                  <a href="#/login" id="dback">Sudah punya akun? Masuk</a>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* VIEW: FORGOT PASSWORD */}
        {currentRoute === 'lupa' && (
          <section className="view on" id="lupa">
            <div className="lg">
              <form className="box" id="ff1" onSubmit={handleForgotPassword} autoComplete="off">
                <div className="mark" role="img" aria-label="Logo"></div>
                <h2>Lupa password</h2>
                <p className="s">Kirim link reset password ke email kamu</p>

                <label htmlFor="fid">Username atau email</label>
                <input
                  id="fid"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="username"
                  required
                />

                {forgotError && <div className="err" id="ferr">{forgotError}</div>}
                {forgotSuccess && <div className="ok" id="fok">{forgotSuccess}</div>}

                <button className="pill" type="submit">
                  Kirim Link Reset Password
                </button>

                <div className="alt">
                  <a href="#/login">Kembali ke masuk</a>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* VIEW: HOME / FEED (Logged In) */}
        {firebaseUser && currentRoute === 'home' && (
          <section className="view on" id="homein">
            <div className="body nr">
              {/* COMPOSER */}
              <div className="cmp" id="cmp">
                <div className="cwr">
                  <div className="av" id="cav">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="" />
                    ) : (
                      userProfile?.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <textarea
                    id="ct"
                    ref={composerInputRef}
                    rows={2}
                    placeholder="Apa yang mau kamu bagikan? Ketik @ untuk mention"
                    aria-label="Tulis postingan"
                    value={postText}
                    onChange={(e) => handleComposerInput(e.target.value)}
                  />

                  {/* Mentions Dropdown */}
                  {mentionSuggestions.length > 0 && (
                    <div className="mnl" id="mnl" role="listbox">
                      {mentionSuggestions.map((u) => (
                        <button key={u.uid} type="button" onClick={() => pickMention(u.username)}>
                          <div className="av" style={{ width: '28px', height: '28px' }}>
                            {u.photoURL ? <img src={u.photoURL} alt="" /> : u.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <b>{u.displayName}</b>
                            <small>@{u.username}</small>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Previews for Image and Link */}
                <div id="pv">
                  {postImageBase64 && (
                    <div className="pvw">
                      <img src={postImageBase64} alt="Pratinjau foto" />
                      <button type="button" onClick={() => setPostImageBase64(null)} aria-label="Hapus foto">
                        &times;
                      </button>
                    </div>
                  )}

                  {postLink && (
                    <div className="lkc">
                      <span>
                        <Ico name="link" size={16} />
                        {postLink}
                      </span>
                      <button type="button" onClick={() => setPostLink(null)} aria-label="Hapus tautan">
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                {linkInputVisible && (
                  <div className="lkr" id="lkr">
                    <input
                      id="lkin"
                      type="url"
                      placeholder="Tempel tautan (https://...)"
                      aria-label="Tautan"
                      value={linkInputValue}
                      onChange={(e) => setLinkInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (linkInputValue.trim()) {
                            let url = linkInputValue.trim();
                            if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                            setPostLink(url);
                            setLinkInputValue('');
                            setLinkInputVisible(false);
                          }
                        }
                      }}
                    />
                    <button
                      className="phb"
                      id="lka"
                      type="button"
                      onClick={() => {
                        if (linkInputValue.trim()) {
                          let url = linkInputValue.trim();
                          if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                          setPostLink(url);
                          setLinkInputValue('');
                          setLinkInputVisible(false);
                        }
                      }}
                    >
                      Tambah
                    </button>
                  </div>
                )}

                <div className="bt">
                  <select id="cs" aria-label="Topik" value={postTopic} onChange={(e) => setPostTopic(e.target.value)}>
                    <option value="Umum">Umum</option>
                    <option value="Tuton">Tuton</option>
                    <option value="Tips tugas">Tips tugas</option>
                  </select>

                  <div className="mwrap">
                    <button
                      className="phb ic"
                      id="pl"
                      type="button"
                      aria-label="Tambah media"
                      title="Tambah media"
                      onClick={() => setMediaMenuOpen(!mediaMenuOpen)}
                    >
                      <Ico name="plus" />
                    </button>
                    {mediaMenuOpen && (
                      <div className="mmn" id="mmn" role="menu">
                        <button
                          className="phb ic"
                          id="pb2"
                          type="button"
                          role="menuitem"
                          aria-label="Foto"
                          title="Foto"
                          onClick={() => {
                            setMediaMenuOpen(false);
                            fileInputRef.current?.click();
                          }}
                        >
                          <Ico name="image" />
                        </button>
                        <button
                          className="phb ic"
                          id="lb2"
                          type="button"
                          role="menuitem"
                          aria-label="Tautan"
                          title="Tautan"
                          onClick={() => {
                            setMediaMenuOpen(false);
                            setLinkInputVisible(!linkInputVisible);
                          }}
                        >
                          <Ico name="link" />
                        </button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="cfile"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </div>

                  <button className="pill" id="cp" type="button" onClick={() => handleCreatePost()}>
                    Posting
                  </button>
                </div>
              </div>

              {/* FEED CONTROLS & TABS */}
              <div className="ftb">
                <div className="fwrap" id="fwp">
                  <button
                    className={`ib ibb ${topicFilter !== 'Semua' ? 'act' : ''}`}
                    id="fb"
                    type="button"
                    aria-label="Filter postingan"
                    title="Filter"
                    onClick={() => setTopicMenuOpen(!topicMenuOpen)}
                  >
                    <Ico name="menu" />
                  </button>
                  {topicMenuOpen && (
                    <div className="fmn" id="fmn" role="menu">
                      {['Semua', 'Umum', 'Tuton', 'Tips tugas'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          role="menuitemradio"
                          aria-checked={topicFilter === t}
                          onClick={() => {
                            setTopicFilter(t);
                            setTopicMenuOpen(false);
                          }}
                        >
                          {t}
                          {topicFilter === t && <Ico name="check" size={16} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="seg" role="group" aria-label="Tampilan beranda">
                  <button
                    type="button"
                    className={feedTab === 'feed' ? 'on' : ''}
                    onClick={() => setFeedTab('feed')}
                    aria-pressed={feedTab === 'feed'}
                  >
                    Feed
                  </button>
                  <button
                    type="button"
                    className={feedTab === 'ann' ? 'on' : ''}
                    onClick={() => setFeedTab('ann')}
                    aria-pressed={feedTab === 'ann'}
                  >
                    Pengumuman
                  </button>
                </div>

                <div className="rfw">
                  <button
                    className={`ib ibb ${isRefreshing ? 'spin' : ''}`}
                    id="rf"
                    type="button"
                    data-rf="1"
                    aria-label="Segarkan postingan"
                    title="Segarkan postingan"
                    onClick={handleRefresh}
                  >
                    <Ico name="refresh" />
                  </button>
                </div>
              </div>

              {/* POSTS LIST OR ANNOUNCEMENTS */}
              {feedTab === 'ann' ? (
                <div id="fd" className="feed" style={{ marginTop: '14px' }}>
                  {announcements.length === 0 ? (
                    <p className="note">Belum ada pengumuman resmi.</p>
                  ) : (
                    announcements.map((a) => {
                      const canEditAnn =
                        Date.now() - a.createdAt < 10 * 60 * 1000 &&
                        (a.authorUid === firebaseUser.uid || isUserAdmin || hasModRight('ann'));

                      return (
                        <div key={a.id} className="post ann">
                          <div className="pt">
                            <div className="av">{a.authorName.charAt(0).toUpperCase()}</div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                <b>{a.authorName}</b>
                                {getUserRoleBadge(a.authorUid, a.authorRole)}
                              </div>
                              <small>
                                {formatCommentDate(a.createdAt)}
                                {a.editedAt ? ' • (diedit)' : ''}
                              </small>
                            </div>
                            <span className="tag">{a.category}</span>
                            {canEditAnn && (
                              <button
                                type="button"
                                onClick={() => startEditAnn(a)}
                                className="phb ic"
                                style={{ fontSize: '12px', padding: '4px 10px', marginLeft: '6px' }}
                                title="Edit pengumuman (Tersedia dalam 10 menit)"
                              >
                                <Ico name="pencil" size={13} />
                                <span>Edit</span>
                              </button>
                            )}
                          </div>
                          <p>{a.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div id="fd" className="feed">
                  {(() => {
                    const allMatching = posts.filter(
                      (p) => !p.classId && (topicFilter === 'Semua' || p.topic === topicFilter)
                    );
                    const sortedPosts = [...allMatching].sort((a, b) => {
                      const pinA = a.isPinned ? 1 : 0;
                      const pinB = b.isPinned ? 1 : 0;
                      if (pinA !== pinB) return pinB - pinA; // Pinned posts tampil teratas
                      const pinTimeA = a.pinnedAt || a.createdAt || 0;
                      const pinTimeB = b.pinnedAt || b.createdAt || 0;
                      if (pinA && pinB) return pinTimeB - pinTimeA;
                      return (b.createdAt || 0) - (a.createdAt || 0);
                    });
                    const displayed = topicFilter === 'Semua' ? sortedPosts : sortedPosts.slice(0, 10);
                    const hasMoreHidden = topicFilter !== 'Semua' && sortedPosts.length > 10;

                    return (
                      <>
                        {displayed.map((post) => {
                          const hasLiked = post.likes?.includes(firebaseUser.uid);
                          const isOwner = post.uid === firebaseUser.uid;
                          const canDelete = isOwner || hasModRight('del');
                          const canPin = isUserAdmin || hasModRight('pin');
                          const canEdit =
                            Date.now() - post.createdAt < 10 * 60 * 1000 && (isOwner || isUserAdmin);

                          return (
                            <div
                              key={post.id}
                              id={`post-${post.id}`}
                              className={`post ${post.isPinned ? 'hl' : ''} ${highlightedId === `post-${post.id}` ? 'target-highlight' : ''}`}
                              data-pid={post.id}
                            >
                              <div className="pt">
                                <button
                                  type="button"
                                  className="uc"
                                  onClick={() => {
                                    const targetUser = allUsersList.find((u) => u.uid === post.uid);
                                    if (targetUser) {
                                      setViewedAccount(targetUser);
                                      window.location.hash = `#/akun?u=${encodeURIComponent(targetUser.username)}`;
                                    }
                                  }}
                                >
                                  <div className="av">
                                    {post.authorPhoto ? (
                                      <img src={post.authorPhoto} alt="" />
                                    ) : (
                                      post.authorName.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                </button>

                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      className="un"
                                      onClick={() => {
                                        const targetUser = allUsersList.find((u) => u.uid === post.uid);
                                        if (targetUser) {
                                          setViewedAccount(targetUser);
                                          window.location.hash = `#/akun?u=${encodeURIComponent(targetUser.username)}`;
                                        }
                                      }}
                                    >
                                      {post.authorName}
                                    </button>
                                    {getUserRoleBadge(post.uid, post.authorRole, post.authorPjClass)}
                                  </div>
                                  <small>
                                    {formatCommentDate(post.createdAt)}
                                    {post.editedAt ? ' • (diedit)' : ''}
                                  </small>
                                </div>

                                <span className="tag">{post.topic}</span>
                                {post.isPinned && (
                                  <span className="pinb">
                                    <Ico name="pin" size={14} /> Disematkan
                                  </span>
                                )}
                              </div>

                              <p>
                                {post.content.split(/(@[a-z0-9_.]{3,20})/gi).map((part, idx) => {
                                  if (part.startsWith('@')) {
                                    return (
                                      <span key={idx} style={{ color: 'var(--sky-d)', fontWeight: 700 }}>
                                        {part}
                                      </span>
                                    );
                                  }
                                  return part;
                                })}
                              </p>

                              {post.imageBase64 && (
                                <img className="ph" src={post.imageBase64} alt="Foto postingan" />
                              )}

                              {post.pdfBase64 && (
                                <a
                                  className="pdf-badge"
                                  href={post.pdfBase64}
                                  download={post.pdfName || 'dokumen.pdf'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div
                                      style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: '#FEE2E2',
                                        color: '#DC2626',
                                        display: 'grid',
                                        placeItems: 'center',
                                        fontWeight: 800,
                                        fontSize: '11px',
                                        flexShrink: 0
                                      }}
                                    >
                                      PDF
                                    </div>
                                    <div>
                                      <b style={{ fontSize: '14px', display: 'block', wordBreak: 'break-all' }}>
                                        {post.pdfName || 'Dokumen PDF'}
                                      </b>
                                      <small style={{ color: 'var(--ink2)' }}>Klik untuk unduh / baca dokumen</small>
                                    </div>
                                  </div>
                                  <Ico name="link" size={16} />
                                </a>
                              )}

                              {post.link && (
                                <a className="lkc" href={post.link} target="_blank" rel="noopener noreferrer">
                                  <span>
                                    <Ico name="link" size={16} />
                                    {post.link.replace(/^https?:\/\//, '')}
                                  </span>
                                </a>
                              )}

                              <div className="acts">
                                <button
                                  type="button"
                                  className={`lk ${hasLiked ? 'on' : ''}`}
                                  onClick={() => handleToggleLike(post)}
                                  aria-label="Suka"
                                  aria-pressed={hasLiked}
                                >
                                  <Ico name="heart" />
                                  <span>{post.likesCount || 0}</span>
                                </button>

                                <button
                                  type="button"
                                  className={post.commentsOpen ? 'on' : ''}
                                  onClick={() => toggleComments(post)}
                                  aria-label="Komentar"
                                >
                                  <Ico name="msg" />
                                  <span>{post.commentsCount || 0}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const url = `${window.location.origin}/#/home?p=${post.id}`;
                                    navigator.clipboard.writeText(url);
                                    showToast('Link postingan disalin');
                                  }}
                                  aria-label="Bagikan link postingan"
                                >
                                  <Ico name="link" />
                                </button>

                                {canPin && (
                                  <button
                                    type="button"
                                    className={post.isPinned ? 'on' : ''}
                                    onClick={() => handleTogglePin(post)}
                                    aria-label={post.isPinned ? 'Lepas sematan' : 'Sematkan postingan'}
                                  >
                                    <Ico name="pin" />
                                  </button>
                                )}

                                {canEdit && (
                                  <button
                                    type="button"
                                    onClick={() => startEditPost(post)}
                                    aria-label="Edit postingan"
                                    title="Edit postingan (Tersedia dalam 10 menit)"
                                  >
                                    <Ico name="pencil" />
                                  </button>
                                )}

                                {canDelete ? (
                                  <button
                                    type="button"
                                    className="rt"
                                    onClick={() => handleDeletePost(post)}
                                    aria-label="Hapus postingan"
                                  >
                                    <Ico name="trash" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="rt"
                                    onClick={() => handleReportPost(post)}
                                    aria-label="Laporkan postingan"
                                  >
                                    <Ico name="alert" />
                                  </button>
                                )}
                              </div>

                              {/* Comments Section */}
                              {post.commentsOpen && (
                                <div className="cms">
                                  {(post.comments || []).map((c) => (
                                    <div key={c.id}>
                                      <div id={`comment-${c.id}`} className={`cm ${highlightedId === `comment-${c.id}` ? "target-highlight" : ""}`}>
                                        <div className="av">
                                          {c.authorPhoto ? (
                                            <img src={c.authorPhoto} alt="" />
                                          ) : (
                                            c.authorName.charAt(0).toUpperCase()
                                          )}
                                        </div>
                                        <div className="t">
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                            <b>{c.authorName}</b>
                                            {getUserRoleBadge(c.uid)}
                                          </div>
                                          <small>{formatCommentDate(c.createdAt)}</small>
                                          <div>{c.content}</div>

                                          <div className="ca">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setPosts((prev) =>
                                                  prev.map((p) =>
                                                    p.id === post.id
                                                      ? {
                                                          ...p,
                                                          comments: (p.comments || []).map((cm) =>
                                                            cm.id === c.id
                                                              ? { ...cm, replyOpen: !cm.replyOpen, replyPrefix: `@${c.authorUsername} ` }
                                                              : cm
                                                          )
                                                        }
                                                      : p
                                                  )
                                                );
                                              }}
                                            >
                                              Balas
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      {(c.replies || []).length > 0 && (
                                        <div className="rps">
                                          {c.replies?.map((r) => (
                                            <div id={`reply-${r.id}`} key={r.id} className={`cm ${highlightedId === `reply-${r.id}` ? "target-highlight" : ""}`}>
                                              <div className="av">
                                                {r.authorPhoto ? <img src={r.authorPhoto} alt="" /> : r.authorName.charAt(0).toUpperCase()}
                                              </div>
                                              <div className="t">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                                  <b>{r.authorName}</b>
                                                  {getUserRoleBadge(r.uid)}
                                                </div>
                                                <small>{formatCommentDate(r.createdAt)}</small>
                                                <div>{r.content}</div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {c.replyOpen && (
                                        <div className="rps">
                                          <div className="cin">
                                            <input
                                              defaultValue={c.replyPrefix || ''}
                                              placeholder="Tulis balasan..."
                                              aria-label="Balasan"
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  const target = e.currentTarget;
                                                  handleAddReply(post, c, target.value);
                                                  target.value = '';
                                                }
                                              }}
                                            />
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                const inp = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                if (inp) {
                                                  handleAddReply(post, c, inp.value);
                                                  inp.value = '';
                                                }
                                              }}
                                            >
                                              Kirim
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}

                                  <div className="cin">
                                    <input
                                      placeholder="Tulis komentar..."
                                      aria-label="Komentar"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const target = e.currentTarget;
                                          handleAddComment(post, target.value);
                                          target.value = '';
                                        }
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        const inp = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        if (inp) {
                                          handleAddComment(post, inp.value);
                                          inp.value = '';
                                        }
                                      }}
                                    >
                                      Kirim
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {hasMoreHidden && (
                          <div style={{ textAlign: 'center', padding: '16px', background: 'var(--card)', borderRadius: '16px', border: '1.5px solid var(--line)', marginTop: '14px' }}>
                            <p style={{ fontSize: '14px', color: 'var(--ink2)', marginBottom: '8px' }}>
                              Menampilkan 10 postingan teratas untuk topik "{topicFilter}".
                            </p>
                            <button
                              type="button"
                              className="pill"
                              onClick={() => setTopicFilter('Semua')}
                              style={{ fontSize: '13px', padding: '7px 18px' }}
                            >
                              Tampilkan Semua Postingan
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {hasMorePosts && topicFilter === 'Semua' && (
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <button
                        className="pill o"
                        disabled={postsLoading}
                        onClick={() => fetchPosts(false)}
                      >
                        {postsLoading ? 'Memuat...' : 'Muat 20 Postingan Lainnya'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* VIEW: INFO UPDATE UT */}
        {currentRoute === 'infoupdateut' && (
          <section className="view on" id="infoupdateut">
            <div className="body">
              <h2 className="t">Info Update UT</h2>
              <p className="lead">Pengumuman dan kabar terbaru.</p>

              {hasModRight('ann') && (
                <div className="cmp" id="acmp" style={{ marginBottom: '20px' }}>
                  <textarea
                    id="at"
                    ref={annInputRef}
                    placeholder="Tulis pengumuman resmi... (Mendukung paragraf, poin teks, rincian info)"
                    aria-label="Tulis pengumuman"
                    value={annText}
                    onChange={(e) => {
                      setAnnText(e.target.value);
                      autoResizeTextarea(e.target);
                    }}
                  />
                  <div className="bt">
                    <select id="ac" aria-label="Kategori" value={annCategory} onChange={(e) => setAnnCategory(e.target.value)}>
                      <option value="Umum">Umum</option>
                      <option value="Akademik">Akademik</option>
                      <option value="Tuton">Tuton</option>
                      <option value="Kegiatan">Kegiatan</option>
                    </select>
                    <button
                      className="pill"
                      id="ap"
                      type="button"
                      style={{ marginLeft: 'auto' }}
                      onClick={async () => {
                        if (!annText.trim() || !firebaseUser || !userProfile) return;
                        try {
                          const newAnnDoc = doc(collection(db, 'announcements'));
                          await setDoc(newAnnDoc, {
                            id: newAnnDoc.id,
                            content: annText.trim(),
                            category: annCategory,
                            authorName: userProfile.displayName,
                            authorRole: roleLabel,
                            authorUid: firebaseUser.uid,
                            createdAt: Date.now()
                          });
                          setAnnText('');
                          if (annInputRef.current) annInputRef.current.style.height = 'auto';
                          showToast('Pengumuman diterbitkan');
                        } catch (error) {
                          handleFirestoreError(error, OperationType.CREATE, 'announcements');
                        }
                      }}
                    >
                      Terbitkan
                    </button>
                  </div>
                </div>
              )}

              <div id="alist">
                {announcements.map((a) => (
                  <div key={a.id} className="post ann">
                    <div className="pt">
                      <div className="av">{a.authorName.charAt(0).toUpperCase()}</div>
                      <div>
                        <b>{a.authorName}</b>
                        <span className="adm">{a.authorRole}</span>
                        <small>{new Date(a.createdAt).toLocaleDateString('id-ID')}</small>
                      </div>
                      <span className="tag">{a.category}</span>
                    </div>
                    <p>{a.content}</p>
                    {hasModRight('ann') && (
                      <div className="acts">
                        <button
                          type="button"
                          className="rt"
                          onClick={async () => {
                            if (confirm('Hapus pengumuman ini?')) {
                              await deleteDoc(doc(db, 'announcements', a.id));
                              showToast('Pengumuman dihapus.');
                            }
                          }}
                          aria-label="Hapus pengumuman"
                        >
                          <Ico name="trash" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* VIEW: TOOLS MAHASISWA */}
        {currentRoute === 'toolsmahasiswa' && (
          <section className="view on" id="toolsmahasiswa">
            <ToolsMahasiswa />
          </section>
        )}

        {/* VIEW: KEGIATAN MAHASISWA */}
        {currentRoute === 'kegiatanmahasiswa' && (
          <section className="view on" id="kegiatanmahasiswa">
            <div className="body">
              <h2 className="t">Kegiatan Mahasiswa</h2>
              <p className="lead">Webinar 3 pertemuan untuk tiap topik. Kirim permintaan daftar, lalu tunggu persetujuan penanggung jawab kelas.</p>

              <div className="panel2" id="klist">
                {[
                  { id: 'desain', n: 'Desain grafis', d: 'Belajar dasar desain grafis lewat 3 pertemuan webinar.' },
                  { id: 'speaking', n: 'Public speaking', d: 'Latihan public speaking lewat 3 pertemuan webinar.' },
                  { id: 'ai', n: 'AI skill', d: 'Kenalan dan latihan AI skill lewat 3 pertemuan webinar.' }
                ].map((k) => {
                  return (
                    <div key={k.id} className="k">
                      <div>
                        {k.n}
                        <small>3 pertemuan</small>
                      </div>

                      <div className="kact">
                        <button
                          className="pill"
                          type="button"
                          onClick={() => {
                            setCurrentClassId(k.id);
                            window.location.hash = `#/kelas?k=${k.id}`;
                          }}
                        >
                          Cek aktivitas kelas
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* VIEW: KELAS DETAIL */}
        {currentRoute === 'kelas' && (
          <section className="view on" id="kelas">
            <div className="body">
              <button
                className="phb"
                type="button"
                data-kback="1"
                onClick={() => {
                  window.location.hash = '#/kegiatanmahasiswa';
                }}
              >
                Kembali
              </button>

              <h2 className="t" id="kt" style={{ marginTop: '14px' }}>
                {currentClassId === 'desain' ? 'Desain grafis' : currentClassId === 'speaking' ? 'Public speaking' : 'AI skill'}
              </h2>
              <p className="lead" id="kd">
                Belajar dasar materi lewat 3 pertemuan webinar.
              </p>

              {!isClassApproved ? (
                <div>
                  {isClassPending ? (
                    <div style={{ background: 'var(--card)', border: '2px solid var(--ink)', borderRadius: '20px', padding: '26px', textAlign: 'center', marginTop: '16px', boxShadow: '6px 6px 0 var(--sh)' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Pengajuan Menunggu Persetujuan</h3>
                      <p style={{ color: 'var(--ink2)', margin: '8px auto 16px', maxWidth: '420px', lineHeight: 1.5, fontSize: '14px' }}>
                        Permintaanmu untuk bergabung ke kelas ini telah terkirim. PJ Kelas atau Admin akan meninjau dan menyetujui pengajuanmu.
                      </p>
                      <button type="button" className="pill o" onClick={handleCancelJoinClass}>
                        Batalkan Pengajuan
                      </button>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--card)', border: '2px solid var(--ink)', borderRadius: '20px', padding: '26px', textAlign: 'center', marginTop: '16px', boxShadow: '6px 6px 0 var(--sh)' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Kelas Terbatas untuk Anggota</h3>
                      <p style={{ color: 'var(--ink2)', margin: '8px auto 18px', maxWidth: '440px', lineHeight: 1.5, fontSize: '14px' }}>
                        Untuk menjaga ketertiban diskusi dan webinar belajar, kamu harus mengajukan bergabung terlebih dahulu sebelum dapat mengakses postingan, materi, dan forum kelas ini.
                      </p>
                      <button
                        type="button"
                        className="pill"
                        onClick={handleApplyJoinClass}
                        disabled={isApplyingClass}
                        style={{ padding: '12px 24px' }}
                      >
                        {isApplyingClass ? 'Mengirim Pengajuan...' : 'Ajukan Bergabung ke Kelas Ini'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="ptb">
                    <div className="ptabs" role="group" aria-label="Isi kelas">
                      <button
                        type="button"
                        className={classTab === 'pertemuan' ? 'on' : ''}
                        onClick={() => setClassTab('pertemuan')}
                        aria-pressed={classTab === 'pertemuan'}
                      >
                        Webinar & Pertemuan
                      </button>
                      <button
                        type="button"
                        className={classTab === 'posts' ? 'on' : ''}
                        onClick={() => setClassTab('posts')}
                        aria-pressed={classTab === 'posts'}
                      >
                        Postingan kelas
                      </button>
                      <button
                        type="button"
                        className={classTab === 'materi' ? 'on' : ''}
                        onClick={() => setClassTab('materi')}
                        aria-pressed={classTab === 'materi'}
                      >
                        Materi Tambahan
                      </button>
                      {isClassManager && (
                        <button
                          type="button"
                          className={classTab === 'peserta' ? 'on' : ''}
                          onClick={() => setClassTab('peserta')}
                          aria-pressed={classTab === 'peserta'}
                        >
                          Kelola Peserta {classMembers.filter(m => m.status === 'pending').length > 0 && `(${classMembers.filter(m => m.status === 'pending').length})`}
                        </button>
                      )}
                      {isUserAdmin && (
                        <button
                          type="button"
                          className={classTab === 'kelola_pj' ? 'on' : ''}
                          onClick={() => setClassTab('kelola_pj')}
                          aria-pressed={classTab === 'kelola_pj'}
                        >
                          Kelola PJ Kelas
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pline" style={{ marginTop: '0' }} />

                  {/* TAB: WEBINAR & PERTEMUAN RESMI UT FAMILY */}
                  {classTab === 'pertemuan' && (
                    <ClassMeetingsView
                      classId={currentClassId}
                      isUserAdmin={isUserAdmin}
                      currentUserUid={firebaseUser?.uid}
                      userRole={userProfile?.role}
                      userPjClasses={userProfile?.pjClasses || (userProfile?.pjClass ? [userProfile.pjClass] : [])}
                      userPjClass={userProfile?.pjClass || undefined}
                      showToast={showToast}
                      onBackToClasses={() => {
                        window.location.hash = '#/kegiatanmahasiswa';
                      }}
                    />
                  )}

                  {/* Class Posts */}
                  {classTab === 'posts' && (
                    <div>
                      <div className="cmp" style={{ marginBottom: '16px' }}>
                        <textarea
                          ref={classPostInputRef}
                          placeholder="Bagikan sesuatu untuk teman sekelas... (Mendukung paragraf, poin teks, media foto & PDF)"
                          value={classPostText}
                          onChange={(e) => {
                            setClassPostText(e.target.value);
                            autoResizeTextarea(e.target);
                          }}
                        />

                        {/* Preview Media di Komposer Kelas */}
                        {classPostMedia && (
                          <div style={{ margin: '8px 0' }}>
                            {classPostMedia.type === 'image' ? (
                              <div className="pvw">
                                <img src={classPostMedia.base64} alt="Pratinjau foto" />
                                <button type="button" onClick={() => setClassPostMedia(null)} aria-label="Hapus foto">
                                  &times;
                                </button>
                              </div>
                            ) : (
                              <div className="file-preview-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                  <div
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '6px',
                                      background: '#FEE2E2',
                                      color: '#DC2626',
                                      display: 'grid',
                                      placeItems: 'center',
                                      fontWeight: 800,
                                      fontSize: '10px',
                                      flexShrink: 0
                                    }}
                                  >
                                    PDF
                                  </div>
                                  <span
                                    style={{
                                      fontSize: '13px',
                                      fontWeight: 600,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {classPostMedia.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="phb"
                                  onClick={() => setClassPostMedia(null)}
                                  style={{ padding: '2px 8px', fontSize: '12px' }}
                                >
                                  Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="bt">
                          <button
                            className="phb ic"
                            type="button"
                            onClick={() => classFileInputRef.current?.click()}
                            title="Lampirkan Media (Foto / PDF)"
                          >
                            <Ico name="plus" size={15} />
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>Media (Foto/PDF)</span>
                          </button>
                          <input
                            ref={classFileInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            hidden
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                showToast('Memproses file...');
                                const res = await readFileAsBase64(file);
                                setClassPostMedia({ name: res.name, type: res.type, base64: res.base64 });
                                showToast(`${res.type === 'pdf' ? 'Dokumen PDF' : 'Foto'} siap diunggah.`);
                              } catch (err: any) {
                                showToast(err.message || 'Gagal memproses file');
                              }
                              e.target.value = '';
                            }}
                          />

                          <button
                            className="pill"
                            type="button"
                            style={{ marginLeft: 'auto' }}
                            onClick={() => handleCreatePost(currentClassId)}
                          >
                            Posting
                          </button>
                        </div>
                      </div>

                      <div className="feed" id="kfeed">
                        {(() => {
                          const classMatching = posts.filter((p) => p.classId === currentClassId);
                          const sortedClassPosts = [...classMatching].sort((a, b) => {
                            const pinA = a.isPinned ? 1 : 0;
                            const pinB = b.isPinned ? 1 : 0;
                            if (pinA !== pinB) return pinB - pinA; // Pinned posts tampil teratas
                            const pinTimeA = a.pinnedAt || a.createdAt || 0;
                            const pinTimeB = b.pinnedAt || b.createdAt || 0;
                            if (pinA && pinB) return pinTimeB - pinTimeA;
                            return (b.createdAt || 0) - (a.createdAt || 0);
                          });

                          if (sortedClassPosts.length === 0) {
                            return <p className="note">Belum ada postingan di kelas ini. Jadilah yang pertama berbagi!</p>;
                          }

                          return sortedClassPosts.map((p) => {
                            const canPin = isUserAdmin || hasPjRight(currentClassId, 'pin');
                            const canDel = p.uid === firebaseUser?.uid || hasPjRight(currentClassId, 'del');

                            return (
                              <div key={p.id} id={`post-${p.id}`} className={`post ${p.isPinned ? 'hl' : ''} ${highlightedId === `post-${p.id}` ? "target-highlight" : ""}`}>
                                <div className="pt">
                                  <div className="av">{p.authorName.charAt(0).toUpperCase()}</div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                      <b>{p.authorName}</b>
                                      {getUserRoleBadge(p.uid, p.authorRole, p.authorPjClass)}
                                    </div>
                                    <small>{formatCommentDate(p.createdAt)}</small>
                                  </div>
                                  {p.isPinned && (
                                    <span className="pinb">
                                      <Ico name="pin" size={14} /> Disematkan
                                    </span>
                                  )}
                                </div>
                                <p>{p.content}</p>

                                {p.imageBase64 && (
                                  <img className="ph" src={p.imageBase64} alt="Media postingan kelas" />
                                )}

                                {p.pdfBase64 && (
                                  <a
                                    className="pdf-badge"
                                    href={p.pdfBase64}
                                    download={p.pdfName || 'dokumen.pdf'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div
                                        style={{
                                          width: '36px',
                                          height: '36px',
                                          borderRadius: '8px',
                                          background: '#FEE2E2',
                                          color: '#DC2626',
                                          display: 'grid',
                                          placeItems: 'center',
                                          fontWeight: 800,
                                          fontSize: '11px',
                                          flexShrink: 0
                                        }}
                                      >
                                        PDF
                                      </div>
                                      <div>
                                        <b style={{ fontSize: '14px', display: 'block', wordBreak: 'break-all' }}>
                                          {p.pdfName || 'Dokumen PDF'}
                                        </b>
                                        <small style={{ color: 'var(--ink2)' }}>Klik untuk unduh / buka dokumen</small>
                                      </div>
                                    </div>
                                    <Ico name="link" size={16} />
                                  </a>
                                )}

                                <div className="acts">
                                  {canPin && (
                                    <button
                                      type="button"
                                      className={p.isPinned ? 'on' : ''}
                                      onClick={() => handleTogglePin(p)}
                                      aria-label={p.isPinned ? 'Lepas sematan' : 'Sematkan postingan'}
                                      title={p.isPinned ? 'Lepas sematan' : 'Sematkan postingan (maks 3)'}
                                    >
                                      <Ico name="pin" />
                                      <span>{p.isPinned ? 'Disematkan' : 'Sematkan'}</span>
                                    </button>
                                  )}

                                  {canDel && (
                                    <button
                                      type="button"
                                      className="rt"
                                      onClick={() => handleDeletePost(p)}
                                      aria-label="Hapus"
                                      title="Hapus postingan"
                                    >
                                      <Ico name="trash" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Class Materi */}
                  {classTab === 'materi' && (
                    <div>
                      {hasPjRight(currentClassId, 'mat') && (
                        <div className="cmp" style={{ marginBottom: '16px' }}>
                          <h4 style={{ fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>
                            Tambah Materi Kelas (Khusus PJ & Admin)
                          </h4>
                          <input
                            className="kin"
                            style={{ width: '100%', marginBottom: '8px', border: '1.5px solid var(--line)', borderRadius: '10px', padding: '10px 14px' }}
                            placeholder="Judul materi pembelajaran..."
                            value={materiTitle}
                            onChange={(e) => setMateriTitle(e.target.value)}
                          />
                          <textarea
                            style={{ width: '100%', minHeight: '80px', marginBottom: '8px', border: '1.5px solid var(--line)', borderRadius: '10px', padding: '10px 14px', font: 'inherit', fontSize: '14px', resize: 'none' }}
                            placeholder="Keterangan materi (mendukung ringkasan, poin-poin penjelasan, tugas)..."
                            value={materiDesc}
                            onChange={(e) => {
                              setMateriDesc(e.target.value);
                              autoResizeTextarea(e.target);
                            }}
                          />
                          <input
                            className="kin"
                            type="url"
                            style={{ width: '100%', marginBottom: '8px', border: '1.5px solid var(--line)', borderRadius: '10px', padding: '10px 14px' }}
                            placeholder="Tautan materi / Google Drive / Modul (opsional, https://...)"
                            value={materiLink}
                            onChange={(e) => setMateriLink(e.target.value)}
                          />

                          {/* Media Preview in Materi */}
                          {materiMedia && (
                            <div style={{ margin: '8px 0' }}>
                              {materiMedia.type === 'image' ? (
                                <div className="pvw">
                                  <img src={materiMedia.base64} alt="Pratinjau foto materi" />
                                  <button type="button" onClick={() => setMateriMedia(null)} aria-label="Hapus foto">
                                    &times;
                                  </button>
                                </div>
                              ) : (
                                <div className="file-preview-card">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                    <div
                                      style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '6px',
                                        background: '#FEE2E2',
                                        color: '#DC2626',
                                        display: 'grid',
                                        placeItems: 'center',
                                        fontWeight: 800,
                                        fontSize: '10px',
                                        flexShrink: 0
                                      }}
                                    >
                                      PDF
                                    </div>
                                    <span
                                      style={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {materiMedia.name}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    className="phb"
                                    onClick={() => setMateriMedia(null)}
                                    style={{ padding: '2px 8px', fontSize: '12px' }}
                                  >
                                    Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="bt">
                            <button
                              className="phb ic"
                              type="button"
                              onClick={() => materiFileInputRef.current?.click()}
                              title="Lampirkan Media Foto atau PDF"
                            >
                              <Ico name="plus" size={15} />
                              <span style={{ fontSize: '13px', fontWeight: 600 }}>Media (Foto/PDF)</span>
                            </button>
                            <input
                              ref={materiFileInputRef}
                              type="file"
                              accept="image/*,application/pdf"
                              hidden
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  showToast('Memproses media materi...');
                                  const res = await readFileAsBase64(file);
                                  setMateriMedia({ name: res.name, type: res.type, base64: res.base64 });
                                  showToast(`${res.type === 'pdf' ? 'Dokumen PDF' : 'Foto'} siap dilampirkan.`);
                                } catch (err: any) {
                                  showToast(err.message || 'Gagal membaca file');
                                }
                                e.target.value = '';
                              }}
                            />

                            <button
                              className="pill"
                              type="button"
                              style={{ marginLeft: 'auto' }}
                              onClick={async () => {
                                if (!materiTitle.trim() || !firebaseUser || !userProfile) return;
                                try {
                                  const newMateriDoc = doc(collection(db, 'kelas', currentClassId, 'materi'));
                                  const newMateri: MateriItem = {
                                    id: newMateriDoc.id,
                                    title: materiTitle.trim(),
                                    description: materiDesc.trim(),
                                    link: materiLink.trim() || undefined,
                                    mediaBase64: materiMedia?.base64,
                                    mediaType: materiMedia?.type,
                                    mediaName: materiMedia?.name,
                                    createdAt: Date.now(),
                                    createdBy: userProfile.displayName
                                  };
                                  await setDoc(newMateriDoc, newMateri);
                                  setMateriTitle('');
                                  setMateriDesc('');
                                  setMateriLink('');
                                  setMateriMedia(null);
                                  showToast('Materi berhasil diunggah.');
                                } catch (err: any) {
                                  handleFirestoreError(err, OperationType.CREATE, `kelas/${currentClassId}/materi`);
                                }
                              }}
                            >
                              Simpan Materi
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Daftar Materi Pembelajaran */}
                      <div className="panel2" style={{ marginTop: '12px' }}>
                        <h4 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '12px' }}>
                          Materi & Modul Kelas
                        </h4>

                        {classMateri.length === 0 ? (
                          <p style={{ color: 'var(--ink2)', fontSize: '14px', marginBottom: '14px' }}>
                            Belum ada materi tambahan yang diunggah oleh PJ Kelas.
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                            {classMateri.map((m) => {
                              const canDel = isUserAdmin || hasPjRight(currentClassId, 'mat');

                              return (
                                <div key={m.id} className="k" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                    <div>
                                      <b style={{ fontSize: '15px' }}>{m.title}</b>
                                      {m.createdBy && (
                                        <small style={{ color: 'var(--ink2)' }}>
                                          Oleh {m.createdBy} • {formatCommentDate(m.createdAt)}
                                        </small>
                                      )}
                                    </div>
                                    {canDel && (
                                      <button
                                        type="button"
                                        className="phb"
                                        style={{ padding: '2px 8px', fontSize: '12px', color: '#E0245E', borderColor: '#E0245E' }}
                                        onClick={async () => {
                                          if (confirm(`Hapus materi "${m.title}"?`)) {
                                            try {
                                              await deleteDoc(doc(db, 'kelas', currentClassId, 'materi', m.id));
                                              showToast('Materi dihapus.');
                                            } catch (err) {
                                              handleFirestoreError(err, OperationType.DELETE, `kelas/${currentClassId}/materi`);
                                            }
                                          }
                                        }}
                                      >
                                        Hapus
                                      </button>
                                    )}
                                  </div>

                                  {m.description && (
                                    <p style={{ margin: '4px 0', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                      {m.description}
                                    </p>
                                  )}

                                  {m.mediaBase64 && m.mediaType === 'image' && (
                                    <img className="ph" src={m.mediaBase64} alt={m.title} style={{ maxHeight: '280px' }} />
                                  )}

                                  {m.mediaBase64 && m.mediaType === 'pdf' && (
                                    <a
                                      className="pdf-badge"
                                      href={m.mediaBase64}
                                      download={m.mediaName || `${m.title}.pdf`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div
                                          style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '8px',
                                            background: '#FEE2E2',
                                            color: '#DC2626',
                                            display: 'grid',
                                            placeItems: 'center',
                                            fontWeight: 800,
                                            fontSize: '11px',
                                            flexShrink: 0
                                          }}
                                        >
                                          PDF
                                        </div>
                                        <div>
                                          <b style={{ fontSize: '14px', display: 'block', wordBreak: 'break-all' }}>
                                            {m.mediaName || 'Dokumen PDF Materi'}
                                          </b>
                                          <small style={{ color: 'var(--ink2)' }}>Klik untuk unduh / buka materi</small>
                                        </div>
                                      </div>
                                      <Ico name="link" size={16} />
                                    </a>
                                  )}

                                  {m.link && (
                                    <a
                                      className="lkc"
                                      href={m.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ alignSelf: 'flex-start' }}
                                    >
                                      <span>
                                        <Ico name="link" size={15} />
                                        Buka Tautan: {m.link.replace(/^https?:\/\//, '')}
                                      </span>
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Class Management (Peserta) */}
                  {classTab === 'peserta' && isClassManager && (
                    <div className="panel2">
                      <h3 className="sech" style={{ fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>
                        Pengajuan Bergabung ({classMembers.filter((m) => m.status === 'pending').length})
                      </h3>
                      {classMembers.filter((m) => m.status === 'pending').length === 0 ? (
                        <p style={{ color: 'var(--ink2)', fontSize: '14px', marginBottom: '16px' }}>
                          Tidak ada pengajuan bergabung yang menunggu persetujuan.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                          {classMembers
                            .filter((m) => m.status === 'pending')
                            .map((m) => (
                              <div key={m.uid} className="k" style={{ alignItems: 'center' }}>
                                <div>
                                  <b>{m.displayName}</b>
                                  <small>@{m.username} • Diajukan {formatCommentDate(m.appliedAt)}</small>
                                </div>
                                <div className="kact" style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    className="pill"
                                    type="button"
                                    onClick={() => handleApproveMember(m.uid)}
                                    style={{ fontSize: '12px', padding: '6px 14px' }}
                                  >
                                    Terima
                                  </button>
                                  <button
                                    className="pill o"
                                    type="button"
                                    onClick={() => handleRejectMember(m.uid)}
                                    style={{ fontSize: '12px', padding: '6px 14px' }}
                                  >
                                    Tolak
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      <h3 className="sech" style={{ fontSize: '18px', fontWeight: 800, margin: '16px 0 10px' }}>
                        Daftar Anggota Aktif ({classMembers.filter((m) => m.status === 'ok').length})
                      </h3>
                      {classMembers.filter((m) => m.status === 'ok').length === 0 ? (
                        <p style={{ color: 'var(--ink2)', fontSize: '14px' }}>
                          Belum ada peserta yang bergabung di kelas ini.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {classMembers
                            .filter((m) => m.status === 'ok')
                            .map((u) => (
                              <div key={u.uid} className="k" style={{ alignItems: 'center' }}>
                                <div>
                                  <b>{u.displayName}</b>
                                  <small>@{u.username}</small>
                                </div>
                                <div className="kact">
                                  <button
                                    className="phb"
                                    type="button"
                                    onClick={() => handleKickMember(u)}
                                    style={{ color: '#E0245E', borderColor: '#E0245E' }}
                                  >
                                    Hapus dari Kelas
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Kelola PJ Kelas (Khusus Admin) */}
                  {classTab === 'kelola_pj' && isUserAdmin && (
                    <div className="panel2">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h3 className="sech" style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px' }}>
                            Kelola Penanggung Jawab (PJ) Kelas
                          </h3>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink2)' }}>
                            Hanya Admin yang dapat menambah atau mencabut peran PJ. Satu PJ dapat memegang satu atau lebih kelas.
                          </p>
                        </div>
                      </div>

                      {/* Current PJs list */}
                      <h4 style={{ fontWeight: 800, fontSize: '15px', margin: '14px 0 8px' }}>
                        Daftar Penanggung Jawab (PJ) Saat Ini
                      </h4>

                      {(() => {
                        const allPjs = allUsersList.filter(
                          (u) => u.role === 'pj' || u.pjClass || (u.pjClasses && u.pjClasses.length > 0)
                        );

                        if (allPjs.length === 0) {
                          return (
                            <p style={{ color: 'var(--ink2)', fontSize: '13px', marginBottom: '16px' }}>
                              Belum ada anggota yang ditugaskan sebagai PJ kelas. Gunakan formulir di bawah untuk menugaskan PJ baru.
                            </p>
                          );
                        }

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
                            {allPjs.map((pjUser) => {
                              const assignedClasses = pjUser.pjClasses && pjUser.pjClasses.length > 0
                                ? pjUser.pjClasses
                                : pjUser.pjClass ? [pjUser.pjClass] : [];

                              return (
                                <div key={pjUser.uid} className="k" style={{ alignItems: 'center' }}>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <b>{pjUser.displayName}</b>
                                      <small>@{pjUser.username}</small>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                                      {assignedClasses.map((cls) => (
                                        <span
                                          key={cls}
                                          style={{
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            background: cls === currentClassId ? '#EEF2FF' : 'var(--bg)',
                                            color: cls === currentClassId ? '#4F46E5' : 'var(--ink)',
                                            border: '1px solid var(--ink)',
                                            padding: '2px 6px',
                                            borderRadius: '4px'
                                          }}
                                        >
                                          PJ {cls === 'desain' ? 'Desain Grafis' : cls === 'speaking' ? 'Public Speaking' : 'AI Skill'}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="kact">
                                    <button
                                      type="button"
                                      className="phb"
                                      style={{ color: '#E0245E', borderColor: '#E0245E', fontSize: '12px' }}
                                      onClick={async () => {
                                        if (confirm(`Cabut peran PJ dari ${pjUser.displayName}?`)) {
                                          try {
                                            await updateDoc(doc(db, 'users', pjUser.uid), {
                                              role: 'member',
                                              pjClass: null,
                                              pjClasses: []
                                            });
                                            showToast(`Peran PJ ${pjUser.displayName} berhasil dicabut.`);
                                          } catch (err: any) {
                                            handleFirestoreError(err, OperationType.UPDATE, `users/${pjUser.uid}`);
                                          }
                                        }
                                      }}
                                    >
                                      Cabut PJ
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

                      {/* Form Penugasan PJ Baru */}
                      <div
                        style={{
                          background: 'var(--card)',
                          border: '1.5px solid var(--ink)',
                          borderRadius: '12px',
                          padding: '16px',
                          marginTop: '12px'
                        }}
                      >
                        <h4 style={{ fontWeight: 800, fontSize: '15px', marginBottom: '10px' }}>
                          Angkat Anggota Menjadi PJ Kelas
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                              Pilih Anggota:
                            </label>
                            <select
                              className="kin"
                              style={{ width: '100%', padding: '8px 12px' }}
                              value={pjAssignUserId}
                              onChange={(e) => setPjAssignUserId(e.target.value)}
                            >
                              <option value="">-- Pilih Anggota dari UT Family --</option>
                              {allUsersList
                                .filter((u) => u.email !== ADMIN_EMAIL)
                                .map((u) => (
                                  <option key={u.uid} value={u.uid}>
                                    {u.displayName} (@{u.username}) {u.role === 'pj' ? '[Sudah PJ]' : ''}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div>
                            <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                              Kelas yang Dipegang (Bisa Lebih dari Satu):
                            </label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              {[
                                { id: 'desain', label: 'Desain Grafis' },
                                { id: 'speaking', label: 'Public Speaking' },
                                { id: 'ai', label: 'AI Skill' }
                              ].map((c) => {
                                const isChecked = pjAssignClasses.includes(c.id);
                                return (
                                  <label
                                    key={c.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '13px',
                                      cursor: 'pointer',
                                      background: isChecked ? '#EEF2FF' : 'var(--bg)',
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      border: `1.5px solid ${isChecked ? '#4F46E5' : 'var(--line)'}`
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setPjAssignClasses([...pjAssignClasses, c.id]);
                                        } else {
                                          setPjAssignClasses(pjAssignClasses.filter((x) => x !== c.id));
                                        }
                                      }}
                                    />
                                    <b>{c.label}</b>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                            <button
                              type="button"
                              className="pill"
                              disabled={!pjAssignUserId || pjAssignClasses.length === 0}
                              onClick={async () => {
                                if (!pjAssignUserId || pjAssignClasses.length === 0) return;
                                const targetUser = allUsersList.find((u) => u.uid === pjAssignUserId);
                                try {
                                  await updateDoc(doc(db, 'users', pjAssignUserId), {
                                    role: 'pj',
                                    pjClasses: pjAssignClasses,
                                    pjClass: pjAssignClasses[0]
                                  });
                                  showToast(`${targetUser?.displayName || 'Anggota'} berhasil diangkat sebagai PJ kelas.`);
                                  setPjAssignUserId('');
                                } catch (err: any) {
                                  handleFirestoreError(err, OperationType.UPDATE, `users/${pjAssignUserId}`);
                                }
                              }}
                            >
                              Tetapkan Sebagai PJ Kelas
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* VIEW: PORTAL LINK UT */}
        {currentRoute === 'portallinkut' && (
          <section className="view on" id="portallinkut">
            <div className="body">
              <h2 className="t">Portal Link UT</h2>
              <p className="lead">Kumpulan link resmi UT.</p>

              {[
                { title: 'MyUT', url: 'https://myut.ut.ac.id', desc: 'myut.ut.ac.id' },
                { title: 'Tuton', url: 'https://elearning.ut.ac.id', desc: 'elearning.ut.ac.id' },
                { title: 'Kalender Akademik', url: 'https://ut.ac.id/kalender-akademik', desc: 'ut.ac.id/kalender-akademik' },
                { title: 'Katalog Mahasiswa', url: 'https://ut.ac.id/katalog', desc: 'ut.ac.id/katalog' },
                { title: 'Ruang Baca Modul', url: 'https://pustaka.ut.ac.id', desc: 'pustaka.ut.ac.id' },
                { title: 'Praktikum/Tuweb/TTM', url: 'https://silayar.ut.ac.id', desc: 'silayar.ut.ac.id' },
                { title: 'Informasi Kelulusan dan Surat Keaktifan Studi', url: 'https://aksi.ut.ac.id', desc: 'aksi.ut.ac.id' },
                { title: 'Laporan Mahasiswa', url: 'https://hallo-ut.ut.ac.id', desc: 'hallo-ut.ut.ac.id' }
              ].map((link, idx) => (
                <a key={idx} className="link" href={link.url} target="_blank" rel="noopener noreferrer">
                  <div>
                    {link.title}
                    <small>{link.desc}</small>
                  </div>
                  <span>Buka</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* VIEW: MODERASI (Admin & Moderator) */}
        {currentRoute === 'moderasi' && hasModRight('rep') && (
          <section className="view on" id="moderasi">
            <div className="body">
              <h2 className="t">Moderasi</h2>
              <p className="lead">Tindak lanjut laporan, kelola moderator dan PJ kelas.</p>

              <div className="ptb">
                <div className="ptabs" role="group" aria-label="Moderasi">
                  <button
                    type="button"
                    className={moderasiTab === 'rep' ? 'on' : ''}
                    onClick={() => setModerasiTab('rep')}
                    aria-pressed={moderasiTab === 'rep'}
                  >
                    Laporan
                  </button>
                  {isUserAdmin && (
                    <button
                      type="button"
                      id="mtu"
                      className={moderasiTab === 'usr' ? 'on' : ''}
                      onClick={() => setModerasiTab('usr')}
                      aria-pressed={moderasiTab === 'usr'}
                    >
                      Kelola peran
                    </button>
                  )}
                </div>
              </div>

              <div className="pline" style={{ marginTop: '0' }} />

              {moderasiTab === 'rep' && (
                <div id="mbody">
                  <p className="note">Tidak ada laporan yang menunggu. Semua aman.</p>
                </div>
              )}

              {moderasiTab === 'usr' && isUserAdmin && (
                <div id="mbody">
                  <p className="lead" style={{ marginTop: '12px' }}>
                    Atur peran dan hak tiap anggota. Admin punya semua hak. Moderator dan PJ kelas bisa dibatasi hak-nya satu per satu lewat tombol Atur hak. PJ kelas hanya berlaku di kelasnya sendiri.
                  </p>

                  {/* Header Pencarian dan Filter Peran */}
                  {(() => {
                    const adminsCount = allUsersList.filter((u) => u.role === 'admin' || u.email === ADMIN_EMAIL).length;
                    const modsCount = allUsersList.filter((u) => u.role === 'moderator').length;
                    const pjsCount = allUsersList.filter((u) => !!u.pjClass).length;
                    const membersCount = allUsersList.filter(
                      (u) => u.role !== 'admin' && u.email !== ADMIN_EMAIL && u.role !== 'moderator' && !u.pjClass
                    ).length;

                    const filteredModUsers = allUsersList.filter((a) => {
                      const q = modMemberSearch.trim().toLowerCase();
                      const matchSearch =
                        !q ||
                        a.displayName.toLowerCase().includes(q) ||
                        a.username.toLowerCase().includes(q) ||
                        (a.email && a.email.toLowerCase().includes(q));

                      if (!matchSearch) return false;

                      const isAdm = a.role === 'admin' || a.email === ADMIN_EMAIL;
                      const isMod = a.role === 'moderator';
                      const isPj = !!a.pjClass;

                      if (modRoleFilter === 'admin') return isAdm;
                      if (modRoleFilter === 'moderator') return isMod;
                      if (modRoleFilter === 'pj') return isPj;
                      if (modRoleFilter === 'member') return !isAdm && !isMod && !isPj;
                      return true;
                    });

                    return (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px',
                            marginTop: '16px',
                            marginBottom: '8px'
                          }}
                        >
                          <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
                            Daftar Anggota ({filteredModUsers.length} dari {allUsersList.length})
                          </h3>
                        </div>

                        {/* Search Input Bar */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              type="text"
                              style={{
                                width: '100%',
                                padding: '10px 36px 10px 14px',
                                borderRadius: '12px',
                                border: '1.5px solid var(--line)',
                                background: 'var(--paper)',
                                color: 'var(--ink)',
                                fontSize: '14px'
                              }}
                              placeholder="Cari nama, username, atau email anggota..."
                              value={modMemberSearch}
                              onChange={(e) => setModMemberSearch(e.target.value)}
                            />
                            {modMemberSearch && (
                              <button
                                type="button"
                                onClick={() => setModMemberSearch('')}
                                style={{
                                  position: 'absolute',
                                  right: '10px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  border: 0,
                                  background: 'none',
                                  color: 'var(--ink2)',
                                  cursor: 'pointer',
                                  fontSize: '18px'
                                }}
                                aria-label="Hapus pencarian"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Filter Peran Chips */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                          {[
                            ['all', `Semua (${allUsersList.length})`],
                            ['admin', `Admin (${adminsCount})`],
                            ['moderator', `Moderator (${modsCount})`],
                            ['pj', `PJ Kelas (${pjsCount})`],
                            ['member', `Member (${membersCount})`]
                          ].map(([fKey, fLabel]) => (
                            <button
                              key={fKey}
                              type="button"
                              className={`pill ${modRoleFilter === fKey ? '' : 'o'}`}
                              style={{ fontSize: '12px', padding: '5px 12px' }}
                              onClick={() => setModRoleFilter(fKey as any)}
                            >
                              {fLabel}
                            </button>
                          ))}
                        </div>

                        <div className="panel2">
                          {filteredModUsers.length === 0 ? (
                            <p className="note" style={{ textAlign: 'center', padding: '24px 0' }}>
                              Tidak ditemukan anggota yang sesuai dengan filter atau kata kunci "{modMemberSearch}".
                            </p>
                          ) : (
                            filteredModUsers.map((a) => {
                      const isSelf = a.uid === firebaseUser?.uid;
                      const isTargetAdmin = a.role === 'admin';
                      const isTargetMod = a.role === 'moderator';
                      const isTargetPj = !!a.pjClass;
                      const isHakOpen = openHakUserId === a.uid;

                      return (
                        <div key={a.uid} style={{ marginBottom: '14px' }}>
                          <div className="k">
                            <div>
                              {a.displayName}
                              <small>
                                @{a.username} · {a.role === 'admin' ? 'Admin · semua hak' : isTargetMod ? 'Moderator' : isTargetPj ? `PJ ${a.pjClass}` : 'Member'}
                              </small>
                            </div>

                            <div className="kacts">
                              <div className="kact">
                                {isSelf ? (
                                  <em>Akun kamu</em>
                                ) : isTargetAdmin ? (
                                  <button
                                    type="button"
                                    className="pill o"
                                    onClick={async () => {
                                      if (confirm(`Cabut hak admin ${a.displayName}?`)) {
                                        await updateDoc(doc(db, 'users', a.uid), { role: 'member' });
                                        showToast(`${a.displayName} bukan admin lagi`);
                                      }
                                    }}
                                  >
                                    Cabut admin
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      className="phb"
                                      onClick={async () => {
                                        if (confirm(`Jadikan ${a.displayName} admin? Admin punya semua hak, termasuk mengatur peran anggota lain.`)) {
                                          await updateDoc(doc(db, 'users', a.uid), { role: 'admin' });
                                          showToast(`${a.displayName} sekarang admin`);
                                        }
                                      }}
                                    >
                                      Jadikan admin
                                    </button>
                                    <button
                                      type="button"
                                      className={`pill ${isTargetMod ? 'o' : ''}`}
                                      onClick={async () => {
                                        const newRole = isTargetMod ? 'member' : 'moderator';
                                        await updateDoc(doc(db, 'users', a.uid), { role: newRole });
                                        showToast(`${a.displayName} ${newRole === 'moderator' ? 'sekarang moderator' : 'bukan moderator lagi'}`);
                                      }}
                                    >
                                      {isTargetMod ? 'Cabut moderator' : 'Jadikan moderator'}
                                    </button>
                                  </>
                                )}
                              </div>

                              {!isTargetAdmin && (
                                <div className="kact">
                                  {isTargetPj ? (
                                    <>
                                      <em>PJ {a.pjClass}</em>
                                      <button
                                        type="button"
                                        className="pill o"
                                        onClick={async () => {
                                          await updateDoc(doc(db, 'users', a.uid), { pjClass: null });
                                          showToast(`${a.displayName} bukan PJ ${a.pjClass} lagi`);
                                        }}
                                      >
                                        Cabut PJ
                                      </button>
                                    </>
                                  ) : selectedUserForPj === a.uid ? (
                                    <>
                                      <select className="ksel" id={`pjs_${a.uid}`}>
                                        <option value="desain">Desain grafis</option>
                                        <option value="speaking">Public speaking</option>
                                        <option value="ai">AI skill</option>
                                      </select>
                                      <button
                                        type="button"
                                        className="pill"
                                        onClick={async () => {
                                          const sel = document.getElementById(`pjs_${a.uid}`) as HTMLSelectElement;
                                          const val = sel?.value || 'desain';
                                          await updateDoc(doc(db, 'users', a.uid), { pjClass: val });
                                          setSelectedUserForPj(null);
                                          showToast(`${a.displayName} sekarang PJ ${val}`);
                                        }}
                                      >
                                        Simpan
                                      </button>
                                      <button
                                        type="button"
                                        className="phb"
                                        onClick={() => setSelectedUserForPj(null)}
                                      >
                                        Batal
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      className="phb"
                                      onClick={() => setSelectedUserForPj(a.uid)}
                                    >
                                      Jadikan PJ kelas
                                    </button>
                                  )}
                                </div>
                              )}

                              {(isTargetMod || isTargetPj) && (
                                <div className="kact">
                                  <button
                                    type="button"
                                    className="phb"
                                    onClick={() => setOpenHakUserId(isHakOpen ? null : a.uid)}
                                  >
                                    {isHakOpen ? 'Tutup hak' : 'Atur hak'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Hak panel */}
                          {isHakOpen && (
                            <div className="hakp">
                              {isTargetMod && (
                                <>
                                  <h4>Hak moderator</h4>
                                  {[
                                    ['ann', 'Tulis dan hapus pengumuman'],
                                    ['rep', 'Tangani laporan (abaikan atau hapus konten)'],
                                    ['del', 'Hapus postingan dan komentar siapa pun'],
                                    ['pin', 'Sematkan postingan']
                                  ].map(([key, label]) => {
                                    const currentVal = a.hm ? (a.hm as any)[key] !== false : true;
                                    return (
                                      <button
                                        key={key}
                                        type="button"
                                        className="tgl"
                                        role="switch"
                                        aria-checked={currentVal}
                                        onClick={async () => {
                                          const newHm = { ...(a.hm || {}), [key]: !currentVal };
                                          await updateDoc(doc(db, 'users', a.uid), { hm: newHm });
                                        }}
                                      >
                                        <span>{label}</span>
                                        <i className={`sw ${currentVal ? 'on' : ''}`} aria-hidden="true" />
                                      </button>
                                    );
                                  })}
                                </>
                              )}

                              {isTargetPj && (
                                <>
                                  <h4>Hak PJ kelas {a.pjClass}</h4>
                                  {[
                                    ['acc', 'Terima atau tolak permintaan masuk'],
                                    ['kick', 'Keluarkan peserta'],
                                    ['del', 'Hapus postingan, komentar, dan pertanyaan kelas'],
                                    ['pin', 'Sematkan postingan kelas'],
                                    ['mat', 'Tambah dan hapus materi'],
                                    ['rep', 'Tangani laporan kelas']
                                  ].map(([key, label]) => {
                                    const currentVal = a.hk ? (a.hk as any)[key] !== false : true;
                                    return (
                                      <button
                                        key={key}
                                        type="button"
                                        className="tgl"
                                        role="switch"
                                        aria-checked={currentVal}
                                        onClick={async () => {
                                          const newHk = { ...(a.hk || {}), [key]: !currentVal };
                                          await updateDoc(doc(db, 'users', a.uid), { hk: newHk });
                                        }}
                                      >
                                        <span>{label}</span>
                                        <i className={`sw ${currentVal ? 'on' : ''}`} aria-hidden="true" />
                                      </button>
                                    );
                                  })}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
            </div>
          </section>
        )}

        {/* VIEW: PROFIL (User's Own Profile) */}
        {currentRoute === 'profil' && (
          <section className="view on" id="profil">
            <div className="body">
              {!editingProfile ? (
                <div className="pcard" id="pview">
                  <div className="av lgav" id="pav2">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="" />
                    ) : (
                      userProfile?.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="pinfo">
                    <h2 id="pnm">{userProfile?.displayName}</h2>
                    <span className="adm" id="prl">{roleLabel}</span>
                    <small className="pfl" id="pfl" style={{ display: 'block', marginTop: '2px' }}>@{userProfile?.username}</small>

                    <div style={{ display: 'flex', gap: '16px', margin: '8px 0', fontSize: '14px', color: 'var(--ink2)' }}>
                      <div
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const followers = allUsersList.filter((u) => u.following?.includes(userProfile?.uid || ''));
                          setUserListModal({
                            open: true,
                            title: `Pengikut ${userProfile?.displayName || ''}`,
                            users: followers
                          });
                        }}
                        title="Lihat siapa yang mengikuti kamu"
                      >
                        <b style={{ color: 'var(--ink)' }}>{allUsersList.filter((u) => u.following?.includes(userProfile?.uid || '')).length}</b> Pengikut
                      </div>
                      <div
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const following = allUsersList.filter((u) => userProfile?.following?.includes(u.uid));
                          setUserListModal({
                            open: true,
                            title: `Mengikuti (${userProfile?.displayName || ''})`,
                            users: following
                          });
                        }}
                        title="Lihat siapa yang kamu ikuti"
                      >
                        <b style={{ color: 'var(--ink)' }}>{userProfile?.following?.length || 0}</b> Mengikuti
                      </div>
                    </div>

                    <p id="pbio">{userProfile?.bio || 'Belum ada bio.'}</p>
                  </div>
                  <button
                    className="ib ibb"
                    id="pedit"
                    type="button"
                    aria-label="Edit profil"
                    title="Edit profil"
                    onClick={() => {
                      setProfileNameInput(userProfile?.displayName || '');
                      setProfileBioInput(userProfile?.bio || '');
                      setProfileAvatarNew(userProfile?.photoURL || null);
                      setEditingProfile(true);
                    }}
                  >
                    <Ico name="pencil" />
                  </button>
                </div>
              ) : (
                <form
                  className="box"
                  id="pfm"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!firebaseUser) return;
                    try {
                      const updated = {
                        displayName: profileNameInput.trim() || userProfile?.displayName || 'Mahasiswa UT',
                        bio: profileBioInput.trim(),
                        photoURL: profileAvatarNew || userProfile?.photoURL || ''
                      };
                      await updateDoc(doc(db, 'users', firebaseUser.uid), updated);
                      setUserProfile((prev) => (prev ? { ...prev, ...updated } : null));
                      setEditingProfile(false);
                      showToast('Info akun disimpan.');
                    } catch (error) {
                      handleFirestoreError(error, OperationType.UPDATE, `users/${firebaseUser.uid}`);
                    }
                  }}
                >
                  <div className="av lgav" id="pav">
                    {profileAvatarNew ? (
                      <img src={profileAvatarNew} alt="" />
                    ) : userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="" />
                    ) : (
                      userProfile?.displayName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="pbt">
                    <button
                      className="phb"
                      id="pup"
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      Unggah foto
                    </button>
                    <button
                      className="phb"
                      id="prm"
                      type="button"
                      onClick={() => setProfileAvatarNew('')}
                    >
                      Hapus foto
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      id="pfile"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarUpload}
                    />
                  </div>

                  <h2>Edit profil</h2>
                  <p className="s">Perubahan tampil di postinganmu</p>

                  <label htmlFor="pu">Peran</label>
                  <input id="pu" value={roleLabel} disabled />

                  <label htmlFor="pn">Nama tampilan</label>
                  <input
                    id="pn"
                    value={profileNameInput}
                    onChange={(e) => setProfileNameInput(e.target.value)}
                    maxLength={30}
                    required
                  />

                  <label htmlFor="pb">Bio</label>
                  <textarea
                    id="pb"
                    rows={3}
                    maxLength={120}
                    value={profileBioInput}
                    onChange={(e) => setProfileBioInput(e.target.value)}
                    placeholder="Ceritakan sedikit tentang kamu"
                  />

                  <button className="pill" type="submit">
                    Simpan
                  </button>
                  <button
                    className="pill o"
                    id="pcx"
                    type="button"
                    style={{ marginTop: '8px', width: '100%' }}
                    onClick={() => setEditingProfile(false)}
                  >
                    Batal
                  </button>
                </form>
              )}

              {/* User's own posts and replies list */}
              <div className="mine" id="mineWrap">
                <div className="pline"></div>
                <div className="ptb">
                  <div className="ptabs" role="group" aria-label="Aktivitas akun">
                    <button
                      type="button"
                      className={profileTab === 'posts' ? 'on' : ''}
                      onClick={() => setProfileTab('posts')}
                    >
                      Postingan ({posts.filter((p) => p.uid === firebaseUser?.uid).length})
                    </button>
                    <button
                      type="button"
                      className={profileTab === 'replies' ? 'on' : ''}
                      onClick={() => {
                        setProfileTab('replies');
                        if (firebaseUser) loadUserReplies(firebaseUser.uid);
                      }}
                    >
                      Balasan {firebaseUser && userRepliesMap[firebaseUser.uid] ? `(${userRepliesMap[firebaseUser.uid].length})` : ''}
                    </button>
                  </div>
                </div>

                {profileTab === 'replies' ? (
                  <div id="mineReplies">
                    {loadingReplies ? (
                      <p className="note" style={{ textAlign: 'center', padding: '16px 0' }}>Memuat balasan dan komentar...</p>
                    ) : (userRepliesMap[firebaseUser?.uid || ''] || []).length === 0 ? (
                      <p className="note" style={{ textAlign: 'center', padding: '16px 0' }}>Belum ada komentar atau balasan yang kamu tulis.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                        {(userRepliesMap[firebaseUser?.uid || ''] || []).map((rep) => (
                          <div key={rep.id} className="post" style={{ margin: 0, padding: '12px 16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--sky-d)', fontWeight: 700 }}>
                                {rep.isReply ? `Balasan ke @${rep.replyToName}` : `Komentar di topik #${rep.postTopic}`}
                              </span>
                              <small style={{ color: 'var(--ink2)' }}>{formatCommentDate(rep.createdAt)}</small>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--ink2)', fontStyle: 'italic', marginBottom: '6px', borderLeft: '2px solid var(--line)', paddingLeft: '8px' }}>
                              "{rep.postSnippet}..."
                            </div>
                            <p style={{ margin: '4px 0', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                              {rep.content}
                            </p>
                            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="phb"
                                style={{ fontSize: '12px', padding: '4px 10px' }}
                                onClick={() => {
                                  const url = `#/home?p=${rep.postId}${rep.isReply ? `&rid=${rep.id}` : `&cid=${rep.id}`}`;
                                  window.location.hash = url;
                                  openPostAndHighlight(rep.postId, !rep.isReply ? rep.id : undefined, rep.isReply ? rep.id : undefined);
                                  showToast('Membuka konten...');
                                }}
                              >
                                Lihat Postingan
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div id="mine">
                    {posts
                      .filter((p) => p.uid === firebaseUser?.uid)
                      .map((p) => (
                        <div key={p.id} className="post mp">
                          <div className="pt">
                            <small>{new Date(p.createdAt).toLocaleDateString('id-ID')}</small>
                            <span className="tag">{p.topic}</span>
                          </div>
                          <p>{p.content}</p>
                          {p.imageBase64 && <img className="ph" src={p.imageBase64} alt="" />}
                          <div className="acts">
                            <span className="cnt">
                              <Ico name="heart" size={18} /> {p.likesCount || 0}
                            </span>
                            <span className="cnt">
                              <Ico name="msg" size={18} /> {p.commentsCount || 0}
                            </span>
                            <button
                              className="rt"
                              type="button"
                              onClick={() => handleDeletePost(p)}
                              aria-label="Hapus postingan"
                            >
                              <Ico name="trash" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* VIEW: AKUN (View Other Member's Public Profile) */}
        {currentRoute === 'akun' && (
          <section className="view on" id="akun">
            <div className="body">
              <button
                className="phb"
                type="button"
                data-bk="1"
                onClick={() => {
                  window.location.hash = '#/home';
                }}
              >
                Kembali
              </button>

              <div className="pcard" style={{ marginTop: '14px' }}>
                <div className="av lgav" id="kav">
                  {viewedAccount?.photoURL ? (
                    <img src={viewedAccount.photoURL} alt="" />
                  ) : (
                    viewedAccount?.displayName.charAt(0).toUpperCase() || 'M'
                  )}
                </div>
                <div className="pinfo">
                  <h2 id="knm">{viewedAccount?.displayName || 'Mahasiswa'}</h2>
                  {viewedAccount && getUserRoleBadge(viewedAccount.uid, viewedAccount.role, viewedAccount.pjClass)}
                  <small className="pfl" id="kfl" style={{ display: 'block', marginTop: '4px' }}>@{viewedAccount?.username}</small>

                  <div style={{ display: 'flex', gap: '16px', margin: '10px 0', fontSize: '14px', color: 'var(--ink2)' }}>
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        const followers = allUsersList.filter((u) => u.following?.includes(viewedAccount?.uid || ''));
                        setUserListModal({
                          open: true,
                          title: `Pengikut ${viewedAccount?.displayName || ''}`,
                          users: followers
                        });
                      }}
                      title="Lihat siapa yang mengikuti akun ini"
                    >
                      <b style={{ color: 'var(--ink)' }}>{allUsersList.filter((u) => u.following?.includes(viewedAccount?.uid || '')).length}</b> Pengikut
                    </div>
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        const following = allUsersList.filter((u) => viewedAccount?.following?.includes(u.uid));
                        setUserListModal({
                          open: true,
                          title: `Mengikuti (${viewedAccount?.displayName || ''})`,
                          users: following
                        });
                      }}
                      title="Lihat siapa yang diikuti"
                    >
                      <b style={{ color: 'var(--ink)' }}>{viewedAccount?.following?.length || 0}</b> Mengikuti
                    </div>
                  </div>

                  {viewedAccount && viewedAccount.uid !== firebaseUser?.uid && (
                    <button
                      type="button"
                      className={`btn-follow ${(userProfile?.following || []).includes(viewedAccount.uid) ? 'following' : ''}`}
                      onClick={() => handleToggleFollow(viewedAccount)}
                      style={{ marginTop: '4px' }}
                    >
                      {(userProfile?.following || []).includes(viewedAccount.uid) ? 'Mengikuti' : 'Ikuti'}
                    </button>
                  )}

                  <p id="kbio" style={{ marginTop: '10px' }}>{viewedAccount?.bio || 'Belum ada bio.'}</p>
                </div>
              </div>

              {/* Posts and replies by this user */}
              <div className="mine">
                <div className="pline"></div>
                <div className="ptb">
                  <div className="ptabs" role="group" aria-label="Aktivitas akun">
                    <button
                      type="button"
                      className={viewedAccountTab === 'posts' ? 'on' : ''}
                      onClick={() => setViewedAccountTab('posts')}
                    >
                      Postingan ({posts.filter((p) => p.uid === viewedAccount?.uid).length})
                    </button>
                    <button
                      type="button"
                      className={viewedAccountTab === 'replies' ? 'on' : ''}
                      onClick={() => {
                        setViewedAccountTab('replies');
                        if (viewedAccount) loadUserReplies(viewedAccount.uid);
                      }}
                    >
                      Balasan {viewedAccount && userRepliesMap[viewedAccount.uid] ? `(${userRepliesMap[viewedAccount.uid].length})` : ''}
                    </button>
                  </div>
                </div>

                {viewedAccountTab === 'replies' ? (
                  <div id="kmineReplies">
                    {loadingReplies ? (
                      <p className="note" style={{ textAlign: 'center', padding: '16px 0' }}>Memuat balasan dan komentar...</p>
                    ) : (userRepliesMap[viewedAccount?.uid || ''] || []).length === 0 ? (
                      <p className="note" style={{ textAlign: 'center', padding: '16px 0' }}>Belum ada komentar atau balasan dari {viewedAccount?.displayName}.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                        {(userRepliesMap[viewedAccount?.uid || ''] || []).map((rep) => (
                          <div key={rep.id} className="post" style={{ margin: 0, padding: '12px 16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--sky-d)', fontWeight: 700 }}>
                                {rep.isReply ? `Balasan ke @${rep.replyToName}` : `Komentar di topik #${rep.postTopic}`}
                              </span>
                              <small style={{ color: 'var(--ink2)' }}>{formatCommentDate(rep.createdAt)}</small>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--ink2)', fontStyle: 'italic', marginBottom: '6px', borderLeft: '2px solid var(--line)', paddingLeft: '8px' }}>
                              "{rep.postSnippet}..."
                            </div>
                            <p style={{ margin: '4px 0', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                              {rep.content}
                            </p>
                            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="phb"
                                style={{ fontSize: '12px', padding: '4px 10px' }}
                                onClick={() => {
                                  const url = `#/home?p=${rep.postId}${rep.isReply ? `&rid=${rep.id}` : `&cid=${rep.id}`}`;
                                  window.location.hash = url;
                                  openPostAndHighlight(rep.postId, !rep.isReply ? rep.id : undefined, rep.isReply ? rep.id : undefined);
                                  showToast('Membuka konten...');
                                }}
                              >
                                Lihat Postingan
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div id="kmine">
                    {posts
                      .filter((p) => p.uid === viewedAccount?.uid)
                      .map((p) => (
                        <div key={p.id} className="post mp">
                          <div className="pt">
                            <small>{new Date(p.createdAt).toLocaleDateString('id-ID')}</small>
                            <span className="tag">{p.topic}</span>
                          </div>
                          <p>{p.content}</p>
                          {p.imageBase64 && <img className="ph" src={p.imageBase64} alt="" />}
                          <div className="acts">
                            <span className="cnt">
                              <Ico name="heart" size={18} /> {p.likesCount || 0}
                            </span>
                            <span className="cnt">
                              <Ico name="msg" size={18} /> {p.commentsCount || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* VIEW: ABOUT */}
        {currentRoute === 'about' && (
          <section className="view on" id="about">
            <div className="body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 className="t" style={{ margin: 0 }}>About</h2>
                {isUserAdmin && (
                  <button
                    type="button"
                    className="pill"
                    onClick={handleOpenAddAbout}
                    style={{ fontSize: '13px', padding: '6px 14px' }}
                  >
                    + Tambah Info About
                  </button>
                )}
              </div>
              <p className="lead">
                Komunitas mahasiswa independen yang bertujuan membantu mahasiswa UT dimanapun berada. Meningkatkan skill dan keterampilan, serta membangun kekeluargaan antar mahasiswa. Ikuti kami melalui:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {aboutItems.map((item) => {
                  const getIconSrc = (raw?: string) => {
                    if (!raw) return '/assets/icons/instagram.png';
                    const lower = raw.toLowerCase();
                    if (lower.includes('instagram')) return '/assets/icons/instagram.png';
                    if (lower.includes('whatsapp') || lower.includes('wa')) return '/assets/icons/whatsapp.png';
                    if (lower.includes('tiktok')) return '/assets/icons/tiktok.png';
                    return raw;
                  };

                  const iconSrc = getIconSrc(item.icon);

                  return (
                    <div
                      key={item.id}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        background: 'var(--card)',
                        border: '2px solid var(--ink)',
                        borderRadius: '16px',
                        padding: '14px 18px',
                        boxShadow: '3px 3px 0 var(--sh)'
                      }}
                    >
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          flex: 1,
                          minWidth: 0
                        }}
                      >
                        <img
                          className="bd bi"
                          src={iconSrc}
                          alt=""
                          width="40"
                          height="40"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/assets/icons/instagram.png';
                          }}
                        />
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <b style={{ fontSize: '16px', display: 'block', color: 'var(--ink)' }}>
                            {item.title}
                          </b>
                          <small style={{ color: 'var(--ink2)', display: 'block', marginTop: '2px' }}>
                            {item.description}
                          </small>
                        </div>
                      </a>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isUserAdmin && (
                          <>
                            <button
                              type="button"
                              className="phb"
                              onClick={(e) => handleOpenEditAbout(item, e)}
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="phb"
                              onClick={(e) => handleDeleteAbout(item, e)}
                              style={{ padding: '4px 10px', fontSize: '12px', color: '#E0245E', borderColor: '#E0245E' }}
                            >
                              Hapus
                            </button>
                          </>
                        )}
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', color: 'var(--ink)', padding: '6px', fontSize: '16px' }}
                          title="Buka Link"
                        >
                          Kunjungi
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* MOBILE SIDE DRAWER MODAL */}
      {sideMenuOpen && (
        <div className="side-drawer-overlay" onClick={() => setSideMenuOpen(false)}>
          <aside className="side-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="side-drawer-header">
              <div className="side-drawer-brand">
                <i className="mark"></i>
                <span>UT FAMILY</span>
              </div>
              <button
                type="button"
                className="side-drawer-close"
                onClick={() => setSideMenuOpen(false)}
                aria-label="Tutup menu"
              >
                Tutup
              </button>
            </div>

            <div style={{ padding: '12px 18px 8px', borderBottom: '1px solid var(--line)' }}>
              <small className="jargon" style={{ display: 'block', fontSize: '13px' }}>
                No one, we are family
              </small>
              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b>{userProfile?.displayName}</b>
                <span className="adm">{roleLabel}</span>
              </div>
            </div>

            <nav className="side-drawer-nav">
              <a
                href="#/home"
                className={currentRoute === 'home' ? 'cur' : ''}
                onClick={() => setSideMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#/infoupdateut"
                className={currentRoute === 'infoupdateut' ? 'cur' : ''}
                onClick={() => setSideMenuOpen(false)}
              >
                Info Update UT
              </a>
              <a
                href="#/toolsmahasiswa"
                className={currentRoute === 'toolsmahasiswa' ? 'cur' : ''}
                onClick={() => setSideMenuOpen(false)}
              >
                Tools Mahasiswa
              </a>
              <a
                href="#/kegiatanmahasiswa"
                className={currentRoute === 'kegiatanmahasiswa' || currentRoute === 'kelas' ? 'cur' : ''}
                onClick={() => setSideMenuOpen(false)}
              >
                Kegiatan Mahasiswa
              </a>
              <a
                href="#/portallinkut"
                className={currentRoute === 'portallinkut' ? 'cur' : ''}
                onClick={() => setSideMenuOpen(false)}
              >
                Portal Link UT
              </a>
              {hasModRight('rep') && (
                <a
                  href="#/moderasi"
                  className={currentRoute === 'moderasi' ? 'cur' : ''}
                  onClick={() => setSideMenuOpen(false)}
                >
                  Moderasi
                </a>
              )}
              <a
                href="#/about"
                className={currentRoute === 'about' ? 'cur' : ''}
                onClick={() => setSideMenuOpen(false)}
              >
                About
              </a>
            </nav>

            <div className="side-drawer-footer">
              <button
                type="button"
                className="pill o"
                onClick={() => {
                  setSideMenuOpen(false);
                  window.location.hash = '#/profil';
                }}
                style={{ width: '100%', marginBottom: '8px' }}
              >
                Info Akun
              </button>
              <button
                type="button"
                className="pill"
                onClick={() => {
                  setSideMenuOpen(false);
                  handleLogout();
                }}
                style={{ width: '100%', background: '#E0245E', color: '#fff' }}
              >
                Keluar Akun
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MODAL EDIT POSTINGAN */}
      {editingPost && (
        <div className="mdl on" onClick={() => setEditingPost(null)}>
          <div className="mc" style={{ maxWidth: '520px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="x" onClick={() => setEditingPost(null)}>
              ×
            </button>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Edit Postingan</h3>
            <p style={{ fontSize: '13px', color: 'var(--ink2)', marginBottom: '14px' }}>
              Dapat diedit dalam 10 menit pertama sejak diposting.
            </p>
            <form onSubmit={handleSaveEditPost}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  Topik
                </label>
                <select
                  value={editPostTopic}
                  onChange={(e) => setEditPostTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    background: 'var(--paper)',
                    fontSize: '14px'
                  }}
                >
                  {['Umum', 'Tuton', 'Tugas', 'UAS', 'Info'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  Isi Postingan
                </label>
                <textarea
                  rows={5}
                  value={editPostContent}
                  onChange={(e) => {
                    setEditPostContent(e.target.value);
                    autoResizeTextarea(e.target);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    background: 'var(--paper)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    resize: 'none'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  Tautan Link (Opsional)
                </label>
                <input
                  type="url"
                  value={editPostLink}
                  onChange={(e) => setEditPostLink(e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    background: 'var(--paper)',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="pill o" onClick={() => setEditingPost(null)}>
                  Batal
                </button>
                <button type="submit" className="pill">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PENGUMUMAN */}
      {editingAnn && (
        <div className="mdl on" onClick={() => setEditingAnn(null)}>
          <div className="mc" style={{ maxWidth: '520px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="x" onClick={() => setEditingAnn(null)}>
              ×
            </button>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Edit Pengumuman</h3>
            <p style={{ fontSize: '13px', color: 'var(--ink2)', marginBottom: '14px' }}>
              Dapat diedit dalam 10 menit pertama sejak dibuat.
            </p>
            <form onSubmit={handleSaveEditAnn}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  Kategori
                </label>
                <select
                  value={editAnnCategory}
                  onChange={(e) => setEditAnnCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    background: 'var(--paper)',
                    fontSize: '14px'
                  }}
                >
                  {['Umum', 'Akademik', 'Registrasi', 'Webinar', 'Penting'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                  Isi Pengumuman
                </label>
                <textarea
                  rows={5}
                  value={editAnnContent}
                  onChange={(e) => {
                    setEditAnnContent(e.target.value);
                    autoResizeTextarea(e.target);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    background: 'var(--paper)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    resize: 'none'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="pill o" onClick={() => setEditingAnn(null)}>
                  Batal
                </button>
                <button type="submit" className="pill">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL / CEK ISI NOTIFIKASI DI LAYAR */}
      {activeNotifPreview && (
        <div className="mdl on" onClick={() => setActiveNotifPreview(null)} role="dialog" aria-modal="true" aria-labelledby="notif-detail-title">
          <div className="mc" style={{ maxWidth: '480px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="x" onClick={() => setActiveNotifPreview(null)} aria-label="Tutup">
              ×
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div className="av" style={{ width: '42px', height: '42px', margin: 0, fontSize: '18px' }}>
                {activeNotifPreview.notif.fromPhoto ? (
                  <img src={activeNotifPreview.notif.fromPhoto} alt="" />
                ) : (
                  activeNotifPreview.notif.fromName.charAt(0).toUpperCase()
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b id="notif-detail-title" style={{ fontSize: '16px', display: 'block' }}>{activeNotifPreview.notif.fromName}</b>
                <span style={{ fontSize: '12px', color: 'var(--ink2)' }}>
                  @{activeNotifPreview.notif.fromUsername || 'user'} • {formatCommentDate(activeNotifPreview.notif.createdAt)}
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '999px',
                  background: 'var(--sky-l)',
                  color: 'var(--ink)'
                }}
              >
                {activeNotifPreview.notif.type === 'tag'
                  ? (activeNotifPreview.notif.commentId ? 'Tag di Komentar' : 'Tag di Postingan')
                  : activeNotifPreview.notif.type === 'reply'
                  ? 'Balasan Komentar'
                  : activeNotifPreview.notif.type === 'follow'
                  ? 'Pengikut Baru'
                  : 'Komentar'}
              </span>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink2)', marginBottom: '4px' }}>
                {activeNotifPreview.notif.type === 'tag'
                  ? 'Isi Sebutan / Tag:'
                  : activeNotifPreview.notif.type === 'reply'
                  ? 'Isi Balasan Komentar:'
                  : activeNotifPreview.notif.type === 'follow'
                  ? 'Aktivitas Akun:'
                  : 'Isi Komentar:'}
              </div>
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg2)',
                  borderRadius: '12px',
                  border: '1.5px solid var(--line)',
                  fontSize: '14px',
                  color: 'var(--ink)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5
                }}
              >
                {activeNotifPreview.notif.snippet || '(Tidak ada cuplikan teks)'}
              </div>
            </div>

            {/* Post Context if available */}
            {activeNotifPreview.post && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink2)', marginBottom: '4px' }}>
                  Postingan Terkait (@{activeNotifPreview.post.authorUsername}):
                </div>
                <div
                  style={{
                    padding: '10px 12px',
                    background: 'var(--paper)',
                    borderRadius: '10px',
                    border: '1px solid var(--line)',
                    fontSize: '13px',
                    color: 'var(--ink2)',
                    maxHeight: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {activeNotifPreview.post.content || '(Foto atau tautan)'}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="pill o"
                onClick={() => setActiveNotifPreview(null)}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Tutup
              </button>
              {activeNotifPreview.notif.postId && (
                <button
                  type="button"
                  className="pill"
                  onClick={() => {
                    const n = activeNotifPreview.notif;
                    setActiveNotifPreview(null);
                    handleNotificationClick(n);
                  }}
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  Buka di Linimasa
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DAFTAR PENGIKUT / MENGIKUTI */}
      {userListModal && userListModal.open && (
        <div className="mdl on" onClick={() => setUserListModal(null)} role="dialog" aria-modal="true">
          <div className="modal-box-clean" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1.5px solid var(--line)' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
                  {userListModal.title}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--ink2)' }}>
                  {userListModal.users.length} mahasiswa
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUserListModal(null)}
                aria-label="Tutup"
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '24px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: 'var(--ink)',
                  padding: '2px 8px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {userListModal.users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--ink2)', fontSize: '14px' }}>
                  Belum ada mahasiswa dalam daftar ini.
                </div>
              ) : (
                userListModal.users.map((u) => {
                  const isMe = u.uid === firebaseUser?.uid;
                  const isFollowingThisUser = (userProfile?.following || []).includes(u.uid);

                  return (
                    <div key={u.uid} className="user-row-card">
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, cursor: 'pointer' }}
                        onClick={() => {
                          setUserListModal(null);
                          if (isMe) {
                            window.location.hash = '#/profil';
                          } else {
                            setViewedAccount(u);
                            window.location.hash = `#/akun?u=${encodeURIComponent(u.username)}`;
                          }
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--sky-l)',
                            border: '1.5px solid var(--line)',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 800,
                            fontSize: '15px',
                            color: 'var(--sky-d)',
                            flexShrink: 0,
                            overflow: 'hidden'
                          }}
                        >
                          {u.photoURL ? (
                            <img src={u.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            u.displayName?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: 700,
                                color: 'var(--ink)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {u.displayName}
                            </span>
                            {getUserRoleBadge(u.uid, u.role, u.pjClass)}
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--ink2)', display: 'block' }}>
                            @{u.username}
                          </span>
                        </div>
                      </div>

                      {!isMe && firebaseUser && (
                        <button
                          type="button"
                          className={`btn-follow-compact ${isFollowingThisUser ? 'following' : ''}`}
                          onClick={() => handleToggleFollow(u)}
                        >
                          {isFollowingThisUser ? 'Mengikuti' : 'Ikuti'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn-follow-compact following"
                style={{ padding: '8px 24px', fontSize: '13px', width: '100%' }}
                onClick={() => setUserListModal(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH INFO ABOUT (Admin) */}
      {isAboutModalOpen && (
        <div className="mdl on" onClick={() => setIsAboutModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-box-clean" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1.5px solid var(--line)' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
                  {editingAboutItem ? 'Edit Info About' : 'Tambah Info About'}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--ink2)' }}>
                  Kelola kontak atau kanal resmi UT Family
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAboutModalOpen(false)}
                aria-label="Tutup"
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '24px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: 'var(--ink)',
                  padding: '2px 8px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <form
              className="modal-body"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAbout();
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px' }}>
                  Judul:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Instagram Resmi, WhatsApp Channel"
                  value={aboutFormTitle}
                  onChange={(e) => setAboutFormTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px' }}>
                  Deskripsi:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Kabar terbaru, dokumentasi kegiatan, dan webinar belajar"
                  value={aboutFormDesc}
                  onChange={(e) => setAboutFormDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px' }}>
                  Link / URL Tujuan:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={aboutFormLink}
                  onChange={(e) => setAboutFormLink(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Pilihan Icon:
                </label>
                <div className="about-icon-grid">
                  {[
                    { label: 'Instagram', val: '/assets/icons/instagram.png' },
                    { label: 'WhatsApp', val: '/assets/icons/whatsapp.png' },
                    { label: 'TikTok', val: '/assets/icons/tiktok.png' },
                    { label: 'UT Family', val: '/assets/logo.png' }
                  ].map((preset) => {
                    const isSelected = aboutFormIcon === preset.val;
                    return (
                      <button
                        key={preset.val}
                        type="button"
                        className={`about-icon-tile ${isSelected ? 'selected' : ''}`}
                        onClick={() => setAboutFormIcon(preset.val)}
                      >
                        <img src={preset.val} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink)' }}>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 12px',
                    border: '1.5px solid var(--line)',
                    borderRadius: '10px',
                    background: 'var(--paper)'
                  }}
                >
                  <img
                    src={aboutFormIcon || '/assets/icons/instagram.png'}
                    alt="Preview"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      objectFit: 'contain',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/icons/instagram.png';
                    }}
                  />
                  <input
                    type="text"
                    placeholder="URL gambar icon (/assets/icons/... atau https://...)"
                    value={aboutFormIcon}
                    onChange={(e) => setAboutFormIcon(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--ink)',
                      fontSize: '13px',
                      outline: 'none',
                      padding: '4px 0'
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: 'auto' }}>
                <button
                  type="button"
                  className="btn-follow-compact following"
                  onClick={() => setIsAboutModalOpen(false)}
                  disabled={isSavingAbout}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-follow-compact"
                  disabled={isSavingAbout}
                  style={{ padding: '8px 22px' }}
                >
                  {isSavingAbout ? 'Menyimpan...' : 'Simpan Informasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHATBOT */}
      <Chatbot
        user={userProfile?.displayName || ''}
        role={userProfile?.role || 'member'}
        roleLabel={roleLabel}
        pjClass={userProfile?.pjClass}
      />

      {/* TOAST NOTIFICATION */}
      <div className={`toast ${toastMsg ? 'on' : ''}`} id="ts" role="status">
        {toastMsg}
      </div>
    </div>
  );
}
