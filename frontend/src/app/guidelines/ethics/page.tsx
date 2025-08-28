'use client';

import React from 'react';
import Link from 'next/link';

export default function PublicationEthicsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Publication Ethics</h1>
          <p className="text-xl text-neutral-300">
            Ethical standards and guidelines for the African Journal of Social Work and Social Policy
          </p>
        </div>
      </div>

      {/* Ethics Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          
          {/* Introduction */}
          <div className="bg-accent-green/10 border-l-4 border-accent-green p-6 mb-8">
            <h2 className="text-lg font-semibold text-accent-green mb-3">Our Commitment to Ethical Publishing</h2>
            <p className="text-neutral-700">
              The African Journal of Social Work and Social Policy is committed to the highest standards 
              of publication ethics, ensuring integrity in research while respecting Indigenous African 
              knowledge systems and cultural protocols.
            </p>
          </div>

          {/* Author Responsibilities */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              1. Author Responsibilities
            </h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Originality and Plagiarism</h3>
                <ul className="space-y-2 text-blue-700">
                  <li>• Submit only original work that has not been published elsewhere</li>
                  <li>• Properly cite all sources and acknowledge prior work</li>
                  <li>• Avoid self-plagiarism by clearly indicating previously published work</li>
                  <li>• Respect Indigenous knowledge protocols and attribution practices</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-neutral-800">Authorship Standards</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-accent-green mb-2">Authorship Criteria</h4>
                    <ul className="space-y-1 text-sm text-neutral-700">
                      <li>• Substantial contribution to conception/design</li>
                      <li>• Participation in data collection/analysis</li>
                      <li>• Involvement in manuscript writing/revision</li>
                      <li>• Final approval of submitted version</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-accent-green mb-2">Community Collaboration</h4>
                    <ul className="space-y-1 text-sm text-neutral-700">
                      <li>• Recognition of community contributors</li>
                      <li>• Acknowledgment of traditional knowledge holders</li>
                      <li>• Ethical protocols for community-based research</li>
                      <li>• Benefit-sharing agreements where applicable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Responsibilities */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              2. Editorial Responsibilities
            </h2>
            
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">Decolonial Editorial Practices</h3>
                <p className="text-purple-700 mb-3">
                  Our editorial board is committed to decolonizing academic publishing through inclusive 
                  and culturally responsive practices.
                </p>
                <ul className="space-y-2 text-purple-700 text-sm">
                  <li>• Diverse representation on editorial board</li>
                  <li>• Recognition of multiple ways of knowing</li>
                  <li>• Support for Indigenous research methodologies</li>
                  <li>• Multilingual abstract options where feasible</li>
                </ul>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-neutral-800">Editorial Decision-Making</h3>
                  <ul className="space-y-2 text-neutral-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Fair and unbiased manuscript evaluation
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Decisions based on merit and relevance
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Respect for cultural knowledge systems
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Confidentiality throughout review process
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-neutral-800">Conflict Management</h3>
                  <ul className="space-y-2 text-neutral-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Transparent conflict of interest policies
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Recusal when necessary
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Appeals process for authors
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Allegations investigation procedures
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Research Ethics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              3. Research Ethics Standards
            </h2>
            
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Indigenous Research Ethics</h3>
                <p className="text-green-700 mb-4">
                  Research involving Indigenous communities must follow culturally appropriate ethical frameworks 
                  that go beyond Western IRB protocols.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">Community Protocols</h4>
                    <ul className="space-y-1 text-sm text-green-700">
                      <li>• Community consent and ownership</li>
                      <li>• Cultural protocol adherence</li>
                      <li>• Elder and leader consultation</li>
                      <li>• Traditional governance recognition</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">Knowledge Sharing</h4>
                    <ul className="space-y-1 text-sm text-green-700">
                      <li>• Reciprocal research relationships</li>
                      <li>• Community benefit requirements</li>
                      <li>• Data sovereignty principles</li>
                      <li>• Cultural safety measures</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-neutral-800">Standard Research Ethics</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border border-neutral-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-accent-green mb-3">Human Subjects</h4>
                  <ul className="space-y-1 text-sm text-neutral-700">
                    <li>• IRB approval required</li>
                    <li>• Informed consent documentation</li>
                    <li>• Participant anonymity protection</li>
                    <li>• Risk-benefit assessment</li>
                  </ul>
                </div>
                
                <div className="border border-neutral-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-accent-green mb-3">Data Management</h4>
                  <ul className="space-y-1 text-sm text-neutral-700">
                    <li>• Secure data storage</li>
                    <li>• Retention policies</li>
                    <li>• Sharing agreements</li>
                    <li>• Privacy protection</li>
                  </ul>
                </div>
                
                <div className="border border-neutral-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-accent-green mb-3">Animal Research</h4>
                  <ul className="space-y-1 text-sm text-neutral-700">
                    <li>• Ethics committee approval</li>
                    <li>• Minimization of harm</li>
                    <li>• Replacement alternatives</li>
                    <li>• Refinement of methods</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Publication Misconduct */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              4. Publication Misconduct
            </h2>
            
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Types of Misconduct</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Research Misconduct</h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    <li>• Fabrication of data or results</li>
                    <li>• Falsification of research findings</li>
                    <li>• Plagiarism of text or ideas</li>
                    <li>• Cultural appropriation without permission</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Publication Issues</h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    <li>• Duplicate/multiple submission</li>
                    <li>• Authorship disputes</li>
                    <li>• Failure to disclose conflicts</li>
                    <li>• Reviewer misconduct</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-4 text-neutral-800">Investigation Process</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-neutral-800">Allegation Review</h4>
                  <p className="text-neutral-600 text-sm mt-1">Initial assessment of misconduct allegations by editorial board</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-neutral-800">Investigation</h4>
                  <p className="text-neutral-600 text-sm mt-1">Thorough investigation involving all relevant parties</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-neutral-800">Resolution</h4>
                  <p className="text-neutral-600 text-sm mt-1">Appropriate sanctions including correction, retraction, or editorial action</p>
                </div>
              </div>
            </div>
          </section>

          {/* Open Access Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              5. Open Access & Copyright
            </h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Creative Commons Licensing</h3>
                <p className="text-blue-700 mb-4">
                  All articles are published under <strong>Creative Commons Attribution 4.0 (CC BY 4.0)</strong> 
                  license, promoting maximum access and reuse.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Rights Granted</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Share and redistribute</li>
                      <li>• Adapt and build upon</li>
                      <li>• Commercial use permitted</li>
                      <li>• No additional restrictions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Requirements</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Appropriate attribution</li>
                      <li>• Link to original license</li>
                      <li>• Indicate changes made</li>
                      <li>• Respect cultural protocols</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3 text-neutral-800">Indigenous Knowledge Protection</h3>
                <p className="text-neutral-700 mb-4">
                  While promoting open access, we recognize the need to protect sensitive Indigenous knowledge 
                  and respect cultural protocols around traditional information sharing.
                </p>
                <ul className="space-y-2 text-neutral-700 list-disc pl-6">
                  <li>Community consent for sensitive knowledge publication</li>
                  <li>Recognition of traditional knowledge systems</li>
                  <li>Appropriate attribution to knowledge holders</li>
                  <li>Respect for cultural restrictions on information sharing</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-accent-green to-accent-green/80 text-white p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Questions About Ethics?</h3>
            <p className="mb-6 text-lg">
              Contact our editorial board for guidance on ethical issues or to report concerns.
            </p>
            <div className="space-x-4">
              <Link
                href="/contact"
                className="bg-white text-accent-green px-6 py-3 rounded-lg font-semibold hover:bg-neutral-50 transition-colors inline-block"
              >
                Contact Editors
              </Link>
              <Link
                href="/guidelines/authors"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-accent-green transition-colors inline-block"
              >
                Author Guidelines
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
