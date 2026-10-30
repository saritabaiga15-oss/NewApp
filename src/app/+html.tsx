import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

/**
 * Root HTML configuration for Honour Your Mentor on Web.
 * Enables font-display: swap, viewport optimization, and preconnect for super fast loading.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Prevent layout shifts and enable non-blocking font swapping */
              @font-face {
                font-family: 'Ionicons';
                font-display: swap;
              }
              @font-face {
                font-family: 'Caveat';
                font-display: swap;
              }
              html, body {
                background-color: #000000;
                margin: 0;
                padding: 0;
                height: 100%;
                overflow-x: hidden;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              #root {
                display: flex;
                flex-direction: column;
                height: 100%;
                min-height: 100vh;
              }
            `,
          }}
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

