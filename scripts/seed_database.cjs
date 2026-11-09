const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Automatically read local .env file if available
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
} catch (e) {}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kaushalya_db';

async function seed() {
  console.log('[Seed] Connecting to MongoDB Atlas cluster for kaushalya_db...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('[Seed] Connected successfully!');
    const db = client.db('kaushalya_db');

    // 1. Password Hashes (BCrypt standard)
    const adminPassHash = bcrypt.hashSync('AdminPass123!', 10);
    const defaultPassHash = bcrypt.hashSync('Password123!', 10);

    // 2. Users Collection
    console.log('[Seed] Seeding users collection...');
    const usersCol = db.collection('users');
    await usersCol.deleteMany({});
    
    // Ensure unique email index
    await usersCol.createIndex({ email: 1 }, { unique: true });

    const users = [
      {
        _id: 'usr-admin-1',
        fullName: 'System Administrator',
        email: 'admin@workshophub.edu',
        password: adminPassHash,
        role: 'SUPER_ADMIN',
        department: 'Academic Computing Services',
        accountStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'usr-org-1',
        fullName: 'Dr. Sarah Lin',
        email: 'sarah.lin@faculty.edu',
        password: defaultPassHash,
        role: 'ORGANIZER',
        department: 'Computer Science & Engineering',
        phoneNumber: '+91 98765 43210',
        accountStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'usr-org-2',
        fullName: 'Prof. Vikram Rao',
        email: 'vikram.rao@faculty.edu',
        password: defaultPassHash,
        role: 'ORGANIZER',
        department: 'Electrical & Electronics',
        phoneNumber: '+91 98765 43211',
        accountStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'usr-part-1',
        fullName: 'Alex Morgan',
        email: 'alex.morgan@student.edu',
        password: defaultPassHash,
        role: 'PARTICIPANT',
        department: 'Information Technology',
        phoneNumber: '+91 91234 56789',
        accountStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'usr-part-2',
        fullName: 'Maya Patel',
        email: 'maya.patel@student.edu',
        password: defaultPassHash,
        role: 'PARTICIPANT',
        department: 'Computer Engineering',
        phoneNumber: '+91 91234 56788',
        accountStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'usr-vol-1',
        fullName: 'Marcus Vance',
        email: 'marcus.gate@volunteer.edu',
        password: defaultPassHash,
        role: 'VOLUNTEER',
        department: 'Student Council',
        phoneNumber: '+91 98765 11223',
        accountStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
    ];
    await usersCol.insertMany(users);
    console.log(`[Seed] Seeded ${users.length} users into kaushalya_db.users`);

    // 3. Workshops Collection
    console.log('[Seed] Seeding workshops collection...');
    const wsCol = db.collection('workshops');
    await wsCol.deleteMany({});

    const workshops = [
      {
        _id: 'ws-fullstack',
        title: 'Full-Stack Web Development with React 19 & Spring Boot',
        summary: 'Learn to build modern, responsive web applications with TypeScript, React 19, Tailwind CSS, and enterprise Spring Boot microservices.',
        description: 'A comprehensive 4-hour hands-on studio. We will construct a real-time reactive application from scratch, cover component modularity, state management with hooks, RESTful API design, JWT authentication, and cloud deployment pipelines.\n\nPrerequisites: Basic familiarity with JavaScript and web concepts.',
        category: 'Web Development',
        bannerImageUrl: '/assets/images/banner_fullstack_web.jpg',
        organizerId: 'usr-org-1',
        organizerNameSnapshot: 'Dr. Sarah Lin',
        date: '2026-11-20',
        startTime: '09:30',
        endTime: '13:30',
        venue: 'Turing Computer Lab (Room 302)',
        venueAddress: 'Department of Computer Science, West Campus Complex, Academic Hall B',
        latitude: 19.076,
        longitude: 72.8777,
        mapUrl: 'https://maps.google.com/?q=19.0760,72.8777',
        onlineMode: false,
        capacity: 60,
        pricingType: 'FREE',
        price: 0,
        currency: 'INR',
        learningOutcomes: [
          'React 19 Component Architecture & Hooks',
          'Spring Boot RESTful Microservices',
          'JWT Bearer Security & Interceptors',
          'Tailwind CSS Responsive Design',
        ],
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'ws-ai-deeplearning',
        title: 'Practical AI: Deep Learning & Neural Architecture Studio',
        summary: 'Hands-on implementation of deep neural networks, transformer models, and real-time inference using PyTorch and Hugging Face.',
        description: 'Dive deep into modern machine learning techniques. Participants will train neural networks, fine-tune open weights, and build production inference pipelines using PyTorch.\n\nPrerequisites: Python programming knowledge and basic calculus.',
        category: 'AI & Machine Learning',
        bannerImageUrl: '/assets/images/banner_ai_machine_learning.jpg',
        organizerId: 'usr-org-1',
        organizerNameSnapshot: 'Dr. Sarah Lin',
        date: '2026-11-22',
        startTime: '14:00',
        endTime: '18:00',
        venue: 'Ramanujan Data Center (Lab 105)',
        venueAddress: 'Computational Sciences Building, East Campus, Ground Floor',
        latitude: 19.0755,
        longitude: 72.8785,
        mapUrl: 'https://maps.google.com/?q=19.0755,72.8785',
        onlineMode: false,
        capacity: 45,
        pricingType: 'PAID',
        price: 499,
        currency: 'INR',
        learningOutcomes: [
          'PyTorch Tensor Computation & Backprop',
          'Transformer Attention Mechanics',
          'Fine-Tuning Open LLM Checkpoints',
          'Model Quantization & GPU Serving',
        ],
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'ws-cloud-devops',
        title: 'Cloud Native DevOps: Kubernetes & CI/CD Pipelines',
        summary: 'Master container orchestration, Kubernetes manifests, Helm charts, and continuous deployment workflows with Docker and GitHub Actions.',
        description: 'Learn how high-growth tech companies run and deploy fault-tolerant services. You will build Docker containers, author declarative Kubernetes configurations, set up automated CI/CD runners, and monitor services with Prometheus.\n\nPrerequisites: Basic Linux terminal command proficiency.',
        category: 'Cloud & DevOps',
        bannerImageUrl: '/assets/images/banner_cloud_devops.jpg',
        organizerId: 'usr-org-2',
        organizerNameSnapshot: 'Prof. Vikram Rao',
        date: '2026-11-25',
        startTime: '10:00',
        endTime: '14:00',
        venue: 'Aryabhata Engineering Center (Hall C)',
        venueAddress: 'Electrical & Electronics Block, 2nd Floor, Room 204',
        latitude: 19.0772,
        longitude: 72.8765,
        mapUrl: 'https://maps.google.com/?q=19.0772,72.8765',
        onlineMode: false,
        capacity: 50,
        pricingType: 'PAID',
        price: 299,
        currency: 'INR',
        learningOutcomes: [
          'Docker Multi-Stage Image Builds',
          'Kubernetes Pod, Service & Ingress Orchestration',
          'Automated GitHub Actions CI/CD',
          'Production Observability & Metrics',
        ],
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'ws-cybersecurity',
        title: 'Ethical Hacking & Network Defense Hands-On',
        summary: 'Learn vulnerability scanning, penetration testing techniques, cryptographic protocols, and secure coding practices in a sandboxed lab.',
        description: 'Hands-on offensive and defensive cybersecurity fundamentals. We inspect network packet flows with Wireshark, analyze OWASP Top 10 vulnerabilities, configure firewalls, and learn defensive hardening patterns.\n\nPrerequisites: Basic understanding of IP networks and web architectures.',
        category: 'Cybersecurity',
        bannerImageUrl: '/assets/images/banner_cybersecurity.jpg',
        organizerId: 'usr-org-2',
        organizerNameSnapshot: 'Prof. Vikram Rao',
        date: '2026-11-28',
        startTime: '11:00',
        endTime: '15:00',
        venue: 'Information Security Lab (Room 412)',
        venueAddress: 'Technology Innovation Complex, 4th Floor',
        latitude: 19.078,
        longitude: 72.879,
        mapUrl: 'https://maps.google.com/?q=19.0780,72.8790',
        onlineMode: false,
        capacity: 40,
        pricingType: 'FREE',
        price: 0,
        currency: 'INR',
        learningOutcomes: [
          'Network Packet Capture & Protocol Analysis',
          'OWASP Web Vulnerability Exploitation & Mitigation',
          'Public Key Cryptography & SSL/TLS Handshakes',
          'Security Audit Reporting',
        ],
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'ws-iot-systems',
        title: 'IoT & Edge Computing with ESP32 & MQTT',
        summary: 'Build smart connected sensor nodes, publish telemetry over MQTT broker, and visualize real-time streams on a modern web dashboard.',
        description: 'Hardware meets cloud software. Connect real-time hardware telemetry from microcontrollers to cloud message brokers and display dynamic metrics.\n\nPrerequisites: Basic C/C++ or Arduino knowledge.',
        category: 'Internet of Things',
        bannerImageUrl: '/assets/images/banner_fullstack_web.jpg',
        organizerId: 'usr-org-2',
        organizerNameSnapshot: 'Prof. Vikram Rao',
        date: '2026-12-02',
        startTime: '13:00',
        endTime: '17:00',
        venue: 'Robotics & Embedded Systems Lab',
        venueAddress: 'Mechanical & Mechatronics Workshop Block, Ground Floor',
        latitude: 19.074,
        longitude: 72.876,
        mapUrl: 'https://maps.google.com/?q=19.0740,72.8760',
        onlineMode: false,
        capacity: 35,
        pricingType: 'FREE',
        price: 0,
        currency: 'INR',
        learningOutcomes: [
          'ESP32 Microcontroller Interfacing',
          'MQTT Publish/Subscribe Protocol',
          'Cloud Telemetry Pipelines',
          'Real-Time Sensor Dashboards',
        ],
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'ws-distributed-systems',
        title: 'High-Frequency Distributed Systems & Kafka Architecture',
        summary: 'Architect ultra-low-latency message processing engines, event-driven pipelines, and Raft consensus algorithms for high-scale applications.',
        description: 'An advanced session on distributed algorithms, event streaming with Apache Kafka, message deduplication, distributed transactions (Saga pattern), and horizontal partitioning.\n\nPrerequisites: Intermediate backend engineering knowledge.',
        category: 'Distributed Systems',
        bannerImageUrl: '/assets/images/banner_cloud_devops.jpg',
        organizerId: 'usr-org-1',
        organizerNameSnapshot: 'Dr. Sarah Lin',
        date: '2026-12-05',
        startTime: '10:00',
        endTime: '15:00',
        venue: 'Grace Hopper Auditorium (Auditorium 1)',
        venueAddress: 'Central Library & Research Hub, 1st Floor',
        latitude: 19.0768,
        longitude: 72.878,
        mapUrl: 'https://maps.google.com/?q=19.0768,72.8780',
        onlineMode: false,
        capacity: 30,
        pricingType: 'PAID',
        price: 999,
        currency: 'INR',
        learningOutcomes: [
          'Kafka Event Log Mechanics & Partitioning',
          'Consensus Algorithms (Raft & Paxos)',
          'Idempotent Consumers & Dead Letter Queues',
          'Zero-Downtime Database Migration Patterns',
        ],
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    await wsCol.insertMany(workshops);
    console.log(`[Seed] Seeded ${workshops.length} workshops into kaushalya_db.workshops`);

    // 4. Volunteers Collection
    console.log('[Seed] Seeding volunteers collection...');
    const volCol = db.collection('volunteers');
    await volCol.deleteMany({});

    const volunteers = [
      {
        _id: 'vol-1',
        name: 'Marcus Vance',
        email: 'marcus.gate@volunteer.edu',
        phoneNumber: '+91 98765 11223',
        assignedWorkshopId: 'ws-fullstack',
        assignedWorkshopTitle: 'Full-Stack Web Development with React 19 & Spring Boot',
        organizerId: 'usr-org-1',
        accessCode: 'VOL-729104',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'vol-2',
        name: 'Elena Rostova',
        email: 'elena.volunteer@university.edu',
        phoneNumber: '+91 98765 44556',
        assignedWorkshopId: 'ws-ai-deeplearning',
        assignedWorkshopTitle: 'Practical AI: Deep Learning & Neural Architecture Studio',
        organizerId: 'usr-org-1',
        accessCode: 'VOL-495946',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
      },
    ];
    await volCol.insertMany(volunteers);
    console.log(`[Seed] Seeded ${volunteers.length} volunteers into kaushalya_db.volunteers`);

    // 5. Registrations Collection
    console.log('[Seed] Seeding registrations collection...');
    const regCol = db.collection('registrations');
    await regCol.deleteMany({});

    const registrations = [
      {
        _id: 'reg-alex-1',
        workshopId: 'ws-fullstack',
        participantId: 'usr-part-1',
        participantName: 'Alex Morgan',
        participantEmail: 'alex.morgan@student.edu',
        ticketCode: 'TKT-ALEX-WEB-88F2',
        qrPayload: 'TKT-ALEX-WEB-88F2|ws-fullstack|usr-part-1|1731100000',
        status: 'CONFIRMED',
        pricingTypeSnapshot: 'FREE',
        amount: 0,
        currency: 'INR',
        paymentStatus: 'NOT_REQUIRED',
        verified: false,
        registeredAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        confirmedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        _id: 'reg-alex-2',
        workshopId: 'ws-ai-deeplearning',
        participantId: 'usr-part-1',
        participantName: 'Alex Morgan',
        participantEmail: 'alex.morgan@student.edu',
        ticketCode: 'TKT-ALEX-AI-99B1',
        qrPayload: 'TKT-ALEX-AI-99B1|ws-ai-deeplearning|usr-part-1|1731100000',
        status: 'CONFIRMED',
        pricingTypeSnapshot: 'PAID',
        amount: 499,
        currency: 'INR',
        paymentStatus: 'SUCCESS',
        razorpayOrderId: 'order_test_998811',
        razorpayPaymentId: 'pay_test_alex_ai',
        verified: false,
        registeredAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        confirmedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        _id: 'reg-maya-1',
        workshopId: 'ws-fullstack',
        participantId: 'usr-part-2',
        participantName: 'Maya Patel',
        participantEmail: 'maya.patel@student.edu',
        ticketCode: 'TKT-MAYA-WEB-44A3',
        qrPayload: 'TKT-MAYA-WEB-44A3|ws-fullstack|usr-part-2|1731100000',
        status: 'ATTENDED',
        pricingTypeSnapshot: 'FREE',
        amount: 0,
        currency: 'INR',
        paymentStatus: 'NOT_REQUIRED',
        verified: true,
        verifiedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        registeredAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        confirmedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ];
    await regCol.insertMany(registrations);
    console.log(`[Seed] Seeded ${registrations.length} registrations into kaushalya_db.registrations`);

    // 6. Audit Logs Collection
    console.log('[Seed] Seeding audit_logs collection...');
    const auditCol = db.collection('audit_logs');
    await auditCol.deleteMany({});

    const auditLogs = [
      {
        _id: 'audit-1',
        actorId: 'usr-admin-1',
        actorName: 'System Administrator',
        action: 'PLATFORM_INITIALIZED',
        entityType: 'SYSTEM',
        entityId: 'kaushalya_db',
        details: 'Initialized Kaushalya platform in dedicated database folder kaushalya_db.',
        timestamp: new Date().toISOString(),
      },
      {
        _id: 'audit-2',
        actorId: 'usr-org-1',
        actorName: 'Dr. Sarah Lin',
        action: 'WORKSHOP_CREATED',
        entityType: 'WORKSHOP',
        entityId: 'ws-fullstack',
        details: 'Created free workshop "Full-Stack Web Development with React 19 & Spring Boot".',
        timestamp: new Date().toISOString(),
      },
      {
        _id: 'audit-3',
        actorId: 'usr-org-1',
        actorName: 'Dr. Sarah Lin',
        action: 'WORKSHOP_CREATED',
        entityType: 'WORKSHOP',
        entityId: 'ws-ai-deeplearning',
        details: 'Created paid workshop "Practical AI: Deep Learning & Neural Architecture Studio" (₹499).',
        timestamp: new Date().toISOString(),
      },
      {
        _id: 'audit-4',
        actorId: 'usr-part-1',
        actorName: 'Alex Morgan',
        action: 'REGISTRATION_PAID_CONFIRMED',
        entityType: 'REGISTRATION',
        entityId: 'reg-alex-2',
        details: 'Paid registration confirmed for Practical AI (₹499, Ref: pay_test_alex_ai).',
        timestamp: new Date().toISOString(),
      },
    ];
    await auditCol.insertMany(auditLogs);
    console.log(`[Seed] Seeded ${auditLogs.length} audit logs into kaushalya_db.audit_logs`);

    console.log('[Seed] Complete! Dedicated kaushalya_db database on cluster0 is seeded.');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();

