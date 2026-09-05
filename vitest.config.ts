import { defineConfig } from "vitest/config";

/**
 * เทสของโปรเจคนี้จับเฉพาะ "ตรรกะล้วน" — helpers กับ services ที่ไม่ต้องมี DOM
 * (สูตรคิดเงิน, กติกาดราฟท์, การสุ่มจับคู่, การอ่าน-เขียน localStorage)
 *
 * จึงรันบน environment "node" ไม่ใช่ jsdom แล้วเสียบ Web Storage ปลอมให้ใน
 * `src/test/setup.ts` แทน — เร็วกว่าและไม่ต้องลง jsdom เพิ่ม
 * ส่วนการเทสคอมโพเนนต์/หน้าจอจริงเป็นคนละชั้น ค่อยเพิ่มทีหลังได้
 */
export default defineConfig({
    test: {
        include: ["src/**/*.test.ts"],
        environment: "node",
        setupFiles: ["./src/test/setup.ts"],
    },
});
