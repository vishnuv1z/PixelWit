import API from "./api";
// simple mock API using localStorage; returns Promises simulating async calls
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

const DB_KEY = 'pixelwit_mockdb_v1';

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw);
  // initial demo data
  const demo = {
    users: [
      // ADMIN
      {
        id: 1,
        name: 'Vishnu',
        email: 'vishnuadmin@gmail.com',
        password: 'admin123',
        role: 'ADMIN',
        isVerified: true,
      },

      // EDITOR 1
      {
        id: 2,
        name: 'Eva Robson',
        email: 'editor1@gmail.com',
        password: 'editor123',
        role: 'EDITOR',
        isVerified: true,
        about: 'Professional Photo & Video Editor',
        description:
          'I am a freelance editor with over 4 years of experience in photo retouching, cinematic video editing, and color grading. I have worked with creators and small brands.',
        skills: ['Photo Editing', 'Color Grading', 'Photoshop', 'Lightroom'],
        hourlyRate: 700,
        availability: 'AVAILABLE',
        profilePhoto: 'https://imgcdn.stablediffusionweb.com/2025/2/4/cd602479-7337-4982-b93d-4bd34311b1d7.jpg',
        portfolio: [
          {
            id: 1,
            type: 'image',
            src: 'https://via.placeholder.com/400x250'
          },
          {
            id: 2,
            type: 'image',
            src: 'https://via.placeholder.com/400x250'
          },
          {
            id: 3,
            type: 'video',
            src: 'https://www.w3schools.com/html/mov_bbb.mp4'
          }
        ],
        rating: 4.5,
        reviews: [
          { id: 1, clientName: 'Alex', rating: 5, comment: 'Excellent editing quality and fast delivery' },
          {id: 2, clientName: 'John', rating: 4, comment: 'Good work, will hire again' } ],
      },

      // EDITOR 2
      {
        id: 4,
        name: 'Max Reeds',
        email: 'editor2@gmail.com',
        password: 'editor2123',
        role: 'EDITOR',
        isVerified: true,
        about: 'Social Media Video Editor',
        description:
          'Specialized in Instagram Reels, YouTube Shorts, and TikTok videos with fast-paced transitions and engaging storytelling.',
        skills: ['Reels Editing', 'Premiere Pro', 'After Effects'],
        hourlyRate: 900,
        availability: 'BUSY',
        profilePhoto: 'https://imgcdn.stablediffusionweb.com/2024/12/29/3a40cd1f-c4ee-4101-b605-602a68474555.jpg',
        portfolio: [
          {
            id: 1,
            type: 'image',
            src: 'https://via.placeholder.com/400x250'
          },
          {
            id: 2,
            type: 'image',
            src: 'https://via.placeholder.com/400x250'
          }
        ],
        rating: 4.7,
        reviews: [
          { id: 1, clientName: 'Jeff', rating: 5, comment: 'Satisfied with the result. ' },
          {id: 2, clientName: 'Sam', rating: 4, comment: 'Good job! will hire for future works.' } ],
      },

      // EDITOR 3
      {
        id: 5,
        name: 'Tony Adams',
        email: 'editor3@gmail.com',
        password: 'editor3123',
        role: 'EDITOR',
        isVerified: true,
        about: 'Thumbnail & Poster Designer',
        description:
          'Creative designer focused on YouTube thumbnails, posters, and branding visuals that improve click-through rates.',
        skills: ['Thumbnail Design', 'Canva', 'Photoshop'],
        hourlyRate: 500,
        availability: 'AVAILABLE',
        profilePhoto: 'https://img.freepik.com/free-photo/close-up-portrait-smiling-young-man_171337-36746.jpg',
        portfolio: [
          {
            id: 1,
            type: 'image',
            src: 'https://via.placeholder.com/400x250'
          }
        ],
        rating: 4.3,
        reviews: [
          { id: 1, clientName: 'Tom', rating: 4, comment: 'Excellent editing quality and fast delivery' },
          {id: 2, clientName: 'Harry', rating: 5, comment: 'Good work, will hire again' } ],
      },

      // CLIENT
      {
        id: 3,
        name: 'Carl Hudson',
        email: 'client1@gmail.com',
        password: 'client123',
        role: 'CLIENT',
        isVerified: true
      }
    ],

    requests: [], // private requests
    quotes: [],
    jobs: []
  };
  localStorage.setItem(DB_KEY, JSON.stringify(demo));
  return demo;
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function generateId(collection) {
  return Date.now() + Math.floor(Math.random() * 1000);
}

