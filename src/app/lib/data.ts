import fs from 'fs';
import path from 'path';

export interface University {
    uuid: string;
    title: string;
    about: string;
    data: any;
}

export async function getUniversity(id: string): Promise<University | null> {
    // Read from local JSONL file (Allow integer IDs for dev/testing)
    try {
        const filePath = path.join(process.cwd(), 'universities_data.jsonl');
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const lines = fileContent.split('\n');

            for (const line of lines) {
                if (!line.trim()) continue;
                const u = JSON.parse(line);

                // Check against integer ID or if the UUID was passed matching format mock-uuid-{id}
                if (String(u.id) === id || `mock-uuid-${u.id}` === id) {
                    return {
                        uuid: `mock-uuid-${u.id}`,
                        title: u.title,
                        about: u.about,
                        data: u
                    };
                }
            }
        }
    } catch (e) {
        console.error('Error reading local file:', e);
    }

    return null;
}

// Helper to extract basic stats from the complex JSON structure
function extractUniversityStats(u: any) {
    let avgPackage = "N/A";
    let highestPackage = "N/A";
    let rating = 0;
    let ranking = "N/A";
    let location = "India";
    let tuitionFee = "N/A";
    let approvals = "N/A";
    let scholarshipAvailable = false;

    // Extract Location
    if (u.address) {
        if (typeof u.address === 'string') {
            const parts = u.address.split(',');
            if (parts.length > 1) location = parts[parts.length - 2]?.trim() || parts[parts.length - 1]?.trim();
        } else if (typeof u.address === 'object') {
            if (u.address.streetAddress) {
                const parts = u.address.streetAddress.split(',');
                if (parts.length > 1) location = parts[parts.length - 1]?.trim().replace(/\.$/, '') || location;
            }
            if (u.address.addressLocality) location = u.address.addressLocality;
            if (u.address.addressRegion) location = u.address.addressRegion;
        }
    }

    // Extract Placement (Avg & Highest)
    if (u.placement) {
        let maxAvg = 0;
        let maxHigh = 0;
        u.placement.forEach((table: any) => {
            table.rows?.forEach((row: string[]) => {
                const label = row[0]?.toLowerCase() || '';
                const valStr = row[1];

                // Average
                if (label.includes('average') && (label.includes('package') || label.includes('ctc'))) {
                    const matches = valStr?.match(/[\d\.]+/);
                    if (matches) {
                        let val = parseFloat(matches[0]);
                        if (val > maxAvg) {
                            maxAvg = val;
                            avgPackage = valStr;
                        }
                    }
                }

                // Highest
                if (label.includes('highest') && (label.includes('package') || label.includes('ctc'))) {
                    const matches = valStr?.match(/[\d\.]+/);
                    if (matches) {
                        let val = parseFloat(matches[0]);
                        if (val > maxHigh) {
                            maxHigh = val;
                            highestPackage = valStr;
                        }
                    }
                }
            });
        });
    }

    // Extract Rating
    if (u.reviews) {
        if (u.reviews?.overall_rating) rating = parseFloat(u.reviews.overall_rating);
    }

    // Extract Ranking
    let numericRanking = 999999;
    if (u.ranking) {
        const firstRow = u.ranking[0]?.rows?.[0];
        if (firstRow) {
            ranking = `#${firstRow[1]} ${firstRow[0]}`;
            const rankMatch = firstRow[1].match(/(\d+)/);
            if (rankMatch) numericRanking = parseInt(rankMatch[1]);
        }
    }

    // Extract Tuition Fees
    if (u.fees && Array.isArray(u.fees)) {
        const firstRow = u.fees[0]?.rows?.[0];
        if (firstRow && firstRow[1]) {
            tuitionFee = firstRow[1];
        }
    }
    if (tuitionFee === "N/A" && u.info_tables) {
        u.info_tables.forEach((t: any) => {
            t.rows?.forEach((r: string[]) => {
                if (r[0]?.includes('Tuition Fees')) tuitionFee = r[1];
            });
        });
    }

    // Extract Approvals
    if (u.info_tables) {
        u.info_tables.forEach((t: any) => {
            t.rows?.forEach((r: string[]) => {
                if (r[0]?.toLowerCase().includes('approved') || r[0]?.toLowerCase().includes('accreditation')) {
                    approvals = r[1];
                }
            });
        });
    }

    // Extract Exam Accepted
    let examAccepted = "N/A";
    if (u.admission) {
        u.admission.forEach((t: any) => {
            t.rows?.forEach((r: string[]) => {
                if (r[0]?.toLowerCase().includes('exam') && r[0]?.toLowerCase().includes('accepted')) {
                    examAccepted = r[1];
                }
            })
        })
    }
    if (examAccepted === "N/A" && u.cutoff) {
        const firstCutoff = u.cutoff[0];
        if (firstCutoff && firstCutoff.title) {
            examAccepted = firstCutoff.title.replace('Cutoff', '').replace(/\d{4}/g, '').trim();
        }
    }

    // Extract Facilities
    let facilities: string[] = [];
    if (u.info_tables) {
        u.info_tables.forEach((t: any) => {
            if (t.title?.toLowerCase().includes('facilities') || t.title?.toLowerCase().includes('infrastructure')) {
                t.rows?.forEach((r: string[]) => {
                    facilities.push(r[0]);
                });
            }
            t.rows?.forEach((r: string[]) => {
                if (r[0]?.toLowerCase() === 'facilities') {
                    facilities = r[1].split(',').map((s: string) => s.trim());
                }
            });
        });
    }
    if (u.facilities && Array.isArray(u.facilities)) {
        facilities = u.facilities;
    }

    // Extract Scholarship
    let scholarship = "N/A";
    if (u.scholarship && Array.isArray(u.scholarship) && u.scholarship.length > 0) {
        scholarship = "Available";
        const firstRow = u.scholarship[0]?.rows?.[0];
        if (firstRow && firstRow[0]) {
            scholarship = firstRow[0].length < 30 ? firstRow[0] : "Available";
        }
    }

    // Dynamic Badge Logic
    let badge = "Top Rated";
    const fees = parseInt(tuitionFee.replace(/[^0-9]/g, '')) || 0;
    const pkg = parseFloat(highestPackage.replace(/[^0-9.]/g, '')) || 0;
    const courseSet = extractCoursesList(u);

    if (pkg > 50) badge = "High ROI";
    else if (ranking.includes("#1") || ranking.includes("#2") || ranking.includes("#3")) badge = "Top Ranked";
    else if (rating > 4.2) badge = "Student Choice";
    else if (fees < 50000 && fees > 0) badge = "Value for Money";
    else if (facilities.includes("Hostel") && facilities.includes("Sports")) badge = "Best Infrastructure";

    // Extract Extra Metadata
    let establishedYear = "N/A";
    let universityType = "University";
    let totalCourses = "N/A";

    const aboutText = u.about || "";
    const estMatch = aboutText.match(/established in (\d{4})/i) || aboutText.match(/founded in (\d{4})/i);
    if (estMatch) establishedYear = estMatch[1];

    if (establishedYear === "N/A" && u.info_tables) {
        u.info_tables.forEach((t: any) => {
            t.rows?.forEach((r: string[]) => {
                const label = r[0]?.toLowerCase() || "";
                if (label.includes("year of establishment") || label.includes("founded in") || label === "established") {
                    establishedYear = r[1];
                }
            });
        });
    }

    if (aboutText.toLowerCase().includes("private")) universityType = "Private";
    else if (aboutText.toLowerCase().includes("government") || aboutText.toLowerCase().includes("public")) universityType = "Public";

    const coursesMatch = aboutText.match(/offering over (\d+) courses/i);
    if (coursesMatch) totalCourses = `${coursesMatch[1]}+ Courses`;

    return {
        uuid: `mock-uuid-${u.id}`,
        title: u.title,
        original_id: u.id,
        location,
        avg_package: avgPackage,
        highest_package: highestPackage,
        rating,
        ranking,
        tuition_fee: tuitionFee.includes('10+2') ? "Check details" : tuitionFee,
        approvals: approvals,
        scholarship_available: scholarship !== "N/A",
        scholarship_name: scholarship,
        exam_accepted: examAccepted,
        facilities: facilities.slice(0, 5),
        badge: badge,
        established_year: establishedYear,
        university_type: universityType,
        total_courses: totalCourses,
        numeric_fees: fees,
        courses_list: Array.from(courseSet),
        state: extractState(location),
        grouped_courses: groupCourses(Array.from(courseSet)),
        numeric_ranking: numericRanking
    };
}

