// 主应用程序

class App {
    constructor() {
        this.currentTab = 'market-cn';
        this.lastUpdateTime = null;
        this.lastUpdateTime = null;
        this.isRefreshing = false;

        this.init();
    }

    async init() {
        console.log('🚀 x-analytics 启动中...');

        // 设置事件监听器
        this.setupEventListeners();



        // 初始化标签切换
        this.initTabSwitching();

        // 初始化卡片标签切换
        this.initCardTabs();

        // 初始化工具提示
        this.initTooltips();

        // 加载初始数据
        await this.loadInitialData();

        console.log('✅ x-analytics 启动完成');
    }

    setupEventListeners() {
        // 窗口大小变化
        window.addEventListener('resize', utils.debounce(() => {
            if (window.charts) {
                window.charts.resize();
            }
        }, 250));



        // 键盘快捷键
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'r':
                        event.preventDefault();
                        this.refreshCurrentTab();
                        break;
                    case '1':
                        event.preventDefault();
                        this.switchTab('market-cn');
                        break;
                    case '2':
                        event.preventDefault();
                        this.switchTab('market-us');
                        break;
                    case '3':
                        event.preventDefault();
                        this.switchTab('metals');
                        break;
                }
            }
        });
    }



    initTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // 更新按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });

        this.currentTab = tabId;

        // 更新URL
        utils.setUrlParam('tab', tabId);

        // 刷新当前标签数据
        this.refreshCurrentTab();
    }

    initCardTabs() {
        const cardTabs = document.querySelectorAll('.card-tab');

        cardTabs.forEach(tab => {
            tab.addEventListener('click', (event) => {
                event.preventDefault();

                const targetId = tab.dataset.target;
                const card = tab.closest('.card');

                if (!card || !targetId) {
                    console.log('Card tab click: missing card or targetId', { card, targetId });
                    return;
                }

                console.log('Card tab clicked:', targetId);

                // 更新标签状态 - 在同一个card中的所有tabs
                card.querySelectorAll('.card-tab').forEach(t => {
                    t.classList.remove('active');
                });
                tab.classList.add('active');

                // 更新内容显示 - 在同一个card中查找所有内容容器
                card.querySelectorAll('.leaders-list, .fear-greed-container, [id^="us-"], [id^="cn-"]').forEach(content => {
                    content.classList.remove('active');
                });

                // 激活目标元素
                const targetElement = card.querySelector(`#${targetId}`);
                if (targetElement) {
                    targetElement.classList.add('active');
                    console.log('Activated target element:', targetId);
                } else {
                    console.error('Target element not found:', targetId);
                }
            });
        });
    }

    initTooltips() {
        const infoButtons = document.querySelectorAll('.info-btn');
        const tooltip = document.getElementById('tooltip');

        if (!tooltip) return;

        infoButtons.forEach(btn => {
            const showTooltip = (event) => {
                const text = btn.dataset.tooltip;
                if (!text) return;

                tooltip.textContent = text;
                tooltip.classList.add('show');

                const rect = btn.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - 10}px`;
                tooltip.style.transform = 'translate(-50%, -100%)';
            };

            const hideTooltip = () => {
                tooltip.classList.remove('show');
            };

            if (utils.isTouchDevice()) {
                btn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    showTooltip(event);
                    setTimeout(hideTooltip, 3000);
                });
                document.addEventListener('click', hideTooltip);
            } else {
                btn.addEventListener('mouseenter', showTooltip);
                btn.addEventListener('mouseleave', hideTooltip);
            }
        });
    }

    async loadInitialData() {
        // 从URL参数获取初始标签
        const urlTab = utils.getUrlParam('tab');
        if (urlTab && ['market-cn', 'market-us', 'metals'].includes(urlTab)) {
            // 只更新UI状态，不触发数据加载
            this.currentTab = urlTab;

            // 更新按钮状态
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === urlTab);
            });

            // 更新内容显示
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === urlTab);
            });

            // 更新URL
            utils.setUrlParam('tab', urlTab);
        }

        // 加载当前标签数据（只调用一次）
        await this.refreshCurrentTab();
    }

    async refreshCurrentTab() {
        if (!navigator.onLine) {
            console.log('离线状态，跳过数据刷新');
            return;
        }

        // 防止重复调用
        if (this.isRefreshing) {
            console.log('数据刷新中，跳过重复请求');
            // utils.showNotification('正在刷新中，请稍候...', 'info');
            return;
        }

        this.isRefreshing = true;

        // 更新按钮状态 - 获取当前激活标签页下的刷新按钮
        const activeTab = document.querySelector('.tab-content.active');
        const refreshBtn = activeTab ? activeTab.querySelector('.refresh-btn') : null;
        let originalText = '';

        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.classList.add('refreshing');
            const icon = refreshBtn.querySelector('i');
            if (icon) icon.classList.add('spin');

            // 保存并更新文本
            originalText = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<i data-lucide="loader-2" class="spin" width="14"></i> 刷新中...';
            if (window.lucide) lucide.createIcons();
        }

        try {
            switch (this.currentTab) {
                case 'market-cn':
                    await this.loadCNMarketData();
                    break;
                case 'market-us':
                    await this.loadUSMarketData();
                    break;
                case 'metals':
                    await this.loadMetalsData();
                    break;
            }

            this.updateGlobalTime();
            // 如果有刷新按钮，提示成功 -> 用户要求移除弹窗
            // if (refreshBtn) {
            //     utils.showNotification('刷新成功', 'success');
            // }
        } catch (error) {
            console.error('刷新数据失败:', error);
            utils.showNotification('数据刷新失败', 'error');
        } finally {
            this.isRefreshing = false;

            // 恢复按钮状态
            if (refreshBtn && originalText) {
                // 延迟一小会儿恢复，让用户看清成功状态
                setTimeout(() => {
                    refreshBtn.disabled = false;
                    refreshBtn.classList.remove('refreshing');
                    refreshBtn.innerHTML = originalText;
                    if (window.lucide) lucide.createIcons();
                }, 500);
            }
        }
    }

    async loadCNMarketData() {
        console.log('📊 加载沪港深市场数据...');

        // 并行加载所有数据
        const promises = [
            this.loadCNFearGreed(),
            this.loadCNLeaders(),
            this.loadCNMarketHeat(),
            this.loadCNDividend(),
            this.loadCNBonds()
        ];

        await Promise.allSettled(promises);
    }

    async loadCNFearGreed() {
        try {
            const data = await api.getCNFearGreed();
            this.renderCNFearGreed(data);
        } catch (error) {
            console.error('加载恐慌贪婪指数失败:', error);
            this.renderError('cn-fear-greed', '恐慌贪婪指数加载失败');
        }
    }

    async loadCNLeaders() {
        try {
            const [gainers, losers] = await Promise.all([
                api.getCNTopGainers(),
                api.getCNTopLosers()
            ]);

            this.renderCNLeaders(gainers, losers);
        } catch (error) {
            console.error('加载领涨领跌板块失败:', error);
            this.renderError('cn-gainers', '领涨领跌板块加载失败');
        }
    }

    async loadCNMarketHeat() {
        try {
            const data = await api.getCNMarketHeat();
            this.renderCNMarketHeat(data);
        } catch (error) {
            console.error('加载市场热度失败:', error);
            this.renderError('market-cn-heat', '市场热度加载失败');
        }
    }

    async loadCNDividend() {
        try {
            const data = await api.getCNDividendStocks();
            this.renderCNDividend(data);
        } catch (error) {
            console.error('加载红利低波数据失败:', error);
            this.renderError('cn-dividend', '红利低波数据加载失败');
        }
    }

    async loadCNBonds() {
        try {
            const data = await api.getCNTreasuryYields();
            this.renderCNBonds(data);
        } catch (error) {
            console.error('加载国债数据失败:', error);
            this.renderError('cn-bonds', '国债数据加载失败');
        }
    }

    async loadUSMarketData() {
        console.log('📊 加载美股市场数据...');

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
            // Load CNN
            const cnnData = await api.getUSFearGreed();
            this.renderUSFearGreed(cnnData, 'us-cnn-fear');

            // Load Custom
            const customData = await api.getUSCustomFearGreed();
            this.renderUSFearGreed(customData, 'us-custom-fear');

            // Re-init icons
            if (window.lucide) lucide.createIcons();

        } catch (error) {
            console.error('加载美股恐慌指数失败:', error);
            this.renderError('us-cnn-fear', '美股恐慌指数加载失败');
        }
    }

    async loadUSMarketHeat() {
        try {
            const data = await api.getUSMarketHeat();
            this.renderUSMarketHeat(data);
        } catch (error) {
            console.error('加载美股热度失败:', error);
            this.renderError('market-us-heat', '美股热度加载失败');
        }
    }

    async loadUSBondYields() {
        try {
            const data = await api.getUSBondYields();
            this.renderUSBondYields(data);
        } catch (error) {
            console.error('加载美债数据失败:', error);
            this.renderError('us-treasury', '美债数据加载失败');
        }
    }

    async loadUSLeaders() {
        try {
            const data = await api.getUSMarketLeaders();
            if (data.error) {
                console.error('加载美股领涨板块API返回错误:', data.error);
                this.renderError('us-gainers', '排行数据暂时不可用');
                this.renderError('us-sp500', '排行数据暂时不可用');
                return;
            }
            this.renderUSLeaders(data);
        } catch (error) {
            console.error('加载美股领涨板块失败:', error);
            this.renderError('us-gainers', '排行榜加载失败');
        }
    }

    renderUSFearGreed(data, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.error) {
            container.innerHTML = '<div class="loading">暂无数据</div>';
            return;
        }

        const score = data.current_value || data.score || 50;
        const level = data.current_level || data.level || '中性';
        const indicators = data.indicators;

        let contentHtml = `
            <div class="fg-gauge" id="${containerId}-gauge"></div>
            <div class="fg-info">
                <div class="fg-score class-${this.getScoreClass(score)}">${score}</div>
                <div class="fg-level">${level}</div>
        `;

        if (indicators) {
            contentHtml += `<div class="fg-desc" style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">`;
            for (const [key, val] of Object.entries(indicators)) {
                contentHtml += `
                    <span class="badge" title="${this.getIndicatorName(key)}">
                       ${Math.round(val.score)}
                    </span>
                 `;
            }
            contentHtml += `</div>`;
        } else {
            contentHtml += `
                <div class="fg-desc">
                    变动: ${utils.formatChange(data.change_1d || 0, 2, 'us').text}
                </div>
             `;
        }

        contentHtml += '</div>'; // Close fg-info

        container.innerHTML = contentHtml;

        // Init gauge
        setTimeout(() => {
            charts.createFearGreedGauge(`${containerId}-gauge`, { score: score, level: level });
        }, 100);
    }

    getScoreClass(score) {
        if (score >= 75) return 'extreme-greed';
        if (score >= 55) return 'greed';
        if (score <= 25) return 'extreme-fear';
        if (score <= 45) return 'fear';
        return 'neutral';
    }

    renderUSMarketHeat(data) {
        const container = document.getElementById('market-us-heat');
        if (!container) return;

        if (!data || data.length === 0) {
            this.renderError('market-us-heat', '暂无数据');
            return;
        }

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

        if (!data || data.length === 0) {
            this.renderError('us-treasury', '暂无数据');
            return;
        }

        const html = `
            <div class="bond-scroll">
                ${data.map(item => {
            let valClass = '';
            if (item.is_spread) {
                valClass = item.value < 0 ? 'text-down' : 'text-up';
            }
            return `
                        <div class="bond-item">
                            <span class="bond-name">${item.name}</span>
                            <span class="bond-rate ${valClass}">${item.value}${item.suffix || ''}</span>
                        </div>
                    `;
        }).join('')}
            </div>
        `;

        container.innerHTML = html;
    }

    renderUSLeaders(data) {
        // 使用第一个容器渲染指数
        const container = document.getElementById('us-gainers'); // 复用现有容器ID
        const container2 = document.getElementById('us-sp500');  // 隐藏或清理这个容器

        if (container2) {
            container2.style.display = 'none'; // 仅隐藏第二个容器
            // 将第一个Tab改名为 "三大指数"
            const tabBtn = document.querySelector('.card-tab[data-target="us-gainers"]');
            if (tabBtn) {
                tabBtn.textContent = '三大指数';
                // 隐藏其他Tab按钮
                const siblings = tabBtn.parentElement.children;
                for (let i = 0; i < siblings.length; i++) {
                    if (siblings[i] !== tabBtn) siblings[i].style.display = 'none';
                }
            }
        }

        if (!container) return;

        const indices = data.indices || [];
        if (indices.length === 0) {
            container.innerHTML = '<div class="placeholder"><p>暂无指数数据</p></div>';
            return;
        }

        const html = indices.map(index => {
            const change = utils.formatChange(index.change_pct, 2, 'us');
            return `
                <div class="list-item">
                    <div class="item-main">
                        <span class="item-title">${index.name}</span>
                        <span class="item-sub">${index.code}</span>
                    </div>
                    <div>
                        <div class="item-value">${Number(index.price).toFixed(2)}</div>
                        <div class="item-change ${change.class}">${change.text}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;

        // Note: renderUSStockList is no longer used by this method
    }

    renderUSStockList(containerId, groupData) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const stocks = groupData.gainers || [];
        if (stocks.length === 0) {
            container.innerHTML = '<div class="placeholder"><p>暂无数据</p></div>';
            return;
        }

        const html = stocks.map(stock => {
            const change = utils.formatChange(stock.change_pct, 2, 'us');
            return `
                <div class="stock-item">
                    <div class="stock-info">
                        <div class="stock-name" title="${stock.name}">${stock.name}</div>
                        <div class="stock-code">${stock.code}</div>
                    </div>
                    <div class="stock-metrics">
                        <div class="stock-price">$${utils.formatNumber(stock.price)}</div>
                        <div class="stock-change ${change.class}">${change.text}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    async loadMetalsData() {
        console.log('📊 加载有色金属数据...');

        try {
            // Load Ratio
            const ratioData = await api.getGoldSilverRatio();
            this.renderGoldSilverRatio(ratioData);

            // Load Spot Prices
            const spotData = await api.getMetalSpotPrices();
            this.renderMetalSpotPrices(spotData);

        } catch (error) {
            console.error('加载金属数据失败:', error);
            this.renderError('gold-silver-ratio', '金属数据加载失败');
        }
    }

    renderMetalSpotPrices(data) {
        const container = document.getElementById('metal-prices');
        if (!container) return;

        if (!data || data.length === 0) {
            this.renderError('metal-prices', '暂无数据');
            return;
        }

        const html = data.map(item => {
            const change = utils.formatChange(item.change_pct);
            return `
                <div class="list-item">
                    <div class="item-main">
                        <span class="item-title">${item.name}</span>
                        <span class="item-sub">${item.unit}</span>
                    </div>
                    <div>
                        <div class="item-value">$${utils.formatNumber(item.price)}</div>
                        <div class="item-change ${change.class}">${change.text}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // 渲染方法
    renderCNFearGreed(data) {
        const container = document.getElementById('cn-fear-greed');
        if (!container) return;

        if (data.error) {
            this.renderError('cn-fear-greed', data.error);
            return;
        }

        container.innerHTML = `
            <div class="fg-gauge" id="cn-fear-greed-gauge"></div>
            <div class="fg-info">
                <div class="fg-score class-${this.getScoreClass(data.score)}">${data.score}</div>
                <div class="fg-level">${data.level}</div>
                <div class="fg-desc">${data.description}</div>
            </div>
        `;

        // 创建图表
        setTimeout(() => {
            charts.createFearGreedGauge('cn-fear-greed-gauge', data);
        }, 100);
    }

    renderCNLeaders(gainers, losers) {
        this.renderSectorList('cn-gainers', gainers.sectors || []);
        this.renderSectorList('cn-losers', losers.sectors || []);
    }

    renderSectorList(containerId, sectors) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!sectors || sectors.length === 0) {
            container.innerHTML = '<div class="loading">暂无数据</div>';
            return;
        }

        const html = sectors.map(sector => {
            const change = utils.formatChange(sector.change_pct);
            return `
                <div class="list-item">
                    <div class="item-main">
                        <span class="item-title">${sector.name}</span>
                        <span class="item-sub">${sector.stock_count}家 | 领涨: ${sector.leading_stock || '--'}</span>
                    </div>
                    <div>
                        <div class="item-value">${utils.formatNumber(sector.total_market_cap / 100000000)}亿</div>
                        <div class="item-change ${change.class}">${change.text}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    renderCNMarketHeat(data) {
        const container = document.getElementById('market-cn-heat');
        if (!container) return;

        if (data.error) {
            this.renderError('market-cn-heat', data.error);
            return;
        }

        // Using Grid for metrics
        const html = `
            <div class="heat-cell">
                <div class="fg-score">${data.heat_score}</div>
                <div class="fg-level">${data.heat_level}</div>
            </div>
            <div class="heat-cell">
                <div class="item-sub">成交额</div>
                <div class="heat-val">${utils.formatNumber(data.total_turnover)}亿</div>
            </div>
            <div class="heat-cell">
                <div class="item-sub">涨跌比</div>
                <div class="heat-val">${data.rise_fall_ratio}</div>
            </div>
            <div class="heat-cell">
                <div class="item-sub">强势股</div>
                <div class="heat-val">${data.strong_stocks}</div>
            </div>
        `;

        container.innerHTML = html;
    }

    renderCNDividend(data) {
        const container = document.getElementById('cn-dividend');
        if (!container) return;

        if (data.error || !data.stocks) {
            this.renderError('cn-dividend', data.error || '暂无数据');
            return;
        }

        const stats = data.strategy_stats || {};

        // Stats in a simple grid
        const statsHtml = `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid var(--border-light); text-align: center;">
                <div>
                    <div class="item-sub">均股息</div>
                    <div class="heat-val">${utils.formatPercentage(stats.avg_dividend_yield)}</div>
                </div>
                <div>
                    <div class="item-sub">均PE</div>
                    <div class="heat-val">${utils.formatNumber(stats.avg_pe_ratio)}</div>
                </div>
                <div>
                    <div class="item-sub">低波股</div>
                    <div class="heat-val">${stats.low_volatility_count || 0}</div>
                </div>
            </div>
        `;

        const listHtml = data.stocks.slice(0, 10).map(stock => `
            <div class="list-item">
                <div class="item-main">
                    <span class="item-title">${stock.name}</span>
                    <span class="item-sub">${stock.code}</span>
                </div>
                <div>
                    <div class="item-value" style="color: var(--accent-red)">${utils.formatPercentage(stock.estimated_dividend_yield)}</div>
                    <div class="item-change">PE ${utils.formatNumber(stock.pe_ratio)}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = statsHtml + listHtml;
    }

    renderCNBonds(data) {
        const container = document.getElementById('cn-bonds');
        if (!container) return;

        if (!data || data.error) {
            this.renderError('cn-bonds', data && data.error ? data.error : '暂无数据');
            return;
        }

        // Handle dictionary yield_curve
        const yieldCurve = data.yield_curve || {};
        const keyRates = data.key_rates;

        // Convert dictionary to array for mapping if it's not already an array
        let curveItems = [];
        if (Array.isArray(yieldCurve)) {
            curveItems = yieldCurve;
        } else {
            curveItems = Object.entries(yieldCurve).map(([period, rate]) => ({
                period: period.toUpperCase(),
                yield: rate,
                change_bp: data.yield_changes ? (data.yield_changes[period] || 0) : 0
            }));
        }

        if (keyRates) {
            const html = `
                <div class="bond-scroll">
                    ${curveItems.map(item => `
                        <div class="bond-item">
                            <span class="bond-name">${item.period}</span>
                            <span class="bond-rate">${utils.formatPercentage(item.yield)}</span>
                             <span class="bond-change ${utils.formatChange(item.change_bp).class}" style="font-size: 10px; display: block;">
                                ${item.change_bp > 0 ? '+' : ''}${item.change_bp}bp
                            </span>
                        </div>
                    `).join('')}
                </div>
                <div style="font-size: 12px; padding: 8px; color: var(--text-secondary); border-top: 1px solid var(--border-light);">
                    10年期: ${utils.formatPercentage(keyRates['10y'])} | 期限利差: ${utils.formatNumber(keyRates.spread_10y_2y, 3)}%
                </div>
            `;
            container.innerHTML = html;
            container.innerHTML = html;
        } else {
            const html = curveItems.map(item => `
                <div class="bond-item">
                    <span class="bond-name">${item.period || item.name}</span>
                    <span class="bond-rate">${item.yield || item.value}%</span>
                </div>
            `).join('');
            container.innerHTML = html;
        }

        // 渲染投资建议 (如果有)
        // 渲染投资建议 (如果有)
        // API returns investment_advice at root
        const advice = data.investment_advice || (data.analysis ? data.analysis.investment_advice : null);

        if (advice) {
            const ratingColor = advice.overall_rating === '积极' ? 'var(--accent-red)' :
                (advice.overall_rating === '谨慎' ? 'var(--accent-green)' : 'var(--text-secondary)');

            const adviceHtml = `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border-light);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-weight: 600; font-size: 13px;">投资建议</span>
                            <span style="font-size: 12px; font-weight: 700; color: ${ratingColor}; border: 1px solid ${ratingColor}; padding: 1px 6px; border-radius: 4px;">
                                ${advice.overall_rating}
                            </span>
                        </div>
                        <div style="font-size: 12px; color: var(--text-primary); margin-bottom: 4px;">
                            ${advice.allocation_suggestion || ''}
                        </div>
                        ${advice.risk_warning ? `
                            <div style="font-size: 11px; color: var(--text-secondary);">
                                <span style="color: var(--accent-green); margin-right: 4px;">⚠️</span> ${advice.risk_warning}
                            </div>
                        ` : ''}
                    </div>
                `;
            container.insertAdjacentHTML('beforeend', adviceHtml);
        }

    }

    renderGoldSilverRatio(data) {
        const container = document.getElementById('gold-silver-ratio');
        if (!container) return;

        if (data.error) {
            this.renderError('gold-silver-ratio', data.error);
            return;
        }

        const ratio = data.ratio || {};
        const gold = data.gold || {};
        const silver = data.silver || {};
        const advice = ratio.investment_advice || {};

        const goldChange = utils.formatChange(gold.change_pct);
        const silverChange = utils.formatChange(silver.change_pct);

        const html = `
            <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 400px;">
                <!-- 1. 比值核心展示 -->
                <div style="text-align: center;">
                    <div class="fg-score" style="color: ${this.getRatioColor(ratio.current)}; font-size: 42px;">${ratio.current}</div>
                    <div class="fg-level">${ratio.analysis?.level || '--'}</div>
                    <div class="item-sub" style="margin-top: 4px;">${ratio.analysis?.comment || ''}</div>
                </div>

                <!-- 2. 价格展示 (左右分栏) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="background: var(--bg-subtle); padding: 12px; border-radius: 6px; text-align: center;">
                        <div class="item-sub" style="margin-bottom: 4px;">黄金</div>
                        <div class="heat-val" style="font-size: 16px;">$${utils.formatNumber(gold.price)}</div>
                        <div class="${goldChange.class}" style="font-size: 12px; margin-top: 2px;">${goldChange.text}</div>
                    </div>
                    <div style="background: var(--bg-subtle); padding: 12px; border-radius: 6px; text-align: center;">
                        <div class="item-sub" style="margin-bottom: 4px;">白银</div>
                        <div class="heat-val" style="font-size: 16px;">$${utils.formatNumber(silver.price)}</div>
                        <div class="${silverChange.class}" style="font-size: 12px; margin-top: 2px;">${silverChange.text}</div>
                    </div>
                </div>

                <!-- 3. 历史数据 (三列) -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; background: var(--bg-subtle); padding: 12px; border-radius: 6px;">
                    <div>
                        <div style="font-size: 10px; color: var(--text-secondary); margin-bottom: 2px;">历史最高</div>
                        <div style="font-weight: 600;">${ratio.historical_high || '--'}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: var(--text-secondary); margin-bottom: 2px;">历史均值</div>
                        <div style="font-weight: 600;">${ratio.historical_avg || '--'}</div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: var(--text-secondary); margin-bottom: 2px;">历史最低</div>
                        <div style="font-weight: 600;">${ratio.historical_low || '--'}</div>
                    </div>
                </div>

                <!-- 4. 投资建议 -->
                ${advice.preferred_metal ? `
                <div style="padding-top: 12px; border-top: 1px solid var(--border-light); font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                    <div style="margin-bottom: 4px;"><strong>策略建议:</strong> <span style="color: var(--text-primary); font-weight: 600;">${advice.strategy}</span></div>
                    <div>${advice.reasoning}</div>
                </div>
                ` : ''}
            </div>
        `;

        // Ensure container centers the content
        container.style.justifyContent = 'center';
        container.innerHTML = html;
        // Reset text-align to default in case it was set by CSS class on desktop
        container.style.textAlign = 'center';
    }

    renderError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="placeholder">
                <i data-lucide="alert-circle"></i>
                <p>${message}</p>
            </div>
        `;

        // 重新初始化图标
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // 工具方法
    getFearGreedColor(score) {
        if (score >= 80) return '#ef4444';
        if (score >= 65) return '#f59e0b';
        if (score >= 55) return '#eab308';
        if (score >= 45) return '#6b7280';
        if (score >= 35) return '#3b82f6';
        if (score >= 20) return '#8b5cf6';
        return '#10b981';
    }

    getHeatColor(score) {
        if (score >= 80) return '#ef4444';
        if (score >= 65) return '#f59e0b';
        if (score >= 55) return '#eab308';
        if (score >= 45) return '#6b7280';
        return '#3b82f6';
    }

    getRatioColor(ratio) {
        if (ratio > 85) return '#10b981'; // 绿色 - 白银便宜
        if (ratio < 65) return '#f59e0b'; // 橙色 - 黄金便宜
        return '#6b7280'; // 灰色 - 正常
    }

    getIndicatorName(key) {
        const names = {
            vix: 'VIX',
            sp500_momentum: 'SP500动量',
            market_breadth: '市场广度',
            safe_haven: '避险需求'
        };
        return names[key] || key;
    }

    updateGlobalTime() {
        const now = new Date();
        const timeString = utils.formatTime(now);

        // 更新所有时间显示
        const timeElements = document.querySelectorAll('#global-update-time, #footer-update-time');
        timeElements.forEach(el => {
            if (el) el.textContent = timeString;
        });

        this.lastUpdateTime = now;
    }

}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});