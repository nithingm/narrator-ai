import React from 'react';
import '../styles/globals.css';

function NarratorApp({ Component, pageProps }: { Component: React.FC; pageProps: any }) {
  return <Component {...pageProps} />;
}

export default NarratorApp;
