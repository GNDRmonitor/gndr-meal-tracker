import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronRight, ChevronDown, Circle, CheckCircle2, AlertTriangle, Radio, Target, ClipboardList, LayoutGrid, X, Loader2, Gauge, Download, Repeat, Lock, MapPin, Globe2, Pencil } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from "recharts";
import * as d3 from "d3";
import {
  getIdentity, setIdentity as saveIdentityToSheet,
  getAllActivityUpdates, setActivityUpdate,
  getAllIndicatorStatuses, setIndicatorStatus as saveIndicatorStatusToSheet,
  getAllActivityMeta, setActivityMeta,
  getAllProjects, setProject,
  rememberEmail, getRememberedEmail,
} from "./storage.js";
import { renderGoogleSignIn } from "./googleAuth.js";

/* ============================== DATA ============================== */

const ACTIVITIES = [
  {row:3,si:"SI 1.1",output:"Output 1.1.1",activity:"Collect community practices, case studies and member/community-led stories from GNDR projects (for documentation and sharing)",owner:"Programmes",contrib:"FRIMCO",type:null,smg:null},
  {row:4,si:"SI 1.1",output:"Output 1.1.2",activity:"Produce the LLAA (Locally-Led Anticipatory Action) Cookbook — practical guidance drawn from members’ practice",owner:"Regional Lead (Asia & Europe)",contrib:"Programmes, FRIMCO",type:null,smg:null},
  {row:5,si:"SI 1.1",output:"Output 1.1.2",activity:"Develop close-out knowledge products from the HuT project (lessons and tools for members)",owner:"Regional Lead (Asia & Europe)",contrib:"Programmes, FRIMCO",type:null,smg:null},
  {row:6,si:"SI 1.1",output:"Output 1.1.2",activity:"Develop guidance and practical tools from the LRF project for wider member use",owner:"Programmes",contrib:"",type:null,smg:null},
  {row:7,si:"SI 1.1",output:"Output 1.1.2",activity:"Finalise the women-led anticipatory action work in Indonesia & Philippines (completed Q1 2026/27)",owner:"Programmes",contrib:"",type:"Q",smg:"S/M"},
  {row:8,si:"SI 1.1",output:"Output 1.1.3",activity:"Deliver community-led landslide resilience under the LRF project (Ethiopia & Nepal)",owner:"Programmes",contrib:"Regional Leads, FRIMCO, Operations, Policy",type:"N",smg:"S/M"},
  {row:9,si:"SI 1.1",output:"Output 1.1.3",activity:"Produce Stakeholder Needs Assessment reports for Nepal and Ethiopia (2 reports)",owner:"Programmes",contrib:"",type:null,smg:null},
  {row:10,si:"SI 1.1",output:"Output 1.1.3",activity:"Capacity building of local actors on early warnings and early action — Nepal & Ethiopia (7 communities)",owner:"Programmes",contrib:"",type:null,smg:null},
  {row:11,si:"SI 1.1",output:"Output 1.1.3",activity:"Deliver the Harnessing Technology for Climate-Smart Landslide Detection project — Kyrgyzstan",owner:"Programmes",contrib:"Regional Leads, FRIMCO, Operations, Policy",type:"N",smg:"S/M"},
  {row:12,si:"SI 1.1",output:"Output 1.1.3",activity:"Run community surveys and consultations in 5 communities (needs and feasibility assessment)",owner:"Programmes",contrib:"",type:null,smg:null},
  {row:13,si:"SI 1.1",output:"Output 1.1.3",activity:"Develop early warning protocols in 5 communities through community workshops",owner:"Programmes",contrib:"",type:null,smg:null},
  {row:14,si:"SI 1.1",output:"Output 1.1.3",activity:"Deliver nature-based solutions under the Pacific Circle project (Tonga & Kiribati)",owner:"Programmes",contrib:"Regional Leads, FRIMCO, Operations, Policy",type:"N",smg:"S/M"},
  {row:15,si:"SI 1.2",output:"Output 1.2.1",activity:"Conduct participatory needs assessments under the Kiwa project",owner:"Programmes",contrib:"",type:null,smg:null},
  {row:16,si:"SI 1.2",output:"Output 1.2.1",activity:"Conduct needs assessment under the Climate-Smart Landslide Detection project (Kyrgyzstan)",owner:"Programmes",contrib:"",type:null,smg:null},
  {row:17,si:"SI 1.2",output:"Output 1.2.1",activity:"Develop the new iteration of Views from the Frontline (VFL) — partnership building, fundraising, programme design and the VFL platform",owner:"FRIMCO + Programmes",contrib:"Regional Leads, Operations, Policy",type:"Q",smg:"S/M"},
  {row:18,si:"SI 1.2",output:"Output 1.2.2",activity:"Share REAP system-mapping evidence into the REAP partnership",owner:"FRIMCO",contrib:"Policy",type:null,smg:null},
  {row:19,si:"SI 1.2",output:"Output 1.2.3",activity:"Produce policy briefs for COP31",owner:"Policy",contrib:"Programmes, Membership Engagement, Regional Leads, FRIMCO",type:"N",smg:"S/M/G"},
  {row:20,si:"SI 1.2",output:"Output 1.2.3",activity:"Contribute member evidence and positions to PPED discussions",owner:"Policy",contrib:"Regional Leads, FRIMCO",type:null,smg:null},
  {row:21,si:"SI 1.2",output:"Output 1.2.3",activity:"Prepare and present evidence, summaries and presentations at global and regional forums",owner:"Policy",contrib:"Regional Leads, FRIMCO, Programmes",type:null,smg:null},
  {row:22,si:"SI 1.2",output:"Output 1.2.3",activity:"Targeted engagement with national governments (LRF Ethiopia & Nepal, Kyrgyzstan; ADPC-UNDP Ethiopia & Togo)",owner:"Policy",contrib:"Programmes",type:"N",smg:"S/M/G"},
  {row:23,si:"SI 1.2",output:"Output 1.2.3",activity:"Showcase member-led initiatives on GNDR platforms (amplifying member evidence and solutions)",owner:"Membership Engagement",contrib:"Regions, Programmes",type:null,smg:null},
  {row:24,si:"SI 2.1",output:"Output 2.1.1",activity:"Support regionalisation of the Global Strategy 2026–2030 (regional work plans and cross-exchange workshops)",owner:"Regional Leads",contrib:"Membership Engagement, FRIMCO",type:"N",smg:"S/M"},
  {row:25,si:"SI 2.1",output:"Output 2.1.1",activity:"Apply REAP systems-mapping practices with members (secondary contribution to Output 1.2.2)",owner:"FRIMCO",contrib:"",type:null,smg:null},
  {row:26,si:"SI 2.1",output:"Output 2.1.2",activity:"Local Leadership Academy — member-led webinars & learning exchanges, incl. Peru replication (6 member-led webinars / 300 members + 3 NFP webinars; in-house trainers, topics TBD)",owner:"Membership Engagement",contrib:"Regional Leads, Policy, Programmes, FRIMCO",type:null,smg:null},
  {row:27,si:"SI 2.1",output:"Output 2.1.3",activity:"Locally-led delivery - Pre-Evacuation Platform (LAC)",owner:"Regional Lead (Americas & Caribbean)",contrib:"Programmes",type:null,smg:null},
  {row:28,si:"SI 2.2",output:"Output 2.2.1",activity:"SEM and PPED engagement (4 NGO constituency meetings for SEM facilitated, with monthly SEM advisory group support in 2026-27)",owner:"Policy",contrib:"Regional Leads",type:null,smg:null},
  {row:29,si:"SI 2.2",output:"Output 2.2.2",activity:"Engage in PPED to develop and advance shared advocacy positions",owner:"Policy",contrib:"Regional Leads",type:null,smg:null},
  {row:30,si:"SI 2.2",output:"Output 2.2.2",activity:"Collaborate with UNDRR (SEM, Sendai and post-Sendai) to advance shared advocacy positions",owner:"Policy",contrib:"Regional Leads",type:null,smg:null},
  {row:31,si:"SI 2.2",output:"Output 2.2.2",activity:"Engage in UNFCCC SB64 and COP31 to advance shared advocacy positions",owner:"Policy",contrib:"Regional leds",type:null,smg:null},
  {row:32,si:"SI 2.2",output:"Output 2.2.2",activity:"Engage in EU, South Asia, Africa and LAC regional policy forums to advance shared advocacy positions",owner:"Policy",contrib:"Regional Leads",type:null,smg:null},
  {row:33,si:"SI 2.2",output:"Output 2.2.2",activity:"Profile GNDR in non-DRR spaces (broadening reach and influence)",owner:"FRIMCO",contrib:"Policy, Regional Leads",type:"N",smg:"S/M/G"},
  {row:34,si:"SI 2.2",output:"Output 2.2.2",activity:"Engage with the REAP board and its policy work",owner:"ED + Policy",contrib:"FRIMCO, Programmes, Regional Leads",type:null,smg:null},
  {row:35,si:"SI 2.2",output:"Output 2.2.2",activity:"Engage in SOFF processes and with Concord and Bond UK",owner:"ED",contrib:"Policy, Programmes",type:null,smg:null},
  {row:36,si:"SI 2.2",output:"Output 2.2.3",activity:"Use disaster risk financing research findings in advocacy",owner:"Policy",contrib:"FRIMCO, Programmes",type:null,smg:null},
  {row:37,si:"SI 2.2",output:"Output 2.2.3",activity:"Engage multilateral and financing actors on trust-based financing",owner:"FRIMCO",contrib:"ED, Regional Leads, Programmes, Policy",type:null,smg:null},
  {row:38,si:"SI 2.2",output:"Output 2.2.3",activity:"Give Us One Day campaign as the advocacy ask for trust-based EWS financing (co-led with REAP)",owner:"FRIMCO",contrib:"Policy, Programmes, Regional Leads",type:"Q",smg:"S/G"},
  {row:39,si:"SI 2.2",output:"Output 2.2.3",activity:"Raise visibility on IDDRR, DRR financing and women in DRR (webinars and campaigns)",owner:"Policy",contrib:"FRIMCO, Programmes, Regional Leads",type:"N",smg:"S/M/G"},
  {row:40,si:"SI 3.1",output:"Output 3.1.1",activity:"Launch the new strategy and deliver supporting strategic communications",owner:"FRIMCO",contrib:"",type:"Q",smg:"S/M/G"},
  {row:41,si:"SI 3.1",output:"Output 3.1.1",activity:"Produce member- and community-led storytelling that articulates GNDR’s identity and value",owner:"FRIMCO",contrib:"Regional Leads",type:"N",smg:"S/M/G"},
  {row:42,si:"SI 3.1",output:"Output 3.1.1",activity:"Produce a reimagined Annual Report",owner:"FRIMCO",contrib:"",type:"Q",smg:"S/M/G"},
  {row:43,si:"SI 3.1",output:"Output 3.1.1",activity:"Create a public-facing visual network map of the membership",owner:"FRIMCO",contrib:"",type:"Q",smg:"S/M/G"},
  {row:44,si:"SI 3.1",output:"Output 3.1.1",activity:"Communications/comms guidance embedded across GNDR projects so member stories and GNDR identity are consistently captured and shared",owner:"FRIMCO",contrib:"",type:null,smg:null},
  {row:45,si:"SI 3.1",output:"Output 3.1.2",activity:"Hold Regional Advisory Group (RAG) and National Coordination meetings across all regions",owner:"Regional Leads",contrib:"Policy, Programmes, FRIMCO",type:"N",smg:"S/M/G"},
  {row:46,si:"SI 3.1",output:"Output 3.1.2",activity:"Support Global Board engagement and track governance performance KPIs",owner:"ED",contrib:"SLT",type:"N",smg:"S/M/G"},
  {row:47,si:"SI 3.1",output:"Output 3.1.2",activity:"Region's RAG, NCM and NFP delivery.",owner:"Regional Lead (Americas & Caribbean)",contrib:"",type:"N",smg:"S/M/G"},
  {row:48,si:"SI 3.1",output:"Output 3.1.2",activity:"Region's RAG, NCM and NFP delivery.",owner:"Regional Lead (Asia & Europe)",contrib:"",type:"N",smg:"S/M/G"},
  {row:49,si:"SI 3.1",output:"Output 3.1.2",activity:"Region's RAG, NCM and NFP delivery.",owner:"Regional Lead (Africa & West Asia)",contrib:"",type:"N",smg:"S/M/G"},
  {row:50,si:"SI 3.1",output:"Output 3.1.3",activity:"Refresh the Community Platform and improve member-data quality",owner:"Membership Engagement",contrib:"FRIMCO, Regional Leads",type:"Q",smg:"S/M"},
  {row:51,si:"SI 3.1",output:"Output 3.1.3",activity:"Run the annual member survey",owner:"Membership Engagement + FRIMCO",contrib:"Regional Leads",type:null,smg:null},
  {row:52,si:"SI 3.1",output:"Output 3.1.3",activity:"Track member contribution and participation, and recognise members’ contributions",owner:"Membership Engagement",contrib:"FRIMCO, Regional Leads",type:null,smg:null},
  {row:53,si:"S 3.1",output:"Output 3.1.3",activity:"Returning co-created evidence and advocacy products to members so they can use them in their own contexts",owner:"Policy",contrib:"FRIMCO, Regional Leads",type:null,smg:null},
  {row:54,si:"SI 3.1",output:"Output 3.1.4",activity:"Plan and conduct the Global Summit (held every 2 years)",owner:"ED",contrib:"SLT",type:null,smg:null},
  {row:55,si:"SI 3.1",output:"Output 3.1.4",activity:"Reactivate the Risk Drivers Working Groups",owner:"Risk Drivers Lead",contrib:"Regional Leads, Programmes, Membership Engagement",type:null,smg:null},
  {row:56,si:"SI 3.1",output:"Output 3.1.4",activity:"Enable thematic collaboration between members through the Community Platform",owner:"Membership Engagement",contrib:"Risk Drivers Lead, Programmes, Policy",type:null,smg:null},
  {row:57,si:"SI 3.1",output:"Output 3.1.4",activity:"Strengthen mechanisms for solidarity and mutual support between members",owner:"Membership Engagement",contrib:"Regional Leads",type:null,smg:null},
  {row:58,si:"SI 3.2",output:"Output 3.2.1",activity:"Build new strategic partnerships and steward existing donors",owner:"FRIMCO",contrib:"ED, Programmes, Policy, Regional Leads",type:"N",smg:"S/G"},
  {row:59,si:"SI 3.2",output:"Output 3.2.1",activity:"Develop the Foresight Fund for 2027 launch",owner:"FRIMCO",contrib:"ED, Programmes, Policy, Regional Leads",type:"Q",smg:"S/G"},
  {row:60,si:"SI 3.2",output:"Output 3.2.1",activity:"Strengthen fundraising systems and policies",owner:"FRIMCO",contrib:"",type:"Q",smg:"S/G"},
  {row:61,si:"SI 3.2",output:"Output 3.2.1",activity:"Fundraising for Give Us One Day funding mechanism (co-led with REAP)",owner:"FRIMCO",contrib:"ED, Programmes, Policy, Regional Leads",type:null,smg:null},
  {row:62,si:"SI 3.2",output:"Output 3.2.2",activity:"Run regional calls to activate fundraising, storytelling and impact",owner:"FRIMCO",contrib:"Regional Leads, Programmes",type:"N",smg:"S/M"},
  {row:63,si:"SI 3.2",output:"Output 3.2.2",activity:"Document member fundraising contributions through shared reporting",owner:"FRIMCO",contrib:"",type:null,smg:null},
  {row:64,si:"SI 3.2",output:"Output 3.2.3",activity:"Operationalise the network-level MEAL framework, including baseline data collection",owner:"FRIMCO",contrib:"Programmes, Policy, Regional Leads",type:null,smg:null},
  {row:65,si:"SI 3.2",output:"Output 3.2.3",activity:"Develop data infrastructure, a 3-year financial (scenario) model and the Strategic Coverage Table",owner:"Operations",contrib:"ED, FRIMCO",type:null,smg:null},
  {row:66,si:"SI 3.2",output:"Output 3.2.3",activity:"Integrate collaboration metrics into donor reporting",owner:"FRIMCO",contrib:"",type:null,smg:null},
  {row:67,si:"SI 3.2",output:"Output 3.2.4",activity:"Strengthen governance and financial-management systems",owner:"ED",contrib:"Operations",type:"Q",smg:"S/G"},
  {row:68,si:"SI 3.2",output:"Output 3.2.4",activity:"Complete audit and compliance requirements",owner:"Operations",contrib:"",type:null,smg:null},
  {row:69,si:"SI 3.2",output:"Output 3.2.4",activity:"Strengthen risk management and business continuity",owner:"Operations",contrib:"ED, FRIMCO, Programmes, Policy, Regional Leads",type:null,smg:null},
  {row:70,si:"SI 3.2",output:"Output 3.2.4",activity:"Strengthen talent management and staff wellbeing",owner:"Operations",contrib:"SLT",type:null,smg:null},
  {row:71,si:"SI 3.2",output:"Output 3.2.4",activity:"Update organisational policies and operational systems",owner:"Operations",contrib:"SLT",type:null,smg:null},
  {row:72,si:"SI 3.2",output:"Output 3.2.4",activity:"Convene the face-to-face governance board meeting",owner:"ED",contrib:"SLT",type:null,smg:null}
];

