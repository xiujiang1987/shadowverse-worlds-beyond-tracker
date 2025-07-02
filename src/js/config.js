// Shadowverse: Worlds Beyond Tracker - 配置與常數
// 此文件包含所有應用程式的配置常數和基礎數據

const CONFIG = {
    // 版本資訊
    VERSION: 'v1.5.1',
    BUILD_DATE: '2025-07-02',
    
    // localStorage keys
    STORAGE_KEYS: {
        PLAYER: 'shadowverseWorldsBeyondPlayer',
        BATTLES: 'shadowverseWorldsBeyondBattles',
        STARTING_BP: 'shadowverseWorldsBeyondStartingBP',
        CURRENT_GROUP: 'shadowverseWorldsBeyondCurrentGroup', // 分組(Group): 綠寶石、黃寶石等
        RANK_CHANGES: 'shadowverseWorldsBeyondRankChanges'
    },
    
    // 默認值
    DEFAULTS: {
        STARTING_BP: 43945,
        CURRENT_GROUP: '鑽石', // 分組，非階級
        WIN_BP: 320,
        LOSE_BP: 30
    },
    
    // 遊戲規則
    GAME_RULES: {
        MIN_GAMES_FOR_RANK_ADJUSTMENT: 15,
        MIN_GAMES_FOR_RANK_DANGER: 20
    }
};

// 分組數據（Group Data）- 遊戲內的寶石系統
const GROUP_DATA = {
    '綠寶石': {
        icon: '🟢',
        name: '綠寶石',
        maintain: 40,
        danger: 30,
        multiplier: 'x1.0',
        color: '#4caf50',
        description: '• 新手分組<br>• 升級條件：達到一定BP自動升級<br>• 勝率無壓力，倍率x1.0'
    },
    '黃寶石': {
        icon: '🟠',
        name: '黃寶石',
        maintain: 45,
        danger: 35,
        multiplier: 'x1.1',
        color: '#ffb300',
        description: '• 進階分組<br>• 升級條件：BP達標自動升級<br>• 勝率建議45%以上，倍率x1.1'
    },
    '紅寶石': {
        icon: '🔴',
        name: '紅寶石',
        maintain: 50,
        danger: 40,
        multiplier: 'x1.3',
        color: '#e53935',
        description: '• 中高級分組<br>• 升級條件：BP達標自動升級<br>• 勝率建議50%以上，倍率x1.3'
    },
    '藍寶石': {
        icon: '🔵',
        name: '藍寶石',
        maintain: 55,
        danger: 45,
        multiplier: 'x1.5',
        color: '#1e88e5',
        description: '• 高級分組<br>• 升級條件：BP達標自動升級<br>• 勝率建議55%以上，倍率x1.5'
    },
    '鑽石': {
        icon: '💎',
        name: '鑽石',
        maintain: 60,
        danger: 50,
        multiplier: 'x2.0',
        color: '#b39ddb',
        description: '• 最高分組<br>• 維持條件：勝率60%以上<br>• 低於50%有掉級風險，倍率x2.0'
    }
};

// 為了向後相容，保留舊名稱
const RANK_DATA = GROUP_DATA;

// 職業數據
const CLASS_DATA = {
    '皇家': { color: '#FFD700', textColor: '#000' },
    '精靈': { color: '#228B22', textColor: '#fff' },
    '巫師': { color: '#4169E1', textColor: '#fff' },
    '龍': { color: '#DC143C', textColor: '#fff' },
    '夜魔': { color: 'linear-gradient(45deg, #8B008B, #8B0000)', textColor: '#fff' },
    '主教': { color: '#F0E68C', textColor: '#000' },
    '復仇者': { color: '#2F4F4F', textColor: '#fff' }
};

// 職業列表（用於對戰矩陣）
const CLASS_LIST = ['皇家', '精靈', '巫師', '龍', '夜魔', '主教', '復仇者'];

// 默認玩家數據
const DEFAULT_PLAYER_DATA = {
    name: '未設定',
    gameId: '未設定',
    registerDate: '2025-06-29',
    mainClass: '龍',
    targetRank: '鑽石',
    targetWinRate: '70%',
    monthlyTarget: '100場',
    targetBP: '60000',
    highestRank: '鑽石',
    highestBP: '52000',
    longestWinStreak: '8場',
    totalPlayTime: '45小時'
};

// 默認對戰數據
const DEFAULT_BATTLE_DATA = [
    {id: 1, myClass: '龍', opponentClass: '皇家', result: '勝', bpChange: 320, timestamp: '2025-06-26', turnOrder: '先手'},
    {id: 2, myClass: '龍', opponentClass: '皇家', result: '勝', bpChange: 320, timestamp: '2025-06-26', turnOrder: '後手'},
    {id: 3, myClass: '龍', opponentClass: '精靈', result: '勝', bpChange: 380, timestamp: '2025-06-26', turnOrder: '先手'},
    {id: 4, myClass: '龍', opponentClass: '皇家', result: '勝', bpChange: 380, timestamp: '2025-06-26', turnOrder: '後手'},
    {id: 5, myClass: '龍', opponentClass: '精靈', result: '敗', bpChange: 30, timestamp: '2025-06-26', turnOrder: '先手'},
    {id: 6, myClass: '龍', opponentClass: '巫師', result: '敗', bpChange: 22, timestamp: '2025-06-26', turnOrder: '後手'},
    {id: 7, myClass: '龍', opponentClass: '復仇者', result: '敗', bpChange: 30, timestamp: '2025-06-26', turnOrder: '先手'},
    {id: 8, myClass: '龍', opponentClass: '巫師', result: '勝', bpChange: 260, timestamp: '2025-06-28', turnOrder: '後手'},
    {id: 9, myClass: '龍', opponentClass: '巫師', result: '勝', bpChange: 320, timestamp: '2025-06-28', turnOrder: '先手'},
    {id: 10, myClass: '龍', opponentClass: '巫師', result: '敗', bpChange: 28, timestamp: '2025-06-28', turnOrder: '後手'},
    {id: 11, myClass: '龍', opponentClass: '龍', result: '勝', bpChange: 320, timestamp: '2025-06-28', turnOrder: '先手'},
    {id: 12, myClass: '龍', opponentClass: '巫師', result: '敗', bpChange: 24, timestamp: '2025-06-28', turnOrder: '後手'},
    {id: 13, myClass: '皇家', opponentClass: '精靈', result: '勝', bpChange: 320, timestamp: '2025-06-29', turnOrder: '先手'},
    {id: 14, myClass: '皇家', opponentClass: '夜魔', result: '敗', bpChange: 30, timestamp: '2025-06-29', turnOrder: '後手'},
    {id: 15, myClass: '精靈', opponentClass: '主教', result: '勝', bpChange: 320, timestamp: '2025-06-29', turnOrder: '先手'},
    {id: 16, myClass: '精靈', opponentClass: '復仇者', result: '勝', bpChange: 380, timestamp: '2025-06-29', turnOrder: '後手'},
    {id: 17, myClass: '巫師', opponentClass: '皇家', result: '敗', bpChange: 25, timestamp: '2025-06-29', turnOrder: '先手'},
    {id: 18, myClass: '夜魔', opponentClass: '龍', result: '勝', bpChange: 340, timestamp: '2025-06-29', turnOrder: '後手'}
];

// 導出配置（ES6模組語法備用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        RANK_DATA,
        CLASS_DATA,
        DEFAULT_PLAYER_DATA,
        DEFAULT_BATTLE_DATA
    };
}
