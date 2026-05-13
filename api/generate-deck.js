// ============================================
// Vercel API: Generate Kickoff Deck (PPTX)
// ============================================

let PptxGenJS;
try {
  PptxGenJS = require('pptxgenjs');
} catch (e) {
  console.error('Failed to load pptxgenjs:', e.message);
}

// ── Color Palette ──
const C = {
  navy:    '1B2D5B',
  blue:    '2563EB',
  light:   'CADCFC',
  white:   'FFFFFF',
  gray:    'F8FAFC',
  text:    '1E293B',
  muted:   '64748B',
  success: '059669',
  warning: 'D97706',
  danger:  'DC2626',
};

const phaseColors = ['2563EB', '7C3AED', '059669', 'D97706', 'DC2626', '0891B2'];
const makeShadow = () => ({ type: 'outer', blur: 8, offset: 3, angle: 135, color: '000000', opacity: 0.12 });

function sectionTitle(slide, title, subtitle) {
  slide.addShape('rect', { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.blue } });
  slide.addText(title, { x: 0.4, y: 0.3, w: 9.2, h: 0.65, fontSize: 26, bold: true, color: C.navy, fontFace: 'Calibri', margin: 0 });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.4, y: 0.9, w: 9.2, h: 0.35, fontSize: 12, color: C.muted, fontFace: 'Calibri', margin: 0 });
  }
}

