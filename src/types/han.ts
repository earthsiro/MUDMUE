/**
 * MUDMUE Han (หาร) — โครงสร้างข้อมูลของบิลหารค่าแบด
 *
 * สเปก: `public/.claude/mudmue-han-badminton-cost-splitter-plan.md` (section 4)
 *
 * หมายเหตุเรื่องคน: ที่นี่อ้างคนด้วย `profileUuid` แบบเดียวกับ `matchService`
 * (ไม่ใช่ `id` ที่รันตามลำดับ) และเก็บ `name` ติดไว้กับ session ด้วย เพื่อให้
 * ประวัติเก่ายังอ่านออกแม้โปรไฟล์จะถูกเปลี่ยนชื่อหรือถูกซ่อนไปแล้ว
 */

/** "ป้ายราคา ชม." — สร้างไว้ล่วงหน้าแล้วแปะซ้ำได้กับหลายคอร์ท */
export interface RateTier {
    id: string;
    /** เช่น "ชม.แรก" — แก้ไขได้ ปล่อยว่างได้ */
    label: string;
    pricePerHour: number;
    /** ปกติ 1 แต่ปรับได้ */
    hours: number;
}

export interface HanCourt {
    id: string;
    /** ลำดับที่แสดงผล (คอร์ท 1, 2, ...) */
    index: number;
    /** ป้ายราคาที่ถูกแปะไว้บนคอร์ทนี้ — ป้ายเดิมซ้ำได้ (เล่นสองชั่วโมงราคาเดียวกัน) */
    tierIds: string[];
}

export interface AttendeeEntry {
    profileUuid: string;
    /** ชื่อ ณ ตอนบันทึก — กันประวัติกลายเป็นชื่อว่างเมื่อโปรไฟล์ถูกแก้ */
    name: string;
    /* ชั่วโมงรายคน (มาสาย/กลับก่อน) ยกไป phase 2 — เฟสนี้ทุกคนอยู่ครบทั้งก๊วน */
    /** จำนวนลูกที่ร่วมหาร — null = ร่วมหารครบทุกลูก (ใช้ shuttleUsedCount) */
    shuttleCount: number | null;
}

export interface HanSession {
    id: string;
    /** ISO string — วันที่ของก๊วนนี้ */
    date: string;
    /** ชื่อเรียกก๊วน เช่น "แบดวันเสาร์" ปล่อยว่างได้ */
    title: string;
    tiers: RateTier[];
    courts: HanCourt[];
    shuttlePricePerPiece: number;
    /** ยอดรวมลูกที่ใช้จริงทั้งวัน */
    shuttleUsedCount: number;
    attendees: AttendeeEntry[];
    /** ISO string — ใส่ตอนกดบันทึกเข้าประวัติ */
    savedAt?: string;
}

export interface HanSettings {
    /** base64 รูป QR พร้อมเพย์ (MVP: static image) */
    paymentQrImage: string;
}

/** ยอดของคนหนึ่งคนหลังคำนวณแล้ว */
export interface PersonBreakdown {
    profileUuid: string;
    name: string;
    /** จำนวนลูกที่ร่วมหารจริง (ค่ากลางหรือค่าที่ override) */
    shuttleCount: number;
    shuttleOverridden: boolean;
    courtShare: number;
    shuttleCost: number;
    /** ก่อนปัดขึ้น — ใช้คิดส่วนต่าง */
    rawTotal: number;
    /** ปัดขึ้นเสมอ = ยอดที่เก็บจริง */
    total: number;
}

export interface HanCalcResult {
    courtCostById: Record<string, number>;
    /** ชั่วโมงที่แต่ละคอร์ทถูกจอง — ผลรวมชั่วโมงของป้ายที่แปะบนคอร์ทนั้น */
    courtHoursById: Record<string, number>;
    courtSubtotal: number;
    shuttleSubtotal: number;
    grandTotal: number;
    /** คอร์ทที่จองยาวที่สุด — แสดงผลอย่างเดียว ไม่ได้ใช้หารในเฟสนี้ */
    sessionDurationHours: number;
    /** จำนวนลูกของทุกคนรวมกัน — ตัวหารของค่าลูก */
    totalShuttleShares: number;
    people: PersonBreakdown[];
    /** ผลรวมยอดที่เก็บจากทุกคน (หลังปัดขึ้น) */
    collectedTotal: number;
    /** collectedTotal − grandTotal — ส่วนต่างที่เป็นของกองกลาง */
    roundingDiff: number;
    /** เตือนอย่างเดียว ไม่บล็อกการสรุป */
    warnings: string[];
}
