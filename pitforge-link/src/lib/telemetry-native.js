/**
 * Native shared-memory reader hook.
 * On Windows builds, replace this with full rF2 SMMP parsing
 * or bundle a native Node addon compiled against Plugin.hpp layouts.
 */
const { createMockTelemetry } = require("./telemetry-mock");

function read() {
  return createMockTelemetry();
}

module.exports = { read };
