// Shadowverse: Worlds Beyond Tracker - 階級管理模組
// 負責階級計算、升降級邏輯和相關功能

class RankManager {
    // 計算BP對應的階級（Rank）
    static calculateRank(bp) {
        if (bp >= 60000) return 'Master';
        if (bp >= 50000) return 'A3';
        if (bp >= 45000) return 'A2';
        if (bp >= 40000) return 'A1';
        if (bp >= 35000) return 'B3';
        if (bp >= 30000) return 'B2';
        if (bp >= 25000) return 'B1';
        if (bp >= 20000) return 'C3';
        if (bp >= 15000) return 'C2';
        if (bp >= 10000) return 'C1';
        if (bp >= 5000) return 'D3';
        if (bp >= 2000) return 'D2';
        if (bp >= 1000) return 'D1';
        return 'Beginner';
    }

    // 獲取當前分組（Group） - 基於用戶設定，非BP計算
    static getCurrentGroup() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_GROUP) || CONFIG.DEFAULTS.CURRENT_GROUP;
    }

    // 設定當前分組
    static setCurrentGroup(group) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_GROUP, group);
    }

    // 自動分組調整邏輯（基於分組Group，非階級Rank）
    // 注意：此功能目前為實驗性質，分組升降規則尚未完善
    // 建議使用手動分組標記功能以獲得更準確的分組追蹤
    static autoAdjustGroup(winRate, totalGames, currentGroup, lastMatchResult = null) {
        // 需要至少15場對戰才開始分組調整
        if (totalGames < CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_ADJUSTMENT) {
            return currentGroup;
        }
        
        // TODO: 需要更多實際遊戲數據來完善升降級規則
        // 目前的邏輯僅為基礎估算，可能與實際遊戲規則有差異
        
        const groupOrder = ['綠寶石', '黃寶石', '紅寶石', '藍寶石', '鑽石'];
        const currentIndex = groupOrder.indexOf(currentGroup);
        const currentGroupData = RANK_DATA[currentGroup];
        
        // 嚴格掉級條件：勝率遠低於警戒線
        if (winRate < currentGroupData.danger - 5 && totalGames >= CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_DANGER) {
            if (currentIndex > 0) {
                return groupOrder[currentIndex - 1];
            }
        }
        
        // 臨界掉級條件
        if (totalGames >= CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_DANGER && currentIndex > 0) {
            if (winRate < currentGroupData.maintain) {
                const isDangerZone = winRate <= Math.max(currentGroupData.danger + 5, 50);
                const isBlueGroup50 = (currentGroup === '藍寶石' && winRate === 50);
                
                if ((isDangerZone || isBlueGroup50) && lastMatchResult === '敗') {
                    return groupOrder[currentIndex - 1];
                }
            }
        }
        
        // 升級條件
        if (winRate >= currentGroupData.maintain + 10 && 
            currentIndex < groupOrder.length - 1 && 
            totalGames >= CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_ADJUSTMENT) {
            const nextGroupData = RANK_DATA[groupOrder[currentIndex + 1]];
            if (winRate >= nextGroupData.maintain) {
                return groupOrder[currentIndex + 1];
            }
        }
        
        return currentGroup;
    }

    // 顯示分組變更通知
    static showGroupChangeNotification(oldGroup, newGroup, winRate) {
        const oldGroupData = RANK_DATA[oldGroup];
        const newGroupData = RANK_DATA[newGroup];
        
        const groupOrder = ['綠寶石', '黃寶石', '紅寶石', '藍寶石', '鑽石'];
        const isUpgrade = groupOrder.indexOf(newGroup) > groupOrder.indexOf(oldGroup);
        
        const message = isUpgrade 
            ? `🎉 恭喜升級！\n${oldGroupData.icon} ${oldGroupData.name} → ${newGroupData.icon} ${newGroupData.name}\n\n目前勝率：${winRate}%\n請繼續保持優秀表現！`
            : `📉 分組調整通知\n${oldGroupData.icon} ${oldGroupData.name} → ${newGroupData.icon} ${newGroupData.name}\n\n目前勝率：${winRate}%\n建議提升勝率以重回更高分組！`;
        
        alert(message);
    }

    // 分析分組狀態
    static analyzeGroupStatus(winRate, totalGames, currentGroup) {
        const group = RANK_DATA[currentGroup];
        const maintainThreshold = group.maintain;
        const dangerThreshold = group.danger;
        
        // 如果場次太少，給予提示
        if (totalGames < CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_ADJUSTMENT) {
            return {
                status: '📊 數據收集中',
                statusClass: 'rank-safe',
                analysis: `目前有${totalGames}場對戰記錄，建議至少進行${CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_ADJUSTMENT}場對戰後系統才會進行分組調整評估。`
            };
        }

        let status, statusClass, analysis;

        if (winRate >= maintainThreshold + 10) {
            status = '✅ 分組非常穩定';
            statusClass = 'rank-safe';
            analysis = `您的${winRate}%勝率在${group.name}分組中表現優異，完全不用擔心掉級問題。`;
            
            // 檢查是否可以升級
            const groupOrder = ['綠寶石', '黃寶石', '紅寶石', '藍寶石', '鑽石'];
            const currentIndex = groupOrder.indexOf(currentGroup);
            if (currentIndex < groupOrder.length - 1) {
                const nextGroup = groupOrder[currentIndex + 1];
                const nextGroupData = RANK_DATA[nextGroup];
                if (winRate >= nextGroupData.maintain) {
                    analysis += ` 您的勝率已達到${nextGroupData.name}分組標準，系統可能會自動升級。`;
                }
            }
        } else if (winRate >= maintainThreshold) {
            status = '✅ 分組安全';
            statusClass = 'rank-safe';
            analysis = `您的${winRate}%勝率在${group.name}分組中表現良好，建議繼續保持。`;
        } else if (winRate >= maintainThreshold - 5) {
            status = '⚠️ 需要注意';
            statusClass = 'rank-warning';
            analysis = `您的${winRate}%勝率略低於${group.name}分組建議標準(${maintainThreshold}%)，建議提升勝率。`;
        } else if (winRate >= dangerThreshold) {
            status = '🚨 掉級風險';
            statusClass = 'rank-danger';
            
            if (totalGames >= CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_DANGER) {
                const isDangerZone = winRate <= Math.max(dangerThreshold + 5, 50);
                const isBlueGroup50 = (currentGroup === '藍寶石' && winRate === 50);
                
                if (isDangerZone || isBlueGroup50) {
                    analysis = `您的${winRate}%勝率已在臨界區域，下一場敗戰可能觸發掉級機制。`;
                } else {
                    analysis = `您的${winRate}%勝率接近掉級警戒線(${dangerThreshold}%)，建議盡快提升勝率。`;
                }
            } else {
                analysis = `您的${winRate}%勝率接近掉級警戒線，但還需要${CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_DANGER - totalGames}場對戰才會觸發分組調整。`;
            }
        } else {
            status = '💥 極度危險';
            statusClass = 'rank-danger';
            if (totalGames >= CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_DANGER) {
                analysis = `您的${winRate}%勝率極低，系統已自動調整分組。建議調整策略重回更高分組。`;
            } else {
                analysis = `您的${winRate}%勝率極低，還有${CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_DANGER - totalGames}場緩衝期。請立即調整策略提升勝率！`;
            }
        }

        return { status, statusClass, analysis };
    }

    // 生成勝率預測
    static generatePredictions(wins, totalGames, winRate, maintainThreshold, dangerThreshold, currentGroup) {
        const lose5 = Math.round(((wins) / (totalGames + 5)) * 100);
        const win5 = Math.round(((wins + 5) / (totalGames + 5)) * 100);
        
        let prediction = '';
        
        // 特別提醒臨界掉級風險
        if (totalGames >= CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_DANGER && winRate < maintainThreshold) {
            const isDangerZone = winRate <= Math.max(dangerThreshold + 5, 50);
            const isBlueGroup50 = (currentGroup === '藍寶石' && winRate === 50);
            
            if (isDangerZone || isBlueGroup50) {
                prediction += `• 🚨 <strong>掉級風險警告</strong>：您的勝率已在臨界區域，下一場敗戰可能觸發掉級！<br>`;
            }
        }
        
        if (lose5 < dangerThreshold - 5) {
            prediction += `• ⚠️ 如果接下來5場全敗，勝率將降至${lose5}%，有嚴重掉級風險<br>`;
        } else if (lose5 < dangerThreshold) {
            prediction += `• ⚠️ 如果接下來5場全敗，勝率將降至${lose5}%，有掉級風險<br>`;
        } else {
            prediction += `• 如果接下來5場全敗，勝率將降至${lose5}%<br>`;
        }
        
        prediction += `• 如果接下來5場全勝，勝率將升至${win5}%`;
        
        if (win5 >= maintainThreshold + 10) {
            prediction += '，分組將非常穩定';
        } else if (win5 >= maintainThreshold) {
            prediction += '，分組將很安全';
        }
        
        return prediction;
    }
}
