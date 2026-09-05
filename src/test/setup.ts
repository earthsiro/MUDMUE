import { beforeEach } from "vitest";

/**
 * Web Storage ปลอมสำหรับ environment "node"
 *
 * service ทุกตัวในเว็บนี้อ่าน-เขียน localStorage ตรง ๆ (ไม่มี backend) เทสจึงต้องมี
 * ตัวจริง ๆ ให้เรียก ไม่ใช่ mock รายฟังก์ชัน — พฤติกรรมอย่าง "JSON พังแล้วคืนค่าว่าง"
 * จะเทสไม่ได้เลยถ้า mock ทับไว้
 */
const createStorage = (): Storage => {
    let store = new Map<string, string>();

    return {
        get length() {
            return store.size;
        },
        clear: () => {
            store = new Map();
        },
        getItem: (key: string) => store.get(key) ?? null,
        key: (index: number) => [...store.keys()][index] ?? null,
        removeItem: (key: string) => {
            store.delete(key);
        },
        setItem: (key: string, value: string) => {
            store.set(key, String(value));
        },
    };
};

/* defineProperty เพราะ lib DOM ประกาศ localStorage เป็น read-only */
Object.defineProperty(globalThis, "localStorage", { value: createStorage(), configurable: true });
Object.defineProperty(globalThis, "sessionStorage", { value: createStorage(), configurable: true });

/* ทุกเทสเริ่มจากเครื่องเปล่าเสมอ — ไม่งั้นลำดับการรันจะมีผลกับผลลัพธ์ */
beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});
