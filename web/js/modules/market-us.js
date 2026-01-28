class USMarketController {
    async loadData() {
        console.log('📊 加载美国市场数据...');
        const promises = [
            this.loadUSFearGreed(),
            this.loadUSLeaders(),
            this.loadUSMarketHeat(),
            this.loadUSBondYields()
        ];
        await Promise.allSettled(promises);
    }

    async loadUSFearGreed() {
        try {
            // Load both datasets in parallel
            const [cnnData, customData] = await Promise.all([
                api.getUSFearGreed().catch(e => ({ error: 'CNN数据加载失败' })),
                api.getUSCustomFearGreed().catch(e => ({ error: 'Custom数据加载失败' }))
            ]);

            this.renderUSFearGreed(cnnData, customData);

            if (window.lucide) lucide.createIcons();

        } catch (error) {
            console.error('加载美国市场恐慌指数失败:', error);
            utils.renderError('us-cnn-fear', '美国市场恐慌指数加载失败');
            utils.renderError('us-custom-fear', '美国市场恐慌指数加载失败');
        }
    }

    async loadUSMarketHeat() {
        try {
            const data = await api.getUSMarketHeat();
            this.renderUSMarketHeat(data);
        } catch (error) {
            console.error('加载美国市场热度失败:', error);
            utils.renderError('market-us-heat', '美国市场热度加载失败');
        }
    }

    async loadUSBondYields() {
        try {
            const data = await api.getUSBondYields();
            this.renderUSBondYields(data);
        } catch (error) {
            console.error('加载美债数据失败:', error);
            utils.renderError('us-treasury', '美债数据加载失败');
        }
    }

    async loadUSLeaders() {
        try {
            const data = await api.getUSMarketLeaders();
            if (data.error) {
                console.error('加载美国市场领涨板块API返回错误:', data.error);
                utils.renderError('us-gainers', '排行数据暂时不可用');
                return;
            }
            this.renderUSLeaders(data);
        } catch (error) {
            console.error('加载美国市场领涨板块失败:', error);
            utils.renderError('us-gainers', '排行榜加载失败');
        }
    }

    // Helper for indicator names
    // Helper for indicator names
    getIndicatorName(key) {
        const names = {
            // Backend keys
            vix: 'VIX波动率',
            sp500_momentum: '标普动量',
            market_breadth: '市场广度',
            safe_haven: '避险需求',

            // Legacy/CNN concept keys
            junk_bond_demand: '垃圾债',
            market_volatility: '波动率',
            put_call_options: '期权',
            market_momentum: '动量',
            stock_price_strength: '股价',
            stock_price_breadth: '广度',
            safe_haven_demand: '避险'
        };
        return names[key] || key;
    }


    renderUSFearGreed(cnnData, customData) {
        // Render CNN
        const cnnContainer = document.getElementById('us-cnn-fear');
        if (cnnContainer) {
            // Center content
            cnnContainer.style.justifyContent = 'center';

            if (!cnnData || cnnData.error) {
                utils.renderError('us-cnn-fear', cnnData ? cnnData.error : '暂无数据');
            } else {
                // Bind CNN Info Button
                const infoBtn1 = document.getElementById('info-us-cnn');
                if (infoBtn1 && cnnData.explanation) {
                    infoBtn1.onclick = () => utils.showInfoModal('恐慌贪婪指数 (CNN)', cnnData.explanation);
                    infoBtn1.style.display = 'flex';
                }

                // Robust data extraction - 不使用默认值50
                const score = cnnData.score ?? cnnData.current_value;
                const level = cnnData.level || cnnData.current_level || '未知';
                const change = cnnData.change_pct ?? cnnData.change_1d ?? 0;

                // 如果没有分数，显示错误
                if (score == null) {
                    utils.renderError('us-cnn-fear', '恐慌指数数据不可用');
                } else {
                    cnnContainer.innerHTML = `
                        <div class="fg-gauge" id="us-cnn-gauge"></div>
                        <div class="fg-info" style="flex: 0 1 auto;">
    
                            <div class="fg-level">${level}</div>
                            <div class="fg-desc">变动: ${utils.formatChange(change).text}</div>
                        </div>
                    `;
                    if (window.charts) {
                        setTimeout(() => {
                            charts.createFearGreedGauge('us-cnn-gauge', { score, level });
                        }, 100);
                    }
                }
            }
        }

        // Render Custom
        const customContainer = document.getElementById('us-custom-fear');
        if (customContainer) {
            // Center content
            customContainer.style.justifyContent = 'center';

            if (!customData || customData.error) {
                utils.renderError('us-custom-fear', customData ? customData.error : '暂无数据');
            } else {
                // Bind Custom Info Button
                const infoBtn2 = document.getElementById('info-us-custom');
                if (infoBtn2 && customData.explanation) {
                    infoBtn2.onclick = () => utils.showInfoModal('恐慌贪婪指数 (Custom)', customData.explanation);
                    infoBtn2.style.display = 'flex';
                }

                const score = customData.score;
                const level = customData.level || '未知';
                const indicators = customData.indicators;

                // 如果没有分数，显示错误
                if (score == null) {
                    utils.renderError('us-custom-fear', '恐慌指数数据不可用');
                } else {
                    let contentHtml = `
                        <div class="fg-gauge" id="us-custom-gauge"></div>
                        <div class="fg-info" style="flex: 0 1 auto;">
    
                            <div class="fg-level">${level}</div>
                            <div class="fg-desc">${customData.description || ''}</div>
                    `;

                    // Add indicators if available (using unified 'heat-tag' style)
                    if (indicators) {
                        contentHtml += `<div class="fg-desc" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 8px;">`;
                        for (const [key, val] of Object.entries(indicators)) {
                            if (typeof val !== 'object' || !val.score) continue;
                            contentHtml += `
                                <span class="heat-tag heat-gray" title="${this.getIndicatorName(key)}: ${Math.round(val.score)}">
                                   ${this.getIndicatorName(key)}
                                </span>
                             `;
                        }
                        contentHtml += `</div>`;
                    }

                    contentHtml += '</div>'; // Close fg-info

                    customContainer.innerHTML = contentHtml;
                    if (window.charts) {
                        setTimeout(() => {
                            charts.createFearGreedGauge('us-custom-gauge', customData);
                        }, 100);
                    }
                }
            }
        }
    }

    renderUSMarketHeat(data) {
        const container = document.getElementById('market-us-heat');
        if (!container) return;

        // Handle error/warming_up response
        if (data && data.error) {
            container.classList.remove('heat-grid');
            utils.renderError('market-us-heat', data.error);
            return;
        }

        if (!data || !Array.isArray(data) || data.length === 0) {
            container.classList.remove('heat-grid');
            utils.renderError('market-us-heat', '暂无数据');
            return;
        }

        // Restore grid layout
        container.classList.add('heat-grid');

        const html = data.map(item => {
            const change = item.change_pct;
            const changeClass = change >= 0 ? 'text-up-us' : 'text-down-us';

            return `
                <div class="heat-cell">
                    <div class="item-sub">${item.name}</div>
                    <div class="heat-val ${changeClass}">${utils.formatPercentage(change)}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        container.className = 'heat-grid';
    }

    renderUSBondYields(data) {
        const container = document.getElementById('us-treasury');
        if (!container) return;

        // Handle error/warming_up response
        if (data && data.error) {
            utils.renderError('us-treasury', data.error);
            return;
        }

        if (!data) {
            utils.renderError('us-treasury', '暂无数据');
            return;
        }

        // Bind Info Button
        const infoBtn = document.getElementById('info-us-treasury');
        if (infoBtn) {
            infoBtn.onclick = () => utils.showInfoModal('美债收益率指标说明',
                `1. 收益率曲线倒挂 (10Y-2Y)
当2年期(短期)收益率高于10年期(长期)时，称为倒挂。这是历史上预测经济衰退最准确的指标之一。

2. 10年期国债收益率 (10Y)
全球资产定价的锚。收益率过高(>4.5%)会显著压制权益类资产估值。

3. 变动速率
短期内收益率的剧烈飙升往往伴随着市场的恐慌性抛售（股债双杀）。

4. 市场利率平稳
当收益率曲线未倒挂、长期利率未过高且单日波动较小时，显示为平稳。这是利好股市估值的舒适区间。

5. 30年期国债 (30Y)
反映市场对超长期通胀和国家债务风险的看法。若显著高于10年期，通常隐含了期限溢价（Term Premium）的上升。`);
            infoBtn.style.display = 'flex';
        }

        // Support both old (Array) and new (Object) formats
        let metrics = [];
        let analysis = null;

        if (Array.isArray(data)) {
            metrics = data;
        } else if (data.metrics) {
            metrics = data.metrics;
            analysis = data.analysis;
        } else {
            // Fallback for unexpected format
            utils.renderError('us-treasury', '数据格式错误');
            return;
        }

        if (metrics.length === 0) {
            utils.renderError('us-treasury', '暂无数据');
            return;
        }

        // 提取关键指标以便特定布局
        const tenYear = metrics.find(m => m.name.includes('10年'));
        const spread = metrics.find(m => m.is_spread);
        const twoYear = metrics.find(m => m.name.includes('2年'));
        const thirtyYear = metrics.find(m => m.name.includes('30年'));

        // 辅助函数：生成网格单元格
        const renderCell = (item, isPrimary = false) => {
            if (!item) return '';

            // 颜色逻辑: 
            // 收益率: US Market Logic (Up=Green, Down=Red) is for prices. 
            // For Yields in US context: 
            // Rising Yields = Bad for Stocks (Red)? Or Rising = Green?
            // Usually, Financial Data Terminals show Up=Green for Yields too.
            // Let's stick to standard change format.
            let changeHtml = '';
            if (item.change !== undefined) {
                const changeClass = item.change > 0 ? 'text-up-us' : item.change < 0 ? 'text-down-us' : '';
                const sign = item.change > 0 ? '+' : '';
                changeHtml = `<div class="item-change ${changeClass}">${sign}${item.change}</div>`; // BP or raw value? API returns raw value change
            }

            // 特殊处理利差颜色
            let valClass = '';
            if (item.is_spread) {
                // 利差倒挂(负数)为警示红
                valClass = item.value < 0 ? 'text-down-us' : 'text-up-us';
                changeHtml = `<div class="item-sub">衰退预警</div>`; // Hardcode styling for spread
            }

            return `
                <div class="heat-cell" style="${isPrimary ? 'background: var(--bg-subtle);' : ''}">
                    <div class="item-sub">${item.name}</div>
                    <div class="heat-val ${valClass}" style="font-size: ${isPrimary ? '18px' : '16px'}">${item.value}${item.suffix || ''}</div>
                    ${changeHtml}
                </div>
            `;
        };

        let gridHtml = '';

        // 如果找到了特定的 Key Items，使用优化的 2x2 布局
        if (tenYear && spread && twoYear && thirtyYear) {
            gridHtml = `
                <div class="heat-grid">
                    ${renderCell(tenYear, true)}
                    ${renderCell(spread, true)}
                    ${renderCell(twoYear)}
                    ${renderCell(thirtyYear)}
                </div>
            `;
        } else {
            // Fallback to simple grid for whatever metrics we have
            gridHtml = `
                <div class="heat-grid">
                    ${metrics.map(m => renderCell(m)).join('')}
                </div>
            `;
        }

        let analysisHtml = '';
        if (analysis && analysis.text) {
            let colorStyle = 'color: var(--text-secondary);';
            if (analysis.level === 'danger') colorStyle = 'color: var(--accent-red); font-weight: 600;';
            if (analysis.level === 'warning') colorStyle = 'color: #f59e0b; font-weight: 600;';

            analysisHtml = `
                <div style="padding: 10px; text-align: center; font-size: 12px; ${colorStyle} border-top: 1px solid var(--border-light); margin-top: -1px; background: #fff; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px;">
                    ${analysis.text}
                </div>
             `;
        }

        container.innerHTML = gridHtml + analysisHtml;
        container.style.display = 'block'; // Ensure container is block for grid
    }

    renderUSLeaders(data) {
        const container = document.getElementById('us-gainers');

        // Hide compatibility container if exists
        const container2 = document.getElementById('us-sp500');
        if (container2) {
            container2.style.display = 'none';
        }

        if (!container) return;

        const indices = data.indices || [];
        if (indices.length === 0) {
            container.classList.remove('heat-grid');
            container.classList.add('list-container');
            utils.renderError('us-gainers', '暂无指数数据');
            return;
        }

        // Switch to grid layout
        container.classList.remove('list-container');
        container.classList.add('heat-grid');
        container.style.gridTemplateColumns = 'repeat(2, 1fr)';

        const html = indices.map(item => {
            const changeVal = item.change_pct;
            // US Colors: Green Up, Red Down (Handled by styles.css logic via classes? 
            // text-up-us is green, text-down-us is red.
            // But wait, CN/HK uses text-up (Red), text-down (Green).
            // US Market requires specific color logic.
            // utils.formatChange uses 'us' param to switch colors.
            // But here I am constructing manually.
            const changeClass = changeVal > 0 ? 'text-up-us' : changeVal < 0 ? 'text-down-us' : '';
            const sign = changeVal > 0 ? '+' : '';

            // Should verify if change_amount exists, if not calculate or hide
            const changeAmt = item.change_amount != null ? item.change_amount : (item.price * item.change_pct / 100);

            return `
                <div class="index-item">
                    <div class="index-name">${item.name}</div>
                    <div class="index-price ${changeClass}">${utils.formatNumber(item.price)}</div>
                    <div class="index-change ${changeClass}">
                        ${sign}${utils.formatNumber(changeAmt)} 
                        (${sign}${utils.formatPercentage(changeVal)})
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        container.classList.remove('loading');
    }
}
