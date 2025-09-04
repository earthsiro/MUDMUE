const dashBoardData: HistoryDataType[] = [
    {
        id: 0,
        player: [
            { name: "bob", team: "blue", score: 21, position: 1 },
            { name: "alice", team: "red", score: 12, position: 0},
            { name: "charlie", team: "blue", score: 21, position: 0 },
            { name: "dave", team: "red", score: 12, position: 1 },
        ],
        serviceSide: "red",
        winner: "blue",
    },
    {
        id: 1,
        player: [
            { name: "eve", team: "blue", score: 21, position: 0 },
            { name: "frank", team: "red", score: 13, position: 1 },
            { name: "grace", team: "blue", score: 21, position: 1 },
            { name: "heidi", team: "red", score: 13, position: 0 },
        ],
        serviceSide: "blue",
        winner: "blue",
    },
    {
        id: 2,
        player: [
            { name: "ivan", team: "blue", score: 21, position: 0 },
            { name: "judy", team: "red", score: 14, position: 0 },
            { name: "mallory", team: "blue", score: 21, position: 1 },
            { name: "oscar", team: "red", score: 14, position: 1 },
        ],
        serviceSide: "red",
        winner: "blue",
    },
    {
        id: 3,
        player: [
            { name: "peggy", team: "blue", score: 21, position: 0 },
            { name: "trent", team: "red", score: 13, position: 0 },
            { name: "victor", team: "blue", score: 21, position: 1 },
            { name: "walter", team: "red", score: 13, position: 1 },
        ],
        serviceSide: "blue",
        winner: "blue",
    },
    {
        id: 4,
        player: [
            { name: "sybil", team: "blue", score: 21, position: 0 },
            { name: "trent", team: "red", score: 12, position: 0 },
        ],
        serviceSide: "red",
        winner: "blue",
    },
    {
        id: 5,
        player: [
            { name: "charlie", team: "blue", score: 21, position: 0 },
            { name: "frank", team: "red", score: 12, position: 0 },
        ],
        serviceSide: "blue",
        winner: "blue",
    },
    {
        id: 6,
        player: [
            { name: "grace", team: "blue", score: 21, position: 0 },
            { name: "heidi", team: "red", score: 13, position: 1 },
            { name: "ivan", team: "blue", score: 21, position: 1 },
            { name: "judy", team: "red", score: 13, position: 0 },
        ],
        serviceSide: "red",
        winner: "blue",
    },
    {
        id: 7,
        player: [
            { name: "mallory", team: "blue", score: 21, position: 0 },
            { name: "trent", team: "red", score: 11, position: 0 },
        ],
        serviceSide: "blue",
        winner: "blue",
    },
    {
        id: 8,
        player: [
            { name: "victor", team: "blue", score: 21, position: 0 },
            { name: "alice", team: "red", score: 13, position: 0 },
        ],
        serviceSide: "red",
        winner: "blue",
    },
    {
        id: 9,
        player: [
            { name: "bob", team: "blue", score: 21, position: 0 },
            { name: "eve", team: "red", score: 12, position: 0 },
        ],
        serviceSide: "blue",
        winner: "blue",
    },
];

export default dashBoardData;

export interface HistoryDataType {
    id: number;
    player: PlayerDataType[];
    serviceSide: string;
    winner: string; // Optional, used for match results
}
export interface PlayerDataType {
    name: string;
    team: string;
    score: number;
    position: number;
}
