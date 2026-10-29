import type { ScopePreset } from '../types';

const tp2Source = {
  filename: '01_VWG_TeamPlate_2_Estimate_082126_Signed.pdf',
  location: 'SOW §§1–5; Agreement §§2–4',
  status: 'Client-signed, negotiated project reference; not a universal terms master.',
};

const customSource = {
  filename: '02_New_Harbor_Custom_Website_Estimate_011426.pdf',
  location: 'SOW §C; Project Services and Fees; Notes §§1–4',
  status: 'Project-specific estimate with blank acceptance lines.',
};

const updatesSource = {
  filename: '03_Wakefield_Website_Updates_SOW_102826.docx',
  location: 'SOW §§1–8',
  status: 'Generated SOW; not executed and not a controlling terms master.',
};

export const SCOPE_PRESETS: ScopePreset[] = [
  {
    id: 'teamplate-2',
    name: 'TeamPlate 2 website',
    summary: 'Platform-based WordPress engagement using the established TeamPlate 2 framework.',
    source: tp2Source,
    provisional: true,
    overview:
      'MVP will configure, design, and develop a responsive TeamPlate 2 WordPress website using the approved platform framework and project-specific scope confirmed below.',
    objectives:
      'Clarify the client value proposition\nCreate a distinctive, easy-to-use web experience\nSupport priority audiences and calls to action',
    responsibilities:
      'Client will supply final copy, imagery, video, PDFs, access credentials, and consolidated approvals according to the agreed schedule.',
    assumptions:
      'The engagement is platform-based rather than fully custom. Features that materially depart from the established TeamPlate 2 framework require separate scoping and written authorization.',
    exclusions:
      'Custom integrations, extensive image retouching, copywriting, new functionality, third-party licenses, and services not explicitly listed are excluded.',
    timeline:
      '[REVIEW REQUIRED: Confirm relative phase timing or target dates.]',
    lines: [
      { phase: 'Project brief and sitemap', discipline: 'design', description: 'Needs analysis, project brief, sitemap, and feature confirmation.', hours: 0, rateOverrideCents: null, optional: false, selected: true },
      { phase: 'Homepage and style guide', discipline: 'design', description: 'Desktop homepage concept and visual style guide within the TeamPlate 2 framework.', hours: 0, rateOverrideCents: null, optional: false, selected: true },
      { phase: 'Development and testing', discipline: 'development', description: 'Responsive WordPress implementation, QA, analytics setup, and launch support.', hours: 0, rateOverrideCents: null, optional: false, selected: true },
      { phase: 'Content entry', discipline: 'other', description: 'Entry of approved client-supplied content within the stated allowance.', hours: 0, rateOverrideCents: null, optional: true, selected: false },
      { phase: 'Project management', discipline: 'project-management', description: 'Coordination, client communication, proofing, meetings, and approvals.', hours: 0, rateOverrideCents: null, optional: false, selected: true },
    ],
    practices: [
      { label: 'Wireframes and separate secondary-page design presentations are excluded.', included: false, confirmed: false, source: { ...tp2Source, location: 'SOW §1.B.4 and START_HERE interpretation notes' } },
      { label: 'A 20-hour tweak allowance is included.', included: false, confirmed: false, source: { filename: 'START_HERE.txt', location: 'Known MVP practices', status: 'Practice to verify; not universal.' } },
      { label: 'Homepage and style-guide revisions are included as stated in the project terms.', included: true, confirmed: false, source: { ...tp2Source, location: 'SOW §1.B.4' } },
      { label: 'Hosting is included or required.', included: false, confirmed: false, source: { ...tp2Source, location: 'SOW §2' } },
      { label: 'CMS training is included.', included: false, confirmed: false, source: { ...tp2Source, location: 'SOW §1.B.5 and Agreement §3' } },
    ],
  },
  {
    id: 'custom-website',
    name: 'Custom website',
    summary: 'Custom WordPress discovery, UX, design, development, content, and launch engagement.',
    source: customSource,
    provisional: true,
    overview:
      'MVP will plan, design, and develop a custom responsive WordPress website based on the objectives, audiences, content inventory, and functionality confirmed during discovery.',
    objectives:
      'Modernize the client web presence\nImprove information architecture and responsive usability\nSupport measurable calls to action and foundational SEO',
    responsibilities:
      'Client will provide timely access, source content, brand assets, consolidated feedback, milestone approvals, and final proofing.',
    assumptions:
      'Final page count, content volume, integrations, and functionality will be confirmed through discovery, the project brief, sitemap, and wireframes.',
    exclusions:
      'Unlisted integrations, data migration, ongoing SEO programs, third-party subscriptions, stock assets, and out-of-scope content services are excluded unless selected.',
    timeline:
      '[REVIEW REQUIRED: Confirm discovery, design, development, client QA, and launch timing.]',
    lines: [
      { phase: 'Research and discovery', discipline: 'design', description: 'Needs analysis, project brief, content inventory, and sitemap.', hours: 0, rateOverrideCents: null, optional: false, selected: true },
      { phase: 'UX and visual design', discipline: 'design', description: 'Desktop wireframes plus responsive homepage and key secondary-page designs.', hours: 0, rateOverrideCents: null, optional: false, selected: true },
      { phase: 'Development and testing', discipline: 'development', description: 'Custom responsive WordPress build, QA, foundational SEO, and launch support.', hours: 0, rateOverrideCents: null, optional: false, selected: true },
      { phase: 'Content entry', discipline: 'other', description: 'Entry of approved client content within the selected allowance.', hours: 0, rateOverrideCents: null, optional: true, selected: false },
      { phase: 'Project management', discipline: 'project-management', description: 'Project coordination, art direction, meetings, proofing, and approvals.', hours: 0, rateOverrideCents: null, optional: false, selected: true },
    ],
    practices: [
      { label: 'Desktop wireframes are included.', included: true, confirmed: false, source: { ...customSource, location: 'SOW §C.2' } },
      { label: 'Separate secondary-page desktop and mobile designs are included.', included: true, confirmed: false, source: { ...customSource, location: 'SOW §C.3' } },
      { label: 'Content entry is limited to the stated hour allowance.', included: false, confirmed: false, source: { ...customSource, location: 'SOW §C.4 and fee table' } },
      { label: 'Hosting is included or required.', included: false, confirmed: false, source: { ...customSource, location: 'Hosting section and fee table' } },
      { label: 'CMS training is included.', included: false, confirmed: false, source: { ...customSource, location: 'SOW §C.7 and Services §3' } },
    ],
  },
  {
    id: 'website-updates',
    name: 'Existing website updates',
    summary: 'Focused design, development, content, and deployment work in an existing site.',
    source: updatesSource,
    provisional: true,
    overview:
      'MVP will complete the approved updates within the existing website framework using the confirmed content, functionality, and deployment requirements below.',
    objectives:
      'Implement the approved website updates\nPreserve the existing framework unless expressly changed\nTest, review, and deploy approved work',
    responsibilities:
      'Client will supply final content, assets, placement instructions, access, consolidated feedback, and written deployment approval.',
    assumptions:
      'The scope is based on the confirmed asset inventory and written instructions. Replacement assets or changed requirements may require a supplemental estimate.',
    exclusions:
      'Broader redesign, new functionality, copywriting, production, subscriptions, maintenance, and services outside the confirmed update list are excluded.',
    timeline:
      '[REVIEW REQUIRED: Confirm implementation timing after materials and approvals are available.]',
    lines: [
      { phase: 'Discovery and reconciliation', discipline: 'other', description: 'Reconcile supplied materials, instructions, access, and implementation requirements.', hours: 0, rateOverrideCents: null, optional: false, selected: true },
      { phase: 'Design', discipline: 'design', description: 'Design the approved desktop and mobile updates within the existing visual system.', hours: 0, rateOverrideCents: null, optional: false, selected: true },
      { phase: 'Development and content entry', discipline: 'development', description: 'Implement, test, review, and deploy approved updates.', hours: 0, rateOverrideCents: null, optional: false, selected: true },
      { phase: 'Project management', discipline: 'project-management', description: 'Coordinate tasks, communication, proofing, approvals, and deployment.', hours: 0, rateOverrideCents: null, optional: false, selected: true },
    ],
    practices: [
      { label: 'Design and development are covered by a confirmed variance provision.', included: false, confirmed: false, source: { ...updatesSource, location: 'SOW §4' } },
      { label: 'Project management is billed on actual time, irrespective of variance.', included: false, confirmed: false, source: { ...updatesSource, location: 'SOW §§1 and 4' } },
      { label: 'Hosting or maintenance is included.', included: false, confirmed: false, source: { ...updatesSource, location: 'SOW §8' } },
      { label: 'Training is included.', included: false, confirmed: false, source: { ...updatesSource, location: 'No default inclusion identified' } },
    ],
  },
];

export function getPreset(id: ScopePreset['id']): ScopePreset {
  return SCOPE_PRESETS.find((preset) => preset.id === id) ?? SCOPE_PRESETS[0];
}
