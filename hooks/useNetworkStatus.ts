import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export default function useNetworkStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sub = NetInfo.addEventListener(s => {
      setOnline(Boolean(s.isConnected && s.isInternetReachable !== false));
    });
    NetInfo.fetch().then(s => {
      setOnline(Boolean(s.isConnected && s.isInternetReachable !== false));
    });
    return () => sub();
  }, []);

  return online;
}
