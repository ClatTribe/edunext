"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import DefaultLayout from "@/app/defaultLayout";
import Leaderboard from "./Leaderboard";
import JEEScoreGraph from "./JEEScoreGraph";
import PercentileCalculator from "./PercentileCalculator";

// --- CONFIGURATION ---
const accentColor = "#F59E0B";
const primaryBg = "#050818";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

// JEE Main Section Order for this specific key/paper format
// (Based on 25 questions per section as requested)
const JEE_SECTIONS = ["Mathematics", "Physics", "Chemistry"];

// --- ANSWER KEY ---
const CORRECT_ANSWER_KEY: { [questionId: string]: string | number } = {
  "860654976": "8606543317",
  "860654977": "8606543321",
  "860654978": "8606543325",
  "860654979": "8606543329",
  "860654980": "8606543333",
  "860654981": "8606543338",
  "860654982": "8606543342",
  "860654983": "8606543346",
  "860654984": "8606543348",
  "860654985": "8606543353",
  "860654986": "8606543357",
  "860654987": "8606543360",
  "860654988": "8606543364",
  "860654989": "8606543371",
  "860654990": "8606543374",
  "860654991": "8606543377",
  "860654992": "8606543382",
  "860654993": "8606543385",
  "860654994": "8606543389",
  "860654995": "8606543392",
  "860654996": 9,
  "860654997": 1979,
  "860654998": 20,
  "860654999": 5,
  "8606541000": 36,
  "8606541001": "8606543401",
  "8606541002": "8606543405",
  "8606541003": "8606543410",
  "8606541004": "8606543415",
  "8606541005": "8606543417",
  "8606541006": "8606543421",
  "8606541007": "8606543425",
  "8606541008": "8606543429",
  "8606541009": "8606543433",
  "8606541010": "8606543438",
  "8606541011": "8606543442",
  "8606541012": "8606543447",
  "8606541013": "8606543452",
  "8606541014": "8606543455",
  "8606541015": "8606543457",
  "8606541016": "8606543464",
  "8606541017": "8606543465",
  "8606541018": "8606543472",
  "8606541019": "8606543476",
  "8606541020": "8606543479",
  "8606541021": 2,
  "8606541022": 4,
  "8606541023": 1,
  "8606541024": 7,
  "8606541025": 14,
  "8606541026": "8606543487",
  "8606541027": "8606543491",
  "8606541028": "8606543497",
  "8606541029": "8606543500",
  "8606541030": "8606543503",
  "8606541031": "8606543508",
  "8606541032": "8606543511",
  "8606541033": "8606543514",
  "8606541034": "8606543520",
  "8606541035": "8606543524",
  "8606541036": "8606543526",
  "8606541037": "8606543532",
  "8606541038": "8606543536",
  "8606541039": "8606543539",
  "8606541040": "8606543543",
  "8606541041": "8606543547",
  "8606541042": "8606543550",
  "8606541043": "8606543557",
  "8606541044": "8606543561",
  "8606541045": "8606543562",
  "8606541046": 1031,
  "8606541047": 4,
  "8606541048": 57,
  "8606541049": 3,
  "8606541050": 10,
  "8606541126": "8606543827",
  "8606541127": "8606543832",
  "8606541128": "8606543834",
  "8606541129": "8606543839",
  "8606541130": "8606543844",
  "8606541131": "8606543849",
  "8606541132": "8606543851",
  "8606541133": "8606543854",
  "8606541134": "8606543861",
  "8606541135": "8606543864",
  "8606541136": "8606543867",
  "8606541137": "8606543872",
  "8606541138": "8606543875",
  "8606541139": "8606543880",
  "8606541140": "8606543883",
  "8606541141": "8606543886",
  "8606541142": "8606543891",
  "8606541143": "8606543895",
  "8606541144": "8606543899",
  "8606541145": "8606543903",
  "8606541146": 225,
  "8606541147": 2,
  "8606541148": 1333,
  "8606541149": 1,
  "8606541150": 17,
  "8606541151": "8606543912",
  "8606541152": "8606543916",
  "8606541153": "8606543922",
  "8606541154": "8606543923",
  "8606541155": "8606543930",
  "8606541156": "8606543933",
  "8606541157": "8606543936",
  "8606541158": "8606543940",
  "8606541159": "8606543946",
  "8606541160": "8606543947",
  "8606541161": "8606543953",
  "8606541162": "8606543955",
  "8606541163": "8606543959",
  "8606541164": "8606543966",
  "8606541165": "8606543969",
  "8606541166": "8606543974",
  "8606541167": "8606543978",
  "8606541168": "8606543980",
  "8606541169": "8606543986",
  "8606541170": "8606543988",
  "8606541171": 17,
  "8606541172": 280,
  "8606541173": 100,
  "8606541174": 1080,
  "8606541175": 500,
  "8606541176": "8606543997",
  "8606541177": "8606544002",
  "8606541178": "8606544007",
  "8606541179": "8606544008",
  "8606541180": "8606544014",
  "8606541181": "8606544018",
  "8606541182": "8606544022",
  "8606541183": "8606544026",
  "8606541184": "8606544028",
  "8606541185": "8606544034",
  "8606541186": "8606544038",
  "8606541187": "8606544041",
  "8606541188": "8606544047",
  "8606541189": "8606544051",
  "8606541190": "8606544053",
  "8606541191": "8606544059",
  "8606541192": "8606544062",
  "8606541193": "8606544067",
  "8606541194": "8606544069",
  "8606541195": "8606544073",
  "8606541196": 20,
  "8606541197": 13,
  "8606541198": 70,
  "8606541199": 6,
  "8606541200": 8,
  "860654826": "8606542808",
  "860654827": "8606542812",
  "860654828": "8606542814",
  "860654829": "8606542820",
  "860654830": "8606542824",
  "860654831": "8606542828",
  "860654832": "8606542830",
  "860654833": "8606542837",
  "860654834": "8606542840",
  "860654835": "8606542842",
  "860654836": "8606542847",
  "860654837": "8606542853",
  "860654838": "8606542856",
  "860654839": "8606542859",
  "860654840": "8606542864",
  "860654841": "8606542866",
  "860654842": "8606542873",
  "860654843": "8606542877",
  "860654844": "8606542881",
  "860654845": "8606542883",
  "860654846": 32,
  "860654847": 2,
  "860654848": 65,
  "860654849": 2,
  "860654850": 9,
  "860654851": "8606542892",
  "860654852": "8606542898",
  "860654853": "8606542900",
  "860654854": "8606542904",
  "860654855": "8606542907",
  "860654856": "8606542911",
  "860654857": "8606542916",
  "860654858": "8606542922",
  "860654859": "8606542924",
  "860654860": "8606542929",
  "860654861": "8606542934",
  "860654862": "8606542937",
  "860654863": "8606542939",
  "860654864": "8606542944",
  "860654865": "8606542948",
  "860654866": "8606542952",
  "860654867": "8606542958",
  "860654868": "8606542960",
  "860654869": "8606542963",
  "860654870": "8606542968",
  "860654871": 5,
  "860654872": 350,
  "860654873": 1800,
  "860654874": 14,
  "860654875": 10,
  "860654876": "8606542978",
  "860654877": "8606542981",
  "860654878": "8606542985",
  "860654879": "8606542989",
  "860654880": "8606542995",
  "860654881": "8606542998",
  "860654882": "8606543003",
  "860654883": "8606543006",
  "860654884": "8606543009",
  "860654885": "8606543012",
  "860654886": "8606543019",
  "860654887": "8606543020",
  "860654888": "8606543024",
  "860654889": "8606543031",
  "860654890": "8606543032",
  "860654891": "8606543036",
  "860654892": "8606543042",
  "860654893": "8606543045",
  "860654894": "8606543048",
  "860654895": "8606543053",
  "860654896": 3,
  "860654897": 15,
  "860654898": 100,
  "860654899": 200,
  "860654900": 7,
  "8606541651": "8606545611",
  "8606541652": "8606545615",
  "8606541653": "8606545621",
  "8606541654": "8606545625",
  "8606541655": "8606545630",
  "8606541656": "8606545632",
  "8606541657": "8606545635",
  "8606541658": "8606545641",
  "8606541659": "8606545646",
  "8606541660": "8606545648",
  "8606541661": "8606545652",
  "8606541662": "8606545658",
  "8606541663": "8606545661",
  "8606541664": "8606545665",
  "8606541665": "8606545670",
  "8606541666": "8606545674",
  "8606541667": "8606545677",
  "8606541668": "8606545681",
  "8606541669": "8606545683",
  "8606541670": "8606545689",
  "8606541671": 0,
  "8606541672": 976,
  "8606541673": 210,
  "8606541674": 170,
  "8606541675": 9,
  "8606541676": "8606545699",
  "8606541677": "8606545700",
  "8606541678": "8606545705",
  "8606541679": "8606545708",
  "8606541680": "8606545714",
  "8606541681": "8606545718",
  "8606541682": "8606545720",
  "8606541683": "8606545725",
  "8606541684": "8606545729",
  "8606541685": "8606545733",
  "8606541686": "8606545739",
  "8606541687": "8606545743",
  "8606541688": "8606545745",
  "8606541689": "8606545749",
  "8606541690": "8606545752",
  "8606541691": "8606545759",
  "8606541692": "8606545761",
  "8606541693": "8606545766",
  "8606541694": "8606545768",
  "8606541695": "8606545774",
  "8606541696": 30,
  "8606541697": 384,
  "8606541698": 314,
  "8606541699": 300,
  "8606541700": 429,
  "8606541701": "8606545782",
  "8606541702": "8606545787",
  "8606541703": "8606545792",
  "8606541704": "8606545793",
  "8606541705": "8606545797",
  "8606541706": "8606545804",
  "8606541707": "8606545807",
  "8606541708": "8606545809",
  "8606541709": "8606545816",
  "8606541710": "8606545820",
  "8606541711": "8606545822",
  "8606541712": "8606545828",
  "8606541713": "8606545831",
  "8606541714": "8606545835",
  "8606541715": "8606545837",
  "8606541716": "8606545843",
  "8606541717": "8606545848",
  "8606541718": "8606545850",
  "8606541719": "8606545854",
  "8606541720": "8606545860",
  "8606541721": 2,
  "8606541722": 4,
  "8606541723": 78,
  "8606541724": 5,
  "8606541725": 6,
    "444792526": "4447921787",
  "444792527": "4447921790",
  "444792528": "4447921794",
  "444792529": "4447921798",
  "444792530": "4447921803",
  "444792531": "4447921807",
  "444792532": "4447921810",
  "444792533": "4447921817",
  "444792534": "4447921818",
  "444792535": "4447921824",
  "444792536": "4447921828",
  "444792537": "4447921833",
  "444792538": "4447921836",
  "444792539": "4447921841",
  "444792540": "4447921842",
  "444792541": "4447921849",
  "444792542": "4447921852",
  "444792543": "4447921856",
  "444792544": "4447921859",
  "444792545": "4447921863",
  "444792546": 312,
  "444792547": 42,
  "444792548": 6,
  "444792549": 4,
  "444792550": 64,
  "444792551": "4447921876",
  "444792552": "4447921881",
  "444792553": "4447921886",
  "444792554": "4447921888",
  "444792555": "4447921893",
  "444792556": "4447921897",
  "444792557": "4447921901",
  "444792558": "4447921904",
  "444792559": "4447921910",
  "444792560": "4447921914",
  "444792561": "4447921918",
  "444792562": "4447921921",
  "444792563": "4447921926",
  "444792564": "4447921931",
  "444792565": "4447921932",
  "444792566": "4447921939",
  "444792567": "4447921943",
  "444792568": "4447921945",
  "444792569": "4447921951",
  "444792570": "4447921953",
  "444792571": 125,
  "444792572": 210,
  "444792573": 160,
  "444792574": 3730,
  "444792575": 64,
  "444792576": "4447921966",
  "444792577": "4447921970",
  "444792578": "4447921974",
  "444792579": "4447921978",
  "444792580": "4447921983",
  "444792581": "4447921988",
  "444792582": "4447921990",
  "444792583": "4447921996",
  "444792584": "4447921999",
  "444792585": "4447922003",
  "444792586": "4447922009",
  "444792587": "4447922013",
  "444792588": "4447922016",
  "444792589": "4447922020",
  "444792590": "4447922025",
  "444792591": "4447922029",
  "444792592": "4447922031",
  "444792593": "4447922036",
  "444792594": "4447922041",
  "444792595": "4447922045",
  "444792596": 12,
  "444792597": 15,
  "444792598": 54,
  "444792599": 4,
  "444792600": 111,
  "8606541351": "8606544593",
  "8606541352": "8606544597",
  "8606541353": "8606544601",
  "8606541354": "8606544604",
  "8606541355": "8606544608",
  "8606541356": "8606544613",
  "8606541357": "8606544616",
  "8606541358": "8606544621",
  "8606541359": "8606544626",
  "8606541360": "8606544628",
  "8606541361": "8606544631",
  "8606541362": "8606544636",
  "8606541363": "8606544642",
  "8606541364": "8606544644",
  "8606541365": "8606544650",
  "8606541366": "8606544654",
  "8606541367": "8606544656",
  "8606541368": "8606544660",
  "8606541369": "8606544665",
  "8606541370": "8606544667",
  "8606541371": 62,
  "8606541372": 1422,
  "8606541373": 311,
  "8606541374": 1565,
  "8606541375": 12,
  "8606541376": "8606544678",
  "8606541377": "8606544684",
  "8606541378": "8606544686",
  "8606541380": "8606544694",
  "8606541381": "8606544699",
  "8606541382": "8606544703",
  "8606541383": "8606544707",
  "8606541384": "8606544710",
  "8606541385": "8606544716",
  "8606541386": "8606544720",
  "8606541387": "8606544722",
  "8606541388": "8606544728",
  "8606541389": "8606544732",
  "8606541390": "8606544735",
  "8606541391": "8606544740",
  "8606541392": "8606544744",
  "8606541393": "8606544748",
  "8606541394": "8606544752",
  "8606541395": "8606544755",
  "8606541396": 50,
  "8606541397": 4,
  "8606541398": 2,
  "8606541399": 100,
  "8606541400": 8,
  "8606541401": "8606544766",
  "8606541402": "8606544770",
  "8606541403": "8606544773",
  "8606541404": "8606544777",
  "8606541405": "8606544781",
  "8606541406": "8606544788",
  "8606541407": "8606544791",
  "8606541408": "8606544796",
  "8606541409": "8606544800",
  "8606541410": "8606544802",
  "8606541411": "8606544806",
  "8606541412": "8606544812",
  "8606541413": "8606544816",
  "8606541414": "8606544819",
  "8606541415": "8606544825",
  "8606541416": "8606544829",
  "8606541417": "8606544833",
  "8606541418": "8606544836",
  "8606541419": "8606544840",
  "8606541420": "8606544845",
  "8606541421": 1825,
  "8606541422": 125,
  "8606541423": 10,
  "8606541424": 2,
  "8606541425": 3,
    "444792151": "444792511",
  "444792152": "444792518",
  "444792153": "444792520",
  "444792154": "444792524",
  "444792155": "444792528",
  "444792156": "444792533",
  "444792157": "444792535",
  "444792158": "444792542",
  "444792159": "444792546",
  "444792160": "444792549",
  "444792161": "444792551",
  "444792162": "444792556",
  "444792163": "444792560",
  "444792164": "444792566",
  "444792165": "444792570",
  "444792166": "444792572",
  "444792167": "444792576",
  "444792168": "444792581",
  "444792169": "444792585",
  "444792170": "444792587",
  "444792171": 49,
  "444792172": 18,
  "444792173": 660,
  "444792174": 4,
  "444792175": 16,
  "444792176": "444792598",
  "444792177": "444792601",
  "444792178": "444792606",
  "444792179": "444792610",
  "444792180": "444792613",
  "444792181": "444792616",
  "444792182": "444792622",
  "444792183": "444792627",
  "444792184": "444792629",
  "444792185": "444792634",
  "444792186": "444792636",
  "444792187": "444792642",
  "444792188": "444792645",
  "444792189": "444792651",
  "444792190": "444792654",
  "444792191": "Dropped",
  "444792192": "444792660",
  "444792193": "444792667",
  "444792194": "444792669",
  "444792195": "444792673",
  "444792196": 16,
  "444792197": 600,
  "444792198": 20,
  "444792199": 4,
  "444792200": 100,
  "444792201": "444792684",
  "444792202": "444792686",
  "444792203": "444792689",
  "444792204": "444792693",
  "444792205": "444792699",
  "444792206": "444792703",
  "444792207": "444792707",
  "444792208": "444792710",
  "444792209": "444792716",
  "444792210": "444792718",
  "444792211": "444792723",
  "444792212": "444792728",
  "444792213": "444792732",
  "444792214": "444792735",
  "444792215": "444792740",
  "444792216": "444792744",
  "444792217": "444792745",
  "444792218": "444792750",
  "444792219": "444792754",
  "444792220": "444792759",
  "444792221": 33,
  "444792222": 4,
  "444792223": 1303,
  "444792224": 66,
  "444792225": 43,
};

