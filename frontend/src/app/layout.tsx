export const metadata = {
  title: 'Todo List App',
  description: 'Minimal fullstack app using Flask and Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
