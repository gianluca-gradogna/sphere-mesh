import { getGPUTier } from 'detect-gpu';

// Tier list -> tier: 1 (>= 15 fps), tier: 2 (>= 30 fps), tier: 3 (>= 60 fps)
const tier = getGPUTier();

const settings = {
    tier,
    debugger: true,
    fxaa: true,
};

console.log(`⚙️ settings`, settings);

export default settings;