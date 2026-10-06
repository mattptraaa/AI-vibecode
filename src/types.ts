export type UserRole = 'admin' | 'moderator' | 'member';

export interface ModeratorRights {
  ann?: boolean; // Tulis dan hapus pengumuman
  rep?: boolean; // Tangani laporan
  del?: boolean; // Hapus postingan dan komentar siapa pun
  pin?: boolean; // Sematkan postingan
}

export interface PjRights {
  acc?: boolean;  // Terima atau tolak permintaan masuk
  kick?: boolean; // Keluarkan peserta
  del?: boolean;  // Hapus postingan/komentar/pertanyaan kelas
  pin?: boolean;  // Sematkan postingan kelas
  mat?: boolean;  // Tambah dan hapus materi
  rep?: boolean;  // Tangani laporan kelas
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  photoURL?: string;
  role: UserRole;
  pjClass?: string | null;
  following?: string[];
  hm?: ModeratorRights;
  hk?: PjRights;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReplyItem {
  id: string;
  uid: string;
  authorName: string;
  authorUsername: string;
  authorPhoto?: string;
  content: string;
  createdAt: number;
  isReported?: boolean;
}

export interface CommentItem {
  id: string;
  postId: string;
  uid: string;
  authorName: string;
  authorUsername: string;
  authorPhoto?: string;
  content: string;
  createdAt: number;
  isReported?: boolean;
  replies?: ReplyItem[];
  // Local UI state
  replyOpen?: boolean;
  replyPrefix?: string;
}

export interface PostItem {
  id: string;
  uid: string;
  authorName: string;
  authorUsername: string;
  authorPhoto?: string;
  authorRole?: string;
  authorPjClass?: string | null;
  isPj?: boolean;
  content: string;
  imageBase64?: string;
  pdfBase64?: string;
  pdfName?: string;
  link?: string;
  topic: string;
  classId?: string;
  isPinned?: boolean;
  likesCount: number;
  commentsCount: number;
  likes: string[]; // uids of users who liked
  reportsCount?: number;
  isReported?: boolean;
  createdAt: number;
  updatedAt?: number;
  editedAt?: number;
  // Local UI state
  commentsOpen?: boolean;
  commentsSort?: 'new' | 'old';
  comments?: CommentItem[];
  commentsLoaded?: boolean;
}

export interface KelasItem {
  id: string;
  name: string;
  description: string;
  meetingsCount: number;
}

export interface KelasMemberItem {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  status: 'pending' | 'ok' | 'rejected';
  appliedAt: number;
  updatedAt?: number;
}

export interface MateriItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  mediaBase64?: string;
  mediaType?: 'image' | 'pdf';
  mediaName?: string;
  createdAt: number;
  createdBy?: string;
}

export interface ForumAnswer {
  uid: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface ForumQuestionItem {
  id: string;
  uid: string;
  authorName: string;
  authorUsername: string;
  question: string;
  answers: ForumAnswer[];
  createdAt: number;
}

export interface AnnouncementItem {
  id: string;
  title?: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  authorUid: string;
  createdAt: number;
  editedAt?: number;
}

export interface NotificationItem {
  id: string;
  toUid: string;
  fromUid: string;
  fromName: string;
  fromUsername?: string;
  fromPhoto?: string;
  type: 'post' | 'tag' | 'reply' | 'comment' | 'follow';
  kind?: string;
  postId?: string;
  commentId?: string;
  replyId?: string;
  classId?: string;
  snippet: string;
  read: boolean;
  createdAt: number;
}

export interface ReportItem {
  id: string;
  targetType: 'post' | 'comment' | 'reply';
  postId: string;
  commentId?: string;
  classId?: string;
  reportedByUid: string;
  targetAuthorName: string;
  contentSnippet: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: number;
}
