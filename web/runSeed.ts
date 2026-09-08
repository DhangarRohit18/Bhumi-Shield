import { seedBhumiShieldDemoData } from './src/utils/seedData'
async function run() { console.log('Starting FULL seed...'); try { await seedBhumiShieldDemoData((msg) => console.log('[SEED]', msg)); console.log('SEED COMPLETE'); process.exit(0); } catch (e) { console.error('SEED ERROR:', e); process.exit(1); } } run();
