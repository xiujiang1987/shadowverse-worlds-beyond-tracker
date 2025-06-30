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
            this.renderMatrix();
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
        
        // 檢查階級自動調整
        const oldRank = dataManager.currentRank;
        const newRank = RankManager.autoAdjustRank(
            stats.winRate, 
            stats.totalGames, 
            dataManager.currentRank, 
            stats.lastMatchResult
        );

        if (newRank !== dataManager.currentRank) {
            console.log(`分組自動調整：${dataManager.currentRank} → ${newRank} (勝率: ${stats.winRate}%, 最後一場: ${stats.lastMatchResult})`);
            dataManager.currentRank = newRank;
            dataManager.saveCurrentRank();
            RankManager.showRankChangeNotification(oldRank, newRank, stats.winRate);
        }

        // 更新顯示元素
        const currentRankLevel = RankManager.calculateRank(stats.currentBP);
        const streakText = stats.streak + (stats.streakType === '勝' ? '連勝' : '連敗');

        this.updateElement('currentBP', stats.currentBP.toLocaleString());
        this.updateElement('startingBP', dataManager.startingBP.toLocaleString());
        this.updateElement('currentRank', `${RANK_DATA[dataManager.currentRank].icon} ${RANK_DATA[dataManager.currentRank].name}`);
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

        const rank = RANK_DATA[dataManager.currentRank];
        const { status, statusClass, analysis } = RankManager.analyzeRankStatus(winRate, totalGames, dataManager.currentRank);
        
        // 設定進度條寬度
        rankProgress.style.width = winRate + '%';
        
        // 更新狀態顯示
        rankStatusText.textContent = status;
        rankStatusText.className = statusClass;
        rankAnalysis.textContent = analysis;
        
        // 更新預測
        const prediction = RankManager.generatePredictions(
            wins, totalGames, winRate, 
            rank.maintain, rank.danger, dataManager.currentRank
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
        const bpValue = bpChangeInput?.value.replace(/^\+/, ''); // 移除前導+號
        const bpChange = parseInt(bpValue) || 0;
        
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
        
        if (bpChange === 0) {
            alert('請輸入BP變化值！');
            bpChangeInput?.focus();
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
        const newRank = prompt('請選擇目標分組：\n' + ranks.join(', '), dataManager.playerData.targetRank);
        if (newRank !== null && ranks.includes(newRank.trim())) {
            this.editPlayerField('targetRank', null, 'targetRank', newRank.trim());
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

    exportPlayerProfile() {
        try {
            const playerDataText = JSON.stringify(dataManager.playerData, null, 2);
            const exportContent = `# Shadowverse: Worlds Beyond - 玩家資料\n\n${playerDataText}`;
            
            const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `shadowverse_player_profile_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSaveStatus('✅ 玩家資料已匯出', '#2196f3');
            console.log('玩家資料匯出成功');
        } catch (error) {
            this.showSaveStatus('❌ 匯出失敗', '#f44336');
            console.error('玩家資料匯出失敗:', error);
        }
    }

    // 編輯對戰記錄
    editBattle(battleId) {
        const battle = dataManager.getBattle(battleId);
        if (!battle) {
            this.showToast('找不到對戰記錄', 'error');
            return;
        }

        // 創建編輯對話框
        const dialogHtml = `
            <div style="background: #2a2a3e; padding: 20px; border-radius: 10px; color: white; max-width: 500px;">
                <h3 style="color: #ffd700; margin-top: 0;">編輯對戰記錄 #${battle.id}</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                    <div>
                        <label style="display: block; margin-bottom: 5px;">我的職業：</label>
                        <select id="editMyClass" style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;">
                            <option value="皇家" ${battle.myClass === '皇家' ? 'selected' : ''}>皇家</option>
                            <option value="精靈" ${battle.myClass === '精靈' ? 'selected' : ''}>精靈</option>
                            <option value="巫師" ${battle.myClass === '巫師' ? 'selected' : ''}>巫師</option>
                            <option value="龍" ${battle.myClass === '龍' ? 'selected' : ''}>龍</option>
                            <option value="夜魔" ${battle.myClass === '夜魔' ? 'selected' : ''}>夜魔</option>
                            <option value="主教" ${battle.myClass === '主教' ? 'selected' : ''}>主教</option>
                            <option value="復仇者" ${battle.myClass === '復仇者' ? 'selected' : ''}>復仇者</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px;">對手職業：</label>
                        <select id="editOpponentClass" style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;">
                            <option value="皇家" ${battle.opponentClass === '皇家' ? 'selected' : ''}>皇家</option>
                            <option value="精靈" ${battle.opponentClass === '精靈' ? 'selected' : ''}>精靈</option>
                            <option value="巫師" ${battle.opponentClass === '巫師' ? 'selected' : ''}>巫師</option>
                            <option value="龍" ${battle.opponentClass === '龍' ? 'selected' : ''}>龍</option>
                            <option value="夜魔" ${battle.opponentClass === '夜魔' ? 'selected' : ''}>夜魔</option>
                            <option value="主教" ${battle.opponentClass === '主教' ? 'selected' : ''}>主教</option>
                            <option value="復仇者" ${battle.opponentClass === '復仇者' ? 'selected' : ''}>復仇者</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px;">先手/後手：</label>
                        <select id="editTurnOrder" style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;">
                            <option value="" ${!battle.turnOrder ? 'selected' : ''}>未記錄</option>
                            <option value="先手" ${battle.turnOrder === '先手' ? 'selected' : ''}>先手</option>
                            <option value="後手" ${battle.turnOrder === '後手' ? 'selected' : ''}>後手</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px;">對戰結果：</label>
                        <select id="editResult" style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;">
                            <option value="勝" ${battle.result === '勝' ? 'selected' : ''}>勝</option>
                            <option value="敗" ${battle.result === '敗' ? 'selected' : ''}>敗</option>
                        </select>
                    </div>
                </div>
                
                <div style="margin: 15px 0;">
                    <label style="display: block; margin-bottom: 5px;">BP變化：</label>
                    <input type="number" id="editBpChange" value="${battle.bpChange}" 
                           style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;" />
                </div>
                
                <div style="text-align: right; margin-top: 20px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="padding: 8px 16px; margin-right: 10px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">取消</button>
                    <button onclick="saveEditBattle(${battleId})" 
                            style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 5px; cursor: pointer;">保存</button>
                </div>
            </div>
        `;
        
        this.showModal(dialogHtml);
    }

    // 刪除對戰記錄
    deleteBattle(battleId) {
        const battle = dataManager.getBattle(battleId);
        if (!battle) {
            this.showToast('找不到對戰記錄', 'error');
            return;
        }

        const confirmMessage = `確定要刪除以下對戰記錄嗎？\n\n` +
            `第${battle.id}場：${battle.myClass} vs ${battle.opponentClass} ` +
            `${battle.turnOrder || ''} ${battle.result} (${battle.bpChange > 0 ? '+' : ''}${battle.bpChange}BP)\n\n` +
            `注意：刪除後無法復原，相關的分組變動標記也會一併清除。`;

        if (confirm(confirmMessage)) {
            if (dataManager.deleteBattle(battleId)) {
                this.showToast('對戰記錄已刪除', 'success');
                this.updateStats();
                this.renderBattles();
                this.renderMatrix(); // 更新矩陣
            } else {
                this.showToast('刪除失敗', 'error');
            }
        }
    }

    // 保存編輯的對戰記錄
    saveEditBattle(battleId) {
        console.log('saveEditBattle called with battleId:', battleId);
        
        const myClassEl = document.getElementById('editMyClass');
        const opponentClassEl = document.getElementById('editOpponentClass');
        const turnOrderEl = document.getElementById('editTurnOrder');
        const resultEl = document.getElementById('editResult');
        const bpChangeEl = document.getElementById('editBpChange');
        
        console.log('Elements found:', {
            myClass: myClassEl?.value,
            opponentClass: opponentClassEl?.value,
            turnOrder: turnOrderEl?.value,
            result: resultEl?.value,
            bpChange: bpChangeEl?.value
        });
        
        if (!myClassEl || !opponentClassEl || !resultEl || !bpChangeEl) {
            console.error('某些表單元素未找到');
            alert('表單元素未找到，請重試');
            return;
        }
        
        const updatedData = {
            myClass: myClassEl.value,
            opponentClass: opponentClassEl.value,
            turnOrder: turnOrderEl?.value || null,
            result: resultEl.value,
            bpChange: parseInt(bpChangeEl.value)
        };

        console.log('Updated data:', updatedData);

        // 驗證BP變化
        if (isNaN(updatedData.bpChange)) {
            alert('請輸入有效的BP變化數值');
            return;
        }

        console.log('Calling dataManager.editBattle...');
        try {
            const success = dataManager.editBattle(battleId, updatedData);
            console.log('Edit result:', success);
            
            if (success) {
                this.showToast('對戰記錄已更新', 'success');
                this.updateStats();
                this.renderBattles();
                if (typeof this.renderMatrix === 'function') {
                    this.renderMatrix(); // 更新矩陣
                }
                
                // 更安全的關閉對話框方式
                const modal = document.querySelector('.edit-modal');
                if (modal) {
                    modal.remove();
                    console.log('Modal closed via .edit-modal class');
                } else {
                    // 備用方法：尋找包含編輯表單的對話框
                    const dialog = document.querySelector('[style*="position: fixed"]');
                    if (dialog) {
                        dialog.remove();
                        console.log('Modal closed via fixed position selector');
                    } else {
                        console.log('No modal found to close');
                    }
                }
            } else {
                this.showToast('更新失敗', 'error');
                console.error('dataManager.editBattle returned false');
            }
        } catch (error) {
            console.error('Error in editBattle:', error);
            this.showToast('更新時發生錯誤: ' + error.message, 'error');
        }
    }

    // 顯示模態對話框
    showModal(content) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.7); display: flex; align-items: center; 
            justify-content: center; z-index: 10000;
        `;
        modal.innerHTML = content;
        document.body.appendChild(modal);
        
        // 點擊背景關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 更新統計資訊（擴展原有方法）
    updateStats() {
        const stats = dataManager.getStatistics();
        
        // 檢查階級自動調整
        const oldRank = dataManager.currentRank;
        const newRank = RankManager.autoAdjustRank(
            stats.winRate, 
            stats.totalGames, 
            dataManager.currentRank, 
            stats.lastMatchResult
        );

        if (newRank !== dataManager.currentRank) {
            console.log(`分組自動調整：${dataManager.currentRank} → ${newRank} (勝率: ${stats.winRate}%, 最後一場: ${stats.lastMatchResult})`);
            dataManager.currentRank = newRank;
            dataManager.saveCurrentRank();
            RankManager.showRankChangeNotification(oldRank, newRank, stats.winRate);
        }

        // 更新顯示元素
        const currentRankLevel = RankManager.calculateRank(stats.currentBP);
        const streakText = stats.streak + (stats.streakType === '勝' ? '連勝' : '連敗');

        this.updateElement('currentBP', stats.currentBP.toLocaleString());
        this.updateElement('startingBP', dataManager.startingBP.toLocaleString());
        this.updateElement('currentRank', `${RANK_DATA[dataManager.currentRank].icon} ${RANK_DATA[dataManager.currentRank].name}`);
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

        const rank = RANK_DATA[dataManager.currentRank];
        const { status, statusClass, analysis } = RankManager.analyzeRankStatus(winRate, totalGames, dataManager.currentRank);
        
        // 設定進度條寬度
        rankProgress.style.width = winRate + '%';
        
        // 更新狀態顯示
        rankStatusText.textContent = status;
        rankStatusText.className = statusClass;
        rankAnalysis.textContent = analysis;
        
        // 更新預測
        const prediction = RankManager.generatePredictions(
            wins, totalGames, winRate, 
            rank.maintain, rank.danger, dataManager.currentRank
        );
        rankPrediction.innerHTML = prediction;
    }

    // 新增對戰記錄
    addBattle() {
        const myClass = document.getElementById('myClass')?.value;
        const opponentClass = document.getElementById('opponentClass')?.value;
        const turnOrder = document.getElementById('turnOrder')?.value;
        const result = document.getElementById('result')?.value;
        const bpChangeInput = document.getElementById('bpChange');
        const bpValue = bpChangeInput?.value.replace(/^\+/, ''); // 移除前導+號
        const bpChange = parseInt(bpValue) || 0;
        
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
        
        if (bpChange === 0) {
            alert('請輸入BP變化值！');
            bpChangeInput?.focus();
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
        const newRank = prompt('請選擇目標分組：\n' + ranks.join(', '), dataManager.playerData.targetRank);
        if (newRank !== null && ranks.includes(newRank.trim())) {
            this.editPlayerField('targetRank', null, 'targetRank', newRank.trim());
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

    exportPlayerProfile() {
        try {
            const playerDataText = JSON.stringify(dataManager.playerData, null, 2);
            const exportContent = `# Shadowverse: Worlds Beyond - 玩家資料\n\n${playerDataText}`;
            
            const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `shadowverse_player_profile_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSaveStatus('✅ 玩家資料已匯出', '#2196f3');
            console.log('玩家資料匯出成功');
        } catch (error) {
            this.showSaveStatus('❌ 匯出失敗', '#f44336');
            console.error('玩家資料匯出失敗:', error);
        }
    }

    // 編輯對戰記錄
    editBattle(battleId) {
        const battle = dataManager.getBattle(battleId);
        if (!battle) {
            this.showToast('找不到對戰記錄', 'error');
            return;
        }

        // 創建編輯對話框
        const dialogHtml = `
            <div style="background: #2a2a3e; padding: 20px; border-radius: 10px; color: white; max-width: 500px;">
                <h3 style="color: #ffd700; margin-top: 0;">編輯對戰記錄 #${battle.id}</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                    <div>
                        <label style="display: block; margin-bottom: 5px;">我的職業：</label>
                        <select id="editMyClass" style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;">
                            <option value="皇家" ${battle.myClass === '皇家' ? 'selected' : ''}>皇家</option>
                            <option value="精靈" ${battle.myClass === '精靈' ? 'selected' : ''}>精靈</option>
                            <option value="巫師" ${battle.myClass === '巫師' ? 'selected' : ''}>巫師</option>
                            <option value="龍" ${battle.myClass === '龍' ? 'selected' : ''}>龍</option>
                            <option value="夜魔" ${battle.myClass === '夜魔' ? 'selected' : ''}>夜魔</option>
                            <option value="主教" ${battle.myClass === '主教' ? 'selected' : ''}>主教</option>
                            <option value="復仇者" ${battle.myClass === '復仇者' ? 'selected' : ''}>復仇者</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px;">對手職業：</label>
                        <select id="editOpponentClass" style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;">
                            <option value="皇家" ${battle.opponentClass === '皇家' ? 'selected' : ''}>皇家</option>
                            <option value="精靈" ${battle.opponentClass === '精靈' ? 'selected' : ''}>精靈</option>
                            <option value="巫師" ${battle.opponentClass === '巫師' ? 'selected' : ''}>巫師</option>
                            <option value="龍" ${battle.opponentClass === '龍' ? 'selected' : ''}>龍</option>
                            <option value="夜魔" ${battle.opponentClass === '夜魔' ? 'selected' : ''}>夜魔</option>
                            <option value="主教" ${battle.opponentClass === '主教' ? 'selected' : ''}>主教</option>
                            <option value="復仇者" ${battle.opponentClass === '復仇者' ? 'selected' : ''}>復仇者</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px;">先手/後手：</label>
                        <select id="editTurnOrder" style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;">
                            <option value="" ${!battle.turnOrder ? 'selected' : ''}>未記錄</option>
                            <option value="先手" ${battle.turnOrder === '先手' ? 'selected' : ''}>先手</option>
                            <option value="後手" ${battle.turnOrder === '後手' ? 'selected' : ''}>後手</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px;">對戰結果：</label>
                        <select id="editResult" style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;">
                            <option value="勝" ${battle.result === '勝' ? 'selected' : ''}>勝</option>
                            <option value="敗" ${battle.result === '敗' ? 'selected' : ''}>敗</option>
                        </select>
                    </div>
                </div>
                
                <div style="margin: 15px 0;">
                    <label style="display: block; margin-bottom: 5px;">BP變化：</label>
                    <input type="number" id="editBpChange" value="${battle.bpChange}" 
                           style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;" />
                </div>
                
                <div style="text-align: right; margin-top: 20px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="padding: 8px 16px; margin-right: 10px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">取消</button>
                    <button onclick="saveEditBattle(${battleId})" 
                            style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 5px; cursor: pointer;">保存</button>
                </div>
            </div>
        `;
        
        this.showModal(dialogHtml);
    }

    // 刪除對戰記錄
    deleteBattle(battleId) {
        const battle = dataManager.getBattle(battleId);
        if (!battle) {
            this.showToast('找不到對戰記錄', 'error');
            return;
        }

        const confirmMessage = `確定要刪除以下對戰記錄嗎？\n\n` +
            `第${battle.id}場：${battle.myClass} vs ${battle.opponentClass} ` +
            `${battle.turnOrder || ''} ${battle.result} (${battle.bpChange > 0 ? '+' : ''}${battle.bpChange}BP)\n\n` +
            `注意：刪除後無法復原，相關的分組變動標記也會一併清除。`;

        if (confirm(confirmMessage)) {
            if (dataManager.deleteBattle(battleId)) {
                this.showToast('對戰記錄已刪除', 'success');
                this.updateStats();
                this.renderBattles();
                this.renderMatrix(); // 更新矩陣
            } else {
                this.showToast('刪除失敗', 'error');
            }
        }
    }

    // 顯示模態對話框
    showModal(content) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.7); display: flex; align-items: center; 
            justify-content: center; z-index: 10000;
        `;
        modal.innerHTML = content;
        document.body.appendChild(modal);
        
        // 點擊背景關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 切換分組變動標記
    toggleRankChange(battleIndex, battleId) {
        const existingChange = dataManager.rankChangeHistory.find(change => change.battleId === battleId);
        
        if (existingChange) {
            // 移除標記
            dataManager.removeRankChange(existingChange.id);
            this.showToast('已移除分組變動標記', 'info');
        } else {
            // 新增標記
            this.promptRankChange(battleIndex, battleId);
        }
        
        this.renderBattles();
    }

    // 提示輸入分組變動詳情
    promptRankChange(battleIndex, battleId) {
        const battle = dataManager.battleData[battleIndex];
        if (!battle) return;

        // 計算當時的統計數據
        const battlesTillNow = dataManager.battleData.slice(0, battleIndex + 1);
        const wins = battlesTillNow.filter(b => b.result === '勝').length;
        const totalGames = battlesTillNow.length;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

        const currentRank = dataManager.currentRank;
        
        // 讓用戶選擇變動前後的分組
        const rankOptions = ['綠寶石', '黃寶石', '紅寶石', '藍寶石', '鑽石'];
        
        let dialogHtml = `
            <div style="background: #2a2a3e; padding: 20px; border-radius: 10px; color: white; max-width: 400px;">
                <h3 style="color: #ffd700; margin-top: 0;">分組變動標記</h3>
                <p><strong>第${battleIndex + 1}場：</strong>${battle.myClass} vs ${battle.opponentClass} ${battle.turnOrder || ''} ${battle.result}</p>
                <p><strong>當時狀態：</strong>勝率 ${winRate}% (${wins}勝/${totalGames-wins}敗)</p>
                
                <div style="margin: 15px 0;">
                    <label style="display: block; margin-bottom: 5px;">變動前分組：</label>
                    <select id="fromRank" style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;">
                        ${rankOptions.map(rank => `<option value="${rank}" ${rank === currentRank ? 'selected' : ''}>${rank}</option>`).join('')}
                    </select>
                </div>
                
                <div style="margin: 15px 0;">
                    <label style="display: block; margin-bottom: 5px;">變動後分組：</label>
                    <select id="toRank" style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;">
                        ${rankOptions.map(rank => `<option value="${rank}">${rank}</option>`).join('')}
                    </select>
                </div>
                
                <div style="margin: 15px 0;">
                    <label style="display: block; margin-bottom: 5px;">變動原因：</label>
                    <input type="text" id="changeReason" placeholder="例如：連敗掉級、勝率回升升級等" 
                           style="width: 100%; padding: 8px; background: #1a1a2e; color: white; border: 1px solid #444; border-radius: 5px;" />
                </div>
                
                <div style="text-align: right; margin-top: 20px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="padding: 8px 16px; margin-right: 10px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">取消</button>
                    <button onclick="confirmRankChange(${battleIndex}, ${battleId})" 
                            style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">確認</button>
                </div>
            </div>
        `;
        
        // 創建模態對話框
        this.showModal(dialogHtml);
    }

    // 確認分組變動記錄
    confirmRankChange(battleIndex, battleId) {
        const fromRank = document.getElementById('fromRank').value;
        const toRank = document.getElementById('toRank').value;
        const reason = document.getElementById('changeReason').value || '手動標記';
        
        if (fromRank === toRank) {
            alert('變動前後分組相同，請重新選擇');
            return;
        }
        
        // 計算當時的統計數據
        const battlesTillNow = dataManager.battleData.slice(0, battleIndex + 1);
        const wins = battlesTillNow.filter(b => b.result === '勝').length;
        const totalGames = battlesTillNow.length;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
        
        const changeRecord = dataManager.recordRankChange(battleIndex, fromRank, toRank, winRate, totalGames, reason);
        
        if (changeRecord) {
            uiController.showToast(`已標記分組變動：${fromRank} → ${toRank}`, 'success');
            uiController.renderBattles();
        }
        
        // 關閉對話框
        document.querySelector('[style*="position: fixed"]').remove();
    }

    // 匯出分組變動分析
    exportRankChangeAnalysis() {
        try {
            const analysisText = dataManager.exportRankChangeAnalysis();
            const blob = new Blob([analysisText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `shadowverse_rank_analysis_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('分組變動分析已匯出', 'success');
        } catch (error) {
            this.showToast('匯出失敗：' + error.message, 'error');
        }
    }

    // 清除所有數據
    clearAllData() {
        if (confirm('確定要清除所有對戰數據嗎？此操作無法復原！')) {
            dataManager.clearAllBattles();
            this.updateStats();
            this.renderBattles();
        }
    }

    // 導出數據
    exportData() {
        const exportText = dataManager.exportData();
        const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `闇影詩章_凌越世界_對戰紀錄_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 處理檔案匯入
    importFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const success = dataManager.parseImportData(e.target.result);
                if (success) {
                    this.updateStats();
                    this.renderBattles();
                    alert('數據匯入成功！');
                }
            } catch (error) {
                alert('匯入失敗：' + error.message);
            }
        };
        reader.readAsText(file, 'UTF-8');
    }

    // 綁定事件監聽器
    bindEvents() {
        // 結果變更自動建議BP值
        const resultSelect = document.getElementById('result');
        if (resultSelect) {
            resultSelect.addEventListener('change', (e) => {
                const result = e.target.value;
                const suggestedBP = result === '勝' ? CONFIG.DEFAULTS.WIN_BP : CONFIG.DEFAULTS.LOSE_BP;
                const bpChangeInput = document.getElementById('bpChange');
                if (bpChangeInput) {
                    bpChangeInput.placeholder = `建議值: +${suggestedBP}`;
                    bpChangeInput.value = suggestedBP;
                    // 自動選中輸入框內容，方便用戶修改
                    bpChangeInput.select();
                }
            });
        }

        // 先手後手選擇Enter鍵處理
        const turnOrderSelect = document.getElementById('turnOrder');
        if (turnOrderSelect) {
            turnOrderSelect.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // 移動焦點到結果選擇
                    document.getElementById('result')?.focus();
                }
            });
        }

        // 結果選擇Enter鍵處理
        if (resultSelect) {
            resultSelect.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // 移動焦點到BP輸入框
                    document.getElementById('bpChange')?.focus();
                }
            });
        }

        // BP變化輸入框事件處理
        const bpChangeInput = document.getElementById('bpChange');
        if (bpChangeInput) {
            // Enter鍵提交功能
            bpChangeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addBattle();
                }
            });

            // 輸入驗證和錯誤修改支援
            bpChangeInput.addEventListener('input', (e) => {
                const value = e.target.value;
                const numValue = parseInt(value);
                
                // 移除之前的錯誤樣式
                e.target.classList.remove('error', 'warning');
                
                // 驗證輸入值
                if (value && isNaN(numValue)) {
                    e.target.classList.add('error');
                    e.target.title = '請輸入有效的數字';
                } else if (numValue && (numValue < -1000 || numValue > 1000)) {
                    e.target.classList.add('warning');
                    e.target.title = '數值似乎過大，請確認是否正確';
                } else {
                    e.target.title = '輸入BP變化值，按Enter提交';
                }
            });

            // 焦點事件處理
            bpChangeInput.addEventListener('focus', (e) => {
                // 獲得焦點時選中全部內容，方便修改
                setTimeout(() => e.target.select(), 0);
            });

            // 失去焦點時驗證
            bpChangeInput.addEventListener('blur', (e) => {
                const value = e.target.value;
                if (value && !isNaN(parseInt(value))) {
                    // 格式化數值顯示
                    const numValue = parseInt(value);
                    e.target.value = numValue > 0 ? `+${numValue}` : numValue.toString();
                }
            });
        }

        // 拖拽功能
        const importArea = document.getElementById('importArea');
        if (importArea) {
            importArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                importArea.classList.add('dragover');
            });
            
            importArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                importArea.classList.remove('dragover');
            });
            
            importArea.addEventListener('drop', (e) => {
                e.preventDefault();
                importArea.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].type === 'text/plain') {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const success = dataManager.parseImportData(event.target.result);
                            if (success) {
                                this.updateStats();
                                this.renderBattles();
                                alert('數據匯入成功！');
                            }
                        } catch (error) {
                            alert('匯入失敗：' + error.message);
                        }
                    };
                    reader.readAsText(files[0], 'UTF-8');
                } else {
                    alert('請拖放文字檔案(.txt)');
                }
            });
        }
    }

    // 輔助方法：更新元素內容
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
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

    // 顯示矩陣類型（先手/後手）
    showMatrixType(type) {
        // 切換按鈕狀態
        document.querySelectorAll('.matrix-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (type === 'first') {
            document.getElementById('firstMatrixBtn').classList.add('active');
            document.getElementById('firstMatrix').classList.add('active');
            document.getElementById('secondMatrix').classList.remove('active');
        } else {
            document.getElementById('secondMatrixBtn').classList.add('active');
            document.getElementById('secondMatrix').classList.add('active');
            document.getElementById('firstMatrix').classList.remove('active');
        }
        
        this.renderMatrix();
    }

    // 渲染對戰矩陣
    renderMatrix() {
        const matrixData = dataManager.getMatrixStatistics();
        
        // 渲染先手矩陣
        this.renderMatrixTable('firstMatrixTable', matrixData.first, '先手');
        this.renderMatrixStats('firstMatrixStats', matrixData.first, '先手');
        
        // 渲染後手矩陣
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
}

