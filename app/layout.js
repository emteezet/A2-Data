import "./globals.css";

export const metadata = {
  title: "DataApp - Buy Data Online",
  description: "Fast and secure data purchase platform for Nigeria",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
