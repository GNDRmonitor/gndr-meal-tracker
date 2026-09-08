import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronRight, ChevronDown, Circle, CheckCircle2, AlertTriangle, Radio, Target, ClipboardList, LayoutGrid, X, Loader2, Gauge, Download, Repeat } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import {
  getIdentity, setIdentity as saveIdentityToSheet,
  getAllActivityUpdates, setActivityUpdate,
  getAllIndicatorStatuses, setIndicatorStatus as saveIndicatorStatusToSheet,
  rememberEmail, getRememberedEmail,
} from "./storage.js";
import { renderGoogleSignIn } from "./googleAuth.js";

/* ============================== DATA ============================== */

const ACTIVITIES = [
  {row:4,si:"SI 1.1",output:"Output 1.1.1",activity:"Collection of community practices, case studies and member/community-led storytelling from GNDR projects",owner:"Programmes",confirmed:false},
  {row:5,si:"SI 1.1",output:"Output 1.1.2",activity:"LLAA Cookbook",owner:"Regional Leads",confirmed:false},
  {row:6,si:"SI 1.1",output:"Output 1.1.2",activity:"HuT close-out knowledge products",owner:"Regional Leads",confirmed:false},
  {row:7,si:"SI 1.1",output:"Output 1.1.2",activity:"Guidance and tools developed under LRF project",owner:"Programmes",confirmed:false},
  {row:8,si:"SI 1.1",output:"Output 1.1.2",activity:"Women-led innovative anticipatory action — Indonesia & Philippines (finalisation, completed Q1)",owner:"Programmes",confirmed:false},
  {row:9,si:"SI 1.1",output:"Output 1.1.3",activity:"LRF community-led landslide resilience (Ethiopia & Nepal)",owner:"Programmes",confirmed:false},
  {row:10,si:"SI 1.1",output:"Output 1.1.3",activity:"Stakeholder Needs Assessment Report developed for Nepal and Ethiopia (2 reports)",owner:"Programmes",confirmed:false},
  {row:11,si:"SI 1.1",output:"Output 1.1.3",activity:"Capacity building of local actors on early warnings and actions in Nepal and Ethiopia (initiated, 7 communities)",owner:"Programmes",confirmed:false},
  {row:12,si:"SI 1.1",output:"Output 1.1.3",activity:"Capacity building of local actors on early warnings and actions in Nepal and Ethiopia (completed, 7 communities)",owner:"Programmes",confirmed:false},
  {row:13,si:"SI 1.1",output:"Output 1.1.3",activity:"Harnessing Technology for Climate-Smart Landslide Detection — Kyrgyzstan",owner:"Programmes",confirmed:false},
  {row:14,si:"SI 1.1",output:"Output 1.1.3",activity:"Community survey and consultation in 5 communities / needs and feasibility services",owner:"Programmes",confirmed:false},
  {row:15,si:"SI 1.1",output:"Output 1.1.3",activity:"Development of early warning protocols in 5 communities through community workshops",owner:"Programmes",confirmed:false},
  {row:16,si:"SI 1.1",output:"Output 1.1.3",activity:"Nature-based solutions — Pacific Circle (Tonga & Kiribati)",owner:"Programmes",confirmed:false},
  {row:17,si:"SI 1.2",output:"Output 1.2.1",activity:"Participatory Needs Assessments under Kiwa Project",owner:"Programmes",confirmed:false},
  {row:18,si:"SI 1.2",output:"Output 1.2.1",activity:"Needs Assessment under Climate-Smart Landslide Detection (Kyrgyzstan)",owner:"Programmes",confirmed:false},
  {row:19,si:"SI 1.2",output:"Output 1.2.1",activity:"New iteration of Views from the Frontline (VFL) — partnership building, fundraising, programme design & the VFL platform",owner:"FRIMCO + Programmes",confirmed:true},
  {row:20,si:"SI 1.2",output:"Output 1.2.2",activity:"REAP system-mapping evidence shared into the partnership",owner:"FRIMCO",confirmed:false},
  {row:21,si:"SI 1.2",output:"Output 1.2.2",activity:"Member-led initiatives showcased on GNDR platforms",owner:"Membership Engagement",confirmed:false},
  {row:22,si:"SI 1.2",output:"Output 1.2.3",activity:"Policy Briefs for COP31",owner:"Policy",confirmed:false},
  {row:23,si:"SI 1.2",output:"Output 1.2.3",activity:"Contributions in PPED discussions",owner:"Policy",confirmed:false},
  {row:24,si:"SI 1.2",output:"Output 1.2.3",activity:"Evidence, summaries and presentations at global and regional forums",owner:"Policy",confirmed:false},
  {row:25,si:"SI 1.2",output:"Output 1.2.3",activity:"Targeted engagement with national governments (LRF Ethiopia & Nepal, Kyrgyzstan; ADPC-UNDP Ethiopia & Togo)",owner:"Policy",confirmed:false},
  {row:26,si:"SI 2.1",output:"Output 2.1.1",activity:"Regionalisation of the Global Strategy 2026-2030",owner:"Regional Leads",confirmed:false},
  {row:27,si:"SI 2.1",output:"Output 2.1.1",activity:"Locally-led delivery advanced in all three regions",owner:"Regional Leads",confirmed:false},
  {row:30,si:"SI 2.1",output:"Output 2.1.1",activity:"Region's locally-led delivery and government engagement",owner:"Regional Leads",confirmed:false},
  {row:31,si:"SI 2.1",output:"Output 2.1.2",activity:"Local Leadership Academy (member-led webinars and learning exchanges, incl. Peru replication)",owner:"Membership Engagement",confirmed:false},
  {row:32,si:"SI 2.1",output:"Output 2.1.2",activity:"Local Leadership Academy: specific topics to be defined for in-house training (no budget for external trainers)",owner:"Membership Engagement",confirmed:false},
  {row:33,si:"SI 2.1",output:"Output 2.1.2",activity:"6 member-led webinars delivered with 300 members participating, + 3 NFP webinars",owner:"Membership Engagement",confirmed:false},
  {row:34,si:"SI 2.1",output:"Output 2.1.2",activity:"Region's share of LLA webinars & learning exchanges delivered with members (Africa & West Asia)",owner:"Regional Leads",confirmed:true},
  {row:35,si:"SI 2.1",output:"Output 2.1.2",activity:"Region's share of LLA webinars & learning exchanges delivered with members (Asia & Europe)",owner:"Regional Leads",confirmed:true},
  {row:36,si:"SI 2.1",output:"Output 2.1.3",activity:"Pre-Evacuation Platform (LAC)",owner:"Regional Leads",confirmed:false},
  {row:37,si:"SI 2.1",output:"Output 2.1.3",activity:"Region's locally-led delivery (incl. IN/IOM and PEP)",owner:"Regional Leads",confirmed:false},
  {row:38,si:"SI 2.2",output:"Output 2.2.1",activity:"Co-created advocacy briefs returned to members",owner:"Policy",confirmed:false},
  {row:39,si:"SI 2.2",output:"Output 2.2.1",activity:"SEM and PPED engagement for the Sendai framework's successor",owner:"Policy",confirmed:false},
  {row:40,si:"SI 2.2",output:"Output 2.2.2",activity:"SEM and PPED engagement (post-Sendai)",owner:"Policy",confirmed:false},
  {row:41,si:"SI 2.2",output:"Output 2.2.2",activity:"Collaboration with UNDRR",owner:"Policy",confirmed:false},
  {row:42,si:"SI 2.2",output:"Output 2.2.2",activity:"UNFCCC SB64 and COP31",owner:"Policy",confirmed:false},
  {row:43,si:"SI 2.2",output:"Output 2.2.2",activity:"EU, South Asia, Africa and LAC regional policy forums",owner:"Policy",confirmed:false},
  {row:44,si:"SI 2.2",output:"Output 2.2.2",activity:"GNDR profiled in non-DRR spaces",owner:"FRIMCO",confirmed:false},
  {row:45,si:"SI 2.2",output:"Output 2.2.2",activity:"REAP board and policy engagement",owner:"Policy",confirmed:false},
  {row:46,si:"SI 2.2",output:"Output 2.2.2",activity:"Engagement in SOFF processes, Concord and Bond UK",owner:"ED",confirmed:false},
  {row:47,si:"SI 2.2",output:"Output 2.2.3",activity:"Disaster risk financing research findings used in advocacy",owner:"Policy",confirmed:false},
  {row:48,si:"SI 2.2",output:"Output 2.2.3",activity:"Engagement with multilateral and financing actors",owner:"FRIMCO",confirmed:false},
  {row:49,si:"SI 2.2",output:"Output 2.2.3",activity:"Give Us One Day campaign as the advocacy ask for trust-based EWS financing (co-led with REAP)",owner:"FRIMCO",confirmed:false},
  {row:50,si:"SI 2.2",output:"Output 2.2.3",activity:"IDDRR, DRR-financing and women-in-DRR visibility",owner:"Policy",confirmed:false},
  {row:51,si:"SI 3.1",output:"Output 3.1.1",activity:"Strategy launch and strategic communications",owner:"FRIMCO",confirmed:false},
  {row:52,si:"SI 3.1",output:"Output 3.1.1",activity:"Member and community-led storytelling",owner:"FRIMCO",confirmed:false},
  {row:53,si:"SI 3.1",output:"Output 3.1.1",activity:"Reimagined Annual Report",owner:"FRIMCO",confirmed:false},
  {row:54,si:"SI 3.1",output:"Output 3.1.1",activity:"Public-facing visual network map",owner:"FRIMCO",confirmed:false},
  {row:55,si:"SI 3.1",output:"Output 3.1.1",activity:"Communications embedded in projects (KR5)",owner:"FRIMCO",confirmed:false},
  {row:56,si:"SI 3.1",output:"Output 3.1.2",activity:"RAG and National Coordination meetings across all regions",owner:"To confirm",confirmed:true},
  {row:58,si:"SI 3.1",output:"Output 3.1.2",activity:"Global Board engagement and performance KPIs",owner:"ED",confirmed:false},
  {row:59,si:"SI 3.1",output:"Output 3.1.2",activity:"Region's RAG, NCM and NFP delivery (Africa & West Asia)",owner:"Regional Leads",confirmed:false},
  {row:60,si:"SI 3.1",output:"Output 3.1.2",activity:"Region's RAG, NCM and NFP delivery (Asia & Europe)",owner:"Regional Leads",confirmed:false},
  {row:61,si:"SI 3.1",output:"Output 3.1.2",activity:"Region's RAG, NCM and NFP delivery (Americas & Caribbean)",owner:"Regional Leads",confirmed:false},
  {row:62,si:"SI 3.1",output:"Output 3.1.3",activity:"Community Platform; improved member-data quality",owner:"Membership Engagement",confirmed:false},
  {row:63,si:"SI 3.1",output:"Output 3.1.3",activity:"Annual member survey",owner:"Membership Engagement",confirmed:false},
  {row:65,si:"SI 3.1",output:"Output 3.1.3",activity:"Member contribution and participation tracking; recognition of contributions",owner:"Membership Engagement",confirmed:false},
  {row:66,si:"SI 3.1",output:"Output 3.1.3",activity:"Communications embedded within projects",owner:"FRIMCO",confirmed:false},
  {row:67,si:"SI 3.1",output:"Output 3.1.4",activity:"Conduct Global Summit every 2 years",owner:"ED",confirmed:false},
  {row:68,si:"SI 3.1",output:"Output 3.1.4",activity:"Risk Drivers Working Groups reactivated",owner:"To confirm",confirmed:false},
  {row:69,si:"SI 3.1",output:"Output 3.1.4",activity:"Member-led webinars and peer exchanges",owner:"Membership Engagement",confirmed:false},
  {row:71,si:"SI 3.1",output:"Output 3.1.4",activity:"Thematic collaboration through the Community Platform",owner:"Membership Engagement",confirmed:false},
  {row:72,si:"SI 3.1",output:"Output 3.1.4",activity:"Mechanisms for solidarity and mutual support between members",owner:"Membership Engagement",confirmed:false},
  {row:73,si:"SI 3.2",output:"Output 3.2.1",activity:"New strategic partnerships and donor stewardship",owner:"FRIMCO",confirmed:false},
  {row:74,si:"SI 3.2",output:"Output 3.2.1",activity:"Foresight Fund developed for 2027 launch",owner:"FRIMCO",confirmed:false},
  {row:75,si:"SI 3.2",output:"Output 3.2.1",activity:"Fundraising systems and policies",owner:"FRIMCO",confirmed:false},
  {row:76,si:"SI 3.2",output:"Output 3.2.1",activity:"Give Us One Day funding mechanism (co-led with REAP)",owner:"FRIMCO",confirmed:false},
  {row:77,si:"SI 3.2",output:"Output 3.2.2",activity:"Regional calls activating fundraising, storytelling and impact",owner:"FRIMCO",confirmed:false},
  {row:79,si:"SI 3.2",output:"Output 3.2.3",activity:"Network-level MEAL framework operationalised (baseline, Year 1 prep, ongoing operation)",owner:"FRIMCO",confirmed:false},
  {row:81,si:"SI 3.2",output:"Output 3.2.3",activity:"Data infrastructure, 3-year financial model & Strategic Coverage Table",owner:"Operations",confirmed:false},
  {row:83,si:"SI 3.2",output:"Output 3.2.3",activity:"Collaboration metrics integrated into donor reporting (KR3)",owner:"FRIMCO",confirmed:false},
  {row:84,si:"SI 3.2",output:"Output 3.2.4",activity:"Three-year financial planning",owner:"Operations",confirmed:false},
  {row:85,si:"SI 3.2",output:"Output 3.2.4",activity:"Governance and financial-management systems",owner:"ED",confirmed:false},
  {row:86,si:"SI 3.2",output:"Output 3.2.4",activity:"Audit and compliance",owner:"Operations",confirmed:false},
  {row:87,si:"SI 3.2",output:"Output 3.2.4",activity:"Risk management and business continuity",owner:"Operations",confirmed:false},
  {row:88,si:"SI 3.2",output:"Output 3.2.4",activity:"Talent management and staff wellbeing",owner:"Operations",confirmed:false},
  {row:89,si:"SI 3.2",output:"Output 3.2.4",activity:"Organisational policies and operational systems",owner:"Operations",confirmed:false},
  {row:90,si:"SI 3.2",output:"Output 3.2.4",activity:"Conduct face-to-face governance board meeting",owner:"ED",confirmed:false},
];

