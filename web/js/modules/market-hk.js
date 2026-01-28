class HKMarketController {
    constructor() {
    }

    async loadData() {
        console.log('📊 加载香港市场数据...');
        await this.loadHKIndices();
    }

    async loadHKIndices() {
        try {
            const data = await api.getHKIndices();
            this.renderHKIndices(data.indices);
            this.renderHKSectors(data.sectors);
        } catch (error) {
            console.error('加载港股数据失败:', error);
            utils.renderError('hk-indices', '港股数据加载失败');
            utils.renderError('hk-gainers', '数据加载失败');
            utils.renderError('hk-losers', '数据加载失败');
        }
    }

    renderHKIndices(indices) {
        const container = document.getElementById('hk-indices');
        if (!container) return;

        if (!indices || indices.length === 0) {
            utils.renderError('hk-indices', '暂无指数数据');
            return;
        }

        const html = indices.map(item => {
            const changeVal = item.change_pct;
            const changeClass = changeVal > 0 ? 'text-up' : changeVal < 0 ? 'text-down' : '';
            const sign = changeVal > 0 ? '+' : '';

            return `
                <div class="index-item">
                    <div class="index-name">${item.name}</div>
                    <div class="index-price ${changeClass}">${utils.formatNumber(item.price)}</div>
                    <div class="index-change ${changeClass}">
                        ${sign}${utils.formatNumber(item.change_amount)} 
                        (${sign}${utils.formatPercentage(changeVal)})
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        container.classList.remove('loading');
    }

    renderHKSectors(sectorsData) {
        if (!sectorsData) return;

        this.renderSectorList('hk-gainers', sectorsData.gainers, '领涨');
        this.renderSectorList('hk-losers', sectorsData.losers, '领跌');
    }

    renderSectorList(containerId, list, label) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!list || list.length === 0) {
            utils.renderError(containerId, '暂无数据');
            return;
        }

        const html = list.map(item => {
            const change = utils.formatChange(item.change_pct);

            return `
                <div class="list-item sector-item">
                    <div class="item-main">
                        <span class="item-title">${item.name}</span>
                        <span class="item-sub">${item.code}</span>
                    </div>
                    <div style="text-align: right;">
                        <div class="item-value">${utils.formatNumber(item.price)}</div>
                        <div class="item-change ${change.class}">${change.text}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }
}
