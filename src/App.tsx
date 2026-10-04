/**
 * UT FAMILY - Aplikasi Komunitas Mahasiswa Universitas Terbuka
 * Powered by Firebase Authentication & Cloud Firestore (Spark Free Tier)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
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
  UserRole
} from './types';
import { compressImage, compressAvatar } from './utils/imageCompressor';
import { Ico, SunIcon, MoonIcon, UserSvgIcon } from './components/MockupIcons';
import { Chatbot } from './components/Chatbot';
import { ToolsMahasiswa } from './components/ToolsMahasiswa';

const ADMIN_EMAIL = 'rahmatadisaputra021@gmail.com';
const PAGE_SIZE = 20;

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
  const [welcomeBanner, setWelcomeBanner] = useState<{ show: boolean; text: string; date: string }>({
    show: false,
    text: '',
    date: ''
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

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

  // Kelas state
  const [currentClassId, setCurrentClassId] = useState<string>('desain');
  const [classTab, setClassTab] = useState<'posts' | 'forum' | 'materi' | 'peserta'>('posts');
  const [classMateri, setClassMateri] = useState<MateriItem[]>([]);
  const [materiTitle, setMateriTitle] = useState('');
  const [materiDesc, setMateriDesc] = useState('');
  const [materiLink, setMateriLink] = useState('');

  // Moderasi state
  const [moderasiTab, setModerasiTab] = useState<'rep' | 'usr'>('rep');
  const [selectedUserForPj, setSelectedUserForPj] = useState<string | null>(null);
  const [openHakUserId, setOpenHakUserId] = useState<string | null>(null);

  // Profile view / Edit state
  const [editingProfile, setEditingProfile] = useState(false);
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
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

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

  // Fetch all users list for mentions & search
  useEffect(() => {
    if (!firebaseUser) return;
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'users'), limit(100)));
        setAllUsersList(snap.docs.map((d) => d.data() as UserProfile));
      } catch (e) {
        // Soft fail
      }
    };
    fetchUsers();
  }, [firebaseUser]);

  // Fetch / Query Posts (Pagination 20 per batch)
  const fetchPosts = useCallback(
    async (isInitial = true) => {
      setPostsLoading(true);
      try {
        const postsRef = collection(db, 'posts');
        let q = query(postsRef, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));

        if (!isInitial && lastVisibleDoc) {
          q = query(postsRef, orderBy('createdAt', 'desc'), startAfter(lastVisibleDoc), limit(PAGE_SIZE));
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs;
        const newPosts = docs.map((d) => ({ id: d.id, ...d.data() } as PostItem));

        if (isInitial) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
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
    if (userProfile?.pjClass !== classId) return false;
    return userProfile.hk ? userProfile.hk[right] !== false : true;
  };

  const roleLabel = isUserAdmin
    ? 'Admin'
    : userProfile?.role === 'moderator'
    ? 'Moderator'
    : userProfile?.pjClass
    ? 'PJ Kelas'
    : 'Member';

  // Handle Mentions autocomplete in composer
  const handleComposerInput = (text: string) => {
    setPostText(text);
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

  // Create Post
  const handleCreatePost = async (classIdTarget?: string) => {
    if (!firebaseUser || !userProfile) {
      window.location.hash = '#/login';
      return;
    }

    if (!firebaseUser.emailVerified && firebaseUser.providerData[0]?.providerId === 'password') {
      showToast('Verifikasi email kamu dulu untuk membuat postingan.');
      return;
    }

    const trimmed = postText.trim();
    if (!trimmed && !postImageBase64 && !postLink) return;

    try {
      const newPostDoc = doc(collection(db, 'posts'));
      const postData: PostItem = {
        id: newPostDoc.id,
        uid: firebaseUser.uid,
        authorName: userProfile.displayName,
        authorUsername: userProfile.username,
        authorPhoto: userProfile.photoURL || '',
        authorRole: roleLabel,
        isPj: !!userProfile.pjClass && userProfile.pjClass === classIdTarget,
        content: trimmed,
        imageBase64: postImageBase64 || '',
        link: postLink || '',
        topic: classIdTarget ? 'Kelas' : postTopic,
        classId: classIdTarget || '',
        isPinned: false,
        likesCount: 0,
        commentsCount: 0,
        likes: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await setDoc(newPostDoc, postData);
      setPosts((prev) => [postData, ...prev]);

      // Fire notifications for mentions
      const mentionMatches = trimmed.match(/@[a-z0-9_.]{3,20}/gi) || [];
      for (const m of mentionMatches) {
        const uTarget = m.slice(1).toLowerCase();
        const targetUser = allUsersList.find((u) => u.username.toLowerCase() === uTarget);
        if (targetUser && targetUser.uid !== firebaseUser.uid) {
          const notifRef = doc(collection(db, 'notifications', targetUser.uid, 'items'));
          await setDoc(notifRef, {
            id: notifRef.id,
            toUid: targetUser.uid,
            fromUid: firebaseUser.uid,
            fromName: userProfile.displayName,
            fromUsername: userProfile.username,
            fromPhoto: userProfile.photoURL || '',
            type: 'tag',
            postId: newPostDoc.id,
            snippet: trimmed.slice(0, 100),
            read: false,
            createdAt: Date.now()
          });
        }
      }

      setPostText('');
      setPostImageBase64(null);
      setPostLink(null);
      setLinkInputVisible(false);
      setMediaMenuOpen(false);
      showToast('Postingan diterbitkan.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
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

  // Pin / Unpin Post
  const handleTogglePin = async (post: PostItem) => {
    const canPin = post.classId
      ? hasPjRight(post.classId, 'pin')
      : hasModRight('pin');

    if (!canPin) {
      showToast('Kamu tidak punya wewenang menyematkan postingan ini.');
      return;
    }

    const newPinState = !post.isPinned;
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, isPinned: newPinState } : p))
    );

    try {
      await updateDoc(doc(db, 'posts', post.id), { isPinned: newPinState });
      showToast(newPinState ? 'Postingan disematkan' : 'Sematan dilepas');
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

    if (!confirm('Apakah kamu yakin ingin menghapus postingan ini?')) return;

    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      showToast('Postingan dihapus.');
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
          snippet: commentText.slice(0, 100),
          read: false,
          createdAt: Date.now()
        });
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
          snippet: replyText.slice(0, 100),
          read: false,
          createdAt: Date.now()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${post.id}/comments/${comment.id}`);
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

      const cred = await signInWithEmailAndPassword(auth, emailToUse, loginPassword);
      setWelcomeBanner({
        show: true,
        text: `Selamat datang, ${cred.user.displayName || input}`,
        date: new Date().toLocaleDateString('id-ID')
      });
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
      window.location.hash = '#/home';
    } catch (err: any) {
      showToast(err.message || 'Gagal login Google.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.hash = '#/home';
    showToast('Kamu telah keluar.');
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
                      <button
                        key={n.id}
                        className={`ni ${n.read ? '' : 'un'}`}
                        type="button"
                        onClick={async () => {
                          await updateDoc(doc(db, 'notifications', firebaseUser.uid, 'items', n.id), { read: true });
                          setNotifMenuOpen(false);
                          window.location.hash = `#/home?p=${n.postId}`;
                        }}
                      >
                        <div className="av">
                          {n.fromPhoto ? <img src={n.fromPhoto} alt="" /> : n.fromName.charAt(0).toUpperCase()}
                        </div>
                        <div className="nt">
                          <div>
                            <b>{n.fromName}</b>{' '}
                            {n.type === 'tag'
                              ? 'menyebut kamu di postingan/komentar'
                              : n.type === 'reply'
                              ? 'membalas komentarmu'
                              : 'berkomentar di postinganmu'}
                          </div>
                          <div className="nx">{n.snippet || '(Foto atau tautan)'}</div>
                          <small>{new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                      </button>
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

      {/* WELCOME BANNER */}
      {welcomeBanner.show && (
        <div className="wb" id="wb" role="status">
          <div className="wbx">
            <div>
              <b id="wbt">{welcomeBanner.text}</b>
              <span id="wbd">Anda mengunjungi web pada {welcomeBanner.date}.</span>
            </div>
            <button type="button" id="wbc" onClick={() => setWelcomeBanner({ show: false, text: '', date: '' })} aria-label="Tutup">
              &times;
            </button>
          </div>
        </div>
      )}

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
              <form className="box" id="lf" onSubmit={handleLogin} autoComplete="off">
                <div className="mark" role="img" aria-label="Logo"></div>
                <h2>Masuk</h2>
                <p className="s">Pakai akun UT Family kamu</p>

                <label htmlFor="u">Username atau Email</label>
                <input
                  id="u"
                  name="u"
                  value={loginEmailOrUsername}
                  onChange={(e) => setLoginEmailOrUsername(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="username"
                  required
                />

                <label htmlFor="p">Password</label>
                <div className="pw">
                  <input
                    id="p"
                    type={loginShowPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="eye"
                    onClick={() => setLoginShowPassword(!loginShowPassword)}
                    aria-label="Tampilkan password"
                  >
                    {loginShowPassword ? <Ico name="eyeoff" /> : <Ico name="eye" />}
                  </button>
                </div>

                {loginSuccess && <div className="ok" id="lok">{loginSuccess}</div>}
                {loginError && <div className="err" id="err">{loginError}</div>}

                <button className="pill" type="submit">
                  Masuk
                </button>

                <div className="divider">atau</div>

                <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
                  Masuk dengan Google
                </button>

                <div className="alt">
                  <a href="#/lupa">Lupa password</a>
                  <span aria-hidden="true">|</span>
                  <a href="#/daftar">Buat akun</a>
                </div>
              </form>
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
                    announcements.map((a) => (
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
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div id="fd" className="feed">
                  {posts
                    .filter((p) => !p.classId && (topicFilter === 'Semua' || p.topic === topicFilter))
                    .map((post) => {
                      const hasLiked = post.likes?.includes(firebaseUser.uid);
                      const isOwner = post.uid === firebaseUser.uid;
                      const canDelete = isOwner || hasModRight('del');
                      const canPin = hasModRight('pin');

                      return (
                        <div key={post.id} className={`post ${post.isPinned ? 'hl' : ''}`} data-pid={post.id}>
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
                              {post.authorRole === 'Admin' && <span className="adm">Admin</span>}
                              {post.authorRole === 'PJ Kelas' && <span className="adm">PJ</span>}
                              <small>{new Date(post.createdAt).toLocaleDateString('id-ID')}</small>
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
                              aria-expanded={post.commentsOpen}
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
                                  <div className="cm">
                                    <div className="av">
                                      {c.authorPhoto ? (
                                        <img src={c.authorPhoto} alt="" />
                                      ) : (
                                        c.authorName.charAt(0).toUpperCase()
                                      )}
                                    </div>
                                    <div className="t">
                                      <b>{c.authorName}</b>
                                      <small>{new Date(c.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</small>
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
                                        <div key={r.id} className="cm">
                                          <div className="av">
                                            {r.authorPhoto ? <img src={r.authorPhoto} alt="" /> : r.authorName.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="t">
                                            <b>{r.authorName}</b>
                                            <small>{new Date(r.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</small>
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

                  {hasMorePosts && (
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
                    rows={2}
                    placeholder="Tulis pengumuman (khusus admin dan moderator)"
                    aria-label="Tulis pengumuman"
                    value={annText}
                    onChange={(e) => setAnnText(e.target.value)}
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

              <div className="ptb">
                <div className="ptabs" role="group" aria-label="Isi kelas">
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
                    Materi
                  </button>
                  {hasPjRight(currentClassId, 'acc') && (
                    <button
                      type="button"
                      className={classTab === 'peserta' ? 'on' : ''}
                      onClick={() => setClassTab('peserta')}
                      aria-pressed={classTab === 'peserta'}
                    >
                      Kelola
                    </button>
                  )}
                </div>
              </div>

              <div className="pline" style={{ marginTop: '0' }} />

              {/* Class Posts */}
              {classTab === 'posts' && (
                <div>
                  <div className="cmp" style={{ marginBottom: '16px' }}>
                    <textarea
                      rows={2}
                      placeholder="Bagikan sesuatu untuk teman sekelas. Ketik @ untuk mention"
                      value={postText}
                      onChange={(e) => handleComposerInput(e.target.value)}
                    />
                    <div className="bt">
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
                    {posts
                      .filter((p) => p.classId === currentClassId)
                      .map((p) => (
                        <div key={p.id} className="post">
                          <div className="pt">
                            <div className="av">{p.authorName.charAt(0).toUpperCase()}</div>
                            <div>
                              <b>{p.authorName}</b>
                              {p.isPj && <span className="adm">PJ</span>}
                              <small>{new Date(p.createdAt).toLocaleDateString('id-ID')}</small>
                            </div>
                          </div>
                          <p>{p.content}</p>
                          {(p.uid === firebaseUser?.uid || hasPjRight(currentClassId, 'del')) && (
                            <div className="acts">
                              <button
                                type="button"
                                className="rt"
                                onClick={() => handleDeletePost(p)}
                                aria-label="Hapus"
                              >
                                <Ico name="trash" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Class Materi */}
              {classTab === 'materi' && (
                <div>
                  {hasPjRight(currentClassId, 'mat') && (
                    <div className="cmp" style={{ marginBottom: '16px' }}>
                      <input
                        className="kin"
                        placeholder="Judul materi"
                        value={materiTitle}
                        onChange={(e) => setMateriTitle(e.target.value)}
                      />
                      <input
                        className="kin"
                        placeholder="Keterangan"
                        value={materiDesc}
                        onChange={(e) => setMateriDesc(e.target.value)}
                      />
                      <input
                        className="kin"
                        type="url"
                        placeholder="Tautan materi (opsional, https://...)"
                        value={materiLink}
                        onChange={(e) => setMateriLink(e.target.value)}
                      />
                      <div className="bt">
                        <button
                          className="pill"
                          type="button"
                          style={{ marginLeft: 'auto' }}
                          onClick={() => {
                            if (!materiTitle.trim()) return;
                            const newMateri: MateriItem = {
                              id: Date.now().toString(),
                              title: materiTitle.trim(),
                              description: materiDesc.trim(),
                              link: materiLink.trim(),
                              createdAt: Date.now()
                            };
                            setClassMateri((prev) => [...prev, newMateri]);
                            setMateriTitle('');
                            setMateriDesc('');
                            setMateriLink('');
                            showToast('Materi ditambahkan');
                          }}
                        >
                          Tambah materi
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="panel2" style={{ marginTop: '12px' }}>
                    {[
                      { title: 'Pertemuan 1', desc: 'Pengantar dan dasar materi' },
                      { title: 'Pertemuan 2', desc: 'Praktik dan studi kasus' },
                      { title: 'Pertemuan 3', desc: 'Studi kasus dan evaluasi' }
                    ].map((m, i) => (
                      <div key={i} className="k">
                        <div>
                          {m.title}
                          <small>{m.desc}</small>
                        </div>
                        <div className="kact">
                          <button className="phb" type="button" onClick={() => showToast('Materi dibuka')}>
                            Buka
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Class Management */}
              {classTab === 'peserta' && (
                <div className="panel2">
                  <h3 className="sech">Peserta</h3>
                  {allUsersList.slice(0, 5).map((u) => (
                    <div key={u.uid} className="k">
                      <div>
                        {u.displayName}
                        <small>@{u.username}</small>
                      </div>
                      <div className="kact">
                        {hasPjRight(currentClassId, 'kick') && (
                          <button
                            className="phb"
                            type="button"
                            onClick={() => showToast(`${u.displayName} dikeluarkan dari kelas`)}
                          >
                            Keluarkan
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                  <span>&#8599;</span>
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

                  <div className="panel2">
                    {allUsersList.map((a) => {
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
                    })}
                  </div>
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
                    <small className="pfl" id="pfl">@{userProfile?.username}</small>
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

              {/* User's own posts list */}
              <div className="mine" id="mineWrap">
                <div className="pline"></div>
                <div className="ptb">
                  <div className="ptabs" role="group" aria-label="Aktivitas akun">
                    <button type="button" className="on">
                      Postingan
                    </button>
                  </div>
                </div>

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
                  <span className="adm" id="krl">{viewedAccount?.role === 'admin' ? 'Admin' : viewedAccount?.role === 'moderator' ? 'Moderator' : 'Anggota'}</span>
                  <small className="pfl" id="kfl">@{viewedAccount?.username}</small>
                  <p id="kbio">{viewedAccount?.bio || 'Belum ada bio.'}</p>
                </div>
              </div>

              {/* Posts by this user */}
              <div className="mine">
                <div className="pline"></div>
                <div className="ptb">
                  <div className="ptabs" role="group" aria-label="Aktivitas akun">
                    <button type="button" className="on">
                      Postingan
                    </button>
                  </div>
                </div>

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
              </div>
            </div>
          </section>
        )}

        {/* VIEW: ABOUT: Exact mockup links and icons */}
        {currentRoute === 'about' && (
          <section className="view on" id="about">
            <div className="body">
              <h2 className="t">About</h2>
              <p className="lead">
                Komunitas mahasiswa independen yang bertujuan membantu mahasiswa UT dimanapun berada. Meningkatkan skill dan keterampilan, serta membangun kekeluargaan antar mahasiswa. Ikuti kami melalui:
              </p>

              <a
                className="link"
                href="https://www.instagram.com/ofc.utfamily?igsh=OGJraDRmcTgwbmh1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img className="bd bi" src="/assets/icons/instagram.png" alt="" width="40" height="40" />
                  <div>
                    Instagram
                    <small>Kabar dan dokumentasi kegiatan</small>
                  </div>
                </div>
                <span>&#8599;</span>
              </a>

              <a
                className="link"
                href="https://www.whatsapp.com/channel/0029VbBvzaKADTOCNeLa4X2S"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img className="bd bi" src="/assets/icons/whatsapp.png" alt="" width="40" height="40" />
                  <div>
                    WhatsApp Channel
                    <small>Pengumuman resmi komunitas</small>
                  </div>
                </div>
                <span>&#8599;</span>
              </a>

              <a
                className="link"
                href="https://linktr.ee/utfamily"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img className="bd bi" src="/assets/icons/whatsapp.png" alt="" width="40" height="40" />
                  <div>
                    Link WA Grup
                    <small>Kumpulan link grup WhatsApp</small>
                  </div>
                </div>
                <span>&#8599;</span>
              </a>

              <a
                className="link"
                href="https://www.tiktok.com/@ut.familypku?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img className="bd bi" src="/assets/icons/tiktok.png" alt="" width="40" height="40" />
                  <div>
                    TikTok
                    <small>Konten video komunitas</small>
                  </div>
                </div>
                <span>&#8599;</span>
              </a>
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

      {/* VERCEL WEB ANALYTICS */}
      <Analytics />
    </div>
  );
}
