'use client';

/**
 * Substitui o MapContainer do react-leaflet: o original usa `context === null` dentro de
 * useCallback([]), então o closure nunca vê o contexto atualizado e pode chamar
 * `new L.Map(node)` mais de uma vez no mesmo elemento ("Map container is already initialized").
 * Aqui usamos useRef para garantir no máximo uma inicialização por nó.
 *
 * O cleanup do mapa usa useLayoutEffect (não useEffect): com useEffect o remove() pode
 * rodar depois do ref do próximo mount no mesmo nó (React reutiliza o div), e o Leaflet
 * ainda enxerga `_leaflet_id` no container.
 */
import { LeafletProvider, createLeafletContext } from '@react-leaflet/core';
import { Map as LeafletMap } from 'leaflet';
import React, { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import type { MapContainerProps } from 'react-leaflet';

/** Rastreia instâncias criadas por este módulo para remover órfãos antes de novo L.map. */
const mapByContainer = new WeakMap<HTMLElement, LeafletMap>();

function removeMapIfTracked(container: HTMLElement): void {
  const existing = mapByContainer.get(container);
  if (!existing) return;
  try {
    existing.remove();
  } catch {
    /* ignore: já removido ou estado inconsistente */
  }
  mapByContainer.delete(container);
}

export const SafeMapContainer = forwardRef(function SafeMapContainer(
  {
    bounds,
    boundsOptions,
    center,
    children,
    className,
    id,
    placeholder,
    style,
    whenReady,
    zoom,
    ...options
  }: MapContainerProps,
  forwardedRef: React.ForwardedRef<LeafletMap | null>
) {
    const [props] = useState(() => ({ className, id, style }));
    const [context, setContext] = useState<ReturnType<typeof createLeafletContext> | null>(null);
    const initRef = useRef(false);

    useImperativeHandle<LeafletMap | null, LeafletMap | null>(
      forwardedRef,
      () => context?.map ?? null,
      [context]
    );

    const mapRef = useCallback(
      (node: HTMLDivElement | null) => {
        if (node !== null && !initRef.current) {
          const el = node as HTMLElement & { _leaflet_id?: number };
          if (el._leaflet_id) {
            removeMapIfTracked(el);
          }
          let map: LeafletMap;
          try {
            map = new LeafletMap(node, options);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('already initialized')) {
              removeMapIfTracked(el);
              if (el._leaflet_id) {
                delete el._leaflet_id;
              }
              map = new LeafletMap(node, options);
            } else {
              throw err;
            }
          }
          initRef.current = true;
          mapByContainer.set(el, map);
          if (center != null && zoom != null) {
            map.setView(center, zoom);
          } else if (bounds != null) {
            map.fitBounds(bounds, boundsOptions);
          }
          if (whenReady != null) {
            map.whenReady(whenReady);
          }
          setContext(createLeafletContext(map));
        }
        if (node === null) {
          initRef.current = false;
        }
      },
      // Espelha react-leaflet: opções da 1ª montagem apenas (evita recriar o mapa).
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    useLayoutEffect(() => {
      return () => {
        if (!context?.map) return;
        const container = context.map.getContainer() as HTMLElement;
        try {
          context.map.remove();
        } catch {
          /* ignore */
        }
        mapByContainer.delete(container);
      };
    }, [context]);

    const contents = context ? (
      <LeafletProvider value={context}>{children}</LeafletProvider>
    ) : (
      placeholder ?? null
    );

    return (
      <div {...props} ref={mapRef}>
        {contents}
      </div>
    );
});

SafeMapContainer.displayName = 'SafeMapContainer';
