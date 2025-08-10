'use client';

import React from 'react';
import Link from 'next/link';

export default function PoliciesPage() {
  // Policies organized by category
  const policiesContent = [
    {
      title: 'Publication Policies',
      items: [
        {
          title: 'Editorial Policy',
          content: `The Pan African Journal Of Social Work And Social Policy is committed to publishing original research that contributes to the advancement of social work practice and policy in Africa. All submissions undergo rigorous peer review to ensure scholarly quality and integrity. The journal prioritizes research that centers African perspectives, promotes Indigenous knowledge systems, and addresses the unique social challenges across the continent.`
        },
        {
          title: 'Open Access Policy',
          content: `The journal operates under an open access model to maximize the visibility and impact of published research. All articles are freely available online, promoting knowledge dissemination across Africa and globally. Authors retain copyright of their work while granting the journal the right to publish and distribute their articles.`
        },
        {
          title: 'Peer Review Policy',
          content: `All submissions undergo double-blind peer review by at least two qualified reviewers. The identity of authors and reviewers is concealed throughout the review process to ensure fair and unbiased evaluation. Reviewers assess submissions for originality, methodological rigor, significance of contribution, and relevance to social work in Africa.`
        }
      ]
    },
    {
      title: 'Author Guidelines',
      items: [
        {
          title: 'Copyright Policy',
          content: `Authors retain copyright of their published articles under a Creative Commons Attribution (CC BY) license. This allows for unrestricted use, distribution, and reproduction in any medium, provided proper attribution is given to the original authors and the journal.`
        },
        {
          title: 'Submission Requirements',
          content: `Manuscripts must be original work not previously published or under consideration elsewhere. Submissions should follow APA format style and include an abstract of 250-300 words. All research involving human participants must comply with ethical standards and include appropriate institutional review board approval.`
        },
        {
          title: 'Conflicts of Interest',
          content: `Authors must disclose any financial or personal relationships that might inappropriately influence their work. Editors and reviewers are required to recuse themselves from handling manuscripts where they have competing interests.`
        }
      ]
    },
    {
      title: 'Ethical Policies',
      items: [
        {
          title: 'Publication Ethics',
          content: `The journal adheres to the Committee on Publication Ethics (COPE) guidelines. We take seriously our responsibility to maintain high standards of ethical conduct throughout the publication process. Plagiarism, data fabrication, and other forms of scholarly misconduct are not tolerated.`
        },
        {
          title: 'Research Ethics',
          content: `All research published in the journal must adhere to established ethical standards for research involving human subjects. Authors must ensure participant confidentiality, informed consent, and respect for vulnerable populations. Research must be conducted with cultural sensitivity and appropriate community engagement.`
        },
        {
          title: 'Corrections and Retractions',
          content: `If significant errors are discovered post-publication, the journal will issue corrections, clarifications, or retractions as appropriate. Authors are encouraged to notify the editorial team if they discover errors in their published work.`
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            {/* African-inspired decorative elements */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent-red rounded-full"></div>
                <div className="w-4 h-4 bg-accent-green rounded-full"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <div className="w-5 h-5 bg-accent-red rounded-full"></div>
                <div className="w-3 h-3 bg-accent-green rounded-full"></div>
                <div className="w-4 h-4 bg-white rounded-full"></div>
                <div className="w-3 h-3 bg-accent-red rounded-full"></div>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4">Journal Policies</h1>
            <p className="text-xl text-neutral-200 max-w-3xl mx-auto">
              Our commitment to ethical publishing, open access, and promoting African knowledge systems
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
          <h2 className="text-lg font-semibold mb-4 text-accent-black">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            {policiesContent.map((category) => (
              <React.Fragment key={category.title}>
                {category.items.map((item) => (
                  <a 
                    key={item.title}
                    href={`#${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center px-3 py-1 bg-neutral-100 hover:bg-accent-green/10 text-neutral-700 hover:text-accent-green border border-neutral-200 rounded-md text-sm transition-colors"
                  >
                    {item.title}
                  </a>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Policy Sections */}
        <div className="space-y-12">
          {policiesContent.map((category) => (
            <section key={category.title} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
              <div className="bg-gradient-to-r from-neutral-900 to-accent-black px-6 py-4">
                <h2 className="text-xl font-bold text-white">{category.title}</h2>
              </div>
              <div className="divide-y divide-neutral-200">
                {category.items.map((item) => (
                  <div 
                    key={item.title} 
                    id={item.title.toLowerCase().replace(/\s+/g, '-')} 
                    className="p-6"
                  >
                    <h3 className="text-lg font-semibold mb-3 text-accent-black">{item.title}</h3>
                    <p className="text-neutral-700 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        
        {/* Additional Info */}
        <div className="mt-12 bg-neutral-100 rounded-lg p-6 border border-neutral-200">
          <h2 className="text-xl font-semibold mb-4 text-accent-black">Additional Information</h2>
          <p className="text-neutral-700 mb-4">
            For questions regarding our policies or to request further clarification, please contact the editorial office.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 bg-accent-green text-white font-medium rounded-md hover:bg-accent-green/80 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-md hover:bg-neutral-200 transition-colors"
            >
              About the Journal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
