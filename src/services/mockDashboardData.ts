import { MatchDataType } from "./matchService";

const dashBoardData: MatchDataType[] = [
    {
        id: 0,
        player: [
            { name: "bob", uuid:"test01" ,team: "blue", score: 10, position: 1 },
            { name: "alice", uuid:"test02" ,team: "red", score: 12, position: 0},
            { name: "charlie", uuid:"test03" ,team: "blue", score: 10, position: 0 },
            { name: "dave", uuid:"test04" ,team: "red", score: 12, position: 1 },
        ],
        serviceSide: "red",
        winner: "blue",
        createDate: "",
        updateDate: "",
    },
    {
        id: 1,
        player: [
            { name: "eve", uuid:"test05" ,team: "blue", score: 11, position: 0 },
            { name: "frank", uuid:"test06" ,team: "red", score: 13, position: 1 },
            { name: "grace", uuid:"test07" ,team: "blue", score: 11, position: 1 },
            { name: "heidi", uuid:"test08" ,team: "red", score: 13, position: 0 },
        ],
        serviceSide: "blue",
        winner: "blue",
        createDate: "",
        updateDate: "",
    },
    {
        id: 2,
        player: [
            { name: "ivan", uuid:"test09" ,team: "blue", score: 9, position: 0 },
            { name: "judy", uuid:"test10" ,team: "red", score: 14, position: 0 },
            { name: "mallory", uuid:"test11" ,team: "blue", score: 9, position: 1 },
            { name: "oscar", uuid:"test12" ,team: "red", score: 14, position: 1 },
        ],
        serviceSide: "red",
        winner: "blue",
        createDate: "",
        updateDate: "",
    },
    {
        id: 3,
        player: [
            { name: "peggy", uuid:"test13" ,team: "blue", score: 10, position: 0 },
            { name: "trent", uuid:"test14" ,team: "red", score: 13, position: 0 },
            { name: "victor", uuid:"test15" ,team: "blue", score: 10, position: 1 },
            { name: "walter", uuid:"test16" ,team: "red", score: 13, position: 1 },
        ],
        serviceSide: "blue",
        winner: "blue",
        createDate: "",
        updateDate: "",
    },
    {
        id: 4,
        player: [
            { name: "sybil", uuid:"test17" ,team: "blue", score: 11, position: 0 },
            { name: "trent", uuid:"test14" ,team: "red", score: 12, position: 0 },
        ],
        serviceSide: "red",
        winner: "blue",
        createDate: "",
        updateDate: "",
    },
    {
        id: 5,
        player: [
            { name: "charlie", uuid:"test03" ,team: "blue", score: 10, position: 0 },
            { name: "frank", uuid:"test06" ,team: "red", score: 12, position: 0 },
        ],
        serviceSide: "blue",
        winner: "blue",
        createDate: "",
        updateDate: "",
    },
    {
        id: 6,
        player: [
            { name: "grace", uuid:"test07" ,team: "blue", score: 9, position: 0 },
            { name: "heidi", uuid:"test08" ,team: "red", score: 13, position: 1 },
            { name: "ivan", uuid:"test09" ,team: "blue", score: 9, position: 1 },
            { name: "judy", uuid:"test10" ,team: "red", score: 13, position: 0 },
        ],
        serviceSide: "red",
        winner: "blue",
        createDate: "",
        updateDate: "",
    },
    {
        id: 7,
        player: [
            { name: "mallory", uuid:"test11" ,team: "blue", score: 10, position: 0 },
            { name: "trent", uuid:"test14" ,team: "red", score: 11, position: 0 },
        ],
        serviceSide: "blue",
        winner: "blue",
        createDate: "",
        updateDate: "",
    },
    {
        id: 8,
        player: [
            { name: "victor", uuid:"test15" ,team: "blue", score: 10, position: 0 },
            { name: "alice", uuid:"test02" ,team: "red", score: 13, position: 0 },
        ],
        serviceSide: "red",
        winner: "blue",
        createDate: "",
        updateDate: "",
    },
    {
        id: 9,
        player: [
            { name: "bob", uuid:"test01" ,team: "blue", score: 9, position: 0 },
            { name: "eve", uuid:"test05" ,team: "red", score: 12, position: 0 },
        ],
        serviceSide: "blue",
        winner: "blue",
        createDate: "",
        updateDate: "",
    },
];

export default dashBoardData;
