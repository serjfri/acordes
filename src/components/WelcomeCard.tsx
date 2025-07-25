
import React from 'react';
import { Card } from '@/components/ui/card';

const WelcomeCard: React.FC = () => {
  return (
    <Card className="p-8 text-center bg-gray-800 border-gray-700">
      <div className="text-gray-400 text-sm">
        crea una canción para empezar
      </div>
    </Card>
  );
};

export default WelcomeCard;
