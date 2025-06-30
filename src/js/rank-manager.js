// Shadowverse: Worlds Beyond Tracker - 階級管理模組
// 負責階級計算、升降級邏輯和相關功能

class RankManager {
    // 計算BP對應的階級
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

    // 自動階級調整邏輯
    static autoAdjustRank(winRate, totalGames, currentRank, lastMatchResult = null) {
        // 需要至少15場對戰才開始分組調整
        if (totalGames < CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_ADJUSTMENT) {
            return currentRank;
        }
        
        const rankOrder = ['綠寶石', '黃寶石', '紅寶石', '藍寶石', '鑽石'];
        const currentIndex = rankOrder.indexOf(currentRank);
        const currentRankData = RANK_DATA[currentRank];
        
        // 嚴格掉級條件：勝率遠低於警戒線
        if (winRate < currentRankData.danger - 5 && totalGames >= CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_DANGER) {
            if (currentIndex > 0) {
                return rankOrder[currentIndex - 1];
            }
        }
        
        // 臨界掉級條件
        if (totalGames >= CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_DANGER && currentIndex > 0) {
            if (winRate < currentRankData.maintain) {
                const isDangerZone = winRate <= Math.max(currentRankData.danger + 5, 50);
                const isBlueRank50 = (currentRank === '藍寶石' && winRate === 50);
                
                if ((isDangerZone || isBlueRank50) && lastMatchResult === '敗') {
                    return rankOrder[currentIndex - 1];
                }
            }
        }
        
        // 升級條件
        if (winRate >= currentRankData.maintain + 10 && 
            currentIndex < rankOrder.length - 1 && 
            totalGames >= CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_ADJUSTMENT) {
            const nextRankData = RANK_DATA[rankOrder[currentIndex + 1]];
            if (winRate >= nextRankData.maintain) {
                return rankOrder[currentIndex + 1];
            }
        }
        
        return currentRank;
    }

    // 顯示階級變更通知
    static showRankChangeNotification(oldRank, newRank, winRate) {
        const oldRankData = RANK_DATA[oldRank];
        const newRankData = RANK_DATA[newRank];
        
        const rankOrder = ['綠寶石', '黃寶石', '紅寶石', '藍寶石', '鑽石'];
        const isUpgrade = rankOrder.indexOf(newRank) > rankOrder.indexOf(oldRank);
        
        const message = isUpgrade 
            ? `🎉 恭喜升級！\n${oldRankData.icon} ${oldRankData.name} → ${newRankData.icon} ${newRankData.name}\n\n目前勝率：${winRate}%\n請繼續保持優秀表現！`
            : `📉 分組調整通知\n${oldRankData.icon} ${oldRankData.name} → ${newRankData.icon} ${newRankData.name}\n\n目前勝率：${winRate}%\n建議提升勝率以重回更高分組！`;
        
        alert(message);
    }

    // 分析階級狀態
    static analyzeRankStatus(winRate, totalGames, currentRank) {
        const rank = RANK_DATA[currentRank];
        const maintainThreshold = rank.maintain;
        const dangerThreshold = rank.danger;
        
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
            analysis = `您的${winRate}%勝率在${rank.name}分組中表現優異，完全不用擔心掉級問題。`;
            
            // 檢查是否可以升級
            const rankOrder = ['綠寶石', '黃寶石', '紅寶石', '藍寶石', '鑽石'];
            const currentIndex = rankOrder.indexOf(currentRank);
            if (currentIndex < rankOrder.length - 1) {
                const nextRank = rankOrder[currentIndex + 1];
                const nextRankData = RANK_DATA[nextRank];
                if (winRate >= nextRankData.maintain) {
                    analysis += ` 您的勝率已達到${nextRankData.name}分組標準，系統可能會自動升級。`;
                }
            }
        } else if (winRate >= maintainThreshold) {
            status = '✅ 分組安全';
            statusClass = 'rank-safe';
            analysis = `您的${winRate}%勝率在${rank.name}分組中表現良好，建議繼續保持。`;
        } else if (winRate >= maintainThreshold - 5) {
            status = '⚠️ 需要注意';
            statusClass = 'rank-warning';
            analysis = `您的${winRate}%勝率略低於${rank.name}分組建議標準(${maintainThreshold}%)，建議提升勝率。`;
        } else if (winRate >= dangerThreshold) {
            status = '🚨 掉級風險';
            statusClass = 'rank-danger';
            
            if (totalGames >= CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_DANGER) {
                const isDangerZone = winRate <= Math.max(dangerThreshold + 5, 50);
                const isBlueRank50 = (currentRank === '藍寶石' && winRate === 50);
                
                if (isDangerZone || isBlueRank50) {
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
    static generatePredictions(wins, totalGames, winRate, maintainThreshold, dangerThreshold, currentRank) {
        const lose5 = Math.round(((wins) / (totalGames + 5)) * 100);
        const win5 = Math.round(((wins + 5) / (totalGames + 5)) * 100);
        
        let prediction = '';
        
        // 特別提醒臨界掉級風險
        if (totalGames >= CONFIG.GAME_RULES.MIN_GAMES_FOR_RANK_DANGER && winRate < maintainThreshold) {
            const isDangerZone = winRate <= Math.max(dangerThreshold + 5, 50);
            const isBlueRank50 = (currentRank === '藍寶石' && winRate === 50);
            
            if (isDangerZone || isBlueRank50) {
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
