import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import connectDB from '../config/database';
import User from '../models/User';
import { Volume, Issue, Article } from '../models/Article';

async function seed() {
  // Guard: never run against production
  if (process.env.NODE_ENV === 'production') {
    console.error('\n❌ REFUSED: seed script cannot run in production (NODE_ENV=production).');
    console.error('   This would DELETE all data and insert test accounts.\n');
    process.exit(1);
  }

  await connectDB();

  console.log('🌱 Seeding database...\n');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Volume.deleteMany({}),
    Issue.deleteMany({}),
    Article.deleteMany({}),
  ]);

  console.log('✅ Cleared existing data');

  // ─── Create Users ──────────────────────────────────
  const admin = await User.create({
    email: 'admin@panafrijournal.org',
    password: 'Admin@123456',
    firstName: 'System',
    lastName: 'Administrator',
    affiliation: 'Pan-African Journal',
    role: 'admin',
  });

  const editor = await User.create({
    email: 'editor@panafrijournal.org',
    password: 'Editor@123456',
    firstName: 'Jane',
    lastName: 'Muthoni',
    affiliation: 'University of Nairobi',
    role: 'editor',
    expertise: ['social work', 'public policy', 'child welfare'],
  });

  const reviewer1 = await User.create({
    email: 'reviewer1@panafrijournal.org',
    password: 'Reviewer@123456',
    firstName: 'Kwame',
    lastName: 'Asante',
    affiliation: 'University of Ghana',
    role: 'reviewer',
    expertise: ['community development', 'social policy', 'poverty reduction'],
  });

  const reviewer2 = await User.create({
    email: 'reviewer2@panafrijournal.org',
    password: 'Reviewer@123456',
    firstName: 'Amina',
    lastName: 'Ibrahim',
    affiliation: 'University of Cape Town',
    role: 'reviewer',
    expertise: ['mental health', 'gender studies', 'social welfare'],
  });

  const author = await User.create({
    email: 'author@panafrijournal.org',
    password: 'Author@123456',
    firstName: 'Chidi',
    lastName: 'Okonkwo',
    affiliation: 'University of Lagos',
    role: 'author',
  });

  console.log('✅ Created users (admin, editor, 2 reviewers, 1 author)');

  // ─── Create Volumes & Issues ───────────────────────
  const vol1 = await Volume.create({
    volumeNumber: 1,
    year: 2024,
    title: 'Inaugural Volume',
    description: 'The first volume of the Pan-African Journal of Social Work and Social Policy',
  });

  const vol2 = await Volume.create({
    volumeNumber: 2,
    year: 2025,
    title: 'Volume 2',
    description: 'Exploring contemporary social issues across the African continent',
  });

  const issue1_1 = await Issue.create({
    volume: vol1.id,
    issueNumber: 1,
    title: 'Social Work Education in Africa',
    description: 'Special issue on social work education and training across Africa',
    publishedAt: new Date('2024-03-15'),
  });

  const issue1_2 = await Issue.create({
    volume: vol1.id,
    issueNumber: 2,
    title: 'Community Development',
    description: 'Community-based approaches to social development',
    publishedAt: new Date('2024-09-01'),
  });

  const issue2_1 = await Issue.create({
    volume: vol2.id,
    issueNumber: 1,
    title: 'Mental Health and Social Policy',
    description: 'Mental health policy frameworks in African contexts',
    publishedAt: new Date('2025-01-15'),
  });

  console.log('✅ Created volumes and issues');

  // ─── Create Sample Articles ────────────────────────
  const sampleArticles = [
    {
      volume: vol1.id,
      issue: issue1_1.id,
      title: 'Reimagining Social Work Education in Sub-Saharan Africa: A Decolonial Approach',
      abstract: 'This article examines the need for decolonizing social work education curricula in Sub-Saharan Africa. Through a critical analysis of existing programmes in five countries, we propose a framework that centers indigenous knowledge systems while maintaining international standards of practice.',
      authors: [
        { name: 'Chidi Okonkwo', email: 'author@panafrijournal.org', affiliation: 'University of Lagos', isCorresponding: true },
        { name: 'Fatima Diallo', email: 'f.diallo@uct.ac.za', affiliation: 'University of Cape Town', isCorresponding: false },
      ],
      keywords: ['social work education', 'decolonization', 'indigenous knowledge', 'Sub-Saharan Africa', 'curriculum reform'],
      slug: 'reimagining-social-work-education-sub-saharan-africa',
      doi: '10.1234/pajswsp.2024.001',
      category: 'research-article',
      pages: { start: 1, end: 24 },
      publishedAt: new Date('2024-03-15'),
      viewCount: 342,
      downloadCount: 89,
    },
    {
      volume: vol1.id,
      issue: issue1_1.id,
      title: 'Field Practice Models in African Social Work: Bridging Theory and Community Needs',
      abstract: 'This study presents findings from a comparative analysis of field practice models across ten social work programmes in East and West Africa. Results indicate that community-embedded models yield significantly better outcomes for student competency development and community engagement.',
      authors: [
        { name: 'Jane Muthoni', email: 'editor@panafrijournal.org', affiliation: 'University of Nairobi', isCorresponding: true },
      ],
      keywords: ['field practice', 'social work training', 'community engagement', 'East Africa', 'West Africa'],
      slug: 'field-practice-models-african-social-work',
      doi: '10.1234/pajswsp.2024.002',
      category: 'research-article',
      pages: { start: 25, end: 48 },
      publishedAt: new Date('2024-03-15'),
      viewCount: 215,
      downloadCount: 56,
    },
    {
      volume: vol1.id,
      issue: issue1_2.id,
      title: 'Community-Led Child Protection Mechanisms in Rural Uganda',
      abstract: 'This paper explores community-led child protection initiatives in rural Uganda, documenting how traditional structures have been adapted to address contemporary challenges. Findings from participatory research in twelve communities reveal effective locally-driven strategies.',
      authors: [
        { name: 'Grace Nakamya', email: 'g.nakamya@mak.ac.ug', affiliation: 'Makerere University', isCorresponding: true },
        { name: 'Peter Ssempijja', email: 'p.ssempijja@mak.ac.ug', affiliation: 'Makerere University', isCorresponding: false },
      ],
      keywords: ['child protection', 'community development', 'Uganda', 'participatory research', 'rural communities'],
      slug: 'community-led-child-protection-rural-uganda',
      doi: '10.1234/pajswsp.2024.003',
      category: 'case-study',
      pages: { start: 1, end: 18 },
      publishedAt: new Date('2024-09-01'),
      viewCount: 178,
      downloadCount: 42,
    },
    {
      volume: vol2.id,
      issue: issue2_1.id,
      title: 'Mental Health Policy in Post-Conflict African States: Lessons from Rwanda and Sierra Leone',
      abstract: 'This comparative policy analysis examines mental health frameworks in Rwanda and Sierra Leone, two countries that have undergone significant conflict-related trauma. The study identifies key policy innovations and systemic challenges in delivering community-based mental health services.',
      authors: [
        { name: 'Amina Ibrahim', email: 'reviewer2@panafrijournal.org', affiliation: 'University of Cape Town', isCorresponding: true },
        { name: 'Jean-Paul Habimana', email: 'jp.habimana@ur.ac.rw', affiliation: 'University of Rwanda', isCorresponding: false },
      ],
      keywords: ['mental health', 'post-conflict', 'social policy', 'Rwanda', 'Sierra Leone', 'community-based services'],
      slug: 'mental-health-policy-post-conflict-african-states',
      doi: '10.1234/pajswsp.2025.001',
      category: 'policy-brief',
      pages: { start: 1, end: 22 },
      publishedAt: new Date('2025-01-15'),
      viewCount: 95,
      downloadCount: 31,
    },
    {
      volume: vol2.id,
      issue: issue2_1.id,
      title: 'The Role of Social Workers in Addressing Gender-Based Violence in Southern Africa',
      abstract: 'This article presents a multi-site study examining the role and effectiveness of social workers in gender-based violence (GBV) prevention and response across four Southern African countries. Findings highlight both the critical contributions and systemic barriers facing practitioners.',
      authors: [
        { name: 'Thandi Moyo', email: 't.moyo@wits.ac.za', affiliation: 'University of the Witwatersrand', isCorresponding: true },
      ],
      keywords: ['gender-based violence', 'social work practice', 'Southern Africa', 'prevention', 'intervention'],
      slug: 'social-workers-gender-based-violence-southern-africa',
      doi: '10.1234/pajswsp.2025.002',
      category: 'research-article',
      pages: { start: 23, end: 45 },
      publishedAt: new Date('2025-01-15'),
      viewCount: 67,
      downloadCount: 19,
    },
  ];

  await Article.insertMany(sampleArticles);
  console.log(`✅ Created ${sampleArticles.length} sample articles`);

  // ─── Summary ───────────────────────────────────────
  console.log('\n═══════════════════════════════════════════');
  console.log('  🌱 Seed Complete!');
  console.log('═══════════════════════════════════════════');
  console.log('\n  Test Accounts:');
  console.log('  ┌─────────────────────────────────────────────────────┐');
  console.log('  │ Role     │ Email                       │ Password       │');
  console.log('  ├─────────────────────────────────────────────────────┤');
  console.log('  │ Admin    │ admin@panafrijournal.org     │ Admin@123456   │');
  console.log('  │ Editor   │ editor@panafrijournal.org    │ Editor@123456  │');
  console.log('  │ Reviewer │ reviewer1@panafrijournal.org │ Reviewer@123456│');
  console.log('  │ Reviewer │ reviewer2@panafrijournal.org │ Reviewer@123456│');
  console.log('  │ Author   │ author@panafrijournal.org    │ Author@123456  │');
  console.log('  └─────────────────────────────────────────────────────┘');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
