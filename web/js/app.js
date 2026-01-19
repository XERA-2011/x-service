/**
 * X-Analytics 前端逻辑
 * 从 API 获取数据并渲染图表
 */

// API 基础路径
const API_BASE = '/analytics/api';

// ============================================
// 工具函数
// ============================================
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API 请求失败: ${endpoint}`, error);
        return null;
    }
}

function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined) return '--';
    if (Math.abs(num) >= 100000000) {
        return (num / 100000000).toFixed(decimals) + '亿';
    } else if (Math.abs(num) >= 10000) {
        return (num / 10000).toFixed(decimals) + '万';
    }
    return num.toFixed(decimals);
}

// ============================================
// 恐慌贪婪指数
// ============================================
async function loadFearGreedIndex() {
    const data = await fetchAPI('/sentiment/fear-greed');
    const infoEl = document.getElementById('fear-greed-info');
    const chartEl = document.getElementById('fear-greed-gauge');

    if (!data || data.error) {
        infoEl.innerHTML = `<p class="error">数据加载失败</p>`;
        return;
    }

    const score = Math.round(data.score || 50);
    const status = data.status || '中性';

    // 渲染 ECharts 仪表盘
    const chart = echarts.init(chartEl);
    const option = {
        series: [{
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 5,
            progress: {
                show: true,
                width: 18
            },
            axisLine: {
                lineStyle: {
                    width: 18,
                    color: [
                        [0.2, '#333333'],
                        [0.4, '#555555'],
                        [0.6, '#777777'],
                        [0.8, '#999999'],
                        [1, '#cccccc']
                    ]
                }
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: {
                distance: 25,
                color: '#888888',
                fontSize: 12,
                formatter: function (value) {
                    if (value === 0) return '恐慌';
                    if (value === 50) return '中性';
                    if (value === 100) return '贪婪';
                    return '';
                }
            },
            pointer: {
                icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                length: '60%',
                width: 10,
                itemStyle: {
                    color: '#ffffff'
                }
            },
            detail: {
                valueAnimation: true,
                formatter: '{value}',
                fontSize: 32,
                fontWeight: 'bold',
                color: '#ffffff',
                offsetCenter: [0, '40%']
            },
            data: [{ value: score }]
        }]
    };
    chart.setOption(option);

    // 渲染信息
    infoEl.innerHTML = `
        <div style="text-align: center;">
            <span class="status">${status}</span>
            <p class="label" style="margin-top: 12px;">
                RSI: ${data.rsi?.toFixed(1) || '--'} | 
                Bias: ${data.bias?.toFixed(2) || '--'}%
            </p>
        </div>
    `;

    // 监听窗口变化
    window.addEventListener('resize', () => chart.resize());
}

// ============================================
// 北向资金 (预留)
// ============================================

// ============================================
// 市场概览
// ============================================
async function loadMarketOverview() {
    const el = document.getElementById('market-overview');

    try {
        const data = await fetchAPI('/market/overview');
        if (!data) throw new Error('无数据');

        let html = '';

        // 1. 指数信息
        if (data.indices && data.indices.length > 0) {
            html += '<div style="grid-column: span 2; display: flex; justify-content: space-between; margin-bottom: 20px;">';
            data.indices.forEach(idx => {
                const color = idx.change > 0 ? '#ff3333' : (idx.change < 0 ? '#33ff33' : '#888');
                html += `
                    <div style="text-align: center;">
                        <div style="font-size: 0.9rem; color: #888;">${idx.name}</div>
                        <div style="font-size: 1.2rem; font-weight: bold; margin: 4px 0;">${idx.price}</div>
                        <div style="font-size: 0.9rem; color: ${color};">${idx.change > 0 ? '+' : ''}${idx.change}%</div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // 2. 市场统计 (涨跌家数 & 成交额)
        if (data.stats) {
            const up = data.stats.up || 0;
            const down = data.stats.down || 0;
            const total = up + down;
            const upRatio = total > 0 ? (up / total * 100).toFixed(0) : 0;
            html += `
                <div class="stat-item">
                    <div class="stat-value" style="color: #ff3333">${data.stats.up || 0}</div>
                    <div class="stat-label">上涨家数 (${upRatio}%)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" style="color: #33ff33">${data.stats.down || 0}</div>
                    <div class="stat-label">下跌家数</div>
                </div>
                <div class="stat-item" style="grid-column: span 2; margin-top: 10px;">
                    <div class="stat-value">${data.volume_str || '--'}</div>
                    <div class="stat-label">两市总成交额</div>
                </div>
            `;
        }

        el.innerHTML = html;

    } catch (err) {
        console.error('加载市场概览失败:', err);
        el.innerHTML = '<div class="loading">加载失败</div>';
    }
}

