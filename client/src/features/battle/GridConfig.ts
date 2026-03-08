/**
 * VYRU5 Grid Configuration
 * Centralized grid size settings
 */

// Current active grid size - full screen
export const GRID_WIDTH = 64;
export const GRID_HEIGHT = 40;
export const GRID_TOTAL_CELLS = GRID_WIDTH * GRID_HEIGHT; // 2560 cells

// Alternative grid sizes (for future configuration)
export const GRID_PRESETS = {
  TINY: { width: 16, height: 10, cells: 160 },      // 5-second battles
  SMALL: { width: 32, height: 20, cells: 640 },     // 10-20 second battles
  MEDIUM: { width: 48, height: 30, cells: 1440 },   // 30-60 second battles
  LARGE: { width: 75, height: 40, cells: 3000 },    // Current (1-2 minute battles)
  HUGE: { width: 96, height: 54, cells: 5184 },     // Epic battles
};

// Starting positions for 4-player battles (corners)
export function getStartingPositions(width: number, height: number) {
  return {
    virus1: { x: 2, y: 2 },                          // Top-left
    virus2: { x: width - 3, y: 2 },                  // Top-right
    virus3: { x: 2, y: height - 3 },                 // Bottom-left
    virus4: { x: width - 3, y: height - 3 },         // Bottom-right
  };
}

// Win condition (percentage of territory needed)
export const WIN_THRESHOLD_PERCENT = 90; // 90% = victory

// Virus colors for UI consistency
export const VIRUS_COLORS = {
  1: 0xff0066,  // HOT PINK
  2: 0x00ffff,  // CYAN
  3: 0xcc00ff,  // PURPLE
  4: 0xffaa00,  // ORANGE
};

// Battle timing
export const TICK_RATE_MS = 500;  // Base tick rate (before speed multiplier)
