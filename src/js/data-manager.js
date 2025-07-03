// Shadowverse: Worlds Beyond Tracker - 數據管理模組
// 負責所有localStorage操作和數據管理

class DataManager {
    constructor() {
        this.playerData = this.loadPlayerData();
        this.battleData = this.loadBattleData();
        this.startingBP = this.loadStartingBP();
        this.currentGroup = this.loadCurrentGroup();
        this.rankChangeHistory = this.loadRankChangeHistory(); // 新增分組變動歷史
    }

    // 載入玩家資料
    loadPlayerData() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.PLAYER);
        return stored ? JSON.parse(stored) : { ...DEFAULT_PLAYER_DATA };
    }

    // 儲存玩家資料
    savePlayerData(data = null) {
        if (data) this.playerData = data;
        localStorage.setItem(CONFIG.STORAGE_KEYS.PLAYER, JSON.stringify(this.playerData));
    }

    // 載入對戰數據
    loadBattleData() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.BATTLES);
        return stored ? JSON.parse(stored) : [...DEFAULT_BATTLE_DATA];
    }

    // 儲存對戰數據
    saveBattleData(data = null) {
        if (data) this.battleData = data;
        localStorage.setItem(CONFIG.STORAGE_KEYS.BATTLES, JSON.stringify(this.battleData));
    }

    // 載入起始BP
    loadStartingBP() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.STARTING_BP);
        return stored ? parseInt(stored) : CONFIG.DEFAULTS.STARTING_BP;
    }

    // 儲存起始BP
    saveStartingBP(bp = null) {
        if (bp !== null) this.startingBP = bp;
        localStorage.setItem(CONFIG.STORAGE_KEYS.STARTING_BP, this.startingBP);
    }

    // 載入當前分組
    loadCurrentGroup() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_GROUP);
        return stored || CONFIG.DEFAULTS.CURRENT_GROUP;
    }

    // 儲存當前分組
    saveCurrentGroup(group = null) {
        if (group) this.currentGroup = group;
        localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_GROUP, this.currentGroup);
    }

    // 載入分組變動歷史
    loadRankChangeHistory() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.RANK_CHANGES);
        return stored ? JSON.parse(stored) : [];
    }

    // 儲存分組變動歷史
    saveRankChangeHistory(data = null) {
        if (data) this.rankChangeHistory = data;
        localStorage.setItem(CONFIG.STORAGE_KEYS.RANK_CHANGES, JSON.stringify(this.rankChangeHistory));
    }

    // 新增對戰記錄
    addBattle(battleData) {
        const newBattle = {
            id: this.battleData.length + 1,
            ...battleData,
            timestamp: new Date().toISOString().split('T')[0]
        };
        this.battleData.push(newBattle);
        this.saveBattleData();
        return newBattle;
    }

    // 編輯對戰記錄
    editBattle(battleId, updatedData) {
        const battleIndex = this.battleData.findIndex(battle => battle.id === battleId);
        if (battleIndex === -1) return false;

        // 保留原有的id和timestamp
        const originalBattle = this.battleData[battleIndex];
        this.battleData[battleIndex] = {
            ...originalBattle,
            ...updatedData,
            id: originalBattle.id,
            timestamp: originalBattle.timestamp
        };

        this.saveBattleData();
        return true;
    }

    // 刪除對戰記錄
    deleteBattle(battleId) {
        const battleIndex = this.battleData.findIndex(battle => battle.id === battleId);
        if (battleIndex === -1) return false;

        this.battleData.splice(battleIndex, 1);
        
        // 重新編號ID
        this.battleData.forEach((battle, index) => {
            battle.id = index + 1;
        });

        this.saveBattleData();
        
        // 同時清理相關的分組變動記錄
        this.rankChangeHistory = this.rankChangeHistory.filter(change => change.battleId !== battleId);
        this.saveRankChangeHistory();
        
        return true;
    }

    // 取得單一對戰記錄
    getBattle(battleId) {
        return this.battleData.find(battle => battle.id === battleId);
    }

    // 清除所有對戰數據
    clearAllBattles() {
        this.battleData = [];
        localStorage.removeItem(CONFIG.STORAGE_KEYS.BATTLES);
    }

    // 記錄分組變動
    recordRankChange(battleIndex, fromRank, toRank, winRate, totalGames, reason = '手動標記') {
        const battle = this.battleData[battleIndex];
        if (!battle) return false;

        const changeRecord = {
            id: this.rankChangeHistory.length + 1,
            battleId: battle.id,
            battleIndex: battleIndex + 1, // 顯示用（從1開始）
            timestamp: new Date().toISOString(),
            fromRank,
            toRank,
            battleDetails: {
                myClass: battle.myClass,
                opponentClass: battle.opponentClass,
                result: battle.result,
                turnOrder: battle.turnOrder,
                bpChange: battle.bpChange
            },
            statsAtChange: {
                winRate,
                totalGames,
                currentBP: this.startingBP + this.battleData.slice(0, battleIndex + 1).reduce((sum, b) => sum + b.bpChange, 0)
            },
            reason
        };

        this.rankChangeHistory.push(changeRecord);
        this.saveRankChangeHistory();
        return changeRecord;
    }

    // 刪除分組變動記錄
    removeRankChange(changeId) {
        this.rankChangeHistory = this.rankChangeHistory.filter(change => change.id !== changeId);
        this.saveRankChangeHistory();
    }

    // 計算統計數據
    getStatistics() {
        const totalGames = this.battleData.length;
        const wins = this.battleData.filter(b => b.result === '勝').length;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
        const currentBP = this.startingBP + this.battleData.reduce((sum, b) => sum + b.bpChange, 0);

        // 計算先手後手統計
        const firstTurnGames = this.battleData.filter(b => b.turnOrder === '先手');
        const secondTurnGames = this.battleData.filter(b => b.turnOrder === '後手');
        
        const firstTurnWins = firstTurnGames.filter(b => b.result === '勝').length;
        const secondTurnWins = secondTurnGames.filter(b => b.result === '勝').length;
        
        const firstWinRate = firstTurnGames.length > 0 ? Math.round((firstTurnWins / firstTurnGames.length) * 100) : 0;
        const secondWinRate = secondTurnGames.length > 0 ? Math.round((secondTurnWins / secondTurnGames.length) * 100) : 0;

        // 計算連勝/連敗
        let streak = 0;
        let streakType = '';
        if (totalGames > 0) {
            streakType = this.battleData[totalGames - 1].result;
            for (let i = totalGames - 1; i >= 0; i--) {
                if (this.battleData[i].result === streakType) {
                    streak++;
                } else {
                    break;
                }
            }
        }

        return {
            totalGames,
            wins,
            winRate,
            currentBP,
            streak,
            streakType,
            firstTurnGames: firstTurnGames.length,
            secondTurnGames: secondTurnGames.length,
            firstTurnWins,
            secondTurnWins,
            firstWinRate,
            secondWinRate,
            lastMatchResult: totalGames > 0 ? this.battleData[totalGames - 1].result : null
        };
    }

    // 取得職業對戰矩陣統計
    getMatrixStatistics() {
        const matrix = {
            first: {}, // 先手數據
            second: {} // 後手數據
        };

        // 初始化矩陣
        CLASS_LIST.forEach(myClass => {
            matrix.first[myClass] = {};
            matrix.second[myClass] = {};
            CLASS_LIST.forEach(opponentClass => {
                matrix.first[myClass][opponentClass] = { wins: 0, total: 0, winRate: 0 };
                matrix.second[myClass][opponentClass] = { wins: 0, total: 0, winRate: 0 };
            });
        });

        // 統計對戰數據
        this.battleData.forEach(battle => {
            const { myClass, opponentClass, result, turnOrder } = battle;
            
            // 只處理有先手/後手信息的對戰
            if (!turnOrder || !CLASS_LIST.includes(myClass) || !CLASS_LIST.includes(opponentClass)) {
                return;
            }

            const turnMatrix = turnOrder === '先手' ? matrix.first : matrix.second;
            
            if (turnMatrix[myClass] && turnMatrix[myClass][opponentClass]) {
                turnMatrix[myClass][opponentClass].total++;
                if (result === '勝') {
                    turnMatrix[myClass][opponentClass].wins++;
                }
                
                // 計算勝率
                const total = turnMatrix[myClass][opponentClass].total;
                const wins = turnMatrix[myClass][opponentClass].wins;
                turnMatrix[myClass][opponentClass].winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
            }
        });

        return matrix;
    }

    // 導出數據
    exportData() {
        const stats = this.getStatistics();
        const currentRankLevel = RankManager.calculateRank(stats.currentBP);
        
        let exportText = `闇影詩章:凌越世界 對戰紀錄\n`;
        exportText += `日期：${new Date().toISOString().split('T')[0]}\n`;
        exportText += `階級：${currentRankLevel}\n`;
        exportText += `起始BP：${this.startingBP}\n`;
        exportText += `目前BP：${stats.currentBP}\n`;
        exportText += `分組：${RANK_DATA[this.currentGroup].name}\n`;
        exportText += `總勝率：${stats.winRate}% (${stats.wins}勝/${stats.totalGames - stats.wins}敗)\n`;
        exportText += `先手勝率：${stats.firstWinRate}% (${stats.firstTurnWins}勝/${stats.firstTurnGames - stats.firstTurnWins}敗，共${stats.firstTurnGames}場)\n`;
        exportText += `後手勝率：${stats.secondWinRate}% (${stats.secondTurnWins}勝/${stats.secondTurnGames - stats.secondTurnWins}敗，共${stats.secondTurnGames}場)\n\n`;
        
        this.battleData.forEach((battle, index) => {
            const turnInfo = battle.turnOrder ? ` ${battle.turnOrder}` : '';
            exportText += `第${index + 1}場：${battle.myClass}對戰${battle.opponentClass}${turnInfo} ${battle.result}（${battle.bpChange > 0 ? '+' : ''}${battle.bpChange}BP）\n`;
        });
        
        return exportText;
    }

    // 解析導入數據
    parseImportData(content) {
        try {
            const lines = content.split('\n').map(line => line.trim()).filter(line => line);
            let newStartingBP = this.startingBP;
            let newCurrentBP = null;
            let detectedGroup = null; // 分組，不是階級
            const newBattleData = [];
            
            for (const line of lines) {
                // 解析起始BP
                if (line.includes('起始BP：')) {
                    const bpMatch = line.match(/起始BP：(\d+)/);
                    if (bpMatch) {
                        newStartingBP = parseInt(bpMatch[1]);
                    }
                }
                
                // 解析目前BP
                if (line.includes('目前BP：')) {
                    const bpMatch = line.match(/目前BP：(\d+)/);
                    if (bpMatch) {
                        newCurrentBP = parseInt(bpMatch[1]);
                    }
                }
                
                // 解析分組（不是階級）
                if (line.includes('分組：')) {
                    const groupMatch = line.match(/分組：(.+)/);
                    if (groupMatch) {
                        detectedGroup = groupMatch[1].trim();
                    }
                }
                
                // 解析對戰記錄（包含先手/後手信息）
                const battleMatchWithTurn = line.match(/第(\d+)場：(.+)對戰(.+)\s+(先手|後手)\s+(勝|敗)（\+(\d+)BP）/);
                const battleMatchSimple = line.match(/第(\d+)場：(.+)對戰(.+)\s+(勝|敗)（\+(\d+)BP）/);
                
                if (battleMatchWithTurn) {
                    const [, id, myClass, opponentClass, turnOrder, result, bpChange] = battleMatchWithTurn;
                    newBattleData.push({
                        id: parseInt(id),
                        myClass: this.convertOldClassName(myClass),
                        opponentClass: this.convertOldClassName(opponentClass),
                        result,
                        bpChange: parseInt(bpChange),
                        turnOrder,
                        timestamp: new Date().toISOString().split('T')[0]
                    });
                } else if (battleMatchSimple) {
                    const [, id, myClass, opponentClass, result, bpChange] = battleMatchSimple;
                    newBattleData.push({
                        id: parseInt(id),
                        myClass: this.convertOldClassName(myClass),
                        opponentClass: this.convertOldClassName(opponentClass),
                        result,
                        bpChange: parseInt(bpChange),
                        timestamp: new Date().toISOString().split('T')[0]
                    });
                }
            }
            
            if (newBattleData.length > 0) {
                // 計算預期的目前BP以驗證數據
                let calculatedBP = newStartingBP;
                newBattleData.forEach(battle => {
                    calculatedBP += battle.bpChange;
                });
                
                // 計算導入後的勝率以驗證分組
                const totalWins = newBattleData.filter(b => b.result === '勝').length;
                const totalGames = newBattleData.length;
                const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
                
                const importMessage = `找到 ${newBattleData.length} 筆對戰記錄\n` +
                    `起始BP：${newStartingBP}\n` +
                    `預期目前BP：${calculatedBP}${newCurrentBP ? `\n實際目前BP：${newCurrentBP}` : ''}\n` +
                    `預期勝率：${winRate}% (${totalWins}勝/${totalGames - totalWins}敗)\n` +
                    `${detectedGroup ? `檢測到分組：${detectedGroup}` : ''}\n\n` +
                    `是否要匯入？這會覆蓋現有數據。`;
                
                if (confirm(importMessage)) {
                    this.startingBP = newStartingBP;
                    this.battleData = newBattleData;
                    
                    // 如果檢測到分組，自動調整
                    if (detectedGroup && RANK_DATA[detectedGroup]) {
                        this.currentGroup = detectedGroup;
                        this.saveCurrentGroup();
                    }
                    
                    this.saveStartingBP();
                    this.saveBattleData();
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('解析導入數據時發生錯誤:', error);
            throw new Error('數據格式不正確，無法解析');
        }
    }

    // 轉換舊職業名稱
    convertOldClassName(className) {
        const classMap = {
            '王室': '皇家',
            '妖精': '精靈',
            '法師': '巫師',
            '龍族': '龍',
            '死靈': '夜魔',
            '牧師': '主教',
            '復仇': '復仇者'
        };
        return classMap[className] || className;
    }

    // 取得分組變動統計
    getRankChangeAnalysis() {
        const analysis = {
            totalChanges: this.rankChangeHistory.length,
            upgradeCount: 0,
            downgradeCount: 0,
            changesByRank: {},
            averageGamesForChange: 0,
            winRateAtChanges: []
        };

        const rankOrder = ['綠寶石', '黃寶石', '紅寶石', '藍寶石', '鑽石'];
        
        this.rankChangeHistory.forEach(change => {
            const fromIndex = rankOrder.indexOf(change.fromRank);
            const toIndex = rankOrder.indexOf(change.toRank);
            
            if (toIndex > fromIndex) {
                analysis.upgradeCount++;
            } else if (toIndex < fromIndex) {
                analysis.downgradeCount++;
            }

            // 按分組統計
            if (!analysis.changesByRank[change.fromRank]) {
                analysis.changesByRank[change.fromRank] = { upgrades: 0, downgrades: 0, total: 0 };
            }
            
            if (toIndex > fromIndex) {
                analysis.changesByRank[change.fromRank].upgrades++;
            } else if (toIndex < fromIndex) {
                analysis.changesByRank[change.fromRank].downgrades++;
            }
            analysis.changesByRank[change.fromRank].total++;

            analysis.winRateAtChanges.push({
                winRate: change.statsAtChange.winRate,
                games: change.statsAtChange.totalGames,
                direction: toIndex > fromIndex ? 'upgrade' : 'downgrade'
            });
        });

        if (analysis.winRateAtChanges.length > 0) {
            analysis.averageGamesForChange = Math.round(
                analysis.winRateAtChanges.reduce((sum, item) => sum + item.games, 0) / analysis.winRateAtChanges.length
            );
        }

        return analysis;
    }

    // 匯出分組變動分析數據
    exportRankChangeAnalysis() {
        const analysis = this.getRankChangeAnalysis();
        const stats = this.getStatistics();
        
        let exportText = `闇影詩章:凌越世界 分組變動分析報告\n`;
        exportText += `生成日期：${new Date().toISOString().split('T')[0]}\n`;
        exportText += `目前狀態：${this.currentGroup} | BP: ${stats.currentBP} | 勝率: ${stats.winRate}%\n\n`;
        
        exportText += `=== 分組變動統計 ===\n`;
        exportText += `總變動次數：${analysis.totalChanges}\n`;
        exportText += `升級次數：${analysis.upgradeCount}\n`;
        exportText += `降級次數：${analysis.downgradeCount}\n`;
        exportText += `平均變動場次：${analysis.averageGamesForChange}\n\n`;

        exportText += `=== 各分組變動詳情 ===\n`;
        Object.entries(analysis.changesByRank).forEach(([rank, data]) => {
            exportText += `${rank}：升級${data.upgrades}次，降級${data.downgrades}次，共${data.total}次\n`;
        });

        exportText += `\n=== 變動時勝率分析 ===\n`;
        const upgrades = analysis.winRateAtChanges.filter(item => item.direction === 'upgrade');
        const downgrades = analysis.winRateAtChanges.filter(item => item.direction === 'downgrade');
        
        if (upgrades.length > 0) {
            const avgUpgradeWinRate = Math.round(upgrades.reduce((sum, item) => sum + item.winRate, 0) / upgrades.length);
            exportText += `升級時平均勝率：${avgUpgradeWinRate}%\n`;
        }
        
        if (downgrades.length > 0) {
            const avgDowngradeWinRate = Math.round(downgrades.reduce((sum, item) => sum + item.winRate, 0) / downgrades.length);
            exportText += `降級時平均勝率：${avgDowngradeWinRate}%\n`;
        }

        exportText += `\n=== 詳細變動記錄 ===\n`;
        this.rankChangeHistory.forEach((change, index) => {
            exportText += `${index + 1}. 第${change.battleIndex}場後：${change.fromRank} → ${change.toRank}\n`;
            exportText += `   對戰：${change.battleDetails.myClass} vs ${change.battleDetails.opponentClass} `;
            exportText += `${change.battleDetails.turnOrder || ''} ${change.battleDetails.result} (${change.battleDetails.bpChange > 0 ? '+' : ''}${change.battleDetails.bpChange}BP)\n`;
            exportText += `   當時狀態：勝率${change.statsAtChange.winRate}% (${change.statsAtChange.totalGames}場) BP:${change.statsAtChange.currentBP}\n`;
            exportText += `   原因：${change.reason}\n`;
            exportText += `   時間：${change.timestamp.split('T')[0]}\n\n`;
        });

        return exportText;
    }

    // 清除所有數據
    clearAllData() {
        this.battleData = [];
        this.rankChangeHistory = [];
        this.startingBP = 50000;
        this.currentGroup = '青銅';
        this.playerData = { ...DEFAULT_PLAYER_DATA };
        
        // 清除 localStorage
        localStorage.removeItem(CONFIG.STORAGE_KEYS.BATTLES);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.STARTING_BP);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_GROUP);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.RANK_CHANGES);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.PLAYER);
    }
}
