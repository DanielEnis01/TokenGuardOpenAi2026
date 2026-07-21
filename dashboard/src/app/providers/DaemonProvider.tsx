import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../lib/firebase';
import { useAuth } from './AuthProvider';
import type { CliToolActionResult } from '../../../../shared/cli.ts';
import type { GuardrailConfig } from '../../../../shared/config.ts';
import { getDaemonHttpOrigin, getDaemonWsUrl } from '../../../../shared/runtime.ts';
import type { CurrentSessionState, ToolConnection, ToolId } from '../../../../shared/types.ts';
import {
  currentSession as mockSession,
  guardrailConfig as mockGuardrailConfig,
  toolConnections as mockToolConnections,
} from '../dashboardData';

type ConnectionStatus = 'connecting' | 'connected' | 'mock';

interface DaemonContextValue {
  session: CurrentSessionState;
  config: GuardrailConfig;
  connections: ToolConnection[];
  connectionStatus: ConnectionStatus;
  isUsingMockData: boolean;
  errorMessage: string | null;
  updateConfig: (patch: Partial<GuardrailConfig>) => Promise<void>;
  resolveSpiral: (filePath: string, decision: 'stop' | 'continue') => Promise<void>;
  stopSession: () => Promise<void>;
  isRequestingStop: boolean;
  connectTool: (tool: ToolId) => Promise<CliToolActionResult>;
}

const DaemonContext = createContext<DaemonContextValue | null>(null);

