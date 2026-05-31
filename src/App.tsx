import { useState } from 'react';
import { Alert, Layout, Spin } from 'antd';
import { AppHeader } from './components/AppHeader';
import { useFmcgData } from './hooks/useFmcgData';
import { BusinessDimensionPage } from './pages/BusinessDimensionPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { OverviewPage } from './pages/OverviewPage';
import { PromotionAnalysisPage } from './pages/PromotionAnalysisPage';
import { PromotionProfitDiagnosisPage } from './pages/PromotionProfitDiagnosisPage';
import type { PageKey } from './types/fmcg';

const { Content } = Layout;

function App() {
  const [activePage, setActivePage] = useState<PageKey>('overview');
  const { rows, loading, error, options } = useFmcgData();

  let pageContent = <OverviewPage rows={rows} />;

  if (activePage === 'promotion') {
    pageContent = <PromotionAnalysisPage rows={rows} options={options} />;
  } else if (activePage === 'promotionProfit') {
    pageContent = <PromotionProfitDiagnosisPage rows={rows} options={options} />;
  } else if (activePage === 'business') {
    pageContent = <BusinessDimensionPage rows={rows} options={options} />;
  } else if (activePage === 'explorer') {
    pageContent = <DataExplorerPage rows={rows} options={options} />;
  }

  return (
    <Layout className="app-shell">
      <AppHeader activePage={activePage} onPageChange={setActivePage} />
      <Content className="app-content">
        {loading ? (
          <div className="state-panel">
            <Spin size="large" tip="正在读取原始 CSV 并生成动态聚合结果..." />
          </div>
        ) : error ? (
          <div className="state-panel">
            <Alert type="error" message="数据加载失败" description={error} showIcon />
          </div>
        ) : (
          pageContent
        )}
      </Content>
    </Layout>
  );
}

export default App;