const OUTPUTS = [
  {id:"1.1.1",goal:"Goal 1",si:"SI 1.1 — Harnessing practice-led learning",short:"Practices & innovations documented",y1:"At least 20 member- and community-led practices, innovations, case studies or stories documented and synthesised in 2026-27.",y24:"Outcome milestone: At least 100 additional practices, innovations, case studies or stories documented during 2027-30, bringing the cumulative total to at least 120 by 2030, with representation across all regions and major risk-driver themes."},
  {id:"1.1.2",goal:"Goal 1",si:"SI 1.1 — Harnessing practice-led learning",short:"Guidance & tools co-developed with members",y1:"At least 3 practical guidance, tool or learning products co-developed, tested and shared with members and communities in 2026-27, with a mechanism established to track subsequent adaptation and use.",y24:"Outcome milestone: At least 6 practical guidance or tool products in active use by 2030, with evidence of adaptation or use in at least 15 countries, building on the tracking mechanism established in Year 1."},
  {id:"1.1.3",goal:"Goal 1",si:"SI 1.1 — Harnessing practice-led learning",short:"Solutions co-designed, tested & validated",y1:"At least 7 locally led risk-informed resilience solutions co-designed, tested and validated with communities in 2026-27 through the community-led landslide resilience work in Ethiopia and Nepal.",y24:"Outcome milestone: At least 5 additional locally led risk-informed resilience solutions co-designed, tested and validated during 2027-30 through the Climate-Smart Landslide Detection work in Kyrgyzstan and further sites, bringing the cumulative total to at least 12 by 2030."},
  {id:"1.2.1",goal:"Goal 1",si:"SI 1.2 — Generating persuasive evidence",short:"Evidence co-generated on knowledge gaps",y1:"7 co-creation workshops/participatory consultations held under the LRF Ethiopia & Nepal work in 2026-27, reaching 7 communities and 3,150+ people, plus community survey/baseline work in Kiribati and Tonga (2,800 people). Total Year 1: at least 7 communities and 5,950+ people reached.",y24:"Outcome milestone: At least 25,000 additional people reached through evidence co-generation during 2027-30, bringing the cumulative total to approximately 31,000 people by 2030."},
  {id:"1.2.2",goal:"Goal 1",si:"SI 1.2 — Generating persuasive evidence",short:"Research collaborations strengthen evidence",y1:"At least 2 formal collaborations with research institutions established (UCL/CDP, IIED).",y24:"Outcome milestone: At least 5 collaborations with research institutions active by 2030, with at least 3 joint research or evidence products delivered."},
  {id:"1.2.3",goal:"Goal 1",si:"SI 1.2 — Generating persuasive evidence",short:"Evidence amplified to decision-makers",y1:"1 global call to action (towards COP) and 2 regional policy events in which GNDR members will participate delivered in 2026-27.",y24:"Outcome milestone: Up to 10 policy products across the strategy period (CoP, Global Summit, Global Platform and Regional Platforms, PPED)."},
  {id:"2.1.1",goal:"Goal 2",si:"SI 2.1 — Unlocking locally-led change",short:"Ecosystem analysis & collaboration pathways",y1:"4 cross-exchange learning workshops with regional stakeholders held in 2026-27, supporting regional work plans for the Global Strategy rollout.",y24:"Outcome milestone: At least 20 ecosystem analyses or collaboration roadmaps developed by 2030, informing member engagement in at least 15 national or local DRR systems."},
  {id:"2.1.2",goal:"Goal 2",si:"SI 2.1 — Unlocking locally-led change",short:"Member policy & advocacy capacity",y1:"1 policy-focused Local Leadership Academy webinar delivered in 2026-27, reaching approximately 50 members.",y24:"Outcome milestone: Up to 2 additional policy-focused Local Leadership Academy webinars delivered during 2027-30 (bringing the total to 3 across the strategy period), reaching a cumulative total of approximately 150 members."},
  {id:"2.1.3",goal:"Goal 2",si:"SI 2.1 — Unlocking locally-led change",short:"Convening members with policymakers",y1:"3 country workshops convening CSOs and DRM institutions to validate the Pre-Evacuation Platform in LAC, plus at least 2 new dialogue/decision-making spaces opened per region for member participation in 2026-27.",y24:"Outcome milestone: At least 24 additional dialogue/decision-making spaces opened during 2027-30, bringing the cumulative total to at least 30 spaces by 2030, with evidence of follow-up or influence in at least 15 national or local systems."},
  {id:"2.2.1",goal:"Goal 2",si:"SI 2.2 — Influencing the next horizon of local leadership",short:"Evidence translated into policy asks",y1:"4 NGO constituency meetings for SEM facilitated, with monthly SEM advisory group support in 2026-27.",y24:"Outcome milestone: At least 8 co-created policy or advocacy products delivered during 2027-30."},
  {id:"2.2.2",goal:"Goal 2",si:"SI 2.2 — Influencing the next horizon of local leadership",short:"Shared advocacy across global processes",y1:"10 members facilitated to attend UNFCCC events (SB64, COP31); 150 members engaged in GNDR's COP31 call to action; 4 side events delivered; sustained engagement in EU and South Asia Regional Policy Forums; GNDR profiled on 2+ non-DRR platforms in 2026-27.",y24:"Outcome milestone: At least 12 priority regional/international processes engaged by 2030 (all regions), with evidence of GNDR's influence documented in at least 6."},
  {id:"2.2.3",goal:"Goal 2",si:"SI 2.2 — Influencing the next horizon of local leadership",short:"Advocacy for trust-based financing",y1:"IDDRR webinar reaching 60+ members; joint GNDR/REAP 'Give Us One Day' campaign launched, targeting $28M for the missing last-mile EWS layer; webinar on 'Localisation of DRR Financing' research findings delivered; continued support to the LAC Network of Women in DRR in 2026-27.",y24:"Outcome milestone: At least 4 financing recommendations or collective advocacy initiatives advanced by 2030, with documented changes in the policy, practice or funding mechanisms of at least 3 target institutions."},
  {id:"3.1.1",goal:"Goal 3",si:"SI 3.1 — Strengthening the GNDR identity and member experience",short:"Identity communicated through member stories",y1:"20+ diverse member-led stories collected across all regions (30+ stretch), in 2+ languages; Strategy and identity communicated across all channels by end Q1, with 400+ new followers/quarter and 8 public newsletters published in 2026-27.",y24:"Outcome milestone: At least 100 diverse member and community stories collected and amplified by 2030, representing all regions and published in multiple languages, with evidence of increased audience reach and engagement from the 2027 baseline."},
  {id:"3.1.2",goal:"Goal 3",si:"SI 3.1 — Strengthening the GNDR identity and member experience",short:"Inclusive governance & representation",y1:"Approximately 12 RAG meetings (4 per region) and 28 National Coordination Meetings supported in 2026-27, with NFPs mobilised; 12 Board Working Group meetings organised; Global Board performance KPIs implemented.",y24:"Outcome milestone: Governance meeting participation and leadership sustained annually through 2030, disaggregated by region, gender, age, disability and organisational type, with at least 60% of governance roles reflecting diverse representation."},
  {id:"3.1.3",goal:"Goal 3",si:"SI 3.1 — Strengthening the GNDR identity and member experience",short:"Member engagement & feedback mechanisms",y1:"Community Platform refreshed and adopted (at least 6 improvements), with post-Summit member-data update and at least 50% expertise-mapping coverage; annual member survey redesigned (shorter, 3+ languages) and analysed in 2026-27.",y24:"Outcome milestone: Annual member survey conducted and acted upon; at least 70% of active members have updated profiles or expertise data by 2030; platform engagement increases annually from the 2027 baseline."},
  {id:"3.1.4",goal:"Goal 3",si:"SI 3.1 — Strengthening the GNDR identity and member experience",short:"Connection, solidarity & mutual support",y1:"Network map live and publicly accessible, with evidence of external use; 4 Risk Drivers Working Groups reactivated with at least 12 meetings and 300 members participating; participatory storytelling approach scoped and piloted in at least 1 region.",y24:"Outcome milestone: Two Global Summits convened; four Risk Driver Groups maintained with at least 500 participating members; and at least 24 regional or thematic peer-learning and solidarity exchanges facilitated by 2030."},
  {id:"3.2.1",goal:"Goal 3",si:"SI 3.2 — Ensuring a resilient and sustainable network",short:"Funding partnerships diversified",y1:"5-7 strategically aligned multi-year partnerships secured (20% unrestricted income); Foresight Fund governance approved with 2 anchor partners secured toward a 5-6 foundation target by 2027; progress tracked toward the $28M 'Give Us One Day' ask.",y24:"Outcome milestone: At least 5 additional multi-year strategic funding partnerships secured during 2027-30, bringing the cumulative total to 10-12 by 2030; the Foresight Fund reaches its full 5-6 foundation-partner target, up from the 2 anchors secured in Year 1."},
  {id:"3.2.2",goal:"Goal 3",si:"SI 3.2 — Ensuring a resilient and sustainable network",short:"Members connected to funding opportunities",y1:"13 regional calls delivered to activate fundraising, storytelling and impact reporting across NFPs/RAGs; Go/No-Go policy and Fundraising Strategy approved in 2026-27.",y24:"Outcome milestone: At least 100 members connected to relevant funding, consortium or partnership opportunities by 2030, with the value and outcomes of successful opportunities tracked."},
  {id:"3.2.3",goal:"Goal 3",si:"SI 3.2 — Ensuring a resilient and sustainable network",short:"GNDR value evidenced for accountability",y1:"2026-30 MEAL framework documented, staff trained and in active use; Strategic Coverage Table and 3-year financial model populated and reviewed; at least 50 member contributions documented (aspirational); collaboration metrics included in 3+ donor reports.",y24:"Outcome milestone: Annual strategy performance reports produced, including member contribution, benefit, influence and collaboration data; at least 20 substantiated stories of network-level change documented by 2030."},
  {id:"3.2.4",goal:"Goal 3",si:"SI 3.2 — Ensuring a resilient and sustainable network",short:"Institutional systems strengthened",y1:"Clean audit and statutory accounts delivered on time; policies and Risk Register updated; staffing gaps filled within 3 months; Staff Wellbeing & Workload survey conducted; Speak Up channel and safeguarding/manager training in place.",y24:"Outcome milestone: Clean annual audits and statutory compliance maintained; key institutional policies and risk systems reviewed annually; staff wellbeing, safeguarding and operational capacity monitored and improved."},
];

const TEAMS = ["Programmes","Policy","FRIMCO","Membership Engagement","Operations","ED","Risk Drivers Lead","Regional Lead (Americas & Caribbean)","Regional Lead (Asia & Europe)","Regional Lead (Africa & West Asia)","Regional Leads","SLT"];

// Admins can edit the Indicator dashboard and each activity's Type (Q/N) and
// S·M·G fields. Everyone else ("Editor") can only edit their own team's
// quarterly updates in "My activities". Add/remove emails here as needed —
// this is a simple allowlist, not a real auth-role system.
const ADMIN_EMAILS = ["diana.apache@gndr.org", "vera.exnerova@gndr.org", "marcos.concepcionraba@gndr.org", "shivangi.chavda@gndr.org"];
function isAdminEmail(email) {
  return ADMIN_EMAILS.includes((email || "").toLowerCase());
}
const QUARTERS = ["Q1","Q2","Q3","Q4"];

