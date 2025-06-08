import React, { useEffect } from 'react';
import { Box, Paper } from '@mui/material';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdvertisementProps {
  slot: string;
  format?: string;
  style?: React.CSSProperties;
}

const Advertisement: React.FC<AdvertisementProps> = ({ slot, format = 'auto', style }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Error loading advertisement:', err);
    }
  }, []);

  return (
    <Paper elevation={1} sx={{ p: 1, ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9632031642792928"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </Paper>
  );
};

export default Advertisement; 