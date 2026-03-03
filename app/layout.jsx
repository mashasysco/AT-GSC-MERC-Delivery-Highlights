import './globals.css'

export const metadata = {
  title: 'Delivery Dashboard',
  description: 'Sysco Technology Delivery Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
