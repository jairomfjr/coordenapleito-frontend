'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/lib/apiError';
import { getWsApiBaseURL } from '@/lib/apiBaseUrl';
import { getAccessToken } from '@/lib/auth/accessToken';
import { inicioService } from '@/services/inicio';
import type { CoordenadorVinculoResumoModel } from '@/types/api';

const WS_PATH = '/ws/coordenadores-vinculos';
const FALLBACK_HTTP_MS = 10000;

export function useCoordenadorVinculosLive() {
  const [data, setData] = useState<CoordenadorVinculoResumoModel | null>(null);
  const [erro, setErro] = useState('');
  const [atualizado, setAtualizado] = useState<Date | null>(null);
  const [aoVivo, setAoVivo] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  const aplicar = useCallback((resumo: CoordenadorVinculoResumoModel) => {
    setData(resumo);
    setAtualizado(new Date());
    setErro('');
  }, []);

  const carregarHttp = useCallback(async () => {
    try {
      const res = await inicioService.graficosCoordenadores();
      aplicar(res.data);
    } catch (err) {
      if (!dataRef.current) {
        setErro(getApiErrorMessage(err));
      }
    }
  }, [aplicar]);

  useEffect(() => {
    void carregarHttp();

    const token = getAccessToken();
    if (!token) {
      console.warn('[graficos-ws] sem token na sessão; usando só HTTP');
      return;
    }

    let ws: WebSocket | null = null;
    let encerrado = false;
    let tentativas = 0;
    let timer = 0;

    const conectar = () => {
      if (encerrado) {
        return;
      }
      const url = `${getWsApiBaseURL()}${WS_PATH}?access_token=${encodeURIComponent(token)}`;
      console.info('[graficos-ws] conectando', url.replace(token, '…'));
      ws = new WebSocket(url);
      ws.onopen = () => {
        tentativas = 0;
        setAoVivo(true);
        console.info('[graficos-ws] aberto');
      };
      ws.onmessage = (evento) => {
        try {
          aplicar(JSON.parse(evento.data) as CoordenadorVinculoResumoModel);
        } catch (e) {
          console.warn('[graficos-ws] payload inválido', e);
        }
      };
      ws.onclose = (evento) => {
        setAoVivo(false);
        console.warn('[graficos-ws] fechado', evento.code, evento.reason || '');
        if (encerrado) {
          return;
        }
        tentativas += 1;
        const espera = Math.min(12000, 800 * 2 ** Math.min(tentativas, 4));
        timer = window.setTimeout(conectar, espera);
      };
    };

    conectar();
    return () => {
      encerrado = true;
      window.clearTimeout(timer);
      ws?.close();
    };
  }, [aplicar, carregarHttp]);

  useEffect(() => {
    if (aoVivo) {
      return;
    }
    const id = window.setInterval(() => void carregarHttp(), FALLBACK_HTTP_MS);
    return () => window.clearInterval(id);
  }, [aoVivo, carregarHttp]);

  return { data, erro, atualizado, aoVivo };
}
