export const DEMO_PROGRESSION_CONFIG = Symbol('DEMO_PROGRESSION_CONFIG');
export type DemoProgressionConfig = {
  // null means this step is disabled, not a zero-delay action.
  assignDelayMs: number | null;
  draftStartDelayMs: number | null;
  draftDoneDelayMs: number | null;
  dispatchDelayMs: number | null;
  shipmentStepMs: number | null;
  deliveryConfirmDelayMs: number | null;
};

/** §2.12: the master switch keeps its dev-only guard. Each action is opt-in,
 * except courier milestones. Disabled actions need no interval or credentials. */
export function demoProgressionConfig(env: NodeJS.ProcessEnv = process.env): DemoProgressionConfig | null {
  const local = env.ENVIRONMENT === 'dev' && env.NODE_ENV === 'development';
  const flag = env.DEMO_PROGRESSION ?? (local ? 'on' : 'off');
  if (flag === 'off') return null;
  if (flag !== 'on') throw new Error('DEMO_PROGRESSION must be on or off');
  if (env.ENVIRONMENT !== 'dev' || env.NODE_ENV === 'production')
    throw new Error('DEMO_PROGRESSION=on is only permitted with ENVIRONMENT=dev outside production');
  const ms = (name: string) => {
    const raw = env[name];
    const value = Number(raw);
    if (!raw || !Number.isInteger(value) || value < 0)
      throw new Error(`DEMO_PROGRESSION=on requires ${name} as a whole number of milliseconds`);
    return value;
  };
  const step = (name: string, interval: string, defaultOn = false) => {
    const value = env[name] ?? (defaultOn ? 'on' : 'off');
    if (value !== 'on' && value !== 'off') throw new Error(`${name} must be on or off`);
    return value === 'on' ? ms(interval) : null;
  };
  const config = {
    assignDelayMs: step('DEMO_ASSIGNMENT', 'DEMO_ASSIGN_DELAY_MS'),
    draftStartDelayMs: step('DEMO_DRAFT_START', 'DEMO_DRAFT_START_DELAY_MS'),
    draftDoneDelayMs: step('DEMO_DRAFT_SUBMIT', 'DEMO_DRAFT_DONE_DELAY_MS'),
    dispatchDelayMs: step('DEMO_DISPATCH', 'DEMO_DISPATCH_DELAY_MS'),
    shipmentStepMs: step('DEMO_SHIPMENT_MILESTONES', 'DEMO_SHIPMENT_STEP_MS', true),
    deliveryConfirmDelayMs: step('DEMO_DELIVERY_CONFIRMATION', 'DEMO_SHIPMENT_STEP_MS'),
  };
  if (config.deliveryConfirmDelayMs !== null && (env.ADMIN_UI_MODE ?? 'simulated') !== 'simulated')
    throw new Error('DEMO_DELIVERY_CONFIRMATION=on requires ADMIN_UI_MODE=simulated');
  return Object.values(config).every(value => value === null) ? null : config;
}