const CITY_STATE_MAP: Record<string, string> = {
    "Chennai": "Tamil Nadu",
    "Coimbatore": "Tamil Nadu",
    "Madurai": "Tamil Nadu",
    "Trichy": "Tamil Nadu",
    "Salem": "Tamil Nadu",
    "Nagapattinam": "Tamil Nadu",
    "Mumbai": "Maharashtra",
    "Pune": "Maharashtra",
    "Nagpur": "Maharashtra",
    "Delhi": "Delhi",
    "New Delhi": "Delhi",
    "Bangalore": "Karnataka",
    "Bengaluru": "Karnataka",
    "Hyderabad": "Telangana",
    "Kolkata": "West Bengal",
    "Ahmedabad": "Gujarat",
    "Jaipur": "Rajasthan",
    "Lucknow": "Uttar Pradesh",
    "Kanpur": "Uttar Pradesh",
    "Roorkee": "Uttarakhand",
    "Dehradun": "Uttarakhand",
    "Chandigarh": "Chandigarh",
    "Bhopal": "Madhya Pradesh",
    "Indore": "Madhya Pradesh"
};

function extractState(location: string | undefined | null): string {
    if (!location) return "India";
    const city = location.split(',')[0].trim();
    if (CITY_STATE_MAP[city]) return CITY_STATE_MAP[city];

    const states = [
        "Tamil Nadu", "Maharashtra", "Karnataka", "Telangana", "West Bengal", "Gujarat", "Rajasthan",
        "Uttar Pradesh", "Uttarakhand", "Madhya Pradesh", "Kerala", "Punjab", "Haryana", "Bihar", "Odisha",
        "Andhra Pradesh", "Assam", "Jharkhand", "Chhattisgarh", "Himachal Pradesh", "Jammu and Kashmir"
    ];
    const locLower = location.toLowerCase();

    if (locLower.includes("u.p") || locLower.includes("uttar pradesh")) return "Uttar Pradesh";
    if (locLower.includes("m.p") || locLower.includes("madhya pradesh")) return "Madhya Pradesh";
    if (locLower.includes("w.b") || locLower.includes("west bengal")) return "West Bengal";
    if (locLower.includes("a.p") || locLower.includes("andhra pradesh")) return "Andhra Pradesh";
    if (locLower.includes("t.n") || locLower.includes("tamil nadu")) return "Tamil Nadu";

    for (const s of states) {
        if (locLower.includes(s.toLowerCase())) return s;
    }

    return "India";
}

