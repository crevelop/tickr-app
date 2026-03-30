'use client';

import { Button } from '@heroui/button';
import type { ThemeConfig } from '@/lib/theme';

interface ExportButtonProps {
  config: ThemeConfig;
}

export function ExportButton({ config }: ExportButtonProps) {
  const handleExport = () => {
    const json = JSON.stringify(config, null, 2) + '\n';
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme.config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button color="primary" onPress={handleExport} className="w-full">
      Export theme.config.json
    </Button>
  );
}
