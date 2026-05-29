import { Card, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Paragraph } = Typography;

interface ChartCardProps {
  title: string;
  description?: string;
  extra?: ReactNode;
  children: ReactNode;
}

export function ChartCard({ title, description, extra, children }: ChartCardProps) {
  return (
    <Card className="chart-card" title={title} extra={extra} bordered={false}>
      {description ? <Paragraph className="chart-card__description">{description}</Paragraph> : null}
      {children}
    </Card>
  );
}
