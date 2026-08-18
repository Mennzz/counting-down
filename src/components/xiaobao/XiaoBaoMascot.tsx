export type XiaoBaoMascotState =
  | "idle"
  | "hello"
  | "thinking"
  | "love"
  | "success"
  | "concerned"
  | "sleep";

const ASSET_ROOT = "/xiaobao/actual";

const STATIC_MASCOT_ASSETS: Record<XiaoBaoMascotState, string> = {
  idle: `${ASSET_ROOT}/directional/xiaobao-front.png`,
  hello: `${ASSET_ROOT}/expressions/xiaobao-happy.png`,
  thinking: `${ASSET_ROOT}/expressions/xiaobao-curious.png`,
  love: `${ASSET_ROOT}/expressions/xiaobao-love.png`,
  success: `${ASSET_ROOT}/expressions/xiaobao-excited.png`,
  concerned: `${ASSET_ROOT}/expressions/xiaobao-sad.png`,
  sleep: `${ASSET_ROOT}/expressions/xiaobao-sleepy.png`,
};

const SPRITE_STRIP_ASSETS: Partial<Record<XiaoBaoMascotState, string>> = {
  idle: `${ASSET_ROOT}/animations/idle-sprite-strip.png`,
  hello: `${ASSET_ROOT}/animations/jump-sprite-strip.png`,
  success: `${ASSET_ROOT}/animations/jump-sprite-strip.png`,
  sleep: `${ASSET_ROOT}/animations/sleep-sprite-strip.png`,
};

export function XiaoBaoMascot({
  state,
  size = 48,
  animated = true,
  decorative = true,
  label = `Xiao Bao is ${state}`,
  variant = "compact",
  className = "",
}: {
  state: XiaoBaoMascotState;
  size?: number;
  animated?: boolean;
  decorative?: boolean;
  label?: string;
  variant?: "compact" | "hero";
  className?: string;
}) {
  const staticAsset = state === "idle" && variant === "hero"
    ? `${ASSET_ROOT}/hero/xiaobao-hero.png`
    : STATIC_MASCOT_ASSETS[state];
  const spriteStrip = state === "idle" && variant === "hero"
    ? undefined
    : SPRITE_STRIP_ASSETS[state];
  const usesImageMotion = animated && !spriteStrip;

  return (
    <span
      className={`xiaobao-mascot ${animated ? "xiaobao-mascot--animated" : ""} ${className}`}
      style={{ width: size, height: size }}
      data-state={state}
      data-animated={animated ? "true" : "false"}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
    >
      <img
        className="xiaobao-mascot-static-source"
        src={staticAsset}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      {animated && spriteStrip && (
        <span
          className="xiaobao-mascot-animated-source xiaobao-mascot-sprite-source"
          style={{ backgroundImage: `url("${spriteStrip}")` }}
          aria-hidden="true"
        />
      )}
      {usesImageMotion && (
        <img
          className="xiaobao-mascot-animated-source xiaobao-mascot-motion-source"
          src={staticAsset}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      )}
    </span>
  );
}
