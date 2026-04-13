'use client'

import 'bootstrap/dist/css/bootstrap.min.css'
import { Container } from 'react-bootstrap'

export function AppInitProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <html lang="ru">
        <head>
          <link rel="icon" href="/public/favicon.ico" sizes="any" />
        </head>
        <body>
          <Container fluid className="p-0">
            {children}
          </Container>
        </body>
      </html>
    </>
  )
}
