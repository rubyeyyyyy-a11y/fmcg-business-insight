import { Card, Typography } from 'antd';

const { Text, Title, Paragraph } = Typography;

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
}

export function KpiCard({ title, value, description }: KpiCardProps) {
  return (
    <Card className="kpi-card" bordered={false}>
      <Text type="secondary">{title}</Text>
      <Title level={3}>{value}</Title>
      <Paragraph className="kpi-card__description">{description}</Paragraph>
    </Card>
  );
}
