import { Module } from '@nestjs/common';
import { AdminUiModule } from '../admin-ui/admin-ui.module';
import { DEMO_PROGRESSION_CONFIG, demoProgressionConfig } from './demo-config';
import { DemoProgression } from './demo-progression';

// Configuration is read once at registration: a bad flag or a missing interval
// stops the API from starting rather than running a half-configured demo.
@Module({
  imports: [AdminUiModule],
  providers: [{provide: DEMO_PROGRESSION_CONFIG, useFactory: () => demoProgressionConfig()}, DemoProgression],
})
export class DemoModule {}
