import { PlayerProps } from "../types/player";

/**
 * สับลิสต์แบบ Fisher-Yates — คืน array ใหม่เสมอ ไม่แก้ของเดิม
 *
 * ของเดิมใช้ `sort(() => Math.random() - 0.5)` ซึ่งให้การกระจายที่ไม่สม่ำเสมอ
 * (comparator ไม่คงที่ ผลลัพธ์ขึ้นกับอัลกอริทึม sort ของ engine) บางคนเลยถูก
 * สุ่มติดบ่อยกว่าคนอื่นอย่างเป็นระบบ ทั้งที่ทั้งก๊วนควรมีโอกาสเท่ากัน
 */
export const shuffle = <T,>(list: T[]): T[] => {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

/**
 * สุ่มทีมทีละรอบ โดยคนที่เหลือไม่ครบทีมของรอบก่อนได้ลงเป็นคนแรกของรอบถัดไป
 *
 * ตัวตนของผู้เล่นเทียบด้วย `id` ไม่ใช่ `uuid` — คนที่พิมพ์ชื่อเพิ่มหน้างานยังไม่มี
 * โปรไฟล์ `uuid` จึงเป็น "" เหมือนกันหมด เทียบด้วย uuid เมื่อไหร่ทั้งก๊วนจะถูกมองเป็น
 * คนเดียวกัน แล้วรอบถัดไปจะเติมคนไม่ได้เลย (5 คน สุ่ม 2 รอบ เคยได้รอบสองแค่คนเดียว)
 *
 * `reserve` คือคนที่ถูกซ่อนไว้ — ปกติไม่แตะ จะถูกดึงกลับมาก็ต่อเมื่อคนที่พร้อมสุ่ม
 * เหลือไม่พอตั้งทีมสักทีมเดียว ไม่งั้นคนที่ตั้งใจซ่อน (กลับบ้านแล้ว/เจ็บ) จะโผล่มาใน
 * ทีมทั้งที่ยังมีคนพร้อมสุ่มพออยู่
 */
export const spinRoundsWithCarryOver = (
    pool: PlayerProps[],
    perRound: number,
    nRounds: number,
    reserve: PlayerProps[] = []
): PlayerProps[][] => {
    /** คนทั้งหมดที่ดึงมาใช้ได้ในรอบเวียนถัดไป — คนที่ซ่อนไว้เข้ามาเฉพาะตอนคนพร้อมสุ่มไม่พอ */
    const cycleSource = pool.length >= perRound ? pool.slice() : [...pool, ...reserve];

    const output: PlayerProps[][] = [];
    /** คิวของรอบเวียนนี้ — เริ่มจากคนที่พร้อมสุ่มก่อนเสมอ ใครยังไม่ได้ลงจะได้ลงก่อน */
    let queue = shuffle(pool);
    let carry: PlayerProps[] = [];

    for (let round = 0; round < nRounds; round++) {
        const group = [...carry];
        carry = [];
        queue = queue.filter((p) => !group.some((c) => c.id === p.id));

        while (group.length < perRound) {
            if (queue.length === 0) {
                /* คิวหมด = ทุกคนได้ลงครบหนึ่งรอบเวียนแล้ว เริ่มเวียนใหม่โดยไม่ซ้ำกับคนในทีมนี้ */
                const next = cycleSource.filter((p) => !group.some((c) => c.id === p.id));
                /* คนทั้งหมดยังน้อยกว่าขนาดทีม — คืนทีมที่ไม่ครบดีกว่าวนไม่รู้จบ */
                if (next.length === 0) break;
                queue = shuffle(next);
            }
            group.push(queue.shift() as PlayerProps);
        }

        output.push(group);

        /* เหลือไม่พอตั้งทีมถัดไป = ยกไปเป็นคนแรกของรอบหน้า จะได้ไม่ต้องนั่งรอทั้งเย็น */
        if (queue.length > 0 && queue.length < perRound) {
            carry = queue;
            queue = [];
        }
    }

    return output;
};