const OUTPUTS = [
  {id:"1.1.1",goal:"Goal 1",si:"SI 1.1 — Harnessing practice-led learning",short:"Practices & innovations documented",y1:"Process milestone, baseline-setting: At least 20 member- and community-led practices, innovations, case studies or stories documented and synthesised in 2026-27.",y24:"Outcome milestone: At least 100 additional practices, innovations, case studies or stories documented during 2027-30, bringing the cumulative total to at least 120 by 2030, with representation across all regions and major risk-driver themes."},
  {id:"1.1.2",goal:"Goal 1",si:"SI 1.1 — Harnessing practice-led learning",short:"Guidance & tools co-developed with members",y1:"Process milestone, baseline-setting: At least 3 practical guidance, tool or learning products co-developed, tested and shared with members and communities in 2026-27, with a mechanism established to track subsequent adaptation and use.",y24:"Outcome milestone: At least 6 practical guidance or tool products in active use by 2030, with evidence of adaptation or use in at least 15 countries, building on the tracking mechanism established in Year 1."},
  {id:"1.1.3",goal:"Goal 1",si:"SI 1.1 — Harnessing practice-led learning",short:"Solutions co-designed, tested & validated",y1:"Process milestone, baseline-setting: At least 7 locally led risk-informed resilience solutions co-designed, tested and validated with communities in 2026-27 through the community-led landslide resilience work in Ethiopia and Nepal.",y24:"Outcome milestone: At least 5 additional locally led risk-informed resilience solutions co-designed, tested and validated during 2027-30 through the Climate-Smart Landslide Detection work in Kyrgyzstan and further sites, bringing the cumulative total to at least 12 by 2030."},
  {id:"1.2.1",goal:"Goal 1",si:"SI 1.2 — Generating persuasive evidence",short:"Evidence co-generated on knowledge gaps",y1:"Process milestone, baseline-setting: 7 co-creation workshops/participatory consultations held under the LRF Ethiopia & Nepal work in 2026-27, reaching 7 communities and 3,150+ people, plus community survey/baseline work in Kiribati and Tonga (2,800 people). Total Year 1: at least 7 communities and 5,950+ people reached.",y24:"Outcome milestone: At least 25,000 additional people reached through evidence co-generation during 2027-30, bringing the cumulative total to approximately 31,000 people by 2030."},
  {id:"1.2.2",goal:"Goal 1",si:"SI 1.2 — Generating persuasive evidence",short:"Research collaborations strengthen evidence",y1:"Process milestone, baseline-setting: At least 2 formal collaborations with research institutions established (UCL/CDP, IIED).",y24:"Outcome milestone: At least 5 collaborations with research institutions active by 2030, with at least 3 joint research or evidence products delivered."},
  {id:"1.2.3",goal:"Goal 1",si:"SI 1.2 — Generating persuasive evidence",short:"Evidence amplified to decision-makers",y1:"Process milestone, baseline-setting: 1 global call to action (towards COP) and 2 regional policy events in which GNDR members will participate delivered in 2026-27.",y24:"Outcome milestone: Up to 10 policy products across the strategy period (CoP, Global Summit, Global Platform and Regional Platforms, PPED)."},
  {id:"2.1.1",goal:"Goal 2",si:"SI 2.1 — Unlocking locally-led change",short:"Ecosystem analysis & collaboration pathways",y1:"Process milestone, baseline-setting: 4 cross-exchange learning workshops with regional stakeholders held in 2026-27, supporting regional work plans for the Global Strategy rollout.",y24:"Outcome milestone: At least 20 ecosystem analyses or collaboration roadmaps developed by 2030, informing member engagement in at least 15 national or local DRR systems."},
  {id:"2.1.2",goal:"Goal 2",si:"SI 2.1 — Unlocking locally-led change",short:"Member policy & advocacy capacity",y1:"Process milestone, baseline-setting: 1 policy-focused Local Leadership Academy webinar delivered in 2026-27, reaching approximately 50 members.",y24:"Outcome milestone: Up to 2 additional policy-focused Local Leadership Academy webinars delivered during 2027-30 (bringing the total to 3 across the strategy period), reaching a cumulative total of approximately 150 members."},
  {id:"2.1.3",goal:"Goal 2",si:"SI 2.1 — Unlocking locally-led change",short:"Convening members with policymakers",y1:"Process milestone, baseline-setting: 3 country workshops convening CSOs and DRM institutions to validate the Pre-Evacuation Platform in LAC, plus at least 2 new dialogue/decision-making spaces opened per region for member participation in 2026-27.",y24:"Outcome milestone: At least 24 additional dialogue/decision-making spaces opened during 2027-30, bringing the cumulative total to at least 30 spaces by 2030, with evidence of follow-up or influence in at least 15 national or local systems."},
  {id:"2.2.1",goal:"Goal 2",si:"SI 2.2 — Influencing the next horizon of local leadership",short:"Evidence translated into policy asks",y1:"Process milestone, baseline-setting: 4 NGO constituency meetings for SEM facilitated, with monthly SEM advisory group support in 2026-27.",y24:"Outcome milestone: At least 8 co-created policy or advocacy products delivered during 2027-30."},
  {id:"2.2.2",goal:"Goal 2",si:"SI 2.2 — Influencing the next horizon of local leadership",short:"Shared advocacy across global processes",y1:"Process milestone, baseline-setting: 10 members facilitated to attend UNFCCC events (SB64, COP31); 150 members engaged in GNDR's COP31 call to action; 4 side events delivered; sustained engagement in EU and South Asia Regional Policy Forums; GNDR profiled on 2+ non-DRR platforms in 2026-27.",y24:"Outcome milestone: At least 12 priority regional/international processes engaged by 2030 (all regions), with evidence of GNDR's influence documented in at least 6."},
  {id:"2.2.3",goal:"Goal 2",si:"SI 2.2 — Influencing the next horizon of local leadership",short:"Advocacy for trust-based financing",y1:"Process milestone, baseline-setting: IDDRR webinar reaching 60+ members; joint GNDR/REAP 'Give Us One Day' campaign launched, targeting $28M for the missing last-mile EWS layer; webinar on 'Localisation of DRR Financing' research findings delivered; continued support to the LAC Network of Women in DRR in 2026-27.",y24:"Outcome milestone: At least 4 financing recommendations or collective advocacy initiatives advanced by 2030, with documented changes in the policy, practice or funding mechanisms of at least 3 target institutions."},
  {id:"3.1.1",goal:"Goal 3",si:"SI 3.1 — Strengthening the GNDR identity and member experience",short:"Identity communicated through member stories",y1:"Process milestone, baseline-setting: 20+ diverse member-led stories collected across all regions (30+ stretch), in 2+ languages; Strategy and identity communicated across all channels by end Q1, with 400+ new followers/quarter and 8 public newsletters published in 2026-27.",y24:"Outcome milestone: At least 100 diverse member and community stories collected and amplified by 2030, representing all regions and published in multiple languages, with evidence of increased audience reach and engagement from the 2027 baseline."},
  {id:"3.1.2",goal:"Goal 3",si:"SI 3.1 — Strengthening the GNDR identity and member experience",short:"Inclusive governance & representation",y1:"Process milestone, baseline-setting: Approximately 12 RAG meetings (4 per region) and 28 National Coordination Meetings supported in 2026-27, with NFPs mobilised; 12 Board Working Group meetings organised; Global Board performance KPIs implemented.",y24:"Outcome milestone: Governance meeting participation and leadership sustained annually through 2030, disaggregated by region, gender, age, disability and organisational type, with at least 60% of governance roles reflecting diverse representation."},
  {id:"3.1.3",goal:"Goal 3",si:"SI 3.1 — Strengthening the GNDR identity and member experience",short:"Member engagement & feedback mechanisms",y1:"Process milestone, baseline-setting: Community Platform refreshed and adopted (at least 6 improvements), with post-Summit member-data update and at least 50% expertise-mapping coverage; annual member survey redesigned (shorter, 3+ languages) and analysed in 2026-27.",y24:"Outcome milestone: Annual member survey conducted and acted upon; at least 70% of active members have updated profiles or expertise data by 2030; platform engagement increases annually from the 2027 baseline."},
  {id:"3.1.4",goal:"Goal 3",si:"SI 3.1 — Strengthening the GNDR identity and member experience",short:"Connection, solidarity & mutual support",y1:"Process milestone, baseline-setting: Network map live and publicly accessible, with evidence of external use; 4 Risk Drivers Working Groups reactivated with at least 12 meetings and 300 members participating; participatory storytelling approach scoped and piloted in at least 1 region.",y24:"Outcome milestone: Two Global Summits convened; four Risk Driver Groups maintained with at least 500 participating members; and at least 24 regional or thematic peer-learning and solidarity exchanges facilitated by 2030."},
  {id:"3.2.1",goal:"Goal 3",si:"SI 3.2 — Ensuring a resilient and sustainable network",short:"Funding partnerships diversified",y1:"Process milestone, baseline-setting: 5-7 strategically aligned multi-year partnerships secured (20% unrestricted income); Foresight Fund governance approved with 2 anchor partners secured toward a 5-6 foundation target by 2027; progress tracked toward the $28M 'Give Us One Day' ask.",y24:"Outcome milestone: At least 5 additional multi-year strategic funding partnerships secured during 2027-30, bringing the cumulative total to 10-12 by 2030; the Foresight Fund reaches its full 5-6 foundation-partner target, up from the 2 anchors secured in Year 1."},
  {id:"3.2.2",goal:"Goal 3",si:"SI 3.2 — Ensuring a resilient and sustainable network",short:"Members connected to funding opportunities",y1:"Process milestone, baseline-setting: 13 regional calls delivered to activate fundraising, storytelling and impact reporting across NFPs/RAGs; Go/No-Go policy and Fundraising Strategy approved in 2026-27.",y24:"Outcome milestone: At least 100 members connected to relevant funding, consortium or partnership opportunities by 2030, with the value and outcomes of successful opportunities tracked."},
  {id:"3.2.3",goal:"Goal 3",si:"SI 3.2 — Ensuring a resilient and sustainable network",short:"GNDR value evidenced for accountability",y1:"Process milestone, baseline-setting: 2026-30 MEAL framework documented, staff trained and in active use; Strategic Coverage Table and 3-year financial model populated and reviewed; at least 50 member contributions documented (aspirational); collaboration metrics included in 3+ donor reports.",y24:"Outcome milestone: Annual strategy performance reports produced, including member contribution, benefit, influence and collaboration data; at least 20 substantiated stories of network-level change documented by 2030."},
  {id:"3.2.4",goal:"Goal 3",si:"SI 3.2 — Ensuring a resilient and sustainable network",short:"Institutional systems strengthened",y1:"Process milestone, baseline-setting: Clean audit and statutory accounts delivered on time; policies and Risk Register updated; staffing gaps filled within 3 months; Staff Wellbeing & Workload survey conducted; Speak Up channel and safeguarding/manager training in place.",y24:"Outcome milestone: Clean annual audits and statutory compliance maintained; key institutional policies and risk systems reviewed annually; staff wellbeing, safeguarding and operational capacity monitored and improved."},
];

