import './styles.css';

export const metadata = {
  title: 'Full-Stack To Do App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
