import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { BlogPost, SystemUser } from '../types';
import { BLOG_POSTS } from '../data';

// Configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID || ""
};

// Graceful check for safety
if (!firebaseConfig.apiKey) {
  console.warn(
    "AVISO DE SEGURANÇA: Configuração do Firebase ausente no frontend. " +
    "Por favor, verifique se o arquivo .env está preenchido e as variáveis " +
    "VITE_FIREBASE_* estão devidamente expostas no ambiente de build."
  );
}

// Initialize Firebase with support for custom firestoreDatabaseId if present
const app = initializeApp(firebaseConfig);

export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const BLOG_COLLECTION_NAME = 'blog_posts';

export const BlogPostService = {
  /**
   * Fetches all blog posts from Firestore.
   * If the collection is empty, it automatically seeds it with the default blog posts from src/data.ts.
   */
  async getAll(): Promise<BlogPost[]> {
    try {
      const querySnapshot = await getDocs(collection(db, BLOG_COLLECTION_NAME));
      
      if (querySnapshot.empty) {
        console.log('Blog collection is empty. Auto-seeding default blog posts...');
        await this.seedDefaultPosts();
        // Fetch again after seeding
        const reSnapshot = await getDocs(collection(db, BLOG_COLLECTION_NAME));
        return reSnapshot.docs.map(docSnap => ({
          ...(docSnap.data() as Omit<BlogPost, 'id'>),
          id: docSnap.id,
        }));
      }

      return querySnapshot.docs.map(docSnap => ({
        ...(docSnap.data() as Omit<BlogPost, 'id'>),
        id: docSnap.id,
      }));
    } catch (error) {
      console.error('Error fetching blog posts from Firestore, falling back to local list:', error);
      // Return static list in case of network or rules issue
      return BLOG_POSTS;
    }
  },

  /**
   * Seeds default blog posts into Firestore.
   */
  async seedDefaultPosts(): Promise<void> {
    try {
      for (const post of BLOG_POSTS) {
        // We can use setDoc with a specific ID, or addDoc. Let's use setDoc so IDs are deterministic
        const { id, ...data } = post;
        const docRef = doc(db, BLOG_COLLECTION_NAME, id);
        await setDoc(docRef, data);
      }
      console.log('Seeding completed successfully!');
    } catch (error) {
      console.error('Failed to seed default blog posts:', error);
    }
  },

  /**
   * Creates a new blog post.
   */
  async create(post: Omit<BlogPost, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, BLOG_COLLECTION_NAME), post);
    return docRef.id;
  },

  /**
   * Updates an existing blog post.
   */
  async update(id: string, post: Partial<Omit<BlogPost, 'id'>>): Promise<void> {
    const docRef = doc(db, BLOG_COLLECTION_NAME, id);
    await setDoc(docRef, post, { merge: true });
  },

  /**
   * Deletes a blog post.
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, BLOG_COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};

const USERS_COLLECTION_NAME = 'system_users';

export const SystemUserService = {
  /**
   * Fetches all system users from Firestore.
   * If empty, seeds with default administrators for easy demo.
   */
  async getAll(): Promise<SystemUser[]> {
    try {
      const querySnapshot = await getDocs(collection(db, USERS_COLLECTION_NAME));
      
      if (querySnapshot.empty) {
        console.log('System users collection is empty. Auto-seeding default system users...');
        await this.seedDefaultUsers();
        const reSnapshot = await getDocs(collection(db, USERS_COLLECTION_NAME));
        return reSnapshot.docs.map(docSnap => ({
          ...(docSnap.data() as Omit<SystemUser, 'id'>),
          id: docSnap.id,
        }));
      }

      return querySnapshot.docs.map(docSnap => ({
        ...(docSnap.data() as Omit<SystemUser, 'id'>),
        id: docSnap.id,
      }));
    } catch (error) {
      console.error('Error fetching system users from Firestore:', error);
      return [];
    }
  },

  /**
   * Seeds default admin users into Firestore.
   */
  async seedDefaultUsers(): Promise<void> {
    try {
      const defaultAdminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@willemes.adv.br';
      const defaultAdminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

      const defaults: Omit<SystemUser, 'id'>[] = [
        {
          name: 'Administrador Geral',
          email: defaultAdminEmail,
          role: 'Administrador',
          status: 'Ativo',
          password: defaultAdminPassword,
          createdAt: new Date().toISOString()
        },
        {
          name: 'Wandeson Andrade',
          email: 'wandesonandrade33@gmail.com',
          role: 'Administrador',
          status: 'Ativo',
          password: defaultAdminPassword,
          createdAt: new Date().toISOString()
        }
      ];

      for (const user of defaults) {
        await addDoc(collection(db, USERS_COLLECTION_NAME), user);
      }
      console.log('System users seeding completed successfully!');
    } catch (error) {
      console.error('Failed to seed default system users:', error);
    }
  },

  /**
   * Creates a new system user.
   */
  async create(user: Omit<SystemUser, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, USERS_COLLECTION_NAME), user);
    return docRef.id;
  },

  /**
   * Updates an existing system user.
   */
  async update(id: string, user: Partial<Omit<SystemUser, 'id'>>): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION_NAME, id);
    await setDoc(docRef, user, { merge: true });
  },

  /**
   * Deletes a system user.
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};

