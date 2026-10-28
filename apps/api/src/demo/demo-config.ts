export const DEMO_PROGRESSION_CONFIG = Symbol('DEMO_PROGRESSION_CONFIG');
export type DemoProgressionConfig = {
  assignDelayMs: number;
  draftStartDelayMs: number;
  draftDoneDelayMs: number;
  shipmentStepMs: number;
};

/** §2.12: on by default locally, off everywhere else. The intervals are env values
 * so a demo can be slowed down or sped up without a code change; none is assumed. */
export function demoProgressionConfig(env: NodeJS.ProcessEnv = process.env): DemoProgressionConfig | null {
  const local = env.ENVIRONMENT === 'dev' && env.NODE_ENV === 'development';
  const flag = env.DEMO_PROGRESSION ?? (local ? 'on' : 'off');
  if (flag === 'off') return null;
  if (flag !== 'on') throw new Error('DEMO_PROGRESSION must be on or off');
  if (env.ENVIRONMENT !== 'dev' || env.NODE_ENV === 'production')
    throw new Error('DEMO_PROGRESSION=on is only permitted with ENVIRONMENT=dev outside production');
  // The last step is the admin's delivery confirmation, which only the simulated admin UI performs.
  if ((env.ADMIN_UI_MODE ?? 'simulated') !== 'simulated')
    throw new Error('DEMO_PROGRESSION=on requires ADMIN_UI_MODE=simulated');
  const ms = (name: string) => {
    const raw = env[name];
    const value = Number(raw);
    if (!raw || !Number.isInteger(value) || value < 0)
      throw new Error(`DEMO_PROGRESSION=on requires ${name} as a whole number of milliseconds`);
    return value;
  };
  return {
    assignDelayMs: ms('DEMO_ASSIGN_DELAY_MS'),
    draftStartDelayMs: ms('DEMO_DRAFT_START_DELAY_MS'),
    draftDoneDelayMs: ms('DEMO_DRAFT_DONE_DELAY_MS'),
    shipmentStepMs: ms('DEMO_SHIPMENT_STEP_MS'),
  };
}