export function DaemonProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [session, setSession] = useState<CurrentSessionState>(mockSession);
  const [config, setConfig] = useState<GuardrailConfig>(mockGuardrailConfig);
  const [connections, setConnections] = useState<ToolConnection[]>(mockToolConnections);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isUsingMockData, setIsUsingMockData] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRequestingStop, setIsRequestingStop] = useState(false);

  const hasConnectedRef = useRef(false);
  const reconnectTimerRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const scheduleReconnect = useCallback((callback: () => void) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
    }

    reconnectTimerRef.current = window.setTimeout(() => {
      reconnectTimerRef.current = null;
      callback();
    }, 3000);
  }, []);

  const openWebSocket = useCallback(
    (refreshFromDaemon: () => Promise<void>) => {
      if (typeof window === 'undefined') {
        return;
      }

      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const socket = new WebSocket(getDaemonWsUrl());
      socketRef.current = socket;

      socket.onopen = () => {
        setConnectionStatus('connected');
        setErrorMessage(null);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as {
            type?: string;
            payload?: { session?: CurrentSessionState; config?: GuardrailConfig; connections?: ToolConnection[] };
          };

          if (message.type === 'hello') {
            if (message.payload?.session) {
              setSession(message.payload.session);
            }
            if (message.payload?.config) {
              setConfig(message.payload.config);
            }
            if (message.payload?.connections) {
              setConnections(message.payload.connections);
            }
            setIsUsingMockData(false);
            setConnectionStatus('connected');
            setErrorMessage(null);
          }

          if (message.type === 'session_updated' && message.payload?.session) {
            setSession(message.payload.session);
            setIsUsingMockData(false);
            setConnectionStatus('connected');
          }

          if (message.type === 'config_updated' && message.payload?.config) {
            setConfig(message.payload.config);
            setIsUsingMockData(false);
            setConnectionStatus('connected');
          }

          if (message.type === 'connections_updated' && message.payload?.connections) {
            setConnections(message.payload.connections);
            setIsUsingMockData(false);
            setConnectionStatus('connected');
          }
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to parse daemon message.');
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      socket.onclose = () => {
        socketRef.current = null;
        setConnectionStatus(hasConnectedRef.current ? 'connecting' : 'mock');
        scheduleReconnect(() => {
          void refreshFromDaemon();
        });
      };
    },
    [scheduleReconnect],
  );

  useEffect(() => {
    let cancelled = false;

    const refreshFromDaemon = async () => {
      if (cancelled) {
        return;
      }

      setConnectionStatus('connecting');

      try {
        const [sessionResponse, daemonConfigResponse, connectionsResponse] = await Promise.all([
          fetchJson<{ session: CurrentSessionState }>('/session/current'),
          fetchJson<{ config: GuardrailConfig }>('/config'),
          fetchJson<{ connections: ToolConnection[] }>('/connections'),
        ]);

        if (cancelled) {
          return;
        }

        let finalConfig = daemonConfigResponse.config;

        if (user) {
          try {
            const docRef = doc(getFirebaseFirestore(), 'guardrailPreferences', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              finalConfig = docSnap.data() as GuardrailConfig;
              // Sync Firestore config to daemon
              await fetchJson<{ config: GuardrailConfig }>('/config', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalConfig),
              });
            } else {
              // Initialize Firestore with daemon config
              await setDoc(docRef, finalConfig);
            }
          } catch (firestoreError) {
            console.error('Firestore config sync failed:', firestoreError);
          }
        }

        setSession(sessionResponse.session);
        setConfig(finalConfig);
        setConnections(connectionsResponse.connections);
        setIsUsingMockData(false);
        setConnectionStatus('connected');
        setErrorMessage(null);
        hasConnectedRef.current = true;
        openWebSocket(refreshFromDaemon);
      } catch (error) {
        if (cancelled) {
          return;
        }

        let finalConfig = mockGuardrailConfig;

        if (user) {
          try {
            const docRef = doc(getFirebaseFirestore(), 'guardrailPreferences', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              finalConfig = docSnap.data() as GuardrailConfig;
            }
          } catch (firestoreError) {
            console.error('Firestore config sync while daemon offline failed:', firestoreError);
          }
        }

        setErrorMessage(error instanceof Error ? error.message : 'Failed to connect to the daemon.');

        if (!hasConnectedRef.current) {
          setSession(mockSession);
          setConfig(finalConfig);
          setConnections(mockToolConnections);
          setIsUsingMockData(true);
          setConnectionStatus('mock');
        } else {
          setConnectionStatus('connecting');
        }

        scheduleReconnect(() => {
          void refreshFromDaemon();
        });
      }
    };

    void refreshFromDaemon();

    return () => {
      cancelled = true;

      if (reconnectTimerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(reconnectTimerRef.current);
      }

      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [openWebSocket, scheduleReconnect, user]);

  const updateConfig = useCallback(
    async (patch: Partial<GuardrailConfig>) => {
      // Optimistic update
      setConfig((current) => {
        const next = { ...current, ...patch };
        if (user) {
          const docRef = doc(getFirebaseFirestore(), 'guardrailPreferences', user.uid);
          setDoc(docRef, next).catch((err) => {
            console.error('Failed to save to Firestore on update:', err);
          });
        }
        return next;
      });

      try {
        const response = await fetchJson<{ config: GuardrailConfig }>('/config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(patch),
        });

        // Use sanitized daemon response and sync it
        setConfig((current) => {
          const next = { ...current, ...response.config };
          if (user) {
            const docRef = doc(getFirebaseFirestore(), 'guardrailPreferences', user.uid);
            setDoc(docRef, next).catch((err) => {
              console.error('Failed to save sanitized config to Firestore:', err);
            });
          }
          return next;
        });

        setIsUsingMockData(false);
        setConnectionStatus('connected');
        setErrorMessage(null);
        hasConnectedRef.current = true;
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to save daemon config.');

        if (!hasConnectedRef.current) {
          setIsUsingMockData(true);
          setConnectionStatus('mock');
        } else {
          setConnectionStatus('connecting');
        }
      }
    },
    [user],
  );

  const resolveSpiral = useCallback(
    async (filePath: string, decision: 'stop' | 'continue') => {
      if (!session.sessionId || !session.tool) {
        setErrorMessage('No active session is available for spiral intervention.');
        return;
      }

      try {
        const response = await fetchJson<{ session: CurrentSessionState }>('/interventions/spirals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: session.sessionId,
            tool: session.tool,
            filePath,
            decision,
          }),
        });

        setSession(response.session);
        setIsUsingMockData(false);
        setConnectionStatus('connected');
        setErrorMessage(null);
        hasConnectedRef.current = true;
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to resolve spiral intervention.');
      }
    },
    [session.sessionId, session.tool],
  );

  const stopSession = useCallback(async () => {
    if (!session.sessionId || !session.tool || isRequestingStop) {
      setErrorMessage('No active session is available to stop.');
      return;
    }

    setIsRequestingStop(true);
    try {
      const response = await fetchJson<{ session: CurrentSessionState }>('/interventions/session-stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          tool: session.tool,
        }),
      });

      setSession(response.session);
      setIsUsingMockData(false);
      setConnectionStatus('connected');
      setErrorMessage(null);
      hasConnectedRef.current = true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to stop the active session.');
    } finally {
      setIsRequestingStop(false);
    }
  }, [isRequestingStop, session.sessionId, session.tool]);

  const connectTool = useCallback(async (tool: ToolId): Promise<CliToolActionResult> => {
    try {
      const response = await fetchJson<{
        result: CliToolActionResult;
        connections: ToolConnection[];
      }>('/cli/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tool }),
      });

      setConnections(response.connections);
      setIsUsingMockData(false);
      setConnectionStatus('connected');
      setErrorMessage(response.result.success ? null : response.result.message);
      hasConnectedRef.current = true;
      return response.result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run the install command.';
      setErrorMessage(message);
      return {
        success: false,
        tool,
        command: `tokenguard connect ${tool}`,
        message,
        stdout: '',
        stderr: message,
        connection: null,
      };
    }
  }, []);

  const value = useMemo<DaemonContextValue>(
    () => ({
      session,
      config,
      connections,
      connectionStatus,
      isUsingMockData,
      errorMessage,
      updateConfig,
      resolveSpiral,
      stopSession,
      isRequestingStop,
      connectTool,
    }),
    [
      config,
      connectTool,
      connections,
      connectionStatus,
      errorMessage,
      isUsingMockData,
      resolveSpiral,
      session,
      stopSession,
      isRequestingStop,
      updateConfig,
    ],
  );

  return <DaemonContext.Provider value={value}>{children}</DaemonContext.Provider>;
}

export function useDaemonState(): DaemonContextValue {
  const context = useContext(DaemonContext);

  if (!context) {
    throw new Error('useDaemonState must be used inside DaemonProvider.');
  }

  return context;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getDaemonHttpOrigin()}${path}`, init);

  if (!response.ok) {
    throw new Error(`Daemon request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