// Marking Scheme
const MARKS_CORRECT = 4;
const MARKS_WRONG = -1;

interface SectionData {
  name: string;
  total: number;
  attempted: number;
  correct: number;
  wrong: number;
  unattempted: number;
  score: number;
}

interface ParseResult {
  candidateName: string;
  sections: SectionData[];
  totalCorrect: number;
  totalWrong: number;
  totalUnattempted: number;
  totalScore: number;
  maxScore: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export default function PasteJEEResponse() {
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ParseResult | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General");
  const [city, setCity] = useState("");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("jee_results")
        .select(
          "name, physics_correct, physics_wrong, chemistry_correct, chemistry_wrong, mathematics_correct, mathematics_wrong, physics_skipped, chemistry_skipped, mathematics_skipped",
        )
        .eq("show_in_leaderboard", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const calculated = data.map((entry) => {
          const physicsScore =
            entry.physics_correct * 4 - entry.physics_wrong * 1;
          const chemistryScore =
            entry.chemistry_correct * 4 - entry.chemistry_wrong * 1;
          const mathematicsScore =
            entry.mathematics_correct * 4 - entry.mathematics_wrong * 1;
          const totalScore = physicsScore + chemistryScore + mathematicsScore;

          return {
            name: entry.name,
            score: totalScore,
          };
        });

        calculated.sort((a, b) => b.score - a.score);
        const top10 = calculated.slice(0, 10).map((entry, index) => ({
          rank: index + 1,
          name: entry.name,
          score: entry.score,
        }));

        setLeaderboardData(top10);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  // --- CORE PARSING LOGIC ---
  const parseAndCalculate = (htmlString: string): ParseResult => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // 1. Extract Candidate Details
    let candidateName = "Candidate";
    const infoTables = doc.querySelectorAll(
      ".main-info-pnl table tr, .candidate-info table tr",
    );
    infoTables.forEach((tr: Element) => {
      const cells = tr.querySelectorAll("td");
      if (cells.length >= 2 && cells[0].textContent?.includes("Name")) {
        candidateName = cells[1].textContent?.trim() || "Candidate";
      }
    });

    // 2. Initialize sections (25 questions per section = 75 total)
    const sections: SectionData[] = JEE_SECTIONS.map((name) => ({
      name,
      total: 25, 
      attempted: 0,
      correct: 0,
      wrong: 0,
      unattempted: 0,
      score: 0,
    }));

    // 3. Scan and Extract Questions
    const questionPanels = doc.querySelectorAll('.question-pnl');
    const allQuestions: Array<{
      id: string;
      type: string;
      section: string;
      userResponse: string | null;
      status: string;
      sectionIndex: number;
    }> = [];

    let questionIndex = 0;

    questionPanels.forEach((panel) => {
      // Get Table on Right (Metadata)
      const menuTable = panel.querySelector('.menu-tbl');
      if (!menuTable) return; 

      const metaData: Record<string, string> = {};
      const rows = menuTable.querySelectorAll('tr');
      rows.forEach((row: Element) => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 2) {
          const key = cols[0].textContent?.trim().replace(':', '').trim() || '';
          const val = cols[1].textContent?.trim() || '';
          metaData[key] = val;
        }
      });

      const qType = metaData['Question Type'];
      const qId = metaData['Question ID'];
      const status = metaData['Status']; // 'Answered', 'Not Answered', 'Marked For Review'

      let userResponse: string | null = null;

      // Logic for MCQ
      if (qType === 'MCQ') {
        const chosenOptionIdx = metaData['Chosen Option']; // e.g., "2"

        if (status === 'Answered' || status === 'Marked For Review') {
          // If user chose an option, map "2" to the specific Option ID found in the table
          if (chosenOptionIdx && chosenOptionIdx !== '--') {
            const optionKey = `Option ${chosenOptionIdx} ID`; // e.g. "Option 2 ID"
            if (metaData[optionKey]) {
              userResponse = metaData[optionKey]; // This is the ID we compare with Key
            }
          }
        }
      }
      // Logic for SA (Numerical)
      else if (qType === 'SA') {
        // For SA, the answer is usually on the LEFT side or bottom
        const allTds = panel.querySelectorAll('td');
        let givenAns: string | null = null;

        // Brute force search for "Given Answer :" cell
        for (let i = 0; i < allTds.length; i++) {
          const tdText = allTds[i].textContent || '';
          if (tdText.includes('Given Answer :') || tdText.includes('Given Answer')) {
            // The answer is usually in the NEXT sibling TD
            const sibling = allTds[i].nextElementSibling;
            if (sibling) {
              givenAns = sibling.textContent?.trim() || null;
            }
            break;
          }
        }

        if (givenAns && givenAns !== '--' && givenAns !== 'Not Answered') {
          userResponse = givenAns;
        }
      }

      // Determine section based on question index (Specific for 75 Question Papers)
      // 0-24: Mathematics
      // 25-49: Physics
      // 50-74: Chemistry
      let sectionName = "Mathematics";
      let sectionIndex = 0;
      
      if (questionIndex < 25) {
        sectionName = "Mathematics";
        sectionIndex = 0;
      } else if (questionIndex < 50) {
        sectionName = "Physics";
        sectionIndex = 1;
      } else {
        sectionName = "Chemistry";
        sectionIndex = 2;
      }

      allQuestions.push({
        id: qId,
        type: qType,
        section: sectionName,
        userResponse: userResponse,
        status: status,
        sectionIndex: sectionIndex
      });

      questionIndex++;
    });