const SI_DASHBOARD = [
{si:"1.1",goal:"Goal 1",title:"SI 1.1 — Harnessing practice-led learning",indicators:[{letter:"a",text:"% of members who reported their local solutions were validated/recognised through and/or with support of GNDR",question:"One row per member whose solution was validated/recognised. % is calculated against total active members.",fields:[{key:"member",label:"Member name"},{key:"solution",label:"Solution/practice validated"}],hasDenominator:true,denominatorLabel:"Total active members (denominator)",coverage:[{output:"1.1.1",rating:"no"},{output:"1.1.2",rating:"no"},{output:"1.1.3",rating:"yes"}]},{letter:"b",text:"# of members who contributed approaches/innovations to the network",question:"One row per member who contributed. The count of rows is the reported figure.",fields:[{key:"member",label:"Member name"},{key:"country",label:"Country of origin"},{key:"approach",label:"Approach / innovation name"}],coverage:[{output:"1.1.1",rating:"yes"},{output:"1.1.2",rating:"yes"},{output:"1.1.3",rating:"yes"}]}]},
{si:"1.2",goal:"Goal 1",title:"SI 1.2 — Generating persuasive evidence",indicators:[{letter:"a",text:"Stories of how GNDR amplification led to recognition/adoption of member solutions",question:"One row per story.",fields:[{key:"story",label:"Story name"},{key:"member",label:"Member name"}],coverage:[{output:"1.2.1",rating:"indirectly"},{output:"1.2.2",rating:"no"},{output:"1.2.3",rating:"likely"}]},{letter:"b",text:"# of member-led initiatives showcased/amplified through GNDR platforms",question:"One row per initiative showcased.",fields:[{key:"initiative",label:"Initiative name"},{key:"platform",label:"Platform used"}],coverage:[{output:"1.2.1",rating:"no"},{output:"1.2.2",rating:"no"},{output:"1.2.3",rating:"yes"}]},{letter:"c",text:"# of collaborations with research institutions",question:"One row per collaboration.",fields:[{key:"institution",label:"Research institution name"}],coverage:[{output:"1.2.1",rating:"no"},{output:"1.2.2",rating:"yes"},{output:"1.2.3",rating:"no"}]},{letter:"d",text:"Evidence that GNDR's collective voice influenced DRR frameworks/institutions/investments/research",question:"One row per piece of evidence.",fields:[{key:"evidence",label:"Evidence name"},{key:"member",label:"Member name"}],coverage:[{output:"1.2.1",rating:"indirectly"},{output:"1.2.2",rating:"indirectly"},{output:"1.2.3",rating:"likely"}]}]},
{si:"2.1",goal:"Goal 2",title:"SI 2.1 — Unlocking locally-led change",indicators:[{letter:"a",text:"# of members who gained access to DRR ecosystem spaces through GNDR",question:"One row per member.",fields:[{key:"member",label:"Member name"}],coverage:[{output:"2.1.1",rating:"likely"},{output:"2.1.2",rating:"no"},{output:"2.1.3",rating:"yes"}]},{letter:"b",text:"# members recognised as legitimate/valuable DRR/climate actors in their own contexts",question:"One row per member.",fields:[{key:"member",label:"Member name"}],coverage:[{output:"2.1.1",rating:"no"},{output:"2.1.2",rating:"no"},{output:"2.1.3",rating:"likely"}]},{letter:"c",text:"# national and/or local systems supported or influenced (SDC indicator)",question:"One row per system.",fields:[{key:"system",label:"System name (local/national)"}],coverage:[{output:"2.1.1",rating:"yes"},{output:"2.1.2",rating:"no"},{output:"2.1.3",rating:"likely"}]},{letter:"d",text:"# of climate change, DRR and environmental policies and/or legal frames supported (SDC indicator)",question:"One row per policy/legal framework.",fields:[{key:"policy",label:"Policy / legal framework name"}],coverage:[{output:"2.1.1",rating:"no"},{output:"2.1.2",rating:"likely"},{output:"2.1.3",rating:"no"}]}]},
{si:"2.2",goal:"Goal 2",title:"SI 2.2 — Influencing the next horizon of local leadership",indicators:[{letter:"a",text:"Evidence that member perspectives/data shaped international frameworks",question:"One row per piece of evidence/data.",fields:[{key:"evidence",label:"Evidence/data name"},{key:"framework",label:"Framework shaped"},{key:"member",label:"Member name"}],coverage:[{output:"2.2.1",rating:"yes"},{output:"2.2.2",rating:"no"},{output:"2.2.3",rating:"no"}]},{letter:"b",text:"# processes engaged that reflect language/concepts from GNDR advocacy and evidence",question:"One row per process.",fields:[{key:"process",label:"Process name (e.g. UNFCCC SB64, COP31)"}],coverage:[{output:"2.2.1",rating:"yes"},{output:"2.2.2",rating:"yes"},{output:"2.2.3",rating:"no"}]},{letter:"c",text:"# references to GNDR advocacy and evidence by target organisations",question:"One row per reference.",fields:[{key:"organisation",label:"Organisation that made the reference"}],coverage:[{output:"2.2.1",rating:"yes"},{output:"2.2.2",rating:"no"},{output:"2.2.3",rating:"no"}]},{letter:"d",text:"# of members who represented grassroots perspectives in international forums",question:"One row per member.",fields:[{key:"member",label:"Member name"},{key:"forum",label:"Forum name"}],coverage:[{output:"2.2.1",rating:"no"},{output:"2.2.2",rating:"yes"},{output:"2.2.3",rating:"no"}]},{letter:"e",text:"# of climate change, DRR and environmental policies and/or legal frames supported (SDC indicator)",question:"One row per policy/legal frame.",fields:[{key:"policy",label:"Policy / legal frame name"}],coverage:[{output:"2.2.1",rating:"no"},{output:"2.2.2",rating:"no"},{output:"2.2.3",rating:"yes"}]}]},
{si:"3.1",goal:"Goal 3",title:"SI 3.1 — Strengthening the GNDR identity and member experience",indicators:[{letter:"a",text:"# of members actively contributing (knowledge, leadership, time, facilitation, solidarity)",question:"One row per member.",fields:[{key:"member",label:"Member name"},{key:"type",label:"Type of contribution (knowledge/leadership/time/facilitation/solidarity)"}],coverage:[{output:"3.1.1",rating:"likely"},{output:"3.1.2",rating:"yes"},{output:"3.1.3",rating:"yes"},{output:"3.1.4",rating:"likely"}]},{letter:"b",text:"# of members actively benefitting from membership",question:"One row per member.",fields:[{key:"member",label:"Member name"},{key:"benefit",label:"Type of benefit received"}],coverage:[{output:"3.1.1",rating:"no"},{output:"3.1.2",rating:"no"},{output:"3.1.3",rating:"via member survey"},{output:"3.1.4",rating:"likely"}]},{letter:"c",text:"# of members in leadership roles (diverse representation)",question:"One row per member.",fields:[{key:"member",label:"Member name"},{key:"role",label:"Leadership role"},{key:"group",label:"Diverse representation group (gender/age/disability/org type)"}],coverage:[{output:"3.1.1",rating:"no"},{output:"3.1.2",rating:"yes"},{output:"3.1.3",rating:"no"},{output:"3.1.4",rating:"no"}]},{letter:"d",text:"Indicators of observed behaviour (Community Platform use, contributions, attendance)",question:"One row per observed behaviour.",fields:[{key:"member",label:"Member name"},{key:"behaviour",label:"Behaviour (Platform use / contribution / attendance)"},{key:"date",label:"Date"}],coverage:[{output:"3.1.1",rating:"no"},{output:"3.1.2",rating:"no"},{output:"3.1.3",rating:"yes"},{output:"3.1.4",rating:"likely"}]}]},
{si:"3.2",goal:"Goal 3",title:"SI 3.2 — Ensuring a resilient and sustainable network",indicators:[{letter:"a",text:"# and breakdown of sources of funding for GNDR",question:"One row per funding source.",fields:[{key:"source",label:"Funding source name"},{key:"amount",label:"Amount (if known)"}],coverage:[{output:"3.2.1",rating:"yes"},{output:"3.2.2",rating:"no"},{output:"3.2.3",rating:"indirectly"},{output:"3.2.4",rating:"indirectly"}]},{letter:"b",text:"# of members who gained opportunities through the network",question:"One row per member.",fields:[{key:"member",label:"Member name"},{key:"opportunity",label:"Opportunity gained"}],coverage:[{output:"3.2.1",rating:"no"},{output:"3.2.2",rating:"yes"},{output:"3.2.3",rating:"no"},{output:"3.2.4",rating:"no"}]},{letter:"c",text:"# members financially sustainable and with diversified resourcing",question:"One row per member.",fields:[{key:"member",label:"Member name"},{key:"resourcing",label:"Diversified resourcing"}],coverage:[{output:"3.2.1",rating:"likely"},{output:"3.2.2",rating:"no"},{output:"3.2.3",rating:"no"},{output:"3.2.4",rating:"no"}]}]}
];

/* ============================== TOKENS ============================== */

const C = {
  ink: "#1B2B33",
  inkSoft: "#5B5B5B",
  paper: "#FAFAF9",
  paperRaised: "#FFFFFF",
  line: "#E2E2E2",
  lineSoft: "#EDEDED",
  teal: "#0092B6",
  tealDeep: "#006B87",
  tealTint: "#E3F3F6",
  amberBrand: "#F59C00",
  amberBrandTint: "#FDF1DC",
  green: "#3F9142",
  greenBg: "#E5F1E5",
  amber: "#C97C00",
  amberBg: "#FBEBD0",
  red: "#C2452F",
  redBg: "#F6E1DB",
  muted: "#8A8F91",
};

function confidenceInfo(v) {
  if (v == null) return { label: "Not yet reported", color: C.muted, bg: "#EDE9DD" };
  if (v <= 3) return { label: "Off track", color: C.red, bg: C.redBg };
  if (v <= 5) return { label: "At risk", color: C.amber, bg: C.amberBg };
  if (v <= 7) return { label: "Moderate", color: C.amber, bg: C.amberBg };
  if (v <= 9) return { label: "On track", color: C.green, bg: C.greenBg };
  return { label: "Achieved", color: C.green, bg: C.greenBg };
}

/* ============================== SMALL UI PIECES ============================== */

