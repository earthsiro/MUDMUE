import { PlayerProps } from "../pages/mudmue-pick/matchmaker/MudmueMatchmaker";

export const  spinRoundsWithCarryOver = (pool: PlayerProps[], perRound: number, nRounds: number): PlayerProps[][] => {
    let carry: PlayerProps[] = [];   // เก็บคนตกค้าง
    const poolBase = pool.slice();     // original pool
    let poolClone = pool.slice();
    const output: PlayerProps[][] = [];

    for (let round = 0; round < nRounds; round++) {
        let group: PlayerProps[] = [];

        // 1. ใส่ carry over ก่อน
        if (carry.length) {
            group = [...carry];
        }

        // 2. เติม group ให้ครบ perRound ด้วย pull จาก poolClone (shuffle ก่อนถ้าจำเป็น)
        if (group.length < perRound) {
            // เอาคนใน carry ออก
            poolClone = poolClone.filter((p) => !group.some((c) => c.uuid === p.uuid));
            // ถ้า poolClone หมด ให้เริ่ม shuffle ใหม่แต่ไม่ซ้ำกับ carry
            if (poolClone.length === 0) {
                poolClone = poolBase.filter((p) => !group.some((c) => c.uuid === p.uuid)).sort(() => Math.random() - 0.5);
            } else {
                poolClone = poolClone.sort(() => Math.random() - 0.5);
            }
            const need = perRound - group.length;
            group = group.concat(poolClone.slice(0, need));
            poolClone = poolClone.slice(need);
        }

        output.push(group);

        // 3. หา carry over คนที่เหลือสำหรับรอบถัดไป
        if (poolClone.length < perRound && poolClone.length > 0) {
            carry = poolClone;
            poolClone = [];
        } else {
            carry = [];
        }
    }

    return output;
};