function addNavBar(slide, current) {
  const sections = ['Client', 'Solution', 'Scope', 'Phases', 'Timeline', 'Team', 'Risks', 'Next'];
  slide.addShape('rect', { x: 0, y: 5.25, w: 10, h: 0.375, fill: { color: C.navy } });
  sections.forEach((s, i) => {
    slide.addText(s, {
      x: 0.2 + i * 1.22, y: 5.27, w: 1.15, h: 0.33,
      fontSize: 6.5, color: s === current ? C.light : 'FFFFFF',
      bold: s === current, align: 'center', fontFace: 'Calibri', margin: 0
    });
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!PptxGenJS) {
      return res.status(500).json({ error: 'pptxgenjs not loaded - check Vercel dependencies' });
    }

    const { clientIntelligence: ci, solutionContext: sc, scopeAnalysis: sa, implementationPlan: ip } = req.body;

    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_16x9';
    pres.author = sc?.solution_name || 'Vendor';
    pres.title = `${ci?.company_name || 'Client'} — Implementation Kickoff`;

    // ════ SLIDE 1: TITLE ════
    const s1 = pres.addSlide();
    s1.background = { color: C.navy };
    s1.addShape('rect', { x: 0, y: 0, w: 3.8, h: 5.625, fill: { color: C.blue } });
    s1.addShape('oval', { x: -0.8, y: 4.0, w: 3.0, h: 3.0, fill: { color: C.light, transparency: 80 }, line: { color: C.light, transparency: 80 } });
    s1.addShape('oval', { x: 2.5, y: -0.8, w: 2.0, h: 2.0, fill: { color: C.white, transparency: 85 }, line: { color: C.white, transparency: 85 } });
    s1.addText(sc?.solution_name || 'Implementation', { x: 0.2, y: 0.4, w: 3.4, h: 0.45, fontSize: 13, color: C.white, bold: true, fontFace: 'Calibri', align: 'center', margin: 0 });
    s1.addText('for', { x: 0.2, y: 0.9, w: 3.4, h: 0.3, fontSize: 11, color: C.light, fontFace: 'Calibri', align: 'center', margin: 0 });
    s1.addText(ci?.company_name || 'Client', { x: 0.2, y: 1.25, w: 3.4, h: 0.5, fontSize: 16, color: C.white, bold: true, fontFace: 'Calibri', align: 'center', margin: 0 });
    s1.addText('Implementation\nKickoff', { x: 4.1, y: 1.2, w: 5.5, h: 1.8, fontSize: 40, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    s1.addShape('rect', { x: 4.1, y: 3.1, w: 5.4, h: 0.03, fill: { color: C.light, transparency: 50 } });
    s1.addText(`${sa?.timeline?.contract_start || 'Q2 2026'}  ·  ${ci?.overview?.headquarters || 'Global'}`, {
      x: 4.1, y: 3.25, w: 5.4, h: 0.3, fontSize: 12, color: C.light, fontFace: 'Calibri', margin: 0
    });
    s1.addText('CONFIDENTIAL', { x: 4.1, y: 5.1, w: 5.4, h: 0.3, fontSize: 8, color: C.light, fontFace: 'Calibri', align: 'right', margin: 0 });

    // ════ SLIDE 2: CLIENT OVERVIEW ════
    const s2 = pres.addSlide();
    s2.background = { color: C.gray };
    sectionTitle(s2, `About ${ci?.company_name || 'Client'}`, 'Our understanding of your business and operating context');
    addNavBar(s2, 'Client');
    s2.addShape('rect', { x: 0.4, y: 1.45, w: 5.2, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
    s2.addText(ci?.overview?.description || 'Company overview.', { x: 0.6, y: 1.6, w: 4.9, h: 0.9, fontSize: 10, color: C.text, fontFace: 'Calibri' });
    s2.addShape('rect', { x: 0.6, y: 2.55, w: 4.8, h: 0.02, fill: { color: C.light } });
    const facts = [
      ['Industry', ci?.market_position?.industry || '—'],
      ['Headquarters', ci?.overview?.headquarters || '—'],
      ['Company Size', ci?.overview?.size || '—'],
      ['Market', ci?.market_position?.market_segment || '—'],
      ['Compliance', ci?.regulatory_environment?.compliance_complexity + ' Complexity' || '—'],
    ];
    facts.forEach(([label, value], i) => {
      s2.addText(label + ':', { x: 0.6, y: 2.65 + i * 0.46, w: 1.6, h: 0.38, fontSize: 9, color: C.muted, fontFace: 'Calibri', bold: true, margin: 0 });
      s2.addText(value, { x: 2.2, y: 2.65 + i * 0.46, w: 3.2, h: 0.38, fontSize: 9, color: C.text, fontFace: 'Calibri', margin: 0 });
    });
    s2.addShape('rect', { x: 5.9, y: 1.45, w: 3.7, h: 3.6, fill: { color: C.navy } });
    s2.addText('Key Implementation Signals', { x: 6.1, y: 1.6, w: 3.3, h: 0.35, fontSize: 10, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    const signals = [
      `Digital Maturity: ${ci?.technology_signals?.digital_maturity || 'Medium'}`,
      `Impl. Complexity: ${ci?.implementation_considerations?.complexity || 'Medium'}`,
      ...(ci?.implementation_considerations?.key_opportunities || []).slice(0, 2),
      ...(ci?.implementation_considerations?.key_risks || []).slice(0, 1),
    ];
    signals.slice(0, 5).forEach((sig, i) => {
      s2.addText('→  ' + sig, { x: 6.1, y: 2.1 + i * 0.55, w: 3.3, h: 0.45, fontSize: 9, color: C.light, fontFace: 'Calibri', margin: 0 });
    });

    // ════ SLIDE 3: SOLUTION FIT ════
    const s3 = pres.addSlide();
    s3.background = { color: C.gray };
    sectionTitle(s3, 'Solution Overview', `${sc?.solution_name || 'Solution'} — built for your needs`);
    addNavBar(s3, 'Solution');
    s3.addShape('rect', { x: 0.4, y: 1.45, w: 2.3, h: 3.6, fill: { color: C.navy } });
    s3.addText(sc?.fit_assessment?.fit_score || '8', { x: 0.4, y: 2.0, w: 2.3, h: 1.0, fontSize: 52, bold: true, color: C.white, align: 'center', fontFace: 'Calibri', margin: 0 });
    s3.addText('/10  Fit Score', { x: 0.4, y: 3.05, w: 2.3, h: 0.35, fontSize: 10, color: C.light, align: 'center', fontFace: 'Calibri', margin: 0 });
    s3.addText(sc?.fit_assessment?.overall_fit || 'Strong', { x: 0.4, y: 3.5, w: 2.3, h: 0.35, fontSize: 14, bold: true, color: C.light, align: 'center', fontFace: 'Calibri', margin: 0 });
    s3.addText('Key Value Drivers', { x: 3.0, y: 1.45, w: 6.6, h: 0.3, fontSize: 11, bold: true, color: C.navy, fontFace: 'Calibri', margin: 0 });
    (sc?.fit_assessment?.key_value_drivers || []).slice(0, 3).forEach((d, i) => {
      s3.addShape('rect', { x: 3.0, y: 1.85 + i * 0.8, w: 6.6, h: 0.68, fill: { color: C.white }, shadow: makeShadow() });
      s3.addShape('rect', { x: 3.0, y: 1.85 + i * 0.8, w: 0.06, h: 0.68, fill: { color: C.blue } });
      s3.addText(d, { x: 3.15, y: 1.9 + i * 0.8, w: 6.3, h: 0.55, fontSize: 10, color: C.text, fontFace: 'Calibri' });
    });
    const modules = (sc?.relevant_modules || []).filter(m => m.priority === 'Must Have').slice(0, 4);
    if (modules.length > 0) {
      s3.addText('Must-Have Modules', { x: 3.0, y: 4.35, w: 6.6, h: 0.25, fontSize: 9, bold: true, color: C.muted, fontFace: 'Calibri', margin: 0 });
      modules.forEach((m, i) => {
        s3.addShape('rect', { x: 3.0 + i * 1.7, y: 4.65, w: 1.55, h: 0.32, fill: { color: C.blue, transparency: 85 }, line: { color: C.blue, width: 0.5 } });
        s3.addText(m.name, { x: 3.0 + i * 1.7, y: 4.65, w: 1.55, h: 0.32, fontSize: 8, color: C.blue, align: 'center', fontFace: 'Calibri', bold: true, margin: 0 });
      });
    }

    // ════ SLIDE 4: SCOPE ════
    const s4 = pres.addSlide();
    s4.background = { color: C.gray };
    sectionTitle(s4, 'Project Scope', sa?.project_overview?.summary || 'What we are delivering together');
    addNavBar(s4, 'Scope');
    s4.addShape('rect', { x: 0.4, y: 1.45, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
    s4.addText('✅  In Scope', { x: 0.6, y: 1.6, w: 4.0, h: 0.3, fontSize: 11, bold: true, color: C.success, fontFace: 'Calibri', margin: 0 });
    (sa?.scope?.in_scope || []).slice(0, 7).forEach((item, i) => {
      s4.addText('•  ' + item, { x: 0.6, y: 2.0 + i * 0.42, w: 4.0, h: 0.38, fontSize: 9, color: C.text, fontFace: 'Calibri', margin: 0 });
    });
    s4.addShape('rect', { x: 5.2, y: 1.45, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
    s4.addText('❌  Out of Scope', { x: 5.4, y: 1.6, w: 4.0, h: 0.3, fontSize: 11, bold: true, color: C.danger, fontFace: 'Calibri', margin: 0 });
    (sa?.scope?.out_of_scope || []).slice(0, 7).forEach((item, i) => {
      s4.addText('•  ' + item, { x: 5.4, y: 2.0 + i * 0.42, w: 4.0, h: 0.38, fontSize: 9, color: C.text, fontFace: 'Calibri', margin: 0 });
    });

    // ════ SLIDE 5: PHASES ════
    const s5 = pres.addSlide();
    s5.background = { color: C.gray };
    sectionTitle(s5, 'Implementation Approach', `${ip?.project_summary?.methodology || 'Phased'} · ${ip?.project_summary?.total_duration || '12 weeks'}`);
    addNavBar(s5, 'Phases');
    const phases = (ip?.phases || []).slice(0, 5);
    const phW = phases.length > 0 ? (9.2 / phases.length) - 0.1 : 1.8;
    phases.forEach((phase, i) => {
      const x = 0.4 + i * (phW + 0.1);
      const col = phaseColors[i % phaseColors.length];
      s5.addShape('rect', { x, y: 1.45, w: phW, h: 0.5, fill: { color: col } });
      s5.addText(`Phase ${phase.phase_number}`, { x, y: 1.47, w: phW, h: 0.24, fontSize: 8, color: C.white, align: 'center', fontFace: 'Calibri', bold: true, margin: 0 });
      s5.addText(phase.duration || '', { x, y: 1.72, w: phW, h: 0.22, fontSize: 7.5, color: C.white, align: 'center', fontFace: 'Calibri', margin: 0 });
      s5.addShape('rect', { x, y: 1.95, w: phW, h: 3.1, fill: { color: C.white }, shadow: makeShadow() });
      s5.addText(phase.name, { x: x + 0.08, y: 2.05, w: phW - 0.16, h: 0.38, fontSize: 9, bold: true, color: col, fontFace: 'Calibri', margin: 0 });
      (phase.objectives || []).slice(0, 2).forEach((o, j) => {
        s5.addText('› ' + o, { x: x + 0.08, y: 2.55 + j * 0.45, w: phW - 0.16, h: 0.4, fontSize: 8, color: C.text, fontFace: 'Calibri', margin: 0 });
      });
      (phase.deliverables || []).slice(0, 1).forEach((d, j) => {
        s5.addShape('rect', { x: x + 0.08, y: 4.5, w: phW - 0.16, h: 0.38, fill: { color: col, transparency: 90 } });
        s5.addText('📄 ' + d, { x: x + 0.08, y: 4.5, w: phW - 0.16, h: 0.38, fontSize: 7.5, color: col, fontFace: 'Calibri', margin: 0 });
      });
    });

    // ════ SLIDE 6: TIMELINE ════
    const s6 = pres.addSlide();
    s6.background = { color: C.gray };
    sectionTitle(s6, 'Project Timeline', `${sa?.timeline?.contract_start || 'Start'} → Go-Live: ${sa?.timeline?.go_live_date || 'TBD'}`);
    addNavBar(s6, 'Timeline');
    const totalWeeks = parseInt(ip?.project_summary?.total_duration) || 12;
    const trackW = 9.2, trackX = 0.4;
    s6.addShape('rect', { x: trackX, y: 1.75, w: trackW, h: 0.45, fill: { color: 'E2E8F0' } });
    phases.forEach((phase, i) => {
      const col = phaseColors[i % phaseColors.length];
      const startPct = i / phases.length;
      const barW = (1 / phases.length) * trackW - 0.05;
      s6.addShape('rect', { x: trackX + startPct * trackW, y: 1.75, w: barW, h: 0.45, fill: { color: col } });
      s6.addText(phase.name?.split(' ')[0] || '', { x: trackX + startPct * trackW, y: 1.75, w: barW, h: 0.45, fontSize: 7.5, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri', margin: 0 });
    });
    // Milestone cards
    const milestones = [
      { name: 'Project Kickoff', week: 1, color: C.blue },
      { name: 'Architecture Sign-off', week: Math.round(totalWeeks * 0.3), color: C.warning },
      { name: 'UAT Sign-off', week: Math.round(totalWeeks * 0.8), color: '7C3AED' },
      { name: '🎯 Go-Live', week: totalWeeks, color: C.success },
    ];
    milestones.forEach((m, i) => {
      const x = 0.4 + i * 2.35;
      s6.addShape('oval', { x: x + 0.85, y: 2.3, w: 0.3, h: 0.3, fill: { color: m.color } });
      s6.addShape('rect', { x: x + 0.88, y: 2.6, w: 0.03, h: 0.3, fill: { color: m.color } });
      s6.addShape('rect', { x, y: 3.0, w: 2.2, h: 0.85, fill: { color: C.white }, shadow: makeShadow() });
      s6.addShape('rect', { x, y: 3.0, w: 2.2, h: 0.04, fill: { color: m.color } });
      s6.addText(`Week ${m.week}`, { x, y: 3.1, w: 2.2, h: 0.25, fontSize: 9, bold: true, color: m.color, align: 'center', fontFace: 'Calibri', margin: 0 });
      s6.addText(m.name, { x, y: 3.4, w: 2.2, h: 0.4, fontSize: 9, color: C.text, align: 'center', fontFace: 'Calibri', margin: 0 });
    });
    s6.addShape('rect', { x: 0.4, y: 4.2, w: 9.2, h: 0.75, fill: { color: C.success, transparency: 90 }, line: { color: C.success, width: 1 } });
    s6.addText(`🎯  Go-Live: ${sa?.timeline?.go_live_date || 'TBD'}   ·   Duration: ${sa?.timeline?.total_duration || '12 weeks'}   ·   ${ip?.project_summary?.team_size || 'Joint team'}`, {
      x: 0.4, y: 4.2, w: 9.2, h: 0.75, fontSize: 12, bold: true, color: C.success, align: 'center', valign: 'middle', fontFace: 'Calibri', margin: 0
    });

    // ════ SLIDE 7: TEAM ════
    const s7 = pres.addSlide();
    s7.background = { color: C.gray };
    sectionTitle(s7, 'Our Teams', 'Combined client and vendor expertise');
    addNavBar(s7, 'Team');
    s7.addShape('rect', { x: 0.4, y: 1.45, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
    s7.addShape('rect', { x: 0.4, y: 1.45, w: 4.4, h: 0.42, fill: { color: C.navy } });
    s7.addText(`👤  ${ci?.company_name || 'Client'} Team`, { x: 0.55, y: 1.52, w: 4.1, h: 0.3, fontSize: 11, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    (ip?.resource_plan?.client_team || []).slice(0, 4).forEach((r, i) => {
      s7.addShape('rect', { x: 0.55, y: 1.97 + i * 0.73, w: 4.1, h: 0.62, fill: { color: C.gray } });
      s7.addText(r.role, { x: 0.65, y: 2.02 + i * 0.73, w: 4.0, h: 0.24, fontSize: 9.5, bold: true, color: C.navy, fontFace: 'Calibri', margin: 0 });
      s7.addText((r.time_commitment || '') + ' · ' + (r.phases_involved || 'All'), { x: 0.65, y: 2.27 + i * 0.73, w: 4.0, h: 0.26, fontSize: 8, color: C.muted, fontFace: 'Calibri', margin: 0 });
    });
    s7.addShape('rect', { x: 5.2, y: 1.45, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
    s7.addShape('rect', { x: 5.2, y: 1.45, w: 4.4, h: 0.42, fill: { color: C.blue } });
    s7.addText(`🏢  ${sc?.solution_name || 'Vendor'} Team`, { x: 5.35, y: 1.52, w: 4.1, h: 0.3, fontSize: 11, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    (ip?.resource_plan?.vendor_team || []).slice(0, 4).forEach((r, i) => {
      s7.addShape('rect', { x: 5.35, y: 1.97 + i * 0.73, w: 4.1, h: 0.62, fill: { color: C.gray } });
      s7.addText(r.role, { x: 5.45, y: 2.02 + i * 0.73, w: 4.0, h: 0.24, fontSize: 9.5, bold: true, color: C.blue, fontFace: 'Calibri', margin: 0 });
      s7.addText((r.time_commitment || '') + ' · ' + (r.phases_involved || 'All'), { x: 5.45, y: 2.27 + i * 0.73, w: 4.0, h: 0.26, fontSize: 8, color: C.muted, fontFace: 'Calibri', margin: 0 });
    });

    // ════ SLIDE 8: RISKS ════
    const s8 = pres.addSlide();
    s8.background = { color: C.gray };
    sectionTitle(s8, 'Key Risks & Mitigations', 'Identified and planned for from day one');
    addNavBar(s8, 'Risks');
    const riskCols = { High: C.danger, Medium: C.warning, Low: C.success };
    (ip?.risk_register || []).slice(0, 4).forEach((risk, i) => {
      const col = riskCols[risk.risk_score] || C.muted;
      const x = (i % 2) === 0 ? 0.4 : 5.2;
      const y = i < 2 ? 1.45 : 3.2;
      s8.addShape('rect', { x, y, w: 4.4, h: 1.6, fill: { color: C.white }, shadow: makeShadow() });
      s8.addShape('rect', { x, y, w: 0.08, h: 1.6, fill: { color: col } });
      s8.addShape('rect', { x: x + 0.2, y: y + 0.1, w: 0.75, h: 0.28, fill: { color: col, transparency: 85 } });
      s8.addText(risk.risk_score, { x: x + 0.2, y: y + 0.1, w: 0.75, h: 0.28, fontSize: 8, bold: true, color: col, align: 'center', fontFace: 'Calibri', margin: 0 });
      s8.addText(risk.risk, { x: x + 1.05, y: y + 0.1, w: 3.2, h: 0.28, fontSize: 9, bold: true, color: C.text, fontFace: 'Calibri', margin: 0 });
      s8.addText('Mitigation: ' + (risk.mitigation || ''), { x: x + 0.2, y: y + 0.48, w: 4.0, h: 0.45, fontSize: 8.5, color: C.muted, fontFace: 'Calibri' });
      s8.addText('Contingency: ' + (risk.contingency || ''), { x: x + 0.2, y: y + 1.0, w: 4.0, h: 0.45, fontSize: 8, color: C.text, fontFace: 'Calibri', italics: true });
    });

    // ════ SLIDE 9: NEXT STEPS ════
    const s9 = pres.addSlide();
    s9.background = { color: C.navy };
    s9.addShape('oval', { x: 7.0, y: 3.0, w: 4.5, h: 4.5, fill: { color: C.blue, transparency: 80 }, line: { color: C.blue, transparency: 80 } });
    s9.addShape('oval', { x: -1.2, y: -1.2, w: 3.5, h: 3.5, fill: { color: C.light, transparency: 85 }, line: { color: C.light, transparency: 85 } });
    s9.addText('Next Steps', { x: 0.6, y: 0.4, w: 8, h: 0.75, fontSize: 36, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    s9.addShape('rect', { x: 0.6, y: 1.2, w: 5.8, h: 0.03, fill: { color: C.light, transparency: 50 } });
    const nextSteps = [
      { who: 'Client', action: `Confirm named contacts: Project Manager, Technical Lead, Security Lead` },
      { who: 'Client', action: sa?.client_responsibilities?.[0] || 'Share network diagrams and system access details' },
      { who: 'Vendor', action: 'Issue signed project charter and RACI matrix for review' },
      { who: 'Both', action: 'Agree on weekly sync cadence, tool, and attendees' },
    ];
    nextSteps.forEach((step, i) => {
      const col = step.who === 'Client' ? C.light : step.who === 'Vendor' ? '93C5FD' : 'A7F3D0';
      s9.addShape('rect', { x: 0.6, y: 1.45 + i * 0.85, w: 0.55, h: 0.55, fill: { color: col, transparency: 70 } });
      s9.addText(String(i + 1), { x: 0.6, y: 1.45 + i * 0.85, w: 0.55, h: 0.55, fontSize: 18, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri', margin: 0 });
      s9.addText(step.who, { x: 1.3, y: 1.45 + i * 0.85, w: 0.9, h: 0.25, fontSize: 8, color: col, bold: true, fontFace: 'Calibri', margin: 0 });
      s9.addText(step.action, { x: 1.3, y: 1.7 + i * 0.85, w: 7.5, h: 0.3, fontSize: 10, color: C.white, fontFace: 'Calibri', margin: 0 });
    });
    s9.addText(`Thank you — let's build something great together.`, {
      x: 0.6, y: 5.05, w: 8.5, h: 0.35, fontSize: 11, color: C.light, fontFace: 'Calibri', italics: true, margin: 0
    });

    // ── Write and return base64 ──
    const base64 = await pres.write({ outputType: 'base64' });
    return res.status(200).json({ pptx: base64 });

  } catch (err) {
    console.error('PPTX error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate deck' });
  }
};


// ── Color Palette: Midnight Executive ──
const C = {
  navy:    '1B2D5B',
  blue:    '2563EB',
  light:   'CADCFC',
  white:   'FFFFFF',
  gray:    'F8FAFC',
  text:    '1E293B',
  muted:   '64748B',
  accent:  '3B82F6',
  success: '059669',
  warning: 'D97706',
  danger:  'DC2626',
};

const makeShadow = () => ({ type: 'outer', blur: 8, offset: 3, angle: 135, color: '000000', opacity: 0.12 });

// ── Helper: Add section divider bar ──
function addNavBar(slide, currentSection) {
  const sections = ['Client', 'Solution', 'Plan', 'Timeline', 'Team', 'Next Steps'];
  slide.addShape('rect', { x: 0, y: 5.25, w: 10, h: 0.375, fill: { color: C.navy } });
  sections.forEach((s, i) => {
    const isActive = s === currentSection;
    slide.addText(s, {
      x: 0.3 + i * 1.6, y: 5.28, w: 1.5, h: 0.3,
      fontSize: 7, color: isActive ? C.light : 'FFFFFF',
      bold: isActive, align: 'center', fontFace: 'Calibri', margin: 0
    });
  });
}

// ── Helper: Stat box ──
function addStatBox(slide, x, y, value, label, color) {
  slide.addShape('rect', { x, y, w: 2.8, h: 1.1,
    fill: { color: color || C.blue, transparency: 90 },
    line: { color: color || C.blue, width: 1.5 }
  });
  slide.addText(value, { x, y: y + 0.05, w: 2.8, h: 0.6, fontSize: 28, bold: true, color: color || C.blue, align: 'center', fontFace: 'Calibri', margin: 0 });
  slide.addText(label, { x, y: y + 0.65, w: 2.8, h: 0.4, fontSize: 9, color: C.muted, align: 'center', fontFace: 'Calibri', margin: 0 });
}

// ── Helper: Bullet row ──
function bulletRow(slide, x, y, w, items) {
  slide.addText(items.map(item => ({ text: item, options: { bullet: true, breakLine: true, paraSpaceAfter: 4 } })), {
    x, y, w, h: Math.max(0.4, items.length * 0.28), fontSize: 11, color: C.text, fontFace: 'Calibri'
  });
}

// ── Helper: Section title ──
function sectionTitle(slide, title, subtitle) {
  slide.addShape('rect', { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.blue } });
  slide.addText(title, { x: 0.4, y: 0.35, w: 9, h: 0.65, fontSize: 26, bold: true, color: C.navy, fontFace: 'Calibri', margin: 0 });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.4, y: 0.95, w: 9, h: 0.35, fontSize: 13, color: C.muted, fontFace: 'Calibri', margin: 0 });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { clientIntelligence: ci, solutionContext: sc, scopeAnalysis: sa, implementationPlan: ip, kickoffDeck: kd } = req.body;

    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_16x9';
    pres.author = sc?.solution_name || 'Implementation Team';
    pres.title = `${ci?.company_name || 'Client'} Implementation Kickoff`;

    // ════ SLIDE 1: TITLE ════
    const s1 = pres.addSlide();
    s1.background = { color: C.navy };
    // Left accent panel
    s1.addShape('rect', { x: 0, y: 0, w: 3.5, h: 5.625, fill: { color: C.blue } });
    // Decorative circles
    s1.addShape('oval', { x: -0.8, y: 4.2, w: 2.5, h: 2.5, fill: { color: C.light, transparency: 80 }, line: { color: C.light, transparency: 80 } });
    s1.addShape('oval', { x: 2.5, y: -0.5, w: 1.8, h: 1.8, fill: { color: C.white, transparency: 85 }, line: { color: C.white, transparency: 85 } });
    // Logo area
    s1.addText(sc?.solution_name || 'Implementation', { x: 0.25, y: 0.4, w: 3, h: 0.5, fontSize: 13, color: C.white, bold: true, fontFace: 'Calibri', align: 'center', margin: 0 });
    s1.addShape('rect', { x: 0.5, y: 0.95, w: 2.5, h: 0.02, fill: { color: C.light, transparency: 40 } });
    s1.addText('for', { x: 0.25, y: 1.05, w: 3, h: 0.35, fontSize: 11, color: C.light, fontFace: 'Calibri', align: 'center', margin: 0 });
    s1.addText(ci?.company_name || 'Client', { x: 0.25, y: 1.45, w: 3, h: 0.5, fontSize: 15, color: C.white, bold: true, fontFace: 'Calibri', align: 'center', margin: 0 });
    // Main content
    s1.addText('Implementation\nKickoff', { x: 3.9, y: 1.0, w: 5.7, h: 1.8, fontSize: 44, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    s1.addShape('rect', { x: 3.9, y: 2.9, w: 5.5, h: 0.03, fill: { color: C.light, transparency: 50 } });
    s1.addText(`${sa?.timeline?.contract_start || 'Q2 2026'}  ·  ${ci?.overview?.headquarters || 'Global'}`, {
      x: 3.9, y: 3.05, w: 5.5, h: 0.35, fontSize: 12, color: C.light, fontFace: 'Calibri', margin: 0
    });
    s1.addText('CONFIDENTIAL', { x: 3.9, y: 5.1, w: 5.5, h: 0.3, fontSize: 9, color: C.light, fontFace: 'Calibri', align: 'right', margin: 0 });

    // ════ SLIDE 2: AGENDA ════
    const s2 = pres.addSlide();
    s2.background = { color: C.gray };
    sectionTitle(s2, "Today's Agenda", "What we'll cover in this kickoff session");
    addNavBar(s2, '');
    const agenda = [
      { n: '01', title: 'About ' + (ci?.company_name || 'Your Company'), desc: 'Our understanding of your business, market, and goals' },
      { n: '02', title: 'Solution Overview', desc: `How ${sc?.solution_name || 'our solution'} maps to your needs` },
      { n: '03', title: 'Project Scope & Plan', desc: 'What we're building together and the phased approach' },
      { n: '04', title: 'Timeline & Milestones', desc: 'Key dates, phases, and decision points' },
      { n: '05', title: 'Team & RACI', desc: 'Who does what — client and vendor responsibilities' },
      { n: '06', title: 'Next Steps', desc: 'Actions to take before our next meeting' },
    ];
    agenda.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? 0.4 : 5.2;
      const y = 1.55 + row * 1.05;
      s2.addShape('rect', { x, y, w: 4.4, h: 0.9, fill: { color: C.white }, shadow: makeShadow() });
      s2.addShape('rect', { x, y, w: 0.5, h: 0.9, fill: { color: C.blue } });
      s2.addText(item.n, { x, y, w: 0.5, h: 0.9, fontSize: 14, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri', margin: 0 });
      s2.addText(item.title, { x: x + 0.6, y: y + 0.08, w: 3.7, h: 0.3, fontSize: 11, bold: true, color: C.text, fontFace: 'Calibri', margin: 0 });
      s2.addText(item.desc, { x: x + 0.6, y: y + 0.42, w: 3.7, h: 0.38, fontSize: 9, color: C.muted, fontFace: 'Calibri', margin: 0 });
    });

    // ════ SLIDE 3: CLIENT OVERVIEW ════
    const s3 = pres.addSlide();
    s3.background = { color: C.gray };
    sectionTitle(s3, `About ${ci?.company_name || 'Your Company'}`, 'Our understanding of your business');
    addNavBar(s3, 'Client');
    // Left col: description
    s3.addShape('rect', { x: 0.4, y: 1.45, w: 5.0, h: 3.55, fill: { color: C.white }, shadow: makeShadow() });
    s3.addText(ci?.overview?.description || '', { x: 0.6, y: 1.6, w: 4.7, h: 1.0, fontSize: 10, color: C.text, fontFace: 'Calibri' });
    s3.addShape('rect', { x: 0.6, y: 2.65, w: 4.6, h: 0.02, fill: { color: C.light } });
    const facts = [
      ['Industry', ci?.market_position?.industry || '—'],
      ['HQ', ci?.overview?.headquarters || '—'],
      ['Size', ci?.overview?.size || '—'],
      ['Market', ci?.market_position?.market_segment || '—'],
    ];
    facts.forEach(([label, value], i) => {
      const y = 2.8 + i * 0.5;
      s3.addText(label, { x: 0.6, y, w: 1.5, h: 0.35, fontSize: 9, color: C.muted, fontFace: 'Calibri', bold: true, margin: 0 });
      s3.addText(value, { x: 2.1, y, w: 2.8, h: 0.35, fontSize: 9, color: C.text, fontFace: 'Calibri', margin: 0 });
    });
    // Right col: key signals
    s3.addShape('rect', { x: 5.7, y: 1.45, w: 3.9, h: 3.55, fill: { color: C.navy } });
    s3.addText('Key Signals for Implementation', { x: 5.9, y: 1.6, w: 3.5, h: 0.4, fontSize: 10, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    const signals = [
      `Regulatory: ${ci?.regulatory_environment?.compliance_complexity || 'Medium'} complexity`,
      `Digital maturity: ${ci?.technology_signals?.digital_maturity || 'Medium'}`,
      `Complexity: ${ci?.implementation_considerations?.complexity || 'Medium'}`,
      ...(ci?.implementation_considerations?.key_opportunities || []).slice(0, 2),
    ];
    signals.forEach((sig, i) => {
      s3.addText('→  ' + sig, { x: 5.9, y: 2.15 + i * 0.45, w: 3.5, h: 0.38, fontSize: 9, color: C.light, fontFace: 'Calibri', margin: 0 });
    });

    // ════ SLIDE 4: SOLUTION FIT ════
    const s4 = pres.addSlide();
    s4.background = { color: C.gray };
    sectionTitle(s4, 'Solution Overview', `Why ${sc?.solution_name || 'our solution'} is the right fit`);
    addNavBar(s4, 'Solution');
    // Fit score hero
    const fitScore = sc?.fit_assessment?.fit_score || '8';
    const fitLabel = sc?.fit_assessment?.overall_fit || 'Strong';
    s4.addShape('rect', { x: 0.4, y: 1.45, w: 2.2, h: 3.55, fill: { color: C.navy } });
    s4.addText(fitScore + '/10', { x: 0.4, y: 2.1, w: 2.2, h: 1.0, fontSize: 38, bold: true, color: C.white, align: 'center', fontFace: 'Calibri', margin: 0 });
    s4.addText('Fit Score', { x: 0.4, y: 3.1, w: 2.2, h: 0.3, fontSize: 9, color: C.light, align: 'center', fontFace: 'Calibri', margin: 0 });
    s4.addText(fitLabel + ' Fit', { x: 0.4, y: 3.5, w: 2.2, h: 0.35, fontSize: 12, bold: true, color: C.light, align: 'center', fontFace: 'Calibri', margin: 0 });
    // Key value drivers
    s4.addText('Key Value Drivers', { x: 2.9, y: 1.45, w: 6.8, h: 0.35, fontSize: 11, bold: true, color: C.navy, fontFace: 'Calibri', margin: 0 });
    const drivers = sc?.fit_assessment?.key_value_drivers || [];
    drivers.slice(0, 3).forEach((d, i) => {
      s4.addShape('rect', { x: 2.9, y: 1.9 + i * 0.85, w: 6.8, h: 0.72, fill: { color: C.white }, shadow: makeShadow() });
      s4.addShape('rect', { x: 2.9, y: 1.9 + i * 0.85, w: 0.06, h: 0.72, fill: { color: C.blue } });
      s4.addText(d, { x: 3.1, y: 1.96 + i * 0.85, w: 6.4, h: 0.55, fontSize: 10, color: C.text, fontFace: 'Calibri' });
    });
    // Modules strip
    const modules = (sc?.relevant_modules || []).filter(m => m.priority === 'Must Have').slice(0, 4);
    s4.addText('Core Modules', { x: 2.9, y: 4.5, w: 6.8, h: 0.25, fontSize: 9, bold: true, color: C.muted, fontFace: 'Calibri', margin: 0 });
    modules.forEach((m, i) => {
      s4.addShape('rect', { x: 2.9 + i * 1.75, y: 4.75, w: 1.6, h: 0.3, fill: { color: C.blue, transparency: 85 }, line: { color: C.blue, width: 0.5 } });
      s4.addText(m.name, { x: 2.9 + i * 1.75, y: 4.75, w: 1.6, h: 0.3, fontSize: 8, color: C.blue, align: 'center', fontFace: 'Calibri', bold: true, margin: 0 });
    });

    // ════ SLIDE 5: PROJECT SCOPE ════
    const s5 = pres.addSlide();
    s5.background = { color: C.gray };
    sectionTitle(s5, 'Project Scope', sa?.project_overview?.summary || 'What we are delivering together');
    addNavBar(s5, 'Plan');
    // In scope
    s5.addShape('rect', { x: 0.4, y: 1.45, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
    s5.addText('✅  In Scope', { x: 0.6, y: 1.6, w: 4.0, h: 0.3, fontSize: 11, bold: true, color: C.success, fontFace: 'Calibri', margin: 0 });
    const inScope = sa?.scope?.in_scope || [];
    inScope.slice(0, 6).forEach((item, i) => {
      s5.addText('•  ' + item, { x: 0.6, y: 2.0 + i * 0.46, w: 4.0, h: 0.4, fontSize: 9, color: C.text, fontFace: 'Calibri', margin: 0 });
    });
    // Out of scope
    s5.addShape('rect', { x: 5.2, y: 1.45, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
    s5.addText('❌  Out of Scope', { x: 5.4, y: 1.6, w: 4.0, h: 0.3, fontSize: 11, bold: true, color: C.danger, fontFace: 'Calibri', margin: 0 });
    const outScope = sa?.scope?.out_of_scope || [];
    outScope.slice(0, 6).forEach((item, i) => {
      s5.addText('•  ' + item, { x: 5.4, y: 2.0 + i * 0.46, w: 4.0, h: 0.4, fontSize: 9, color: C.text, fontFace: 'Calibri', margin: 0 });
    });

    // ════ SLIDE 6: IMPLEMENTATION PHASES ════
    const s6 = pres.addSlide();
    s6.background = { color: C.gray };
    sectionTitle(s6, 'Implementation Approach', `${ip?.project_summary?.methodology || 'Phased'} · ${ip?.project_summary?.total_duration || '12 weeks'}`);
    addNavBar(s6, 'Plan');
    const phaseColors = [C.blue, '7C3AED', C.success, C.warning, C.danger, '0891B2'];
    const phases = ip?.phases || [];
    const phaseW = phases.length > 0 ? (9.2 / phases.length) - 0.08 : 1.5;
    phases.slice(0, 6).forEach((phase, i) => {
      const x = 0.4 + i * (phaseW + 0.08);
      const col = phaseColors[i % phaseColors.length];
      s6.addShape('rect', { x, y: 1.45, w: phaseW, h: 0.45, fill: { color: col } });
      s6.addText(`Phase ${phase.phase_number}`, { x, y: 1.45, w: phaseW, h: 0.22, fontSize: 8, color: C.white, align: 'center', fontFace: 'Calibri', bold: true, margin: 0 });
      s6.addText(phase.duration, { x, y: 1.67, w: phaseW, h: 0.22, fontSize: 7, color: C.white, align: 'center', fontFace: 'Calibri', margin: 0 });
      s6.addShape('rect', { x, y: 1.9, w: phaseW, h: 2.85, fill: { color: C.white }, shadow: makeShadow() });
      s6.addShape('rect', { x, y: 1.9, w: phaseW, h: 0.02, fill: { color: col } });
      s6.addText(phase.name, { x: x + 0.08, y: 2.0, w: phaseW - 0.16, h: 0.35, fontSize: 8.5, bold: true, color: col, fontFace: 'Calibri', margin: 0 });
      (phase.deliverables || []).slice(0, 2).forEach((d, j) => {
        s6.addText('› ' + d, { x: x + 0.08, y: 2.45 + j * 0.38, w: phaseW - 0.16, h: 0.35, fontSize: 7.5, color: C.text, fontFace: 'Calibri', margin: 0 });
      });
    });

    // ════ SLIDE 7: TIMELINE ════
    const s7 = pres.addSlide();
    s7.background = { color: C.gray };
    sectionTitle(s7, 'Project Timeline', `${sa?.timeline?.contract_start || 'Start'} → ${sa?.timeline?.go_live_date || 'Go-Live'}`);
    addNavBar(s7, 'Timeline');
    const totalWeeks = ip?.project_summary?.total_duration ? parseInt(ip.project_summary.total_duration) : 12;
    const trackW = 9.2;
    const trackX = 0.4;
    const trackY = 2.0;
    // Background track
    s7.addShape('rect', { x: trackX, y: trackY, w: trackW, h: 0.5, fill: { color: 'E2E8F0' } });
    // Phase bars on timeline
    (ip?.phases || []).slice(0, 6).forEach((phase, i) => {
      const col = phaseColors[i % phaseColors.length];
      const tasks = phase.tasks || [];
      const startW = tasks.length > 0 ? (i / (ip.phases.length)) * trackW : 0;
      const barW = (1 / (ip.phases.length)) * trackW;
      s7.addShape('rect', { x: trackX + startW, y: trackY, w: barW - 0.05, h: 0.5, fill: { color: col } });
      s7.addText(phase.name.split(' ')[0], { x: trackX + startW, y: trackY, w: barW - 0.05, h: 0.5, fontSize: 8, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri', margin: 0 });
    });
    // Key milestones
    s7.addText('Key Milestones', { x: 0.4, y: 2.7, w: 9, h: 0.3, fontSize: 11, bold: true, color: C.navy, fontFace: 'Calibri', margin: 0 });
    const milestones = [
      { name: 'Project Kickoff', week: 1, type: 'kickoff' },
      { name: 'Architecture Approved', week: Math.round(totalWeeks * 0.25), type: 'decision' },
      { name: 'UAT Start', week: Math.round(totalWeeks * 0.7), type: 'deliverable' },
      { name: 'Go-Live', week: totalWeeks, type: 'go-live' },
    ];
    milestones.forEach((m, i) => {
      const x = 0.4 + i * 2.4;
      const col = m.type === 'go-live' ? C.danger : m.type === 'decision' ? C.warning : C.blue;
      s7.addShape('oval', { x: x + 0.6, y: 3.1, w: 0.28, h: 0.28, fill: { color: col } });
      s7.addText(`Wk ${m.week}`, { x, y: 3.4, w: 2.2, h: 0.25, fontSize: 8, color: col, bold: true, align: 'center', fontFace: 'Calibri', margin: 0 });
      s7.addText(m.name, { x, y: 3.65, w: 2.2, h: 0.35, fontSize: 9, color: C.text, align: 'center', fontFace: 'Calibri', margin: 0 });
    });
    // Go-live callout
    s7.addShape('rect', { x: 0.4, y: 4.25, w: 9.2, h: 0.75, fill: { color: C.success, transparency: 90 }, line: { color: C.success, width: 1 } });
    s7.addText(`🎯  Target Go-Live: ${sa?.timeline?.go_live_date || 'TBD'}  ·  Total Duration: ${sa?.timeline?.total_duration || '12 weeks'}  ·  Methodology: ${ip?.project_summary?.methodology || 'Phased'}`, {
      x: 0.4, y: 4.25, w: 9.2, h: 0.75, fontSize: 12, bold: true, color: C.success, align: 'center', valign: 'middle', fontFace: 'Calibri', margin: 0
    });

    // ════ SLIDE 8: TEAM & RACI ════
    const s8 = pres.addSlide();
    s8.background = { color: C.gray };
    sectionTitle(s8, 'Our Team', 'Who is involved and what they are responsible for');
    addNavBar(s8, 'Team');
    // Client team
    s8.addShape('rect', { x: 0.4, y: 1.45, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
    s8.addShape('rect', { x: 0.4, y: 1.45, w: 4.4, h: 0.4, fill: { color: C.navy } });
    s8.addText('👤  Client Team', { x: 0.55, y: 1.5, w: 4.1, h: 0.3, fontSize: 11, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    (ip?.resource_plan?.client_team || []).slice(0, 4).forEach((r, i) => {
      s8.addShape('rect', { x: 0.55, y: 1.95 + i * 0.72, w: 4.1, h: 0.62, fill: { color: C.gray } });
      s8.addText(r.role, { x: 0.65, y: 2.0 + i * 0.72, w: 4.0, h: 0.22, fontSize: 9, bold: true, color: C.navy, fontFace: 'Calibri', margin: 0 });
      s8.addText(r.time_commitment + ' · ' + (r.phases_involved || 'All phases'), { x: 0.65, y: 2.22 + i * 0.72, w: 4.0, h: 0.28, fontSize: 8, color: C.muted, fontFace: 'Calibri', margin: 0 });
    });
    // Vendor team
    s8.addShape('rect', { x: 5.2, y: 1.45, w: 4.4, h: 3.6, fill: { color: C.white }, shadow: makeShadow() });
    s8.addShape('rect', { x: 5.2, y: 1.45, w: 4.4, h: 0.4, fill: { color: C.blue } });
    s8.addText('🏢  Vendor Team', { x: 5.35, y: 1.5, w: 4.1, h: 0.3, fontSize: 11, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    (ip?.resource_plan?.vendor_team || []).slice(0, 4).forEach((r, i) => {
      s8.addShape('rect', { x: 5.35, y: 1.95 + i * 0.72, w: 4.1, h: 0.62, fill: { color: C.gray } });
      s8.addText(r.role, { x: 5.45, y: 2.0 + i * 0.72, w: 4.0, h: 0.22, fontSize: 9, bold: true, color: C.blue, fontFace: 'Calibri', margin: 0 });
      s8.addText(r.time_commitment + ' · ' + (r.phases_involved || 'All phases'), { x: 5.45, y: 2.22 + i * 0.72, w: 4.0, h: 0.28, fontSize: 8, color: C.muted, fontFace: 'Calibri', margin: 0 });
    });

    // ════ SLIDE 9: RISKS ════
    const s9 = pres.addSlide();
    s9.background = { color: C.gray };
    sectionTitle(s9, 'Key Risks & Mitigations', 'We have identified and planned for the following risks');
    addNavBar(s9, 'Plan');
    const riskColorMap = { High: C.danger, Medium: C.warning, Low: C.success };
    const risks = (ip?.risk_register || []).slice(0, 4);
    risks.forEach((risk, i) => {
      const col = riskColorMap[risk.risk_score] || C.muted;
      const x = (i % 2) === 0 ? 0.4 : 5.2;
      const y = i < 2 ? 1.45 : 3.15;
      s9.addShape('rect', { x, y, w: 4.4, h: 1.55, fill: { color: C.white }, shadow: makeShadow() });
      s9.addShape('rect', { x, y, w: 0.08, h: 1.55, fill: { color: col } });
      s9.addShape('rect', { x: x + 0.2, y: y + 0.1, w: 0.7, h: 0.28, fill: { color: col, transparency: 85 }, line: { color: col, width: 0.5 } });
      s9.addText(risk.risk_score, { x: x + 0.2, y: y + 0.1, w: 0.7, h: 0.28, fontSize: 8, bold: true, color: col, align: 'center', fontFace: 'Calibri', margin: 0 });
      s9.addText(risk.risk, { x: x + 1.05, y: y + 0.1, w: 3.2, h: 0.3, fontSize: 9, bold: true, color: C.text, fontFace: 'Calibri', margin: 0 });
      s9.addText('Mitigation: ' + risk.mitigation, { x: x + 0.2, y: y + 0.5, w: 4.0, h: 0.45, fontSize: 8.5, color: C.muted, fontFace: 'Calibri' });
      s9.addText('Contingency: ' + risk.contingency, { x: x + 0.2, y: y + 0.95, w: 4.0, h: 0.45, fontSize: 8, color: C.text, fontFace: 'Calibri', italics: true });
    });

    // ════ SLIDE 10: NEXT STEPS ════
    const s10 = pres.addSlide();
    s10.background = { color: C.navy };
    s10.addShape('rect', { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.navy } });
    s10.addShape('oval', { x: 7.5, y: 3.5, w: 4.0, h: 4.0, fill: { color: C.blue, transparency: 80 }, line: { color: C.blue, transparency: 80 } });
    s10.addShape('oval', { x: -1.0, y: -1.0, w: 3.0, h: 3.0, fill: { color: C.light, transparency: 85 }, line: { color: C.light, transparency: 85 } });
    s10.addText('Next Steps', { x: 0.6, y: 0.5, w: 8, h: 0.7, fontSize: 34, bold: true, color: C.white, fontFace: 'Calibri', margin: 0 });
    s10.addShape('rect', { x: 0.6, y: 1.25, w: 5.5, h: 0.02, fill: { color: C.light, transparency: 50 } });
    const nextSteps = [
      { who: 'Client', action: `Confirm named contacts from ${ci?.company_name || 'your'} Network, Security & Application teams` },
      { who: 'Client', action: sa?.client_responsibilities?.[0] || 'Share network diagrams, IP ranges, and system access details' },
      { who: 'Vendor', action: 'Circulate project charter and RACI matrix for sign-off' },
      { who: 'Both', action: 'Schedule weekly sync — confirm cadence, attendees, and tool (Teams/Zoom)' },
    ];
    nextSteps.forEach((step, i) => {
      const col = step.who === 'Client' ? C.light : step.who === 'Vendor' ? '93C5FD' : 'A7F3D0';
      s10.addShape('rect', { x: 0.6, y: 1.5 + i * 0.85, w: 0.55, h: 0.55, fill: { color: col, transparency: 70 } });
      s10.addText(String(i + 1), { x: 0.6, y: 1.5 + i * 0.85, w: 0.55, h: 0.55, fontSize: 16, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri', margin: 0 });
      s10.addText(step.who, { x: 1.3, y: 1.5 + i * 0.85, w: 1.0, h: 0.25, fontSize: 8, color: col, bold: true, fontFace: 'Calibri', margin: 0 });
      s10.addText(step.action, { x: 1.3, y: 1.75 + i * 0.85, w: 7.5, h: 0.3, fontSize: 10, color: C.white, fontFace: 'Calibri', margin: 0 });
    });
    s10.addText('Thank you. Let\'s build something great together.', {
      x: 0.6, y: 5.0, w: 8.5, h: 0.4, fontSize: 11, color: C.light, fontFace: 'Calibri', italics: true, margin: 0
    });

    // ── Generate and return base64 ──
    const base64 = await pres.write({ outputType: 'base64' });
    return res.status(200).json({ pptx: base64 });

  } catch (err) {
    console.error('PPTX generation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate deck' });
  }
}