function QuarterTrack({ statuses, size = "sm" }) {
  // statuses: {Q1: 1-10|null, Q2:..., Q3:..., Q4:...}
  const dim = size === "sm" ? 26 : 34;
  return (
    <div className="flex items-center">
      {QUARTERS.map((q, i) => {
        const v = statuses[q];
        const info = confidenceInfo(v);
        return (
          <React.Fragment key={q}>
            <div
              title={`${q}: ${info.label}${v ? ` (${v}/10)` : ""}`}
              style={{
                width: dim, height: dim, borderRadius: 999,
                background: v != null ? info.bg : "transparent",
                border: `1.5px solid ${v != null ? info.color : C.line}`,
                color: info.color,
                fontSize: size === "sm" ? 9 : 10,
                fontWeight: 700,
              }}
              className="flex items-center justify-center shrink-0"
            >
              {q}
            </div>
            {i < QUARTERS.length - 1 && (
              <div style={{ width: 14, height: 1.5, background: C.line }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Pill({ children, color, bg }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: color || C.inkSoft, background: bg || C.lineSoft }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      className="text-xs font-semibold mb-2"
      style={{ color: C.muted, letterSpacing: "0.02em" }}
    >
      {children}
    </div>
  );
}

/* ============================== IDENTITY PICKER ============================== */

function IdentityPicker({ onSelect, loading }) {
  const [googleProfile, setGoogleProfile] = useState(null);
  const [team, setTeam] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (googleProfile) return; // already signed in, don't re-render the button
    renderGoogleSignIn("google-signin-button")
      .then(setGoogleProfile)
      .catch((e) => setAuthError(e.message || "Sign-in failed"));
  }, [googleProfile]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: C.paper }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ border: `3px solid ${C.amberBrand}` }}
            >
              <span className="text-[10px] font-extrabold" style={{ color: C.inkSoft }}>
                GNDR
              </span>
            </div>
            <div className="text-xs font-semibold" style={{ color: C.teal, letterSpacing: "0.02em" }}>
              Global Strategy 2026-2030 Monitoring
            </div>
          </div>
          <h1 className="text-3xl font-extrabold leading-tight" style={{ color: C.teal }}>
            Who's checking in?
          </h1>
          <div className="h-[3px] w-16 mt-3 mb-4" style={{ background: C.amberBrand }} />
          <p className="text-sm" style={{ color: C.inkSoft }}>
            Sign in with your Google account, then pick your team so we can
            show you the activities and targets you own.
          </p>
        </div>

        <div className="space-y-4">
          {!googleProfile ? (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: C.ink }}>
                Sign in
              </label>
              <div id="google-signin-button" />
              {authError && (
                <p className="text-xs mt-2" style={{ color: C.red }}>{authError}</p>
              )}
            </div>
          ) : (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-md"
              style={{ border: `1.5px solid ${C.line}`, background: C.paperRaised }}
            >
              {googleProfile.picture && (
                <img src={googleProfile.picture} alt="" className="w-8 h-8 rounded-full" />
              )}
              <div>
                <div className="text-sm font-semibold" style={{ color: C.ink }}>{googleProfile.name}</div>
                <div className="text-xs" style={{ color: C.muted }}>{googleProfile.email}</div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: C.ink }}>
              Your team
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEAMS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTeam(t)}
                  className="text-left px-3 py-2 rounded-md text-sm transition-colors"
                  style={{
                    border: `1.5px solid ${team === t ? C.teal : C.line}`,
                    background: team === t ? C.teal : C.paperRaised,
                    color: team === t ? "#fff" : C.ink,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!googleProfile || !team || loading}
            onClick={() =>
              onSelect({ name: googleProfile.name, email: googleProfile.email, team })
            }
            className="w-full mt-2 px-4 py-2.5 rounded-md text-sm font-extrabold transition-opacity"
            style={{
              background: C.teal,
              color: "#fff",
              opacity: !googleProfile || !team || loading ? 0.4 : 1,
            }}
          >
            {loading ? "Loading…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== UPDATE FORM (drawer) ============================== */

function UpdateDrawer({ activity, quarter, existing, onClose, onSave, identity }) {
  const [plan, setPlan] = useState(existing?.plan || "");
  const [whatHappened, setWhatHappened] = useState(existing?.whatHappened || "");
  const [adaptation, setAdaptation] = useState(existing?.adaptation || "");
  const [confidence, setConfidence] = useState(existing?.confidence ?? 6);
  const [saving, setSaving] = useState(false);

  const info = confidenceInfo(confidence);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      plan, whatHappened, adaptation, confidence,
      updatedBy: identity.name, updatedTeam: identity.team,
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(28,43,43,0.35)" }}>
      <div
        className="w-full max-w-lg h-full overflow-y-auto"
        style={{ background: C.paper, borderLeft: `1px solid ${C.line}` }}
      >
        <div
          className="sticky top-0 flex items-start justify-between px-6 py-5"
          style={{ background: C.paper, borderBottom: `1px solid ${C.line}` }}
        >
          <div>
            <div className="text-xs font-semibold mb-1" style={{ color: C.teal }}>
              {activity.output} · {quarter} 2026-27
            </div>
            <div className="text-base font-medium leading-snug" style={{ color: C.ink }}>
              {activity.activity}
            </div>
          </div>
          <button onClick={onClose} className="p-1 shrink-0 ml-3">
            <X size={20} color={C.inkSoft} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {(() => {
            const outputId = activity.output.replace("Output ", "");
            const siId = outputId.split(".").slice(0, 2).join(".");
            const target = OUTPUTS.find((o) => o.id === outputId)?.y1;
            const indicators = (SI_DASHBOARD.find((s) => s.si === siId)?.indicators || [])
              .filter((ind) => ind.coverage.some((c) => c.output === outputId && ratingInfo(c.rating).weight > 0));
            if (!target && indicators.length === 0) return null;
            return (
              <div
                className="text-xs leading-relaxed px-3.5 py-3 rounded-lg"
                style={{ background: C.tealTint, color: C.tealDeep }}
              >
                <div className="font-semibold mb-1">This activity contributes to:</div>
                {target && (
                  <div className="mb-2">
                    <span className="font-medium">2026-27 target — </span>{target}
                  </div>
                )}
                {indicators.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span>Feeds indicator{indicators.length > 1 ? "s" : ""}:</span>
                    {indicators.map((ind) => (
                      <span
                        key={ind.letter}
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                        style={{ background: "#fff", color: C.tealDeep }}
                      >
                        ({ind.letter}) {ind.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: C.ink }}>
              Plan — what's planned or delivered this quarter
            </label>
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              rows={3}
              placeholder="The quarter, and what is planned or delivered in it."
              className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none"
              style={{ border: `1.5px solid ${C.line}`, background: C.paperRaised, color: C.ink }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: C.ink }}>
              What happened & key observations
            </label>
            <textarea
              value={whatHappened}
              onChange={(e) => setWhatHappened(e.target.value)}
              rows={3}
              placeholder="Narrative — filled at quarter-end."
              className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none"
              style={{ border: `1.5px solid ${C.line}`, background: C.paperRaised, color: C.ink }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: C.ink }}>
              Adaptation / next change
            </label>
            <textarea
              value={adaptation}
              onChange={(e) => setAdaptation(e.target.value)}
              rows={2}
              placeholder="Narrative — filled at quarter-end."
              className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none"
              style={{ border: `1.5px solid ${C.line}`, background: C.paperRaised, color: C.ink }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium" style={{ color: C.ink }}>
                Confidence the annual target will be met
              </label>
              <Pill color={info.color} bg={info.bg}>
                {confidence}/10 · {info.label}
              </Pill>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: info.color }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: C.muted }}>
              <span>1 · Off track</span>
              <span>10 · Certain</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-2 px-4 py-2.5 rounded-md text-sm font-semibold"
            style={{ background: C.teal, color: "#fff", opacity: saving ? 0.5 : 1 }}
          >
            {saving ? "Saving…" : `Save ${quarter} update`}
          </button>
          {existing?.updatedBy && (
            <p className="text-xs" style={{ color: C.muted }}>
              Last updated by {existing.updatedBy} ({existing.updatedTeam})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== ACTIVITY ROW ============================== */

function TypeSmgBadges({ activity, meta, isAdmin, onSetTypeSmg }) {
  const [editing, setEditing] = useState(false);
  const effType = meta?.type || activity.type || "";
  const effSmg = meta?.smg || activity.smg || "";
  const smgSet = new Set(effSmg.split("/").map((s) => s.trim()).filter(Boolean));

  const toggleSmg = (letter) => {
    const next = new Set(smgSet);
    if (next.has(letter)) next.delete(letter); else next.add(letter);
    const order = ["S", "M", "G"];
    onSetTypeSmg(activity.row, { smg: order.filter((l) => next.has(l)).join("/") });
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center gap-1.5">
        {effType && <Pill color={C.tealDeep} bg={C.tealTint}>{effType === "Q" ? "Qualitative" : "Numeric"}</Pill>}
        {effSmg && <Pill color={C.inkSoft} bg={C.lineSoft}>{effSmg}</Pill>}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setEditing((v) => !v); }}
        className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md"
        style={{ border: `1.5px dashed ${C.teal}` }}
        title="Admin: click to edit Type / S·M·G"
      >
        {effType ? <Pill color={C.tealDeep} bg={C.tealTint}>{effType === "Q" ? "Qualitative" : "Numeric"}</Pill> : <Pill color={C.muted} bg={C.lineSoft}>Type?</Pill>}
        {effSmg ? <Pill color={C.inkSoft} bg={C.lineSoft}>{effSmg}</Pill> : <Pill color={C.muted} bg={C.lineSoft}>S·M·G?</Pill>}
        <Pencil size={11} color={C.teal} />
      </button>
      {editing && (
        <div
          className="absolute z-20 top-full left-0 mt-1 p-3 rounded-lg shadow-lg"
          style={{ background: "#fff", border: `1px solid ${C.line}`, minWidth: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[11px] font-semibold mb-1" style={{ color: C.muted }}>Type</div>
          <div className="flex gap-1 mb-2">
            {["Q", "N"].map((t) => (
              <button
                key={t}
                onClick={() => onSetTypeSmg(activity.row, { type: t })}
                className="px-2.5 py-1 rounded text-xs font-medium"
                style={{ border: `1.5px solid ${effType === t ? C.teal : C.line}`, background: effType === t ? C.tealTint : "#fff", color: effType === t ? C.tealDeep : C.inkSoft }}
              >
                {t === "Q" ? "Qualitative" : "Numeric"}
              </button>
            ))}
          </div>
          <div className="text-[11px] font-semibold mb-1" style={{ color: C.muted }}>S · M · G</div>
          <div className="flex gap-1 mb-2">
            {[["S", "Secretariat"], ["M", "Members"], ["G", "Governance"]].map(([letter, label]) => (
              <button
                key={letter}
                onClick={() => toggleSmg(letter)}
                className="px-2.5 py-1 rounded text-xs font-medium"
                style={{ border: `1.5px solid ${smgSet.has(letter) ? C.teal : C.line}`, background: smgSet.has(letter) ? C.tealTint : "#fff", color: smgSet.has(letter) ? C.tealDeep : C.inkSoft }}
                title={label}
              >
                {letter}
              </button>
            ))}
          </div>
          <button onClick={() => setEditing(false)} className="text-xs underline" style={{ color: C.tealDeep }}>Done</button>
        </div>
      )}
    </div>
  );
}

function CountryPicker({ activity, meta, onSetCountries }) {
  const [open, setOpen] = useState(false);
  const current = splitList(meta?.countries);

  const toggle = (country) => {
    const next = current.includes(country) ? current.filter((c) => c !== country) : [...current, country];
    onSetCountries(activity.row, next.join(", "));
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded-md"
        style={{ border: `1px dashed ${C.line}`, color: current.length ? C.inkSoft : C.muted }}
      >
        <MapPin size={11} />
        {current.length ? current.join(", ") : "Countries (if applicable)"}
      </button>
      {open && (
        <div
          className="absolute z-20 top-full left-0 mt-1 rounded-lg shadow-lg overflow-hidden"
          style={{ background: "#fff", border: `1px solid ${C.line}`, width: 260 }}
        >
          <div className="max-h-56 overflow-y-auto p-1.5">
            {WORLD_COUNTRIES.map((c) => (
              <label key={c} className="flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer" style={{ color: C.ink }}>
                <input type="checkbox" checked={current.includes(c)} onChange={() => toggle(c)} />
                {c}
              </label>
            ))}
          </div>
          <button onClick={() => setOpen(false)} className="w-full text-xs py-1.5" style={{ background: C.lineSoft, color: C.tealDeep }}>Done</button>
        </div>
      )}
    </div>
  );
}

function ActivityRow({ activity, updates, onOpenQuarter, expanded, onToggle, identity, meta, onSetTypeSmg, onSetCountries }) {
  const statuses = {};
  QUARTERS.forEach((q) => {
    statuses[q] = updates?.[q]?.confidence ?? null;
  });
  const contributors = splitList(activity.contrib);

  return (
    <div style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 py-3 text-left"
      >
        {expanded ? (
          <ChevronDown size={16} color={C.muted} className="shrink-0" />
        ) : (
          <ChevronRight size={16} color={C.muted} className="shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm leading-snug" style={{ color: C.ink }}>
            {activity.activity}
          </div>
          <div className="flex items-center flex-wrap gap-2 mt-1.5">
            <span className="text-xs" style={{ color: C.muted }}>
              {activity.output}
            </span>
            {contributors.length > 0 && (
              <span className="text-xs" style={{ color: C.muted }}>
                · with {contributors.join(", ")}
              </span>
            )}
            <TypeSmgBadges activity={activity} meta={meta} isAdmin={identity?.isAdmin} onSetTypeSmg={onSetTypeSmg} />
          </div>
        </div>
        <QuarterTrack statuses={statuses} />
      </button>

      {expanded && (
        <div className="pb-4 pl-7">
          <div className="mb-2.5">
            <CountryPicker activity={activity} meta={meta} onSetCountries={onSetCountries} />
          </div>
          <div className="flex flex-wrap gap-2">
            {QUARTERS.map((q) => {
              const v = statuses[q];
              const info = confidenceInfo(v);
              return (
                <button
                  key={q}
                  onClick={() => onOpenQuarter(q)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5"
                  style={{ border: `1.5px solid ${v != null ? info.color : C.line}`, color: v != null ? info.color : C.inkSoft }}
                >
                  {v != null ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                  {q} {v != null ? `· ${v}/10` : "· log update"}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== MY ACTIVITIES VIEW ============================== */

function MyActivitiesView({ identity, updates, onSaveUpdate, activityMeta, onSetTypeSmg, onSetCountries }) {

  const [expandedRow, setExpandedRow] = useState(null);
  const [drawer, setDrawer] = useState(null); // {activity, quarter}

  const mine = useMemo(
    () => ACTIVITIES.filter((a) => a.owner.includes(identity.team)),
    [identity.team]
  );

  const grouped = useMemo(() => {
    const g = {};
    mine.forEach((a) => {
      g[a.output] = g[a.output] || [];
      g[a.output].push(a);
    });
    return g;
  }, [mine]);

  if (mine.length === 0) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm" style={{ color: C.inkSoft }}>
          No activities are currently owned by <strong>{identity.team}</strong> in
          the work plan. If that's not right, flag it in the Owners tab — you can
          still browse everything under "All activities."
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <SectionLabel>
        {mine.length} {mine.length === 1 ? "activity" : "activities"} owned by {identity.team}
      </SectionLabel>
      {Object.entries(grouped).map(([output, acts]) => {
        return (
        <div key={output} className="mb-6">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <div
              className="text-sm font-semibold px-3 py-1.5 rounded-md inline-block"
              style={{ background: C.tealTint, color: C.tealDeep }}
            >
              {output}
            </div>
          </div>
          <div
            className="rounded-lg mt-2 px-3"
            style={{ background: C.paperRaised, border: `1px solid ${C.lineSoft}` }}
          >
            {acts.map((a) => (
              <ActivityRow
                key={a.row}
                activity={a}
                updates={updates[a.row]}
                expanded={expandedRow === a.row}
                onToggle={() => setExpandedRow(expandedRow === a.row ? null : a.row)}
                onOpenQuarter={(q) => setDrawer({ activity: a, quarter: q })}
                identity={identity}
                meta={activityMeta[a.row]}
                onSetTypeSmg={onSetTypeSmg}
                onSetCountries={onSetCountries}
              />
            ))}
          </div>
        </div>
        );
      })}

      {drawer && (
        <UpdateDrawer
          activity={drawer.activity}
          quarter={drawer.quarter}
          existing={updates[drawer.activity.row]?.[drawer.quarter]}
          identity={identity}
          onClose={() => setDrawer(null)}
          onSave={(payload) => onSaveUpdate(drawer.activity.row, drawer.quarter, payload)}
        />
      )}
    </div>
  );
}

/* ============================== ALL ACTIVITIES VIEW ============================== */

function OwnerPills({ owner }) {
  const names = owner.split(" + ").map((n) => n.trim());
  return (
    <div className="flex flex-wrap gap-1">
      {names.map((n) => {
        const isUnconfirmed = n === "To confirm";
        const color = isUnconfirmed ? C.red : (TEAM_COLORS[n] || C.inkSoft);
        const bg = isUnconfirmed ? C.redBg : `${TEAM_COLORS[n] || C.muted}1A`;
        return (
          <Pill key={n} color={color} bg={bg}>
            {n}
          </Pill>
        );
      })}
    </div>
  );
}

function lastUpdatedLabel(rowUpdates) {
  if (!rowUpdates) return null;
  let latest = null;
  QUARTERS.forEach((q) => {
    const u = rowUpdates[q];
    if (u?.updatedAt) {
      const d = new Date(u.updatedAt);
      if (!latest || d > latest) latest = d;
    }
  });
  return latest;
}

function latestConfidence(rowUpdates) {
  if (!rowUpdates) return null;
  let latest = null;
  let latestConf = null;
  QUARTERS.forEach((q) => {
    const u = rowUpdates[q];
    if (u?.updatedAt) {
      const d = new Date(u.updatedAt);
      if (!latest || d > latest) { latest = d; latestConf = u.confidence; }
    }
  });
  return latestConf;
}

const STATUS_BUCKETS = [
  { label: "Not yet reported", color: "#8A8F91", bg: "#EDE9DD" },
  { label: "Off track", color: "#C2452F", bg: "#F6E1DB" },
  { label: "At risk", color: "#C97C00", bg: "#FBEBD0" },
  { label: "Moderate", color: "#C97C00", bg: "#FBEBD0" },
  { label: "On track", color: "#3F9142", bg: "#E5F1E5" },
  { label: "Achieved", color: "#3F9142", bg: "#E5F1E5" },
];

function QuarterProgressCards({ updates }) {
  const total = ACTIVITIES.length;

  const cards = QUARTERS.map((q) => {
    const reported = ACTIVITIES.filter((a) => updates[a.row]?.[q]).length;
    const onTrack = ACTIVITIES.filter((a) => {
      const conf = updates[a.row]?.[q]?.confidence;
      return conf != null && conf >= 8;
    }).length;
    return {
      label: q,
      big: reported > 0 ? `${Math.round((reported / total) * 100)}%` : "0%",
      sub: `${reported}/${total} reported · ${onTrack} on track`,
    };
  });

  const achievedCount = ACTIVITIES.filter((a) => latestConfidence(updates[a.row]) === 10).length;
  const achievementCard = {
    label: "Achieved",
    big: total > 0 ? `${Math.round((achievedCount / total) * 100)}%` : "0%",
    sub: `${achievedCount}/${total} activities achieved`,
  };

  const allCards = [...cards, achievementCard];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
      {allCards.map((c, i) => (
        <div
          key={c.label}
          className="rounded-lg p-3.5"
          style={{
            background: i === 4 ? C.tealTint : C.paperRaised,
            border: `1px solid ${i === 4 ? C.teal : C.lineSoft}`,
          }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: i === 4 ? C.tealDeep : C.muted }}>
            {c.label}
          </div>
          <div className="text-2xl font-extrabold mb-0.5" style={{ color: i === 4 ? C.tealDeep : C.ink }}>{c.big}</div>
          <div className="text-[11px]" style={{ color: i === 4 ? C.tealDeep : C.muted }}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

function TeamManagementChart({ filteredBySiOnly }) {
  const data = useMemo(() => {
    return TEAMS.map((team) => {
      const row = { team };
      let total = 0;
      STATUS_BUCKETS.forEach((b) => { row[b.label] = 0; });
      filteredBySiOnly.forEach((a) => {
        if (!a.owner.includes(team)) return;
        total += 1;
      });
      row.total = total;
      return row;
    }).filter((r) => r.total > 0);
  }, [filteredBySiOnly]);

  // We don't have per-team confidence here (that needs `updates`), so this
  // chart shows plain assignment totals per team — simple bar, no stacking,
  // with the total shown right on top of each bar.
  return (
    <div className="rounded-lg p-4 mb-5" style={{ background: C.paperRaised, border: `1px solid ${C.lineSoft}` }}>
      <div className="text-xs font-semibold mb-2" style={{ color: C.inkSoft }}>Team management — total activities assigned per team</div>
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.line }} tickLine={false} />
          <YAxis type="category" dataKey="team" tick={{ fontSize: 11, fill: C.inkSoft }} axisLine={false} tickLine={false} width={170} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${C.line}` }} />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={16} fill={C.teal}>
            <LabelList dataKey="total" position="right" style={{ fontSize: 11, fontWeight: 700, fill: C.inkSoft }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ActivityDetailModal({ activity, updates, meta, onClose }) {
  if (!activity) return null;
  const contributors = splitList(activity.contrib);
  const effType = meta?.type || activity.type || "—";
  const effSmg = meta?.smg || activity.smg || "—";
  const countries = splitList(meta?.countries);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div
        className="rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        style={{ background: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 flex items-start justify-between" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
          <div>
            <div className="text-xs font-semibold mb-1" style={{ color: C.tealDeep }}>{activity.output} · {activity.si}</div>
            <div className="text-base font-bold" style={{ color: C.ink }}>{activity.activity}</div>
          </div>
          <button onClick={onClose}><X size={18} color={C.muted} /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="font-semibold mb-0.5" style={{ color: C.muted }}>Owner</div>
              <OwnerPills owner={activity.owner} />
            </div>
            <div>
              <div className="font-semibold mb-0.5" style={{ color: C.muted }}>Contributors</div>
              <div style={{ color: C.ink }}>{contributors.length ? contributors.join(", ") : "—"}</div>
            </div>
            <div>
              <div className="font-semibold mb-0.5" style={{ color: C.muted }}>Type</div>
              <div style={{ color: C.ink }}>{effType === "Q" ? "Qualitative" : effType === "N" ? "Numeric" : "—"}</div>
            </div>
            <div>
              <div className="font-semibold mb-0.5" style={{ color: C.muted }}>S·M·G</div>
              <div style={{ color: C.ink }}>{effSmg || "—"}</div>
            </div>
            {countries.length > 0 && (
              <div className="col-span-2">
                <div className="font-semibold mb-0.5" style={{ color: C.muted }}>Countries</div>
                <div style={{ color: C.ink }}>{countries.join(", ")}</div>
              </div>
            )}
          </div>

          <div>
            <SectionLabel>Quarterly reports</SectionLabel>
            <div className="space-y-2 mt-2">
              {QUARTERS.map((q) => {
                const u = updates?.[q];
                const info = confidenceInfo(u?.confidence);
                return (
                  <div key={q} className="rounded-md p-2.5" style={{ background: C.paper, border: `1px solid ${C.lineSoft}` }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: C.ink }}>{q}</span>
                      <Pill color={info.color} bg={info.bg}>{u?.confidence != null ? `${u.confidence}/10 · ${info.label}` : info.label}</Pill>
                    </div>
                    {u?.plan && <div className="text-xs mb-1" style={{ color: C.inkSoft }}><span className="font-semibold">Plan: </span>{u.plan}</div>}
                    {u?.whatHappened && <div className="text-xs mb-1" style={{ color: C.inkSoft }}><span className="font-semibold">What happened: </span>{u.whatHappened}</div>}
                    {u?.adaptation && <div className="text-xs" style={{ color: C.inkSoft }}><span className="font-semibold">Adaptation: </span>{u.adaptation}</div>}
                    {!u && <div className="text-xs" style={{ color: C.muted }}>Not yet reported.</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AllActivitiesView({ updates, projects, activityMeta, identity, onSaveProject, onSetTypeSmg }) {
  const [subView, setSubView] = useState("tracker"); // tracker | map
  const [siFilter, setSiFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [quarterFilter, setQuarterFilter] = useState("Latest"); // Latest | Q1 | Q2 | Q3 | Q4
  const [selectedActivity, setSelectedActivity] = useState(null);

  const sis = useMemo(() => ["All", ...Array.from(new Set(ACTIVITIES.map((a) => a.si)))], []);
  const owners = useMemo(() => ["All", ...TEAMS], []);
  const statusOptions = ["All", ...STATUS_BUCKETS.map((b) => b.label)];

  const confidenceFor = (row) => {
    if (quarterFilter === "Latest") return latestConfidence(updates[row]);
    const q = updates[row]?.[quarterFilter];
    return q ? q.confidence : null;
  };

  // SI filter applied first (used for the team-count badges, so they reflect
  // the chosen strategy even before a team is picked)
  const filteredBySiOnly = useMemo(
    () => ACTIVITIES.filter((a) => siFilter === "All" || a.si === siFilter),
    [siFilter]
  );

  const filtered = useMemo(() => {
    return filteredBySiOnly.filter((a) => {
      if (ownerFilter !== "All" && !a.owner.includes(ownerFilter)) return false;
      if (statusFilter !== "All") {
        const conf = confidenceFor(a.row);
        if (confidenceInfo(conf).label !== statusFilter) return false;
      }
      return true;
    });
  }, [filteredBySiOnly, ownerFilter, statusFilter, quarterFilter, updates]);

  // Chart reacts to SI + team filters (not to the status filter itself,
  // since that's what the chart lets you set by clicking a bar)
  const chartSource = useMemo(
    () => filteredBySiOnly.filter((a) => ownerFilter === "All" || a.owner.includes(ownerFilter)),
    [filteredBySiOnly, ownerFilter]
  );

  const statusCounts = useMemo(() => {
    const counts = {};
    STATUS_BUCKETS.forEach((b) => { counts[b.label] = 0; });
    chartSource.forEach((a) => {
      const conf = confidenceFor(a.row);
      const label = confidenceInfo(conf).label;
      counts[label] = (counts[label] || 0) + 1;
    });
    return STATUS_BUCKETS.map((b) => ({ name: b.label, value: counts[b.label], color: b.color }));
  }, [chartSource, quarterFilter, updates]);

  const hasFilter = siFilter !== "All" || ownerFilter !== "All" || statusFilter !== "All";

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {[{ id: "tracker", label: "Tracker" }, { id: "map", label: "Map" }].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubView(t.id)}
            className="px-3.5 py-1.5 rounded-md text-sm font-medium"
            style={{
              background: subView === t.id ? C.teal : C.paperRaised,
              color: subView === t.id ? "#fff" : C.inkSoft,
              border: `1.5px solid ${subView === t.id ? C.teal : C.line}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subView === "map" && (
        <WorldMap projects={projects} activities={ACTIVITIES} activityMeta={activityMeta} identity={identity} onSaveProject={onSaveProject} />
      )}

      {subView === "tracker" && (
        <>
          <QuarterProgressCards updates={updates} />
          <TeamManagementChart filteredBySiOnly={filteredBySiOnly} />

          <div
            className="rounded-lg p-4 mb-5"
            style={{ background: C.paperRaised, border: `1px solid ${C.lineSoft}` }}
          >
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="text-xs font-semibold" style={{ color: C.inkSoft }}>
                {chartSource.length} activities, by status ({quarterFilter === "Latest" ? "most recent report" : quarterFilter}) — click a bar to filter
              </div>
              <div className="flex gap-1">
                {["Latest", ...QUARTERS].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuarterFilter(q)}
                    className="px-2.5 py-1 rounded text-xs font-medium"
                    style={{
                      background: quarterFilter === q ? C.teal : C.paper,
                      color: quarterFilter === q ? "#fff" : C.inkSoft,
                      border: `1px solid ${quarterFilter === q ? C.teal : C.line}`,
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={statusCounts} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.line }} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: C.inkSoft }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${C.line}` }} />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                  cursor="pointer"
                  onClick={(d) => setStatusFilter((s) => (s === d.name ? "All" : d.name))}
                >
                  {statusCounts.map((d, i) => (
                    <Cell key={i} fill={d.color} opacity={statusFilter !== "All" && statusFilter !== d.name ? 0.35 : 1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <select
              value={siFilter}
              onChange={(e) => setSiFilter(e.target.value)}
              className="px-3 py-1.5 rounded-md text-sm"
              style={{ border: `1.5px solid ${C.line}`, background: C.paperRaised, color: C.ink }}
            >
              {sis.map((s) => (
                <option key={s} value={s}>{s === "All" ? "All strategic initiatives" : s}</option>
              ))}
            </select>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="px-3 py-1.5 rounded-md text-sm"
              style={{ border: `1.5px solid ${C.line}`, background: C.paperRaised, color: C.ink }}
            >
              {owners.map((o) => (
                <option key={o} value={o}>{o === "All" ? "All teams" : o}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-md text-sm"
              style={{ border: `1.5px solid ${C.line}`, background: C.paperRaised, color: C.ink }}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
              ))}
            </select>
            {hasFilter && (
              <button
                onClick={() => { setSiFilter("All"); setOwnerFilter("All"); setStatusFilter("All"); }}
                className="text-xs underline"
                style={{ color: C.tealDeep }}
              >
                Clear filters
              </button>
            )}
            <span className="text-xs" style={{ color: C.muted }}>{filtered.length} activities</span>
          </div>

          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.lineSoft}` }}>
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.lineSoft }}>
                  <th className="text-left px-3 py-2 font-semibold" style={{ color: C.inkSoft }}>Output</th>
                  <th className="text-left px-3 py-2 font-semibold" style={{ color: C.inkSoft }}>Activity</th>
                  <th className="text-left px-3 py-2 font-semibold" style={{ color: C.inkSoft }}>Owner</th>
                  <th className="text-left px-3 py-2 font-semibold" style={{ color: C.inkSoft }}>Last updated</th>
                  <th className="text-left px-3 py-2 font-semibold" style={{ color: C.inkSoft }}>{quarterFilter === "Latest" ? "Confidence (latest)" : `Confidence (${quarterFilter})`}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const latest = lastUpdatedLabel(updates[a.row]);
                  const conf = confidenceFor(a.row);
                  const info = confidenceInfo(conf);
                  return (
                    <tr
                      key={a.row}
                      style={{ borderTop: `1px solid ${C.lineSoft}`, background: C.paperRaised, cursor: "pointer" }}
                      onClick={() => setSelectedActivity(a)}
                    >
                      <td className="px-3 py-2 whitespace-nowrap align-top" style={{ color: C.teal }}>{a.output}</td>
                      <td className="px-3 py-2 align-top" style={{ color: C.ink }}>
                        {a.activity}
                        {identity?.isAdmin && (
                          <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                            <TypeSmgBadges activity={a} meta={activityMeta[a.row]} isAdmin={identity?.isAdmin} onSetTypeSmg={onSetTypeSmg} />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <OwnerPills owner={a.owner} />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap align-top text-xs" style={{ color: latest ? C.inkSoft : C.muted }}>
                        {latest ? latest.toLocaleDateString() : "Not updated"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap align-top">
                        <Pill color={info.color} bg={info.bg}>
                          {conf != null ? `${conf}/10 · ${info.label}` : info.label}
                        </Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ActivityDetailModal
        activity={selectedActivity}
        updates={selectedActivity ? updates[selectedActivity.row] : null}
        meta={selectedActivity ? activityMeta[selectedActivity.row] : null}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
}
const GOAL_INFO = {
  "Goal 1": "Embed risk-informed resilience throughout the disaster risk management cycle",
  "Goal 2": "Champion a localisation movement",
  "Goal 3": "Strengthen the collaboration, solidarity, and mobilisation of civil society organisations",
};

const GOAL_IMPACT = {
  "Goal 1": "Risk is taken into account wherever possible — across development, adaptation and recovery — transforming systems to centre and resource communities, growing their adaptive capacities and resilience.",
  "Goal 2": "The agency and leadership of local actors increases, and greater confidence in their capacity translates into more formal decision-making power and more resources for those roles.",
  "Goal 3": "Partnerships and joint actions between and with CSOs are nurtured or strengthened, and civic space is protected and widened.",
};

const TEAM_COLORS = {
  "Programmes": "#0092B6",
  "Policy": "#6B4FA0",
  "FRIMCO": "#F59C00",
  "Membership Engagement": "#3F9142",
  "Regional Leads": "#C2452F",
  "Regional Lead (Americas & Caribbean)": "#C2452F",
  "Regional Lead (Asia & Europe)": "#A8622F",
  "Regional Lead (Africa & West Asia)": "#8C3A22",
  "Operations": "#5B5B5B",
  "ED": "#B4791F",
  "Risk Drivers Lead": "#0092B6",
  "SLT": "#5B5B5B",
  "To confirm": "#C2452F",
};

const DATA_SOURCE_OPTIONS = [
  "Stories (MSC)",
  "Outcome Harvest",
  "Salesforce (Community Platform)",
  "Internal project documents",
  "Governance documents",
  "Other",
];

/* ============================== MAP DATA ============================== */

// Seeded so the map/pilot works even before any admin has touched the
// "Projects" tab in the Sheet. Anything added there later is merged in
// alongside this (see loadProjects in App()).
const PROJECT_PHASES = ["Pre-launch", "Inception", "Implementation", "Closing", "Completed"];

const DEFAULT_PROJECTS = [
  {
    project_id: "pilot-pep",
    project_name: "Pre-Evacuation Platform",
    countries: "Honduras, El Salvador, Guatemala",
    donor: "Innovation Norway",
    partners: "IOM, Terram Pacis",
    duration: "2026–2028",
    phase: "Implementation",
  },
];

// Full list of UN member/observer state names, for the "countries involved"
// multi-select on an activity. Plain English short names.
const WORLD_COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Republic of)","Costa Rica","Croatia","Cuba","Cyprus","Czechia","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

const SI_OUTCOMES = {
  "SI 1.1 — Harnessing practice-led learning": "Communities and member CSOs and their practices are at the forefront of developing useful, innovative approaches and generating knowledge on embedding risk-informed resilience approaches.",
  "SI 1.2 — Generating persuasive evidence": "Governments, multilateral institutions, private sector and INGOs value and make use of CSO members and community-generated, practice-led evidence and know-how on risk-informed resilience in their development, adaptation and recovery processes.",
  "SI 2.1 — Unlocking locally-led change": "Member CSOs are enabled to identify, pursue and collaborate on ways to transform local and national systems, policies and practices, and are recognised as legitimate and valuable participants in their local DRR ecosystem.",
  "SI 2.2 — Influencing the next horizon of local leadership": "Key regional and international frameworks and actions recognise, value and resource local leadership for DRR, responding to the practice-led and community-generated evidence developed and promoted by GNDR and its partners.",
  "SI 3.1 — Strengthening the GNDR identity and member experience": "Commitment to and vibrancy of the network is increased, and connections created and deepened, accelerating a global movement; members experience solidarity and mutual support, creating a sense of movement and belonging.",
  "SI 3.2 — Ensuring a resilient and sustainable network": "Resilience and sustainability of GNDR and its member CSOs is maintained or strengthened, enabling their contribution to more resilient people and places.",
};

/* ============================== TARGETS VIEW ============================== */

function ProgressNoteForm({ output, onAdd, identity }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <div className="mt-3 flex gap-2">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a progress note (e.g. a number, a milestone reached)…"
        className="flex-1 px-3 py-2 rounded-md text-sm outline-none"
        style={{ border: `1.5px solid ${C.line}`, background: C.paperRaised, color: C.ink }}
      />
      <button
        disabled={!note.trim() || saving}
        onClick={async () => {
          setSaving(true);
          await onAdd(output.id, { note: note.trim(), by: identity.name, team: identity.team, at: new Date().toISOString() });
          setNote("");
          setSaving(false);
        }}
        className="px-4 py-2 rounded-md text-sm font-semibold shrink-0"
        style={{ background: C.teal, color: "#fff", opacity: !note.trim() || saving ? 0.4 : 1 }}
      >
        Add
      </button>
    </div>
  );
}

function TargetsView({ identity }) {
  const [openId, setOpenId] = useState(null);
  const [openSi, setOpenSi] = useState(null);
  const goals = ["Goal 1", "Goal 2", "Goal 3"];

  return (
    <div className="max-w-3xl">
      {goals.map((goal) => {
        const sis = Array.from(new Set(OUTPUTS.filter((o) => o.goal === goal).map((o) => o.si)));
        return (
          <div key={goal} className="mb-10">
            <div
              className="rounded-lg px-4 py-3 mb-2"
              style={{ background: C.teal }}
            >
              <div className="text-xs font-semibold" style={{ color: "#CDEAF0" }}>{goal}</div>
              <div className="text-base font-bold text-white mt-0.5">{GOAL_INFO[goal]}</div>
            </div>
            <div
              className="text-xs leading-relaxed mb-4 px-4 py-2.5 rounded-b-lg"
              style={{ background: C.amberBrandTint, color: "#8A5A00" }}
            >
              <span className="font-semibold">Impact we're aiming for — </span>
              {GOAL_IMPACT[goal]}
            </div>

            {sis.map((si) => {
              const siOpen = openSi === si;
              return (
              <div key={si} className="mb-3 pl-1">
                <button
                  className="w-full flex items-center justify-between text-left py-1.5"
                  onClick={() => setOpenSi(siOpen ? null : si)}
                >
                  <span className="text-sm font-bold" style={{ color: C.tealDeep }}>{si}</span>
                  {siOpen ? <ChevronDown size={16} color={C.muted} /> : <ChevronRight size={16} color={C.muted} />}
                </button>

                {siOpen && (
                  <div className="mt-1">
                    <div
                      className="text-xs leading-relaxed mb-3 pl-3"
                      style={{ color: C.inkSoft, borderLeft: `2px solid ${C.amberBrand}` }}
                    >
                      <span className="font-semibold" style={{ color: C.ink }}>We hope to see — </span>
                      {SI_OUTCOMES[si]}
                    </div>

                    {OUTPUTS.filter((o) => o.si === si).map((o) => {
                      const isOpen = openId === o.id;
                      return (
                        <div
                          key={o.id}
                          className="mb-3 rounded-lg px-4 py-3"
                          style={{ background: C.paperRaised, border: `1px solid ${C.lineSoft}` }}
                        >
                          <button className="w-full flex items-center justify-between text-left" onClick={() => setOpenId(isOpen ? null : o.id)}>
                            <div className="flex items-center gap-2">
                              <Target size={15} color={C.teal} />
                              <span className="text-sm font-medium" style={{ color: C.ink }}>
                                {o.id} — {o.short}
                              </span>
                            </div>
                            {isOpen ? <ChevronDown size={16} color={C.muted} /> : <ChevronRight size={16} color={C.muted} />}
                          </button>

                          {isOpen && (
                            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.lineSoft}` }}>
                              <div className="space-y-2 text-xs leading-relaxed">
                                <div className="flex gap-2">
                                  <span className="shrink-0 font-semibold" style={{ color: C.amberBrand }}>2026-27</span>
                                  <span style={{ color: C.inkSoft }}>{o.y1}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="shrink-0 font-semibold" style={{ color: C.teal }}>2027-30</span>
                                  <span style={{ color: C.inkSoft }}>{o.y24}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ============================== INDICATOR DASHBOARD ============================== */

/* ============================== WORLD MAP ============================== */

const WORLD_GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

// The public geojson uses slightly different names for a handful of
// countries than our WORLD_COUNTRIES list / project data — map between them
// so matching works both ways.
const COUNTRY_NAME_ALIASES = {
  "United States of America": "United States",
  "Republic of the Congo": "Congo (Republic of)",
  "Democratic Republic of the Congo": "Democratic Republic of the Congo",
  "United Republic of Tanzania": "Tanzania",
  "The Bahamas": "Bahamas",
  "Ivory Coast": "Côte d'Ivoire",
  "Macedonia": "North Macedonia",
  "Swaziland": "Eswatini",
  "Republic of Serbia": "Serbia",
  "South Korea": "South Korea",
  "North Korea": "North Korea",
  "East Timor": "Timor-Leste",
  "Czech Republic": "Czechia",
  "Myanmar": "Myanmar",
};
function normCountry(name) {
  if (!name) return name;
  return COUNTRY_NAME_ALIASES[name] || name;
}

function splitList(str) {
  return (str || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function ProjectForm({ existing, onSave, onCancel }) {
  const [name, setName] = useState(existing?.project_name || "");
  const [countries, setCountries] = useState(splitList(existing?.countries));
  const [donor, setDonor] = useState(existing?.donor || "");
  const [partners, setPartners] = useState(existing?.partners || "");
  const [duration, setDuration] = useState(existing?.duration || "");
  const [phase, setPhase] = useState(existing?.phase || PROJECT_PHASES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleCountry = (c) => {
    setCountries((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const handleSave = async () => {
    if (!name.trim() || countries.length === 0) return;
    setSaving(true);
    await onSave({
      project_id: existing?.project_id || `proj-${Date.now()}`,
      project_name: name.trim(), countries: countries.join(", "),
      donor: donor.trim(), partners: partners.trim(), duration: duration.trim(), phase,
    });
    setSaving(false);
  };

  return (
    <div className="rounded-lg p-4 mb-4" style={{ background: "#fff", border: `1.5px solid ${C.teal}` }}>
      <div className="text-sm font-bold mb-3" style={{ color: C.teal }}>
        {existing ? "Edit project" : "Add a project"}
      </div>

      <label className="block text-xs font-semibold mb-1" style={{ color: C.ink }}>Project name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 rounded-md text-sm outline-none mb-3"
        style={{ border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink }}
      />

      <label className="block text-xs font-semibold mb-1" style={{ color: C.ink }}>Country / countries</label>
      <div className="relative mb-3">
        <button
          onClick={() => setCountryOpen((v) => !v)}
          className="w-full text-left px-3 py-2 rounded-md text-sm"
          style={{ border: `1.5px solid ${C.line}`, background: C.paper, color: countries.length ? C.ink : C.muted }}
        >
          {countries.length ? countries.join(", ") : "Select countries…"}
        </button>
        {countryOpen && (
          <div className="absolute z-20 top-full left-0 mt-1 rounded-lg shadow-lg overflow-hidden w-full" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            <div className="max-h-48 overflow-y-auto p-1.5">
              {WORLD_COUNTRIES.map((c) => (
                <label key={c} className="flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer" style={{ color: C.ink }}>
                  <input type="checkbox" checked={countries.includes(c)} onChange={() => toggleCountry(c)} />
                  {c}
                </label>
              ))}
            </div>
            <button onClick={() => setCountryOpen(false)} className="w-full text-xs py-1.5" style={{ background: C.lineSoft, color: C.tealDeep }}>Done</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: C.ink }}>Donor</label>
          <input
            value={donor}
            onChange={(e) => setDonor(e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm outline-none"
            style={{ border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: C.ink }}>Partners</label>
          <input
            value={partners}
            onChange={(e) => setPartners(e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm outline-none"
            style={{ border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: C.ink }}>Duration</label>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 2026–2028"
            className="w-full px-3 py-2 rounded-md text-sm outline-none"
            style={{ border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: C.ink }}>Phase</label>
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm outline-none"
            style={{ border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink }}
          >
            {PROJECT_PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !name.trim() || countries.length === 0}
          className="px-4 py-2 rounded-md text-xs font-semibold"
          style={{ background: C.teal, color: "#fff", opacity: saving || !name.trim() || countries.length === 0 ? 0.5 : 1 }}
        >
          {saving ? "Saving…" : "Save project"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-md text-xs font-semibold" style={{ color: C.inkSoft, border: `1.5px solid ${C.line}` }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function WorldMap({ projects, activities, activityMeta, identity, onSaveProject }) {
  const [geo, setGeo] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(WORLD_GEOJSON_URL)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setGeo(d); })
      .catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, []);

  const countriesWithProjects = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => splitList(p.countries).forEach((c) => set.add(normCountry(c))));
    return set;
  }, [projects]);

  const projectsForCountry = (name) => projects.filter((p) => splitList(p.countries).map(normCountry).includes(name));
  const activitiesForCountry = (name) => {
    return activities.filter((a) => {
      const meta = activityMeta[a.row];
      if (!meta?.countries) return false;
      return splitList(meta.countries).map(normCountry).includes(name);
    });
  };

  const handleSaveProject = async (payload) => {
    await onSaveProject(payload);
    setShowForm(false);
    setEditingProject(null);
  };

  if (loadError) {
    return (
      <div className="rounded-lg p-6 text-sm text-center" style={{ background: C.paperRaised, border: `1px solid ${C.lineSoft}`, color: C.muted }}>
        Couldn't load the world map (no connection to the map data source). Try refreshing.
      </div>
    );
  }

  return (
    <div>
      {identity?.isAdmin && (
        <div className="flex justify-end mb-3">
          {!showForm && (
            <button
              onClick={() => { setEditingProject(null); setShowForm(true); }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md"
              style={{ background: C.teal, color: "#fff" }}
            >
              <MapPin size={13} /> Add a project
            </button>
          )}
        </div>
      )}
      {showForm && (
        <ProjectForm
          existing={editingProject}
          onSave={handleSaveProject}
          onCancel={() => { setShowForm(false); setEditingProject(null); }}
        />
      )}

      {!geo ? (
        <div className="rounded-lg p-10 flex items-center justify-center" style={{ background: C.paperRaised, border: `1px solid ${C.lineSoft}` }}>
          <Loader2 className="animate-spin" size={20} color={C.teal} />
        </div>
      ) : (
        <MapCanvas
          geo={geo}
          countriesWithProjects={countriesWithProjects}
          selected={selected}
          setSelected={setSelected}
          hovered={hovered}
          setHovered={setHovered}
          projectsForCountry={projectsForCountry}
          activitiesForCountry={activitiesForCountry}
          identity={identity}
          onEditProject={(p) => { setEditingProject(p); setShowForm(true); }}
        />
      )}
    </div>
  );
}

// Separate inner component so the (fairly heavy) d3-geo projection math only
// runs once geo data is actually available.
function MapCanvas({ geo, countriesWithProjects, selected, setSelected, hovered, setHovered, projectsForCountry, activitiesForCountry, identity, onEditProject }) {
  const width = 960, height = 460;
  const projection = d3.geoNaturalEarth1().fitSize([width, height], geo);
  const pathGen = d3.geoPath(projection);

  const selectedProjects = selected ? projectsForCountry(selected) : [];
  const selectedActivities = selected ? activitiesForCountry(selected) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        className="md:col-span-2 overflow-hidden relative"
        style={{ background: "#FFFFFF", border: `1px solid ${C.lineSoft}` }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto p-4">
          {geo.features.map((f, i) => {
            const name = normCountry(f.properties?.name);
            const hasProject = countriesWithProjects.has(name);
            const isSelected = selected === name;
            const isHovered = hovered === name;
            return (
              <path
                key={i}
                d={pathGen(f)}
                fill={isSelected ? C.amberBrand : hasProject ? C.teal : "#E7ECEE"}
                stroke="#FFFFFF"
                strokeWidth={isSelected || isHovered ? 1.3 : 0.6}
                opacity={isHovered && !isSelected ? 0.85 : 1}
                style={{ cursor: hasProject ? "pointer" : "default", transition: "fill 0.15s" }}
                onClick={() => hasProject && setSelected(isSelected ? null : name)}
                onMouseEnter={() => setHovered(name)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>
        <div className="flex items-center gap-4 px-4 pb-4 pt-1 text-[11px]" style={{ color: C.inkSoft }}>
          <span className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, background: C.teal, display: "inline-block", borderRadius: 3 }} /> Active intervention</span>
          <span className="flex items-center gap-1.5"><span style={{ width: 10, height: 10, background: C.amberBrand, display: "inline-block", borderRadius: 3 }} /> Selected</span>
          <span className="ml-auto font-medium" style={{ color: C.muted }}>{countriesWithProjects.size} countries with active work</span>
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: C.paperRaised, border: `1px solid ${C.lineSoft}` }}>
        {!selected ? (
          <div className="text-sm text-center py-8" style={{ color: C.muted }}>
            <Globe2 size={22} className="mx-auto mb-2" color={C.muted} />
            Click a coloured country to see its projects and activities.
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold" style={{ color: C.teal }}>{selected}</div>
              <button onClick={() => setSelected(null)}><X size={16} color={C.muted} /></button>
            </div>

            <SectionLabel>Projects ({selectedProjects.length})</SectionLabel>
            {selectedProjects.length === 0 ? (
              <p className="text-xs mb-4" style={{ color: C.muted }}>None recorded.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {selectedProjects.map((p) => (
                  <div key={p.project_id} className="text-xs px-2.5 py-2 rounded-md" style={{ background: C.tealTint }}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold" style={{ color: C.tealDeep }}>{p.project_name}</div>
                      {identity?.isAdmin && (
                        <button onClick={() => onEditProject(p)} className="text-[10px] underline" style={{ color: C.tealDeep }}>Edit</button>
                      )}
                    </div>
                    <div style={{ color: C.inkSoft }}>Donor: {p.donor || "—"}</div>
                    <div style={{ color: C.inkSoft }}>Partners: {p.partners || "—"}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {p.duration && <Pill color={C.tealDeep} bg="#fff">{p.duration}</Pill>}
                      {p.phase && <Pill color={C.amberBrand} bg="#FFF6E6">{p.phase}</Pill>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <SectionLabel>Activities ({selectedActivities.length})</SectionLabel>
            {selectedActivities.length === 0 ? (
              <p className="text-xs" style={{ color: C.muted }}>None tagged to this country yet.</p>
            ) : (
              <div className="space-y-1.5">
                {selectedActivities.map((a) => (
                  <div key={a.row} className="text-xs px-2.5 py-1.5 rounded-md" style={{ background: C.paper }}>
                    <div style={{ color: C.ink }}>{a.activity}</div>
                    <div style={{ color: C.muted }}>{a.output}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ratingInfo(rating) {
  const r = (rating || "no").toLowerCase();
  if (r === "yes") return { label: "Direct", color: C.teal, bg: C.tealTint, weight: 3 };
  if (r === "likely") return { label: "Likely", color: C.amberBrand, bg: C.amberBrandTint, weight: 2 };
  if (r === "no") return { label: "No link", color: C.muted, bg: C.lineSoft, weight: 0 };
  // indirectly, via member survey, unclear, if financing mechanisms shift, etc.
  return { label: rating, color: "#A67C3D", bg: "#F3ECDD", weight: 1 };
}

const RAG_OPTIONS = [
  { id: "on-track", label: "On track", color: C.green, bg: C.greenBg },
  { id: "at-risk", label: "At risk", color: C.amber, bg: C.amberBg },
  { id: "off-track", label: "Off track", color: C.red, bg: C.redBg },
  { id: "not-started", label: "Not yet tracked", color: C.muted, bg: C.lineSoft },
];

function IndicatorCard({ si, ind, status, onSave, identity }) {
  const [open, setOpen] = useState(false);
  const [observations, setObservations] = useState(status?.observations || "");
  const emptyEntry = () => Object.fromEntries(ind.fields.map((f) => [f.key, ""]));
  const [entries, setEntries] = useState(
    status?.entries && status.entries.length > 0 ? status.entries : [emptyEntry()]
  );
  const [denominator, setDenominator] = useState(status?.denominator || "");
  const [dataSource, setDataSource] = useState(
    Array.isArray(status?.dataSource) ? status.dataSource : (status?.dataSource ? [status.dataSource] : [])
  );
  const [rag, setRag] = useState(status?.rag || "not-started");
  const [saving, setSaving] = useState(false);

  const noCoverage = ind.coverage.every((c) => ratingInfo(c.rating).weight === 0);
  const ragInfo = RAG_OPTIONS.find((r) => r.id === (status?.rag || "not-started"));

  const filledCount = entries.filter((e) => Object.values(e).some((v) => (v || "").trim() !== "")).length;
  const pct = ind.hasDenominator && Number(denominator) > 0
    ? Math.round((filledCount / Number(denominator)) * 1000) / 10
    : null;

  const updateEntry = (i, key, val) => {
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, [key]: val } : e)));
  };
  const addEntry = () => setEntries((prev) => [...prev, emptyEntry()]);
  const removeEntry = (i) => setEntries((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const handleSave = async () => {
    setSaving(true);
    const cleanEntries = entries.filter((e) => Object.values(e).some((v) => (v || "").trim() !== ""));
    await onSave(`${si}-${ind.letter}`, {
      observations, entries: cleanEntries, count: cleanEntries.length,
      denominator: ind.hasDenominator ? denominator : undefined,
      dataSource, rag,
      updatedBy: identity.name, updatedTeam: identity.team,
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
  };

  const reportedLabel = status?.entries?.length
    ? (ind.hasDenominator && status.denominator
        ? `${status.entries.length} / ${status.denominator} (${Math.round((status.entries.length / Number(status.denominator)) * 1000) / 10}%)`
        : `${status.entries.length}`)
    : null;

  return (
    <div className="rounded-lg mb-3" style={{ background: C.paperRaised, border: `1px solid ${C.lineSoft}` }}>
      <button className="w-full flex items-start gap-3 px-4 py-3 text-left" onClick={() => setOpen(!open)}>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
          style={{ background: C.tealTint, color: C.tealDeep }}
        >
          {ind.letter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm leading-snug" style={{ color: C.ink }}>{ind.text}</div>
          <div className="flex items-center flex-wrap gap-1.5 mt-2">
            {ind.coverage.map((c) => {
              const info = ratingInfo(c.rating);
              return (
                <span
                  key={c.output}
                  className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                  style={{ background: info.bg, color: info.color }}
                  title={`${c.output}: ${c.rating}`}
                >
                  {c.output}
                </span>
              );
            })}
            {noCoverage && (
              <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: C.red }}>
                <AlertTriangle size={11} /> No output feeds this directly
              </span>
            )}
          </div>
          {reportedLabel && (
            <div className="text-xs mt-2 font-semibold" style={{ color: C.tealDeep }}>
              Reported figure: {reportedLabel}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Pill color={ragInfo.color} bg={ragInfo.bg}>{ragInfo.label}</Pill>
          {open ? <ChevronDown size={16} color={C.muted} /> : <ChevronRight size={16} color={C.muted} />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1" style={{ borderTop: `1px solid ${C.lineSoft}` }}>
          <div className="text-xs mb-3" style={{ color: C.muted }}>
            Outputs feeding this indicator, and how directly:
            <div className="flex flex-wrap gap-3 mt-1.5">
              {ind.coverage.map((c) => {
                const info = ratingInfo(c.rating);
                return (
                  <span key={c.output} className="flex items-center gap-1.5 text-xs" style={{ color: C.inkSoft }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: info.color, display: "inline-block" }} />
                    {c.output} — {c.rating}
                  </span>
                );
              })}
            </div>
          </div>

{identity?.isAdmin ? (
<>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {RAG_OPTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRag(r.id)}
                className="text-left px-3 py-1.5 rounded-md text-xs font-medium"
                style={{ border: `1.5px solid ${rag === r.id ? r.color : C.line}`, background: rag === r.id ? r.bg : C.paperRaised, color: rag === r.id ? r.color : C.inkSoft }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <label className="block text-xs font-semibold mb-1" style={{ color: C.ink }}>
            What to report
          </label>
          {ind.question && (
            <div
              className="text-xs leading-relaxed mb-2 px-3 py-2 rounded-md"
              style={{ background: C.amberBrandTint, color: "#8A5A00" }}
            >
              {ind.question}
            </div>
          )}

          {ind.hasDenominator && (
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1" style={{ color: C.inkSoft }}>
                {ind.denominatorLabel}
              </label>
              <input
                value={denominator}
                onChange={(e) => setDenominator(e.target.value)}
                placeholder="e.g. 1850"
                className="w-40 px-3 py-1.5 rounded-md text-sm outline-none"
                style={{ border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink }}
              />
            </div>
          )}

          <div className="mb-1.5 overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {ind.fields.map((f) => (
                    <th key={f.key} className="text-left font-medium px-1.5 pb-1" style={{ color: C.muted }}>
                      {f.label}
                    </th>
                  ))}
                  <th className="w-6"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={i}>
                    {ind.fields.map((f) => (
                      <td key={f.key} className="px-1 py-1">
                        <input
                          value={entry[f.key] || ""}
                          onChange={(ev) => updateEntry(i, f.key, ev.target.value)}
                          className="w-full px-2 py-1.5 rounded text-xs outline-none"
                          style={{ border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink }}
                        />
                      </td>
                    ))}
                    <td className="px-1">
                      <button
                        onClick={() => removeEntry(i)}
                        disabled={entries.length === 1}
                        style={{ opacity: entries.length === 1 ? 0.3 : 1 }}
                      >
                        <X size={13} color={C.red} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={addEntry}
            className="text-xs font-medium mb-1 px-2.5 py-1 rounded-md"
            style={{ border: `1.5px solid ${C.teal}`, color: C.tealDeep, background: C.tealTint }}
          >
            + Add row
          </button>
          <div className="text-xs mb-3" style={{ color: C.muted }}>
            {filledCount} row{filledCount === 1 ? "" : "s"} filled in
            {ind.hasDenominator && Number(denominator) > 0 && pct != null && ` — ${pct}% of ${denominator}`}
          </div>

          <label className="block text-xs font-semibold mb-1" style={{ color: C.ink }}>
            Data source (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {DATA_SOURCE_OPTIONS.map((d) => {
              const checked = dataSource.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => setDataSource(checked ? dataSource.filter((x) => x !== d) : [...dataSource, d])}
                  className="flex items-center gap-1.5 text-left px-2.5 py-1.5 rounded-md text-xs font-medium"
                  style={{
                    border: `1.5px solid ${checked ? C.teal : C.line}`,
                    background: checked ? C.tealTint : C.paperRaised,
                    color: checked ? C.tealDeep : C.inkSoft,
                  }}
                >
                  {checked ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                  {d}
                </button>
              );
            })}
          </div>

          <label className="block text-xs font-semibold mb-1" style={{ color: C.ink }}>
            Observations
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={2}
            placeholder="Caveats, context, anything worth flagging about this figure"
            className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none mb-3"
            style={{ border: `1.5px solid ${C.line}`, background: C.paper, color: C.ink }}
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md text-xs font-semibold"
            style={{ background: C.teal, color: "#fff", opacity: saving ? 0.5 : 1 }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {status?.updatedBy && (
            <span className="text-xs ml-3" style={{ color: C.muted }}>
              Last updated by {status.updatedBy} · {new Date(status.updatedAt).toLocaleDateString()}
            </span>
          )}
</>
) : (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <div className="font-semibold mb-0.5" style={{ color: C.muted }}>Reported figure</div>
                <div style={{ color: C.ink }}>{status?.entries?.length ? status.entries.length : "Not yet reported"}{ind.hasDenominator && status?.denominator ? ` / ${status.denominator}` : ""}</div>
              </div>
              <div>
                <div className="font-semibold mb-0.5" style={{ color: C.muted }}>Data source</div>
                <div style={{ color: C.ink }}>{Array.isArray(status?.dataSource) && status.dataSource.length ? status.dataSource.join(", ") : "—"}</div>
              </div>
            </div>
            {status?.observations && (
              <div className="text-xs mb-3" style={{ color: C.inkSoft }}>
                <span className="font-semibold" style={{ color: C.muted }}>Observations: </span>{status.observations}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md" style={{ background: C.lineSoft, color: C.muted }}>
              <Lock size={12} /> Only admins can edit the Indicator dashboard.
            </div>
          </div>
)}
        </div>
      )}
    </div>
  );
}

function IndicatorDashboardView({ statuses, onSave, identity }) {
  const goals = ["Goal 1", "Goal 2", "Goal 3"];
  const [filter, setFilter] = useState({ rag: null, si: null });

  const overallCounts = useMemo(() => {
    const counts = { "on-track": 0, "at-risk": 0, "off-track": 0, "not-started": 0 };
    SI_DASHBOARD.forEach((s) => {
      s.indicators.forEach((ind) => {
        const rag = statuses[`${s.si}-${ind.letter}`]?.rag || "not-started";
        counts[rag] = (counts[rag] || 0) + 1;
      });
    });
    return RAG_OPTIONS.map((r) => ({ id: r.id, name: r.label, value: counts[r.id], color: r.color }));
  }, [statuses]);

  const bySiCounts = useMemo(() => {
    return SI_DASHBOARD.map((s) => {
      const row = { si: s.si };
      RAG_OPTIONS.forEach((r) => { row[r.id] = 0; });
      s.indicators.forEach((ind) => {
        const rag = statuses[`${s.si}-${ind.letter}`]?.rag || "not-started";
        row[rag] = (row[rag] || 0) + 1;
      });
      return row;
    });
  }, [statuses]);

  const handleExport = () => {
    const lines = ["SI\tIndicator\tOutputs feeding it\tStatus\tReported figure\tEntries (detail)\tData source\tObservations\tLast updated by\tLast updated"];
    SI_DASHBOARD.forEach((s) => {
      s.indicators.forEach((ind) => {
        const st = statuses[`${s.si}-${ind.letter}`] || {};
        const ragLabel = RAG_OPTIONS.find((r) => r.id === (st.rag || "not-started")).label;
        const cov = ind.coverage.map((c) => `${c.output}(${c.rating})`).join("; ");
        const count = st.entries?.length || 0;
        const figure = ind.hasDenominator && st.denominator
          ? `${count} / ${st.denominator} (${Math.round((count / Number(st.denominator)) * 1000) / 10}%)`
          : `${count}`;
        const entriesDetail = (st.entries || [])
          .map((e) => ind.fields.map((f) => e[f.key] || "").join(" | "))
          .join(" ;; ");
        lines.push([
          s.title, `(${ind.letter}) ${ind.text}`, cov, ragLabel,
          figure, entriesDetail.replace(/\t/g, " "),
          (Array.isArray(st.dataSource) ? st.dataSource.join("; ") : (st.dataSource || "")),
          (st.observations || "").replace(/\t/g, " "), st.updatedBy || "",
          st.updatedAt ? new Date(st.updatedAt).toLocaleDateString() : "",
        ].join("\t"));
      });
    });
    const blob = new Blob([lines.join("\n")], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gndr-indicator-dashboard.tsv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <SectionLabel>Progress overview — {SI_DASHBOARD.reduce((n, s) => n + s.indicators.length, 0)} indicators</SectionLabel>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md"
          style={{ border: `1.5px solid ${C.line}`, color: C.tealDeep, background: C.paperRaised }}
        >
          <Download size={13} /> Export data (.tsv)
        </button>
      </div>

      <div
        className="rounded-lg p-4 mb-4"
        style={{ background: C.paperRaised, border: `1px solid ${C.lineSoft}` }}
      >
        <div className="text-xs font-semibold mb-2" style={{ color: C.inkSoft }}>All indicators, by status — click a bar to filter</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={overallCounts} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: C.inkSoft }} axisLine={false} tickLine={false} width={90} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${C.line}` }} />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              barSize={18}
              cursor="pointer"
              onClick={(d) => setFilter((f) => (f.rag === d.id && !f.si ? { rag: null, si: null } : { rag: d.id, si: null }))}
            >
              {overallCounts.map((d, i) => (
                <Cell key={i} fill={d.color} opacity={filter.rag && filter.rag !== d.id ? 0.35 : 1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        className="rounded-lg p-4 mb-4"
        style={{ background: C.paperRaised, border: `1px solid ${C.lineSoft}` }}
      >
        <div className="text-xs font-semibold mb-2" style={{ color: C.inkSoft }}>Status by Strategic Initiative — click a segment to filter</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={bySiCounts} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.lineSoft} vertical={false} />
            <XAxis dataKey="si" tick={{ fontSize: 10, fill: C.inkSoft }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${C.line}` }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {RAG_OPTIONS.map((r) => (
              <Bar
                key={r.id}
                dataKey={r.id}
                name={r.label}
                stackId="a"
                fill={r.color}
                radius={r.id === "not-started" ? [3, 3, 0, 0] : 0}
                cursor="pointer"
                onClick={(d) =>
                  setFilter((f) =>
                    f.rag === r.id && f.si === d.si ? { rag: null, si: null } : { rag: r.id, si: d.si }
                  )
                }
                opacity={filter.rag && filter.rag !== r.id ? 0.35 : 1}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {(filter.rag || filter.si) && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs" style={{ color: C.muted }}>Filtering by:</span>
          <Pill color={C.tealDeep} bg={C.tealTint}>
            {filter.si ? `${filter.si} · ` : ""}{RAG_OPTIONS.find((r) => r.id === filter.rag)?.label || "All statuses"}
          </Pill>
          <button
            onClick={() => setFilter({ rag: null, si: null })}
            className="text-xs underline"
            style={{ color: C.tealDeep }}
          >
            Clear
          </button>
        </div>
      )}

      {goals.map((goal) => (
        <div key={goal} className="mb-8">
          <SectionLabel>{goal}</SectionLabel>
          {SI_DASHBOARD.filter((s) => s.goal === goal)
            .filter((s) => !filter.si || s.si === filter.si)
            .map((s) => {
              const visibleIndicators = s.indicators.filter((ind) => {
                if (!filter.rag) return true;
                const rag = statuses[`${s.si}-${ind.letter}`]?.rag || "not-started";
                return rag === filter.rag;
              });
              if (visibleIndicators.length === 0) return null;
              return (
                <div key={s.si} className="mb-5">
                  <div className="text-sm font-semibold mb-2" style={{ color: C.teal }}>{s.title}</div>
                  {visibleIndicators.map((ind) => (
                    <IndicatorCard
                      key={ind.letter}
                      si={s.si}
                      ind={ind}
                      status={statuses[`${s.si}-${ind.letter}`]}
                      onSave={onSave}
                      identity={identity}
                    />
                  ))}
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}

/* ============================== MAIN APP ============================== */

export default function App() {
  const [identity, setIdentity] = useState(null);
  const [loadingIdentity, setLoadingIdentity] = useState(true);
  const [view, setView] = useState("targets");
  const [updates, setUpdates] = useState({});
  const [indicatorStatus, setIndicatorStatus] = useState({});
  const [activityMeta, setActivityMetaState] = useState({}); // { [row]: { type, smg, countries, ... } }
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [ready, setReady] = useState(false);

  // set document/app title
  useEffect(() => {
    try {
      document.title = "GNDR Global Strategy 2026–2030 — Goals & Strategic Initiatives";
    } catch (e) {}
  }, []);

  // load saved identity + shared data on mount
  useEffect(() => {
    (async () => {
      const rememberedEmail = getRememberedEmail();
      if (rememberedEmail) {
        const savedIdentity = await getIdentity(rememberedEmail);
        if (savedIdentity) {
          setIdentity({ name: savedIdentity.name, email: savedIdentity.email, team: savedIdentity.team, isAdmin: isAdminEmail(savedIdentity.email) });
        }
      }
      setLoadingIdentity(false);

      // Activity updates: flat rows -> { [activityRow]: { [quarter]: payload } }
      const activityRows = await getAllActivityUpdates();
      const u = {};
      activityRows.forEach((r) => {
        if (!r.activity_row || !r.quarter) return;
        u[r.activity_row] = u[r.activity_row] || {};
        u[r.activity_row][r.quarter] = {
          plan: r.plan, whatHappened: r.what_happened, adaptation: r.adaptation,
          confidence: r.confidence === "" ? null : Number(r.confidence),
          updatedBy: r.updated_by, updatedTeam: "", updatedAt: r.updated_at,
        };
      });
      setUpdates(u);

      // Indicator statuses: flat rows -> { [si-letter]: statusObject }
      const indicatorRows = await getAllIndicatorStatuses();
      const s = {};
      indicatorRows.forEach((r) => {
        if (!r.si || !r.letter) return;
        let entries = [];
        try { entries = r.entries_json ? JSON.parse(r.entries_json) : []; } catch (e) {}
        s[`${r.si}-${r.letter}`] = {
          rag: r.rag || "not-started",
          entries,
          denominator: r.denominator || "",
          dataSource: r.data_source ? String(r.data_source).split("; ").filter(Boolean) : [],
          observations: r.observations || "",
          updatedBy: r.updated_by, updatedAt: r.updated_at,
        };
      });
      setIndicatorStatus(s);

      // Activity metadata: Type/SMG (admin-editable) + Countries (owner-editable)
      const metaRows = await getAllActivityMeta();
      const metaByRow = {};
      metaRows.forEach((r) => {
        if (!r.activity_row) return;
        metaByRow[r.activity_row] = { type: r.type || "", smg: r.smg || "", countries: r.countries || "" };
      });
      setActivityMetaState(metaByRow);

      // Projects for the map — merge Sheet data over the seeded pilot default
      const projectRows = await getAllProjects();
      if (projectRows.length > 0) {
        setProjects(projectRows.map((r) => ({
          project_id: r.project_id, project_name: r.project_name,
          countries: r.countries, donor: r.donor, partners: r.partners,
        })));
      }

      setReady(true);
    })();
  }, []);

  const handleSelectIdentity = async (id) => {
    const withAdmin = { ...id, isAdmin: isAdminEmail(id.email) };
    setIdentity(withAdmin);
    rememberEmail(id.email);
    await saveIdentityToSheet(withAdmin);
  };

  const handleSaveUpdate = useCallback(async (row, quarter, payload) => {
    setUpdates((prev) => {
      const next = { ...prev, [row]: { ...(prev[row] || {}), [quarter]: payload } };
      return next;
    });
    await setActivityUpdate({
      activityRow: row, quarter,
      plan: payload.plan, whatHappened: payload.whatHappened, adaptation: payload.adaptation,
      confidence: payload.confidence, updatedBy: payload.updatedBy, updatedByEmail: identity?.email,
    });
  }, [identity]);

  const handleSaveIndicatorStatus = useCallback(async (key, payload) => {
    if (!identity?.isAdmin) return; // safety net — UI already hides the controls
    setIndicatorStatus((prev) => {
      const next = { ...prev, [key]: payload };
      return next;
    });
    const [si, letter] = key.split("-");
    await saveIndicatorStatusToSheet({
      si, letter, rag: payload.rag, reportedValue: payload.count,
      denominator: payload.denominator, dataSource: (payload.dataSource || []).join("; "),
      observations: payload.observations, entriesJson: JSON.stringify(payload.entries || []),
      updatedBy: payload.updatedBy, updatedByEmail: identity?.email,
    });
  }, [identity]);

  const handleSetActivityTypeSmg = useCallback(async (row, { type, smg }) => {
    if (!identity?.isAdmin) return;
    setActivityMetaState((prev) => ({ ...prev, [row]: { ...(prev[row] || {}), ...(type !== undefined ? { type } : {}), ...(smg !== undefined ? { smg } : {}) } }));
    await setActivityMeta({ activityRow: row, type, smg, updatedBy: identity.name, updatedByEmail: identity.email });
  }, [identity]);

  const handleSetActivityCountries = useCallback(async (row, countries) => {
    setActivityMetaState((prev) => ({ ...prev, [row]: { ...(prev[row] || {}), countries } }));
    await setActivityMeta({ activityRow: row, countries, updatedBy: identity?.name, updatedByEmail: identity?.email });
  }, [identity]);

  const handleSaveProject = useCallback(async (payload) => {
    if (!identity?.isAdmin) return;
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.project_id === payload.project_id);
      if (idx === -1) return [...prev, payload];
      const next = [...prev];
      next[idx] = payload;
      return next;
    });
    await setProject({
      projectId: payload.project_id, projectName: payload.project_name, countries: payload.countries,
      donor: payload.donor, partners: payload.partners, duration: payload.duration, phase: payload.phase,
      updatedBy: identity.name, updatedByEmail: identity.email,
    });
  }, [identity]);

  if (loadingIdentity || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.paper }}>
        <Loader2 className="animate-spin" size={22} color={C.teal} />
      </div>
    );
  }

  if (!identity) {
    return <IdentityPicker onSelect={handleSelectIdentity} loading={false} />;
  }

  const nav = [
    { id: "targets", label: "What are we trying to achieve", icon: Radio },
    { id: "mine", label: "My activities", icon: ClipboardList },
    { id: "all", label: "Activity Tracker", icon: LayoutGrid },
    { id: "dashboard", label: "Indicator dashboard", icon: Gauge },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: C.paper }}>
      {/* left rail */}
      <div
        className="w-56 shrink-0 hidden md:flex flex-col px-5 py-6"
        style={{ background: C.teal, color: "#fff" }}
      >
        <div className="mb-8 flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ border: `3px solid ${C.amberBrand}` }}
          >
            <span className="text-[9px] font-extrabold">GNDR</span>
          </div>
          <div className="text-sm font-semibold leading-snug">Global Strategy 2026-2030 Monitoring</div>
        </div>
        <nav className="space-y-1 flex-1">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = view === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left font-medium transition-colors"
                style={{
                  background: active ? C.amberBrand : "transparent",
                  color: active ? C.ink : "#CDEAF0",
                }}
              >
                <Icon size={16} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="pt-4 mt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.25)" }}>
          <div className="flex items-center gap-1.5">
            <div className="text-sm font-semibold">{identity.name}</div>
            {identity.isAdmin && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: C.amberBrand, color: "#4A3200" }}>
                ADMIN
              </span>
            )}
          </div>
          <div className="text-xs mb-3" style={{ color: "#CDEAF0" }}>{identity.team}</div>
          <button
            onClick={() => { setIdentity(null); rememberEmail(""); }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)" }}
          >
            <Repeat size={13} />
            Switch person
          </button>
        </div>
      </div>

      {/* mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3" style={{ background: C.teal }}>
        <span className="text-sm font-semibold text-white flex items-center gap-1.5">
          {identity.name} · {identity.team}
          {identity.isAdmin && (
            <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: C.amberBrand, color: "#4A3200" }}>ADMIN</span>
          )}
        </span>
        <button
          onClick={() => { setIdentity(null); rememberEmail(""); }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)" }}
        >
          <Repeat size={12} /> Switch
        </button>
      </div>

      {/* main */}
      <div className="flex-1 px-5 md:px-10 py-8 md:py-10 mt-12 md:mt-0 overflow-x-hidden">
        <div className="flex md:hidden gap-2 mb-6 overflow-x-auto pb-1">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className="px-3 py-1.5 rounded-md text-xs font-medium shrink-0"
              style={{
                background: view === n.id ? C.teal : C.paperRaised,
                color: view === n.id ? "#fff" : C.inkSoft,
                border: `1px solid ${C.line}`,
              }}
            >
              {n.label}
            </button>
          ))}
        </div>

        <div className="mb-7">
          <h1 className="text-2xl font-extrabold" style={{ color: C.teal }}>
            {view === "mine" && "My activities"}
            {view === "all" && "Activity Tracker"}
            {view === "targets" && "What are we trying to achieve"}
            {view === "dashboard" && "Indicator dashboard"}
          </h1>
          <div className="h-[3px] w-12 mt-2 mb-3" style={{ background: C.amberBrand }} />
          <p className="text-sm" style={{ color: C.inkSoft }}>
            {view === "mine" && "Log a quarterly update against each activity you own."}
            {view === "dashboard" && ""}
          </p>
        </div>

        {view === "mine" && (
          <MyActivitiesView
            identity={identity}
            updates={updates}
            onSaveUpdate={handleSaveUpdate}
            activityMeta={activityMeta}
            onSetTypeSmg={handleSetActivityTypeSmg}
            onSetCountries={handleSetActivityCountries}
          />
        )}
        {view === "all" && <AllActivitiesView updates={updates} projects={projects} activityMeta={activityMeta} identity={identity} onSaveProject={handleSaveProject} onSetTypeSmg={handleSetActivityTypeSmg} />}
        {view === "targets" && (
          <TargetsView identity={identity} />
        )}
        {view === "dashboard" && (
          <IndicatorDashboardView statuses={indicatorStatus} onSave={handleSaveIndicatorStatus} identity={identity} />
        )}
      </div>
    </div>
  );
}
