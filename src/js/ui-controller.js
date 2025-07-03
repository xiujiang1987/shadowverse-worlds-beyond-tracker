// Shadowverse: Worlds Beyond Tracker - UI控制器
// 負責所有UI更新、事件處理和面板管理

class UIController {
    constructor() {
        this.init();
    }

    // 初始化UI
    init() {
        this.initPlayerData();
        this.updateStats();
        this.renderBattles();
        this.bindEvents();
    }

    // 面板切換功能
    showPanel(panelName) {
        // 隱藏所有面板
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // 移除所有導航按鈕的active class
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 顯示指定面板
        const targetPanel = document.getElementById(panelName + 'Panel');
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
        
        // 設定對應導航按鈕為active
        // 找到對應的導航按鈕並設為active
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            if (btn.onclick && btn.onclick.toString().includes(panelName)) {
                btn.classList.add('active');
            }
        });
        
        // 如果是矩陣面板，渲染矩陣數據
        if (panelName === 'matrix') {
            // 取得當前活躍的矩陣類型
            const firstBtn = document.getElementById('firstMatrixBtn');
            const currentType = firstBtn && firstBtn.classList.contains('active') ? 'first' : 'second';
            
            // 渲染所有矩陣數據（確保切換時有數據）
            const matrixData = dataManager.getMatrixStatistics();
            this.renderMatrixTable('firstMatrixTable', matrixData.first, '先手');
            this.renderMatrixStats('firstMatrixStats', matrixData.first, '先手');
            this.renderMatrixTable('secondMatrixTable', matrixData.second, '後手');
            this.renderMatrixStats('secondMatrixStats', matrixData.second, '後手');
            
            // 顯示當前選中的矩陣
            this.renderMatrix(currentType);
        }
    }

    // 初始化玩家資料顯示
    initPlayerData() {
        const elements = [
            'playerName', 'gameId', 'registerDate', 'mainClass', 
            'targetRank', 'targetWinRate', 'monthlyTarget', 'targetBP',
            'highestRank', 'highestBP', 'longestWinStreak', 'totalPlayTime'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element && dataManager.playerData[id]) {
                element.textContent = dataManager.playerData[id];
            }
        });
    }

    // 更新統計資訊
    updateStats() {
        const stats = dataManager.getStatistics();
        
        // 檢查分組自動調整
        const oldGroup = dataManager.currentGroup;
        const newGroup = RankManager.autoAdjustGroup(
            stats.winRate, 
            stats.totalGames, 
            dataManager.currentGroup, 
            stats.lastMatchResult
        );

        if (newGroup !== dataManager.currentGroup) {
            console.log(`分組自動調整：${dataManager.currentGroup} → ${newGroup} (勝率: ${stats.winRate}%, 最後一場: ${stats.lastMatchResult})`);
            dataManager.currentGroup = newGroup;
            dataManager.saveCurrentGroup();
            RankManager.showGroupChangeNotification(oldGroup, newGroup, stats.winRate);
        }

        // 更新顯示元素
        const currentRankLevel = RankManager.calculateRank(stats.currentBP);
        const streakText = stats.streak + (stats.streakType === '勝' ? '連勝' : '連敗');

        this.updateElement('currentBP', stats.currentBP.toLocaleString());
        this.updateElement('startingBP', dataManager.startingBP.toLocaleString());
        this.updateElement('currentRank', `${GROUP_DATA[dataManager.currentGroup].icon} ${GROUP_DATA[dataManager.currentGroup].name}`);
        this.updateElement('currentRankLevel', currentRankLevel);
        this.updateElement('totalGames', stats.totalGames);
        this.updateElement('winRate', stats.winRate + '%');
        
        // 更新先手後手勝率
        this.updateElement('firstWinRate', stats.firstTurnGames > 0 ? `${stats.firstWinRate}%` : '--');
        this.updateElement('secondWinRate', stats.secondTurnGames > 0 ? `${stats.secondWinRate}%` : '--');
        
        this.updateElement('streak', streakText);

        this.updateRankCalculator(stats.totalGames, stats.wins, stats.winRate);
    }

    // 更新階級計算器
    updateRankCalculator(totalGames, wins, winRate) {
        const rankStatusText = document.getElementById('rankStatusText');
        const rankProgress = document.getElementById('rankProgress');
        const rankAnalysis = document.getElementById('rankAnalysis');
        const rankPrediction = document.getElementById('rankPrediction');
        
        if (!rankStatusText || !rankProgress || !rankAnalysis || !rankPrediction) return;

        const rank = RANK_DATA[dataManager.currentGroup];
        const { status, statusClass, analysis } = RankManager.analyzeGroupStatus(winRate, totalGames, dataManager.currentGroup);
        
        // 設定進度條寬度
        rankProgress.style.width = winRate + '%';
        
        // 更新狀態顯示
        rankStatusText.textContent = status;
        rankStatusText.className = statusClass;
        rankAnalysis.textContent = analysis;
        
        // 更新預測
        const prediction = RankManager.generatePredictions(
            wins, totalGames, winRate, 
            rank.maintain, rank.danger, dataManager.currentGroup
        );
        rankPrediction.innerHTML = prediction;
    }

    // 渲染對戰記錄
    renderBattles() {
        const battleList = document.getElementById('battleList');
        if (!battleList) return;

        battleList.innerHTML = '';
        
        dataManager.battleData.slice().reverse().forEach((battle, reverseIndex) => {
            const battleIndex = dataManager.battleData.length - 1 - reverseIndex; // 實際索引
            const battleItem = document.createElement('div');
            battleItem.className = 'battle-item';
            
            // 先手後手顯示
            const turnInfo = battle.turnOrder ? `<span class="turn-order ${battle.turnOrder}">${battle.turnOrder}</span>` : '';
            
            // 檢查是否已標記分組變動
            const isMarked = dataManager.rankChangeHistory.some(change => change.battleId === battle.id);
            const markButton = `<button class="rank-change-btn ${isMarked ? 'marked' : ''}" 
                onclick="toggleRankChange(${battleIndex}, ${battle.id})" 
                title="${isMarked ? '已標記分組變動' : '標記分組變動'}">
                ${isMarked ? '📍' : '📌'}
            </button>`;
            
            // 編輯和刪除按鈕
            const editButton = `<button class="edit-btn" onclick="editBattle(${battle.id})" title="編輯對戰記錄">✏️</button>`;
            const deleteButton = `<button class="delete-btn" onclick="deleteBattle(${battle.id})" title="刪除對戰記錄">🗑️</button>`;
            
            battleItem.innerHTML = `
                <div class="battle-info">
                    <span class="职业-icon ${battle.myClass}">${battle.myClass}</span> vs 
                    <span class="职业-icon ${battle.opponentClass}">${battle.opponentClass}</span>
                    ${turnInfo}
                    <span class="bp-change">${battle.bpChange > 0 ? '+' : ''}${battle.bpChange}BP</span>
                    <small style="color: #ccc;">${battle.timestamp}</small>
                    <div class="battle-actions">
                        ${markButton}
                        ${editButton}
                        ${deleteButton}
                    </div>
                </div>
                <div class="battle-result ${battle.result === '勝' ? 'win' : 'lose'}">
                    ${battle.result}
                </div>
            `;
            battleList.appendChild(battleItem);
        });
    }

    // 新增對戰記錄
    addBattle() {
        const myClass = document.getElementById('myClass')?.value;
        const opponentClass = document.getElementById('opponentClass')?.value;
        const turnOrder = document.getElementById('turnOrder')?.value;
        const result = document.getElementById('result')?.value;
        const bpChangeInput = document.getElementById('bpChange');
        const bpValue = bpChangeInput?.value.trim().replace(/^\+/, ''); // 移除前導+號和空白
        
        // 驗證必填欄位
        if (!turnOrder) {
            alert('請選擇先手或後手！');
            document.getElementById('turnOrder')?.focus();
            return;
        }
        
        if (!result) {
            alert('請選擇對戰結果！');
            document.getElementById('result')?.focus();
            return;
        }
        
        // 修正BP驗證邏輯：允許0值，但不允許空值或無效數字
        if (bpValue === '' || bpValue === null || bpValue === undefined) {
            alert('請輸入BP變化值！');
            bpChangeInput?.focus();
            bpChangeInput?.classList.add('error');
            return;
        }
        
        const bpChange = parseInt(bpValue);
        if (isNaN(bpChange)) {
            alert('BP變化值必須是有效數字！');
            bpChangeInput?.focus();
            bpChangeInput?.select();
            bpChangeInput?.classList.add('error');
            return;
        }
        
        // 驗證BP值範圍
        if (Math.abs(bpChange) > 1000) {
            const confirmMsg = `BP變化值 ${bpChange} 似乎很大，是否確認無誤？`;
            if (!confirm(confirmMsg)) {
                bpChangeInput?.focus();
                bpChangeInput?.select();
                return;
            }
        }
        
        const newBattle = {
            myClass,
            opponentClass,
            turnOrder,
            result,
            bpChange
        };
        
        dataManager.addBattle(newBattle);
        
        // 成功提示
        bpChangeInput?.classList.remove('error', 'warning');
        bpChangeInput?.classList.add('success');
        setTimeout(() => {
            bpChangeInput?.classList.remove('success');
        }, 1000);
        
        // 清空表單
        if (bpChangeInput) bpChangeInput.value = '';
        document.getElementById('turnOrder').value = '';
        document.getElementById('result').value = '';
        
        this.updateStats();
        this.renderBattles();
        
        // 顯示成功訊息
        this.showToast('對戰記錄已新增！', 'success');
    }

    // 編輯起始BP
    editStartingBP() {
        const newStartingBP = prompt('請輸入新的起始BP：', dataManager.startingBP);
        
        if (newStartingBP !== null && !isNaN(newStartingBP) && newStartingBP !== '') {
            const parsedBP = parseInt(newStartingBP);
            if (parsedBP >= 0) {
                dataManager.startingBP = parsedBP;
                dataManager.saveStartingBP();
                this.updateStats();
                
                // 添加視覺反饋
                const startingBPElement = document.getElementById('startingBP');
                if (startingBPElement) {
                    startingBPElement.style.transform = 'scale(1.1)';
                    startingBPElement.style.color = '#4CAF50';
                    setTimeout(() => {
                        startingBPElement.style.transform = 'scale(1)';
                        startingBPElement.style.color = '#ffd700';
                    }, 500);
                }
            } else {
                alert('BP不能為負數！');
            }
        }
    }

    // 編輯當前階級
    editCurrentRank() {
        const newRank = prompt(
            `請選擇目前分組：\n\n可選分組：\n🟢 綠寶石\n🟠 黃寶石\n🔴 紅寶石\n🔵 藍寶石\n💎 鑽石\n\n請輸入分組名稱（例：鑽石）：`,
            RANK_DATA[dataManager.currentRank].name
        );
        
        if (newRank !== null) {
            const rankKey = Object.keys(RANK_DATA).find(key => RANK_DATA[key].name === newRank.trim());
            if (rankKey) {
                dataManager.currentRank = rankKey;
                dataManager.saveCurrentRank();
                this.updateStats();
                
                // 添加視覺反饋
                const currentRankElement = document.getElementById('currentRank');
                if (currentRankElement) {
                    currentRankElement.style.transform = 'scale(1.1)';
                    currentRankElement.style.color = '#4CAF50';
                    setTimeout(() => {
                        currentRankElement.style.transform = 'scale(1)';
                        currentRankElement.style.color = '#ffd700';
                    }, 500);
                }
            } else {
                alert('請輸入正確的分組名稱！');
            }
        }
    }

    // 玩家資料編輯函數
    editPlayerName() {
        this.editPlayerField('name', '請輸入玩家名稱：', 'playerName');
    }

    editGameId() {
        this.editPlayerField('gameId', '請輸入遊戲ID：', 'gameId');
    }

    editMainClass() {
        const classes = Object.keys(CLASS_DATA);
        const newClass = prompt('請選擇主要職業：\n' + classes.join(', '), dataManager.playerData.mainClass);
        if (newClass !== null && classes.includes(newClass.trim())) {
            this.editPlayerField('mainClass', null, 'mainClass', newClass.trim());
        }
    }

    editTargetRank() {
        const ranks = Object.keys(RANK_DATA);
        const current = dataManager.playerData.targetRank || '鑽石';
        const newValue = prompt('請選擇目標分組 (' + ranks.join('/') + '):', current);
        if (newValue && ranks.includes(newValue)) {
            dataManager.playerData.targetRank = newValue;
            dataManager.savePlayerData();
            this.initPlayerData();
        }
    }

    // 通用玩家資料編輯
    editPlayerField(field, promptText, elementId, value = null) {
        const newValue = value || (promptText ? prompt(promptText, dataManager.playerData[field]) : null);
        if (newValue !== null && newValue.trim() !== '') {
            dataManager.playerData[field] = newValue.trim();
            this.updateElement(elementId, dataManager.playerData[field]);
            dataManager.savePlayerData();
            this.showSaveStatus('✅ 資料已自動保存', '#4caf50');
        }
    }

    // 玩家資料管理功能
    savePlayerProfile() {
        try {
            dataManager.savePlayerData();
            this.showSaveStatus('✅ 玩家資料已保存', '#4caf50');
            console.log('玩家資料保存成功');
        } catch (error) {
            this.showSaveStatus('❌ 保存失敗', '#f44336');
            console.error('玩家資料保存失敗:', error);
        }
    }

    resetPlayerProfile() {
        if (confirm('確定要重置所有玩家資料嗎？此操作無法復原！')) {
            try {
                // 重置玩家資料為預設值
                dataManager.playerData = { ...DEFAULT_PLAYER_DATA };
                dataManager.savePlayerData();
                this.initPlayerData(); // 重新載入顯示
                this.showSaveStatus('✅ 玩家資料已重置', '#ff9800');
                console.log('玩家資料重置成功');
            } catch (error) {
                this.showSaveStatus('❌ 重置失敗', '#f44336');
                console.error('玩家資料重置失敗:', error);
            }
        }
    }

    // 匯出所有數據（包含分組標記）
    exportData() {
        try {
            const exportData = {
                metadata: {
                    appName: 'Shadowverse: Worlds Beyond Tracker',
                    version: CONFIG.VERSION,
                    exportDate: new Date().toISOString(),
                    totalBattles: dataManager.battleData.length,
                    totalRankChanges: dataManager.rankChangeHistory.length
                },
                playerData: dataManager.playerData,
                battleData: dataManager.battleData,
                startingBP: dataManager.startingBP,
                currentGroup: dataManager.currentGroup,
                rankChanges: dataManager.rankChangeHistory, // 重要：分組變動標記
                statistics: this.generateExportStatistics()
            };
            
            // 生成檔案名稱
            const fileName = `shadowverse_data_${new Date().toISOString().split('T')[0]}.json`;
            
            // 下載 JSON 檔案
            this.downloadJSON(exportData, fileName);
            
            // 顯示成功訊息
            this.showToast('✅ 數據匯出成功！包含所有對戰記錄和分組標記', 'success');
            
            console.log('數據匯出完成:', fileName);
            
        } catch (error) {
            console.error('匯出數據時發生錯誤:', error);
            this.showToast('❌ 匯出失敗：' + error.message, 'error');
        }
    }

    // 匯出分組變動分析
    exportRankAnalysis() {
        try {
            const analysis = this.generateRankAnalysis();
            const fileName = `shadowverse_rank_analysis_${new Date().toISOString().split('T')[0]}.json`;
            
            this.downloadJSON(analysis, fileName);
            this.showToast('✅ 分組分析匯出成功！', 'success');
            
            console.log('分組分析匯出完成:', fileName);
            
        } catch (error) {
            console.error('匯出分組分析時發生錯誤:', error);
            this.showToast('❌ 匯出失敗：' + error.message, 'error');
        }
    }

    // 生成匯出統計資料
    generateExportStatistics() {
        const battles = dataManager.battleData;
        const wins = battles.filter(b => b.result === 'win').length;
        const losses = battles.filter(b => b.result === 'loss').length;
        const firstHandWins = battles.filter(b => b.firstHand && b.result === 'win').length;
        const firstHandTotal = battles.filter(b => b.firstHand).length;
        const secondHandWins = battles.filter(b => !b.firstHand && b.result === 'win').length;
        const secondHandTotal = battles.filter(b => !b.firstHand).length;

        return {
            totalBattles: battles.length,
            wins: wins,
            losses: losses,
            winRate: battles.length > 0 ? ((wins / battles.length) * 100).toFixed(1) + '%' : '0%',
            firstHandWinRate: firstHandTotal > 0 ? ((firstHandWins / firstHandTotal) * 100).toFixed(1) + '%' : '0%',
            secondHandWinRate: secondHandTotal > 0 ? ((secondHandWins / secondHandTotal) * 100).toFixed(1) + '%' : '0%',
            currentBP: this.calculateCurrentBP(),
            bpChange: this.calculateCurrentBP() - dataManager.startingBP
        };
    }

    // 生成分組變動分析報告
    generateRankAnalysis() {
        const battles = dataManager.battleData;
        const rankChanges = dataManager.rankChangeHistory;
        
        const analysis = {
            metadata: {
                appName: 'Shadowverse: Worlds Beyond Tracker - 分組變動分析',
                version: CONFIG.VERSION,
                exportDate: new Date().toISOString(),
                analysisType: 'rank_changes'
            },
            summary: {
                totalBattles: battles.length,
                rankChangesCount: rankChanges.length,
                currentGroup: dataManager.currentGroup,
                startingBP: dataManager.startingBP,
                currentBP: this.calculateCurrentBP()
            },
            rankChanges: rankChanges.map((change, index) => {
                const segmentBattles = this.getRankChangeSegmentBattles(change);
                return {
                    changeIndex: index + 1,
                    battleIndex: change.battleIndex,
                    fromRank: change.fromRank,
                    toRank: change.toRank,
                    changeType: change.changeType || 'unknown',
                    triggerBP: change.triggerBP,
                    timestamp: change.timestamp,
                    segmentAnalysis: this.analyzeRankChangeSegment(segmentBattles),
                    battles: segmentBattles
                };
            }),
            recommendations: this.generateRankChangeRecommendations(rankChanges)
        };
        
        return analysis;
    }

    // 獲取分組變動區段的對戰數據
    getRankChangeSegmentBattles(rankChange) {
        const battles = dataManager.battleData;
        const changeIndex = rankChange.battleIndex;
        
        // 取得變動前後的對戰區段（例如前10場到變動場次）
        const segmentSize = 10;
        const startIndex = Math.max(0, changeIndex - segmentSize);
        const endIndex = Math.min(battles.length, changeIndex + 1);
        
        return battles.slice(startIndex, endIndex);
    }

    // 分析分組變動區段
    analyzeRankChangeSegment(segmentBattles) {
        if (!segmentBattles || segmentBattles.length === 0) {
            return { error: '無對戰數據' };
        }

        const wins = segmentBattles.filter(b => b.result === 'win').length;
        const losses = segmentBattles.filter(b => b.result === 'loss').length;
        const winRate = ((wins / segmentBattles.length) * 100).toFixed(1);
        
        const firstHandBattles = segmentBattles.filter(b => b.firstHand);
        const firstHandWins = firstHandBattles.filter(b => b.result === 'win').length;
        const firstHandWinRate = firstHandBattles.length > 0 ? 
            ((firstHandWins / firstHandBattles.length) * 100).toFixed(1) : '0';
        
        const secondHandBattles = segmentBattles.filter(b => !b.firstHand);
        const secondHandWins = secondHandBattles.filter(b => b.result === 'win').length;
        const secondHandWinRate = secondHandBattles.length > 0 ? 
            ((secondHandWins / secondHandBattles.length) * 100).toFixed(1) : '0';

        const totalBPChange = segmentBattles.reduce((sum, battle) => {
            const bp = parseInt(battle.bpChange) || 0;
            return sum + bp;
        }, 0);

        return {
            battleCount: segmentBattles.length,
            wins: wins,
            losses: losses,
            winRate: winRate + '%',
            firstHandWinRate: firstHandWinRate + '%',
            secondHandWinRate: secondHandWinRate + '%',
            totalBPChange: totalBPChange,
            averageBPChange: (totalBPChange / segmentBattles.length).toFixed(1),
            analysisDate: new Date().toISOString()
        };
    }

    // 生成分組變動建議
    generateRankChangeRecommendations(rankChanges) {
        if (rankChanges.length === 0) {
            return ['建議使用 📌 按鈕標記重要的分組變動，以協助改進算法'];
        }

        const recommendations = [];
        
        // 分析升級模式
        const upgrades = rankChanges.filter(change => change.changeType === 'upgrade');
        if (upgrades.length > 0) {
            recommendations.push('發現 ' + upgrades.length + ' 次升級記錄，這對改進升級算法非常寶貴');
        }
        
        // 分析降級模式
        const downgrades = rankChanges.filter(change => change.changeType === 'downgrade');
        if (downgrades.length > 0) {
            recommendations.push('發現 ' + downgrades.length + ' 次降級記錄，有助於了解降級條件');
        }

        recommendations.push('請將此分析數據分享到 GitHub Issues，協助社群改進分組算法');
        
        return recommendations;
    }

    // 下載 JSON 檔案的通用方法
    downloadJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    // 更新HTML元素內容的通用方法
    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Element with ID "${elementId}" not found`);
        }
    }

    // 綁定事件處理器
    bindEvents() {
        // BP 輸入框 Enter 鍵提交
        const bpChangeInput = document.getElementById('bpChange');
        if (bpChangeInput) {
            bpChangeInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.addBattle();
                }
            });
        }

        // 檔案匯入處理
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (event) => {
                this.importFromFile(event);
            });
        }

        // 拖拽區域事件
        const importArea = document.getElementById('importArea');
        if (importArea) {
            importArea.addEventListener('dragover', (event) => {
                event.preventDefault();
                importArea.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
            });

            importArea.addEventListener('dragleave', (event) => {
                event.preventDefault();
                importArea.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });

            importArea.addEventListener('drop', (event) => {
                event.preventDefault();
                importArea.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                
                const files = event.dataTransfer.files;
                if (files.length > 0) {
                    const mockEvent = { target: { files: files } };
                    this.importFromFile(mockEvent);
                }
            });
        }
    }

    // 檔案匯入功能
    importFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.processImportedData(data);
                } catch (error) {
                    alert('JSON 檔案格式錯誤：' + error.message);
                }
            };
            reader.readAsText(file);
        } else {
            alert('僅支援 JSON 格式的檔案');
        }
    }

    // 處理匯入的數據
    processImportedData(data) {
        try {
            if (data.battleData && Array.isArray(data.battleData)) {
                if (confirm(`確定要匯入 ${data.battleData.length} 筆對戰記錄嗎？這將覆蓋現有數據。`)) {
                    dataManager.battleData = data.battleData;
                    if (data.startingBP) dataManager.startingBP = data.startingBP;
                    if (data.currentGroup) dataManager.currentGroup = data.currentGroup;
                    if (data.playerData) dataManager.playerData = { ...dataManager.playerData, ...data.playerData };
                    if (data.rankChanges) dataManager.rankChangeHistory = data.rankChanges;
                    
                    dataManager.saveBattleData();
                    this.updateStats();
                    this.renderBattles();
                    alert('數據匯入成功！');
                }
            } else {
                alert('檔案格式不正確，缺少有效的對戰數據');
            }
        } catch (error) {
            alert('數據處理錯誤：' + error.message);
        }
    }

    // 清除所有數據
    clearAllData() {
        if (confirm('確定要清除所有數據嗎？此操作無法復原！')) {
            dataManager.clearAllData();
            this.updateStats();
            this.renderBattles();
            alert('所有數據已清除');
        }
    }

    // 矩陣類型切換
    showMatrixType(type) {
        const firstBtn = document.getElementById('firstMatrixBtn');
        const secondBtn = document.getElementById('secondMatrixBtn');
        
        if (firstBtn && secondBtn) {
            firstBtn.classList.toggle('active', type === 'first');
            secondBtn.classList.toggle('active', type === 'second');
        }
        
        this.renderMatrix(type);
    }

    // 切換分組變動標記
    toggleRankChange(battleIndex, battleId) {
        const isMarked = dataManager.rankChangeHistory.some(change => change.battleId === battleId);
        
        if (isMarked) {
            // 移除標記
            dataManager.rankChangeHistory = dataManager.rankChangeHistory.filter(change => change.battleId !== battleId);
        } else {
            // 添加標記
            const battle = dataManager.battleData[battleIndex];
            if (battle) {
                const changeType = prompt('請選擇分組變動類型：\n1. upgrade (升級)\n2. downgrade (降級)\n3. maintain (保持)', 'upgrade');
                if (changeType && ['upgrade', 'downgrade', 'maintain'].includes(changeType)) {
                    dataManager.rankChangeHistory.push({
                        battleId: battleId,
                        battleIndex: battleIndex,
                        changeType: changeType,
                        timestamp: new Date().toISOString(),
                        beforeBP: battle.bpChange < 0 ? dataManager.getStatistics().currentBP - battle.bpChange : dataManager.getStatistics().currentBP,
                        afterBP: dataManager.getStatistics().currentBP,
                        notes: `${battle.myClass} vs ${battle.opponentClass} (${battle.result})`
                    });
                }
            }
        }
        
        dataManager.saveRankChangeHistory();
        this.renderBattles();
    }

    // 編輯對戰記錄
    editBattle(battleId) {
        const battle = dataManager.battleData.find(b => b.id === battleId);
        if (!battle) return;

        const newResult = prompt('修改對戰結果 (勝/負):', battle.result);
        if (newResult && ['勝', '負'].includes(newResult)) {
            battle.result = newResult;
            dataManager.saveBattleData();
            this.updateStats();
            this.renderBattles();
        }
    }

    // 刪除對戰記錄
    deleteBattle(battleId) {
        if (confirm('確定要刪除這筆對戰記錄嗎？')) {
            dataManager.battleData = dataManager.battleData.filter(b => b.id !== battleId);
            // 同時移除相關的分組變動標記
            dataManager.rankChangeHistory = dataManager.rankChangeHistory.filter(change => change.battleId !== battleId);
            dataManager.saveBattleData();
            dataManager.saveRankChangeHistory();
            this.updateStats();
            this.renderBattles();
        }
    }

    // 玩家資料編輯方法
    editPlayerName() {
        const current = dataManager.playerData.playerName || '未設定';
        const newValue = prompt('請輸入玩家名稱:', current);
        if (newValue !== null) {
            dataManager.playerData.playerName = newValue;
            dataManager.savePlayerData();
            this.initPlayerData();
        }
    }

    editGameId() {
        const current = dataManager.playerData.gameId || '未設定';
        const newValue = prompt('請輸入遊戲ID:', current);
        if (newValue !== null) {
            dataManager.playerData.gameId = newValue;
            dataManager.savePlayerData();
            this.initPlayerData();
        }
    }

    editMainClass() {
        const classes = ['皇', '森', '龍', '死', '血', '復', '妖'];
        const current = dataManager.playerData.mainClass || '龍';
        const newValue = prompt('請選擇主要職業 (' + classes.join('/') + '):', current);
        if (newValue && classes.includes(newValue)) {
            dataManager.playerData.mainClass = newValue;
            dataManager.savePlayerData();
            this.initPlayerData();
        }
    }

    editTargetRank() {
        const ranks = Object.keys(GROUP_DATA);
        const current = dataManager.playerData.targetRank || '鑽石';
        const newValue = prompt('請選擇目標分組 (' + ranks.join('/') + '):', current);
        if (newValue && ranks.includes(newValue)) {
            dataManager.playerData.targetRank = newValue;
            dataManager.savePlayerData();
            this.initPlayerData();
        }
    }

    // 計算當前BP
    calculateCurrentBP() {
        return dataManager.getStatistics().currentBP;
    }

    // 渲染對戰矩陣
    renderMatrix(activeType = 'first') {
        // 使用CSS類別控制顯示/隱藏
        const firstMatrix = document.getElementById('firstMatrix');
        const secondMatrix = document.getElementById('secondMatrix');

        if (firstMatrix && secondMatrix) {
            firstMatrix.classList.toggle('active', activeType === 'first');
            secondMatrix.classList.toggle('active', activeType === 'second');
        }

        // 取得矩陣數據
        const matrixData = dataManager.getMatrixStatistics();
        
        // 渲染先手矩陣內容
        this.renderMatrixTable('firstMatrixTable', matrixData.first, '先手');
        this.renderMatrixStats('firstMatrixStats', matrixData.first, '先手');
        
        // 渲染後手矩陣內容
        this.renderMatrixTable('secondMatrixTable', matrixData.second, '後手');
        this.renderMatrixStats('secondMatrixStats', matrixData.second, '後手');
    }

    // 渲染矩陣表格
    renderMatrixTable(tableId, matrixData, turnType) {
        const container = document.getElementById(tableId);
        if (!container) return;

        let html = '<table class="matrix-table-content">';

        // 表頭
        html += '<thead><tr><th class="matrix-header-corner">我方\\對手</th>';
        CLASS_LIST.forEach(opponentClass => {
            html += `<th class="matrix-header">${opponentClass}</th>`;
        });
        html += '</tr></thead>';

        // 表身
        html += '<tbody>';
        CLASS_LIST.forEach(myClass => {
            html += `<tr><td class="matrix-row-header">${myClass}</td>`;
            CLASS_LIST.forEach(opponentClass => {
                const data = matrixData[myClass][opponentClass];
                const winRate = data.winRate;
                const total = data.total;

                let cellClass = 'matrix-cell';
                let displayValue = '--';

                if (total > 0) {
                    displayValue = `${winRate}%`;
                    if (winRate >= 70) {
                        cellClass += ' high-winrate';
                    } else if (winRate >= 50) {
                        cellClass += ' medium-winrate';
                    } else {
                        cellClass += ' low-winrate';
                    }
                }

                html += `<td class="${cellClass}" title="${myClass} vs ${opponentClass} (${turnType}): ${data.wins}勝/${total}場">${displayValue}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        container.innerHTML = html;
    }

    // 渲染矩陣統計信息
    renderMatrixStats(statsId, matrixData, turnType) {
        const container = document.getElementById(statsId);
        if (!container) return;

        let totalGames = 0;
        let totalWins = 0;
        let bestMatchups = [];
        let worstMatchups = [];

        // 計算統計
        CLASS_LIST.forEach(myClass => {
            CLASS_LIST.forEach(opponentClass => {
                const data = matrixData[myClass][opponentClass];
                if (data.total > 0) {
                    totalGames += data.total;
                    totalWins += data.wins;

                    if (data.total >= 3) { // 至少3場才納入最佳/最差統計
                        const matchup = {
                            vs: `${myClass} vs ${opponentClass}`,
                            winRate: data.winRate,
                            record: `${data.wins}勝/${data.total}場`
                        };

                        if (data.winRate >= 70) {
                            bestMatchups.push(matchup);
                        } else if (data.winRate < 40) {
                            worstMatchups.push(matchup);
                        }
                    }
                }
            });
        });

        const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

        // 排序
        bestMatchups.sort((a, b) => b.winRate - a.winRate);
        worstMatchups.sort((a, b) => a.winRate - b.winRate);

        let html = `
            <div class="matrix-stats-content">
                <h4>${turnType}整體統計</h4>
                <p>總場次：${totalGames}場 | 總勝率：${overallWinRate}%</p>
        `;

        if (bestMatchups.length > 0) {
            html += `
                <div class="matchup-section">
                    <h5 style="color: #4CAF50;">🔥 優勢對戰 (≥70%)</h5>
                    <ul>
            `;
            bestMatchups.slice(0, 5).forEach(matchup => {
                html += `<li>${matchup.vs}: ${matchup.winRate}% (${matchup.record})</li>`;
            });
            html += '</ul></div>';
        }

        if (worstMatchups.length > 0) {
            html += `
                <div class="matchup-section">
                    <h5 style="color: #F44336;">⚠️ 劣勢對戰 (<40%)</h5>
                    <ul>
            `;
            worstMatchups.slice(0, 5).forEach(matchup => {
                html += `<li>${matchup.vs}: ${matchup.winRate}% (${matchup.record})</li>`;
            });
            html += '</ul></div>';
        }

        html += '</div>';
        container.innerHTML = html;
    }

    // 顯示Toast訊息
    showToast(message, type = 'info') {
        // 移除現有的toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 創建新的toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // 添加到頁面
        document.body.appendChild(toast);

        // 顯示動畫
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // 自動隱藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    // 顯示保存狀態
    showSaveStatus(message, color) {
        this.showToast(message, color.includes('4caf50') ? 'success' : color.includes('f44336') ? 'error' : 'info');
    }
}