// 全域UI控制器實例
const uiController = new UIController();

// 全域函數（保持向後兼容）
function showPanel(panelName) {
    uiController.showPanel(panelName);
}

function addBattle() {
    uiController.addBattle();
}

function editStartingBP() {
    uiController.editStartingBP();
}

function editCurrentRank() {
    uiController.editCurrentRank();
}

function editPlayerName() {
    uiController.editPlayerName();
}

function editGameId() {
    uiController.editGameId();
}

function editMainClass() {
    uiController.editMainClass();
}

function editTargetRank() {
    uiController.editTargetRank();
}

function clearAllData() {
    uiController.clearAllData();
}

function exportData() {
    uiController.exportData();
}

function importFromFile(event) {
    uiController.importFromFile(event);
}

// 玩家資料管理全域函數
function savePlayerProfile() {
    uiController.savePlayerProfile();
}

function resetPlayerProfile() {
    uiController.resetPlayerProfile();
}

function exportPlayerProfile() {
    uiController.exportPlayerProfile();
}

// 矩陣管理全域函數
function showMatrixType(type) {
    uiController.showMatrixType(type);
}

// 分組變動管理全域函數
function toggleRankChange(battleIndex, battleId) {
    uiController.toggleRankChange(battleIndex, battleId);
}

function confirmRankChange(battleIndex, battleId) {
    uiController.confirmRankChange(battleIndex, battleId);
}

function exportRankChangeAnalysis() {
    uiController.exportRankChangeAnalysis();
}

// 對戰記錄編輯全域函數
function editBattle(battleId) {
    uiController.editBattle(battleId);
}

function deleteBattle(battleId) {
    uiController.deleteBattle(battleId);
}

function saveEditBattle(battleId) {
    console.log('Global saveEditBattle called with battleId:', battleId);
    try {
        uiController.saveEditBattle(battleId);
    } catch (error) {
        console.error('Error in global saveEditBattle:', error);
        alert('保存失敗：' + error.message);
    }
}