    // 4. Calculate scores using the answer key
    allQuestions.forEach((q) => {
      const correctAns = CORRECT_ANSWER_KEY[q.id];
      const secIdx = q.sectionIndex;

      // Safety check to ensure we don't overflow sections if more questions exist
      if (!sections[secIdx]) return;

      if (q.userResponse) {
        sections[secIdx].attempted++;
        
        // Comparison logic:
        // For MCQ, both are strings. For SA, correctAns might be a number in the key.
        const isCorrect = String(q.userResponse) === String(correctAns);

        if (correctAns !== undefined && isCorrect) {
          // Correct answer
          sections[secIdx].correct++;
          sections[secIdx].score += MARKS_CORRECT;
        } else if (correctAns !== undefined) {
          // Wrong answer (only if we have the answer key)
          sections[secIdx].wrong++;
          sections[secIdx].score += MARKS_WRONG;
        } else {
          // No answer key available for this ID - treat as unattempted/bonus? 
          // Currently treating as attempted but not graded (neutral)
          sections[secIdx].attempted--;
          sections[secIdx].unattempted++;
        }
      } else {
        // Not attempted
        sections[secIdx].unattempted++;
      }
    });

    // 5. Calculate totals
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalUnattempted = 0;
    let totalScore = 0;

    sections.forEach((section) => {
      totalCorrect += section.correct;
      totalWrong += section.wrong;
      totalUnattempted += section.unattempted;
      totalScore += section.score;
    });

