/**
 * 宏观数据控制器
 */
class MacroController {
    async loadData() {
        console.log('📊 加载宏观数据...');

        const promises = [
            this.loadLPR(),
            this.loadNorthFunds(),
            this.loadETFFlow(),
            this.loadCalendar()
        ];
        await Promise.allSettled(promises);
    }

    async loadLPR() {
        try {
            const data = await api.getLPR();
            this.renderLPR(data);
        } catch (error) {
            console.error('加载 LPR 失败:', error);
            utils.renderError('macro-lpr', 'LPR 数据加载失败');
        }
    }

    async loadNorthFunds() {
        try {
            const data = await api.getNorthFunds();
            this.renderNorthFunds(data);
        } catch (error) {
            console.error('加载北向资金失败:', error);
            utils.renderError('macro-north-funds', '北向资金加载失败');
        }
    }

    async loadETFFlow() {
        try {
            const data = await api.getETFFlow(10);
            this.renderETFFlow(data);
        } catch (error) {
            console.error('加载 ETF 资金流向失败:', error);
            utils.renderError('macro-etf-flow', 'ETF 数据加载失败');
        }
    }

    async loadCalendar() {
        try {
            const data = await api.getEconomicCalendar();
            this.renderCalendar(data);
        } catch (error) {
            console.error('加载经济日历失败:', error);
            utils.renderError('macro-calendar', '经济日历加载失败');
        }
    }

    renderLPR(data) {
        const container = document.getElementById('macro-lpr');
        if (!container) return;

        if (data.error || !data.current) {
            utils.renderError('macro-lpr', data.error || '暂无数据');
            return;
        }

        // Bind info button
        const infoBtn = document.getElementById('info-lpr');
        if (infoBtn) {
            infoBtn.onclick = () => utils.showInfoModal('LPR 利率', data.description || 'LPR 贷款市场报价利率，每月 20 日公布');
        }

        const { current } = data;
        const change1y = current.lpr_1y_change;
        const change5y = current.lpr_5y_change;

        const html = `
            <div class="heat-grid" style="grid-template-columns: 1fr 1fr;">
                <div class="heat-cell">
                    <div class="item-sub">1年期 LPR</div>
                    <div class="fg-score" style="font-size: 28px;">${current.lpr_1y}%</div>
                    ${change1y !== 0 ? `<div class="item-sub ${change1y < 0 ? 'text-down' : 'text-up'}">${change1y > 0 ? '+' : ''}${change1y}bp</div>` : '<div class="item-sub">持平</div>'}
                </div>
                <div class="heat-cell">
                    <div class="item-sub">5年期 LPR</div>
                    <div class="fg-score" style="font-size: 28px;">${current.lpr_5y}%</div>
                    ${change5y !== 0 ? `<div class="item-sub ${change5y < 0 ? 'text-down' : 'text-up'}">${change5y > 0 ? '+' : ''}${change5y}bp</div>` : '<div class="item-sub">持平</div>'}
                </div>
            </div>
            <div style="text-align: center; font-size: 11px; color: var(--text-tertiary); margin-top: 8px;">
                最新报价日期: ${current.date}
            </div>
        `;
        container.innerHTML = html;
    }

    renderNorthFunds(data) {
        const container = document.getElementById('macro-north-funds');
        if (!container) return;

        if (data.error || !data.total) {
            utils.renderError('macro-north-funds', data.error || '暂无数据');
            return;
        }

        // Bind info button
        const infoBtn = document.getElementById('info-north');
        if (infoBtn) {
            infoBtn.onclick = () => utils.showInfoModal('北向资金', data.description || '北向资金 = 沪股通 + 深股通，反映外资对 A 股的态度');
        }

        const { total, signal, details } = data;
        const flowColor = total.net_flow >= 0 ? 'var(--accent-red)' : 'var(--accent-green)';
        const flowSign = total.net_flow >= 0 ? '+' : '';

        const html = `
            <div class="heat-grid" style="grid-template-columns: 1fr 1fr;">
                <div class="heat-cell">
                    <div class="item-sub">净流入</div>
                    <div class="fg-score" style="font-size: 24px; color: ${flowColor};">${flowSign}${total.net_flow}亿</div>
                </div>
                <div class="heat-cell">
                    <div class="item-sub">市场信号</div>
                    <div class="fg-level" style="font-size: 16px; color: ${signal.type === 'bullish' ? 'var(--accent-red)' : signal.type === 'bearish' ? 'var(--accent-green)' : 'var(--text-secondary)'};">${signal.text}</div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-light); font-size: 12px; color: var(--text-secondary);">
                ${details.map(d => `<span>${d.channel}: ${d.net_flow >= 0 ? '+' : ''}${d.net_flow}亿</span>`).join('')}
            </div>
        `;
        container.innerHTML = html;
    }

    renderETFFlow(data) {
        const container = document.getElementById('macro-etf-flow');
        if (!container) return;

        if (data.error || (!data.gainers && !data.losers)) {
            utils.renderError('macro-etf-flow', data.error || '暂无数据');
            return;
        }

        const { gainers = [], losers = [] } = data;

        // 只显示涨跌各 5
        const topGainers = gainers.slice(0, 5);
        const topLosers = losers.slice(0, 5);

        const renderItem = (item, isGainer) => {
            const change = utils.formatChange(item.change_pct);
            return `
                <div class="list-item">
                    <div class="item-main">
                        <span class="item-title">${item.name}</span>
                        <span class="item-sub">${item.code}</span>
                    </div>
                    <div style="text-align: right;">
                        <div class="item-change ${change.class}">${change.text}</div>
                    </div>
                </div>
            `;
        };

        const html = `
            <div style="margin-bottom: 8px; font-size: 12px; color: var(--text-secondary); font-weight: 500;">📈 涨幅前5</div>
            ${topGainers.map(g => renderItem(g, true)).join('')}
            <div style="margin: 12px 0 8px 0; font-size: 12px; color: var(--text-secondary); font-weight: 500;">📉 跌幅前5</div>
            ${topLosers.map(l => renderItem(l, false)).join('')}
        `;
        container.innerHTML = html;
    }

    renderCalendar(data) {
        const container = document.getElementById('macro-calendar');
        if (!container) return;

        if (data.error) {
            utils.renderError('macro-calendar', data.error);
            return;
        }

        if (!data.events || data.events.length === 0) {
            container.innerHTML = '<div class="loading">今日无重要经济事件</div>';
            return;
        }

        // 只显示前 8 条
        const events = data.events.slice(0, 8);
        const html = events.map(event => {
            const importance = '⭐'.repeat(event.importance);
            return `
                <div class="list-item" style="padding: 8px 0;">
                    <div class="item-main" style="flex: 1;">
                        <span class="item-title" style="font-size: 12px;">${event.event}</span>
                        <span class="item-sub">${event.time} · ${event.region} ${importance}</span>
                    </div>
                    <div style="text-align: right; min-width: 60px;">
                        <div class="item-value" style="font-size: 12px;">${event.actual || '--'}</div>
                        <div class="item-sub">预期 ${event.forecast || '--'}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }
}