function groupCourses(courseList: string[]): string[] {
    const groups = new Set<string>();

    courseList.forEach((c: string) => {
        const lower = c.toLowerCase();
        if (lower.includes('b.tech') || lower.includes('btech') || lower.includes('b.e.')) groups.add("B.Tech");
        else if (lower.includes('mba') || lower.includes('management')) groups.add("MBA");
        else if (lower.includes('m.tech') || lower.includes('mtech')) groups.add("M.Tech");
        else if (lower.includes('b.sc') || lower.includes('bsc')) groups.add("B.Sc");
        else if (lower.includes('m.sc') || lower.includes('msc')) groups.add("M.Sc");
        else if (lower.includes('b.com') || lower.includes('bcom')) groups.add("B.Com");
        else if (lower.includes('m.com') || lower.includes('mcom')) groups.add("M.Com");
        else if (lower.includes('b.a.') || lower.includes('ba ')) groups.add("B.A");
        else if (lower.includes('m.a.') || lower.includes('ma ')) groups.add("M.A");
        else if (lower.includes('bca')) groups.add("BCA");
        else if (lower.includes('mca')) groups.add("MCA");
        else if (lower.includes('b.des') || lower.includes('bdes')) groups.add("B.Des");
        else if (lower.includes('m.des') || lower.includes('mdes')) groups.add("M.Des");
        else if (lower.includes('llb') || lower.includes('law')) groups.add("Law");
        else if (lower.includes('mbbs') || lower.includes('medical')) groups.add("Medical");
        else groups.add("Other");
    });

    return Array.from(groups);
}

function extractCoursesList(u: any): Set<string> {
    const courses = new Set<string>();

    if (u.fees && Array.isArray(u.fees)) {
        u.fees.forEach((t: any) => {
            t.rows?.forEach((r: string[]) => {
                let courseName = r[0];
                if (courseName) {
                    courseName = courseName.replace(/\d+Courses/i, '').trim();
                    courseName = courseName.replace(/^\(\d+Views\)/, '').trim();
                    const match = courseName.match(/\[(.*?)\]/);
                    if (match) courseName = match[1];

                    if (courseName.length < 20) courses.add(courseName);
                }
            });
        });
    }

    if (typeof u.courses === 'string' && !u.courses.includes("See Fees")) {
        u.courses.split(',').forEach((c: string) => courses.add(c.trim()));
    }

    return courses;
}

export async function getAllUniversities() {
    try {
        const filePath = path.join(process.cwd(), 'universities_data.jsonl');
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            return fileContent.split('\n')
                .filter(l => l.trim())
                .map(l => {
                    try {
                        const u = JSON.parse(l);
                        return extractUniversityStats(u);
                    } catch { 
                        return null; 
                    }
                })
                .filter((u): u is NonNullable<typeof u> => u !== null && u.title !== undefined);
        }
    } catch (e) {
        console.error(e);
    }
    return [];
}

export async function getRelatedColleges(currentUuid: string, location: string | undefined | null): Promise<any[]> {
    const all = await getAllUniversities();

    const state = extractState(location);
    const splitLoc = location ? location.split(',')[0] : "";

    let related = all.filter(u =>
        u.uuid !== currentUuid &&
        (u.state === state || (u.location && splitLoc && u.location.includes(splitLoc)))
    );

    if (related.length < 5) {
        const others = all.filter(u => u.uuid !== currentUuid && !related.includes(u));
        others.sort((a, b) => a.numeric_ranking - b.numeric_ranking);
        related = [...related, ...others];
    }

    related.sort((a, b) => a.numeric_ranking - b.numeric_ranking);

    return related.slice(0, 6).map(u => ({
        uuid: u.uuid,
        title: u.title,
        location: u.location,
        ranking: u.ranking
    }));
}