    // Max Score: 75 questions * 4 marks = 300
    const maxScore = 300; 

    return {
      candidateName,
      sections,
      totalCorrect,
      totalWrong,
      totalUnattempted,
      totalScore,
      maxScore,
    };
  };

  // --- NTA FETCHING LOGIC ---
  const fetchNTAContent = async (url: string) => {
    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
        headers: { Accept: "text/html,application/xhtml+xml,application/xml" },
      });
      if (response.ok) return await response.text();
      throw new Error("Direct fetch failed");
    } catch {
      const proxyUrls = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      ];
      for (const proxyUrl of proxyUrls) {
        try {
          const response = await fetch(proxyUrl);
          if (response.ok) return await response.text();
        } catch {}
      }
      throw new Error("All fetch methods failed");
    }
  };

  const processContent = (content: string) => {
    const result = parseAndCalculate(content);
    // Flexible validation: ensure we found at least some questions
    if (!result.sections.some(s => s.attempted > 0 || s.unattempted > 0)) {
       // It's possible to have 0 attempted, but we should have found unattempted ones.
       if(result.totalUnattempted === 0) throw new Error("No valid questions found");
    }
    return result;
  };

  const handleCalculateAndSubmit = async () => {
    try {
      setError("");
      setLoading(true);

      if (!name.trim()) {
        setError("❌ Please enter your name");
        setLoading(false);
        return;
      }
      if (!mobile.trim() || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
        setError("❌ Please enter a valid 10-digit mobile number");
        setLoading(false);
        return;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("❌ Please enter a valid email address");
        setLoading(false);
        return;
      }
      if (!city.trim()) {
        setError("❌ Please enter your city");
        setLoading(false);
        return;
      }

      const input = html.trim();
      if (!input) {
        setError("⚠️ Please paste your NTA URL or HTML content");
        setLoading(false);
        return;
      }

      let calculatedResults: ParseResult;
      let cdnLinkToSave = "";

      if (/^https?:\/\//i.test(input) || /nta\.ac\.in/i.test(input)) {
        setError("🔄 Fetching and processing...");
        let url = input.startsWith("http") ? input : "https://" + input;
        cdnLinkToSave = url;
        try {
          const content = await fetchNTAContent(url);
          calculatedResults = processContent(content);
        } catch {
          setError(
            "❌ Unable to fetch URL. Please copy and paste the page content instead.",
          );
          setLoading(false);
          return;
        }
      } else {
        if (input.length < 100) {
          setError("⚠️ Content too short. Copy entire page (Ctrl+A).");
          setLoading(false);
          return;
        }
        calculatedResults = processContent(input);
      }

      setError("💾 Saving results...");

      // Map section data to database columns
      const mathematicsSection = calculatedResults.sections.find(
        (s) => s.name === "Mathematics",
      );
      const physicsSection = calculatedResults.sections.find(
        (s) => s.name === "Physics",
      );
      const chemistrySection = calculatedResults.sections.find(
        (s) => s.name === "Chemistry",
      );

      const dataToSave = {
        name,
        mobile,
        email,
        category,
        city,
        cdn_link: cdnLinkToSave,
        physics_correct: physicsSection?.correct || 0,
        physics_wrong: physicsSection?.wrong || 0,
        physics_skipped: physicsSection?.unattempted || 0,
        chemistry_correct: chemistrySection?.correct || 0,
        chemistry_wrong: chemistrySection?.wrong || 0,
        chemistry_skipped: chemistrySection?.unattempted || 0,
        mathematics_correct: mathematicsSection?.correct || 0,
        mathematics_wrong: mathematicsSection?.wrong || 0,
        mathematics_skipped: mathematicsSection?.unattempted || 0,
        total_score: calculatedResults.totalScore,
        show_in_leaderboard: true,
      };

      await supabase.from("jee_results").insert([dataToSave]);

      setResults(calculatedResults);
      setError("✅ Results calculated and saved successfully!");
      await fetchLeaderboard();
      setTimeout(
        () =>
          document
            .getElementById("results")
            ?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      setError("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-8 pb-12">
          <div className="text-center space-y-2 sm:space-y-3 mb-6">
  <div
    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold uppercase tracking-widest"
    style={{ color: accentColor }}
  >
    <span
      className="w-2 h-2 rounded-full animate-pulse"
      style={{ backgroundColor: accentColor }}
    ></span>
    JEE Main 2026 Score Calculator
  </div>
  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
    Calculate your{" "}
    <span style={{ color: accentColor }}>JEE Main score</span>{" "}
    instantly
  </h1>
  
  {/* Disclaimer Marquee Section */}
  <div className="mt-6 relative overflow-hidden">
    <div
      className="flex items-center gap-3 px-5 py-3 rounded-xl border-2"
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: '#EF4444',
      }}
    >
      <div className="flex-shrink-0 flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: '#EF4444' }}
        ></span>
        <p className="text-sm font-bold text-red-400 uppercase tracking-wide whitespace-nowrap">
          ⚠️ Disclaimer:
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-sm text-white font-medium">
  Answer key for 7 Slots is now available: Jan 21: Shift 1 • Jan 22: Shift 1 • Jan 22: Shift 2 • Jan 23: Shifts 1 & 2 • Jan 24: Shift 1 • Jan 28: Shift 2. For JEE Session 2 Visit our JEE Starter Kit 
  <a 
    href="/JEEstarterkit" 
    className="ml-2 text-xs px-2 py-1 rounded-md font-semibold hover:opacity-80 transition-opacity"
    style={{ backgroundColor: accentColor, color: '#000' }}
    onClick={(e) => e.stopPropagation()}
  >
    View More →
  </a>
</div>
      </div>
    </div>
  </div>
</div>

<style jsx>{`
  @keyframes marquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  
  .animate-marquee {
    display: inline-block;
    animation: marquee 20s linear infinite;
  }
  
  .animate-marquee:hover {
    animation-play-state: paused;
  }
`}</style>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div
                className="rounded-2xl p-6 shadow-xl"
                style={{
                  backgroundColor: secondaryBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <h2 className="text-xl font-bold text-white mb-4">
                  📝 Enter Details & Calculate Score
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2"
                      style={{
                        border: `1px solid ${borderColor}`,
                        outlineColor: accentColor,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      MOBILE <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) =>
                        setMobile(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={10}
                      placeholder="10 digits"
                      className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2"
                      style={{ border: `1px solid ${borderColor}` }}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      EMAIL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2"
                      style={{ border: `1px solid ${borderColor}` }}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      CATEGORY <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2"
                      style={{ border: `1px solid ${borderColor}` }}
                    >
                      <option>General</option>
                      <option>OBC-NCL</option>
                      <option>SC</option>
                      <option>ST</option>
                      <option>EWS</option>
                      <option>PwD</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-sm mb-2">
                      CITY <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                      className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2"
                      style={{ border: `1px solid ${borderColor}` }}
                    />
                  </div>
                </div>

                <div
                  className="border-t pt-6 mb-6"
                  style={{ borderColor: "rgba(100,116,139,0.3)" }}
                >
                  <label className="block text-slate-300 font-semibold mb-2">
                    NTA Response Sheet URL or Content{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={html}
                    onChange={(e) => {
                      setHtml(e.target.value);
                      setError("");
                    }}
                    className="w-full h-32 rounded-xl p-4 text-sm text-white bg-[#050818] font-mono focus:outline-none focus:ring-2"
                    style={{ border: `1px solid ${borderColor}` }}
                    placeholder="https://jeemain.nta.nic.in/... OR paste full page content"
                  />
                </div>

                {error && (
                  <div
                    className={`p-4 rounded-lg mb-4 ${error.includes("✅") ? "bg-green-900/20 border-green-500/30 text-green-400" : error.includes("🔄") || error.includes("💾") ? "bg-blue-900/20 border-blue-500/30 text-blue-400" : "bg-red-900/20 border-red-500/30 text-red-400"} border`}
                  >
                    <p className="text-sm whitespace-pre-line">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleCalculateAndSubmit}
                  disabled={loading}
                  className="w-full px-6 py-4 rounded-xl font-bold text-black text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: accentColor }}
                >
                  {loading ? "Processing..." : "Calculate & Save Score →"}
                </button>

                {/* Step-by-Step Guide Section */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl mt-6">
                  <h4 className="text-white font-semibold text-lg mb-3">
                    📋 Step-by-Step Guide: How to Calculate Your JEE Main Percentile
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Follow these simple steps after the exam:
                  </p>

                  <div className="space-y-3">
                    <div className="bg-slate-950/50 p-4 rounded-lg">
                      <p className="text-sm text-white font-semibold mb-1">
                        Step 1: Download Answer Key & Response Sheet
                      </p>
                      <p className="text-xs text-slate-400">
                        Visit the official NTA website and download both.
                      </p>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-lg">
                      <p className="text-sm text-white font-semibold mb-1">
                        Step 2: Calculate Raw Score
                      </p>
                      <p className="text-xs text-slate-400 mb-2">
                        Use marking scheme:
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1 ml-4">
                        <li>• +4 for correct answer</li>
                        <li>• -1 for wrong answer</li>
                        <li>• 0 for unattempted</li>
                      </ul>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-lg">
                      <p className="text-sm text-white font-semibold mb-1">
                        Step 3: Use Online Predictor
                      </p>
                      <p className="text-xs text-slate-400">
                        Enter your marks in a trusted JEE Main Percentile
                        Predictor 2026 for quick results.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                <Leaderboard
                  data={leaderboardData}
                  currentUserScore={results ? results.totalScore : undefined}
                />
              </div>
            </div>
          </div>

          {results && (
            <div
              id="results"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
            >
              <div
                className="rounded-2xl p-6 shadow-2xl"
                style={{
                  backgroundColor: secondaryBg,
                  border: `2px solid ${accentColor}`,
                }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  🎯 Your JEE Main 2026 Results
                </h2>

                <div
                  className="p-8 rounded-xl border-2 mb-6"
                  style={{
                    backgroundColor: "#050818",
                    borderColor: accentColor,
                  }}
                >
                  <p className="text-slate-400 text-sm mb-2">Total Score</p>
                  <p
                    className="text-6xl font-bold mb-2"
                    style={{ color: accentColor }}
                  >
                    {results.totalScore}
                  </p>
                  <p className="text-sm text-slate-400">
                    out of {results.maxScore} marks
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-green-400 text-2xl font-bold">
                          {results.totalCorrect}
                        </p>
                        <p className="text-xs text-slate-500">Correct</p>
                      </div>
                      <div>
                        <p className="text-red-400 text-2xl font-bold">
                          {results.totalWrong}
                        </p>
                        <p className="text-xs text-slate-500">Wrong</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-2xl font-bold">
                          {results.totalUnattempted}
                        </p>
                        <p className="text-xs text-slate-500">Skipped</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-4">
                  Subject-wise Breakdown
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {results.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-[#050818] rounded-xl border border-slate-700"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-slate-300 font-bold">
                          {section.name}
                        </p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: accentColor }}
                        >
                          {section.score}
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-400">
                          ✓ {section.correct}
                        </span>
                        <span className="text-red-400">✗ {section.wrong}</span>
                        <span className="text-slate-500">
                          — {section.unattempted}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        {section.attempted} attempted out of {section.total}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 text-sm mb-2">
                    ℹ️ Scoring Pattern:
                  </p>
                  <p className="text-white text-xs">
                    +4 marks for each correct answer
                  </p>
                  <p className="text-white text-xs">
                    -1 mark for each wrong answer
                  </p>
                  <p className="text-white text-xs">
                    0 marks for unattempted questions
                  </p>
                </div>

                <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-center font-semibold">
                    ✅ Your results have been saved to our database!
                  </p>
                </div>
              </div>

              <PercentileCalculator
                userScore={results.totalScore}
                userName={name}
              />
            </div>
          )}

          <div className="mt-6">
            <JEEScoreGraph />
          </div>

          {/* Detailed Information Section */}
          <div className="mt-8">
            <div
              className="rounded-2xl p-6 shadow-xl"
              style={{
                backgroundColor: secondaryBg,
                border: `1px solid ${borderColor}`,
              }}
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4">
                  🎯 What Is JEE Main Percentile Predictor 2026?
                </h3>

                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  The JEE Main Percentile Predictor 2026 is an online tool
                  designed to help students forecast their likely percentile,
                  rank, and potential college admission prior to the
                  declaration of official results by NTA. Leveraging your raw
                  score, answer key, and historical data, it provides you a
                  near-accurate assessment of your performance in relation to
                  other candidates.
                </p>

                <p className="text-sm text-slate-300 mb-4">
                  JEE Main Percentile Predictor 2026 turns out to be a very
                  handy tool. You can use it to forecast your performance,
                  evaluate your chances, and map out your admission journey
                  smartly.
                </p>

                <div className="bg-slate-950/50 p-4 rounded-lg mb-4">
                  <p className="text-xs text-blue-400 mb-2">
                    <strong>ℹ️ About Normalization:</strong>
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The National Testing Agency (NTA) implements a
                    normalization method to derive the percentiles since JEE
                    Main is held in several sessions. As each session might
                    vary in terms of difficulty, normalization is done to
                    guarantee equity.
                  </p>
                </div>

                <h4 className="text-white font-semibold text-sm mb-3 mt-5">
                  ✨ Highlights of JEE Main 2026 Percentile Predictor
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Here are some features of the JEE Main percentile predictor
                  by Edu Next:
                </p>

                <div className="space-y-2 text-xs text-slate-400">
                  <p className="flex items-start gap-2">
                    <span className="text-[#F59E0B]">✓</span>
                    <span>
                      Estimate your JEE Main 2026 percentile with a score
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#F59E0B]">✓</span>
                    <span>
                      Can also be used to find the rank in NTA JEE Main 2026
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#F59E0B]">✓</span>
                    <span>
                      Excellent usage of resources to improve performance for
                      upcoming JEE Main attempts
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#F59E0B]">✓</span>
                    <span>Instant results and easy student-friendly use</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#F59E0B]">✓</span>
                    <span>
                      Uses the official NTA marking scheme for accurate
                      percentile calculation
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#F59E0B]">✓</span>
                    <span>
                      Get an idea of your probability of getting a seat in
                      different colleges and plan your JoSAA counseling
                      strategy
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}