const TEAMS = ["Programmes","Policy","FRIMCO","Membership Engagement","Regional Leads","Operations","ED","Risk Drivers Lead","SLT"];
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
              placeholder="Fill this in at quarter-end"
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

function ActivityRow({ activity, updates, onOpenQuarter, expanded, onToggle }) {
  const statuses = {};
  QUARTERS.forEach((q) => {
    statuses[q] = updates?.[q]?.confidence ?? null;
  });

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
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs" style={{ color: C.muted }}>
              {activity.output}
            </span>
            {!activity.confirmed && (
              <Pill color={C.red} bg={C.redBg}>
                Owner to confirm
              </Pill>
            )}
          </div>
        </div>
        <QuarterTrack statuses={statuses} />
      </button>

      {expanded && (
        <div className="pb-4 pl-7 flex flex-wrap gap-2">
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
      )}
    </div>
  );
}

/* ============================== MY ACTIVITIES VIEW ============================== */

function MyActivitiesView({ identity, updates, onSaveUpdate }) {
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
        const outputId = output.replace("Output ", "");
        const siId = outputId.split(".").slice(0, 2).join(".");
        const indicators = (SI_DASHBOARD.find((s) => s.si === siId)?.indicators || [])
          .filter((ind) => ind.coverage.some((c) => c.output === outputId && ratingInfo(c.rating).weight > 0));
        return (
        <div key={output} className="mb-6">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <div
              className="text-sm font-semibold px-3 py-1.5 rounded-md inline-block"
              style={{ background: C.tealTint, color: C.tealDeep }}
            >
              {output}
            </div>
            {indicators.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]" style={{ color: C.muted }}>feeds indicator{indicators.length > 1 ? "s" : ""} in the dashboard:</span>
                {indicators.map((ind) => (
                  <span
                    key={ind.letter}
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                    style={{ background: C.amberBrandTint, color: "#8A5A00" }}
                  >
                    ({ind.letter})
                  </span>
                ))}
              </div>
            )}
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

