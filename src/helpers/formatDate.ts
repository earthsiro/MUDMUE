export const formatDateTime = (input: string | Date): string => {
    const d = typeof input === "string" ? new Date(input) : input;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return (
        pad(d.getDate()) +
        "/" +
        pad(d.getMonth() + 1) +
        "/" +
        d.getFullYear() +
        " " +
        pad(d.getHours()) +
        ":" +
        pad(d.getMinutes()) +
        ":" +
        pad(d.getSeconds())
    );
};
