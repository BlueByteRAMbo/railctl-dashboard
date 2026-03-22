import './globals.css';
import Sidebar from '../components/Sidebar';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'RailCTL — Indian Railways Dashboard',
  description: 'Admin dashboard for Indian Railways',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell dot-grid">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