const api = {
  // OLD LOCAL STORAGE BASED API (for reference)
  /* async signup({ name, email, password, role }) {
    await delay(600);
    const db = loadDB();
    // eslint-disable-next-line no-throw-literal
    if (db.users.find(u => u.email === email)) throw { message: 'Email already registered' };
    const user = { id: generateId(), name, email, password, role, isVerified: false };
    db.users.push(user);
    saveDB(db);
    // For demo send OTP by saving otp -> in real app use email
    const otp = '123456';
    localStorage.setItem(`otp_${email}`, otp);
    return { message: 'User created. OTP sent (demo 123456)', email };
  }, */

  async signup(data) {
    const res =
      await API.post("/users/signup", data);
    return res.data;
  },

  /* async login({ email, password }) {
    await delay(300);
    const db = loadDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    // eslint-disable-next-line no-throw-literal
    if (!user) throw { message: 'Invalid credentials' };
    // eslint-disable-next-line no-throw-literal
    if (!user.isVerified) throw { message: 'Email not verified' };
    // return minimal user
    const safe = { id: user.id, name: user.name, email: user.email, role: user.role };
    return { user: safe };
  },*/

  async login(data) {
    const res = await API.post("/users/login", data);
    return res.data;
  },

  async me(email) {
    // just return by email if present
    await delay(200);
    const db = loadDB();
    const user = db.users.find(u => u.email === email);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },

  // Editors list
  async listEditors() {
    await delay(300);
    const db = loadDB();
    return db.users.filter(u => u.role === 'EDITOR');
  },

  async getEditor(id) {
    await delay(200);
    const db = loadDB();
    return db.users.find(u => u.id === Number(id));
  },

  // Requests: client -> editor
  async createRequest(data) {
    await delay(400);
    const db = loadDB();
    const req = { id: generateId(), ...data, status: 'PENDING_QUOTE', createdAt: new Date().toISOString() };
    db.requests.push(req);
    saveDB(db);
    return req;
  },

  async listClientRequests(clientId) {
    await delay(300);
    const db = loadDB();
    return db.requests.filter(r => r.clientId === Number(clientId));
  },

  async getRequest(id) {
    await delay(200);
    const db = loadDB();
    return db.requests.find(r => r.id === Number(id));
  },

  async deleteRequest(id) {
    const db = loadDB();
    db.requests = db.requests.filter(r=>r.id!==id);
    saveDB(db);
  },

  async getEditorRequests(editorId) {
    const db = loadDB();
    return db.requests.filter(
      r => Number(r.editorId) === Number(editorId)
    );
  },

  async updateRequestStatus(id, status, amount) {

    const db = loadDB();

    const req = db.requests.find(
      r => Number(r.id) === Number(id)
    );

    if (!req) {
      console.error("Request not found");
      return null;
    }

    req.status = status;

    if (amount) {
      req.budget = amount;
    }

    saveDB(db);

    return req;
  },

  async postQuote(requestId, editorId, quote) {
    await delay(300);
    const db = loadDB();
    const q = { id: generateId(), requestId: Number(requestId), editorId: Number(editorId), ...quote, createdAt: new Date().toISOString() };
    db.quotes.push(q);
    // update request status
    const req = db.requests.find(r => r.id === Number(requestId));
    if (req) req.status = 'QUOTED';
    saveDB(db);
    return q;
  },

  async acceptQuote(requestId, clientId) {
    await delay(300);
    const db = loadDB();
    const req = db.requests.find(r => r.id === Number(requestId) && r.clientId === Number(clientId));
    req.status = 'IN_PROGRESS';
    saveDB(db);
    return req;
  },

  async deliver(requestId, editorId, deliverable) {
    await delay(400);
    const db = loadDB();
    const job = { id: generateId(), requestId: Number(requestId), editorId: Number(editorId), deliverables: [deliverable], status: 'DELIVERED', createdAt: new Date().toISOString() };
    db.jobs.push(job);
    const req = db.requests.find(r => r.id === Number(requestId));
    if (req) req.status = 'DELIVERED';
    saveDB(db);
    return job;
  },
};

export default api;