// ============================================
// 领涨行业
// ============================================
async function loadSectorTop() {
    const el = document.getElementById('sector-list');

    try {
        const data = await fetchAPI('/market/sector-top?n=5');
        if (!data || data.length === 0) throw new Error('无数据');

        el.innerHTML = data.map(item => `
            <div class="qvix-item">
                <div class="qvix-name">${item['板块名称']}</div>
                <div class="qvix-value" style="color: #ff3333">+${item['涨跌幅'].toFixed(2)}%</div>
                <div style="font-size: 0.8rem; color: #666;">
                    ${item['领涨股票']} <span style="color: #ff3333">+${item['领涨股票-涨跌幅'].toFixed(2)}%</span>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('加载板块数据失败:', err);
        el.innerHTML = '<div class="loading">加载失败</div>';
    }
}

// ============================================
// 领跌行业
// ============================================
async function loadSectorBottom() {
    const el = document.getElementById('sector-list-bottom');

    try {
        const data = await fetchAPI('/market/sector-bottom?n=5');
        if (!data || data.length === 0) throw new Error('无数据');

        el.innerHTML = data.map(item => {
            const stockChange = item['领涨股票-涨跌幅'];
            const stockColor = stockChange >= 0 ? '#ff3333' : '#33ff33';
            const stockSign = stockChange > 0 ? '+' : '';

            return `
            <div class="qvix-item">
                <div class="qvix-name">${item['板块名称']}</div>
                <div class="qvix-value" style="color: #33ff33">${item['涨跌幅'].toFixed(2)}%</div>
                <div style="font-size: 0.8rem; color: #666;">
                    ${item['领涨股票']} <span style="color: ${stockColor}">${stockSign}${stockChange.toFixed(2)}%</span>
                </div>
            </div>
            `;
        }).join('');

    } catch (err) {
        console.error('加载板块数据失败:', err);
        el.innerHTML = '<div class="loading">加载失败</div>';
    }
}

// ============================================
// 指数对比
// ============================================
async function loadIndexCompare() {
    const el = document.getElementById('index-list');

    try {
        const data = await fetchAPI('/index/compare');
        if (!data || data.length === 0) throw new Error('无数据');

        el.innerHTML = data.map(item => {
            // 解析涨跌幅字符串 "x.xx%" -> float
            let change = 0;
            if (item['1日涨跌'] && item['1日涨跌'] !== '-') {
                change = parseFloat(item['1日涨跌'].replace('%', ''));
            }
            const color = change > 0 ? '#ff3333' : (change < 0 ? '#33ff33' : '#888');

            return `
            <div class="qvix-item">
                <div class="qvix-name">${item['指数名称']}</div>
                <div class="qvix-value" style="font-size: 1rem;">${item['最新点位']}</div>
                <div style="font-size: 0.9rem; color: ${color}; font-weight: bold;">
                    ${item['1日涨跌']}
                </div>
            </div>
            `;
        }).join('');

    } catch (err) {
        console.error('加载指数对比失败:', err);
        el.innerHTML = '<div class="loading">加载失败</div>';
    }
}

// ============================================
// 基金排行
// ============================================
async function loadFundTop() {
    const el = document.getElementById('fund-list');

    try {
        const data = await fetchAPI('/fund/top?n=10');
        if (!data || data.length === 0) throw new Error('无数据');

        el.innerHTML = data.map(item => `
            <div class="qvix-item">
                <div class="qvix-name" style="flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; padding-right: 10px;">
                    ${item['基金简称']} <span style="font-size: 0.8rem; color: #666;">(${item['基金代码']})</span>
                </div>
                <div class="qvix-value" style="color: #ff3333; font-size: 1rem;">+${item['日增长率']}%</div>
            </div>
        `).join('');

    } catch (err) {
        console.error('加载基金数据失败:', err);
        el.innerHTML = '<div class="loading">加载失败</div>';
    }
}

// ============================================
// 初始化
// ============================================
function updateTime() {
    const updateTimeEl = document.getElementById('update-time');
    if (updateTimeEl) {
        updateTimeEl.textContent = `最后更新: ${new Date().toLocaleString('zh-CN')}`;
    }
}

function init() {
    updateTime();

    // 并行加载
    Promise.all([
        loadFearGreedIndex(),
        loadMarketOverview(),
        loadIndexCompare(),
        loadFundTop(),
        loadSectorTop(),
        loadSectorBottom()
    ]);

    // 定时刷新 (每分钟)
    setInterval(() => {
        updateTime();
        loadFearGreedIndex();
        loadMarketOverview();
        loadIndexCompare();
        loadFundTop();
        loadSectorTop();
        loadSectorBottom();
    }, 60000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
