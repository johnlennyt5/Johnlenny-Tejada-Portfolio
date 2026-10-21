/**
 * Shared components. Versions import from "@/components/shared" and style them
 * through className props and CSS variables; they never edit these files.
 */
export { Monogram } from "./Monogram";
export type { MonogramProps, MonogramVariant } from "./Monogram";
export { MonogramStatic } from "./MonogramStatic";
export type { MonogramStaticProps } from "./MonogramStatic";
export { VersionSwitcher } from "./VersionSwitcher";
export type { VersionSwitcherProps } from "./VersionSwitcher";
export { CopyEmail } from "./CopyEmail";
export type { CopyEmailProps } from "./CopyEmail";
export { MotionProvider, MotionToggle, useMotionPreference, MOTION_STORAGE_KEY } from "./MotionToggle";
export type { MotionPref, MotionToggleProps } from "./MotionToggle";
export { MotionFeatures } from "./MotionFeatures";
export { SkipLink } from "./SkipLink";
export type { SkipLinkProps } from "./SkipLink";
export { ResumeButton } from "./ResumeButton";
export type { ResumeButtonProps } from "./ResumeButton";
export { JsonLd } from "./JsonLd";
export {
  Diagram,
  TruckWhatDiagram,
  PrismShiftDiagram,
  IlopDiagram,
  diagramsById,
  truckWhatSpec,
  prismShiftSpec,
  ilopSpec,
} from "./diagrams";
export type { DiagramProps, DiagramSpec } from "./diagrams";
