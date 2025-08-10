'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const editorialBoard = [
    {
      name: "Dr. Amina Kone",
      title: "Editor-in-Chief",
      affiliation: "University of Ghana, School of Social Work",
      bio: "Dr. Kone is a leading expert in Indigenous African social work methodologies with over 20 years of experience in community-based practice.",
      image: "/images/editorial-board/amina-kone.jpg" // Placeholder
    },
    {
      name: "Prof. Kwame Asante",
      title: "Associate Editor",
      affiliation: "Makerere University, Department of Social Work and Social Administration",
      bio: "Prof. Asante specializes in decolonial social work theory and has published extensively on African-centered practice models.",
      image: "/images/editorial-board/kwame-asante.jpg" // Placeholder
    },
    {
      name: "Dr. Fatima Al-Rashid",
      title: "Associate Editor",
      affiliation: "Cairo University, Faculty of Social Work",
      bio: "Dr. Al-Rashid focuses on social policy development in North Africa and community empowerment strategies.",
      image: "/images/editorial-board/fatima-al-rashid.jpg" // Placeholder
    },
    {
      name: "Dr. Nomsa Mbeki",
      title: "Managing Editor",
      affiliation: "University of Cape Town, Department of Social Development",
      bio: "Dr. Mbeki brings expertise in research methodology and has extensive experience in peer review processes.",
      image: "/images/editorial-board/nomsa-mbeki.jpg" // Placeholder
    },
    {
      name: "Prof. Ibrahim Diallo",
      title: "Editorial Board Member",
      affiliation: "Cheikh Anta Diop University, School of Social Sciences",
      bio: "Prof. Diallo is renowned for his work on traditional healing practices and their integration with modern social work.",
      image: "/images/editorial-board/ibrahim-diallo.jpg" // Placeholder
    },
    {
      name: "Dr. Grace Wanjiku",
      title: "Editorial Board Member",
      affiliation: "Kenyatta University, Department of Community Development",
      bio: "Dr. Wanjiku specializes in gender studies and women's empowerment within African social work contexts.",
      image: "/images/editorial-board/grace-wanjiku.jpg" // Placeholder
    }
  ];

  const partnerInstitutions = [
    {
      name: "East Africa Social Work Regional Resource Centre (EASWRRC)",
      description: "Our founding partner organization dedicated to advancing social work education and practice across East Africa.",
      website: "https://easwrrc.org"
    },
    {
      name: "Association of Schools of Social Work in Africa (ASSWA)",
      description: "Continental network promoting excellence in social work education and research.",
      website: "https://asswa-africa.org"
    },
    {
      name: "International Federation of Social Workers (IFSW) Africa Region",
      description: "Regional body advocating for social work profession and social justice across Africa.",
      website: "https://ifsw.org/africa"
    },
    {
      name: "African Union Commission on Social Affairs",
      description: "Policy development partner supporting social development initiatives across the continent.",
      website: "https://au.int"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            {/* African-inspired decorative elements */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-accent-red rounded-full"></div>
                <div className="w-6 h-6 bg-accent-green rounded-full"></div>
                <div className="w-4 h-4 bg-white rounded-full"></div>
                <div className="w-8 h-8 bg-accent-red rounded-full"></div>
                <div className="w-4 h-4 bg-accent-green rounded-full"></div>
                <div className="w-6 h-6 bg-white rounded-full"></div>
                <div className="w-4 h-4 bg-accent-red rounded-full"></div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              About Our
              <span className="block text-accent-green">Journal</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-200 mb-8 max-w-4xl mx-auto leading-relaxed">
              Advancing social work practice and policy through Indigenous African knowledge systems and decolonial methodologies
            </p>

            {/* African-inspired decorative pattern */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-red rounded-full"></div>
                <div className="w-3 h-3 bg-accent-green rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-4 h-4 bg-accent-red rounded-full"></div>
                <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-accent-red rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Statement */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-accent-green p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent-black mb-6 text-center">
              Our Mission
            </h2>
            <div className="prose prose-lg max-w-none text-center">
              <p className="text-xl text-neutral-700 leading-relaxed mb-6">
                The Africa Journal of Social Work and Social Policy serves as a premier platform for scholarly discourse 
                that promotes Indigenous African knowledge systems, decolonial social work methodologies, and community-centered 
                research addressing the unique challenges and opportunities across the African continent.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                We are committed to fostering academic excellence while ensuring that research remains grounded in 
                African realities, values, and aspirations. Our journal bridges the gap between traditional wisdom 
                and contemporary social work practice, creating space for voices that have been historically marginalized 
                in academic discourse.
              </p>
            </div>
          </div>
        </div>

        {/* Vision and Values */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-accent-red p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-accent-black">Our Vision</h3>
            </div>
            <p className="text-neutral-700 leading-relaxed">
              To be the leading scholarly journal that amplifies African voices in social work, promotes culturally 
              relevant practice models, and contributes to the global understanding of social work through an African lens. 
              We envision a future where African social work knowledge systems are recognized, respected, and integrated 
              into global practice.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border-l-4 border-accent-green p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-accent-black">Our Values</h3>
            </div>
            <ul className="text-neutral-700 leading-relaxed space-y-2">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Ubuntu:</strong> Recognizing our interconnectedness and shared humanity</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Cultural Authenticity:</strong> Honoring Indigenous knowledge and practices</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Social Justice:</strong> Advocating for equity and human rights</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Academic Excellence:</strong> Maintaining rigorous scholarly standards</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Editorial Board */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent-black mb-4">
              Editorial Board
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              Our distinguished editorial board comprises leading scholars and practitioners from across Africa, 
              bringing diverse expertise and perspectives to ensure the highest quality of published research.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {editorialBoard.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-br from-accent-green to-accent-green/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-accent-black mb-2">{member.name}</h3>
                <p className="text-accent-red font-semibold mb-2">{member.title}</p>
                <p className="text-sm text-neutral-600 mb-4">{member.affiliation}</p>
                <p className="text-sm text-neutral-700 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Institutions */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent-black mb-4">
              Partner Institutions
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              We collaborate with leading organizations across Africa and globally to advance social work 
              education, research, and practice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {partnerInstitutions.map((partner, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-accent-black mb-3">{partner.name}</h3>
                <p className="text-neutral-700 mb-4 leading-relaxed">{partner.description}</p>
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent-green hover:text-accent-green/80 font-semibold transition-colors"
                >
                  Visit Website
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Scope and Focus */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black rounded-lg p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Scope and Focus
              </h2>
              <p className="text-xl text-neutral-200 max-w-3xl mx-auto">
                Our journal welcomes research across diverse areas of social work practice and policy
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Indigenous Knowledge Systems",
                  description: "Traditional healing, community practices, and cultural approaches to social work"
                },
                {
                  title: "Decolonial Methodologies",
                  description: "Research methods that challenge Western-centric approaches and center African perspectives"
                },
                {
                  title: "Community Development",
                  description: "Grassroots initiatives, participatory approaches, and community empowerment strategies"
                },
                {
                  title: "Social Policy Analysis",
                  description: "Policy development, implementation, and evaluation from African contexts"
                },
                {
                  title: "Child and Family Welfare",
                  description: "Culturally appropriate interventions for children, families, and communities"
                },
                {
                  title: "Mental Health and Wellbeing",
                  description: "Holistic approaches integrating traditional and contemporary mental health practices"
                }
              ].map((area, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white mb-3">{area.title}</h3>
                  <p className="text-neutral-200 text-sm leading-relaxed">{area.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-accent-black mb-6">
              Join Our Community
            </h2>
            <p className="text-lg text-neutral-600 mb-8 max-w-3xl mx-auto">
              Whether you're a researcher, practitioner, student, or policy maker, we invite you to be part of 
              our mission to advance social work in Africa through scholarly excellence and cultural authenticity.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-4 bg-accent-red text-white font-semibold rounded-lg hover:bg-accent-red/80 transition-colors"
              >
                Submit Your Research
              </Link>
              <Link
                href="/articles"
                className="inline-flex items-center px-8 py-4 bg-accent-green text-white font-semibold rounded-lg hover:bg-accent-green/80 transition-colors"
              >
                Browse Publications
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-accent-black text-accent-black font-semibold rounded-lg hover:bg-accent-black hover:text-white transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}