function AllActivitiesView({ updates }) {
  const [siFilter, setSiFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState(null);

  const sis = useMemo(() => ["All", ...Array.from(new Set(ACTIVITIES.map((a) => a.si)))], []);
  const owners = useMemo(() => ["All", ...TEAMS], []);

  const statusCounts = useMemo(() => {
    const counts = {};
    STATUS_BUCKETS.forEach((b) => { counts[b.label] = 0; });
    ACTIVITIES.forEach((a) => {
      const conf = latestConfidence(updates[a.row]);
      const label = confidenceInfo(conf).label;
      counts[label] = (counts[label] || 0) + 1;
    });
    return STATUS_BUCKETS.map((b) => ({ name: b.label, value: counts[b.label], color: b.color }));
  }, [updates]);

  const hasFilter = siFilter !== "All" || ownerFilter !== "All" || statusFilter;

  const filtered = ACTIVITIES.filter((a) => {
    if (siFilter !== "All" && a.si !== siFilter) return false;
    if (ownerFilter !== "All" && !a.owner.includes(ownerFilter)) return false;
    if (statusFilter) {
      const conf = latestConfidence(updates[a.row]);
      if (confidenceInfo(conf).label !== statusFilter) return false;
    }
    return true;
  });

  return (
    <div>
      <div
        className="rounded-lg p-4 mb-5"
        style={{ background: C.paperRaised, border: `1px solid ${C.lineSoft}` }}
      >
        <div className="text-xs font-semibold mb-2" style={{ color: C.inkSoft }}>
          All {ACTIVITIES.length} activities, by confidence — click a bar to filter
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
              onClick={(d) => setStatusFilter((s) => (s === d.name ? null : d.name))}
            >
              {statusCounts.map((d, i) => (
                <Cell key={i} fill={d.color} opacity={statusFilter && statusFilter !== d.name ? 0.35 : 1} />
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
            <option key={s} value={s}>
              {s === "All" ? "All strategic initiatives" : s}
            </option>
          ))}
        </select>
        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="px-3 py-1.5 rounded-md text-sm"
          style={{ border: `1.5px solid ${C.line}`, background: C.paperRaised, color: C.ink }}
        >
          {owners.map((o) => (
            <option key={o} value={o}>
              {o === "All" ? "All teams" : o}
            </option>
          ))}
        </select>
        {statusFilter && (
          <Pill color={C.tealDeep} bg={C.tealTint}>
            {statusFilter}
          </Pill>
        )}
        {hasFilter && (
          <button
            onClick={() => { setSiFilter("All"); setOwnerFilter("All"); setStatusFilter(null); }}
            className="text-xs underline"
            style={{ color: C.tealDeep }}
          >
            Clear filters
          </button>
        )}
        {hasFilter && (
          <span className="text-xs" style={{ color: C.muted }}>
            {filtered.length} activities
          </span>
        )}
      </div>

      {!hasFilter ? (
        <div
          className="text-sm text-center px-4 py-8 rounded-lg"
          style={{ background: C.tealTint, color: C.tealDeep }}
        >
          Select a strategic initiative, a team, or click a bar above to see the list of activities.
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.lineSoft}` }}>
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.lineSoft }}>
                <th className="text-left px-3 py-2 font-semibold" style={{ color: C.inkSoft }}>Output</th>
                <th className="text-left px-3 py-2 font-semibold" style={{ color: C.inkSoft }}>Activity</th>
                <th className="text-left px-3 py-2 font-semibold" style={{ color: C.inkSoft }}>Owner</th>
                <th className="text-left px-3 py-2 font-semibold" style={{ color: C.inkSoft }}>Last updated</th>
                <th className="text-left px-3 py-2 font-semibold" style={{ color: C.inkSoft }}>Confidence target will be met</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const latest = lastUpdatedLabel(updates[a.row]);
                const conf = latestConfidence(updates[a.row]);
                const info = confidenceInfo(conf);
                return (
                  <tr key={a.row} style={{ borderTop: `1px solid ${C.lineSoft}`, background: C.paperRaised }}>
                    <td className="px-3 py-2 whitespace-nowrap align-top" style={{ color: C.teal }}>{a.output}</td>
                    <td className="px-3 py-2 align-top" style={{ color: C.ink }}>{a.activity}</td>
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
      )}
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
      <div
        className="text-sm leading-relaxed mb-8 px-4 py-3.5 rounded-lg"
        style={{ background: C.tealTint, color: C.tealDeep }}
      >
        This is an application for monitoring our Global Strategy 2026–2030. A
        tool that will help us understand our progress, challenges and
        opportunities.
      </div>

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
          setIdentity({ name: savedIdentity.name, email: savedIdentity.email, team: savedIdentity.team });
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

      setReady(true);
    })();
  }, []);

  const handleSelectIdentity = async (id) => {
    setIdentity(id);
    rememberEmail(id.email);
    await saveIdentityToSheet(id);
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
    { id: "all", label: "All activities", icon: LayoutGrid },
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
          <div className="text-sm font-semibold">{identity.name}</div>
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
        <span className="text-sm font-semibold text-white">{identity.name} · {identity.team}</span>
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
            {view === "all" && "All activities"}
            {view === "targets" && "What are we trying to achieve"}
            {view === "dashboard" && "Indicator dashboard"}
          </h1>
          <div className="h-[3px] w-12 mt-2 mb-3" style={{ background: C.amberBrand }} />
          <p className="text-sm" style={{ color: C.inkSoft }}>
            {view === "mine" && "Log a quarterly update against each activity you own."}
            {view === "all" && "Browse every activity in the 2026-27 work plan."}
            {view === "dashboard" && ""}
          </p>
        </div>

        {view === "mine" && (
          <MyActivitiesView identity={identity} updates={updates} onSaveUpdate={handleSaveUpdate} />
        )}
        {view === "all" && <AllActivitiesView updates={updates} />}
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
