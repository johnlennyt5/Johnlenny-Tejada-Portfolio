import type { ReactElement } from "react";
import type { DiagramId } from "@/content";
import type { DiagramProps } from "./engine";
import { IlopDiagram } from "./IlopDiagram";
import { PrismShiftDiagram } from "./PrismShiftDiagram";
import { TruckWhatDiagram } from "./TruckWhatDiagram";

export { Diagram } from "./engine";
export type {
  Cell,
  DiagramEdge,
  DiagramGroup,
  DiagramLayout,
  DiagramNode,
  DiagramProps,
  DiagramSpec,
} from "./engine";
export { TruckWhatDiagram, truckWhatSpec } from "./TruckWhatDiagram";
export { PrismShiftDiagram, prismShiftSpec } from "./PrismShiftDiagram";
export { IlopDiagram, ilopSpec } from "./IlopDiagram";

/** Look up a diagram component by a project's `diagram` field. */
export const diagramsById: Record<DiagramId, (props: DiagramProps) => ReactElement> = {
  truckwhat: TruckWhatDiagram,
  prismshift: PrismShiftDiagram,
  ilop: IlopDiagram,
};
