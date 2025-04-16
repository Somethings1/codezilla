'use client';
import { ConfigProvider, theme } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs'; // THIS!
import 'antd/dist/reset.css';
import './style.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#141414', color: '#fff', minHeight: '100vh' }}>
        <StyleProvider hashPriority="high"> {/* Add this */}
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
            }}
          >
            {children}
          </ConfigProvider>
        </StyleProvider>
      </body>
    </html>
  );
}

