// Temporary shim to align react-leaflet props with React 19 + TS bundler resolution.
// Remove this file once upstream types fully align with your stack.
declare module 'react-leaflet' {
  import type { ComponentType, ReactNode, CSSProperties } from 'react';

  export interface MapContainerProps {
    center?: [number, number] | [number, number, number];
    zoom?: number;
    style?: CSSProperties;
    children?: ReactNode;
  }
  export const MapContainer: ComponentType<MapContainerProps>;

  export interface TileLayerProps {
    url: string;
    attribution?: string;
    children?: ReactNode;
  }
  export const TileLayer: ComponentType<TileLayerProps>;

  export interface MarkerProps {
    position: [number, number];
    children?: ReactNode;
  }
  export const Marker: ComponentType<MarkerProps>;

  export interface PopupProps {
    children?: ReactNode;
  }
  export const Popup: ComponentType<PopupProps>;

  // Hook: map instance accessor (runtime provided by react-leaflet)
  export function useMap(): any;
}