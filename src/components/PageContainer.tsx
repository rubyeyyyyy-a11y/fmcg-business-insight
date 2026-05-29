import { Typography } from 'antd';
import type { ReactNode } from 'react';

const { Title, Paragraph } = Typography;

interface PageContainerProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <section className="page-container">
      <div className="page-container__intro">
        <Title level={2}>{title}</Title>
        <Paragraph>{description}</Paragraph>
      </div>
      {children}
    </section>
  );
}
