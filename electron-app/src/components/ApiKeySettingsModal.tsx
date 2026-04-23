import { useState, useEffect } from 'react';
import '../styles/api-key-settings.css';

interface ApiKeySettingsModalProps {
  onClose: () => void;
}

type ModelId = 'gpt' | 'gemini' | 'claude';

interface ModelConfig {
  id: ModelId;
  label: string;
  placeholder: string;
}

const MODELS: ModelConfig[] = [
  { id: 'gpt', label: 'GPT (OpenAI)', placeholder: 'sk-...' },
  { id: 'gemini', label: 'Gemini (Google)', placeholder: 'AIza...' },
  { id: 'claude', label: 'Claude (Anthropic)', placeholder: 'sk-ant-...' },
];

interface KeyState {
  value: string;
  verified: boolean;
  locked: boolean;
  message: string;
  messageType: 'success' | 'error' | 'loading' | '';
}

const emptyKeyState = (): KeyState => ({
  value: '',
  verified: false,
  locked: false,
  message: '',
  messageType: '',
});

export default function ApiKeySettingsModal({ onClose }: ApiKeySettingsModalProps) {
  const [keys, setKeys] = useState<Record<ModelId, KeyState>>({
    gpt: emptyKeyState(),
    gemini: emptyKeyState(),
    claude: emptyKeyState(),
  });

  useEffect(() => {
    const loadKeys = async () => {
      const electron = (window as any).electron;
      if (!electron?.getApiKeys) return;
      try {
        const result = await electron.getApiKeys();
        if (result) {
          const newKeys = { ...keys };
          for (const model of MODELS) {
            const data = result[model.id];
            if (data && data.masked) {
              newKeys[model.id] = {
                value: data.masked,
                verified: data.verified || false,
                locked: data.verified || false,
                message: data.verified ? '검증됨' : '',
                messageType: data.verified ? 'success' : '',
              };
            }
          }
          setKeys(newKeys);
        }
      } catch (err) {
        console.error('[ApiKeySettings] Failed to load keys:', err);
      }
    };
    loadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (modelId: ModelId) => {
    const electron = (window as any).electron;
    if (!electron?.verifyApiKey) return;

    const currentValue = keys[modelId].value;
    if (!currentValue.trim()) return;

    setKeys(prev => ({
      ...prev,
      [modelId]: { ...prev[modelId], message: '검증 중...', messageType: 'loading' as const },
    }));

    try {
      const result = await electron.verifyApiKey(modelId, currentValue);
      if (result?.success) {
        setKeys(prev => ({
          ...prev,
          [modelId]: {
            ...prev[modelId],
            verified: true,
            locked: true,
            message: result?.message || '검증됨',
            messageType: 'success' as const,
          },
        }));
      } else {
        setKeys(prev => ({
          ...prev,
          [modelId]: {
            ...prev[modelId],
            verified: false,
            locked: false,
            message: result?.message || '검증 실패',
            messageType: 'error' as const,
          },
        }));
      }
    } catch (err) {
      setKeys(prev => ({
        ...prev,
        [modelId]: {
          ...prev[modelId],
          verified: false,
          locked: false,
          message: err instanceof Error ? err.message : '검증 중 오류 발생',
          messageType: 'error' as const,
        },
      }));
    }
  };

  const handleClear = async (modelId: ModelId) => {
    const electron = (window as any).electron;
    if (electron?.clearApiKey) {
      try {
        await electron.clearApiKey(modelId);
      } catch (err) {
        console.error('[ApiKeySettings] Failed to clear key:', err);
      }
    }
    setKeys(prev => ({
      ...prev,
      [modelId]: emptyKeyState(),
    }));
  };

  const handleInputChange = (modelId: ModelId, value: string) => {
    setKeys(prev => ({
      ...prev,
      [modelId]: { ...prev[modelId], value, message: '', messageType: '' as const },
    }));
  };

  return (
    <div className="api-key-modal-overlay" onClick={onClose}>
      <div className="api-key-modal" onClick={(e) => e.stopPropagation()}>
        <div className="api-key-modal-header">
          <h3>AI API 키 설정</h3>
          <button type="button" className="api-key-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {MODELS.map((model) => {
          const keyState = keys[model.id];
          return (
            <div key={model.id} className="api-key-section">
              <div className="api-key-label">{model.label}</div>
              <div className="api-key-input-row">
                <input
                  type={keyState.locked ? 'password' : 'text'}
                  className={`api-key-input${keyState.verified ? ' verified' : ''}`}
                  placeholder={model.placeholder}
                  value={keyState.value}
                  disabled={keyState.locked}
                  onChange={(e) => handleInputChange(model.id, e.target.value)}
                />
                <button
                  type="button"
                  className="api-key-btn verify"
                  disabled={keyState.locked || keyState.messageType === 'loading' || !keyState.value.trim()}
                  onClick={() => handleVerify(model.id)}
                >
                  {keyState.messageType === 'loading' ? '검증 중...' : '검증하기'}
                </button>
                <button
                  type="button"
                  className="api-key-btn clear"
                  onClick={() => handleClear(model.id)}
                >
                  비우기
                </button>
              </div>
              <div className={`api-key-message ${keyState.messageType}`}>
                {keyState.message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
