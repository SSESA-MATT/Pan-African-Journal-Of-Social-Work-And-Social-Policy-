'use client';

import React from 'react';
import Link from 'next/link';

export default function EditorialGuidelinesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Editorial Guidelines</h1>
          <p className="text-xl text-neutral-300">
            Comprehensive guidelines for editors of the African Journal of Social Work and Social Policy
          </p>
        </div>
      </div>

      {/* Guidelines Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          
          {/* Introduction */}
          <div className="bg-accent-green/10 border-l-4 border-accent-green p-6 mb-8">
            <h2 className="text-lg font-semibold text-accent-green mb-3">Decolonial Editorial Leadership</h2>
            <p className="text-neutral-700">
              As editors of the African Journal of Social Work and Social Policy, we are committed to 
              advancing Indigenous African knowledge systems while maintaining the highest standards of 
              scholarly publishing and ethical practices.
            </p>
          </div>

          {/* Editorial Philosophy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              1. Editorial Philosophy & Vision
            </h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Core Principles</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Decolonial Approach</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Prioritize Indigenous African methodologies</li>
                      <li>• Challenge Western-centric knowledge systems</li>
                      <li>• Amplify marginalized voices and perspectives</li>
                      <li>• Support community-based research approaches</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Scholarly Excellence</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Maintain rigorous peer review standards</li>
                      <li>• Ensure methodological soundness</li>
                      <li>• Promote innovative research approaches</li>
                      <li>• Foster intellectual diversity and debate</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-3">Editorial Objectives</h3>
                <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-neutral-700">
                  <li>Advance Indigenous social work practices</li>
                  <li>Promote Ubuntu philosophy in practice</li>
                  <li>Support community-driven research</li>
                  <li>Foster decolonial methodologies</li>
                  <li>Bridge academic-community knowledge gaps</li>
                  <li>Enhance cultural competency in social work</li>
                  <li>Advocate for social justice and equity</li>
                  <li>Strengthen African social policy frameworks</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Editorial Board Structure */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              2. Editorial Board Structure & Roles
            </h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border border-neutral-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-accent-green mb-4">Editor-in-Chief</h3>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li>• Overall journal leadership and vision</li>
                    <li>• Final editorial decision authority</li>
                    <li>• Strategic planning and policy development</li>
                    <li>• External representation and partnerships</li>
                    <li>• Quality assurance oversight</li>
                  </ul>
                </div>
                
                <div className="border border-neutral-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-accent-green mb-4">Associate Editors</h3>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li>• Manuscript screening and assignment</li>
                    <li>• Reviewer recruitment and management</li>
                    <li>• Editorial decision recommendations</li>
                    <li>• Special issue coordination</li>
                    <li>• Mentoring junior editorial board members</li>
                  </ul>
                </div>
                
                <div className="border border-neutral-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-accent-green mb-4">Editorial Board</h3>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li>• Expert manuscript review</li>
                    <li>• Strategic advice and guidance</li>
                    <li>• Reviewer recommendations</li>
                    <li>• Journal promotion and outreach</li>
                    <li>• Ethical oversight and compliance</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-amber-800 mb-4">Diversity and Representation</h3>
                <p className="text-amber-700 mb-3">
                  Our editorial board reflects the diversity of African social work practice and scholarship.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">Geographic Representation</h4>
                    <ul className="space-y-1 text-amber-700">
                      <li>• All African regions represented</li>
                      <li>• Rural and urban perspectives</li>
                      <li>• Diaspora community inclusion</li>
                      <li>• Global South partnerships</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">Expertise Areas</h4>
                    <ul className="space-y-1 text-amber-700">
                      <li>• Clinical and community practice</li>
                      <li>• Policy analysis and development</li>
                      <li>• Research methodologies</li>
                      <li>• Traditional healing systems</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Decision-Making */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              3. Editorial Decision-Making Process
            </h2>
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-neutral-800">Manuscript Evaluation Criteria</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-accent-green mb-3">Primary Criteria</h4>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-800 mb-2">Cultural Relevance</h5>
                      <ul className="space-y-1 text-sm text-green-700">
                        <li>• Alignment with African contexts</li>
                        <li>• Respect for Indigenous knowledge</li>
                        <li>• Cultural sensitivity and appropriateness</li>
                        <li>• Community relevance and impact</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-2">Scholarly Quality</h5>
                      <ul className="space-y-1 text-sm text-blue-700">
                        <li>• Methodological rigor</li>
                        <li>• Original contribution to knowledge</li>
                        <li>• Literature review comprehensiveness</li>
                        <li>• Clear argumentation and analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-accent-green mb-3">Secondary Criteria</h4>
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-purple-800 mb-2">Innovation & Impact</h5>
                      <ul className="space-y-1 text-sm text-purple-700">
                        <li>• Novel approaches or insights</li>
                        <li>• Potential for practice improvement</li>
                        <li>• Policy implications</li>
                        <li>• Community empowerment potential</li>
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-orange-800 mb-2">Presentation Quality</h5>
                      <ul className="space-y-1 text-sm text-orange-700">
                        <li>• Clear and accessible writing</li>
                        <li>• Appropriate structure and format</li>
                        <li>• Ethical compliance</li>
                        <li>• Complete documentation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-neutral-800">Decision Categories</h3>
                <div className="grid md:grid-cols-5 gap-4 text-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">A</div>
                    <h4 className="font-semibold text-green-800 text-sm">Accept</h4>
                    <p className="text-xs text-green-700 mt-1">Ready for publication</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">MR</div>
                    <h4 className="font-semibold text-blue-800 text-sm">Minor Revisions</h4>
                    <p className="text-xs text-blue-700 mt-1">Small changes needed</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">MR</div>
                    <h4 className="font-semibold text-yellow-800 text-sm">Major Revisions</h4>
                    <p className="text-xs text-yellow-700 mt-1">Significant changes required</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">R&R</div>
                    <h4 className="font-semibold text-orange-800 text-sm">Reject & Resubmit</h4>
                    <p className="text-xs text-orange-700 mt-1">Substantial revision needed</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">R</div>
                    <h4 className="font-semibold text-red-800 text-sm">Reject</h4>
                    <p className="text-xs text-red-700 mt-1">Not suitable for journal</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Ethics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              4. Editorial Ethics & Standards
            </h2>
            
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-4">Conflict of Interest Management</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Declaration Requirements</h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      <li>• Financial relationships with authors</li>
                      <li>• Personal or professional connections</li>
                      <li>• Institutional affiliations</li>
                      <li>• Research collaboration history</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Management Strategies</h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      <li>• Recusal from decision-making</li>
                      <li>• Alternative editor assignment</li>
                      <li>• Transparent disclosure processes</li>
                      <li>• Independent reviewer selection</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Cultural and Ethical Considerations</h3>
                <div className="space-y-4">
                  <div className="border border-neutral-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-accent-green mb-2">Indigenous Knowledge Protection</h4>
                    <p className="text-neutral-700 text-sm mb-2">
                      Editors must ensure proper protocols are followed when manuscripts involve Indigenous knowledge systems.
                    </p>
                    <ul className="space-y-1 text-sm text-neutral-700 list-disc pl-4">
                      <li>Verify community consent and approval</li>
                      <li>Ensure appropriate attribution to knowledge holders</li>
                      <li>Respect cultural restrictions on information sharing</li>
                      <li>Consider benefit-sharing arrangements</li>
                    </ul>
                  </div>
                  
                  <div className="border border-neutral-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-accent-green mb-2">Decolonial Review Practices</h4>
                    <ul className="space-y-1 text-sm text-neutral-700 list-disc pl-4">
                      <li>Challenge Western-centric evaluation criteria</li>
                      <li>Recognize diverse ways of knowing and being</li>
                      <li>Value community knowledge and wisdom</li>
                      <li>Support methodological innovation and flexibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Workflow */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              5. Editorial Workflow & Timeline
            </h2>
            
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-800 mb-4">Standard Review Timeline</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">1-2</div>
                      <h4 className="font-semibold text-indigo-800 text-sm">Initial Screening</h4>
                      <p className="text-xs text-indigo-700 mt-1">Weeks</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">2-3</div>
                      <h4 className="font-semibold text-indigo-800 text-sm">Reviewer Assignment</h4>
                      <p className="text-xs text-indigo-700 mt-1">Weeks</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">6-8</div>
                      <h4 className="font-semibold text-indigo-800 text-sm">Peer Review</h4>
                      <p className="text-xs text-indigo-700 mt-1">Weeks</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">1-2</div>
                      <h4 className="font-semibold text-indigo-800 text-sm">Editorial Decision</h4>
                      <p className="text-xs text-indigo-700 mt-1">Weeks</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Editorial Responsibilities by Phase</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-accent-green mb-3">Pre-Review Phase</h4>
                      <ul className="space-y-2 text-sm text-neutral-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Acknowledge manuscript receipt
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Conduct initial scope and quality screening
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Check ethical compliance documentation
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Identify and recruit suitable reviewers
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-accent-green mb-3">Review Management</h4>
                      <ul className="space-y-2 text-sm text-neutral-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Monitor review progress and deadlines
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Send reminder communications
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Recruit replacement reviewers if needed
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Synthesize reviewer feedback
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Decision Communication</h4>
                    <p className="text-sm text-green-700 mb-3">
                      All editorial decisions must be clearly communicated with constructive feedback and specific guidance for authors.
                    </p>
                    <ul className="space-y-1 text-sm text-green-700 list-disc pl-4">
                      <li>Provide detailed decision rationale</li>
                      <li>Include specific revision guidance</li>
                      <li>Maintain respectful and supportive tone</li>
                      <li>Acknowledge cultural and methodological contributions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Special Considerations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              6. Special Editorial Considerations
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Community-Based Research</h3>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li>• Verify community partnership and consent</li>
                    <li>• Ensure equitable benefit-sharing</li>
                    <li>• Respect traditional decision-making processes</li>
                    <li>• Consider community ownership of findings</li>
                    <li>• Evaluate cultural appropriateness of dissemination</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Multilingual Considerations</h3>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Support for indigenous language abstracts</li>
                    <li>• Cultural translation accuracy</li>
                    <li>• Concept equivalence across languages</li>
                    <li>• Respect for untranslatable concepts</li>
                    <li>• Indigenous language preservation efforts</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-purple-50 border border-purple-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">Mentorship and Capacity Building</h3>
              <p className="text-purple-700 mb-4">
                Editors play a crucial role in developing emerging scholars and supporting capacity building 
                in African social work research.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Early Career Support</h4>
                  <ul className="space-y-1 text-purple-700">
                    <li>• Constructive feedback for new researchers</li>
                    <li>• Writing and methodology guidance</li>
                    <li>• Research collaboration opportunities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Institutional Development</h4>
                  <ul className="space-y-1 text-purple-700">
                    <li>• Support for emerging institutions</li>
                    <li>• Research capacity building initiatives</li>
                    <li>• Partnership facilitation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Knowledge Exchange</h4>
                  <ul className="space-y-1 text-purple-700">
                    <li>• Practitioner-academic collaboration</li>
                    <li>• Community knowledge integration</li>
                    <li>• Cross-cultural learning opportunities</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-accent-green to-accent-green/80 text-white p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Join Our Editorial Community</h3>
            <p className="mb-6 text-lg">
              Be part of advancing Indigenous African knowledge in social work through ethical and innovative editorial leadership.
            </p>
            <div className="space-x-4">
              <Link
                href="/contact"
                className="bg-white text-accent-green px-6 py-3 rounded-lg font-semibold hover:bg-neutral-50 transition-colors inline-block"
              >
                Contact Editorial Team
              </Link>
              <Link
                href="/about#editorial-board"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-accent-green transition-colors inline-block"
              >
                Editorial Board
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
