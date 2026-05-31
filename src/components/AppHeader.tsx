import {
  BarChartOutlined,
  DashboardOutlined,
  DollarCircleOutlined,
  FundOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { Button, Layout, Space, Typography } from 'antd';
import type { ReactNode } from 'react';
import type { PageKey } from '../types/fmcg';

const { Header } = Layout;
const { Title, Text } = Typography;

interface AppHeaderProps {
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
}

const NAV_ITEMS: Array<{ key: PageKey; label: string; icon: ReactNode }> = [
  { key: 'overview', label: '首页概览', icon: <DashboardOutlined /> },
  { key: 'promotion', label: '促销分析', icon: <LineChartOutlined /> },
  { key: 'promotionProfit', label: '促销利润诊断', icon: <DollarCircleOutlined /> },
  { key: 'business', label: '业务维度分析', icon: <FundOutlined /> },
  { key: 'explorer', label: '数据探索器', icon: <BarChartOutlined /> },
];

export function AppHeader({ activePage, onPageChange }: AppHeaderProps) {
  return (
    <Header className="app-header">
      <div>
        <Title level={3} className="app-header__title">
          快消品经营洞察分析系统
        </Title>
        <Text className="app-header__subtitle">FMCG Business Insight Dashboard</Text>
      </div>
      <Space wrap size={12}>
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.key}
            type={activePage === item.key ? 'primary' : 'default'}
            icon={item.icon}
            onClick={() => onPageChange(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </Space>
    </Header>
  );
}
