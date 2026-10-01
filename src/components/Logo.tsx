import { logoPaths, type LogoName } from "./logo-paths";

export function Logo({ name, size = 24 }: { name: LogoName; size?: number }) {
  const { viewBox, paths } = logoPaths[name];
  return (
    <svg viewBox={viewBox} width={size} height={size} fill="currentColor" aria-hidden="true">
      {paths.map((d) => (
        <path key={d.slice(0, 24)} d={d} fillRule="evenodd" />
      ))}
    </svg>
  );
}
